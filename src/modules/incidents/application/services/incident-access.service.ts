import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaClient, DispatchStatus } from '@prisma/client';
import { Incident } from '../../domain/entities/incident.entity';

type AppRole = 'ADMIN' | 'POLICE' | 'CITIZEN';

@Injectable()
export class IncidentAccessService {
  constructor(private readonly prisma: PrismaClient) {}

  async authorizeClose(params: {
    userId: string;
    roles: AppRole[];
    incident: Incident;
    newStatus: 'RESOLVED' | 'CANCELED';
  }) {
    const { userId, roles, incident, newStatus } = params;

    if (incident.status === 'RESOLVED' || incident.status === 'CANCELED') {
      throw new BadRequestException('Incident already closed');
    }

    const isAdmin = roles.includes('ADMIN');
    const isPolice = roles.includes('POLICE');
    const isCitizen = roles.includes('CITIZEN');

    if (isAdmin) return;

    if (isPolice) {
      const d = await this.prisma.dispatch.findFirst({
        where: {
          incidentId: incident.id,
          unitId: userId, // unitId == userId (POLICE)
          status: {
            in: [DispatchStatus.PENDING, DispatchStatus.NOTIFIED, DispatchStatus.ACCEPTED],
          },
        },
      });
      if (!d) throw new ForbiddenException('No active dispatch for this unit');
      // polícia pode concluir (RESOLVED) ou cancelar (CANCELED) quando for o atendente
      return;
    }

    if (isCitizen) {
      // cidadão só pode cancelar o próprio incidente em fase inicial
      if (incident.citizenId && incident.citizenId !== userId) {
        throw new ForbiddenException('Not the owner of this incident');
      }
      if (newStatus !== 'CANCELED') {
        throw new ForbiddenException('Citizen can only cancel');
      }
      return;
    }

    throw new ForbiddenException('Not allowed');
  }
}

import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaClient, DispatchStatus, Incident, IncidentStatus } from '@prisma/client';
import { AppRole, CurrentUser, VoiceMode } from '../types/type';

@Injectable()
export class VoiceAccessService {
  constructor(private prisma: PrismaClient) {}

  public getRole(roles: AppRole[]): AppRole {
    if (roles.includes('ADMIN')) return 'ADMIN';
    if (roles.includes('POLICE')) return 'POLICE';
    return 'CITIZEN';
  }

  private defaultMode(role: AppRole): VoiceMode {
    if (role === 'ADMIN') return 'FULL';
    if (role === 'POLICE') return 'PTT';
    return 'LISTEN';
  }

  async authorize(
    user: CurrentUser,
    incident: Incident,
  ): Promise<{ role: AppRole; defaultMode: VoiceMode }> {
    const allowed = new Set<IncidentStatus>([IncidentStatus.OPEN, IncidentStatus.IN_DISPATCH]);
    if (!allowed.has(incident.status)) throw new ForbiddenException('Incident not joinable');

    const role = this.getRole(user.roles);

    if (role === 'POLICE') {
      const ok = await this.prisma.dispatch.findFirst({
        where: {
          incidentId: incident.id,
          unitId: user.sub,
          status: {
            in: [DispatchStatus.PENDING, DispatchStatus.NOTIFIED, DispatchStatus.ACCEPTED],
          },
        },
      });
      if (!ok) throw new ForbiddenException('No active dispatch for this unit');
    } else if (role === 'CITIZEN') {
      if (incident.citizenId && incident.citizenId !== user.sub) {
        throw new ForbiddenException('Not the owner of this incident');
      }
    }

    return { role, defaultMode: this.defaultMode(role) };
  }

  async authorizeById(user: CurrentUser, incidentId: string) {
    const incident = await this.prisma.incident.findUnique({ where: { id: incidentId } });
    if (!incident) throw new BadRequestException('Incident not found');
    const { role, defaultMode } = await this.authorize(user, incident);
    return { incident, role, defaultMode };
  }
}

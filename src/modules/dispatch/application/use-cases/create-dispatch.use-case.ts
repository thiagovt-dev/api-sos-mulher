import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { IncidentsGateway } from '../../../incidents/infra/incidents.gateway';
import { Queue } from 'bullmq';
import { PrismaDispatchRepository } from '../../infra/repositories/prisma-dispatch.repository';
import { PUSH_QUEUE } from '@/infra/queue/tokens';
import { RedlockService } from '@/shared/locks/redlock.service';
import { PrismaDeviceRepository } from '@/modules/devices/infra/prisma-device.repository';

@Injectable()
export class CreateDispatchUseCase {
  constructor(
    private readonly repo: PrismaDispatchRepository,
    private readonly lock: RedlockService,
    private readonly prisma: PrismaClient,
    private readonly gateway: IncidentsGateway,
    @Inject(PUSH_QUEUE) private readonly pushQueue: Queue,
    private readonly devices: PrismaDeviceRepository,
  ) {}

  async execute(input: { incidentId: string; unitId: string }) {
    const incident = await this.prisma.incident.findUnique({ where: { id: input.incidentId } });
    if (!incident) throw new BadRequestException('Incident not found');

    const unit = await this.prisma.unit.findUnique({ where: { id: input.unitId } });
    if (!unit || unit.active === false) throw new BadRequestException('Unit not available');

    return this.lock.withLock(`dispatch:${input.incidentId}:${input.unitId}`, 4000, async () => {
      const created = await this.repo.assign(input.incidentId, input.unitId);

      await this.prisma.incidentEvent.create({
        data: {
          incidentId: input.incidentId,
          type: 'DISPATCH_CREATED',
          payload: { unitId: input.unitId },
        },
      });

      const freshIncident = await this.prisma.incident.findUnique({
        where: { id: input.incidentId },
        include: { dispatches: true },
      });
      this.gateway.emitUpdated(freshIncident);

      if (unit.fcmToken) {
        await this.pushQueue.add('notify-dispatch', {
          token: unit.fcmToken,
          data: { type: 'INCIDENT_DISPATCH', incidentId: input.incidentId },
          notification: {
            title: `Novo incidente ${incident.code}`,
            body: 'Você foi designado para atendimento.',
          },
        });
        await this.repo.markNotified(created.id);
      }

      return created;
    });
  }
}

import { Injectable, BadRequestException } from '@nestjs/common';

import { PrismaClient } from '@prisma/client';
import { PrismaDispatchRepository } from '../../infra/repositories/prisma-dispatch.repository';
import { RedlockService } from '@/shared/locks/redlock.service';

@Injectable()
export class CreateDispatchUseCase {
  constructor(
    private readonly repo: PrismaDispatchRepository,
    private readonly lock: RedlockService,
    private readonly prisma: PrismaClient,
  ) {}

  async execute(input: { incidentId: string; unitId: string }) {
    const exists = await this.prisma.incident.findUnique({ where: { id: input.incidentId } });
    if (!exists) throw new BadRequestException('Incident not found');

    const unit = await this.prisma.unit.findUnique({ where: { id: input.unitId } });
    if (!unit || !unit.active) throw new BadRequestException('Unit not available');

    return this.lock.withLock(`dispatch:${input.incidentId}:${input.unitId}`, 4000, async () => {
      const created = await this.repo.assign(input.incidentId, input.unitId);

      await this.prisma.incidentEvent.create({
        data: {
          incidentId: input.incidentId,
          type: 'DISPATCH_CREATED',
          payload: { unitId: input.unitId },
        },
      });

      return created;
    });
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaClient, IncidentStatus } from '@prisma/client';

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

@Injectable()
export class RetentionJobService {
  private readonly log = new Logger(RetentionJobService.name);
  private readonly locDays = Number(process.env.LOCATION_RETENTION_DAYS ?? 2);
  private readonly evtDays = Number(process.env.EVENT_RETENTION_DAYS ?? 7);
  private readonly incAnonDays = Number(process.env.INCIDENT_ANONYMIZE_AFTER_DAYS ?? 30);

  constructor(private readonly prisma: PrismaClient) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async run() {
    if (process.env.NODE_ENV === 'test') return;
    const locBefore = daysAgo(this.locDays);
    const evtBefore = daysAgo(this.evtDays);
    const incBefore = daysAgo(this.incAnonDays);

    // 1) LocationSample antigos
    const delLoc = await this.prisma.locationSample.deleteMany({
      where: { recordedAt: { lt: locBefore } },
    });

    // 2) IncidentEvent antigos
    const delEvt = await this.prisma.incidentEvent.deleteMany({
      where: { createdAt: { lt: evtBefore } },
    });

    // 3) Anonimizar incidentes fechados
    const anonInc = await this.prisma.incident.updateMany({
      where: {
        status: { in: [IncidentStatus.RESOLVED, IncidentStatus.CANCELED] },
        updatedAt: { lt: incBefore },
      },
      data: {
        address: null,
        description: null,
        audioRoomId: null,
      },
    });

    this.log.log(
      `Retention done: LocationSample=${delLoc.count}, IncidentEvent=${delEvt.count}, IncidentsAnon=${anonInc.count}`,
    );
  }
}

import { Injectable } from '@nestjs/common';
import { CurrentUser } from '../types/type';
import { VoiceAccessService } from '../services/voice-access.service';
import { IdentityService } from '../services/identity.service';
import { IncidentEventLogger } from '../services/incident-event-logger.service';

type LeaveInput = { incidentId: string; name?: string };

@Injectable()
export class LeaveIncidentRoomUseCase {
  constructor(
    private readonly access: VoiceAccessService,
    private readonly ids: IdentityService,
    private readonly events: IncidentEventLogger,
  ) {}

  async execute(user: CurrentUser, input: LeaveInput) {
    const { incident, role } = await this.access.authorizeById(user, input.incidentId);

    const { identity } = this.ids.make(role, user.sub, input.name);
    await this.events.voiceLeft(incident.id, identity, role);

    return { ok: true };
  }
}

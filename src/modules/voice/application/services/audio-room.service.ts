import { Injectable } from '@nestjs/common';
import { Incident, PrismaClient } from '@prisma/client';

@Injectable()
export class AudioRoomService {
  constructor(private prisma: PrismaClient) {}

  async ensureRoom(incident: Pick<Incident, 'id' | 'audioRoomId' | 'code'>): Promise<string> {
    if (incident.audioRoomId) return incident.audioRoomId;
    const roomName = `inc_${incident.code ?? incident.id}`;
    await this.prisma.incident.update({
      where: { id: incident.id },
      data: { audioRoomId: roomName },
    });
    return roomName;
  }
}

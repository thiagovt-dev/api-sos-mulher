import { Injectable } from '@nestjs/common';
import { AccessToken, VideoGrant } from 'livekit-server-sdk';
import { LivekitAuthPort, MintTokenInput } from '../domain/livekit-auth.port';

@Injectable()
export class LivekitAuthAdapter implements LivekitAuthPort {
  private readonly url = process.env.LIVEKIT_URL!;
  private readonly apiKey = process.env.LIVEKIT_API_KEY!;
  private readonly apiSecret = process.env.LIVEKIT_API_SECRET!;

  getUrl() {
    return this.url;
  }

  async mintToken(input: MintTokenInput): Promise<string> {
    const ttl = Number(process.env.LIVEKIT_TOKEN_TTL ?? 3600);
    const grant: VideoGrant = {
      roomJoin: true,
      room: input.roomName,
      canPublish: input.canPublishAudio,
      canSubscribe: input.canSubscribe,
      canPublishData: true,
    };

    const at = new AccessToken(this.apiKey, this.apiSecret, {
      identity: input.identity,
      name: input.name,
      ttl,
      metadata: input.metadata ? JSON.stringify(input.metadata) : undefined,
    });
    at.addGrant(grant);
    return await at.toJwt();
  }
}

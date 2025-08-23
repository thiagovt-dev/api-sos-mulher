export type VoiceMode = 'PTT' | 'FULL' | 'LISTEN';

export interface MintTokenInput {
  roomName: string;
  identity: string;
  name?: string;
  canPublishAudio: boolean;
  canSubscribe: boolean;
  ttl?: number; // seconds
  metadata?: Record<string, any>;
}

// Use abstract class to act as Nest provider token at runtime
export abstract class LivekitAuthPort {
  abstract mintToken(input: MintTokenInput): Promise<string>;
  abstract getUrl(): string;
}

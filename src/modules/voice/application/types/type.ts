export type VoiceMode = 'PTT' | 'FULL' | 'LISTEN';
export type AppRole = 'ADMIN' | 'POLICE' | 'CITIZEN';

export type CurrentUser = {
  sub: string;
  roles: AppRole[];
};

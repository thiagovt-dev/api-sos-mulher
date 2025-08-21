export type DispatchStatus = 'PENDING' | 'NOTIFIED' | 'ACCEPTED' | 'REJECTED' | 'CANCELED';

export interface DispatchProps {
  id: string;
  incidentId: string;
  unitId: string;
  status: DispatchStatus;
  notifiedAt?: Date | null;
  acceptedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Dispatch {
  id: string;
  incidentId: string;
  unitId: string;
  status: DispatchStatus;
  notifiedAt?: Date | null;
  acceptedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: DispatchProps) {
    Object.assign(this, props);
  }
}

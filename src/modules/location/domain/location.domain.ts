export type LocationSource = 'MOBILE' | 'WEB';
export type AppRole = 'ADMIN' | 'POLICE' | 'CITIZEN';

export class GeoPoint {
  readonly lat: number;
  readonly lng: number;

  constructor(lat: number, lng: number) {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      throw new Error('Invalid coordinates');
    }
    if (lat < -90 || lat > 90) throw new Error('lat out of range');
    if (lng < -180 || lng > 180) throw new Error('lng out of range');
    // normaliza em 6 casas (consistente com @db.Decimal(9,6))
    this.lat = Math.round(lat * 1e6) / 1e6;
    this.lng = Math.round(lng * 1e6) / 1e6;
  }
}

export interface LocationSampleProps {
  userId: string;
  unitId?: string;
  incidentId?: string;
  point: GeoPoint;
  accuracy?: number; // m
  speed?: number; // m/s
  heading?: number; // 0..360
  source: LocationSource;
  recordedAt: Date;
}

export class LocationSample {
  private constructor(private readonly props: LocationSampleProps) {}

  static create(input: {
    userId: string;
    point: GeoPoint;
    source?: LocationSource;
    recordedAt?: Date;
    unitId?: string;
    incidentId?: string;
    accuracy?: number;
    speed?: number;
    heading?: number;
  }) {
    const recordedAt = input.recordedAt ?? new Date();
    const source = input.source ?? 'MOBILE';

    if (input.heading !== undefined) {
      if (!Number.isFinite(input.heading) || input.heading < 0 || input.heading > 360) {
        throw new Error('heading out of range');
      }
    }
    if (input.accuracy !== undefined && input.accuracy < 0) {
      throw new Error('accuracy < 0');
    }
    if (input.speed !== undefined && input.speed < 0) {
      throw new Error('speed < 0');
    }

    return new LocationSample({
      userId: input.userId,
      unitId: input.unitId,
      incidentId: input.incidentId,
      point: input.point,
      accuracy: input.accuracy,
      speed: input.speed,
      heading: input.heading,
      source,
      recordedAt,
    });
  }

  // getters para o adapter
  get userId() {
    return this.props.userId;
  }
  get unitId() {
    return this.props.unitId;
  }
  get incidentId() {
    return this.props.incidentId;
  }
  get lat() {
    return this.props.point.lat;
  }
  get lng() {
    return this.props.point.lng;
  }
  get accuracy() {
    return this.props.accuracy;
  }
  get speed() {
    return this.props.speed;
  }
  get heading() {
    return this.props.heading;
  }
  get source() {
    return this.props.source;
  }
  get recordedAt() {
    return this.props.recordedAt;
  }
}

export function deriveUnitId(userId: string, roles: AppRole[]): string | undefined {
  return roles.includes('POLICE') ? userId : undefined;
}

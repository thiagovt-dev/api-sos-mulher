export class Citizen {
  constructor(
    readonly userId: string,
    readonly name: string | null,
    readonly phone: string | null,
    readonly street: string | null,
    readonly number: string | null,
    readonly district: string | null,
    readonly city: string | null,
    readonly state: string | null,
    readonly zip: string | null,
    readonly lat: number | null,
    readonly lng: number | null,
    readonly createdAt: Date,
  ) {}
}
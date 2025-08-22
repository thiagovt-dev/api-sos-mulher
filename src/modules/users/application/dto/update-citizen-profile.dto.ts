export class UpdateCitizenProfileDto {
  phone!: string;

  street?: string;
  number?: string;
  district?: string;
  city?: string;
  state?: string;
  zip?: string;

  lat?: number;
  lng?: number;
}

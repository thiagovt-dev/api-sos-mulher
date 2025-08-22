export class CreateCitizenDto {
  email!: string; 
  password!: string;
  name?: string; 

  phone?: string;
  street?: string;
  number?: string;
  district?: string;
  city?: string;
  state?: string;
  zip?: string;
  lat?: number;
  lng?: number;
}

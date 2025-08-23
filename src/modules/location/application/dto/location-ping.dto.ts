import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  Max,
  Min,
  IsISO8601,
} from 'class-validator';

export class LocationPingDto {
  @ApiProperty({ example: -23.55052, description: 'Latitude (-90..90)' })
  @IsLatitude()
  lat!: number;

  @ApiProperty({ example: -46.633308, description: 'Longitude (-180..180)' })
  @IsLongitude()
  lng!: number;

  @ApiPropertyOptional({ example: 12.5, description: 'Acurácia em metros' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  accuracy?: number;

  @ApiPropertyOptional({ example: 2.1, description: 'Velocidade em m/s' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  speed?: number;

  @ApiPropertyOptional({ example: 180, description: 'Rumo 0..360 graus' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(360)
  heading?: number;

  @ApiPropertyOptional({ example: 'INCIDENT_ID' })
  @IsOptional()
  incidentId?: string;

  @ApiPropertyOptional({ enum: ['MOBILE', 'WEB'], example: 'MOBILE' })
  @IsOptional()
  @IsEnum(['MOBILE', 'WEB'] as const)
  source?: 'MOBILE' | 'WEB';

  @ApiPropertyOptional({ example: '2025-08-23T13:45:00.000Z', description: 'ISO8601' })
  @IsOptional()
  @IsISO8601()
  recordedAt?: string; // ISO opcional
}

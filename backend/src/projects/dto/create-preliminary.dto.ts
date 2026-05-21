import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export const PRELIMINARY_TYPES = [
  'ESTUDIO_SUELO',
  'TOPOGRAFIA',
  'INSTALACION_FAENAS',
  'SERVICIOS_BASICOS',
] as const;
export type PreliminaryType = (typeof PRELIMINARY_TYPES)[number];

export class CreatePreliminaryDto {
  @ApiProperty({ enum: PRELIMINARY_TYPES })
  @IsIn([...PRELIMINARY_TYPES])
  type!: PreliminaryType;

  @ApiProperty({ example: 'Estudio de suelo con muestreo cada 5m' })
  @IsString()
  @MinLength(3)
  description!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

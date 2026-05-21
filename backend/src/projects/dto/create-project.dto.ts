import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsUUID, IsString, MinLength } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ description: 'Contrato FIRMADO que origina el proyecto' })
  @IsUUID()
  contractId!: string;

  @ApiProperty({ example: 'PRJ-2026-001' })
  @IsString()
  @MinLength(3)
  code!: string;

  @ApiProperty({ example: '2026-06-01T00:00:00.000Z' })
  @Type(() => Date)
  @IsDate()
  startDate!: Date;

  @ApiProperty({ description: 'User id del encargado de proyecto' })
  @IsUUID()
  projectManagerId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  qualityManagerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  budgetManagerId?: string;
}

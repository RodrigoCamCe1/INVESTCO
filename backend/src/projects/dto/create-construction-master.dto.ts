import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateConstructionMasterDto {
  @ApiProperty({ example: 'PRJ-CM-2026-001' })
  @IsString()
  @MinLength(3)
  code!: string;

  @ApiProperty({ example: '2026-08-01T00:00:00.000Z' })
  @Type(() => Date)
  @IsDate()
  startDate!: Date;

  @ApiProperty({ description: 'User id del encargado de proyecto (rol ENCARG_PROYECTO)' })
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

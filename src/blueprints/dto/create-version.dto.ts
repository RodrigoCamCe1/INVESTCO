import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsObject, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateVersionDto {
  @ApiProperty({ description: 'User arquitecto (rol ARQUITECTO)' })
  @IsUUID()
  arquitectId!: string;

  @ApiProperty({ description: 'User ingeniero (rol INGENIERO)' })
  @IsUUID()
  engineerId!: string;

  @ApiProperty({ description: 'Detalle arquitectónico (JSON)' })
  @IsObject()
  architecturalDesign!: Record<string, unknown>;

  @ApiProperty({ description: 'Cálculos estructurales (JSON)' })
  @IsObject()
  structuralCalcs!: Record<string, unknown>;

  @ApiPropertyOptional({ example: 350000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  estimatedBudget?: number;
}

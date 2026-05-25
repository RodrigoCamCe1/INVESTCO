import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateDevelopmentDto {
  @ApiProperty({ example: 'DEV-2026-001' })
  @IsString()
  @MinLength(3)
  code!: string;

  @ApiProperty({ example: 'Condominio Vista Verde' })
  @IsString()
  @MinLength(3)
  name!: string;

  @ApiProperty({ example: 'Urubó' })
  @IsString()
  @MinLength(2)
  zone!: string;

  @ApiProperty({ example: 'Av. Costanera, lote 12' })
  @IsString()
  @MinLength(3)
  address!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 250000, description: 'Presupuesto compra terreno' })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  acquisitionBudget!: number;

  @ApiProperty({ example: 1500000, description: 'Presupuesto obra' })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  constructionBudget!: number;

  @ApiPropertyOptional({ default: 'BOB' })
  @IsOptional()
  @IsIn(['BOB', 'USD'])
  currency?: string;

  @ApiProperty({ example: 12 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  estimatedUnits!: number;

  @ApiProperty({ example: '2026-08-01T00:00:00.000Z' })
  @Type(() => Date)
  @IsDate()
  startDate!: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  estimatedCompletion?: Date;
}

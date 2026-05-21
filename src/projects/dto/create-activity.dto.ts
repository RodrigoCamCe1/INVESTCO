import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityCategory, ActivityStage } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min, MinLength } from 'class-validator';

export class CreateActivityDto {
  @ApiProperty({ enum: ActivityStage })
  @IsEnum(ActivityStage)
  stage!: ActivityStage;

  @ApiProperty({ enum: ActivityCategory })
  @IsEnum(ActivityCategory)
  category!: ActivityCategory;

  @ApiProperty({ example: 'Cimentación zapatas' })
  @IsString()
  @MinLength(3)
  name!: string;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  plannedStart!: Date;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  plannedEnd!: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  plannedQuantity?: number;

  @ApiPropertyOptional({ example: 'm3' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  unitPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalPlannedCost?: number;

  @ApiPropertyOptional({ description: 'Worker contratista (debe tener rol CONTRATISTA o ser worker EXTERNO)' })
  @IsOptional()
  @IsUUID()
  contractorWorkerId?: string;

  @ApiPropertyOptional({ example: 1, description: 'Peso para ponderación de avance global' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  weight?: number;
}

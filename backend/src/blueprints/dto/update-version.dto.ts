import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsObject, IsOptional, Min } from 'class-validator';

export class UpdateVersionDto {
  @ApiProperty({ description: 'optimisticVersion esperada para concurrencia' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  expectedOptimisticVersion!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  architecturalDesign?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  structuralCalcs?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  estimatedBudget?: number;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class ReportProgressDto {
  @ApiProperty({ example: 35.5, description: '% acumulado de avance, 0-100' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  percentComplete!: number;

  @ApiPropertyOptional({ example: 50, description: 'Cantidad ejecutada (ej. m3 vaciados)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  quantityCompleted?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

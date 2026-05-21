import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsInt, IsNumber, IsObject, IsOptional, Min } from 'class-validator';

export class AmendContractDto {
  @ApiProperty({ description: 'Versión optimista esperada del contrato a modificar' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  expectedOptimisticVersion!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  totalAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  deliveryDeadline?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  specialClauses?: Record<string, unknown>;
}

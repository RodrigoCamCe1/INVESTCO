import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsUUID, Min } from 'class-validator';

export class UpsertRequirementDto {
  @ApiProperty()
  @IsUUID()
  materialId!: string;

  @ApiProperty({ example: 200 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  plannedQuantity!: number;

  @ApiProperty({ example: 65.50 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  plannedUnitPrice!: number;
}

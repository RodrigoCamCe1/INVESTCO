import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateUsageDto {
  @ApiProperty()
  @IsUUID()
  materialId!: string;

  @ApiProperty({ example: 50 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  quantityUsed!: number;

  @ApiPropertyOptional({ description: 'Activity asociada al consumo' })
  @IsOptional()
  @IsUUID()
  activityId?: string;
}

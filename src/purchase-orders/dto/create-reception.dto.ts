import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateReceptionDto {
  @ApiProperty()
  @IsUUID()
  purchaseOrderLineId!: string;

  @ApiProperty({ example: 50 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  quantityReceived!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  qualityNotes?: string;
}

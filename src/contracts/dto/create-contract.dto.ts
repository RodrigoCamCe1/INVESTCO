import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsIn, IsNumber, IsObject, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateContractDto {
  @ApiProperty({ description: 'Reserva activa que origina el contrato' })
  @IsUUID()
  reservationId!: string;

  @ApiProperty({ example: 250000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  totalAmount!: number;

  @ApiPropertyOptional({ default: 'BOB' })
  @IsOptional()
  @IsIn(['BOB', 'USD'])
  currency?: string;

  @ApiProperty({ example: '2027-06-30T00:00:00.000Z' })
  @Type(() => Date)
  @IsDate()
  deliveryDeadline!: Date;

  @ApiPropertyOptional({ description: 'Cláusulas especiales' })
  @IsOptional()
  @IsObject()
  specialClauses?: Record<string, unknown>;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateReservationDto {
  @ApiProperty()
  @IsUUID()
  propertyId!: string;

  @ApiProperty()
  @IsUUID()
  clientId!: string;

  @ApiProperty({ example: 5000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  depositAmount!: number;

  @ApiPropertyOptional({ example: 'BOB', default: 'BOB' })
  @IsOptional()
  @IsIn(['BOB', 'USD'])
  currency?: string;

  @ApiProperty({ example: 30, description: 'Días de validez' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(365)
  validityDays!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  refundConditions?: string;
}

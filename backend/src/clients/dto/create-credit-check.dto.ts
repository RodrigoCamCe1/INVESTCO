import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateCreditCheckDto {
  @ApiProperty({ example: 'Banco Mercantil Santa Cruz' })
  @IsString()
  @MinLength(2)
  bankName!: string;

  @ApiPropertyOptional({ example: 150000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  requestedAmount?: number;
}

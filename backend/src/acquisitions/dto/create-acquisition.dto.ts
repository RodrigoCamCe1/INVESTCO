import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateAcquisitionDto {
  @ApiProperty({ example: 'Constructora Soto SRL' })
  @IsString()
  @MinLength(3)
  sellerName!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sellerCi?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sellerPhone?: string;

  @ApiProperty({ example: 250000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  totalAmount!: number;

  @ApiPropertyOptional({ default: 'BOB' })
  @IsOptional()
  @IsIn(['BOB', 'USD'])
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateMaterialDto {
  @ApiProperty({ example: 'MAT-CEMENT-IP30' })
  @IsString()
  @MinLength(2)
  code!: string;

  @ApiProperty({ example: 'Cemento IP-30 bolsa 50kg' })
  @IsString()
  @MinLength(3)
  name!: string;

  @ApiProperty({ example: 'BOL' })
  @IsString()
  unit!: string;

  @ApiProperty({ example: 65.50 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  referencePrice!: number;

  @ApiProperty({ example: 'AGLOMERANTES' })
  @IsString()
  category!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

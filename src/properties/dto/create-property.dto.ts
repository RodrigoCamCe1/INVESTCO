import { ApiProperty } from '@nestjs/swagger';
import { PropertyType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, MinLength, Min } from 'class-validator';

export class CreatePropertyDto {
  @ApiProperty({ example: 'INM-001' })
  @IsString()
  @MinLength(1)
  code!: string;

  @ApiProperty({ enum: PropertyType, example: PropertyType.CASA })
  @IsEnum(PropertyType)
  type!: PropertyType;

  @ApiProperty({ example: 'Av. Banzer 1234' })
  @IsString()
  @MinLength(3)
  address!: string;

  @ApiProperty({ example: 'Zona Norte' })
  @IsString()
  @MinLength(2)
  zone!: string;

  @ApiProperty({ example: 120.5 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  m2!: number;

  @ApiProperty({ required: false, description: 'ID modelo plano (opcional)' })
  @IsOptional()
  @IsUUID()
  modelBlueprintId?: string;
}

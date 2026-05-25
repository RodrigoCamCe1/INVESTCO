import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PropertyType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class SubdivideUnitDto {
  @ApiProperty({ example: 'A101' })
  @IsString()
  @MinLength(1)
  code!: string;

  @ApiProperty({ enum: PropertyType })
  @IsEnum(PropertyType)
  type!: PropertyType;

  @ApiPropertyOptional({ description: 'Si no se pasa, se hereda dirección del desarrollo + sufijo' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  m2!: number;
}

export class SubdivideDto {
  @ApiProperty({ type: [SubdivideUnitDto], minItems: 1 })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SubdivideUnitDto)
  units!: SubdivideUnitDto[];
}

export class BulkGenerateUnitsDto {
  @ApiProperty({ example: 12 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  count!: number;

  @ApiProperty({ example: 'A' })
  @IsString()
  @MinLength(1)
  codePrefix!: string;

  @ApiProperty({ enum: PropertyType })
  @IsEnum(PropertyType)
  type!: PropertyType;

  @ApiProperty({ example: 80 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  m2!: number;

  @ApiPropertyOptional({ example: 1, description: 'Número inicial del rango' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  startNumber?: number;
}

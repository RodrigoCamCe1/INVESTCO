import { ApiProperty } from '@nestjs/swagger';
import { PropertyType } from '@prisma/client';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsEnum, IsNumber, IsString, Min, MinLength, ValidateNested } from 'class-validator';

export class ChildPropertyDto {
  @ApiProperty({ example: 'INM-001-A' })
  @IsString()
  @MinLength(1)
  code!: string;

  @ApiProperty({ enum: PropertyType })
  @IsEnum(PropertyType)
  type!: PropertyType;

  @ApiProperty({ example: 'Av. Banzer 1234 dpto A' })
  @IsString()
  @MinLength(3)
  address!: string;

  @ApiProperty({ example: 'Zona Norte' })
  @IsString()
  @MinLength(2)
  zone!: string;

  @ApiProperty({ example: 60 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  m2!: number;
}

export class DividePropertyDto {
  @ApiProperty({ type: [ChildPropertyDto] })
  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => ChildPropertyDto)
  children!: ChildPropertyDto[];
}

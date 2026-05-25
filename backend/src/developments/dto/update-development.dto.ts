import { ApiPropertyOptional } from '@nestjs/swagger';
import { DevelopmentStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateDevelopmentDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(3)
  name?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(2)
  zone?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(3)
  address?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  description?: string;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0.01)
  acquisitionBudget?: number;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0.01)
  constructionBudget?: number;

  @ApiPropertyOptional() @IsOptional() @IsIn(['BOB', 'USD'])
  currency?: string;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  estimatedUnits?: number;

  @ApiPropertyOptional() @IsOptional() @Type(() => Date) @IsDate()
  estimatedCompletion?: Date;

  @ApiPropertyOptional({ enum: DevelopmentStatus })
  @IsOptional()
  @IsEnum(DevelopmentStatus)
  status?: DevelopmentStatus;
}

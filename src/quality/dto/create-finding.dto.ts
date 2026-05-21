import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FindingSeverity } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateFindingDto {
  @ApiProperty({ enum: FindingSeverity })
  @IsEnum(FindingSeverity)
  severity!: FindingSeverity;

  @ApiProperty({ example: 'Junta fría detectada en losa norte' })
  @IsString()
  @MinLength(5)
  description!: string;

  @ApiPropertyOptional({ example: 'Demoler y revaciar zona afectada' })
  @IsOptional()
  @IsString()
  correctiveAction?: string;

  @ApiPropertyOptional({ description: 'Fecha límite para resolución' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  targetDate?: Date;
}

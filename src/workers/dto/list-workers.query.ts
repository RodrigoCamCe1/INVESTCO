import { ApiPropertyOptional } from '@nestjs/swagger';
import { WorkerType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsBooleanString, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListWorkersQueryDto {
  @ApiPropertyOptional({ enum: WorkerType })
  @IsOptional()
  @IsEnum(WorkerType)
  type?: WorkerType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  speciality?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBooleanString()
  isActive?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

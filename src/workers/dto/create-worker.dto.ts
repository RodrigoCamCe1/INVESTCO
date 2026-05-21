import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WorkerType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min, MinLength, ValidateIf } from 'class-validator';

export class CreateWorkerDto {
  @ApiProperty({ enum: WorkerType })
  @IsEnum(WorkerType)
  type!: WorkerType;

  @ApiProperty({ example: 'Albañil' })
  @IsString()
  @MinLength(2)
  speciality!: string;

  @ApiPropertyOptional({ description: 'User asociado (solo INTERNO con cuenta en sistema)' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ description: 'Empresa contratista (requerido para EXTERNO sin user)' })
  @ValidateIf((o: CreateWorkerDto) => o.type === WorkerType.EXTERNO && !o.userId)
  @IsString()
  @MinLength(2)
  contractorCompany?: string;

  @ApiPropertyOptional({ example: 150 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  dailyRate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  hourlyRate?: number;
}

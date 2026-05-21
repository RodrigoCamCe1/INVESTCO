import { ApiPropertyOptional } from '@nestjs/swagger';
import { FindingStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateFindingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  correctiveAction?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  targetDate?: Date;

  @ApiPropertyOptional({ enum: FindingStatus })
  @IsOptional()
  @IsEnum(FindingStatus)
  status?: FindingStatus;
}

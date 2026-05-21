import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectStage, ProjectStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsUUID } from 'class-validator';

export class UpdateProjectDto {
  @ApiPropertyOptional({ enum: ProjectStatus })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiPropertyOptional({ enum: ProjectStage })
  @IsOptional()
  @IsEnum(ProjectStage)
  currentStage?: ProjectStage;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  qualityManagerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  budgetManagerId?: string;
}

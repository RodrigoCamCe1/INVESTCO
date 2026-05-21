import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateScheduleItemDto {
  @ApiProperty({ example: 'Excavación zapatas' })
  @IsString()
  @MinLength(3)
  name!: string;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  plannedStart!: Date;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  plannedEnd!: Date;

  @ApiPropertyOptional({ description: 'Activity asociada' })
  @IsOptional()
  @IsUUID()
  activityId?: string;
}

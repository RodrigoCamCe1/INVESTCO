import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export const MEETING_STATUSES = ['PROGRAMADA', 'REALIZADA', 'CANCELADA', 'REPROGRAMADA'] as const;
export type MeetingStatus = (typeof MEETING_STATUSES)[number];

export class UpdateMeetingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  scheduledAt?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(5)
  @Max(480)
  durationMin?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ enum: MEETING_STATUSES })
  @IsOptional()
  @IsIn([...MEETING_STATUSES])
  status?: MeetingStatus;
}

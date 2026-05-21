import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateMeetingDto {
  @ApiProperty({ example: '2026-05-25T15:00:00.000Z' })
  @Type(() => Date)
  @IsDate()
  scheduledAt!: Date;

  @ApiProperty({ example: 45 })
  @Type(() => Number)
  @IsInt()
  @Min(5)
  @Max(480)
  durationMin!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

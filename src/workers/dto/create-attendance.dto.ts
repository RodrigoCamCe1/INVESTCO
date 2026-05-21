import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsIn, IsNumber, IsOptional, IsUUID, Max, Min } from 'class-validator';

export const ATTENDANCE_STATUSES = ['PRESENTE', 'FALTA', 'PERMISO', 'VACACION'] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

export class CreateAttendanceDto {
  @ApiProperty()
  @IsUUID()
  workerId!: string;

  @ApiProperty({ example: '2026-06-01T00:00:00.000Z' })
  @Type(() => Date)
  @IsDate()
  date!: Date;

  @ApiProperty({ example: 8 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(24)
  hoursWorked!: number;

  @ApiPropertyOptional({ enum: ATTENDANCE_STATUSES, default: 'PRESENTE' })
  @IsOptional()
  @IsIn([...ATTENDANCE_STATUSES])
  status?: AttendanceStatus;
}

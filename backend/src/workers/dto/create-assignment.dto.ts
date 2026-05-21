import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateAssignmentDto {
  @ApiProperty()
  @IsUUID()
  workerId!: string;

  @ApiProperty({ example: 'Maestro de obra' })
  @IsString()
  @MinLength(2)
  role!: string;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  startDate!: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;
}

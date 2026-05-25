import { ApiPropertyOptional } from '@nestjs/swagger';
import { PermitStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdatePermitDto {
  @ApiPropertyOptional() @IsOptional() @IsString()
  permitNumber?: string;

  @ApiPropertyOptional() @IsOptional() @Type(() => Date) @IsDate()
  issuedDate?: Date;

  @ApiPropertyOptional() @IsOptional() @Type(() => Date) @IsDate()
  validUntil?: Date;

  @ApiPropertyOptional() @IsOptional() @IsString()
  notes?: string;

  @ApiPropertyOptional({ enum: PermitStatus })
  @IsOptional()
  @IsEnum(PermitStatus)
  status?: PermitStatus;
}

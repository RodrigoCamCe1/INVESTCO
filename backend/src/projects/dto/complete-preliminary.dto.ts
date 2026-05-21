import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CompletePreliminaryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';

export class EndAssignmentDto {
  @ApiPropertyOptional({ description: 'Fecha de baja. Default: ahora' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;
}

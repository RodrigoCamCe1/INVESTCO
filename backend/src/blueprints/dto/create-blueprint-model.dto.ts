import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateBlueprintModelDto {
  @ApiProperty({ example: 'Modelo Casa T-110' })
  @IsString()
  @MinLength(3)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

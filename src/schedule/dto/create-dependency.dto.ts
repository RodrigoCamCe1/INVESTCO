import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export const DEP_TYPES = ['FS', 'SS', 'FF', 'SF'] as const;
export type DepType = (typeof DEP_TYPES)[number];

export class CreateDependencyDto {
  @ApiProperty({ description: 'Item predecesor' })
  @IsUUID()
  predecessorId!: string;

  @ApiProperty({ description: 'Item sucesor' })
  @IsUUID()
  successorId!: string;

  @ApiPropertyOptional({ enum: DEP_TYPES, default: 'FS' })
  @IsOptional()
  @IsIn([...DEP_TYPES])
  type?: DepType;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  lagDays?: number;
}

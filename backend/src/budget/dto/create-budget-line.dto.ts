import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BudgetCategory } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateBudgetLineDto {
  @ApiProperty({ enum: BudgetCategory })
  @IsEnum(BudgetCategory)
  category!: BudgetCategory;

  @ApiProperty({ example: 'Cemento + agregados estructural' })
  @IsString()
  @MinLength(3)
  description!: string;

  @ApiProperty({ example: 15000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  plannedAmount!: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  actualAmount?: number;
}

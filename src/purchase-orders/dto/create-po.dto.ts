import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsIn, IsNumber, IsOptional, IsUUID, Min, ValidateNested } from 'class-validator';

export class PoLineDto {
  @ApiProperty()
  @IsUUID()
  materialId!: string;

  @ApiProperty({ example: 100 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  quantity!: number;

  @ApiProperty({ example: 65.50 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  unitPrice!: number;
}

export class CreatePoDto {
  @ApiProperty()
  @IsUUID()
  projectId!: string;

  @ApiProperty()
  @IsUUID()
  supplierId!: string;

  @ApiPropertyOptional({ default: 'BOB' })
  @IsOptional()
  @IsIn(['BOB', 'USD'])
  currency?: string;

  @ApiProperty({ type: [PoLineDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PoLineDto)
  lines!: PoLineDto[];
}

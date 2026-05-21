import { ApiProperty } from '@nestjs/swagger';
import { RoleCode } from '@prisma/client';
import { ArrayMinSize, IsArray, IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'vendedor1@investco.local' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Pass1234!' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @MinLength(2)
  fullName!: string;

  @ApiProperty({ example: '+59170000000', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ enum: RoleCode, isArray: true, example: ['VENDEDOR'] })
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(RoleCode, { each: true })
  roles!: RoleCode[];
}

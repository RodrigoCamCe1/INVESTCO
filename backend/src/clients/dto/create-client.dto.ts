import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class CreateClientDto {
  @ApiProperty({ example: '7891234', description: 'CI/NIT' })
  @IsString()
  @Matches(/^[0-9A-Za-z\-]+$/)
  @MinLength(5)
  ci!: string;

  @ApiProperty({ example: 'María' })
  @IsString()
  @MinLength(2)
  firstName!: string;

  @ApiProperty({ example: 'González' })
  @IsString()
  @MinLength(2)
  lastName!: string;

  @ApiProperty({ example: '+59170012345' })
  @IsString()
  @MinLength(7)
  phone!: string;

  @ApiPropertyOptional({ example: 'maria@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'Facebook' })
  @IsOptional()
  @IsString()
  source?: string;
}

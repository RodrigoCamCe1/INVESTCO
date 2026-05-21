import { ApiProperty } from '@nestjs/swagger';
import { InstallationType } from '@prisma/client';
import { IsEnum, IsObject } from 'class-validator';

export class CreateInstallationDto {
  @ApiProperty({ enum: InstallationType })
  @IsEnum(InstallationType)
  type!: InstallationType;

  @ApiProperty({ description: 'Spec JSON' })
  @IsObject()
  spec!: Record<string, unknown>;
}

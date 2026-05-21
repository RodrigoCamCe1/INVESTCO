import { ApiProperty } from '@nestjs/swagger';
import { ActivityStage } from '@prisma/client';
import { IsEnum, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateInspectionDto {
  @ApiProperty({ description: 'User id inspector (rol ENCARG_CALIDAD, INGENIERO o SUPERVISOR)' })
  @IsUUID()
  inspectorId!: string;

  @ApiProperty({ enum: ActivityStage })
  @IsEnum(ActivityStage)
  stage!: ActivityStage;

  @ApiProperty({ example: 'Revisión estructural cimentación' })
  @IsString()
  @MinLength(3)
  scope!: string;
}

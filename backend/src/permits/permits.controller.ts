import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PermitsService } from './permits.service';
import { CreatePermitDto } from './dto/create-permit.dto';
import { UpdatePermitDto } from './dto/update-permit.dto';

@ApiTags('permits')
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class PermitsController {
  constructor(private readonly svc: PermitsService) {}

  @Get('developments/:developmentId/permits')
  list(@Param('developmentId', new ParseUUIDPipe()) developmentId: string) {
    return this.svc.list(developmentId);
  }

  @Post('developments/:developmentId/permits')
  @Roles('ADMIN', 'GERENTE', 'ENCARG_PROYECTO')
  create(
    @Param('developmentId', new ParseUUIDPipe()) developmentId: string,
    @Body() dto: CreatePermitDto,
  ) {
    return this.svc.create(developmentId, dto);
  }

  @Patch('permits/:id')
  @Roles('ADMIN', 'GERENTE', 'ENCARG_PROYECTO')
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdatePermitDto) {
    return this.svc.update(id, dto);
  }

  @Delete('permits/:id')
  @Roles('ADMIN', 'GERENTE')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.svc.remove(id);
  }
}

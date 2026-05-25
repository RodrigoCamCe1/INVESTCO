import {
  Body,
  Controller,
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
import { AcquisitionsService } from './acquisitions.service';
import { CreateAcquisitionDto } from './dto/create-acquisition.dto';

@ApiTags('acquisitions')
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class AcquisitionsController {
  constructor(private readonly svc: AcquisitionsService) {}

  @Get('developments/:developmentId/acquisitions')
  list(@Param('developmentId', new ParseUUIDPipe()) developmentId: string) {
    return this.svc.list(developmentId);
  }

  @Post('developments/:developmentId/acquisitions')
  @Roles('ADMIN', 'GERENTE')
  create(
    @Param('developmentId', new ParseUUIDPipe()) developmentId: string,
    @Body() dto: CreateAcquisitionDto,
  ) {
    return this.svc.create(developmentId, dto);
  }

  @Patch('acquisitions/:id/sign')
  @Roles('ADMIN', 'GERENTE')
  sign(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.svc.sign(id);
  }

  @Patch('acquisitions/:id/cancel')
  @Roles('ADMIN', 'GERENTE')
  cancel(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.svc.cancel(id);
  }
}

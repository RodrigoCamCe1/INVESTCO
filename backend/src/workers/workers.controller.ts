import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Worker } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { ListWorkersQueryDto } from './dto/list-workers.query';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { WorkersService } from './workers.service';

@ApiTags('workers')
@ApiBearerAuth()
@Controller('workers')
export class WorkersController {
  constructor(private readonly svc: WorkersService) {}

  @Get()
  list(@Query() q: ListWorkersQueryDto) {
    return this.svc.list(q);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<Worker> {
    return this.svc.findById(id);
  }

  @Post()
  @Roles('ADMIN', 'GERENTE', 'ENCARG_PROYECTO')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar trabajador (INTERNO con userId o EXTERNO con contractorCompany)' })
  create(@Body() dto: CreateWorkerDto): Promise<Worker> {
    return this.svc.create(dto);
  }

  @Patch(':id')
  @Roles('ADMIN', 'GERENTE', 'ENCARG_PROYECTO')
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateWorkerDto): Promise<Worker> {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'GERENTE')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.svc.deactivate(id);
  }
}

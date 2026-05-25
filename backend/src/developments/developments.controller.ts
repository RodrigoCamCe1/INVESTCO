import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { DevelopmentStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { DevelopmentsService } from './developments.service';
import { CreateDevelopmentDto } from './dto/create-development.dto';
import { BulkGenerateUnitsDto, SubdivideDto } from './dto/subdivide.dto';
import { UpdateDevelopmentDto } from './dto/update-development.dto';

@ApiTags('developments')
@ApiBearerAuth()
@Controller('developments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DevelopmentsController {
  constructor(private readonly devs: DevelopmentsService) {}

  @Get()
  @ApiQuery({ name: 'status', enum: DevelopmentStatus, required: false })
  list(@Query('status') status?: DevelopmentStatus) {
    return this.devs.list({ status });
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.devs.findOne(id);
  }

  @Post()
  @Roles('ADMIN', 'GERENTE')
  create(@Body() dto: CreateDevelopmentDto) {
    return this.devs.create(dto);
  }

  @Patch(':id')
  @Roles('ADMIN', 'GERENTE')
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateDevelopmentDto) {
    return this.devs.update(id, dto);
  }

  @Post(':id/subdivide')
  @Roles('ADMIN', 'GERENTE', 'ARQUITECTO')
  subdivide(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: SubdivideDto,
  ) {
    return this.devs.subdivide(id, dto);
  }

  @Post(':id/bulk-generate-units')
  @Roles('ADMIN', 'GERENTE', 'ARQUITECTO')
  bulkGenerate(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: BulkGenerateUnitsDto,
  ) {
    return this.devs.bulkGenerateUnits(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.devs.remove(id);
  }
}

import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BudgetLine } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { BudgetService, BudgetSummary } from './budget.service';
import { CreateBudgetLineDto } from './dto/create-budget-line.dto';
import { UpdateBudgetLineDto } from './dto/update-budget-line.dto';

@ApiTags('budget')
@ApiBearerAuth()
@Controller('projects/:projectId')
export class BudgetController {
  constructor(private readonly svc: BudgetService) {}

  @Get('budget-lines')
  list(@Param('projectId', new ParseUUIDPipe()) projectId: string) {
    return this.svc.list(projectId);
  }

  @Post('budget-lines')
  @Roles('ADMIN', 'GERENTE', 'ENCARG_PRESUPUESTO')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear línea de presupuesto' })
  create(
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Body() dto: CreateBudgetLineDto,
  ): Promise<BudgetLine> {
    return this.svc.create(projectId, dto);
  }

  @Patch('budget-lines/:id')
  @Roles('ADMIN', 'GERENTE', 'ENCARG_PRESUPUESTO')
  update(
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateBudgetLineDto,
  ): Promise<BudgetLine> {
    return this.svc.update(projectId, id, dto);
  }

  @Delete('budget-lines/:id')
  @Roles('ADMIN', 'GERENTE', 'ENCARG_PRESUPUESTO')
  remove(
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.svc.remove(projectId, id);
  }

  @Get('budget-summary')
  @ApiOperation({ summary: 'Resumen presupuesto: planned vs actual por categoría + desviación' })
  summary(@Param('projectId', new ParseUUIDPipe()) projectId: string): Promise<BudgetSummary> {
    return this.svc.summary(projectId);
  }
}

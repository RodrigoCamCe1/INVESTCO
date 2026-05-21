import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreditCheck } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreditChecksService } from './credit-checks.service';
import { CreateCreditCheckDto } from './dto/create-credit-check.dto';

@ApiTags('clients')
@ApiBearerAuth()
@Controller('clients/:clientId/credit-checks')
export class CreditChecksController {
  constructor(private readonly svc: CreditChecksService) {}

  @Get()
  @ApiOperation({ summary: 'Historial de verificaciones de crédito' })
  list(@Param('clientId', new ParseUUIDPipe()) clientId: string): Promise<CreditCheck[]> {
    return this.svc.list(clientId);
  }

  @Post()
  @Roles('ADMIN', 'GERENTE', 'VENDEDOR')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Ejecutar verificación de crédito (MOCK BANCO en demo)' })
  run(
    @Param('clientId', new ParseUUIDPipe()) clientId: string,
    @Body() dto: CreateCreditCheckDto,
  ): Promise<CreditCheck> {
    return this.svc.run(clientId, dto);
  }
}

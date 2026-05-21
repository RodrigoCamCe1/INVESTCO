import { Module } from '@nestjs/common';
import { PurchaseOrdersController } from './purchase-orders.controller';
import { PurchaseOrdersService } from './purchase-orders.service';
import { ReceptionsController } from './receptions.controller';
import { ReceptionsService } from './receptions.service';

@Module({
  controllers: [PurchaseOrdersController, ReceptionsController],
  providers: [PurchaseOrdersService, ReceptionsService],
  exports: [PurchaseOrdersService],
})
export class PurchaseOrdersModule {}

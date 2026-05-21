import { Module } from '@nestjs/common';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { CreditChecksController } from './credit-checks.controller';
import { CreditChecksService } from './credit-checks.service';
import { MeetingsController } from './meetings.controller';
import { MeetingsService } from './meetings.service';

@Module({
  controllers: [ClientsController, MeetingsController, CreditChecksController],
  providers: [ClientsService, MeetingsService, CreditChecksService],
  exports: [ClientsService],
})
export class ClientsModule {}

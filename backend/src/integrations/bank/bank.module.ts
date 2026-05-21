import { Global, Module } from '@nestjs/common';
import { BANK_PORT } from './bank.port';
import { MockBankAdapter } from './mock-bank.adapter';

@Global()
@Module({
  providers: [
    {
      provide: BANK_PORT,
      useClass: MockBankAdapter,
    },
  ],
  exports: [BANK_PORT],
})
export class BankModule {}

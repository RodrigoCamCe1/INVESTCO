import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { BlueprintsModule } from './blueprints/blueprints.module';
import { BudgetModule } from './budget/budget.module';
import { ClientsModule } from './clients/clients.module';
import { ContractsModule } from './contracts/contracts.module';
import { DeliveryModule } from './delivery/delivery.module';
import { HealthModule } from './health/health.module';
import { BankModule } from './integrations/bank/bank.module';
import { MaterialsModule } from './materials/materials.module';
import { PaymentsModule } from './payments/payments.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectsModule } from './projects/projects.module';
import { PropertiesModule } from './properties/properties.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';
import { QualityModule } from './quality/quality.module';
import { ReservationsModule } from './reservations/reservations.module';
import { ScheduleModule } from './schedule/schedule.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { UsersModule } from './users/users.module';
import { WorkersModule } from './workers/workers.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    BankModule,
    UsersModule,
    AuthModule,
    PropertiesModule,
    ClientsModule,
    ReservationsModule,
    ContractsModule,
    ProjectsModule,
    SuppliersModule,
    MaterialsModule,
    PurchaseOrdersModule,
    WorkersModule,
    QualityModule,
    DeliveryModule,
    PaymentsModule,
    BudgetModule,
    ScheduleModule,
    BlueprintsModule,
    HealthModule,
  ],
})
export class AppModule {}

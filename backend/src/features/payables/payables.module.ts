import { Module } from '@nestjs/common';
import { PayablesService } from './payables.service';
import { PayablesController } from './payables.controller';
import { PaymentPeriodsController } from './payment-periods.controller';
import { PaymentPeriodsService } from './payment-periods.service';

@Module({
  controllers: [PayablesController, PaymentPeriodsController],
  providers: [PayablesService, PaymentPeriodsService],
})
export class PayablesModule {}

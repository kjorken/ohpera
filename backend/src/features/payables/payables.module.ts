import { Module } from '@nestjs/common';
import { PayablesService } from './payables.service';
import { PayablesController } from './payables.controller';
import { PaymentPeriodsService } from './payment-periods.service';

@Module({
  controllers: [PayablesController],
  providers: [PayablesService, PaymentPeriodsService],
})
export class PayablesModule {}

import { Controller, Put, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymentPeriodsService } from './payment-periods.service';
import { UpdatePaymentPeriodDto } from './dto/update-payment-period.dto';
import {
  CurrentUser,
  AuthUser,
} from '../../shared/common/current-user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('payment-periods')
export class PaymentPeriodsController {
  constructor(private paymentPeriodsService: PaymentPeriodsService) {}

  @Put(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdatePaymentPeriodDto,
  ) {
    return this.paymentPeriodsService.updatePeriod(user.id, id, dto.amountPaid);
  }
}

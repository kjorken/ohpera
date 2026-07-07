import { IsNumber, Min } from 'class-validator';

export class UpdatePaymentPeriodDto {
  @IsNumber()
  @Min(0)
  amountPaid: number;
}

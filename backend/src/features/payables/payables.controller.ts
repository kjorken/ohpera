import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PayablesService } from './payables.service';
import { CreatePayableDto } from './dto/create-payable.dto';
import { UpdatePayableDto } from './dto/update-payable.dto';
import {
  CurrentUser,
  AuthUser,
} from '../../shared/common/current-user.decorator';
import { PaymentPeriodsService } from './payment-periods.service';

@UseGuards(AuthGuard('jwt'))
@Controller('payables')
export class PayablesController {
  constructor(
    private payablesService: PayablesService,
    private paymentPeriodsService: PaymentPeriodsService,
  ) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreatePayableDto) {
    return this.payablesService.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser, @Query('archived') archived?: string) {
    return this.payablesService.findAll(user.id, archived === 'true');
  }

  @Get('upcoming')
  getUpcoming(@CurrentUser() user: AuthUser) {
    return this.paymentPeriodsService.getUpcoming(user.id);
  }

  @Get('overdue')
  getOverdue(@CurrentUser() user: AuthUser) {
    return this.paymentPeriodsService.getOverdue(user.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.payablesService.findOne(user.id, id);
  }

  @Put(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdatePayableDto,
  ) {
    return this.payablesService.update(user.id, id, dto);
  }

  @Put(':id/archive')
  archive(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.payablesService.archive(user.id, id);
  }

  @Post(':id/mark-paid')
  markPaid(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.payablesService.markPaid(user.id, id);
  }

  @Delete(':id')
  softDelete(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.payablesService.softDelete(user.id, id);
  }
}

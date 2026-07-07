import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { CreatePayableDto } from './dto/create-payable.dto';
import { UpdatePayableDto } from './dto/update-payable.dto';
import { PaymentPeriodsService } from './payment-periods.service';
import { PaymentStatus } from '../../../generated/prisma/enums';

@Injectable()
export class PayablesService {
  constructor(
    private prisma: PrismaService,
    private paymentPeriodsService: PaymentPeriodsService,
  ) {}

  async create(userId: string, dto: CreatePayableDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });

    if (!user) throw new NotFoundException('User not found');

    if (user.plan === 'FREE') {
      const count = await this.prisma.payable.count({
        where: { userId, deletedAt: null },
      });
      if (count >= 10) {
        throw new ForbiddenException(
          'Free plan limit reached. Upgrade to PRO to add more payables.',
        );
      }
    }

    const payable = await this.prisma.payable.create({
      data: {
        userId,
        title: dto.title,
        provider: dto.provider,
        categoryId: dto.categoryId,
        isRecurring: dto.isRecurring,
        recurrenceFrequency: dto.recurrenceFrequency,
        startDate: new Date(dto.startDate),
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        amountPerPeriod: dto.amountPerPeriod,
        reminderDaysBefore: dto.reminderDaysBefore ?? 3,
        notes: dto.notes,
      },
    });

    await this.paymentPeriodsService.generatePaymentPeriods(payable.id);
    return payable;
  }

  async findAll(userId: string, archived = false) {
    return this.prisma.payable.findMany({
      where: { userId, deletedAt: null, isArchived: archived },
      include: { category: true, paymentPeriods: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const payable = await this.prisma.payable.findFirst({
      where: { id, userId, deletedAt: null },
      include: { category: true, paymentPeriods: true },
    });
    if (!payable) throw new NotFoundException('Payable not found');
    return payable;
  }

  async update(userId: string, id: string, dto: UpdatePayableDto) {
    await this.findOne(userId, id);
    return this.prisma.payable.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  async archive(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.payable.update({
      where: { id },
      data: { isArchived: true },
    });
  }

  async markPaid(userId: string, id: string) {
    await this.findOne(userId, id);

    const now = new Date();
    const periods = await this.prisma.paymentPeriod.findMany({
      where: { payableId: id, status: { in: ['OUTSTANDING', 'PARTIAL'] } },
    });

    for (const period of periods) {
      await this.prisma.paymentPeriod.update({
        where: { id: period.id },
        data: {
          amountPaid: period.amountDue,
          status: PaymentStatus.PAID,
          paidAt: now,
        },
      });
    }

    return this.prisma.payable.update({
      where: { id },
      data: { isArchived: true },
    });
  }

  async softDelete(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.payable.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

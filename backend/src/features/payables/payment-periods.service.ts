import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { computeDates, getBucketWindow } from '../../shared/utils/date.utils';
import { PaymentStatus } from '../../../generated/prisma/enums';

@Injectable()
export class PaymentPeriodsService {
  constructor(private prisma: PrismaService) {}

  public async generatePaymentPeriods(payableId: string) {
    const payable = await this.prisma.payable.findUnique({
      where: { id: payableId },
    });
    if (!payable) return;

    const periods: { dueDate: Date; amountDue: number }[] = [];
    const start = new Date(payable.startDate);
    let due: Date;
    if (payable.dueDate !== null && payable.dueDate !== undefined) {
      due = payable.dueDate;
    } else {
      due = new Date(payable.startDate);
    }
    const end = payable.endDate ? new Date(payable.endDate) : null;
    const amount = Number(payable.amountPerPeriod);

    if (!payable.isRecurring) {
      periods.push({ dueDate: due, amountDue: amount });
    } else if (end) {
      if (!payable.recurrenceFrequency) return;
      const dates = computeDates(start, end, payable.recurrenceFrequency);
      const capped = dates.slice(0, 200);
      capped.forEach((d) => periods.push({ dueDate: d, amountDue: amount }));
    } else {
      if (!payable.recurrenceFrequency) return;
      const windowEnd = new Date();
      windowEnd.setMonth(windowEnd.getMonth() + 3);
      const dates = computeDates(start, windowEnd, payable.recurrenceFrequency);
      dates.forEach((d) => periods.push({ dueDate: d, amountDue: amount }));
    }

    await this.prisma.paymentPeriod.createMany({
      data: periods.map((p) => ({
        payableId,
        dueDate: p.dueDate,
        amountDue: p.amountDue,
      })),
    });
  }

  async updatePeriod(userId: string, periodId: string, amountPaid: number) {
    const period = await this.prisma.paymentPeriod.findUnique({
      where: { id: periodId },
      include: { payable: { select: { userId: true } } },
    });

    if (!period) throw new NotFoundException('Payment period not found');
    if (period.payable.userId !== userId)
      throw new ForbiddenException('Access denied');

    const amountDue = Number(period.amountDue);
    let status: (typeof PaymentStatus)[keyof typeof PaymentStatus];
    if (amountPaid <= 0) {
      status = PaymentStatus.OUTSTANDING;
    } else if (amountPaid >= amountDue) {
      status = PaymentStatus.PAID;
    } else {
      status = PaymentStatus.PARTIAL;
    }

    return this.prisma.paymentPeriod.update({
      where: { id: periodId },
      data: { amountPaid, status },
    });
  }

  async getOverdue(userId: string) {
    const now = new Date();

    return this.prisma.paymentPeriod.findMany({
      where: {
        payable: { userId, deletedAt: null, isArchived: false },
        dueDate: { lt: now },
        status: { in: ['OUTSTANDING', 'PARTIAL', 'OVERDUE'] },
      },
      include: { payable: { include: { category: true } } },
      orderBy: {
        dueDate: 'asc',
      },
    });
  }

  async getUpcoming(userId: string) {
    const settings = await this.prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      throw new NotFoundException('User settings not found');
    }

    const { start, end } = getBucketWindow(
      settings.bucketFrequency,
      settings.bucketCycleStart,
      settings.bucketCustomDays,
    );

    return this.prisma.paymentPeriod.findMany({
      where: {
        payable: { userId, deletedAt: null, isArchived: false },
        dueDate: { gte: start, lte: end },
        status: { in: ['OUTSTANDING', 'PARTIAL'] },
      },
      include: { payable: { include: { category: true } } },
      orderBy: { dueDate: 'asc' },
    });
  }
}

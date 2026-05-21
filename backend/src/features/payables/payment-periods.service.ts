import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { computeDates, getBucketWindows } from '../../shared/utils/date.utils';

@Injectable()
export class PaymentPeriodsService {
  constructor(private prisma: PrismaService) {}

  private async generatePaymentPeriods(payableId: string) {
    const payable = await this.prisma.payable.findUnique({
      where: { id: payableId },
    });
    if (!payable) return;

    const periods: { dueDate: Date; amountDue: number }[] = [];
    const start = new Date(payable.startDate);
    const end = payable.endDate ? new Date(payable.endDate) : null;
    const amount = Number(payable.amountPerPeriod);

    if (!payable.isRecurring) {
      periods.push({ dueDate: start, amountDue: amount });
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

    const { start, end } = getBucketWindows(
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

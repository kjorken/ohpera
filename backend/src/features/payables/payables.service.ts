import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import {
  CreatePayableDto,
  RecurrenceFrequency,
} from './dto/create-payable.dto';
import { UpdatePayableDto } from './dto/update-payable.dto';

@Injectable()
export class PayablesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreatePayableDto) {
    const payable = await this.prisma.payable.create({
      data: {
        userId,
        title: dto.title,
        provider: dto.provider,
        categoryId: dto.categoryId,
        isRecurring: dto.isRecurring,
        recurrenceFrequency: dto.recurrenceFrequency,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        amountPerPeriod: dto.amountPerPeriod,
        reminderDaysBefore: dto.reminderDaysBefore ?? 3,
        notes: dto.notes,
      },
    });

    await this.generatePaymentPeriods(payable.id);
    return payable;
  }

  async findAll(userId: string) {
    return this.prisma.payable.findMany({
      where: { userId, deletedAt: null, isArchived: false },
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

  async softDelete(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.payable.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

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
      const dates = this.computeDates(start, end, payable.recurrenceFrequency);
      const capped = dates.slice(0, 200);
      capped.forEach((d) => periods.push({ dueDate: d, amountDue: amount }));
    } else {
      if (!payable.recurrenceFrequency) return;
      const windowEnd = new Date();
      windowEnd.setMonth(windowEnd.getMonth() + 3);
      const dates = this.computeDates(
        start,
        windowEnd,
        payable.recurrenceFrequency,
      );
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

  private computeDates(
    start: Date,
    end: Date,
    frequency: RecurrenceFrequency,
  ): Date[] {
    const dates: Date[] = [];
    const current = new Date(start);

    while (current <= end) {
      dates.push(new Date(current));
      switch (frequency) {
        case RecurrenceFrequency.WEEKLY:
          current.setDate(current.getDate() + 7);
          break;
        case RecurrenceFrequency.BIWEEKLY:
          current.setDate(current.getDate() + 14);
          break;
        case RecurrenceFrequency.SEMI_MONTHLY:
          current.setDate(current.getDate() + 15);
          break;
        case RecurrenceFrequency.MONTHLY:
          current.setMonth(current.getMonth() + 1);
          break;
        case RecurrenceFrequency.QUARTERLY:
          current.setMonth(current.getMonth() + 3);
          break;
        case RecurrenceFrequency.ANNUALLY:
          current.setFullYear(current.getFullYear() + 1);
          break;
        default:
          return dates;
      }
    }
    return dates;
  }
}

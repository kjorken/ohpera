import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { getBucketWindow } from '../../shared/utils/date.utils';

interface PeriodInfo {
  id: string;
  dueDate: string;
  amountDue: number;
  status: string;
  title: string;
  category: { id: string; name: string; color: string | null } | null;
}

export interface BucketCycleResponse {
  cycleStart: string;
  cycleEnd: string;
  totalIncome: number;
  totalBills: number;
  remaining: number;
  billsByCategory: {
    categoryId: string;
    categoryName: string;
    color: string | null;
    total: number;
  }[];
  upcomingPeriods: PeriodInfo[];
}

@Injectable()
export class BucketsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrentCycle(userId: string): Promise<BucketCycleResponse> {
    const settings = await this.prisma.userSettings.findUnique({
      where: { userId },
    });
    if (!settings) throw new NotFoundException('Settings not found');

    const { start, end } = getBucketWindow(
      settings.bucketFrequency,
      settings.bucketCycleStart,
      settings.bucketCustomDays,
    );

    const [incomeSources, upcomingPeriods] = await Promise.all([
      this.prisma.incomeSource.findMany({ where: { userId } }),
      this.prisma.paymentPeriod.findMany({
        where: {
          payable: { userId, deletedAt: null, isArchived: false },
          dueDate: { gte: start, lte: end },
          status: { in: ['OUTSTANDING', 'PARTIAL'] },
        },
        include: { payable: { include: { category: true } } },
        orderBy: { dueDate: 'asc' },
      }),
    ]);

    const totalIncome = incomeSources.reduce(
      (sum, s) => sum + Number(s.amount),
      0,
    );

    const totalBills = upcomingPeriods.reduce(
      (sum, p) => sum + Number(p.amountDue),
      0,
    );

    const billsByCategory = upcomingPeriods.reduce<
      {
        categoryId: string;
        categoryName: string;
        color: string | null;
        total: number;
      }[]
    >((acc, p) => {
      const cat = p.payable.category;
      const key = cat?.id ?? '__uncategorized__';
      const existing = acc.find((c) => c.categoryId === key);
      if (existing) {
        existing.total += Number(p.amountDue);
      } else {
        acc.push({
          categoryId: key,
          categoryName: cat?.name ?? 'Uncategorized',
          color: cat?.color ?? null,
          total: Number(p.amountDue),
        });
      }
      return acc;
    }, []);

    return {
      cycleStart: start.toISOString(),
      cycleEnd: end.toISOString(),
      totalIncome,
      totalBills,
      remaining: totalIncome - totalBills,
      billsByCategory,
      upcomingPeriods: upcomingPeriods.map((p) => ({
        id: p.id,
        dueDate: p.dueDate.toISOString(),
        amountDue: Number(p.amountDue),
        status: p.status,
        title: p.payable.title,
        category: p.payable.category
          ? {
              id: p.payable.category.id,
              name: p.payable.category.name,
              color: p.payable.category.color,
            }
          : null,
      })),
    };
  }
}

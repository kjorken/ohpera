import { RecurrenceFrequency } from '../../../generated/prisma/enums';

export function computeDates(
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

export function getWindowEnd(
  windowStart: Date,
  frequency: RecurrenceFrequency,
  customDays?: number | null,
): Date {
  const end = new Date(windowStart);
  switch (frequency) {
    case RecurrenceFrequency.WEEKLY:
      end.setDate(end.getDate() + 6);
      break;
    case RecurrenceFrequency.BIWEEKLY:
      end.setDate(end.getDate() + 14);
      break;
    case RecurrenceFrequency.SEMI_MONTHLY:
      end.setDate(end.getDate() + 15);
      break;
    case RecurrenceFrequency.MONTHLY:
      end.setMonth(end.getMonth() + 1);
      break;
    case RecurrenceFrequency.QUARTERLY:
      end.setMonth(end.getMonth() + 3);
      break;
    case RecurrenceFrequency.ANNUALLY:
      end.setFullYear(end.getFullYear() + 1);
      break;
    case RecurrenceFrequency.CUSTOM:
      end.setDate(end.getDate() + (customDays ?? 7) - 1);
      break;
    default:
      return end;
  }
  return end;
}

export function getBucketWindows(
  frequency: RecurrenceFrequency,
  cycleStart: Date,
  customDays?: number | null,
): { start: Date; end: Date } {
  const now = new Date();
  const current = new Date(cycleStart);

  while (true) {
    const end = getWindowEnd(current, frequency, customDays);
    if (current <= now && now <= end) {
      return { start: new Date(current), end };
    }

    current.setTime(end.getTime());
    current.setDate(current.getDate() + 1);
  }
}

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

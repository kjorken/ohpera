export interface Category {
  id: string;
  name: string;
  color: string | null;
}

export interface PaymentPeriod {
  id: string;
  dueDate: string;
  amountDue: number;
  amountPaid: number;
  status: "OUTSTANDING" | "PARTIAL" | "PAID" | "OVERDUE";
}

export interface PayableWithPeriods {
  id: string;
  title: string;
  provider: string | null;
  amountPerPeriod: number;
  isRecurring: boolean;
  recurrenceFrequency: string | null;
  startDate: string;
  dueDate: string | null;
  endDate: string | null;
  notes: string | null;
  isArchived: boolean;
  category: Category | null;
  paymentPeriods: PaymentPeriod[];
}

export type TabType = "current" | "archived";

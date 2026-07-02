import { z } from "zod";

export const payableFormSchema = z
  .object({
    title: z.string().min(1, "Bill name is required"),
    provider: z.string().optional(),
    categoryId: z.string().optional(),
    amountPerPeriod: z.string().min(1, "Amount is required"),
    isRecurring: z.boolean(),
    recurrenceFrequency: z.string().optional(),
    startDate: z.string().min(1, "Date is required"),
    endDate: z.string().optional(),
    reminderDaysBefore: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.isRecurring) return true;
      return !!data.recurrenceFrequency;
    },
    {
      message: "Select how often this bill repeats",
      path: ["recurrenceFrequency"],
    },
  )
  .refine(
    (data) => {
      const amt = parseFloat(data.amountPerPeriod);
      return !isNaN(amt) && amt > 0;
    },
    {
      message: "Amount must be greater than 0",
      path: ["amountPerPeriod"],
    },
  )
  .refine(
    (data) => {
      if (!data.isRecurring || !data.reminderDaysBefore) return true;
      const days = parseInt(data.reminderDaysBefore, 10);
      return !isNaN(days) && days >= 1;
    },
    {
      message: "Must be at least 1 day",
      path: ["reminderDaysBefore"],
    },
  );

export type PayableFormValues = z.infer<typeof payableFormSchema>;

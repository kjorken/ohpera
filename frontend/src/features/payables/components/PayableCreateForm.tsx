import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { api } from "@/shared/lib/api";
import { useRouter } from "next/router";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

const frequencies = [
  { value: "WEEKLY", label: "Weekly" },
  { value: "BIWEEKLY", label: "Every 2 weeks" },
  { value: "SEMI_MONTHLY", label: "Twice a month" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "QUARTERLY", label: "Quarterly" },
  { value: "ANNUALLY", label: "Yearly" },
  { value: "CUSTOM", label: "Custom interval" },
] as const;

const createPayableSchema = z
  .object({
    title: z.string().min(1, "Bill name is required"),
    provider: z.string().optional(),
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

type PayableFormValues = z.infer<typeof createPayableSchema>;

export default function PayableCreateForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PayableFormValues>({
    resolver: zodResolver(createPayableSchema),
    defaultValues: {
      isRecurring: false,
      reminderDaysBefore: "3",
    },
  });

  const isRecurring = watch("isRecurring");

  const onSubmit = async (data: PayableFormValues) => {
    try {
      setError(null);

      const payload = {
        title: data.title,
        provider: data.provider || undefined,
        amountPerPeriod: parseFloat(data.amountPerPeriod),
        isRecurring: data.isRecurring,
        recurrenceFrequency: data.isRecurring
          ? data.recurrenceFrequency
          : undefined,
        startDate: data.startDate,
        dueDate: data.isRecurring ? undefined : data.startDate,
        endDate: data.isRecurring ? data.endDate || undefined : undefined,
        reminderDaysBefore: data.isRecurring
          ? parseInt(data.reminderDaysBefore || "3", 10)
          : undefined,
        notes: data.notes || undefined,
      };

      await api.post("/payables", payload);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Something went wrong saving this bill",
      );
    }
  };

  return (
    <div className="relative min-h-dvh w-full bg-background pb-24">
      {/* Background decoration */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[400px] w-[400px] max-w-[90vw] rounded-full bg-gradient-to-b from-ube/8 to-mango/5 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-lg px-4 py-6">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to dashboard
        </Link>

        <Card className="border-t-[3px] border-t-ube shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-foreground">
              Add a bill
            </CardTitle>
            <CardDescription>
              Enter the details and we&apos;ll track it for you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-5"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
              {/* Title */}
              <div className="space-y-1.5">
                <Label htmlFor="title">Bill name</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="e.g. Apartment rent"
                  className="h-11"
                  aria-invalid={!!errors.title}
                  aria-describedby={errors.title ? "title-error" : undefined}
                  {...register("title")}
                />
                {errors.title && (
                  <p id="title-error" className="text-xs text-danger" role="alert">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Provider */}
              <div className="space-y-1.5">
                <Label htmlFor="provider">Provider (optional)</Label>
                <Input
                  id="provider"
                  type="text"
                  placeholder="e.g. Meralco, Globe"
                  className="h-11"
                  aria-invalid={!!errors.provider}
                  aria-describedby={
                    errors.provider ? "provider-error" : undefined
                  }
                  {...register("provider")}
                />
                {errors.provider && (
                  <p
                    id="provider-error"
                    className="text-xs text-danger"
                    role="alert"
                  >
                    {errors.provider.message}
                  </p>
                )}
              </div>

              {/* Amount */}
              <div className="space-y-1.5">
                <Label htmlFor="amountPerPeriod">Amount</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    ₱
                  </span>
                  <Input
                    id="amountPerPeriod"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    className="h-11 pl-7"
                    aria-invalid={!!errors.amountPerPeriod}
                    aria-describedby={
                      errors.amountPerPeriod ? "amount-error" : undefined
                    }
                    {...register("amountPerPeriod")}
                  />
                </div>
                {errors.amountPerPeriod && (
                  <p
                    id="amount-error"
                    className="text-xs text-danger"
                    role="alert"
                  >
                    {errors.amountPerPeriod.message}
                  </p>
                )}
              </div>

              {/* Recurring toggle */}
              <fieldset>
                <legend className="text-sm font-medium leading-none mb-2">
                  How often?
                </legend>
                <div className="flex gap-2">
                  <button
                    type="button"
                    role="radio"
                    aria-checked={!isRecurring}
                    onClick={() => setValue("isRecurring", false, { shouldValidate: true })}
                    className={`flex-1 cursor-pointer rounded-lg border px-3 py-2.5 text-center text-sm font-medium transition-all ${
                      !isRecurring
                        ? "border-ube bg-ube/5 text-ube"
                        : "border-input bg-background text-muted-foreground hover:border-ube/30"
                    }`}
                  >
                    One-time
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={isRecurring}
                    onClick={() => setValue("isRecurring", true, { shouldValidate: true })}
                    className={`flex-1 cursor-pointer rounded-lg border px-3 py-2.5 text-center text-sm font-medium transition-all ${
                      isRecurring
                        ? "border-ube bg-ube/5 text-ube"
                        : "border-input bg-background text-muted-foreground hover:border-ube/30"
                    }`}
                  >
                    Recurring
                  </button>
                </div>
              </fieldset>

              {/* Conditional: Recurring fields */}
              {isRecurring && (
                <>
                  {/* Frequency */}
                  <div className="space-y-1.5">
                    <Label htmlFor="recurrenceFrequency">Frequency</Label>
                    <select
                      id="recurrenceFrequency"
                      className="h-11 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30"
                      aria-invalid={!!errors.recurrenceFrequency}
                      aria-describedby={
                        errors.recurrenceFrequency
                          ? "frequency-error"
                          : undefined
                      }
                      {...register("recurrenceFrequency")}
                    >
                      <option value="">Select frequency</option>
                      {frequencies.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                    {errors.recurrenceFrequency && (
                      <p
                        id="frequency-error"
                        className="text-xs text-danger"
                        role="alert"
                      >
                        {errors.recurrenceFrequency.message}
                      </p>
                    )}
                  </div>

                  {/* Start date */}
                  <div className="space-y-1.5">
                    <Label htmlFor="startDate">Start date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      className="h-11"
                      aria-invalid={!!errors.startDate}
                      aria-describedby={
                        errors.startDate ? "start-date-error" : undefined
                      }
                      {...register("startDate")}
                    />
                    {errors.startDate && (
                      <p
                        id="start-date-error"
                        className="text-xs text-danger"
                        role="alert"
                      >
                        {errors.startDate.message}
                      </p>
                    )}
                  </div>

                  {/* End date */}
                  <div className="space-y-1.5">
                    <Label htmlFor="endDate">End date (optional)</Label>
                    <Input
                      id="endDate"
                      type="date"
                      className="h-11"
                      aria-invalid={!!errors.endDate}
                      {...register("endDate")}
                    />
                  </div>

                  {/* Reminder days */}
                  <div className="space-y-1.5">
                    <Label htmlFor="reminderDaysBefore">
                      Remind me
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="reminderDaysBefore"
                        type="number"
                        min="1"
                        className="h-11 w-20"
                        aria-invalid={!!errors.reminderDaysBefore}
                        aria-describedby={
                          errors.reminderDaysBefore
                            ? "reminder-error"
                            : undefined
                        }
                        {...register("reminderDaysBefore")}
                      />
                      <span className="text-sm text-muted-foreground">
                        day{Number(watch("reminderDaysBefore")) !== 1 ? "s" : ""} before
                      </span>
                    </div>
                    {errors.reminderDaysBefore && (
                      <p
                        id="reminder-error"
                        className="text-xs text-danger"
                        role="alert"
                      >
                        {errors.reminderDaysBefore.message}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Conditional: One-time date */}
              {!isRecurring && (
                <div className="space-y-1.5">
                  <Label htmlFor="startDate">Due date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    className="h-11"
                    aria-invalid={!!errors.startDate}
                    aria-describedby={
                      errors.startDate ? "start-date-error" : undefined
                    }
                    {...register("startDate")}
                  />
                  {errors.startDate && (
                    <p
                      id="start-date-error"
                      className="text-xs text-danger"
                      role="alert"
                    >
                      {errors.startDate.message}
                    </p>
                  )}
                </div>
              )}

              {/* Notes */}
              <div className="space-y-1.5">
                <Label htmlFor="notes">Notes (optional)</Label>
                <textarea
                  id="notes"
                  rows={3}
                  placeholder="Any reminders for yourself..."
                  className="h-auto w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none md:text-sm dark:bg-input/30"
                  aria-invalid={!!errors.notes}
                  {...register("notes")}
                />
              </div>

              {/* Error banner */}
              {error && (
                <div className="rounded-md bg-danger/10 px-3 py-2" role="alert">
                  <p className="text-xs text-danger">{error}</p>
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                className="w-full h-12 text-base font-medium shadow-md shadow-ube/15 hover:shadow-lg hover:shadow-ube/25 transition-shadow"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                    Saving...
                  </span>
                ) : (
                  "Save bill"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

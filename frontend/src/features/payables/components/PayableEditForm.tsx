import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
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
import PayableFormFields from "./PayableFormFields";
import type { CategoryOption } from "./PayableFormFields";
import { payableFormSchema, type PayableFormValues } from "./payable-form-schema";

interface PayableEditFormProps {
  id: string;
}

interface PayableData {
  id: string;
  title: string;
  provider: string | null;
  categoryId: string | null;
  amountPerPeriod: number;
  isRecurring: boolean;
  recurrenceFrequency: string | null;
  startDate: string;
  endDate: string | null;
  reminderDaysBefore: number | null;
  notes: string | null;
}

export default function PayableEditForm({ id }: PayableEditFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get<CategoryOption[]>("/categories"),
    retry: false,
  });

  const {
    data: payable,
    isLoading: isLoadingPayable,
    error: fetchError,
  } = useQuery({
    queryKey: ["payable", id],
    queryFn: () => api.get<PayableData>(`/payables/${id}`),
    retry: false,
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PayableFormValues>({
    resolver: zodResolver(payableFormSchema),
    values: payable
      ? {
          title: payable.title,
          provider: payable.provider ?? "",
          categoryId: payable.categoryId ?? "",
          amountPerPeriod: String(payable.amountPerPeriod),
          isRecurring: payable.isRecurring,
          recurrenceFrequency: payable.recurrenceFrequency ?? "",
          startDate: payable.startDate?.split("T")[0] ?? "",
          endDate: payable.endDate?.split("T")[0] ?? "",
          reminderDaysBefore: String(payable.reminderDaysBefore ?? 3),
          notes: payable.notes ?? "",
        }
      : undefined,
  });

  const onSubmit = async (data: PayableFormValues) => {
    try {
      setError(null);

      const payload = {
        title: data.title,
        provider: data.provider || undefined,
        categoryId: data.categoryId || undefined,
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

      await api.put(`/payables/${id}`, payload);
      router.push("/payables");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong saving this bill",
      );
    }
  };

  if (isLoadingPayable) {
    return (
      <div className="mx-auto max-w-lg px-4 py-6">
        <div className="mb-4 h-4 w-32 animate-pulse motion-reduce:animate-none rounded-md bg-muted" />
        <div className="h-125 w-full animate-pulse motion-reduce:animate-none rounded-xl bg-muted" />
      </div>
    );
  }

  if (fetchError || !payable) {
    return (
      <div className="mx-auto max-w-lg px-4 py-6 text-center">
        <p className="text-danger">Could not load this bill.</p>
        <Link
          href="/payables"
          className="mt-4 inline-flex text-sm text-ube hover:underline"
        >
          Back to bills
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh w-full bg-background pb-24">
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-100 w-100 max-w-[90vw] rounded-full bg-linear-to-b from-ube/8 to-mango/5 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-lg px-4 py-6">
        <Link
          href="/payables"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to bills
        </Link>

        <Card className="border-t-[3px] border-t-ube shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-foreground">
              Edit bill
            </CardTitle>
            <CardDescription>
              Update the details for {payable.title}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-5"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
              <PayableFormFields
                register={register}
                errors={errors}
                control={control}
                setValue={setValue}
                categories={categories}
              />

              {error && (
                <div className="rounded-md bg-danger/10 px-3 py-2" role="alert">
                  <p className="text-xs text-danger">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 text-base font-medium shadow-md shadow-ube/15 hover:shadow-lg hover:shadow-ube/25 transition-shadow"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2
                      size={18}
                      className="animate-spin"
                      aria-hidden="true"
                    />
                    Saving...
                  </span>
                ) : (
                  "Save changes"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

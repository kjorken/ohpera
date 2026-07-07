import { useRouter } from "next/router";
import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/shared/lib/api";
import { useRequireAuth } from "@/shared/hooks/useRequireAuth";
import AppShell from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PeriodsTable from "@/features/payables/components/PeriodsTable";
import {
  Loader2,
  ArrowLeft,
  CircleAlert,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import type { PayableWithPeriods } from "@/features/payables/components/payable.types";

function formatPHP(amount: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

const detailFormSchema = z.object({
  title: z.string().min(1, "Bill name is required"),
  provider: z.string().optional(),
  notes: z.string().optional(),
});

type DetailFormValues = z.infer<typeof detailFormSchema>;

export default function PayableDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { isAuthed, isHydrated } = useRequireAuth();
  const queryClient = useQueryClient();
  const [topError, setTopError] = useState<string | null>(null);
  const [topSuccess, setTopSuccess] = useState(false);

  const { data: payable, isLoading } = useQuery({
    queryKey: ["payable", id],
    queryFn: () => api.get<PayableWithPeriods>(`/payables/${id}`),
    enabled: isAuthed && typeof id === "string",
    retry: false,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: isSavingTop },
  } = useForm<DetailFormValues>({
    resolver: zodResolver(detailFormSchema),
    values: payable
      ? {
          title: payable.title,
          provider: payable.provider ?? "",
          notes: payable.notes ?? "",
        }
      : undefined,
  });

  const saveMutation = useMutation({
    mutationFn: (data: DetailFormValues) =>
      api.put(`/payables/${id}`, {
        title: data.title,
        provider: data.provider || undefined,
        notes: data.notes || undefined,
      }),
    onSuccess: () => {
      setTopSuccess(true);
      setTopError(null);
      setTimeout(() => setTopSuccess(false), 3000);
    },
    onError: (err: Error) => {
      setTopError(err.message);
    },
  });

  const markPaidMutation = useMutation({
    mutationFn: () => api.post(`/payables/${id}/mark-paid`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payables"] });
      queryClient.invalidateQueries({ queryKey: ["payables", "archived"] });
      router.push("/payables");
    },
    onError: (err: Error) => {
      setTopError(err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/payables/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payables"] });
      queryClient.invalidateQueries({ queryKey: ["payables", "archived"] });
      router.push("/payables");
    },
    onError: (err: Error) => {
      setTopError(err.message);
    },
  });

  const periodUpdateMutation = useMutation({
    mutationFn: ({ periodId, amountPaid }: { periodId: string; amountPaid: number }) =>
      api.put(`/payment-periods/${periodId}`, { amountPaid }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payable", id] });
    },
  });

  const handlePeriodUpdate = useCallback(
    async (periodId: string, amountPaid: number) => {
      await periodUpdateMutation.mutateAsync({ periodId, amountPaid });
    },
    [periodUpdateMutation]
  );

  const onSaveTop = (data: DetailFormValues) => {
    saveMutation.mutate(data);
  };

  const handleMarkPaid = () => {
    if (window.confirm("Mark all periods as paid and archive this bill?")) {
      markPaidMutation.mutate();
    }
  };

  const handleDelete = () => {
    if (window.confirm("Delete this bill? This can't be undone.")) {
      deleteMutation.mutate();
    }
  };

  if (!isHydrated) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-4 h-4 w-32 animate-pulse motion-reduce:animate-none rounded-md bg-muted" />
        <div className="h-48 w-full animate-pulse motion-reduce:animate-none rounded-xl bg-muted" />
        <div className="mt-4 h-64 w-full animate-pulse motion-reduce:animate-none rounded-xl bg-muted" />
      </div>
    );
  }

  if (!isAuthed) return null;
  if (typeof id !== "string") return null;

  if (isLoading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-4xl px-4 py-6">
          <div className="mb-4 h-4 w-32 animate-pulse motion-reduce:animate-none rounded-md bg-muted" />
          <div className="h-48 w-full animate-pulse motion-reduce:animate-none rounded-xl bg-muted" />
          <div className="mt-4 h-64 w-full animate-pulse motion-reduce:animate-none rounded-xl bg-muted" />
        </div>
      </AppShell>
    );
  }

  if (!payable) {
    return (
      <AppShell>
        <div className="mx-auto max-w-4xl px-4 py-6 text-center">
          <div className="mb-3 flex justify-center">
            <CircleAlert className="text-danger" size={32} aria-hidden="true" />
          </div>
          <p className="text-lg font-medium text-foreground">Bill not found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            This bill may have been deleted or doesn&apos;t exist.
          </p>
          <Link
            href="/payables"
            className="mt-4 inline-flex text-sm font-medium text-ube hover:underline"
          >
            Back to bills
          </Link>
        </div>
      </AppShell>
    );
  }

  const totalDue = payable.paymentPeriods.reduce(
    (sum, p) => sum + Number(p.amountDue),
    0
  );
  const totalPaid = payable.paymentPeriods.reduce(
    (sum, p) => sum + Number(p.amountPaid),
    0
  );
  const remaining = totalDue - totalPaid;
  const catColor = payable.category?.color ?? "#6D4C8C";

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-6 md:px-6 md:py-8">
        {/* Back link */}
        <Link
          href="/payables"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to bills
        </Link>

        {/* Bill info card */}
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div
            className="h-1.5 w-full"
            style={{ backgroundColor: catColor }}
            aria-hidden="true"
          />

          <div className="p-4 md:p-6">
            <form onSubmit={handleSubmit(onSaveTop)}>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="title">Bill name</Label>
                  <Input
                    id="title"
                    type="text"
                    className="h-11"
                    aria-invalid={!!errors.title}
                    {...register("title")}
                  />
                  {errors.title && (
                    <p className="text-xs text-danger" role="alert">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="provider">Provider (optional)</Label>
                  <Input
                    id="provider"
                    type="text"
                    className="h-11"
                    {...register("provider")}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Start date</Label>
                    <p className="text-sm font-medium text-foreground">
                      {formatDate(payable.startDate)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">End date</Label>
                    <p className="text-sm font-medium text-foreground">
                      {payable.endDate ? formatDate(payable.endDate) : "No end date"}
                    </p>
                  </div>
                </div>

                {payable.category && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Category</Label>
                    <div className="mt-1 flex items-center gap-1.5">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: catColor }}
                        aria-hidden="true"
                      />
                      <span className="text-sm font-medium text-foreground">
                        {payable.category.name}
                      </span>
                    </div>
                  </div>
                )}

                {/* Remaining balance (only for end-dated) */}
                {payable.endDate && (
                  <div className="rounded-lg bg-muted/50 px-4 py-3">
                    <p className="text-xs text-muted-foreground">Remaining balance</p>
                    <p
                      className={`text-lg font-bold tabular-nums ${
                        remaining > 0 ? "text-foreground" : "text-success"
                      }`}
                    >
                      {remaining > 0 ? formatPHP(remaining) : "Fully paid"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      of {formatPHP(totalDue)} total &middot; {formatPHP(totalPaid)} paid
                    </p>
                  </div>
                )}

                {/* Amount per period */}
                {!payable.endDate && (
                  <div className="rounded-lg bg-muted/50 px-4 py-3">
                    <p className="text-xs text-muted-foreground">Amount per period</p>
                    <p className="text-lg font-bold tabular-nums text-foreground">
                      {formatPHP(Number(payable.amountPerPeriod))}
                    </p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <textarea
                    id="notes"
                    rows={3}
                    className="h-auto w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none md:text-sm dark:bg-input/30"
                    {...register("notes")}
                  />
                </div>
              </div>

              {topError && (
                <div className="mt-4 rounded-md bg-danger/10 px-3 py-2" role="alert">
                  <p className="text-xs text-danger">{topError}</p>
                </div>
              )}

              {topSuccess && (
                <div className="mt-4 rounded-md bg-success/10 px-3 py-2" role="status">
                  <p className="flex items-center gap-1.5 text-xs text-success">
                    <CheckCircle2 size={14} aria-hidden="true" />
                    Changes saved
                  </p>
                </div>
              )}

              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button
                  type="submit"
                  className="h-11 flex-1 shadow-md shadow-ube/15"
                  disabled={isSavingTop}
                >
                  {isSavingTop ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                      Saving...
                    </span>
                  ) : (
                    "Save changes"
                  )}
                </Button>

                {!payable.isArchived && (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 border-success/30 text-success hover:bg-success/5 hover:text-success"
                    onClick={handleMarkPaid}
                    disabled={markPaidMutation.isPending}
                  >
                    {markPaidMutation.isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                        Processing...
                      </span>
                    ) : (
                      <>
                        <CheckCircle2 size={16} className="mr-1.5" aria-hidden="true" />
                        Mark paid
                      </>
                    )}
                  </Button>
                )}

                <Button
                  type="button"
                  variant="outline"
                  className="h-11 border-danger/30 text-danger hover:bg-danger/5 hover:text-danger"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? (
                    <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  ) : (
                    <>
                      <Trash2 size={16} className="mr-1.5" aria-hidden="true" />
                      Delete
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Periods table */}
        <div className="mt-6">
          <h2 className="mb-3 text-sm font-semibold text-foreground">
            Payment periods
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              ({payable.paymentPeriods.length} period{payable.paymentPeriods.length !== 1 ? "s" : ""})
            </span>
          </h2>
          <PeriodsTable
            periods={payable.paymentPeriods}
            onPeriodUpdate={handlePeriodUpdate}
          />
        </div>
      </div>
    </AppShell>
  );
}

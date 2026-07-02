import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  ListTodo,
  Repeat2,
  Archive,
  Trash2,
  Pencil,
  CircleAlert,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  color: string | null;
}

interface PaymentPeriod {
  id: string;
  dueDate: string;
  amountDue: number;
  amountPaid: number;
  status: "OUTSTANDING" | "PARTIAL" | "PAID" | "OVERDUE";
}

interface PayableWithPeriods {
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

function formatPHP(amount: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function daysUntil(date: string): number {
  const diff = new Date(date).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

const frequencyLabels: Record<string, string> = {
  WEEKLY: "Weekly",
  BIWEEKLY: "Every 2 weeks",
  SEMI_MONTHLY: "Twice a month",
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  ANNUALLY: "Yearly",
  CUSTOM: "Custom",
};

function getNextPeriod(periods: PaymentPeriod[]): PaymentPeriod | null {
  const now = new Date();
  const upcoming = periods
    .filter((p) => new Date(p.dueDate) >= now)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  if (upcoming.length > 0) return upcoming[0];
  const overdue = periods
    .filter((p) => p.status === "OVERDUE" || new Date(p.dueDate) < now)
    .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
  return overdue[0] ?? null;
}

function PayableRow({
  payable,
  onArchive,
  onDelete,
}: {
  payable: PayableWithPeriods;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const nextPeriod = getNextPeriod(payable.paymentPeriods);
  const isOverdue =
    nextPeriod != null &&
    (nextPeriod.status === "OVERDUE" || daysUntil(nextPeriod.dueDate) < 0);
  const catColor = payable.category?.color ?? "#6D4C8C";

  return (
    <>
      {/* Mobile layout */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3.5 last:border-b-0 md:hidden">
        <div
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: isOverdue ? "#DC2626" : catColor }}
          aria-hidden="true"
        />

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center justify-between gap-3">
            <p className="truncate text-sm font-semibold text-foreground">
              {payable.title}
            </p>
            <p className="shrink-0 text-sm font-bold tabular-nums text-foreground">
              {formatPHP(Number(payable.amountPerPeriod))}
            </p>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <span className="truncate text-xs text-muted-foreground">
                {payable.provider ?? payable.category?.name ?? "Uncategorized"}
              </span>
              {payable.isRecurring && (
                <span className="inline-flex items-center gap-1 rounded-full bg-ube/8 px-1.5 py-0.5 text-[10px] font-medium text-ube whitespace-nowrap">
                  <Repeat2 size={10} aria-hidden="true" />
                  {frequencyLabels[payable.recurrenceFrequency ?? ""] ?? "Recurring"}
                </span>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {nextPeriod && (
                <span
                  className={`text-xs font-medium whitespace-nowrap ${
                    isOverdue ? "text-danger" : "text-muted-foreground"
                  }`}
                >
                  {isOverdue
                    ? `${Math.abs(daysUntil(nextPeriod.dueDate))}d overdue`
                    : `${formatDate(nextPeriod.dueDate)}`}
                </span>
              )}
              <Link
                href={`/payables/${payable.id}/edit`}
                className="p-1 text-muted-foreground hover:text-ube transition-colors"
                aria-label={`Edit ${payable.title}`}
              >
                <Pencil size={15} />
              </Link>
              <button
                type="button"
                className="p-1 text-muted-foreground hover:text-ube transition-colors"
                aria-label={`Archive ${payable.title}`}
                onClick={() => onArchive(payable.id)}
              >
                <Archive size={15} />
              </button>
              <button
                type="button"
                className="p-1 text-muted-foreground hover:text-danger transition-colors"
                aria-label={`Delete ${payable.title}`}
                onClick={() => onDelete(payable.id)}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden items-center gap-4 border-b border-border px-4 py-3 text-sm last:border-b-0 md:grid md:grid-cols-[auto_2fr_1fr_120px_120px_80px]">
        <div
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: isOverdue ? "#DC2626" : catColor }}
          aria-hidden="true"
        />
        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground">
            {payable.title}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {payable.provider ?? payable.category?.name ?? "Uncategorized"}
          </p>
        </div>
        <p className="font-bold tabular-nums text-foreground">
          {formatPHP(Number(payable.amountPerPeriod))}
        </p>
        <span className="text-xs text-muted-foreground">
          {payable.isRecurring
            ? (frequencyLabels[payable.recurrenceFrequency ?? ""] ?? "Recurring")
            : "One-time"}
        </span>
        <span className={`text-xs font-medium ${isOverdue ? "text-danger" : "text-muted-foreground"}`}>
          {nextPeriod
            ? isOverdue
              ? `${Math.abs(daysUntil(nextPeriod.dueDate))}d overdue`
              : formatDate(nextPeriod.dueDate)
            : "—"}
        </span>
        <div className="flex items-center gap-1">
          <Link
            href={`/payables/${payable.id}/edit`}
            className="p-1.5 text-muted-foreground hover:text-ube transition-colors rounded-md hover:bg-ube/5"
            aria-label={`Edit ${payable.title}`}
          >
            <Pencil size={15} />
          </Link>
          <button
            type="button"
            className="p-1.5 text-muted-foreground hover:text-ube transition-colors rounded-md hover:bg-ube/5"
            aria-label={`Archive ${payable.title}`}
            onClick={() => onArchive(payable.id)}
          >
            <Archive size={15} />
          </button>
          <button
            type="button"
            className="p-1.5 text-muted-foreground hover:text-danger transition-colors rounded-md hover:bg-danger/5"
            aria-label={`Delete ${payable.title}`}
            onClick={() => onDelete(payable.id)}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </>
  );
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse motion-reduce:animate-none rounded-md bg-muted ${className ?? ""}`}
      aria-hidden="true"
    />
  );
}

export default function PayableList() {
  const queryClient = useQueryClient();

  const { data: payables, isLoading } = useQuery({
    queryKey: ["payables"],
    queryFn: () => api.get<PayableWithPeriods[]>("/payables"),
    retry: false,
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => api.put(`/payables/${id}/archive`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payables"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/payables/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payables"] });
    },
  });

  const handleArchive = (id: string) => {
    archiveMutation.mutate(id);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this bill? This can't be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:px-6 md:py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between md:mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Bills</h1>
          <p className="mt-1 text-sm text-muted-foreground md:text-base">
            {payables?.length
              ? `${payables.length} bill${payables.length !== 1 ? "s" : ""} to track`
              : "All your bills in one place"}
          </p>
        </div>
        <Link href="/payables/new">
          <Button className="h-11 shadow-md shadow-ube/15 hover:shadow-lg hover:shadow-ube/25 transition-shadow md:h-12 md:px-6 md:text-base">
            <Plus size={18} className="mr-1.5" aria-hidden="true" />
            Add a bill
          </Button>
        </Link>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3 rounded-xl border border-border bg-card px-4 py-4" aria-label="Loading bills">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && payables?.length === 0 && (
        <Card className="border-dashed border-muted-foreground/30">
          <CardHeader className="items-center pb-2 pt-8 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ube/10">
              <ListTodo className="text-ube" size={24} aria-hidden="true" />
            </div>
            <CardTitle className="font-display text-xl text-foreground">No bills yet</CardTitle>
            <CardDescription className="mx-auto max-w-xs">
              Add your first bill and we&apos;ll track it across pay cycles.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-8">
            <Link href="/payables/new">
              <Button>
                <Plus size={18} className="mr-1.5" aria-hidden="true" />
                Add a bill
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* List */}
      {!isLoading && payables && payables.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border bg-card" role="list">
          {/* Desktop header */}
          <div className="hidden items-center gap-4 border-b border-border bg-muted/30 px-4 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground md:grid md:grid-cols-[auto_2fr_1fr_120px_120px_80px]">
            <div />
            <div>Bill</div>
            <div>Amount</div>
            <div>Frequency</div>
            <div>Next Due</div>
            <div>Actions</div>
          </div>
          {payables.map((payable) => (
            <div key={payable.id} role="listitem">
              <PayableRow payable={payable} onArchive={handleArchive} onDelete={handleDelete} />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {!isLoading && payables === undefined && (
        <Card className="border-danger/30">
          <CardHeader className="items-center pt-8 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-danger/10">
              <CircleAlert className="text-danger" size={24} aria-hidden="true" />
            </div>
            <CardTitle className="text-xl text-foreground">Couldn&apos;t load bills</CardTitle>
            <CardDescription className="mx-auto max-w-xs">
              Something went wrong. Try refreshing the page.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}

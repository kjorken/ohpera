import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  ListTodo,
  Calendar,
  Repeat2,
  Archive,
  Trash2,
  CircleAlert,
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

function getNextPeriod(
  periods: PaymentPeriod[],
): PaymentPeriod | null {
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
  const catColor = payable.category?.color ?? "#6B6056";

  return (
    <div className="group relative flex flex-col gap-3 rounded-xl border border-border bg-card px-4 py-4 transition-all duration-200 hover:shadow-md hover:border-ube/20">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div
            className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: catColor }}
            aria-hidden="true"
          />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="truncate text-sm font-semibold text-foreground">
              {payable.title}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {payable.provider ?? payable.category?.name ?? "Uncategorized"}
            </p>
          </div>
        </div>

        <p className="shrink-0 text-sm font-bold tabular-nums text-foreground">
          {formatPHP(Number(payable.amountPerPeriod))}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {payable.isRecurring && (
          <span className="inline-flex items-center gap-1 rounded-full bg-ube/8 px-2 py-0.5 text-xs font-medium text-ube">
            <Repeat2 size={12} aria-hidden="true" />
            {frequencyLabels[payable.recurrenceFrequency ?? ""] ?? "Recurring"}
          </span>
        )}

        {nextPeriod && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
              isOverdue
                ? "bg-danger/10 text-danger"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <Calendar size={12} aria-hidden="true" />
            <time dateTime={nextPeriod.dueDate}>
              {isOverdue
                ? `${Math.abs(daysUntil(nextPeriod.dueDate))}d overdue`
                : `${formatDate(nextPeriod.dueDate)}`}
            </time>
          </span>
        )}

        {nextPeriod && !isOverdue && (
          <span className="text-xs text-muted-foreground">
            ({daysUntil(nextPeriod.dueDate)} day
            {daysUntil(nextPeriod.dueDate) !== 1 ? "s" : ""} left)
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 border-t border-border pt-2.5">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground hover:text-ube h-8"
          onClick={() => onArchive(payable.id)}
        >
          <Archive size={14} className="mr-1" aria-hidden="true" />
          Archive
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground hover:text-danger h-8"
          onClick={() => onDelete(payable.id)}
        >
          <Trash2 size={14} className="mr-1" aria-hidden="true" />
          Delete
        </Button>
      </div>
    </div>
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
    <div className="relative min-h-dvh w-full bg-background pb-24">
      {/* Background decoration */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[400px] w-[400px] max-w-[90vw] rounded-full bg-gradient-to-b from-ube/8 to-mango/5 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-2xl px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Bills
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {payables?.length
                ? `${payables.length} bill${payables.length !== 1 ? "s" : ""} to track`
                : "All your bills in one place"}
            </p>
          </div>
          <Link href="/payables/new">
            <Button className="h-11 shadow-md shadow-ube/15 hover:shadow-lg hover:shadow-ube/25 transition-shadow">
              <Plus size={18} className="mr-1.5" aria-hidden="true" />
              Add a bill
            </Button>
          </Link>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="space-y-3" aria-label="Loading bills">
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && payables?.length === 0 && (
          <Card className="border-dashed border-muted-foreground/30">
            <CardHeader className="items-center pb-2 pt-8 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ube/10">
                <ListTodo className="text-ube" size={24} aria-hidden="true" />
              </div>
              <CardTitle className="font-display text-xl text-foreground">
                No bills yet
              </CardTitle>
              <CardDescription className="max-w-xs mx-auto">
                Add your first bill and we&apos;ll track it across pay cycles.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-8">
              <Link href="/payables/new">
                <Button className="shadow-md shadow-ube/15 hover:shadow-lg hover:shadow-ube/25 transition-shadow">
                  <Plus size={18} className="mr-1.5" aria-hidden="true" />
                  Add a bill
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Payables list */}
        {!isLoading && payables && payables.length > 0 && (
          <div className="space-y-3" role="list">
            {payables.map((payable) => (
              <div key={payable.id} role="listitem">
                <PayableRow
                  payable={payable}
                  onArchive={handleArchive}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>
        )}

        {/* API error */}
        {!isLoading && payables === undefined && (
          <Card className="border-danger/30">
            <CardHeader className="items-center pt-8 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-danger/10">
                <CircleAlert className="text-danger" size={24} aria-hidden="true" />
              </div>
              <CardTitle className="text-xl text-foreground">
                Couldn&apos;t load bills
              </CardTitle>
              <CardDescription className="max-w-xs mx-auto">
                Something went wrong. Try refreshing the page.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}

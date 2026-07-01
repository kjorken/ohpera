import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/lib/api";
import { useRequireAuth } from "@/shared/hooks/useRequireAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  Clock,
  Plus,
  CircleAlert,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";

interface Category {
  id: string;
  name: string;
  color: string | null;
}

interface Payable {
  id: string;
  title: string;
  provider: string | null;
  amountPerPeriod: number;
  category: Category | null;
}

interface PaymentPeriod {
  id: string;
  dueDate: string;
  amountDue: number;
  amountPaid: number;
  status: "OUTSTANDING" | "PARTIAL" | "PAID" | "OVERDUE";
  payable: Payable;
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

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse motion-reduce:animate-none rounded-md bg-muted ${className ?? ""}`}
      aria-hidden="true"
    />
  );
}

function PaymentRow({ period }: { period: PaymentPeriod }) {
  const days = daysUntil(period.dueDate);
  const isOverdue = period.status === "OVERDUE" || days < 0;
  const catColor = period.payable.category?.color ?? "#6D4C8C";

  return (
    <div className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0 transition-colors hover:bg-muted/20 md:gap-4 md:px-5 md:py-3.5">
      <div
        className="h-2 w-2 shrink-0 rounded-full md:h-2.5 md:w-2.5"
        style={{ backgroundColor: isOverdue ? "#DC2626" : catColor }}
        aria-hidden="true"
      />
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-1 md:flex-row md:items-center md:gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium text-foreground md:text-base">
              {period.payable.title}
            </p>
            {isOverdue && (
              <span className="shrink-0 rounded-full bg-danger/10 px-1.5 py-0.5 text-[10px] font-semibold text-danger md:text-xs">
                Overdue
              </span>
            )}
          </div>
          <p className="truncate text-xs text-muted-foreground md:text-sm">
            {period.payable.provider ?? period.payable.category?.name ?? "Uncategorized"}
            <span className="mx-1 hidden md:inline">&middot;</span>
            <span className="hidden md:inline">
              <time dateTime={period.dueDate}>{formatDate(period.dueDate)}</time>
            </span>
          </p>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <p className={`text-sm font-bold tabular-nums md:text-base ${isOverdue ? "text-danger" : "text-foreground"}`}>
            {formatPHP(Number(period.amountDue))}
          </p>
          <p className={`text-xs md:text-sm ${isOverdue ? "text-danger font-medium" : "text-muted-foreground"}`}>
            {isOverdue
              ? `${Math.abs(days)}d overdue`
              : `${days}d left`}
          </p>
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  title,
  desc,
  action,
}: {
  title: string;
  desc: string;
  action?: { label: string; href: string };
}) {
  return (
    <Card className="border-dashed border-muted-foreground/30">
      <CardHeader className="items-center pb-2 pt-8 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ube/10">
          <CircleAlert className="text-ube" size={24} aria-hidden="true" />
        </div>
        <CardTitle className="font-display text-xl text-foreground">{title}</CardTitle>
        <CardDescription className="max-w-xs mx-auto">{desc}</CardDescription>
      </CardHeader>
      {action && (
        <CardContent className="flex justify-center pb-8">
          <Link href={action.href}>
            <Button>
              <Plus size={16} className="mr-1.5" aria-hidden="true" />
              {action.label}
            </Button>
          </Link>
        </CardContent>
      )}
    </Card>
  );
}

export default function Dashboard() {
  const { isAuthed, isHydrated } = useRequireAuth();

  const upcoming = useQuery({
    queryKey: ["payments", "upcoming"],
    queryFn: () => api.get<PaymentPeriod[]>("/payables/upcoming"),
    enabled: isAuthed,
    retry: false,
  });

  const overdue = useQuery({
    queryKey: ["payments", "overdue"],
    queryFn: () => api.get<PaymentPeriod[]>("/payables/overdue"),
    enabled: isAuthed,
    retry: false,
  });

  const payables = useQuery({
    queryKey: ["payables"],
    queryFn: () => api.get<Payable[]>("/payables"),
    enabled: isAuthed,
    retry: false,
  });

  if (!isHydrated) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
        <div className="mb-6 rounded-2xl bg-linear-to-br from-ube/10 to-mango/5 p-5 sm:p-6 md:p-8">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-2 h-7 w-44 sm:h-8 sm:w-52 md:h-9 md:w-60" />
          <Skeleton className="mt-1 h-3 w-28 sm:h-4 sm:w-32" />
        </div>
        <div className="mb-6 grid grid-cols-2 gap-3 md:gap-4">
          <Skeleton className="h-20 rounded-xl md:h-24" />
          <Skeleton className="h-20 rounded-xl md:h-24" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!isAuthed) return null;

  const totalUpcoming = upcoming.data?.reduce(
    (sum, p) => sum + Number(p.amountDue),
    0,
  ) ?? 0;
  const totalOverdue = overdue.data?.reduce(
    (sum, p) => sum + Number(p.amountDue),
    0,
  ) ?? 0;
  const totalPayables = payables.data?.length ?? 0;
  const settingsMissing =
    upcoming.error && !upcoming.isLoading &&
    upcoming.error instanceof Error &&
    upcoming.error.message.toLowerCase().includes("settings");

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-6 md:px-6 md:py-8">
        {/* Hero section */}
        <div className="mb-6 overflow-hidden rounded-2xl bg-linear-to-br from-ube/10 via-ube/5 to-mango/5 px-5 py-5 sm:px-6 sm:py-6 md:px-8 md:py-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-ube">
                Due this sweldo
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
                {formatPHP(totalUpcoming)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                {upcoming.data
                  ? `${upcoming.data.length} bill${upcoming.data.length !== 1 ? "s" : ""} to pay`
                  : "No bills due"}
              </p>
            </div>
            <Link href="/payables/new">
              <Button className="mt-2 h-10 shadow-md shadow-ube/15 sm:mt-0 sm:h-10 md:h-11">
                <Plus size={16} className="mr-1.5" aria-hidden="true" />
                Add a bill
              </Button>
            </Link>
          </div>
        </div>

        {/* Summary cards */}
        <div className="mb-6 grid grid-cols-2 gap-3 md:gap-4">
          <Link href="/payables">
            <div className="rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:bg-danger/10 hover:shadow-sm md:px-5 md:py-4">
              <p className="text-xs font-medium text-danger/80 md:text-sm">Overdue</p>
              <p className="mt-1 text-lg font-bold tabular-nums text-danger md:text-2xl">
                {formatPHP(totalOverdue)}
              </p>
              <p className="mt-0.5 text-xs text-danger/60 md:text-sm">
                {overdue.data?.length ?? 0} bill{(overdue.data?.length ?? 0) !== 1 ? "s" : ""} past due
              </p>
            </div>
          </Link>
          <Link href="/payables">
            <div className="rounded-xl border border-mango/20 bg-mango/5 px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:bg-mango/10 hover:shadow-sm md:px-5 md:py-4">
              <p className="text-xs font-medium text-mango-dark/80 md:text-sm">Active bills</p>
              <p className="mt-1 text-lg font-bold tabular-nums text-mango-dark md:text-2xl">
                {totalPayables}
              </p>
              <p className="mt-0.5 text-xs text-mango-dark/60 md:text-sm">
                total tracked
              </p>
            </div>
          </Link>
        </div>

        {/* Settings missing prompt */}
        {settingsMissing && (
          <div className="mb-6 rounded-xl bg-ube/5 px-4 py-4">
            <h3 className="font-display text-lg font-bold text-foreground">
              Set your payday schedule
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Tell us when your sweldo lands so we can group your bills by cycle.
            </p>
            <Link href="/settings">
              <Button variant="outline" className="mt-3">
                Go to Settings
              </Button>
            </Link>
          </div>
        )}

        {/* Loading */}
        {upcoming.isLoading || overdue.isLoading ? (
          <div className="space-y-3 rounded-xl bg-card px-4 py-4" aria-label="Loading payments">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        ) : (
          <div className="space-y-6 md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
            {/* Upcoming section */}
            {!settingsMissing && upcoming.data && upcoming.data.length > 0 && (
              <section aria-labelledby="upcoming-heading">
                <div className="mb-2 flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <Wallet size={16} className="text-ube" aria-hidden="true" />
                    <h2 id="upcoming-heading" className="text-sm font-semibold text-foreground md:text-base">
                      Upcoming
                    </h2>
                    <span className="rounded-full bg-ube/10 px-2 py-0.5 text-xs font-medium text-ube">
                      {upcoming.data.length}
                    </span>
                  </div>
                  <Link
                    href="/payables"
                    className="flex items-center gap-0.5 text-xs font-medium text-ube hover:underline md:text-sm"
                  >
                    See all
                    <ChevronRight size={14} aria-hidden="true" />
                  </Link>
                </div>
                <div className="overflow-hidden rounded-xl border border-border bg-card">
                  {upcoming.data.map((period) => (
                    <PaymentRow key={period.id} period={period} />
                  ))}
                </div>
              </section>
            )}

            {/* Empty state */}
            {!settingsMissing && upcoming.data?.length === 0 && !upcoming.isLoading && (
              <div className="md:col-span-2">
                <EmptyState
                  title="Nothing due right now"
                  desc="No bills due in this pay period. Add a bill to get started."
                  action={{ label: "Add a bill", href: "/payables/new" }}
                />
              </div>
            )}

            {/* Overdue section */}
            {overdue.data && overdue.data.length > 0 && (
              <section aria-labelledby="overdue-heading">
                <div className="mb-2 flex items-center gap-2 px-1">
                  <Clock size={16} className="text-danger" aria-hidden="true" />
                  <h2 id="overdue-heading" className="text-sm font-semibold text-danger md:text-base">
                    Overdue
                  </h2>
                  <span className="rounded-full bg-danger/10 px-2 py-0.5 text-xs font-medium text-danger">
                    {overdue.data.length}
                  </span>
                </div>
                <div className="overflow-hidden rounded-xl border border-danger/20 bg-card">
                  {overdue.data.map((period) => (
                    <PaymentRow key={period.id} period={period} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}

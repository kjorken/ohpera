import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/shared/lib/api";
import { useRequireAuth } from "@/shared/hooks/useRequireAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, PiggyBank, ArrowDown, Plus, CircleAlert } from "lucide-react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";

interface CategoryInfo {
  id: string;
  name: string;
  color: string | null;
}

interface UpcomingPeriod {
  id: string;
  dueDate: string;
  amountDue: number;
  status: string;
  title: string;
  category: CategoryInfo | null;
}

interface BucketCycle {
  cycleStart: string;
  cycleEnd: string;
  totalIncome: number;
  totalBills: number;
  remaining: number;
  billsByCategory: { categoryId: string; categoryName: string; color: string | null; total: number }[];
  upcomingPeriods: UpcomingPeriod[];
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

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse motion-reduce:animate-none rounded-md bg-muted ${className ?? ""}`}
      aria-hidden="true"
    />
  );
}

export default function BucketsPage() {
  const { isAuthed, isHydrated } = useRequireAuth();
  const [now] = useState(() => Date.now());

  const { data, isLoading, error } = useQuery<BucketCycle>({
    queryKey: ["buckets", "current"],
    queryFn: () => api.get<BucketCycle>("/buckets/current"),
    enabled: isAuthed,
    retry: false,
  });

  if (!isHydrated) {
    return (
      <AppShell>
        <div className="mx-auto max-w-4xl px-4 py-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-4 h-32 rounded-xl" />
          <Skeleton className="mt-4 h-48 rounded-xl" />
        </div>
      </AppShell>
    );
  }

  if (!isAuthed) return null;

  const settingsMissing =
    error && !isLoading &&
    error instanceof Error &&
    error.message.toLowerCase().includes("settings");

  if (settingsMissing) {
    return (
      <AppShell>
        <div className="mx-auto max-w-4xl px-4 py-6">
          <Card className="border-dashed border-muted-foreground/30">
            <CardHeader className="items-center pb-2 pt-8 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-mango/10">
                <PiggyBank className="text-mango-dark" size={24} aria-hidden="true" />
              </div>
              <CardTitle className="font-display text-xl text-foreground">Set your payday schedule</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Tell us when your sweldo lands so we can calculate your bucket breakdown.
              </p>
            </CardHeader>
            <CardContent className="flex justify-center pb-8">
              <Link href="/settings">
                <Button>
                  <Plus size={16} className="mr-1.5" aria-hidden="true" />
                  Go to Settings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  if (error && !isLoading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-4xl px-4 py-6">
          <Card className="border-dashed border-danger/30">
            <CardHeader className="items-center pb-2 pt-8 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-danger/10">
                <CircleAlert className="text-danger" size={24} aria-hidden="true" />
              </div>
              <CardTitle className="font-display text-xl text-foreground">Something went wrong</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {error instanceof Error ? error.message : "Could not load bucket data."}
              </p>
            </CardHeader>
          </Card>
        </div>
      </AppShell>
    );
  }

  if (isLoading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-4xl px-4 py-6">
          <Skeleton className="h-8 w-48" />
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </div>
          <Skeleton className="mt-4 h-64 rounded-xl" />
        </div>
      </AppShell>
    );
  }

  if (!data) return null;

  const remainingPct = data.totalIncome > 0
    ? Math.round((data.remaining / data.totalIncome) * 100)
    : 0;

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-foreground">Buckets</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDate(data.cycleStart)} &mdash; {formatDate(data.cycleEnd)}
          </p>
        </div>

        {/* Summary cards */}
        <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
          <div className="rounded-xl border border-border bg-card px-4 py-4 md:px-5 md:py-5">
            <div className="flex items-center gap-2">
              <Wallet size={18} className="text-ube" aria-hidden="true" />
              <p className="text-xs font-medium text-muted-foreground md:text-sm">Income</p>
            </div>
            <p className="mt-2 text-xl font-bold tabular-nums text-foreground md:text-2xl">
              {formatPHP(data.totalIncome)}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card px-4 py-4 md:px-5 md:py-5">
            <div className="flex items-center gap-2">
              <ArrowDown size={18} className="text-danger" aria-hidden="true" />
              <p className="text-xs font-medium text-muted-foreground md:text-sm">Bills</p>
            </div>
            <p className="mt-2 text-xl font-bold tabular-nums text-danger md:text-2xl">
              {formatPHP(data.totalBills)}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card px-4 py-4 md:px-5 md:py-5">
            <div className="flex items-center gap-2">
              <PiggyBank size={18} className="text-success" aria-hidden="true" />
              <p className="text-xs font-medium text-muted-foreground md:text-sm">Remaining</p>
            </div>
            <p className={`mt-2 text-xl font-bold tabular-nums md:text-2xl ${data.remaining >= 0 ? "text-success" : "text-danger"}`}>
              {formatPHP(data.remaining)}
            </p>
          </div>
        </div>

        {/* Bills breakdown */}
        {data.billsByCategory.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="font-display text-lg text-foreground">Bills by category</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.billsByCategory.map((cat) => (
                <div key={cat.categoryId} className="flex items-center gap-3">
                  <div
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: cat.color ?? "#6D4C8C" }}
                    aria-hidden="true"
                  />
                  <div className="flex flex-1 items-center justify-between">
                    <p className="text-sm font-medium text-foreground">{cat.categoryName}</p>
                    <p className="text-sm font-bold tabular-nums text-foreground">
                      {formatPHP(cat.total)}
                    </p>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-3 border-t border-border pt-3">
                <div className="h-3 w-3 shrink-0 rounded-full bg-muted-foreground/30" aria-hidden="true" />
                <div className="flex flex-1 items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">Total</p>
                  <p className="text-sm font-bold tabular-nums text-foreground">
                    {formatPHP(data.totalBills)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Remaining bar */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="font-display text-lg text-foreground">Budget health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Bills take up</span>
              <span className="font-medium text-foreground">{100 - remainingPct}% of income</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-linear-to-r from-success via-mango to-danger transition-all"
                style={{ width: `${Math.min(100 - remainingPct, 100)}%` }}
                role="progressbar"
                aria-valuenow={100 - remainingPct}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            {remainingPct < 20 && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-danger">
                <CircleAlert size={14} aria-hidden="true" />
                Bills are eating most of your income. Consider cutting costs.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Upcoming bills */}
        {data.upcomingPeriods.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg text-foreground">
                Bills this cycle ({data.upcomingPeriods.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {data.upcomingPeriods.map((period) => {
                const catColor = period.category?.color ?? "#6D4C8C";
                const daysLeft = Math.ceil(
                  (new Date(period.dueDate).getTime() - now) / (1000 * 60 * 60 * 24),
                );
                return (
                  <div
                    key={period.id}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50"
                  >
                    <div
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: catColor }}
                      aria-hidden="true"
                    />
                    <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{period.title}</p>
                        <p className="text-xs text-muted-foreground">
                          <time dateTime={period.dueDate}>{formatDate(period.dueDate)}</time>
                          {daysLeft >= 0 && <span> &middot; {daysLeft}d left</span>}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-bold tabular-nums text-foreground">
                        {formatPHP(period.amountDue)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {data.upcomingPeriods.length === 0 && (
          <Card className="border-dashed border-muted-foreground/30">
            <CardHeader className="items-center pb-2 pt-8 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ube/10">
                <CircleAlert className="text-ube" size={24} aria-hidden="true" />
              </div>
              <CardTitle className="font-display text-xl text-foreground">No bills this cycle</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Nothing due in this pay period.
              </p>
            </CardHeader>
            <CardContent className="flex justify-center pb-8">
              <Link href="/payables/new">
                <Button>
                  <Plus size={16} className="mr-1.5" aria-hidden="true" />
                  Add a bill
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}

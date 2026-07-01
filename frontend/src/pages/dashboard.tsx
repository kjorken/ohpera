import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/lib/api";
import { useRequireAuth } from "@/shared/hooks/useRequireAuth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/shared/store/auth.store";
import {
  AlertTriangle,
  Wallet,
  Clock,
  ListTodo,
  Plus,
  CircleAlert,
  type LucideIcon,
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

function SummaryCard({
  title,
  value,
  subtext,
  icon: Icon,
  accent,
}: {
  title: string;
  value: string;
  subtext?: string;
  icon: LucideIcon;
  accent?: "danger" | "warning" | "success";
}) {
  return (
    <Card size="sm" className="transition-shadow duration-200 hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardDescription className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </CardDescription>
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
            accent === "danger"
              ? "bg-danger/10 text-danger"
              : accent === "success"
                ? "bg-success/10 text-success"
                : "bg-ube/10 text-ube"
          }`}
        >
          <Icon size={16} aria-hidden="true" />
        </div>
      </CardHeader>
      <CardContent>
        <p
          className={`text-2xl font-bold tabular-nums ${
            accent ? `text-${accent}` : "text-foreground"
          }`}
        >
          {value}
        </p>
        {subtext && (
          <p className="mt-1 text-xs text-muted-foreground">{subtext}</p>
        )}
      </CardContent>
    </Card>
  );
}

function PaymentRow({ period }: { period: PaymentPeriod }) {
  const days = daysUntil(period.dueDate);
  const isOverdue = period.status === "OVERDUE" || days < 0;
  const catColor = period.payable.category?.color ?? "#6B6056";

  return (
    <div className="group flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-ube/20">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: catColor }}
          aria-hidden="true"
        />
        {isOverdue && (
          <AlertTriangle
            className="shrink-0 text-danger"
            size={16}
            aria-hidden="true"
          />
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="truncate text-sm font-medium text-foreground">
            {period.payable.title}
          </p>
          <p className="text-xs text-muted-foreground">
            {period.payable.provider ?? period.payable.category?.name ?? "Uncategorized"}
            <span className="mx-1">&middot;</span>
            <time dateTime={period.dueDate}>{formatDate(period.dueDate)}</time>
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-0.5">
        <p className={`text-sm font-semibold tabular-nums ${isOverdue ? "text-danger" : "text-foreground"}`}>
          {formatPHP(Number(period.amountDue))}
        </p>
        <p className={`text-xs ${isOverdue ? "text-danger font-medium" : "text-muted-foreground"}`}>
          {isOverdue
            ? `${Math.abs(days)} day${Math.abs(days) !== 1 ? "s" : ""} overdue`
            : `${days} day${days !== 1 ? "s" : ""} left`}
        </p>
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
            <Button variant="outline" className="border-ube/30 text-ube hover:bg-ube/5 hover:border-ube/50">
              <Plus size={16} className="mr-1.5" aria-hidden="true" />
              {action.label}
            </Button>
          </Link>
        </CardContent>
      )}
    </Card>
  );
}

function SectionHeader({
  title,
  count,
  accent,
}: {
  title: string;
  count?: number;
  accent?: "danger" | "ube";
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`h-5 w-1 rounded-full ${accent === "danger" ? "bg-danger" : "bg-ube"}`}
        aria-hidden="true"
      />
      <h2
        className={`text-base font-semibold ${accent === "danger" ? "text-danger" : "text-foreground"}`}
      >
        {title}
      </h2>
      {count !== undefined && (
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {count}
        </span>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { isAuthed, isHydrated } = useRequireAuth();
  const user = useAuthStore((s) => s.user);

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
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8 space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!isAuthed) return null;

  return (
    <AppShell>
      <DashboardContent
        isAuthed={isAuthed}
        upcoming={upcoming}
        overdue={overdue}
        payables={payables}
        user={user}
      />
    </AppShell>
  );
}

function DashboardContent({
  isAuthed,
  upcoming,
  overdue,
  payables,
  user,
}: {
  isAuthed: boolean;
  upcoming: ReturnType<typeof useQuery<PaymentPeriod[]>>;
  overdue: ReturnType<typeof useQuery<PaymentPeriod[]>>;
  payables: ReturnType<typeof useQuery<Payable[]>>;
  user: { email: string } | null;
}) {
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
    <div className="relative mx-auto max-w-4xl px-4 py-8 pb-24">
      {/* Decorative blob */}
      <div
        className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-gradient-to-b from-ube/5 to-mango/3 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Hi there{user?.email ? `, ${user.email.split("@")[0]}` : ""}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Here&apos;s what&apos;s coming up
            </p>
          </div>
          <Link href="/payables/new">
            <Button className="h-11 shadow-md shadow-ube/15 hover:shadow-lg hover:shadow-ube/25 transition-shadow">
              <Plus size={18} className="mr-1.5" aria-hidden="true" />
              Add a bill
            </Button>
          </Link>
        </div>

        {/* Summary cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <SummaryCard
            title="Due this period"
            value={formatPHP(totalUpcoming)}
            icon={Wallet}
            subtext={
              upcoming.data
                ? `${upcoming.data.length} bill${upcoming.data.length !== 1 ? "s" : ""} to pay`
                : undefined
            }
            accent="success"
          />
          <SummaryCard
            title="Overdue"
            value={formatPHP(totalOverdue)}
            icon={Clock}
            subtext={
              overdue.data && overdue.data.length > 0
                ? `${overdue.data.length} bill${overdue.data.length !== 1 ? "s" : ""} past due`
                : "Nothing overdue"
            }
            accent={overdue.data && overdue.data.length > 0 ? "danger" : undefined}
          />
          <Link href="/payables" className="block transition-transform duration-200 hover:-translate-y-0.5">
            <SummaryCard
              title="Active bills"
              value={totalPayables.toString()}
              icon={ListTodo}
              subtext={totalPayables === 1 ? "1 bill to track" : `${totalPayables} bills to track`}
            />
          </Link>
        </div>

        {/* Content */}
        {upcoming.isLoading || overdue.isLoading ? (
          <div className="space-y-3" aria-label="Loading payments">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
          </div>
        ) : (
          <div className="space-y-8">
            {settingsMissing && (
              <Card className="border-t-[3px] border-t-ube shadow-md">
                <CardHeader>
                  <CardTitle className="font-display text-xl">Set your payday schedule</CardTitle>
                  <CardDescription>
                    Tell us when your payday falls so we can group your bills by cycle.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Head to Settings once it&apos;s ready to set your pay frequency and cycle start.
                  </p>
                  <Button variant="outline" disabled>
                    Settings (coming soon)
                  </Button>
                </CardContent>
              </Card>
            )}

            {!settingsMissing && upcoming.data && upcoming.data.length > 0 && (
              <section aria-labelledby="upcoming-heading">
                <SectionHeader title="Coming up" count={upcoming.data.length} />
                <div className="mt-3 space-y-2" role="list">
                  {upcoming.data.map((period) => (
                    <div key={period.id} role="listitem">
                      <PaymentRow period={period} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {!settingsMissing &&
              upcoming.data?.length === 0 &&
              !upcoming.isLoading && (
                <EmptyState
                  title="Nothing due right now"
                  desc="No bills due in this pay period. Add a bill to get started."
                  action={{ label: "Add a bill", href: "/payables/new" }}
                />
              )}

            {overdue.data && overdue.data.length > 0 && (
              <section aria-labelledby="overdue-heading">
                <SectionHeader title="Overdue" count={overdue.data.length} accent="danger" />
                <div className="mt-3 space-y-2" role="list">
                  {overdue.data.map((period) => (
                    <div key={period.id} role="listitem">
                      <PaymentRow period={period} />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

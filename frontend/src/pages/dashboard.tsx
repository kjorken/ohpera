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
import Link from "next/link";

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

function statusColor(status: string) {
  switch (status) {
    case "OVERDUE":
      return "text-danger";
    case "PARTIAL":
      return "text-warning";
    case "PAID":
      return "text-success";
    default:
      return "text-foreground";
  }
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted ${className ?? ""}`}
    />
  );
}

function SummaryCard({
  title,
  value,
  subtext,
  accent,
}: {
  title: string;
  value: string;
  subtext?: string;
  accent?: "danger" | "warning" | "success";
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription>{title}</CardDescription>
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

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate text-sm font-medium text-foreground">
          {period.payable.title}
        </p>
        <p className="text-xs text-muted-foreground">
          {period.payable.provider ?? period.payable.category?.name ?? "Uncategorized"}
          <span className="mx-1">&middot;</span>
          {formatDate(period.dueDate)}
        </p>
      </div>
      <div className="flex flex-col items-end gap-0.5">
        <p className={`text-sm font-semibold tabular-nums ${statusColor(period.status)}`}>
          {formatPHP(Number(period.amountDue))}
        </p>
        <p className={`text-xs ${isOverdue ? "text-danger" : "text-muted-foreground"}`}>
          {isOverdue ? `${Math.abs(days)} days overdue` : `${days} days left`}
        </p>
      </div>
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
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
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
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back, {user?.email?.split("@")[0] ?? "there"}
          </p>
        </div>
        <Link href="/payables/new">
          <Button>Add Payable</Button>
        </Link>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <SummaryCard
          title="Upcoming This Cycle"
          value={formatPHP(totalUpcoming)}
          subtext={
            upcoming.data
              ? `${upcoming.data.length} payment${upcoming.data.length !== 1 ? "s" : ""} due`
              : undefined
          }
          accent="success"
        />
        <SummaryCard
          title="Overdue"
          value={formatPHP(totalOverdue)}
          subtext={
            overdue.data && overdue.data.length > 0
              ? `${overdue.data.length} overdue payment${overdue.data.length !== 1 ? "s" : ""}`
              : "All caught up!"
          }
          accent={overdue.data && overdue.data.length > 0 ? "danger" : undefined}
        />
        <SummaryCard
          title="Total Payables"
          value={totalPayables.toString()}
          subtext="Active bills & subscriptions"
        />
      </div>

      {upcoming.isLoading || overdue.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
        </div>
      ) : (
        <div className="space-y-8">
          {settingsMissing && (
            <Card>
              <CardHeader>
                <CardTitle>Set up your payment cycle</CardTitle>
                <CardDescription>
                  Configure your salary cycle to see upcoming payments grouped by pay period.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">
                  Go to Settings to set your bucket frequency and cycle start date.
                </p>
                <Button variant="outline" disabled>
                  Settings (coming soon)
                </Button>
              </CardContent>
            </Card>
          )}

          {!settingsMissing && upcoming.data && upcoming.data.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold text-foreground">
                Upcoming Payments
              </h2>
              <div className="space-y-2">
                {upcoming.data.map((period) => (
                  <PaymentRow key={period.id} period={period} />
                ))}
              </div>
            </section>
          )}

          {!settingsMissing &&
            upcoming.data?.length === 0 &&
            !upcoming.isLoading && (
              <Card>
                <CardHeader>
                  <CardTitle>No upcoming payments</CardTitle>
                  <CardDescription>
                    You have no payments due in this cycle.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/payables/new">
                    <Button variant="outline">Add a payable</Button>
                  </Link>
                </CardContent>
              </Card>
            )}

          {overdue.data && overdue.data.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold text-danger">
                Overdue Payments
              </h2>
              <div className="space-y-2">
                {overdue.data.map((period) => (
                  <PaymentRow key={period.id} period={period} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

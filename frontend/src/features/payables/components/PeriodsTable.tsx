import { useState, useCallback, useRef } from "react";
import { Loader2, Check } from "lucide-react";
import type { PaymentPeriod } from "./payable.types";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function formatPHP(amount: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(amount);
}

const statusConfig: Record<
  string,
  { label: string; class: string; dot: string }
> = {
  PAID: {
    label: "Paid",
    class: "text-success bg-success/8",
    dot: "bg-success",
  },
  PARTIAL: {
    label: "Partial",
    class: "text-warning bg-warning/8",
    dot: "bg-warning",
  },
  OUTSTANDING: {
    label: "Outstanding",
    class: "text-muted-foreground bg-muted",
    dot: "bg-muted-foreground",
  },
  OVERDUE: {
    label: "Overdue",
    class: "text-danger bg-danger/8",
    dot: "bg-danger",
  },
};

interface Props {
  periods: PaymentPeriod[];
  onPeriodUpdate: (periodId: string, amountPaid: number) => Promise<void>;
}

export default function PeriodsTable({ periods, onPeriodUpdate }: Props) {
  const [savingId, setSavingId] = useState<string | null>(null);
  const [justSavedId, setJustSavedId] = useState<string | null>(null);
  const timers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const handleBlur = useCallback(
    async (period: PaymentPeriod, value: string) => {
      const parsed = parseFloat(value);
      if (isNaN(parsed) || parsed < 0) return;
      if (parsed === Number(period.amountPaid)) return;

      setSavingId(period.id);
      try {
        await onPeriodUpdate(period.id, parsed);
        setJustSavedId(period.id);
        const existing = timers.current.get(period.id);
        if (existing) clearTimeout(existing);
        timers.current.set(
          period.id,
          setTimeout(() => setJustSavedId(null), 2000)
        );
      } finally {
        setSavingId(null);
      }
    },
    [onPeriodUpdate]
  );

  const sorted = [...periods].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      {/* Desktop header */}
      <div className="hidden items-center gap-3 border-b border-border bg-muted/30 px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground md:grid md:grid-cols-[1fr_120px_120px_100px]">
        <div>Due Date</div>
        <div className="text-right">Amount Due</div>
        <div className="text-right">Paid Amount</div>
        <div className="text-center">Status</div>
      </div>

      {sorted.length === 0 && (
        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
          No payment periods yet.
        </div>
      )}

      {sorted.map((period) => {
        const cfg = statusConfig[period.status] ?? statusConfig.OUTSTANDING;
        return (
          <div
            key={period.id}
            className="border-b border-border last:border-b-0 md:grid md:grid-cols-[1fr_120px_120px_100px] md:items-center md:gap-3 md:px-4 md:py-3"
          >
            {/* Mobile layout */}
            <div className="flex items-center justify-between px-4 py-3 md:hidden">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Due</span>
                <span className="text-sm font-medium text-foreground tabular-nums">
                  {formatDate(period.dueDate)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-foreground tabular-nums">
                  {formatPHP(Number(period.amountDue))}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 px-4 pb-3 md:pb-0 md:px-0 md:justify-normal">
              {/* Due date (desktop) */}
              <span className="hidden text-sm font-medium text-foreground tabular-nums md:inline">
                {formatDate(period.dueDate)}
              </span>

              {/* Amount due (desktop) */}
              <span className="hidden text-sm font-bold text-foreground tabular-nums md:inline md:text-right">
                {formatPHP(Number(period.amountDue))}
              </span>

              {/* Paid amount (editable) */}
              <div className="relative flex-1 md:flex-none md:justify-self-end">
                <div className="relative">
                  <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    ₱
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={Number(period.amountPaid) || ""}
                    onBlur={(e) => handleBlur(period, e.target.value)}
                    className="h-8 w-full rounded-md border border-input bg-background pl-5 pr-7 text-xs tabular-nums outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:opacity-50 md:w-28"
                    disabled={savingId === period.id || period.status === "PAID"}
                    aria-label={`Paid amount for ${formatDate(period.dueDate)}`}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2">
                    {savingId === period.id ? (
                      <Loader2
                        size={12}
                        className="animate-spin text-muted-foreground"
                        aria-hidden="true"
                      />
                    ) : justSavedId === period.id ? (
                      <Check
                        size={12}
                        className="text-success"
                        aria-hidden="true"
                      />
                    ) : null}
                  </span>
                </div>
              </div>

              {/* Status badge */}
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ${cfg.class}`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`}
                  aria-hidden="true"
                />
                {cfg.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

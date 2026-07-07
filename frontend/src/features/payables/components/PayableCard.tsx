import Link from "next/link";
import { Archive, Trash2, RotateCcw, Repeat2 } from "lucide-react";
import type { PayableWithPeriods } from "./payable.types";
import PaymentProgress from "./PaymentProgress";

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

const frequencyLabels: Record<string, string> = {
  WEEKLY: "Weekly",
  BIWEEKLY: "Every 2 weeks",
  SEMI_MONTHLY: "Twice a month",
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  ANNUALLY: "Yearly",
  CUSTOM: "Custom",
};

interface Props {
  payable: PayableWithPeriods;
  isArchived: boolean;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onUnarchive: (id: string) => void;
}

export default function PayableCard({
  payable,
  isArchived,
  onArchive,
  onDelete,
  onUnarchive,
}: Props) {
  const catColor = payable.category?.color ?? "#6D4C8C";

  return (
    <Link
      href={`/payables/${payable.id}`}
      className="block rounded-xl border border-border bg-card hover:bg-muted/20 transition-colors"
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div
              className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: catColor }}
              aria-hidden="true"
            />

            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-semibold text-foreground">
                {payable.title}
              </h3>

              {payable.provider && (
                <p className="truncate text-xs text-muted-foreground">
                  {payable.provider}
                </p>
              )}
            </div>
          </div>

          <p className="shrink-0 text-sm font-bold tabular-nums text-foreground">
            {formatPHP(Number(payable.amountPerPeriod))}
          </p>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          {payable.category && (
            <span
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium"
              style={{
                backgroundColor: `${catColor}15`,
                color: catColor,
              }}
            >
              {payable.category.name}
            </span>
          )}

          {payable.isRecurring && (
            <span className="inline-flex items-center gap-1 rounded-md bg-ube/8 px-1.5 py-0.5 text-[11px] font-medium text-ube">
              <Repeat2 size={11} aria-hidden="true" />
              {frequencyLabels[payable.recurrenceFrequency ?? ""] ?? "Recurring"}
            </span>
          )}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
          <span>Start: {formatDate(payable.startDate)}</span>
          {payable.endDate && <span>End: {formatDate(payable.endDate)}</span>}
        </div>

        <div className="mt-3">
          <PaymentProgress
            periods={payable.paymentPeriods}
            isRecurring={payable.isRecurring}
            hasEndDate={!!payable.endDate}
          />
        </div>

        <div className="mt-3 flex items-center gap-1 border-t border-border pt-3">
          {isArchived ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onUnarchive(payable.id);
              }}
              className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-ube hover:bg-ube/5 transition-colors"
              aria-label={`Unarchive ${payable.title}`}
            >
              <RotateCcw size={14} aria-hidden="true" />
              Unarchive
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onArchive(payable.id);
              }}
              className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-ube hover:bg-ube/5 transition-colors"
              aria-label={`Archive ${payable.title}`}
            >
              <Archive size={14} aria-hidden="true" />
              Archive
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(payable.id);
            }}
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-danger hover:bg-danger/5 transition-colors ml-auto"
            aria-label={`Delete ${payable.title}`}
          >
            <Trash2 size={14} aria-hidden="true" />
            Delete
          </button>
        </div>
      </div>
    </Link>
  );
}

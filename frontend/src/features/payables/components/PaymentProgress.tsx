import type { PaymentPeriod } from "./payable.types";

interface Props {
  periods: PaymentPeriod[];
  isRecurring: boolean;
  hasEndDate: boolean;
}

export default function PaymentProgress({ periods, isRecurring, hasEndDate }: Props) {
  if (!isRecurring) return null;

  const total = periods.length;
  const paid = periods.filter((p) => p.status === "PAID").length;

  const label = hasEndDate
    ? `${paid}/${total} paid`
    : `${paid} cycle${paid !== 1 ? "s" : ""} paid`;

  const progress = total > 0 ? (paid / total) * 100 : 0;

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-ube transition-all duration-300"
          style={{ width: `${Math.min(progress, 100)}%` }}
          aria-hidden="true"
        />
      </div>
      <span className="text-[11px] font-medium text-muted-foreground tabular-nums whitespace-nowrap">
        {label}
      </span>
    </div>
  );
}

import { useWatch } from "react-hook-form";
import type {
  UseFormRegister,
  FieldErrors,
  Control,
  UseFormSetValue,
} from "react-hook-form";
import type { PayableFormValues } from "./payable-form-schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


const frequencies = [
  { value: "WEEKLY", label: "Weekly" },
  { value: "BIWEEKLY", label: "Every 2 weeks" },
  { value: "SEMI_MONTHLY", label: "Twice a month" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "QUARTERLY", label: "Quarterly" },
  { value: "ANNUALLY", label: "Yearly" },
  { value: "CUSTOM", label: "Custom interval" },
] as const;

export interface CategoryOption {
  id: string;
  name: string;
  color: string | null;
}

interface Props {
  register: UseFormRegister<PayableFormValues>;
  errors: FieldErrors<PayableFormValues>;
  control: Control<PayableFormValues>;
  setValue: UseFormSetValue<PayableFormValues>;
  categories: CategoryOption[];
}

export default function PayableFormFields({
  register,
  errors,
  control,
  setValue,
  categories,
}: Props) {
  const isRecurring = useWatch({ control, name: "isRecurring" });
  const reminderDaysBefore = useWatch({ control, name: "reminderDaysBefore" });
  const categoryId = useWatch({ control, name: "categoryId" });

  const selectedCat = categories.find((c) => c.id === categoryId);

  return (
    <>
      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title">Bill name</Label>
        <Input
          id="title"
          type="text"
          placeholder="e.g. Apartment rent"
          className="h-11"
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? "title-error" : undefined}
          {...register("title")}
        />
        {errors.title && (
          <p id="title-error" className="text-xs text-danger" role="alert">
            {errors.title.message}
          </p>
        )}
      </div>

      {/* Provider */}
      <div className="space-y-1.5">
        <Label htmlFor="provider">Provider (optional)</Label>
        <Input
          id="provider"
          type="text"
          placeholder="e.g. Meralco, Globe"
          className="h-11"
          aria-invalid={!!errors.provider}
          aria-describedby={errors.provider ? "provider-error" : undefined}
          {...register("provider")}
        />
        <p className="text-xs text-muted-foreground/70">
          Who you pay — shown alongside the bill name
        </p>
        {errors.provider && (
          <p id="provider-error" className="text-xs text-danger" role="alert">
            {errors.provider.message}
          </p>
        )}
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <Label htmlFor="categoryId" className="flex items-center gap-2">
          Category (optional)
          {selectedCat && (
            <span
              className="inline-block h-3 w-3 rounded-full border border-border"
              style={{ backgroundColor: selectedCat.color || "#6D4C8C" }}
              aria-hidden="true"
            />
          )}
        </Label>
        <select
          id="categoryId"
          className="h-11 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
          {...register("categoryId")}
        >
          <option value="">None</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground/70">
          Group this bill under a category for easier tracking
        </p>
      </div>

      {/* Amount */}
      <div className="space-y-1.5">
        <Label htmlFor="amountPerPeriod">Amount</Label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            ₱
          </span>
          <Input
            id="amountPerPeriod"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            className="h-11 pl-7"
            aria-invalid={!!errors.amountPerPeriod}
            aria-describedby={
              errors.amountPerPeriod ? "amount-error" : undefined
            }
            {...register("amountPerPeriod")}
          />
        </div>
        {errors.amountPerPeriod && (
          <p id="amount-error" className="text-xs text-danger" role="alert">
            {errors.amountPerPeriod.message}
          </p>
        )}
      </div>

      {/* Recurring toggle */}
      <fieldset>
        <legend className="text-sm font-medium leading-none mb-2">
          How often?
        </legend>
        <p className="mb-2 text-xs text-muted-foreground/70">
          Is this a one-time payment or does it repeat?
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            role="radio"
            aria-checked={!isRecurring}
            onClick={() =>
              setValue("isRecurring", false, { shouldValidate: true })
            }
            className={`flex-1 cursor-pointer rounded-lg border px-3 py-2.5 text-center text-sm font-medium transition-all ${
              !isRecurring
                ? "border-ube bg-ube/5 text-ube"
                : "border-input bg-background text-muted-foreground hover:border-ube/30"
            }`}
          >
            One-time
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={isRecurring}
            onClick={() =>
              setValue("isRecurring", true, { shouldValidate: true })
            }
            className={`flex-1 cursor-pointer rounded-lg border px-3 py-2.5 text-center text-sm font-medium transition-all ${
              isRecurring
                ? "border-ube bg-ube/5 text-ube"
                : "border-input bg-background text-muted-foreground hover:border-ube/30"
            }`}
          >
            Recurring
          </button>
        </div>
      </fieldset>

      {/* Conditional: Recurring fields */}
      {isRecurring && (
        <>
          {/* Frequency */}
          <div className="space-y-1.5">
            <Label htmlFor="recurrenceFrequency">Frequency</Label>
            <select
              id="recurrenceFrequency"
              className="h-11 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30"
              aria-invalid={!!errors.recurrenceFrequency}
              aria-describedby={
                errors.recurrenceFrequency ? "frequency-error" : undefined
              }
              {...register("recurrenceFrequency")}
            >
              <option value="">Select frequency</option>
              {frequencies.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground/70">
              How often this bill repeats
            </p>
            {errors.recurrenceFrequency && (
              <p
                id="frequency-error"
                className="text-xs text-danger"
                role="alert"
              >
                {errors.recurrenceFrequency.message}
              </p>
            )}
          </div>

          {/* Start date */}
          <div className="space-y-1.5">
            <Label htmlFor="startDate">Start date</Label>
            <Input
              id="startDate"
              type="date"
              className="h-11"
              aria-invalid={!!errors.startDate}
              aria-describedby={
                errors.startDate ? "start-date-error" : undefined
              }
              {...register("startDate")}
            />
            <p className="text-xs text-muted-foreground/70">
              When the first bill is due
            </p>
            {errors.startDate && (
              <p
                id="start-date-error"
                className="text-xs text-danger"
                role="alert"
              >
                {errors.startDate.message}
              </p>
            )}
          </div>

          {/* End date */}
          <div className="space-y-1.5">
            <Label htmlFor="endDate">End date (optional)</Label>
            <Input
              id="endDate"
              type="date"
              className="h-11"
              aria-invalid={!!errors.endDate}
              {...register("endDate")}
            />
            <p className="text-xs text-muted-foreground/70">
              Leave empty if this bill doesn&apos;t end
            </p>
          </div>

          {/* Reminder days */}
          <div className="space-y-1.5">
            <Label htmlFor="reminderDaysBefore">Remind me</Label>
            <div className="flex items-center gap-2">
              <Input
                id="reminderDaysBefore"
                type="number"
                min="1"
                className="h-11 w-20"
                aria-invalid={!!errors.reminderDaysBefore}
                aria-describedby={
                  errors.reminderDaysBefore ? "reminder-error" : undefined
                }
                {...register("reminderDaysBefore")}
              />
              <span className="text-sm text-muted-foreground">
                day{Number(reminderDaysBefore) !== 1 ? "s" : ""} before
              </span>
            </div>
            <p className="text-xs text-muted-foreground/70">
              Get notified this many days before each due date
            </p>
            {errors.reminderDaysBefore && (
              <p
                id="reminder-error"
                className="text-xs text-danger"
                role="alert"
              >
                {errors.reminderDaysBefore.message}
              </p>
            )}
          </div>
        </>
      )}

      {/* Conditional: One-time date */}
      {!isRecurring && (
        <div className="space-y-1.5">
          <Label htmlFor="startDate">Due date</Label>
          <Input
            id="startDate"
            type="date"
            className="h-11"
            aria-invalid={!!errors.startDate}
            aria-describedby={
              errors.startDate ? "start-date-error" : undefined
            }
            {...register("startDate")}
          />
          {errors.startDate && (
            <p
              id="start-date-error"
              className="text-xs text-danger"
              role="alert"
            >
              {errors.startDate.message}
            </p>
          )}
        </div>
      )}

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes (optional)</Label>
        <textarea
          id="notes"
          rows={3}
          placeholder="Any reminders for yourself..."
          className="h-auto w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none md:text-sm dark:bg-input/30"
          aria-invalid={!!errors.notes}
          {...register("notes")}
        />
      </div>
    </>
  );
}

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/shared/lib/api";
import { useRequireAuth } from "@/shared/hooks/useRequireAuth";
import AppShell from "@/components/layout/AppShell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useMemo } from "react";
import { Loader2, Check } from "lucide-react";

const frequencies = [
  { value: "WEEKLY", label: "Weekly" },
  { value: "BIWEEKLY", label: "Every 2 weeks" },
  { value: "SEMI_MONTHLY", label: "Twice a month" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "QUARTERLY", label: "Quarterly" },
  { value: "ANNUALLY", label: "Yearly" },
  { value: "CUSTOM", label: "Custom interval" },
] as const;

interface UserSettings {
  timezone: string;
  currency: string;
  defaultReminderDays: number;
  bucketFrequency: string;
  bucketCycleStart: string;
  bucketCustomDays: number | null;
}

const settingsSchema = z.object({
  timezone: z.string().min(1, "Timezone is required"),
  currency: z.string().min(1, "Currency is required"),
  defaultReminderDays: z.string().min(0),
  bucketFrequency: z.string().min(1, "Frequency is required"),
  bucketCycleStart: z.string().min(1, "Date is required"),
  bucketCustomDays: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toISOString().split("T")[0];
}

export default function SettingsPage() {
  const { isAuthed, isHydrated } = useRequireAuth();
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState(false);

  const detectedTimezone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return "";
    }
  }, []);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api.get<UserSettings>("/settings"),
    retry: false,
    enabled: isAuthed,
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    values: settings
      ? {
          timezone:
            settings.timezone === "Asia/Manila" && detectedTimezone
              ? detectedTimezone
              : settings.timezone,
          currency: settings.currency,
          defaultReminderDays: String(settings.defaultReminderDays),
          bucketFrequency: settings.bucketFrequency,
          bucketCycleStart: formatDate(settings.bucketCycleStart),
          bucketCustomDays: settings.bucketCustomDays
            ? String(settings.bucketCustomDays)
            : "",
        }
      : undefined,
  });

  const watchFrequency = watch("bucketFrequency");

  const timezones = useMemo(() => {
    if (typeof Intl?.supportedValuesOf !== "function") return [];
    return Intl.supportedValuesOf("timeZone") as string[];
  }, []);

  const currencies = useMemo(() => {
    if (typeof Intl?.supportedValuesOf !== "function") return [];
    const all = Intl.supportedValuesOf("currency") as string[];
    const names = new Intl.DisplayNames("en", { type: "currency" });
    return all
      .filter((c) => c !== "XXX")
      .map((c) => ({ code: c, name: names.of(c) as string }))
      .sort((a, b) => a.code.localeCompare(b.code));
  }, []);

  const mutation = useMutation({
    mutationFn: (data: SettingsFormValues) =>
      api.put("/settings", {
        timezone: data.timezone,
        currency: data.currency,
        defaultReminderDays: parseInt(data.defaultReminderDays, 10),
        bucketFrequency: data.bucketFrequency,
        bucketCycleStart: data.bucketCycleStart,
        bucketCustomDays: data.bucketCustomDays
          ? parseInt(data.bucketCustomDays, 10)
          : null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  const onSubmit = async (data: SettingsFormValues) => {
    mutation.mutate(data);
  };

  if (!isHydrated) {
    return (
      <div className="mx-auto max-w-lg px-4 py-6">
        <div className="mb-6 h-8 w-40 animate-pulse motion-reduce:animate-none rounded-md bg-muted" />
        <div className="h-96 w-full animate-pulse motion-reduce:animate-none rounded-xl bg-muted" />
      </div>
    );
  }

  if (!isAuthed) return null;

  if (isLoading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-lg px-4 py-6">
          <div className="mb-6 h-8 w-40 animate-pulse motion-reduce:animate-none rounded-md bg-muted" />
          <div className="h-96 w-full animate-pulse motion-reduce:animate-none rounded-xl bg-muted" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-lg px-4 py-6">
        <Card className="border-t-[3px] border-t-ube shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-foreground">
              Settings
            </CardTitle>
            <CardDescription>
              Configure your pay cycle, currency, and reminders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-5"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
              {/* Bucket frequency */}
              <div className="space-y-1.5">
                <Label htmlFor="bucketFrequency">Pay cycle frequency</Label>
                <select
                  id="bucketFrequency"
                  className="h-11 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
                  {...register("bucketFrequency")}
                >
                  {frequencies.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground/70">
                  How often you receive pay — used for the bucket view
                </p>
              </div>

              {/* Custom days (only when CUSTOM) */}
              {watchFrequency === "CUSTOM" && (
                <div className="space-y-1.5">
                  <Label htmlFor="bucketCustomDays">Custom days</Label>
                  <Input
                    id="bucketCustomDays"
                    type="number"
                    min="1"
                    className="h-11"
                    placeholder="e.g. 30"
                    {...register("bucketCustomDays")}
                  />
                  <p className="text-xs text-muted-foreground/70">
                    Number of days between pay cycles
                  </p>
                </div>
              )}

              {/* Cycle start date */}
              <div className="space-y-1.5">
                <Label htmlFor="bucketCycleStart">Cycle start date</Label>
                <Input
                  id="bucketCycleStart"
                  type="date"
                  className="h-11"
                  aria-invalid={!!errors.bucketCycleStart}
                  {...register("bucketCycleStart")}
                />
                <p className="text-xs text-muted-foreground/70">
                  The start of your current pay cycle
                </p>
                {errors.bucketCycleStart && (
                  <p className="text-xs text-danger" role="alert">
                    {errors.bucketCycleStart.message}
                  </p>
                )}
              </div>

              {/* Timezone */}
              <div className="space-y-1.5">
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  type="text"
                  className="h-11"
                  placeholder="Search timezone..."
                  list="timezone-list"
                  autoComplete="off"
                  aria-invalid={!!errors.timezone}
                  {...register("timezone")}
                />
                <datalist id="timezone-list">
                  {timezones.map((tz) => (
                    <option key={tz} value={tz} />
                  ))}
                </datalist>
                <p className="text-xs text-muted-foreground/70">
                  Start typing to filter. Auto-detected as{" "}
                  <span className="font-medium text-foreground">
                    {detectedTimezone || "Asia/Manila"}
                  </span>
                </p>
                {errors.timezone && (
                  <p className="text-xs text-danger" role="alert">
                    {errors.timezone.message}
                  </p>
                )}
              </div>

              {/* Currency */}
              <div className="space-y-1.5">
                <Label htmlFor="currency">Currency</Label>
                <select
                  id="currency"
                  className="h-11 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive md:text-sm dark:bg-input/30"
                  aria-invalid={!!errors.currency}
                  {...register("currency")}
                >
                  {currencies.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} — {c.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground/70">
                  Display format for all amounts
                </p>
                {errors.currency && (
                  <p className="text-xs text-danger" role="alert">
                    {errors.currency.message}
                  </p>
                )}
              </div>

              {/* Default reminder days */}
              <div className="space-y-1.5">
                <Label htmlFor="defaultReminderDays">
                  Default reminder (days before)
                </Label>
                <Input
                  id="defaultReminderDays"
                  type="number"
                  min="0"
                  className="h-11"
                  placeholder="3"
                  aria-invalid={!!errors.defaultReminderDays}
                  {...register("defaultReminderDays")}
                />
                <p className="text-xs text-muted-foreground/70">
                  How many days before a due date to notify you
                </p>
              </div>

              {mutation.error && (
                <div className="rounded-md bg-danger/10 px-3 py-2" role="alert">
                  <p className="text-xs text-danger">
                    {mutation.error instanceof Error
                      ? mutation.error.message
                      : "Failed to save settings"}
                  </p>
                </div>
              )}

              {success && (
                <div className="rounded-md bg-green-600/10 px-3 py-2" role="status">
                  <p className="flex items-center gap-1.5 text-xs text-green-600">
                    <Check size={14} />
                    Settings saved
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 text-base font-medium shadow-md shadow-ube/15 hover:shadow-lg hover:shadow-ube/25 transition-shadow"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                    Saving...
                  </span>
                ) : (
                  "Save settings"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

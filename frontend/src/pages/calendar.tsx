import AppShell from "@/components/layout/AppShell";

export default function CalendarPage() {
  return (
    <AppShell>
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-6xl mb-4" aria-hidden="true">📅</div>
        <h1 className="text-2xl font-bold text-foreground font-display">
          Coming soon!
        </h1>
        <p className="mt-2 max-w-sm text-muted-foreground">
          We&apos;re marking our calendar for this feature. Stay tuned!
        </p>
      </div>
    </AppShell>
  );
}

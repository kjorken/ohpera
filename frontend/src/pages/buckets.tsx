import AppShell from "@/components/layout/AppShell";

export default function BucketsPage() {
  return (
    <AppShell>
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-6xl mb-4" aria-hidden="true">🏦</div>
        <h1 className="text-2xl font-bold text-foreground font-display">
          We&apos;re cooking something
        </h1>
        <p className="mt-2 max-w-sm text-muted-foreground">
          Your payday buckets are being prepped. Check back soon!
        </p>
      </div>
    </AppShell>
  );
}

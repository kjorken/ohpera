import { useRequireAuth } from "@/shared/hooks/useRequireAuth";
import PayableList from "@/features/payables/components/PayableList";
import AppShell from "@/components/layout/AppShell";

export default function PayablesPage() {
  const { isAuthed, isHydrated } = useRequireAuth();

  if (!isHydrated) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-6 h-8 w-24 animate-pulse motion-reduce:animate-none rounded-md bg-muted" aria-hidden="true" />
        <div className="space-y-3">
          <div className="h-28 w-full animate-pulse motion-reduce:animate-none rounded-xl bg-muted" aria-hidden="true" />
          <div className="h-28 w-full animate-pulse motion-reduce:animate-none rounded-xl bg-muted" aria-hidden="true" />
        </div>
      </div>
    );
  }

  if (!isAuthed) return null;

  return (
    <AppShell>
      <PayableList />
    </AppShell>
  );
}

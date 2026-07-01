import { useRequireAuth } from "@/shared/hooks/useRequireAuth";
import PayableCreateForm from "@/features/payables/components/PayableCreateForm";
import AppShell from "@/components/layout/AppShell";

export default function NewPayablePage() {
  const { isAuthed, isHydrated } = useRequireAuth();

  if (!isHydrated) {
    return (
      <div className="mx-auto max-w-lg px-4 py-6">
        <div className="mb-4 h-4 w-32 animate-pulse motion-reduce:animate-none rounded-md bg-muted" aria-hidden="true" />
        <div className="h-[500px] w-full animate-pulse motion-reduce:animate-none rounded-xl bg-muted" aria-hidden="true" />
      </div>
    );
  }

  if (!isAuthed) return null;

  return (
    <AppShell>
      <PayableCreateForm />
    </AppShell>
  );
}

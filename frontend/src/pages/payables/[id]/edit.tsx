import { useRouter } from "next/router";
import { useRequireAuth } from "@/shared/hooks/useRequireAuth";
import AppShell from "@/components/layout/AppShell";
import PayableEditForm from "@/features/payables/components/PayableEditForm";

export default function EditPayablePage() {
  const router = useRouter();
  const { id } = router.query;
  const { isAuthed, isHydrated } = useRequireAuth();

  if (!isHydrated) {
    return (
      <div className="mx-auto max-w-lg px-4 py-6">
        <div className="mb-4 h-4 w-32 animate-pulse motion-reduce:animate-none rounded-md bg-muted" aria-hidden="true" />
        <div className="h-125 w-full animate-pulse motion-reduce:animate-none rounded-xl bg-muted" aria-hidden="true" />
      </div>
    );
  }

  if (!isAuthed) return null;
  if (typeof id !== "string") return null;

  return (
    <AppShell>
      <PayableEditForm id={id} />
    </AppShell>
  );
}

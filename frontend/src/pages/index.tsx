import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuthStore } from "@/shared/store/auth.store";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  useEffect(() => {
    if (isHydrated && token) {
      router.replace("/dashboard");
    }
  }, [isHydrated, token, router]);

  if (isHydrated && token) return null;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md text-center">
        <h1 className="text-5xl font-bold tracking-tight text-foreground">
          OhPera
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Track what you owe. Know what you have.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          A simple payables tracker built for real-life Filipino budgeting.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/login">
            <Button className="w-full sm:w-auto">Sign in</Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" className="w-full sm:w-auto">
              Create account
            </Button>
          </Link>
        </div>

        <div className="mt-12 grid gap-4 text-left sm:grid-cols-2">
          <div className="rounded-xl border p-4">
            <h3 className="font-semibold text-foreground">What do I owe?</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              All your bills, subscriptions, loans, and debts in one place.
            </p>
          </div>
          <div className="rounded-xl border p-4">
            <h3 className="font-semibold text-foreground">When is it due?</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Grouped by your payday cycle. No surprises.
            </p>
          </div>
          <div className="rounded-xl border p-4">
            <h3 className="font-semibold text-foreground">Can I afford it?</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              See if your next salary covers what's coming up.
            </p>
          </div>
          <div className="rounded-xl border p-4">
            <h3 className="font-semibold text-foreground">Am I overdue?</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Alerts for past-due payments so nothing slips.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

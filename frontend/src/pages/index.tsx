import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuthStore } from "@/shared/store/auth.store";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ScrollText, CalendarClock, Coins, BellRing } from "lucide-react";

const features = [
  {
    icon: ScrollText,
    title: "See everything you owe",
    desc: "Bills, subscriptions, loans, utang — one list, no surprises.",
    accent: "border-l-ube",
  },
  {
    icon: CalendarClock,
    title: "Know when it's due",
    desc: "Grouped by payday cycle. No more checking multiple due dates.",
    accent: "border-l-mango",
  },
  {
    icon: Coins,
    title: "Will your salary cover it?",
    desc: "See at a glance if your next pay can cover what's coming up.",
    accent: "border-l-success",
  },
  {
    icon: BellRing,
    title: "Never miss a payment",
    desc: "Overdue alerts so nothing slips through the cracks.",
    accent: "border-l-danger",
  },
];

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
    <div className="relative min-h-screen w-full flex flex-col bg-background">
      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-4 sm:px-6 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight text-ube font-display">
          OhPera
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign in
          </Link>
          <Link href="/register">
            <Button size="sm" className="shadow-sm">
              Get started
            </Button>
          </Link>
        </nav>
      </header>

      {/* Decorative background blobs */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[600px] max-w-[90vw] rounded-full bg-gradient-to-b from-ube/8 to-mango/5 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-1/4 -right-32 h-72 w-72 rounded-full bg-gradient-to-t from-mango/6 to-transparent blur-2xl"
        aria-hidden="true"
      />

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg text-center">
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-ube font-display">
            OhPera
          </h1>
          <p className="mt-3 text-lg sm:text-xl text-foreground/80 font-medium">
            Know what you owe. Know what you have.
          </p>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
            A payables tracker built around the Philippine payday cycle — because sweldo should come with clarity, not confusion.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/login">
              <Button className="w-full sm:w-auto h-12 px-8 text-base shadow-lg shadow-ube/20 hover:shadow-xl hover:shadow-ube/30 transition-shadow">
                Sign in
              </Button>
            </Link>
            <Link href="/register">
              <Button
                variant="outline"
                className="w-full sm:w-auto h-12 px-8 text-base border-ube/30 text-ube hover:bg-ube/5 hover:border-ube/50 transition-colors"
              >
                Get started
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature cards */}
        <div className="mt-20 w-full max-w-2xl">
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((f) => (
              <div
                key={f.title}
                className={`group rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${f.accent} border-l-[3px]`}
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-ube/10 text-ube transition-colors group-hover:bg-ube/15">
                  <f.icon size={20} aria-hidden="true" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border px-4 sm:px-6 py-6">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-2 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} OhPera. &ldquo;Oh, pera&rdquo; &mdash; the exasperated sound you make when a bill shows up.
          </p>
          <nav className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link href="/login" className="hover:text-foreground transition-colors">
              Sign in
            </Link>
            <Link href="/register" className="hover:text-foreground transition-colors">
              Create account
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

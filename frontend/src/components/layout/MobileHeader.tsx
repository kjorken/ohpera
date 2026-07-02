import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuthStore } from "@/shared/store/auth.store";
import { Settings, LogOut, Tag } from "lucide-react";

export default function MobileHeader() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const initials = user?.email
    ? user.email.charAt(0).toUpperCase()
    : "?";

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    clearAuth();
    setOpen(false);
    router.push("/login");
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card px-4 md:hidden">
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-linear-to-br from-ube to-ube-light text-white text-xs font-bold shadow-sm">
          O
        </div>
        <span className="font-display text-base font-bold text-ube">
          OhPera
        </span>
      </Link>

      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-ube/10 text-sm font-bold text-ube hover:bg-ube/20 transition-colors"
          aria-label="User menu"
        >
          {initials}
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-xl border border-border bg-card shadow-lg animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="border-b border-border px-4 py-3">
              <p className="truncate text-sm font-medium text-foreground">
                {user?.email?.split("@")[0] ?? "User"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.email ?? ""}
              </p>
            </div>
            <div className="p-1.5">
              <Link
                href="/categories"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <Tag size={18} aria-hidden="true" />
                Categories
              </Link>
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <Settings size={18} aria-hidden="true" />
                Settings
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-danger/5 hover:text-danger transition-colors"
              >
                <LogOut size={18} aria-hidden="true" />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

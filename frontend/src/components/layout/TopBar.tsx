import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuthStore } from "@/shared/store/auth.store";
import { Settings, LogOut } from "lucide-react";

interface NavItem {
    href: string;
    label: string;
}

const navItems: NavItem[] = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/payables", label: "Bills" },
    { href: "/buckets", label: "Buckets" },
    { href: "/calendar", label: "Calendar" },
];

export default function TopBar() {
    const router = useRouter();
    const path = router.pathname;
    const user = useAuthStore((s) => s.user);
    const clearAuth = useAuthStore((s) => s.clearAuth);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const initials = user?.email ? user.email.charAt(0).toUpperCase() : "?";

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        if (dropdownOpen) {
            document.addEventListener("mousedown", handleClick);
        }
        return () => document.removeEventListener("mousedown", handleClick);
    }, [dropdownOpen]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        clearAuth();
        setDropdownOpen(false);
        router.push("/login");
    };

    const isActive = (href: string) =>
        path === href || path.startsWith(href + "/");

    return (
        <header className="fixed left-0 right-0 top-0 z-40 hidden h-14 items-center border-b border-border bg-card px-4 md:flex md:px-6">
            {/* Brand */}
            <Link
                href="/dashboard"
                className="flex items-center gap-2 shrink-0"
            >
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-linear-to-br from-ube to-ube-light text-white text-xs font-bold shadow-sm">
                    O
                </div>
                <span className="font-display text-base font-bold text-ube">
                    OhPera
                </span>
            </Link>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Nav items */}
            <nav
                className="flex items-center gap-0.5"
                aria-label="Main navigation"
            >
        {navItems.map((item) => {
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-3.5 text-sm font-medium transition-colors ${
                active
                  ? "text-ube"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <span className="relative inline-block">
                {item.label}
                <span
                  className={`absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-ube transition-transform duration-200 ${
                    active ? "scale-x-100" : "scale-x-0"
                  }`}
                  aria-hidden="true"
                />
              </span>
            </Link>
          );
        })}
            </nav>

            {/* User avatar + dropdown */}
            <div ref={ref} className="relative ml-3">
                <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-ube/10 text-xs font-bold text-ube hover:bg-ube/20 transition-colors"
                    aria-label="User menu"
                >
                    {initials}
                </button>

        {dropdownOpen && (
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
                            <button
                                type="button"
                                onClick={() => {
                                    setDropdownOpen(false);
                                    router.push("/settings");
                                }}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            >
                                <Settings size={18} aria-hidden="true" />
                                Settings
                            </button>
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

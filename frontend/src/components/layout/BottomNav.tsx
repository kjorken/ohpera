import { useRouter } from "next/router";
import Link from "next/link";
import {
  LayoutDashboard,
  ListTodo,
  Layers,
  Calendar,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
}

const navItems: NavItem[] = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/payables", icon: ListTodo, label: "Bills" },
  { href: "/buckets", icon: Layers, label: "Buckets" },
  { href: "/calendar", icon: Calendar, label: "Calendar" },
];

export default function BottomNav() {
  const router = useRouter();
  const path = router.pathname;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/80 backdrop-blur-lg supports-backdrop-filter:bg-background/60 md:hidden"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-4 pb-[env(safe-area-inset-bottom,0px)]">
        {navItems.map((item) => {
          const isActive =
            path === item.href || path.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 transition-all duration-200 ${
                isActive
                  ? "text-ube"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <div
                className={`transition-transform duration-200 ${
                  isActive ? "scale-110" : "scale-100"
                }`}
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 2}
                  aria-hidden="true"
                />
              </div>
              <span
                className={`transition-all duration-200 ${
                  isActive
                    ? "text-[11px] font-semibold"
                    : "text-[10px] font-medium"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

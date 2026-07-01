import type { ReactNode } from "react";
import BottomNav from "./BottomNav";
import TopBar from "./TopBar";
import MobileHeader from "./MobileHeader";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar />
      <MobileHeader />
      <main className="flex-1 pt-14 md:pt-14">
        <div className="animate-in fade-in duration-300 pb-24 md:pb-8">{children}</div>
      </main>
      <BottomNav />
    </div>
  );
}

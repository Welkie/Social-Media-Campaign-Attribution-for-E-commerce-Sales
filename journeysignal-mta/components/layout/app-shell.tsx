import type { ReactNode } from "react";
import { SidebarNav } from "./sidebar-nav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <SidebarNav />
      <main className="min-h-screen overflow-x-hidden px-4 pb-16 pt-4 md:pl-72 md:pr-6 md:pt-6">
        <div className="mx-auto w-full min-w-0 max-w-[1440px] overflow-x-hidden">{children}</div>
      </main>
    </div>
  );
}

import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { AssistantDock } from "@/components/assistant/assistant-dock";
import { getAnalysisContext } from "@/lib/data/load-dashboard-data";

export const metadata: Metadata = {
  title: "Journey Signal",
  description: "Multi-touch attribution dashboard and AI research assistant for campaign intelligence."
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const context = getAnalysisContext();

  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
        <AssistantDock suggestedQuestions={context.suggestedQuestions} />
      </body>
    </html>
  );
}

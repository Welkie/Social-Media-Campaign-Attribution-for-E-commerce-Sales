import type { ReactNode } from "react";

const toneMap = {
  neutral: "border-line bg-white",
  good: "border-emerald-200 bg-emerald-50",
  warn: "border-amber-200 bg-amber-50",
  info: "border-blue-200 bg-blue-50"
};

export function InsightCallout({
  label,
  children,
  tone = "neutral"
}: {
  label: string;
  children: ReactNode;
  tone?: keyof typeof toneMap;
}) {
  return (
    <div className={`rounded-lg border p-4 ${toneMap[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{label}</p>
      <div className="mt-2 text-sm leading-6 text-ink">{children}</div>
    </div>
  );
}

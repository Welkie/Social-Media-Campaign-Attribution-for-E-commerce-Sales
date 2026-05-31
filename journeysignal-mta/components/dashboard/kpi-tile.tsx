import type { ReactNode } from "react";

export function KpiTile({
  label,
  value,
  detail,
  icon
}: {
  label: string;
  value: string;
  detail?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-line bg-white p-4 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
        </div>
        {icon ? <div className="rounded-lg bg-surface p-2 text-brand">{icon}</div> : null}
      </div>
      {detail ? <p className="mt-3 text-sm leading-5 text-muted">{detail}</p> : null}
    </div>
  );
}

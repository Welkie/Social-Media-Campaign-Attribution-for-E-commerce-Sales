import type { ReactNode } from "react";

export function ChartPanel({
  title,
  description,
  children,
  toolbar,
  className = ""
}: {
  title: string;
  description?: string;
  children: ReactNode;
  toolbar?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-lg border border-line bg-white p-4 shadow-soft ${className}`}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-ink">{title}</h2>
          {description ? <p className="mt-1 text-sm leading-5 text-muted">{description}</p> : null}
        </div>
        {toolbar ? <div className="shrink-0">{toolbar}</div> : null}
      </div>
      {children}
    </section>
  );
}

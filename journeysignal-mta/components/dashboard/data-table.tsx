import type { ReactNode } from "react";

export type TableColumn<T> = {
  key: string;
  header: string;
  align?: "left" | "right";
  render: (row: T) => ReactNode;
};

export function DataTable<T>({
  rows,
  columns
}: {
  rows: T[];
  columns: Array<TableColumn<T>>;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-line">
      <div className="thin-scrollbar overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse bg-white text-sm">
          <thead className="bg-surface text-xs uppercase tracking-[0.1em] text-muted">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 font-semibold ${column.align === "right" ? "text-right" : "text-left"}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-t border-line">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-4 py-3 text-ink ${column.align === "right" ? "text-right tabular-nums" : "text-left"}`}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

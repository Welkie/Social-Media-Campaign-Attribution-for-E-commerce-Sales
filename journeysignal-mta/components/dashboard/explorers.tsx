"use client";

import { useMemo, useState } from "react";
import {
  AttributionGroupedChart,
  ChannelMetricBarChart,
  LogisticShareChart,
  OddsRatioForest,
  ScenarioMetricChart
} from "@/components/charts/dashboard-charts";
import { ChartPanel } from "@/components/dashboard/chart-panel";
import { DataTable } from "@/components/dashboard/data-table";
import type {
  AdjustedChannelShareRow,
  AttributionShareRow,
  RegressionCoefficientRow,
  SimulationResultRow
} from "@/lib/data/types";
import { formatCurrency, formatNumber, formatPValue, formatPct, scenarioLabel } from "@/lib/metrics/formatters";

const attributionOptions = [
  { key: "all", label: "All models" },
  { key: "firstTouchPct", label: "First-Touch" },
  { key: "lastTouchPct", label: "Last-Touch" },
  { key: "linearPct", label: "Linear" }
] as const;

const simulationMetrics = [
  { key: "deltaRevenue", label: "Delta revenue", type: "currency" },
  { key: "revenue", label: "Revenue", type: "currency" },
  { key: "conversions", label: "Conversions", type: "number" },
  { key: "deltaRevPct", label: "Delta revenue %", type: "percent" }
] as const;

function SegmentedControl<T extends string>({
  value,
  options,
  onChange
}: {
  value: T;
  options: ReadonlyArray<{ key: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 rounded-lg border border-line bg-surface p-1">
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          onClick={() => onChange(option.key)}
          className={[
            "rounded-md px-3 py-1.5 text-xs font-semibold transition",
            value === option.key ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"
          ].join(" ")}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function AttributionExplorer({ data }: { data: AttributionShareRow[] }) {
  const [model, setModel] = useState<(typeof attributionOptions)[number]["key"]>("all");
  const [sortDesc, setSortDesc] = useState(true);

  const sortedData = useMemo(() => {
    if (model === "all") {
      return data;
    }
    return [...data].sort((a, b) => (sortDesc ? b[model] - a[model] : a[model] - b[model]));
  }, [data, model, sortDesc]);

  const selectedLabel = attributionOptions.find((option) => option.key === model)?.label ?? "All models";

  return (
    <ChartPanel
      title="Attribution share explorer"
      description="Toggle attribution rules and sort channels to inspect how credit assignment changes."
      toolbar={
        <div className="flex flex-wrap items-center gap-2">
          <SegmentedControl value={model} options={attributionOptions} onChange={setModel} />
          {model !== "all" ? (
            <button
              type="button"
              onClick={() => setSortDesc((current) => !current)}
              className="rounded-lg border border-line bg-white px-3 py-2 text-xs font-semibold text-muted hover:text-ink"
            >
              Sort {sortDesc ? "high to low" : "low to high"}
            </button>
          ) : null}
        </div>
      }
    >
      {model === "all" ? (
        <AttributionGroupedChart data={sortedData} />
      ) : (
        <ChannelMetricBarChart data={sortedData} valueKey={model} name={selectedLabel} domain={[14, 19]} />
      )}
    </ChartPanel>
  );
}

export function RegressionExplorer({
  coefficients,
  adjustedShare
}: {
  coefficients: RegressionCoefficientRow[];
  adjustedShare: AdjustedChannelShareRow[];
}) {
  const [view, setView] = useState<"share" | "odds">("share");
  const [significantOnly, setSignificantOnly] = useState(false);

  const rows = useMemo(() => {
    const withoutConstant = coefficients.filter((row) => row.predictor !== "const");
    return significantOnly ? withoutConstant.filter((row) => row.pValue < 0.05) : withoutConstant;
  }, [coefficients, significantOnly]);

  return (
    <ChartPanel
      title="Regression benchmark explorer"
      description="Switch between adjusted share and coefficient evidence. Use the significance filter to focus on stronger predictors."
      toolbar={
        <div className="flex flex-wrap items-center gap-2">
          <SegmentedControl
            value={view}
            options={[
              { key: "share", label: "Adjusted share" },
              { key: "odds", label: "Odds ratios" }
            ]}
            onChange={setView}
          />
          <label className="flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-xs font-semibold text-muted">
            <input
              type="checkbox"
              checked={significantOnly}
              onChange={(event) => setSignificantOnly(event.target.checked)}
              className="h-4 w-4 accent-brand"
            />
            Significant only
          </label>
        </div>
      }
    >
      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        {view === "share" ? <LogisticShareChart data={adjustedShare} /> : <OddsRatioForest data={rows} />}
        <DataTable<RegressionCoefficientRow>
          rows={rows}
          columns={[
            { key: "predictor", header: "Predictor", render: (row) => row.predictor.replace("Channel_", "") },
            { key: "or", header: "Odds ratio", align: "right", render: (row) => row.oddsRatio.toFixed(4) },
            { key: "ci", header: "95% CI", align: "right", render: (row) => `[${row.ciLow.toFixed(2)}, ${row.ciHigh.toFixed(2)}]` },
            { key: "p", header: "p-value", align: "right", render: (row) => formatPValue(row.pValue) }
          ]}
        />
      </div>
    </ChartPanel>
  );
}

export function SimulationExplorer({ data }: { data: SimulationResultRow[] }) {
  const [metric, setMetric] = useState<(typeof simulationMetrics)[number]["key"]>("deltaRevenue");
  const selected = simulationMetrics.find((item) => item.key === metric) ?? simulationMetrics[0];
  const best = [...data].sort((a, b) => Number(b[metric]) - Number(a[metric]))[0];

  return (
    <ChartPanel
      title="Scenario metric explorer"
      description="Choose the simulation metric to compare equal allocation with reallocation scenarios."
      toolbar={<SegmentedControl value={metric} options={simulationMetrics} onChange={setMetric} />}
    >
      <div className="grid gap-4 xl:grid-cols-[1fr_0.7fr]">
        <ScenarioMetricChart data={data} metric={metric} label={selected.label} valueType={selected.type} />
        <div className="rounded-lg border border-line bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Current metric</p>
          <h3 className="mt-2 text-lg font-semibold text-ink">{selected.label}</h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            Highest scenario for this metric: <span className="font-semibold text-ink">{scenarioLabel(best.scenario)}</span>.
          </p>
          <div className="mt-4 space-y-2 text-sm">
            {data.map((row) => {
              const value = Number(row[metric]);
              const display =
                selected.type === "currency"
                  ? formatCurrency(value, 2)
                  : selected.type === "percent"
                    ? formatPct(value, 4)
                    : formatNumber(value, 2);
              return (
                <div key={row.scenario} className="flex items-center justify-between gap-3 rounded-md bg-white px-3 py-2">
                  <span className="text-muted">{scenarioLabel(row.scenario)}</span>
                  <span className="font-semibold tabular-nums text-ink">{display}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ChartPanel>
  );
}

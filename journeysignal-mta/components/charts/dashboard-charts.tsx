"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type {
  AdjustedChannelShareRow,
  AttributionShareRow,
  BudgetWeightRow,
  ChannelConversionRateRow,
  ModelComparisonRow,
  RegressionCoefficientRow,
  RemovalEffectRow,
  SensitivityRow,
  SimulationResultRow
} from "@/lib/data/types";
import { formatCurrency, formatNumber, formatPct, formatShare, scenarioLabel } from "@/lib/metrics/formatters";

const COLORS = {
  first: "#2364aa",
  last: "#1b6b68",
  linear: "#b95f1d",
  logit: "#5b5f97",
  markov: "#a33f2b",
  muted: "#94a3b8",
  good: "#16845b",
  warn: "#b45309"
};

const channelColors: Record<string, string> = {
  "Direct Traffic": "#64748b",
  "Display Ads": "#2364aa",
  Email: "#1b6b68",
  Referral: "#5b5f97",
  "Search Ads": "#b95f1d",
  "Social Media": "#16845b"
};

function compactTick(value: string) {
  return value.replace("Direct Traffic", "Direct").replace("Social Media", "Social");
}

function TooltipBox({ active, payload, label }: { active?: boolean; payload?: Array<Record<string, unknown>>; label?: string }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-lg border border-line bg-white p-3 text-xs shadow-soft">
      <p className="mb-2 font-semibold text-ink">{label}</p>
      <div className="space-y-1">
        {payload.map((item) => (
          <p key={`${String(item.name)}-${String(item.value)}`} style={{ color: String(item.color ?? COLORS.first) }}>
            {String(item.name)}: {typeof item.value === "number" ? item.value.toFixed(2) : String(item.value)}
          </p>
        ))}
      </div>
    </div>
  );
}

export function AttributionGroupedChart({ data }: { data: AttributionShareRow[] }) {
  return (
    <div className="h-[360px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 18, left: 0, bottom: 42 }}>
          <CartesianGrid stroke="#e4e7ec" vertical={false} />
          <XAxis dataKey="channel" tickFormatter={compactTick} angle={-25} textAnchor="end" height={68} fontSize={12} />
          <YAxis tickFormatter={(value) => `${value}%`} fontSize={12} />
          <Tooltip content={<TooltipBox />} />
          <Legend />
          <Bar dataKey="firstTouchPct" name="First-Touch" fill={COLORS.first} radius={[4, 4, 0, 0]} isAnimationActive={false} />
          <Bar dataKey="lastTouchPct" name="Last-Touch" fill={COLORS.last} radius={[4, 4, 0, 0]} isAnimationActive={false} />
          <Bar dataKey="linearPct" name="Linear" fill={COLORS.linear} radius={[4, 4, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ConversionRateChart({ data }: { data: ChannelConversionRateRow[] }) {
  return (
    <div className="h-[340px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 30, left: 24, bottom: 8 }}>
          <CartesianGrid stroke="#e4e7ec" horizontal={false} />
          <XAxis type="number" tickFormatter={(value) => `${value}%`} domain={[45, 52]} fontSize={12} />
          <YAxis type="category" dataKey="channel" width={112} fontSize={12} />
          <Tooltip content={<TooltipBox />} />
          <Bar dataKey="conversionRatePct" name="Conversion rate %" radius={[0, 4, 4, 0]} isAnimationActive={false}>
            {data.map((row) => (
              <Cell key={row.channel} fill={channelColors[row.channel]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ChannelMetricBarChart({
  data,
  valueKey,
  name,
  domain,
  percent = true
}: {
  data: Array<Record<string, string | number>>;
  valueKey: string;
  name: string;
  domain?: [number, number];
  percent?: boolean;
}) {
  return (
    <div className="h-[340px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 34, left: 24, bottom: 8 }}>
          <CartesianGrid stroke="#e4e7ec" horizontal={false} />
          <XAxis
            type="number"
            tickFormatter={(value) => (percent ? `${value}%` : formatNumber(Number(value), 1))}
            domain={domain}
            fontSize={12}
          />
          <YAxis type="category" dataKey="channel" width={112} fontSize={12} />
          <Tooltip
            formatter={(value) => [percent ? formatPct(Number(value)) : formatNumber(Number(value), 2), name]}
          />
          <Bar dataKey={valueKey} name={name} radius={[0, 4, 4, 0]} isAnimationActive={false}>
            {data.map((row) => (
              <Cell key={String(row.channel)} fill={channelColors[String(row.channel)] ?? COLORS.first} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function LogisticShareChart({ data }: { data: AdjustedChannelShareRow[] }) {
  return (
    <div className="h-[340px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 34, left: 24, bottom: 8 }}>
          <CartesianGrid stroke="#e4e7ec" horizontal={false} />
          <XAxis type="number" tickFormatter={(value) => `${value}%`} fontSize={12} />
          <YAxis type="category" dataKey="channel" width={112} fontSize={12} />
          <Tooltip content={<TooltipBox />} />
          <Bar dataKey="logitAdjustedSharePct" name="Logistic-adjusted share %" radius={[0, 4, 4, 0]} isAnimationActive={false}>
            {data.map((row) => (
              <Cell key={row.channel} fill={channelColors[row.channel]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function OddsRatioForest({ data }: { data: RegressionCoefficientRow[] }) {
  const rows = data.filter((row) => row.predictor !== "const");
  const min = 0.65;
  const max = 3;
  const scale = (value: number) => `${((Math.min(max, Math.max(min, value)) - min) / (max - min)) * 100}%`;

  return (
    <div className="space-y-3">
      <div className="relative h-8 rounded-lg bg-surface px-3 text-xs text-muted">
        <div className="absolute left-[14.9%] top-0 h-full border-l border-dashed border-muted" />
        <span className="absolute bottom-1 left-[14.9%] -translate-x-1/2">OR 1.0</span>
        <span className="absolute bottom-1 left-0">0.65</span>
        <span className="absolute bottom-1 right-0">3.0</span>
      </div>
      <div className="space-y-3">
        {rows.map((row) => {
          const significant = row.pValue < 0.05;
          return (
            <div key={row.predictor} className="grid grid-cols-[150px_1fr_104px] items-center gap-3 text-sm">
              <span className="truncate text-muted">{row.predictor.replace("Channel_", "")}</span>
              <div className="relative h-7 rounded bg-surface">
                <span className="absolute top-1/2 h-1 -translate-y-1/2 rounded bg-muted" style={{ left: scale(row.ciLow), right: `calc(100% - ${scale(row.ciHigh)})` }} />
                <span
                  className={`absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white ${significant ? "bg-brand" : "bg-muted"}`}
                  style={{ left: scale(row.oddsRatio) }}
                />
              </div>
              <span className="text-right tabular-nums text-ink">{row.oddsRatio.toFixed(2)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ModelComparisonHeatmap({ data }: { data: ModelComparisonRow[] }) {
  const columns = [
    { key: "firstTouchPct", label: "FT" },
    { key: "lastTouchPct", label: "LT" },
    { key: "linearPct", label: "Linear" },
    { key: "logitAdjustedPct", label: "Logit" },
    { key: "markovPositiveRemovalPct", label: "Markov" }
  ] as const;

  const values = data.flatMap((row) => columns.map((column) => Number(row[column.key])));
  const max = Math.max(...values);

  return (
    <div className="thin-scrollbar overflow-x-auto">
      <div className="min-w-[680px]">
        <div className="grid grid-cols-[150px_repeat(5,1fr)] gap-2 text-sm">
          <div />
          {columns.map((column) => (
            <div key={column.key} className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-[0.1em] text-muted">
              {column.label}
            </div>
          ))}
          {data.map((row) => (
            <div key={row.channel} className="contents">
              <div className="flex items-center text-sm font-medium text-ink">{row.channel}</div>
              {columns.map((column) => {
                const value = Number(row[column.key]);
                const alpha = max ? 0.12 + (value / max) * 0.76 : 0.12;
                return (
                  <div
                    key={`${row.channel}-${column.key}`}
                    className="rounded-md px-3 py-3 text-center text-sm font-semibold tabular-nums text-ink"
                    style={{ backgroundColor: `rgba(35, 100, 170, ${alpha})` }}
                  >
                    {formatPct(value)}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MarkovRemovalChart({ data }: { data: RemovalEffectRow[] }) {
  return (
    <div className="h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 30, left: 24, bottom: 8 }}>
          <CartesianGrid stroke="#e4e7ec" horizontal={false} />
          <XAxis type="number" tickFormatter={(value) => `${value}%`} fontSize={12} />
          <YAxis type="category" dataKey="channel" width={112} fontSize={12} />
          <Tooltip content={<TooltipBox />} />
          <Bar dataKey="markovSharePct" name="Markov share %" fill={COLORS.markov} radius={[0, 4, 4, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SimulationResultsChart({ data }: { data: SimulationResultRow[] }) {
  const chartData = data.map((row) => ({
    ...row,
    scenarioLabel: scenarioLabel(row.scenario)
  }));

  return (
    <div className="h-[330px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 18, left: 0, bottom: 42 }}>
          <CartesianGrid stroke="#e4e7ec" vertical={false} />
          <XAxis dataKey="scenarioLabel" angle={-18} textAnchor="end" height={58} fontSize={12} />
          <YAxis tickFormatter={(value) => `$${Number(value).toFixed(0)}`} fontSize={12} />
          <Tooltip
            formatter={(value, name) => [formatCurrency(Number(value), 2), String(name)]}
            labelFormatter={(label) => String(label)}
          />
          <Bar dataKey="deltaRevenue" name="Delta revenue" fill={COLORS.good} radius={[4, 4, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ScenarioMetricChart({
  data,
  metric,
  label,
  valueType = "number"
}: {
  data: SimulationResultRow[];
  metric: keyof SimulationResultRow;
  label: string;
  valueType?: "number" | "currency" | "percent";
}) {
  function formatValue(value: number) {
    if (valueType === "currency") {
      return formatCurrency(value, 2);
    }
    if (valueType === "percent") {
      return formatPct(value, 4);
    }
    return formatNumber(value, 2);
  }

  const max = Math.max(...data.map((row) => Math.abs(Number(row[metric]))), 1);

  return (
    <div className="flex min-h-[330px] flex-col justify-center gap-5">
      {data.map((row) => {
        const value = Number(row[metric]);
        const width = `${Math.max(2, (Math.abs(value) / max) * 100)}%`;
        return (
          <div key={row.scenario} className="grid gap-2">
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="font-medium text-ink">{scenarioLabel(row.scenario)}</span>
              <span className="font-semibold tabular-nums text-ink">{formatValue(value)}</span>
            </div>
            <div className="h-4 overflow-hidden rounded-full bg-surface">
              <div
                className="h-full rounded-full bg-brand"
                style={{ width }}
                aria-label={`${scenarioLabel(row.scenario)} ${label}: ${formatValue(value)}`}
              />
            </div>
          </div>
        );
      })}
      <p className="text-xs text-muted">{label} comparison across the three predefined budget scenarios.</p>
    </div>
  );
}

export function BudgetWeightsChart({ data }: { data: BudgetWeightRow[] }) {
  return (
    <div className="h-[360px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 18, left: 0, bottom: 42 }}>
          <CartesianGrid stroke="#e4e7ec" vertical={false} />
          <XAxis dataKey="channel" tickFormatter={compactTick} angle={-25} textAnchor="end" height={68} fontSize={12} />
          <YAxis tickFormatter={(value) => `${Number(value * 100).toFixed(0)}%`} fontSize={12} />
          <Tooltip formatter={(value, name) => [formatShare(Number(value)), String(name)]} />
          <Legend />
          <Bar dataKey="s0Equal" name="S0 Equal" fill={COLORS.muted} radius={[4, 4, 0, 0]} isAnimationActive={false} />
          <Bar dataKey="s1ConversionRate" name="S1 Conversion-rate" fill={COLORS.first} radius={[4, 4, 0, 0]} isAnimationActive={false} />
          <Bar dataKey="s2LinearAttribution" name="S2 Linear attribution" fill={COLORS.linear} radius={[4, 4, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SensitivityChart({ data }: { data: SensitivityRow[] }) {
  const chartData = data.map((row) => ({
    ...row,
    scenarioLabel: scenarioLabel(row.scenario),
    revenueFactorLabel: `${Math.round(row.revenueFactor * 100)}%`
  }));

  return (
    <div className="h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 12, right: 24, left: 0, bottom: 12 }}>
          <CartesianGrid stroke="#e4e7ec" vertical={false} />
          <XAxis dataKey="revenueFactorLabel" fontSize={12} />
          <YAxis tickFormatter={(value) => `$${formatNumber(Number(value), 0)}`} fontSize={12} />
          <Tooltip formatter={(value, name) => [formatCurrency(Number(value), 2), String(name)]} />
          <Legend />
          <Line type="monotone" dataKey="revenue" name="Revenue" stroke={COLORS.first} strokeWidth={2} dot isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

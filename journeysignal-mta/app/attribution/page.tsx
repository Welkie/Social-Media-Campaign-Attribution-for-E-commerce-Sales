import { ChartPanel } from "@/components/dashboard/chart-panel";
import { DataTable } from "@/components/dashboard/data-table";
import { AttributionExplorer } from "@/components/dashboard/explorers";
import { InsightCallout } from "@/components/dashboard/insight-callout";
import { KpiTile } from "@/components/dashboard/kpi-tile";
import { PageHeader } from "@/components/dashboard/page-header";
import { ConversionRateChart } from "@/components/charts/dashboard-charts";
import { getAttributionData } from "@/lib/data/load-dashboard-data";
import type { AttributionShareRow, ChannelConversionRateRow, MetricValueRow } from "@/lib/data/types";
import { formatNumber, formatPct } from "@/lib/metrics/formatters";

export default function AttributionPage() {
  const data = getAttributionData();
  const socialLinear = data.shares.find((row) => row.channel === "Social Media")?.linearPct ?? 0;
  const topLinear = [...data.shares].sort((a, b) => b.linearPct - a.linearPct)[0];

  return (
    <div>
      <PageHeader
        eyebrow="RQ1"
        title="Attribution Results"
        description="Compare Social Media against other channels using First-Touch, Last-Touch, and Linear attribution rules."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <KpiTile label="Social Media linear share" value={formatPct(socialLinear)} detail="Social Media remains relevant but not dominant." />
        <KpiTile label="Top linear channel" value={topLinear.channel} detail={`${formatPct(topLinear.linearPct)} under Linear attribution.`} />
        <KpiTile label="Attribution rules" value="3" detail="First-Touch, Last-Touch, and Linear are compared side by side." />
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <AttributionExplorer data={data.shares} />
        <div className="space-y-4">
          <InsightCallout label="RQ1 answer" tone="info">
            Social Media receives {formatPct(socialLinear)} under Linear attribution and remains close to the other channels. The result does not support a claim that Social Media is the single strongest conversion driver.
          </InsightCallout>
          <ChartPanel title="Social Media summary">
            <DataTable<MetricValueRow>
              rows={data.socialMediaSummary}
              columns={[
                { key: "metric", header: "Metric", render: (row) => row.metric },
                { key: "value", header: "Value", align: "right", render: (row) => String(row.value) }
              ]}
            />
          </ChartPanel>
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <ChartPanel title="Channel conversion rate" description="Conversion rates are close across channels, which helps explain why simple attribution outputs are similar.">
          <ConversionRateChart data={data.conversionRates} />
        </ChartPanel>
        <ChartPanel title="Attribution table" description="Exact values from the Python output CSV.">
          <DataTable<AttributionShareRow>
            rows={data.shares}
            columns={[
              { key: "channel", header: "Channel", render: (row) => row.channel },
              { key: "first", header: "First-Touch", align: "right", render: (row) => formatPct(row.firstTouchPct) },
              { key: "last", header: "Last-Touch", align: "right", render: (row) => formatPct(row.lastTouchPct) },
              { key: "linear", header: "Linear", align: "right", render: (row) => formatPct(row.linearPct) }
            ]}
          />
        </ChartPanel>
      </section>

      <section className="mt-6">
        <ChartPanel title="Conversion rate table" description="Touchpoints and conversion touchpoints by channel.">
          <DataTable<ChannelConversionRateRow>
            rows={data.conversionRates}
            columns={[
              { key: "channel", header: "Channel", render: (row) => row.channel },
              { key: "touchpoints", header: "Touchpoints", align: "right", render: (row) => formatNumber(row.touchpoints) },
              { key: "conv", header: "Conversion touchpoints", align: "right", render: (row) => formatNumber(row.conversionTouchpoints) },
              { key: "rate", header: "Conversion rate", align: "right", render: (row) => formatPct(row.conversionRatePct) }
            ]}
          />
        </ChartPanel>
      </section>
    </div>
  );
}

import { ChartPanel } from "@/components/dashboard/chart-panel";
import { DataTable } from "@/components/dashboard/data-table";
import { InsightCallout } from "@/components/dashboard/insight-callout";
import { KpiTile } from "@/components/dashboard/kpi-tile";
import { PageHeader } from "@/components/dashboard/page-header";
import { MarkovRemovalChart, ModelComparisonHeatmap } from "@/components/charts/dashboard-charts";
import { getComparisonData } from "@/lib/data/load-dashboard-data";
import type { ModelComparisonRow, RemovalEffectRow } from "@/lib/data/types";
import { formatPct } from "@/lib/metrics/formatters";

export default function ComparisonPage() {
  const data = getComparisonData();
  const topMarkov = [...data.removalEffect].sort((a, b) => b.markovSharePct - a.markovSharePct)[0];
  const secondMarkov = [...data.removalEffect].sort((a, b) => b.markovSharePct - a.markovSharePct)[1];

  return (
    <div>
      <PageHeader
        eyebrow="RQ2 extension"
        title="Model Comparison"
        description="Compare rule-based attribution, logistic-adjusted attribution, and Markov removal effect in one view."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <KpiTile label="Top Markov channel" value={topMarkov.channel} detail={`${formatPct(topMarkov.markovSharePct)} of positive removal share.`} />
        <KpiTile label="Second Markov channel" value={secondMarkov.channel} detail={`${formatPct(secondMarkov.markovSharePct)} of positive removal share.`} />
        <KpiTile label="Compared methods" value="5" detail="FT, LT, Linear, Logistic-adjusted, Markov." />
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <ChartPanel title="Attribution model comparison" description="Heatmap view of channel shares across heuristic, regression, and Markov outputs.">
          <ModelComparisonHeatmap data={data.modelComparison} />
        </ChartPanel>
        <div className="space-y-4">
          <InsightCallout label="Comparison insight" tone="info">
            First-Touch, Last-Touch, and Linear are relatively even. Logistic-adjusted attribution increases Display Ads and Email. Markov removal effect is concentrated in Display Ads and Referral.
          </InsightCallout>
          <InsightCallout label="Interpretation caveat" tone="warn">
            Markov is useful as an additional check, but its concentrated result should not override the regression and attribution evidence without business context.
          </InsightCallout>
        </div>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <ChartPanel title="Markov positive removal share" description="Only channels with positive removal effects receive positive Markov share.">
          <MarkovRemovalChart data={data.removalEffect} />
        </ChartPanel>
        <ChartPanel title="Exact comparison table" description="Values from `03_model_comparison.csv`.">
          <DataTable<ModelComparisonRow>
            rows={data.modelComparison}
            columns={[
              { key: "channel", header: "Channel", render: (row) => row.channel },
              { key: "ft", header: "FT", align: "right", render: (row) => formatPct(row.firstTouchPct) },
              { key: "lt", header: "LT", align: "right", render: (row) => formatPct(row.lastTouchPct) },
              { key: "linear", header: "Linear", align: "right", render: (row) => formatPct(row.linearPct) },
              { key: "logit", header: "Logit", align: "right", render: (row) => formatPct(row.logitAdjustedPct) },
              { key: "markov", header: "Markov", align: "right", render: (row) => formatPct(row.markovPositiveRemovalPct) }
            ]}
          />
        </ChartPanel>
      </section>

      <section className="mt-6">
        <ChartPanel title="Markov removal effect details" description="Baseline conversion probability compared with conversion probability after removing each channel.">
          <DataTable<RemovalEffectRow>
            rows={data.removalEffect}
            columns={[
              { key: "channel", header: "Channel", render: (row) => row.channel },
              { key: "baseline", header: "Baseline prob.", align: "right", render: (row) => row.baselineConversionProbability.toFixed(4) },
              { key: "without", header: "Without channel", align: "right", render: (row) => row.conversionProbabilityWithoutChannel.toFixed(4) },
              { key: "effect", header: "Removal effect %", align: "right", render: (row) => row.removalEffectPct.toFixed(4) },
              { key: "share", header: "Markov share", align: "right", render: (row) => formatPct(row.markovSharePct) }
            ]}
          />
        </ChartPanel>
      </section>
    </div>
  );
}

import { ArrowRight, BarChart3, GitCompare, LineChart, Network, PieChart, Users } from "lucide-react";
import Link from "next/link";
import { ChartPanel } from "@/components/dashboard/chart-panel";
import { InsightCallout } from "@/components/dashboard/insight-callout";
import { KpiTile } from "@/components/dashboard/kpi-tile";
import { PageHeader } from "@/components/dashboard/page-header";
import { AttributionGroupedChart, SimulationResultsChart } from "@/components/charts/dashboard-charts";
import { getOverviewData } from "@/lib/data/load-dashboard-data";
import { formatNumber } from "@/lib/metrics/formatters";

export default function OverviewPage() {
  const data = getOverviewData();
  const summary = data.projectSummary;

  return (
    <div>
      <PageHeader
        eyebrow="Public research dashboard"
        title="Journey Signal"
        description="An interactive multi-touch attribution dashboard for evaluating campaign channels, regression evidence, Markov removal effects, and budget simulation outcomes."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiTile label="Touchpoints" value={formatNumber(summary.touchpoints)} detail="Customer-channel interactions in the analysis dataset." icon={<BarChart3 size={20} />} />
        <KpiTile label="Users" value={formatNumber(summary.users)} detail="Unique customer journeys represented in the cleaned data." icon={<Users size={20} />} />
        <KpiTile label="Converted users" value={formatNumber(summary.convertedUsers)} detail="Journeys with at least one positive conversion signal." icon={<LineChart size={20} />} />
        <KpiTile label="Models" value={formatNumber(summary.models.length)} detail="Attribution, regression, Markov, and simulation outputs." icon={<Network size={20} />} />
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        {summary.researchQuestions.map((rq) => (
          <Link key={rq.id} href={rq.id === "RQ1" ? "/attribution" : rq.id === "RQ2" ? "/regression" : "/simulation"} className="group rounded-lg border border-line bg-white p-4 shadow-soft transition hover:border-brand">
            <div className="mb-4 flex items-center justify-between">
              <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-brand">{rq.id}</span>
              <ArrowRight size={17} className="text-muted transition group-hover:translate-x-1 group-hover:text-brand" />
            </div>
            <h2 className="text-base font-semibold text-ink">{rq.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{rq.question}</p>
          </Link>
        ))}
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <ChartPanel title="Attribution preview" description="First-Touch, Last-Touch, and Linear attribution produce relatively even shares across the six channels.">
          <AttributionGroupedChart data={data.attributionPreview} />
        </ChartPanel>
        <div className="space-y-4">
          <InsightCallout label="Main finding" tone="info">
            Basic attribution does not show a dominant channel. Social Media stays around 16-17% depending on the rule, which makes it relevant but not clearly leading.
          </InsightCallout>
          <InsightCallout label="Regression finding" tone="neutral">
            Logistic regression ranks Display Ads highest, followed by Email and Social Media. Journey length is a stronger signal than channel identity alone.
          </InsightCallout>
          <InsightCallout label="Simulation finding" tone="warn">
            Reallocation scenarios produce small positive gains. They should be presented as simulated comparisons, not real revenue forecasts.
          </InsightCallout>
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <ChartPanel title="Simulation delta revenue" description="Budget reallocation scenarios improve simulated revenue slightly versus equal allocation.">
          <SimulationResultsChart data={data.simulationResults} />
        </ChartPanel>
        <ChartPanel title="Research workflow" description="The app presents the same pipeline used in the notebooks, from attribution to regression and simulation.">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Attribution", "Compare First-Touch, Last-Touch, and Linear channel shares.", PieChart],
              ["Regression", "Use logistic regression as a benchmark for channel signals.", LineChart],
              ["Comparison", "Contrast heuristic, logistic, and Markov outputs.", GitCompare],
              ["Simulation", "Estimate scenario differences under fixed assumptions.", BarChart3]
            ].map(([title, body, Icon]) => {
              const IconComponent = Icon as typeof PieChart;
              return (
                <div key={String(title)} className="rounded-lg border border-line bg-surface p-4">
                  <IconComponent size={18} className="text-brand" />
                  <h3 className="mt-3 text-sm font-semibold text-ink">{title as string}</h3>
                  <p className="mt-1 text-sm leading-5 text-muted">{body as string}</p>
                </div>
              );
            })}
          </div>
        </ChartPanel>
      </section>
    </div>
  );
}

import { ChartPanel } from "@/components/dashboard/chart-panel";
import { DataTable } from "@/components/dashboard/data-table";
import { SimulationExplorer } from "@/components/dashboard/explorers";
import { InsightCallout } from "@/components/dashboard/insight-callout";
import { KpiTile } from "@/components/dashboard/kpi-tile";
import { PageHeader } from "@/components/dashboard/page-header";
import { BudgetWeightsChart, SensitivityChart } from "@/components/charts/dashboard-charts";
import { getSimulationData } from "@/lib/data/load-dashboard-data";
import type { AssumptionRow, BudgetWeightRow, SimulationResultRow } from "@/lib/data/types";
import { formatCurrency, formatNumber, formatPct, formatShare, scenarioLabel } from "@/lib/metrics/formatters";

export default function SimulationPage() {
  const data = getSimulationData();
  const s1 = data.results.find((row) => row.scenario === "S1_conversion_rate");
  const s2 = data.results.find((row) => row.scenario === "S2_linear_attribution");

  return (
    <div>
      <PageHeader
        eyebrow="RQ3"
        title="Budget Simulation"
        description="Compare equal budget allocation with conversion-rate weighting and Linear-attribution weighting."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <KpiTile label="S1 delta revenue" value={formatCurrency(s1?.deltaRevenue ?? 0, 2)} detail={`${formatPct(s1?.deltaRevPct ?? 0, 4)} vs S0 equal.`} />
        <KpiTile label="S2 delta revenue" value={formatCurrency(s2?.deltaRevenue ?? 0, 2)} detail={`${formatPct(s2?.deltaRevPct ?? 0, 4)} vs S0 equal.`} />
        <KpiTile label="Revenue assumption" value="$100" detail="Per conversion in the baseline simulation." />
      </section>

      <section className="mt-6">
        <SimulationExplorer data={data.results} />
      </section>

      <section className="mt-6">
        <div className="space-y-4">
          <InsightCallout label="RQ3 answer" tone="info">
            Both reallocation approaches improve simulated revenue versus equal allocation, but the uplift is very small. This supports cautious optimization, not a strong forecasting claim.
          </InsightCallout>
          <InsightCallout label="Forecast caveat" tone="warn">
            These are simulated scenario comparisons under simplifying assumptions. The dashboard should not present them as actual future revenue.
          </InsightCallout>
          <ChartPanel title="Assumptions">
            <DataTable<AssumptionRow>
              rows={data.assumptions}
              columns={[
                { key: "parameter", header: "Parameter", render: (row) => row.parameter },
                { key: "value", header: "Value", align: "right", render: (row) => String(row.value) }
              ]}
            />
          </ChartPanel>
        </div>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <ChartPanel title="Budget weights by channel" description="S1 follows conversion-rate signal; S2 follows Linear attribution share.">
          <BudgetWeightsChart data={data.budgetWeights} />
        </ChartPanel>
        <ChartPanel title="Sensitivity by revenue factor" description="Revenue changes with the revenue-per-conversion factor, while relative scenario differences remain small.">
          <SensitivityChart data={data.sensitivity} />
        </ChartPanel>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-2">
        <ChartPanel title="Scenario result table" description="Exact values from `04_results.csv`.">
          <DataTable<SimulationResultRow>
            rows={data.results}
            columns={[
              { key: "scenario", header: "Scenario", render: (row) => scenarioLabel(row.scenario) },
              { key: "conv", header: "Conversions", align: "right", render: (row) => formatNumber(row.conversions, 2) },
              { key: "revenue", header: "Revenue", align: "right", render: (row) => formatCurrency(row.revenue, 2) },
              { key: "delta", header: "Delta revenue", align: "right", render: (row) => formatCurrency(row.deltaRevenue, 2) }
            ]}
          />
        </ChartPanel>
        <ChartPanel title="Budget allocation table" description="Weights used by each scenario.">
          <DataTable<BudgetWeightRow>
            rows={data.budgetWeights}
            columns={[
              { key: "channel", header: "Channel", render: (row) => row.channel },
              { key: "s0", header: "S0", align: "right", render: (row) => formatShare(row.s0Equal) },
              { key: "s1", header: "S1", align: "right", render: (row) => formatShare(row.s1ConversionRate) },
              { key: "s2", header: "S2", align: "right", render: (row) => formatShare(row.s2LinearAttribution) }
            ]}
          />
        </ChartPanel>
      </section>
    </div>
  );
}

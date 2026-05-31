import { ChartPanel } from "@/components/dashboard/chart-panel";
import { DataTable } from "@/components/dashboard/data-table";
import { RegressionExplorer } from "@/components/dashboard/explorers";
import { InsightCallout } from "@/components/dashboard/insight-callout";
import { KpiTile } from "@/components/dashboard/kpi-tile";
import { PageHeader } from "@/components/dashboard/page-header";
import { getRegressionData } from "@/lib/data/load-dashboard-data";
import type { RegressionMetricRow, SpearmanRow } from "@/lib/data/types";
import { formatNumber, formatPValue, modelLabel } from "@/lib/metrics/formatters";

export default function RegressionPage() {
  const data = getRegressionData();
  const mainModel = data.modelMetrics.find((row) => row.model === "channel_plus_length");
  const social = data.adjustedCoefficients.find((row) => row.predictor === "Channel_Social Media");
  const display = data.adjustedCoefficients.find((row) => row.predictor === "Channel_Display Ads");
  const journey = data.adjustedCoefficients.find((row) => row.predictor === "N_Touchpoints");

  return (
    <div>
      <PageHeader
        eyebrow="RQ2"
        title="Regression Benchmark"
        description="Use logistic regression as a statistical benchmark for the attribution models while controlling for journey length."
      />

      <section className="grid gap-4 md:grid-cols-4">
        <KpiTile label="Main model AUC" value={mainModel ? mainModel.aucTest.toFixed(4) : "n/a"} detail="Test-set AUC for channel + journey length." />
        <KpiTile label="Pseudo-R2" value={mainModel ? mainModel.pseudoR2Mcfadden.toFixed(4) : "n/a"} detail="McFadden pseudo-R2 for the main benchmark." />
        <KpiTile label="Display Ads OR" value={display ? display.oddsRatio.toFixed(2) : "n/a"} detail={`p=${formatPValue(display?.pValue)}`} />
        <KpiTile label="Social Media OR" value={social ? social.oddsRatio.toFixed(2) : "n/a"} detail={`p=${formatPValue(social?.pValue)}; positive but marginal.`} />
      </section>

      <section className="mt-6">
        <RegressionExplorer coefficients={data.adjustedCoefficients} adjustedShare={data.adjustedChannelShare} />
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <InsightCallout label="Regression interpretation" tone="info">
            Display Ads and Email are statistically significant positive channel predictors. Social Media is positive but marginal. The strongest overall predictor is `N_Touchpoints`, confirming journey length as a major confounder.
          </InsightCallout>
          <InsightCallout label="Causal caveat" tone="warn">
            These coefficients should be written as association, not causation. The data is observational and the model does not prove that a channel directly caused conversion.
          </InsightCallout>
          <KpiTile label="N_Touchpoints odds ratio" value={journey ? journey.oddsRatio.toFixed(2) : "n/a"} detail="Journey length is strongly associated with conversion." />
        </div>
        <ChartPanel title="Model performance" description="Journey length alone performs at least as well as channel exposure, which is a key limitation.">
          <DataTable<RegressionMetricRow>
            rows={data.modelMetrics}
            columns={[
              { key: "model", header: "Model", render: (row) => modelLabel(row.model) },
              { key: "n", header: "Train/Test", align: "right", render: (row) => `${formatNumber(row.nTrain)}/${formatNumber(row.nTest)}` },
              { key: "auc", header: "AUC", align: "right", render: (row) => row.aucTest.toFixed(4) },
              { key: "r2", header: "Pseudo-R2", align: "right", render: (row) => row.pseudoR2Mcfadden.toFixed(4) }
            ]}
          />
        </ChartPanel>
      </section>

      <section className="mt-6">
        <ChartPanel title="Heuristic alignment with regression" description="Spearman rank correlation compares channel rankings, not exact values.">
          <DataTable<SpearmanRow>
            rows={data.spearmanVsLogit}
            columns={[
              { key: "model", header: "Heuristic", render: (row) => modelLabel(row.heuristicModel) },
              { key: "rho", header: "Spearman rho", align: "right", render: (row) => row.spearmanRho.toFixed(4) },
              { key: "p", header: "p-value", align: "right", render: (row) => formatPValue(row.pValue) }
            ]}
          />
        </ChartPanel>
      </section>
    </div>
  );
}

import { ChartPanel } from "@/components/dashboard/chart-panel";
import { InsightCallout } from "@/components/dashboard/insight-callout";
import { PageHeader } from "@/components/dashboard/page-header";

const sections = [
  {
    title: "Data pipeline",
    body: "The web app uses precomputed CSV outputs from the Python notebooks. The dashboard does not rerun models; it parses the exported attribution, regression, Markov, and simulation tables into typed JSON."
  },
  {
    title: "First-Touch Attribution",
    body: "First-Touch gives full conversion credit to the first channel in a user's journey. It is easy to explain but can overvalue awareness channels."
  },
  {
    title: "Last-Touch Attribution",
    body: "Last-Touch gives full conversion credit to the final channel before conversion. It is simple but can overvalue closing channels."
  },
  {
    title: "Linear Attribution",
    body: "Linear attribution splits credit evenly across all touchpoints in the journey. It is more balanced but assumes every touchpoint contributes equally."
  },
  {
    title: "Logistic Regression Benchmark",
    body: "Logistic regression models whether a user converted. Channel exposure variables are used with N_Touchpoints as a control so the benchmark does not confuse channel presence with journey length."
  },
  {
    title: "Markov Removal Effect",
    body: "The Markov model estimates how conversion probability changes when a channel is removed from the journey transition process. It is used as an additional comparison point."
  },
  {
    title: "Budget Simulation",
    body: "The simulation compares equal allocation against conversion-rate and Linear-attribution weighting. It uses simplifying assumptions, so results should be treated as scenario comparisons."
  }
];

export default function MethodologyPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Research method"
        title="Methodology"
        description="How the Journey Signal dashboard turns Python analysis outputs into report-ready evidence."
      />

      <section className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
        <div className="space-y-4">
          <InsightCallout label="Important limitation" tone="warn">
            Attribution and regression results should be interpreted as analytical evidence from observational data. They do not prove that a channel caused conversions.
          </InsightCallout>
          <InsightCallout label="Web app boundary" tone="info">
            The app is a presentation and explanation layer. The statistical work is produced by the Python notebooks and exported CSV files.
          </InsightCallout>
        </div>

        <ChartPanel title="Analysis workflow" description="The dashboard mirrors the research flow used in the project report.">
          <div className="space-y-3">
            {sections.map((section, index) => (
              <div key={section.title} className="grid gap-3 rounded-lg border border-line bg-surface p-4 sm:grid-cols-[44px_1fr]">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-sm font-semibold text-brand">
                  {index + 1}
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-ink">{section.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-muted">{section.body}</p>
                </div>
              </div>
            ))}
          </div>
        </ChartPanel>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <InsightCallout label="RQ1 method">
          First/Last/Linear attribution answer how credit is distributed across channels, especially Social Media.
        </InsightCallout>
        <InsightCallout label="RQ2 method">
          Logistic regression, Spearman correlation, KL divergence, and Markov removal effect benchmark the simple attribution rules.
        </InsightCallout>
        <InsightCallout label="RQ3 method">
          Budget simulation compares predefined allocation scenarios under fixed revenue assumptions.
        </InsightCallout>
      </section>
    </div>
  );
}

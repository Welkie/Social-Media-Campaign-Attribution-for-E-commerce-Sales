import analysisContextJson from "@/data/generated/analysis-context.json";
import dashboardDataJson from "@/data/generated/dashboard-data.json";
import type { AnalysisContext, DashboardData } from "./types";

export function getDashboardData(): DashboardData {
  return dashboardDataJson as unknown as DashboardData;
}

export function getAnalysisContext(): AnalysisContext {
  return analysisContextJson as unknown as AnalysisContext;
}

export function getOverviewData() {
  const data = getDashboardData();
  return {
    projectSummary: data.projectSummary,
    attributionPreview: data.attribution.shares,
    regressionShare: data.regression.adjustedChannelShare,
    simulationResults: data.simulation.results
  };
}

export function getAttributionData() {
  return getDashboardData().attribution;
}

export function getRegressionData() {
  return getDashboardData().regression;
}

export function getComparisonData() {
  return getDashboardData().comparison;
}

export function getSimulationData() {
  return getDashboardData().simulation;
}

export type Channel =
  | "Direct Traffic"
  | "Display Ads"
  | "Email"
  | "Referral"
  | "Search Ads"
  | "Social Media";

export type ResearchQuestion = {
  id: "RQ1" | "RQ2" | "RQ3";
  title: string;
  question: string;
};

export type ProjectSummary = {
  touchpoints: number;
  users: number;
  convertedUsers: number;
  channels: number;
  models: string[];
  researchQuestions: ResearchQuestion[];
};

export type AttributionShareRow = {
  channel: Channel;
  firstTouchPct: number;
  lastTouchPct: number;
  linearPct: number;
};

export type ChannelConversionRateRow = {
  channel: Channel;
  touchpoints: number;
  conversionTouchpoints: number;
  conversionRate: number;
  conversionRatePct: number;
};

export type MetricValueRow = {
  metric: string;
  value: string | number;
};

export type RegressionMetricRow = {
  model: string;
  nTrain: number;
  nTest: number;
  positiveRate: number;
  pseudoR2Mcfadden: number;
  aucTest: number;
};

export type RegressionCoefficientRow = {
  predictor: string;
  coefficient: number;
  oddsRatio: number;
  ciLow: number;
  ciHigh: number;
  pValue: number;
};

export type AdjustedChannelShareRow = {
  channel: Channel;
  logitAdjustedSharePct: number;
};

export type SpearmanRow = {
  heuristicModel: string;
  benchmark: string;
  spearmanRho: number;
  pValue: number;
};

export type KlDivergenceRow = {
  p: string;
  q: string;
  klPQQ?: number;
  klPq?: number;
  [key: string]: string | number | undefined;
};

export type ChiSquareRow = {
  test: string;
  chiSquare: number;
  pValue: number;
  degreesOfFreedom: number;
};

export type InterpretationNoteRow = {
  finding: string;
  evidence: string;
};

export type ModelComparisonRow = {
  channel: Channel;
  firstTouchPct: number;
  lastTouchPct: number;
  linearPct: number;
  logitAdjustedPct: number;
  markovPositiveRemovalPct: number;
};

export type RemovalEffectRow = {
  channel: Channel;
  baselineConversionProbability: number;
  conversionProbabilityWithoutChannel: number;
  removalEffectAbs: number;
  removalEffectPct: number;
  positiveRemovalEffect: number;
  markovSharePct: number;
};

export type SimulationResultRow = {
  scenario: string;
  conversions: number;
  revenue: number;
  deltaConversions: number;
  deltaRevenue: number;
  deltaConvPct: number;
  deltaRevPct: number;
};

export type BudgetWeightRow = {
  channel: Channel;
  s0Equal: number;
  s1ConversionRate: number;
  s2LinearAttribution: number;
};

export type RoiByChannelRow = {
  channel: Channel;
  s0Equal: number;
  s1ConversionRate: number;
  s2LinearAttribution: number;
};

export type SensitivityRow = {
  scenario: string;
  revenueFactor: number;
  revenuePerConversion: number;
  conversions: number;
  revenue: number;
  deltaRevPctVsS0: number;
};

export type AssumptionRow = {
  parameter: string;
  value: string | number;
};

export type DashboardData = {
  projectSummary: ProjectSummary;
  attribution: {
    shares: AttributionShareRow[];
    conversionRates: ChannelConversionRateRow[];
    socialMediaSummary: MetricValueRow[];
  };
  regression: {
    modelMetrics: RegressionMetricRow[];
    adjustedCoefficients: RegressionCoefficientRow[];
    adjustedChannelShare: AdjustedChannelShareRow[];
    spearmanVsLogit: SpearmanRow[];
    klDivergence: KlDivergenceRow[];
    chiSquare: ChiSquareRow[];
    interpretationNotes: InterpretationNoteRow[];
  };
  comparison: {
    modelComparison: ModelComparisonRow[];
    removalEffect: RemovalEffectRow[];
    markovAttributionShare: Array<{ channel: Channel; markovSharePct: number }>;
    transitionMatrix: Array<Record<string, string | number>>;
  };
  simulation: {
    results: SimulationResultRow[];
    budgetWeights: BudgetWeightRow[];
    roiByChannel: RoiByChannelRow[];
    sensitivity: SensitivityRow[];
    assumptions: AssumptionRow[];
    perChannel: {
      s0Equal: Array<Record<string, string | number>>;
      s1ConversionRate: Array<Record<string, string | number>>;
      s2LinearAttribution: Array<Record<string, string | number>>;
    };
  };
};

export type AnalysisContext = {
  appName: string;
  scope: string;
  source: string;
  keyFacts: string[];
  caveats: string[];
  suggestedQuestions: string[];
};

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const rawDir = path.join(root, "data", "raw");
const generatedDir = path.join(root, "data", "generated");

const requiredFiles = {
  attributionShare: "rq1_basic/01_attribution_share.csv",
  channelConversionRate: "rq1_basic/01_channel_conversion_rate.csv",
  socialMediaSummary: "rq1_basic/01_social_media_summary.csv",
  modelMetrics: "rq2_logit/02_model_metrics.csv",
  adjustedCoefficients: "rq2_logit/02_adjusted_coefficients.csv",
  adjustedChannelShare: "rq2_logit/02_adjusted_channel_share.csv",
  spearmanVsLogit: "rq2_logit/02_spearman_vs_logit.csv",
  klDivergence: "rq2_logit/02_kl_divergence.csv",
  chiSquare: "rq2_logit/02_channel_conversion_chi_square.csv",
  interpretationNotes: "rq2_logit/02_interpretation_notes.csv",
  modelComparison: "rq2_markov/03_model_comparison.csv",
  removalEffect: "rq2_markov/03_removal_effect.csv",
  markovAttributionShare: "rq2_markov/03_attribution_share.csv",
  transitionMatrix: "rq2_markov/03_transition_matrix.csv",
  simulationResults: "rq3_simulation/04_results.csv",
  budgetWeights: "rq3_simulation/04_budget_weights.csv",
  roiByChannel: "rq3_simulation/04_roi_by_channel.csv",
  sensitivity: "rq3_simulation/04_sensitivity.csv",
  assumptions: "rq3_simulation/04_assumptions.csv",
  perChannelS0: "rq3_simulation/04_per_channel_S0_equal.csv",
  perChannelS1: "rq3_simulation/04_per_channel_S1_conversion_rate.csv",
  perChannelS2: "rq3_simulation/04_per_channel_S2_linear_attribution.csv"
};

const projectSummary = {
  touchpoints: 10000,
  users: 2847,
  convertedUsers: 2381,
  channels: 6,
  models: ["First-Touch", "Last-Touch", "Linear", "Logistic Regression", "Markov", "Budget Simulation"],
  researchQuestions: [
    {
      id: "RQ1",
      title: "Social Media contribution",
      question: "How much does Social Media contribute to conversion compared with the other five channels?"
    },
    {
      id: "RQ2",
      title: "Attribution model fit",
      question: "Which attribution model best reflects the actual conversion behavior observed in the data?"
    },
    {
      id: "RQ3",
      title: "Budget simulation",
      question: "How much can simulated conversions and revenue improve after reallocating budget by attribution signals?"
    }
  ]
};

function parseCsv(text) {
  const rows = [];
  let field = "";
  let row = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      field += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        i += 1;
      }
      row.push(field);
      field = "";
      if (row.some((cell) => cell.trim() !== "")) {
        rows.push(row);
      }
      row = [];
      continue;
    }

    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((cell) => cell.trim() !== "")) {
      rows.push(row);
    }
  }

  if (rows.length === 0) {
    return [];
  }

  const headers = rows[0].map((header, index) => header.trim() || `index_${index}`);
  return rows.slice(1).map((cells) => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = cells[index] === undefined ? "" : cells[index].trim();
    });
    return obj;
  });
}

function readCsv(relativePath) {
  const fullPath = path.join(rawDir, relativePath);
  if (!existsSync(fullPath)) {
    throw new Error(`Missing required data file: ${relativePath}`);
  }
  return parseCsv(readFileSync(fullPath, "utf8"));
}

function number(value) {
  if (value === "" || value === undefined || value === null) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : value;
}

function rowWithChannel(row) {
  const [firstKey] = Object.keys(row);
  const channel = row.channel || row.Channel || row[firstKey];
  const result = { channel };
  Object.entries(row).forEach(([key, value]) => {
    if (key === firstKey || key === "channel" || key === "Channel") {
      return;
    }
    result[toCamel(key)] = number(value);
  });
  return result;
}

function toCamel(value) {
  return value
    .replace(/^\uFEFF/, "")
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/^[A-Z]/, (chr) => chr.toLowerCase());
}

function camelizeRow(row) {
  const result = {};
  Object.entries(row).forEach(([key, value]) => {
    result[toCamel(key)] = number(value);
  });
  return result;
}

function keyValueRows(rows) {
  return rows.map((row) => ({
    metric: row.metric,
    value: number(row.value)
  }));
}

function assertColumns(name, rows, columns) {
  if (rows.length === 0) {
    throw new Error(`${name} is empty`);
  }
  const keys = Object.keys(rows[0]);
  const missing = columns.filter((column) => !keys.includes(column));
  if (missing.length > 0) {
    throw new Error(`${name} missing columns: ${missing.join(", ")}`);
  }
}

function loadDashboardData() {
  const attributionShare = readCsv(requiredFiles.attributionShare);
  const channelConversionRate = readCsv(requiredFiles.channelConversionRate);
  const socialMediaSummary = readCsv(requiredFiles.socialMediaSummary);
  const modelMetrics = readCsv(requiredFiles.modelMetrics);
  const adjustedCoefficients = readCsv(requiredFiles.adjustedCoefficients);
  const adjustedChannelShare = readCsv(requiredFiles.adjustedChannelShare);
  const spearmanVsLogit = readCsv(requiredFiles.spearmanVsLogit);
  const klDivergence = readCsv(requiredFiles.klDivergence);
  const chiSquare = readCsv(requiredFiles.chiSquare);
  const interpretationNotes = readCsv(requiredFiles.interpretationNotes);
  const modelComparison = readCsv(requiredFiles.modelComparison);
  const removalEffect = readCsv(requiredFiles.removalEffect);
  const markovAttributionShare = readCsv(requiredFiles.markovAttributionShare);
  const transitionMatrix = readCsv(requiredFiles.transitionMatrix);
  const simulationResults = readCsv(requiredFiles.simulationResults);
  const budgetWeights = readCsv(requiredFiles.budgetWeights);
  const roiByChannel = readCsv(requiredFiles.roiByChannel);
  const sensitivity = readCsv(requiredFiles.sensitivity);
  const assumptions = readCsv(requiredFiles.assumptions);
  const perChannelS0 = readCsv(requiredFiles.perChannelS0);
  const perChannelS1 = readCsv(requiredFiles.perChannelS1);
  const perChannelS2 = readCsv(requiredFiles.perChannelS2);

  assertColumns("01_channel_conversion_rate.csv", channelConversionRate, [
    "Channel",
    "touchpoints",
    "conversion_touchpoints",
    "conversion_rate_pct"
  ]);
  assertColumns("02_model_metrics.csv", modelMetrics, ["model", "auc_test"]);
  assertColumns("04_results.csv", simulationResults, ["scenario", "revenue", "delta_revenue"]);

  const data = {
    projectSummary,
    attribution: {
      shares: attributionShare.map(rowWithChannel),
      conversionRates: channelConversionRate.map((row) => ({
        channel: row.Channel,
        touchpoints: number(row.touchpoints),
        conversionTouchpoints: number(row.conversion_touchpoints),
        conversionRate: number(row.conversion_rate),
        conversionRatePct: number(row.conversion_rate_pct)
      })),
      socialMediaSummary: keyValueRows(socialMediaSummary)
    },
    regression: {
      modelMetrics: modelMetrics.map(camelizeRow),
      adjustedCoefficients: adjustedCoefficients.map((row) => {
        const [firstKey] = Object.keys(row);
        return {
          predictor: row[firstKey],
          coefficient: number(row.coef),
          oddsRatio: number(row.odds_ratio),
          ciLow: number(row.or_ci_low),
          ciHigh: number(row.or_ci_high),
          pValue: number(row.p_value)
        };
      }),
      adjustedChannelShare: adjustedChannelShare.map(rowWithChannel),
      spearmanVsLogit: spearmanVsLogit.map(camelizeRow),
      klDivergence: klDivergence.map(camelizeRow),
      chiSquare: chiSquare.map(camelizeRow),
      interpretationNotes: interpretationNotes.map(camelizeRow)
    },
    comparison: {
      modelComparison: modelComparison.map(rowWithChannel),
      removalEffect: removalEffect.map(camelizeRow),
      markovAttributionShare: markovAttributionShare.map(rowWithChannel),
      transitionMatrix: transitionMatrix.map(rowWithChannel)
    },
    simulation: {
      results: simulationResults.map(camelizeRow),
      budgetWeights: budgetWeights.map(rowWithChannel),
      roiByChannel: roiByChannel.map(rowWithChannel),
      sensitivity: sensitivity.map(camelizeRow),
      assumptions: assumptions.map(camelizeRow),
      perChannel: {
        s0Equal: perChannelS0.map(camelizeRow),
        s1ConversionRate: perChannelS1.map(camelizeRow),
        s2LinearAttribution: perChannelS2.map(camelizeRow)
      }
    }
  };

  return data;
}

function buildAnalysisContext(data) {
  const socialLinear = data.attribution.shares.find((row) => row.channel === "Social Media")?.linearPct;
  const displayLogit = data.regression.adjustedChannelShare.find((row) => row.channel === "Display Ads")?.logitAdjustedSharePct;
  const socialLogit = data.regression.adjustedChannelShare.find((row) => row.channel === "Social Media")?.logitAdjustedSharePct;
  const channelPlusLength = data.regression.modelMetrics.find((row) => row.model === "channel_plus_length");
  const journeyLength = data.regression.adjustedCoefficients.find((row) => row.predictor === "N_Touchpoints");
  const displayCoef = data.regression.adjustedCoefficients.find((row) => row.predictor === "Channel_Display Ads");
  const emailCoef = data.regression.adjustedCoefficients.find((row) => row.predictor === "Channel_Email");
  const socialCoef = data.regression.adjustedCoefficients.find((row) => row.predictor === "Channel_Social Media");
  const s1 = data.simulation.results.find((row) => row.scenario === "S1_conversion_rate");
  const s2 = data.simulation.results.find((row) => row.scenario === "S2_linear_attribution");

  return {
    appName: "Journey Signal",
    scope: "Public research dashboard for multi-touch attribution, regression benchmark, Markov comparison, and budget simulation.",
    source: "Precomputed Python notebook outputs. The web app does not train models.",
    keyFacts: [
      `The dataset has ${data.projectSummary.touchpoints.toLocaleString()} touchpoints, ${data.projectSummary.users.toLocaleString()} users, ${data.projectSummary.convertedUsers.toLocaleString()} converted users, and ${data.projectSummary.channels} channels.`,
      `Social Media linear attribution share is ${socialLinear}%.`,
      `Display Ads has the highest logistic-adjusted share at ${displayLogit}%; Social Media is ${socialLogit}%.`,
      `The channel_plus_length logistic model has AUC ${channelPlusLength?.aucTest} and McFadden pseudo-R2 ${channelPlusLength?.pseudoR2Mcfadden}.`,
      `N_Touchpoints is strongly associated with conversion with odds ratio ${journeyLength?.oddsRatio} and p-value ${journeyLength?.pValue}.`,
      `Display Ads is significant with odds ratio ${displayCoef?.oddsRatio} and p-value ${displayCoef?.pValue}. Email is significant with odds ratio ${emailCoef?.oddsRatio} and p-value ${emailCoef?.pValue}. Social Media is positive but marginal with odds ratio ${socialCoef?.oddsRatio} and p-value ${socialCoef?.pValue}.`,
      `S1 conversion-rate weighting improves simulated revenue by ${s1?.deltaRevenue}; S2 linear-attribution weighting improves simulated revenue by ${s2?.deltaRevenue}.`
    ],
    caveats: [
      "Regression estimates association, not causation.",
      "Simulation results are scenario comparisons under simplifying assumptions, not real revenue forecasts.",
      "Channel identity alone is weak at row level; journey length is a major confounder.",
      "The assistant must not invent numbers outside the provided context."
    ],
    suggestedQuestions: [
      "Why is Social Media not the strongest channel?",
      "Which attribution model is closest to the regression benchmark?",
      "What does the regression say about Display Ads?",
      "Can we say Social Media caused conversions?",
      "What is the limitation of the simulation?"
    ]
  };
}

mkdirSync(generatedDir, { recursive: true });

const dashboardData = loadDashboardData();
const analysisContext = buildAnalysisContext(dashboardData);

writeFileSync(
  path.join(generatedDir, "dashboard-data.json"),
  `${JSON.stringify(dashboardData, null, 2)}\n`,
  "utf8"
);
writeFileSync(
  path.join(generatedDir, "analysis-context.json"),
  `${JSON.stringify(analysisContext, null, 2)}\n`,
  "utf8"
);

console.log("Generated dashboard data and AI analysis context.");

import { getAnalysisContext, getDashboardData } from "@/lib/data/load-dashboard-data";
import { formatCurrency, formatPValue, formatPct, modelLabel, scenarioLabel } from "@/lib/metrics/formatters";
import type { AssistantPage, ChatRequest } from "./types";

const pageLabels: Record<AssistantPage, string> = {
  overview: "Overview",
  attribution: "Attribution",
  regression: "Regression",
  comparison: "Model Comparison",
  simulation: "Simulation",
  methodology: "Methodology"
};

const vietnamesePattern =
  /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

export function buildAssistantContext(request: ChatRequest) {
  const data = getDashboardData();
  const context = getAnalysisContext();
  const usedContext = ["analysis-context.json", `${pageLabels[request.page]} page context`];
  const lines = [
    `App: ${context.appName}`,
    `Scope: ${context.scope}`,
    `Source: ${context.source}`,
    `Current page: ${pageLabels[request.page]}`,
    request.chartId ? `Current chart: ${request.chartId}` : undefined,
    request.filters ? `Current filters: ${JSON.stringify(request.filters)}` : undefined,
    "",
    "Global facts:",
    ...context.keyFacts.map((fact) => `- ${fact}`),
    "",
    "Global caveats:",
    ...context.caveats.map((caveat) => `- ${caveat}`)
  ].filter(Boolean) as string[];

  if (request.page === "attribution" || request.page === "overview") {
    usedContext.push("rq1 attribution outputs");
    lines.push(
      "",
      "Attribution shares:",
      ...data.attribution.shares.map(
        (row) =>
          `- ${row.channel}: FT ${formatPct(row.firstTouchPct)}, LT ${formatPct(row.lastTouchPct)}, Linear ${formatPct(row.linearPct)}`
      )
    );
  }

  if (request.page === "regression" || request.page === "overview") {
    usedContext.push("rq2 logistic outputs");
    lines.push(
      "",
      "Regression adjusted shares:",
      ...data.regression.adjustedChannelShare.map((row) => `- ${row.channel}: ${formatPct(row.logitAdjustedSharePct)}`),
      "",
      "Main coefficients:",
      ...data.regression.adjustedCoefficients
        .filter((row) => row.predictor !== "const")
        .map(
          (row) =>
            `- ${row.predictor}: odds ratio ${row.oddsRatio}, 95% CI [${row.ciLow}, ${row.ciHigh}], p=${formatPValue(row.pValue)}`
        ),
      "",
      "Model metrics:",
      ...data.regression.modelMetrics.map(
        (row) =>
          `- ${modelLabel(row.model)}: AUC ${row.aucTest}, McFadden pseudo-R2 ${row.pseudoR2Mcfadden}, positive rate ${row.positiveRate}`
      )
    );
  }

  if (request.page === "comparison") {
    usedContext.push("rq2 model comparison outputs");
    lines.push(
      "",
      "Model comparison:",
      ...data.comparison.modelComparison.map(
        (row) =>
          `- ${row.channel}: FT ${row.firstTouchPct}, LT ${row.lastTouchPct}, Linear ${row.linearPct}, Logit ${row.logitAdjustedPct}, Markov ${row.markovPositiveRemovalPct}`
      ),
      "",
      "Markov removal:",
      ...data.comparison.removalEffect.map((row) => `- ${row.channel}: Markov share ${formatPct(row.markovSharePct)}`)
    );
  }

  if (request.page === "simulation" || request.page === "overview") {
    usedContext.push("rq3 simulation outputs");
    lines.push(
      "",
      "Simulation results:",
      ...data.simulation.results.map(
        (row) =>
          `- ${scenarioLabel(row.scenario)}: conversions ${row.conversions.toFixed(2)}, revenue ${formatCurrency(row.revenue, 2)}, delta revenue ${formatCurrency(row.deltaRevenue, 2)}, delta revenue pct ${formatPct(row.deltaRevPct)}`
      )
    );
  }

  if (request.page === "methodology") {
    usedContext.push("methodology summary");
    lines.push(
      "",
      "Methodology summary:",
      "- First-Touch assigns credit to the first channel in the journey.",
      "- Last-Touch assigns credit to the last channel in the journey.",
      "- Linear attribution splits credit evenly across journey touchpoints.",
      "- Logistic regression uses converted/non-converted as binary target and controls for N_Touchpoints.",
      "- Markov removal effect estimates conversion probability change when removing a channel.",
      "- Budget simulation compares scenario outputs under simplified revenue assumptions."
    );
  }

  return {
    contextText: lines.join("\n"),
    usedContext,
    caveats: context.caveats
  };
}

export function localFallbackAnswer(message: string, request: ChatRequest) {
  const lower = message.toLowerCase();
  const data = getDashboardData();
  const context = getAnalysisContext();
  const isVietnamese =
    vietnamesePattern.test(message) ||
    /\b(kênh|kenh|mô hình|mo hinh|hồi quy|hoi quy|nhân quả|nhan qua|ngân sách|ngan sach|mạnh nhất|manh nhat|so sánh|so sanh|kết luận|ket luan)\b/i.test(
      lower
    );
  const asksForSummary =
    lower.includes("summary") ||
    lower.includes("summarize") ||
    lower.includes("overview") ||
    lower.includes("conclusion") ||
    lower.includes("tóm tắt") ||
    lower.includes("tom tat") ||
    lower.includes("kết luận") ||
    lower.includes("ket luan") ||
    lower.includes("key finding") ||
    lower.includes("main finding") ||
    lower.includes("what does this page show");
  const asksForStrongestChannel =
    lower.includes("strongest") ||
    lower.includes("highest") ||
    lower.includes("mạnh nhất") ||
    lower.includes("manh nhat") ||
    lower.includes("cao nhất") ||
    lower.includes("cao nhat") ||
    lower.includes("kênh nào") ||
    lower.includes("kenh nao") ||
    lower.includes("best channel");

  if (lower.includes("social media") || asksForStrongestChannel) {
    const social = data.regression.adjustedChannelShare.find((row) => row.channel === "Social Media");
    const display = data.regression.adjustedChannelShare.find((row) => row.channel === "Display Ads");
    const socialCoef = data.regression.adjustedCoefficients.find((row) => row.predictor === "Channel_Social Media");
    if (isVietnamese) {
      return `Social Media có liên quan trong phân tích này, nhưng không phải channel mạnh nhất theo logistic-adjusted share. Display Ads cao nhất với ${display?.logitAdjustedSharePct}%, còn Social Media là ${social?.logitAdjustedSharePct}%. Social Media cũng có odds ratio dương (${socialCoef?.oddsRatio}), nhưng p-value là ${socialCoef?.pValue}, nên bằng chứng yếu hơn Display Ads và Email.`;
    }

    return `Social Media is relevant, but it is not the strongest adjusted channel in this analysis. Display Ads has the highest logistic-adjusted share at ${display?.logitAdjustedSharePct}%, while Social Media is ${social?.logitAdjustedSharePct}%. Social Media also has a positive odds ratio (${socialCoef?.oddsRatio}), but its p-value is ${socialCoef?.pValue}, so the evidence is weaker than for Display Ads and Email.`;
  }

  if (
    lower.includes("caused") ||
    lower.includes("causal") ||
    lower.includes("cause") ||
    lower.includes("nhân quả") ||
    lower.includes("nhan qua")
  ) {
    if (isVietnamese) {
      return "Không. Dashboard không nên kết luận causation. Regression và attribution chỉ cho thấy association và phân bổ credit theo mô hình; vì dữ liệu là observational nên không chứng minh rằng một channel trực tiếp gây ra conversion.";
    }

    return "No. The dashboard should not claim causation. The regression and attribution outputs show association and model-based credit allocation, but the data is observational and does not prove that a channel directly caused conversions.";
  }

  if (
    lower.includes("simulation") ||
    lower.includes("budget") ||
    lower.includes("ngân sách") ||
    lower.includes("ngan sach")
  ) {
    const s1 = data.simulation.results.find((row) => row.scenario === "S1_conversion_rate");
    const s2 = data.simulation.results.find((row) => row.scenario === "S2_linear_attribution");
    if (isVietnamese) {
      return `Simulation cho thấy mức tăng nhỏ so với equal allocation. S1 tăng simulated revenue thêm ${formatCurrency(s1?.deltaRevenue ?? 0, 2)}, còn S2 tăng thêm ${formatCurrency(s2?.deltaRevenue ?? 0, 2)}. Nên viết đây là scenario comparison, không phải dự báo revenue thật.`;
    }

    return `The simulation shows small positive gains versus equal allocation. S1 improves simulated revenue by ${formatCurrency(s1?.deltaRevenue ?? 0, 2)}, and S2 improves simulated revenue by ${formatCurrency(s2?.deltaRevenue ?? 0, 2)}. This should be written as a scenario comparison, not a real revenue forecast.`;
  }

  if (
    lower.includes("model") ||
    lower.includes("closest") ||
    lower.includes("regression") ||
    lower.includes("mô hình") ||
    lower.includes("mo hinh") ||
    lower.includes("hồi quy") ||
    lower.includes("hoi quy")
  ) {
    const best = data.regression.spearmanVsLogit[0];
    if (isVietnamese) {
      return `Heuristic model gần logistic benchmark nhất là ${modelLabel(best.heuristicModel)}, với Spearman rho ${best.spearmanRho} và p-value ${best.pValue}. Đây chỉ là so sánh tương đối vì correlation không có ý nghĩa thống kê.`;
    }

    return `The closest heuristic model to the logistic benchmark is ${modelLabel(best.heuristicModel)}, with Spearman rho ${best.spearmanRho} and p-value ${best.pValue}. This is only a relative comparison because the correlation is not statistically significant.`;
  }

  if (asksForSummary) {
    if (isVietnamese) {
      return `Với trang ${pageLabels[request.page]}, phần tóm tắt an toàn nhất là: ${context.keyFacts.slice(0, 3).join(" ")} Caveat chính cần nhớ: ${context.caveats[0]}`;
    }

    return `For ${pageLabels[request.page]}, the safest summary is: ${context.keyFacts.slice(0, 3).join(" ")} Remember the main caveat: ${context.caveats[0]}`;
  }

  if (isVietnamese) {
    return `Tôi chỉ có thể trả lời các câu hỏi dựa trên output của Journey Signal dashboard. Bạn có thể hỏi về attribution shares, regression results, model comparison, simulation scenarios, hoặc methodology. Ví dụ: "Channel nào có logistic-adjusted share cao nhất?", "Có được kết luận causation không?", hoặc "Budget scenario nào tốt nhất?"`;
  }

  return `I can only answer questions grounded in the Journey Signal dashboard outputs. Try asking about attribution shares, regression results, model comparison, simulation scenarios, or methodology. For example: "Which channel has the highest logistic-adjusted share?", "Can we claim causation?", or "Which budget scenario performs best?"`;
}

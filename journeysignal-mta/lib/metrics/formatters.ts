export function formatPct(value: number | null | undefined, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "n/a";
  }
  return `${value.toFixed(digits)}%`;
}

export function formatShare(value: number | null | undefined, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "n/a";
  }
  return `${(value * 100).toFixed(digits)}%`;
}

export function formatNumber(value: number | null | undefined, digits = 0) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "n/a";
  }
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits
  }).format(value);
}

export function formatCurrency(value: number | null | undefined, digits = 0) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "n/a";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: digits,
    minimumFractionDigits: digits
  }).format(value);
}

export function formatPValue(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "n/a";
  }
  if (value === 0) {
    return "<0.001";
  }
  if (value < 0.001) {
    return "<0.001";
  }
  return value.toFixed(4);
}

export function scenarioLabel(value: string) {
  const labels: Record<string, string> = {
    S0_equal: "S0 Equal",
    S1_conversion_rate: "S1 Conversion-rate",
    S2_linear_attribution: "S2 Linear attribution"
  };
  return labels[value] ?? value;
}

export function modelLabel(value: string) {
  const labels: Record<string, string> = {
    first_touch_pct: "First-Touch",
    last_touch_pct: "Last-Touch",
    linear_pct: "Linear",
    logit_adjusted_pct: "Logistic-adjusted",
    markov_positive_removal_pct: "Markov removal",
    row_channel: "Row channel",
    user_any_channel: "User any-channel",
    journey_length_only: "Journey length",
    channel_plus_length: "Channel + length"
  };
  return labels[value] ?? value.replaceAll("_", " ");
}

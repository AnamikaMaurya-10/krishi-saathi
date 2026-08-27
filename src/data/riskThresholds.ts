/**
 * Farmer Financial Distress Risk - Threshold Configuration
 * 
 * Weighted risk model:
 *   Rainfall risk: 40%
 *   Market price risk: 35%
 *   Loan due proximity: 25%
 * 
 * Each component is normalized to 0-100.
 * Final score: 0-34 = LOW, 35-64 = MEDIUM, 65-100 = HIGH
 */

export const RISK_WEIGHTS = {
  rainfall: 0.40,
  marketPrice: 0.35,
  loanProximity: 0.25,
} as const;

export const RAINFALL_THRESHOLDS = [
  { min: 0, max: 10, label: "low", score: 15 },
  { min: 10, max: 20, label: "moderate", score: 45 },
  { min: 20, max: 30, label: "high", score: 70 },
  { min: 30, max: Infinity, label: "very_high", score: 90 },
] as const;

export const PRICE_THRESHOLDS = [
  { min: 0, max: 5, label: "low", score: 15 },
  { min: 5, max: 10, label: "moderate", score: 45 },
  { min: 10, max: 20, label: "high", score: 70 },
  { min: 20, max: Infinity, label: "very_high", score: 90 },
] as const;

export const LOAN_THRESHOLDS = [
  { min: 60, max: Infinity, label: "low", score: 15 },
  { min: 30, max: 60, label: "moderate", score: 45 },
  { min: 14, max: 30, label: "high", score: 70 },
  { min: 0, max: 14, label: "very_high", score: 90 },
] as const;

export const RISK_CATEGORIES = {
  LOW: { min: 0, max: 34, label: "LOW", color: "green" },
  MEDIUM: { min: 35, max: 64, label: "MEDIUM", color: "amber" },
  HIGH: { min: 65, max: 100, label: "HIGH", color: "red" },
} as const;

export type RiskCategory = keyof typeof RISK_CATEGORIES;
export type ThresholdLabel = "low" | "moderate" | "high" | "very_high";

export function getRiskCategory(score: number): RiskCategory {
  if (score <= 34) return "LOW";
  if (score <= 64) return "MEDIUM";
  return "HIGH";
}

export function getRainfallScore(deviationPercent: number): { score: number; label: ThresholdLabel } {
  const absDev = Math.abs(deviationPercent);
  for (const t of RAINFALL_THRESHOLDS) {
    if (absDev >= t.min && absDev < t.max) {
      return { score: t.score, label: t.label };
    }
  }
  return { score: 90, label: "very_high" };
}

export function getPriceScore(declinePercent: number): { score: number; label: ThresholdLabel } {
  const absDecline = Math.abs(declinePercent);
  for (const t of PRICE_THRESHOLDS) {
    if (absDecline >= t.min && absDecline < t.max) {
      return { score: t.score, label: t.label };
    }
  }
  return { score: 90, label: "very_high" };
}

export function getLoanScore(daysUntilDue: number): { score: number; label: ThresholdLabel } {
  for (const t of LOAN_THRESHOLDS) {
    if (daysUntilDue >= t.min && daysUntilDue < t.max) {
      return { score: t.score, label: t.label };
    }
  }
  return { score: 90, label: "very_high" };
}

export function calculateDistressScore(
  rainfallDeviation: number,
  priceDecline: number,
  daysUntilLoanDue: number
): {
  totalScore: number;
  category: RiskCategory;
  breakdown: {
    rainfall: { rawDeviation: number; score: number; label: ThresholdLabel; contribution: number };
    marketPrice: { rawDecline: number; score: number; label: ThresholdLabel; contribution: number };
    loanProximity: { rawDays: number; score: number; label: ThresholdLabel; contribution: number };
  };
} {
  const rainfall = getRainfallScore(rainfallDeviation);
  const price = getPriceScore(priceDecline);
  const loan = getLoanScore(daysUntilLoanDue);

  const totalScore = Math.round(
    RISK_WEIGHTS.rainfall * rainfall.score +
    RISK_WEIGHTS.marketPrice * price.score +
    RISK_WEIGHTS.loanProximity * loan.score
  );

  return {
    totalScore: Math.min(100, Math.max(0, totalScore)),
    category: getRiskCategory(totalScore),
    breakdown: {
      rainfall: {
        rawDeviation: rainfallDeviation,
        score: rainfall.score,
        label: rainfall.label,
        contribution: Math.round(RISK_WEIGHTS.rainfall * rainfall.score),
      },
      marketPrice: {
        rawDecline: priceDecline,
        score: price.score,
        label: price.label,
        contribution: Math.round(RISK_WEIGHTS.marketPrice * price.score),
      },
      loanProximity: {
        rawDays: daysUntilLoanDue,
        score: loan.score,
        label: loan.label,
        contribution: Math.round(RISK_WEIGHTS.loanProximity * loan.score),
      },
    },
  };
}

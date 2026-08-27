/**
 * Risk Calculator Service
 * 
 * Calculates Farmer Financial Distress Risk score
 * using configurable thresholds from riskThresholds.ts
 */

import {
  calculateDistressScore as calc,
  type RiskCategory,
  type ThresholdLabel,
} from "@/data/riskThresholds";

export type { RiskCategory, ThresholdLabel };

export interface RiskResult {
  totalScore: number;
  category: RiskCategory;
  breakdown: {
    rainfall: { rawDeviation: number; score: number; label: ThresholdLabel; contribution: number };
    marketPrice: { rawDecline: number; score: number; label: ThresholdLabel; contribution: number };
    loanProximity: { rawDays: number; score: number; label: ThresholdLabel; contribution: number };
  };
}

export function calculateDistressScore(
  rainfallDeviation: number,
  priceDecline: number,
  daysUntilLoanDue: number
): RiskResult {
  return calc(rainfallDeviation, priceDecline, daysUntilLoanDue);
}

export function getMainRiskReasons(result: RiskResult): string[] {
  const reasons: string[] = [];
  const { breakdown } = result;

  if (breakdown.rainfall.score >= 45) {
    reasons.push(`Rainfall ${Math.abs(Math.round(breakdown.rainfall.rawDeviation))}% below normal`);
  }
  if (breakdown.marketPrice.score >= 45) {
    reasons.push(`Paddy price declined ${Math.abs(Math.round(breakdown.marketPrice.rawDecline))}%`);
  }
  if (breakdown.loanProximity.score >= 45) {
    if (breakdown.loanProximity.rawDays <= 0) {
      reasons.push("Loan overdue");
    } else {
      reasons.push(`Loan due in ${breakdown.loanProximity.rawDays} days`);
    }
  }

  return reasons.length > 0 ? reasons : ["Stable conditions"];
}

import { useLanguage } from "@/contexts/LanguageContext";
import { tWithParams, type Locale } from "@/services/i18n";
import type { calculateDistressScore } from "@/services/riskCalculator";

type RiskResult = ReturnType<typeof calculateDistressScore>;

interface RiskScoreCardProps {
  result: RiskResult;
  compact?: boolean;
}

function getRiskColor(category: string): string {
  switch (category) {
    case "HIGH": return "text-red-600";
    case "MEDIUM": return "text-amber-600";
    default: return "text-green-600";
  }
}

function getRiskBg(category: string): string {
  switch (category) {
    case "HIGH": return "bg-red-50 border-red-200";
    case "MEDIUM": return "bg-amber-50 border-amber-200";
    default: return "bg-green-50 border-green-200";
  }
}

function getBarColor(category: string): string {
  switch (category) {
    case "HIGH": return "bg-red-500";
    case "MEDIUM": return "bg-amber-500";
    default: return "bg-green-500";
  }
}

function getLabel(locale: Locale, label: string): string {
  const map: Record<string, Record<Locale, string>> = {
    low: { en: "Low", od: "କମ୍", hi: "कम" },
    moderate: { en: "Moderate", od: "ମଧ୍ୟମ", hi: "मध्यम" },
    high: { en: "High", od: "ଅଧିକ", hi: "अधिक" },
    very_high: { en: "Very High", od: "ଅତ୍ୟଧିକ", hi: "अत्यधिक" },
  };
  return map[label]?.[locale] || label;
}

function FactorRow({ label, rawText, score, contribution, labelName }: {
  label: string;
  rawText: string;
  score: number;
  contribution: number;
  labelName: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground text-xs">{rawText}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${getBarColor(score > 65 ? "HIGH" : score > 35 ? "MEDIUM" : "LOW")}`}
            style={{ width: `${score}%` }}
          />
        </div>
        <span className="text-xs font-medium text-muted-foreground w-12 text-right">
          {contribution}/100
        </span>
      </div>
      <span className={`text-xs font-medium ${getRiskColor(score > 65 ? "HIGH" : score > 35 ? "MEDIUM" : "LOW")}`}>
        {labelName}
      </span>
    </div>
  );
}

export function RiskScoreCard({ result, compact = false }: RiskScoreCardProps) {
  const { locale, t, tParams } = useLanguage();
  const { totalScore, category, breakdown } = result;

  const rainfallDev = breakdown.rainfall.rawDeviation;
  const rainfallText = rainfallDev < 0
    ? tParams("risk.deviationBelow", { percent: Math.abs(Math.round(rainfallDev)) })
    : rainfallDev > 0
    ? tParams("risk.deviationAbove", { percent: Math.abs(Math.round(rainfallDev)) })
    : "Normal";

  const priceDecline = breakdown.marketPrice.rawDecline;
  const priceText = tParams("risk.priceDecline", { percent: Math.abs(Math.round(priceDecline)) });

  const loanDays = breakdown.loanProximity.rawDays;
  const loanText = loanDays < 0
    ? tParams("risk.overdue", { days: Math.abs(loanDays) })
    : tParams("risk.daysUntilDue", { days: loanDays });

  if (compact) {
    return (
      <div className={`rounded-xl border p-3 ${getRiskBg(category)}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{t("risk.score")}</p>
            <p className={`text-2xl font-bold ${getRiskColor(category)}`}>{totalScore}</p>
          </div>
          <span className={`text-sm font-bold ${getRiskColor(category)}`}>
            {t(`risk.category.${category}`)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      {/* Score header */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{t("risk.title")}</p>
        <p className={`text-5xl font-bold ${getRiskColor(category)}`}>{totalScore}</p>
        <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-sm font-bold ${getRiskColor(category)} ${getRiskBg(category)}`}>
          {t(`risk.category.${category}`)}
        </span>
      </div>

      {/* Breakdown */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground">{t("risk.breakdown")}</h4>
        <FactorRow
          label={t("risk.rainfall")}
          rawText={rainfallText}
          score={breakdown.rainfall.score}
          contribution={breakdown.rainfall.contribution}
          labelName={getLabel(locale, breakdown.rainfall.label)}
        />
        <FactorRow
          label={t("risk.marketPrice")}
          rawText={priceText}
          score={breakdown.marketPrice.score}
          contribution={breakdown.marketPrice.contribution}
          labelName={getLabel(locale, breakdown.marketPrice.label)}
        />
        <FactorRow
          label={t("risk.loanProximity")}
          rawText={loanText}
          score={breakdown.loanProximity.score}
          contribution={breakdown.loanProximity.contribution}
          labelName={getLabel(locale, breakdown.loanProximity.label)}
        />
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] text-muted-foreground leading-relaxed">
        {t("risk.disclaimer")}
      </p>
    </div>
  );
}

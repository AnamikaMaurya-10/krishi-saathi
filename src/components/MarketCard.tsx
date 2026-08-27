import { useLanguage } from "@/contexts/LanguageContext";
import { getBestMarketPrice, getPriceChangePercent } from "@/data/marketPrices";
import { TrendingDown, TrendingUp, Store } from "lucide-react";
import { useNavigate } from "react-router";

interface MarketCardProps {
  commodity: string;
}

export function MarketCard({ commodity }: MarketCardProps) {
  const { locale } = useLanguage();
  const navigate = useNavigate();

  const best = getBestMarketPrice(commodity);
  const change = getPriceChangePercent(commodity);

  if (!best) return null;

  const marketName = locale === "od" ? best.marketOdia : locale === "hi" ? best.marketHindi : best.market;
  const commodityName = locale === "od" ? best.commodityOdia : locale === "hi" ? best.commodityHindi : best.commodity;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-foreground">{commodityName}</h3>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">
          Reference
        </span>
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-2xl font-bold text-foreground">{'\u20B9'}{best.modalPrice.toLocaleString("en-IN")}</span>
        <span className="text-xs text-muted-foreground">/quintal</span>
      </div>

      <div className="flex items-center gap-1.5 mb-2">
        {change < 0 ? (
          <TrendingDown className="size-3.5 text-red-500" />
        ) : (
          <TrendingUp className="size-3.5 text-green-500" />
        )}
        <span className={`text-xs font-medium ${change < 0 ? "text-red-600" : "text-green-600"}`}>
          {change > 0 ? "+" : ""}{change.toFixed(1)}% from reference
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
        <Store className="size-3" />
        <span>{marketName}</span>
      </div>

      <button
        onClick={() => navigate("/market")}
        className="w-full py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 hover:bg-green-100 rounded transition-colors"
      >
        Compare mandis
      </button>
    </div>
  );
}

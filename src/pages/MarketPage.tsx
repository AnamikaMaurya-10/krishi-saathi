import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getMarketPrices, getPriceChangePercent, type MarketPrice } from "@/data/marketPrices";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Sprout, ArrowLeft, TrendingDown, TrendingUp, Star, Info } from "lucide-react";
import { useNavigate } from "react-router";

const CROPS = [
  { id: "paddy", name: "Paddy", nameOdia: "ଧାନ", nameHindi: "धान" },
  { id: "maize", name: "Maize", nameOdia: "ମକା", nameHindi: "मक्का" },
  { id: "groundnut", name: "Groundnut", nameOdia: "ଚିନିବାଦାମ", nameHindi: "मूंगफली" },
];

function PriceBar({ price, maxPrice }: { price: number; maxPrice: number }) {
  const pct = maxPrice > 0 ? (price / maxPrice) * 100 : 0;
  return (
    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
      <div className="h-full bg-green-600 rounded-full" style={{ width: `${pct}%` }} />
    </div>
  );
}

function MiniTrend({ prices }: { prices: { date: string; price: number }[] }) {
  if (prices.length < 2) return null;
  const min = Math.min(...prices.map(p => p.price));
  const max = Math.max(...prices.map(p => p.price));
  const range = max - min || 1;
  const h = 24;
  const w = 60;

  const points = prices.map((p, i) => {
    const x = (i / (prices.length - 1)) * w;
    const y = h - ((p.price - min) / range) * h;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={w} height={h} className="inline-block">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.5" className="text-green-600" />
    </svg>
  );
}

export default function MarketPage() {
  const { t, locale } = useLanguage();
  const navigate = useNavigate();
  const [selectedCrop, setSelectedCrop] = useState("paddy");

  const prices = getMarketPrices(selectedCrop);
  const bestModal = Math.max(...prices.map(p => p.modalPrice));

  const selectedCropData = CROPS.find(c => c.id === selectedCrop);
  const cropName = selectedCropData ? (locale === "od" ? selectedCropData.nameOdia : locale === "hi" ? selectedCropData.nameHindi : selectedCropData.name) : selectedCrop;

  return (
    <div className="min-h-screen bg-[#f8faf6] pb-20">
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate("/dashboard")} className="p-1.5 rounded-lg hover:bg-muted">
            <ArrowLeft className="size-5" />
          </button>
          <Sprout className="size-5 text-green-700" />
          <span className="font-bold text-sm">{t("market.title")}</span>
          <div className="ml-auto"><LanguageSelector /></div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Crop selector */}
        <div className="flex gap-2">
          {CROPS.map((crop) => (
            <button
              key={crop.id}
              onClick={() => setSelectedCrop(crop.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                selectedCrop === crop.id
                  ? "bg-green-700 text-white border-green-700"
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {locale === "od" ? crop.nameOdia : locale === "hi" ? crop.nameHindi : crop.name}
            </button>
          ))}
        </div>

        {/* Market info */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold">{cropName} — Latest Available Prices</h3>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-4">
            <Info className="size-3" />
            <span>Dataset-based (not real-time) | AGMARKNET reference data</span>
          </div>

          {/* Price table */}
          <div className="space-y-3">
            {prices.map((market) => {
              const isBest = market.modalPrice === bestModal;
              const change = (() => {
                const h = market.historicalPrices;
                if (h.length < 2) return 0;
                return ((h[h.length - 1].price - h[0].price) / h[0].price) * 100;
              })();
              const marketName = locale === "od" ? market.marketOdia : locale === "hi" ? market.marketHindi : market.market;

              return (
                <div key={market.market} className={`p-3 rounded-lg border ${isBest ? "border-green-300 bg-green-50" : "border-border"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{marketName}</span>
                      {isBest && <Star className="size-3.5 text-amber-500 fill-amber-500" />}
                    </div>
                    <MiniTrend prices={market.historicalPrices} />
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <div>
                      <p className="text-[10px] text-muted-foreground">{t("market.min")}</p>
                      <p className="text-sm font-semibold">₹{market.minPrice.toLocaleString("en-IN")}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">{t("market.modal")}</p>
                      <p className="text-sm font-semibold text-green-700">₹{market.modalPrice.toLocaleString("en-IN")}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">{t("market.max")}</p>
                      <p className="text-sm font-semibold">₹{market.maxPrice.toLocaleString("en-IN")}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {change < 0 ? (
                      <TrendingDown className="size-3 text-red-500" />
                    ) : (
                      <TrendingUp className="size-3 text-green-500" />
                    )}
                    <span className={`text-xs font-medium ${change < 0 ? "text-red-600" : "text-green-600"}`}>
                      {change > 0 ? "+" : ""}{change.toFixed(1)}% from reference
                    </span>
                  </div>

                  {isBest && (
                    <p className="text-[10px] text-green-700 font-medium mt-1">★ Best available modal price</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground text-center">
          Data source: AGMARKNET (dataset-based) | Last updated: August 2025
        </p>
      </div>
    </div>
  );
}

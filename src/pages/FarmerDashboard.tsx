import { useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useWeather } from "@/hooks/useWeather";
import { SAMPLE_FARMERS } from "@/data/farmers";
import { getCropById, getCropStage } from "@/data/crops";
import { getRainData, getNormalRainfall } from "@/data/rainNormals";
import { getMarketPrices, getPriceChangePercent } from "@/data/marketPrices";
import { generateAdvisories } from "@/services/advisoryEngine";
import { calculateDistressScore } from "@/services/riskCalculator";
import { getForecastRainfallTotal, calculateRainfallDeviation } from "@/services/weatherService";
import { WeatherCard } from "@/components/WeatherCard";
import { AdvisoryCard } from "@/components/AdvisoryCard";
import { RiskScoreCard } from "@/components/RiskScoreCard";
import { MarketCard } from "@/components/MarketCard";
import { LanguageSelector } from "@/components/LanguageSelector";
import { BottomNav } from "@/components/BottomNav";
import { Sprout, MapPin, Droplets } from "lucide-react";
import { useNavigate } from "react-router";

const DEFAULT_FARMER = SAMPLE_FARMERS[0]; // Ramesh Kumar

export default function FarmerDashboard() {
  const { t, locale } = useLanguage();
  const navigate = useNavigate();
  const farmer = DEFAULT_FARMER;
  const crop = getCropById(farmer.crop);

  const { weather, loading: weatherLoading } = useWeather(
    farmer.location.lat,
    farmer.location.lng,
    farmer.district
  );

  const computedData = useMemo(() => {
    if (!weather) return null;

    const normalRain = getNormalRainfall(farmer.district);
    const forecastRain = getForecastRainfallTotal(weather.forecast.slice(0, 3));
    const rainfallDeviation = calculateRainfallDeviation(forecastRain, normalRain);

    const priceDecline = getPriceChangePercent(farmer.crop);

    const sowingDate = new Date(farmer.sowingDate);
    const daysSinceSowing = Math.floor((Date.now() - sowingDate.getTime()) / (1000 * 60 * 60 * 24));
    const loanDue = new Date(farmer.loanDueDate);
    const daysUntilLoan = Math.floor((loanDue.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    const cropStage = getCropStage(farmer.sowingDate, farmer.crop);

    const advisories = generateAdvisories({
      temperature: weather.current.temperature,
      humidity: weather.current.humidity,
      precipitation: weather.current.precipitation,
      windSpeed: weather.current.windSpeed,
      weatherCode: weather.current.weatherCode,
      forecastPrecipitation3Day: forecastRain,
      rainfallDeviation,
      cropId: farmer.crop,
      cropStage: cropStage?.name || "Unknown",
      soilType: farmer.soilType,
      irrigationAvailable: farmer.irrigationAvailable,
      priceDecline,
    });

    const riskResult = calculateDistressScore(rainfallDeviation, priceDecline, daysUntilLoan);

    return {
      forecastRain,
      rainfallDeviation,
      priceDecline,
      daysSinceSowing,
      daysUntilLoan,
      cropStage,
      advisories,
      riskResult,
      normalRain,
    };
  }, [weather, farmer]);

  const displayName = locale === "od" ? farmer.nameOdia : locale === "hi" ? farmer.nameHindi : farmer.name;
  const cropName = crop ? (locale === "od" ? crop.nameOdia : locale === "hi" ? crop.nameHindi : crop.name) : "Paddy";

  // Plain-language rainfall summary
  const rainfallText = computedData ? (() => {
    const dev = Math.abs(Math.round(computedData.rainfallDeviation));
    if (computedData.rainfallDeviation < -10) {
      return `Rainfall is ${dev}% below the seasonal normal.`;
    } else if (computedData.rainfallDeviation > 10) {
      return `Rainfall is ${dev}% above the seasonal normal.`;
    }
    return "Rainfall is near the seasonal normal.";
  })() : "";

  const rainfallTextOdia = computedData ? (() => {
    const dev = Math.abs(Math.round(computedData.rainfallDeviation));
    if (computedData.rainfallDeviation < -10) {
      return `\u0B2C\u0BB0\u0D4D\u0D37\u0BBE \u0B38\u0BBE\u0B27\u0BBE\u0B30\u0D23\u0BBE\u0B30\u0BC1\u0B28\u0D4D\u0D24\u0BC1 ${dev}% \u0B15\u0BAE\u0D4D \u0B05\u0B1A\u0BCD\u0D1A\u0B3E \u0B38\u0BBF\u0D02\u0D1A\u0BBF\u0D39\u0BBE\u0D21\u0BF3\u0D3F\u0D39\u0BBE\u0D21\u0D3F\u0D39\u0BBE\u0B1C\u0D3F\u0D39\u0BBE\u0B1C\u0BF0\u0B40\u0D39\u0D47\u0D38\u0B3F\u0D24\u0BF3`;
    } else if (computedData.rainfallDeviation > 10) {
      return `\u0B2C\u0BB0\u0D4D\u0D37\u0BBE \u0B38\u0BBE\u0B27\u0BBE\u0B30\u0D23\u0BBE\u0B30\u0BC1\u0B28\u0D4D\u0D24\u0BC1 ${dev}% \u0B05\u0B27\u0BFF\u0B15 \u0B38\u0BBF\u0D02\u0D1A\u0BBF\u0D39\u0BBE\u0D21\u0D3F\u0D39\u0BBE\u0D21\u0BF3\u0D3F\u0D39\u0BBE\u0D21\u0D3F\u0D39\u0BBE\u0B1C\u0D3F\u0D39\u0BBE\u0B1C\u0BF0\u0B40\u0D39\u0D47\u0D38\u0B3F\u0D24\u0BF3`;
    }
    return "\u0B2C\u0BB0\u0D4D\u0D37\u0BBE \u0B38\u0BBE\u0B27\u0BBE\u0B30\u0D23\u0BBE\u0BB0\u0BC7 \u0B28\u0B3F\u0B15\u0D1F\u0BB0\u0BC7 \u0B05\u0B1A\u0BCD\u0D1A\u0B3E \u0B38\u0BBF\u0D02\u0D1A\u0BBF\u0D39\u0BBE\u0D21\u0BF3\u0D3F\u0D39\u0BBE\u0D21\u0D3F\u0D39\u0BBE\u0D21\u0BF3\u0D3F\u0D39\u0BBE\u0D21\u0D3F\u0D39\u0BBE\u0B1C\u0D3F\u0D39\u0BBE\u0B1C\u0BF0\u0B40\u0D39\u0D47\u0D38\u0B3F\u0D24\u0BF3";
  })() : "";

  const rainfallTextHindi = computedData ? (() => {
    const dev = Math.abs(Math.round(computedData.rainfallDeviation));
    if (computedData.rainfallDeviation < -10) {
      return `\u0935\u0930\u094D\u0937\u093E \u0938\u093E\u092E\u093E\u0928\u094D\u092F \u0938\u0947 ${dev}% \u0915\u092E \u0939\u0948\u0964`;
    } else if (computedData.rainfallDeviation > 10) {
      return `\u0935\u0930\u094D\u0937\u093E \u0938\u093E\u092E\u093E\u0928\u094D\u092F \u0938\u0947 ${dev}% \u0905\u0927\u093F\u0915 \u0939\u0948\u0964`;
    }
    return "\u0935\u0930\u094D\u0937\u093E \u0938\u093E\u092E\u093E\u0928\u094D\u092F \u0915\u0947 \u0928\u093F\u0915\u091F \u0939\u0948\u0964";
  })() : "";

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sprout className="size-5 text-green-700" />
            <span className="font-semibold text-sm">{t("app.name")}</span>
          </div>
          <LanguageSelector />
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Location & Greeting */}
        <div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5">
            <MapPin className="size-3" />
            <span>{farmer.village}, {farmer.district}, {farmer.state}</span>
          </div>
          <h1 className="text-lg font-bold text-foreground">
            {t("farmer.greeting")}, {displayName}
          </h1>
        </div>

        {/* Weather */}
        {weatherLoading ? (
          <div className="border border-border bg-card p-5 text-center rounded-lg">
            <div className="animate-pulse text-sm text-muted-foreground">{t("weather.loading")}</div>
          </div>
        ) : weather ? (
          <WeatherCard weather={weather.current} compact />
        ) : (
          <div className="border border-border bg-card p-4 text-sm text-muted-foreground rounded-lg">
            {t("weather.error")}
          </div>
        )}

        {/* Rainfall Deviation — plain language */}
        {computedData && (
          <div className="border border-border bg-card p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-1.5">
              <Droplets className="size-4 text-blue-500" />
              <h3 className="text-sm font-semibold">{t("weather.rainfallDeviation")}</h3>
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              {locale === "od" ? rainfallTextOdia : locale === "hi" ? rainfallTextHindi : rainfallText}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Expected: {Math.round(computedData.forecastRain)} mm / Normal: {computedData.normalRain} mm
            </p>
          </div>
        )}

        {/* Today's Advisory */}
        {computedData && (
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-2">{t("farmer.todaysAdvisory")}</h2>
            <div className="space-y-3">
              {computedData.advisories.map((advisory) => (
                <AdvisoryCard key={advisory.id} advisory={advisory} />
              ))}
            </div>
          </div>
        )}

        {/* Risk Score */}
        {computedData && (
          <div onClick={() => navigate("/officer")} className="cursor-pointer">
            <RiskScoreCard result={computedData.riskResult} compact />
          </div>
        )}

        {/* Market */}
        <MarketCard commodity={farmer.crop} />

        {/* Farm Details */}
        <div className="border border-border bg-card p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-foreground mb-3">{t("farmer.farmDetails")}</h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-muted-foreground">{t("farmer.area")}</span>
              <p className="font-medium text-foreground">{farmer.farmSize} {t("farmer.acres")}</p>
            </div>
            <div>
              <span className="text-muted-foreground">{t("farmer.crop")}</span>
              <p className="font-medium text-foreground">{cropName}</p>
            </div>
            <div>
              <span className="text-muted-foreground">{t("farmer.cropStage")}</span>
              <p className="font-medium text-foreground">
                {computedData?.cropStage ? (
                  locale === "od" ? computedData.cropStage.nameOdia :
                  locale === "hi" ? computedData.cropStage.nameHindi :
                  computedData.cropStage.name
                ) : "\u2014"}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">{t("farmer.daysSinceSowing")}</span>
              <p className="font-medium text-foreground">{computedData?.daysSinceSowing ?? "\u2014"} days</p>
            </div>
            <div>
              <span className="text-muted-foreground">{t("farmer.irrigation")}</span>
              <p className="font-medium text-foreground">
                {farmer.irrigationAvailable ? t("farmer.available") : t("farmer.notAvailable")}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">{t("farmer.soilType")}</span>
              <p className="font-medium text-foreground capitalize">{farmer.soilType}</p>
            </div>
          </div>
        </div>

        {/* Schemes */}
        <div className="border border-border bg-card p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-foreground mb-1">{t("schemes.title")}</h3>
          <p className="text-[11px] text-muted-foreground mb-2">{t("schemes.disclaimer")}</p>
          <div className="space-y-1 text-xs text-foreground">
            <p>{t("schemes.cropInsurance")} (PMFBY)</p>
            <p>{t("schemes.agriCredit")} (KCC)</p>
            <p>PM-KISAN ({'\u20B9'}6,000/year direct income support)</p>
            <p>{t("schemes.irrigationSupport")} (PMKSY)</p>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

import { useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useWeather } from "@/hooks/useWeather";
import { SAMPLE_FARMERS } from "@/data/farmers";
import { getCropById, getCropStage } from "@/data/crops";
import { getRainData, getNormalRainfall } from "@/data/rainNormals";
import { getMarketPrices, getPriceChangePercent, getBestMarketPrice } from "@/data/marketPrices";
import { generateAdvisories } from "@/services/advisoryEngine";
import { calculateDistressScore } from "@/services/riskCalculator";
import { getForecastRainfallTotal, calculateRainfallDeviation } from "@/services/weatherService";
import { WeatherCard } from "@/components/WeatherCard";
import { AdvisoryCard } from "@/components/AdvisoryCard";
import { RiskScoreCard } from "@/components/RiskScoreCard";
import { MarketCard } from "@/components/MarketCard";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Sprout, MapPin, Calendar, Droplets, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router";

// Default demo farmer
const DEFAULT_FARMER = SAMPLE_FARMERS[0]; // Ramesh Kumar

export default function FarmerDashboard() {
  const { t, locale } = useLanguage();
  const navigate = useNavigate();
  const farmer = DEFAULT_FARMER;
  const crop = getCropById(farmer.crop);
  const rainData = getRainData(farmer.district);

  // Fetch real weather data
  const { weather, loading: weatherLoading } = useWeather(
    farmer.location.lat,
    farmer.location.lng,
    farmer.district
  );

  // Calculate derived data
  const computedData = useMemo(() => {
    if (!weather) return null;

    const normalRain = getNormalRainfall(farmer.district);
    const forecastRain = getForecastRainfallTotal(weather.forecast.slice(0, 3));
    const rainfallDeviation = calculateRainfallDeviation(forecastRain, normalRain);

    const marketPrices = getMarketPrices(farmer.crop);
    const priceDecline = getPriceChangePercent(farmer.crop);
    const bestPrice = getBestMarketPrice(farmer.crop);

    const sowingDate = new Date(farmer.sowingDate);
    const daysSinceSowing = Math.floor((Date.now() - sowingDate.getTime()) / (1000 * 60 * 60 * 24));
    const loanDue = new Date(farmer.loanDueDate);
    const daysUntilLoan = Math.floor((loanDue.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    const cropStage = getCropStage(farmer.sowingDate, farmer.crop);

    // Generate advisories
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

    // Calculate risk score
    const riskResult = calculateDistressScore(
      rainfallDeviation,
      priceDecline,
      daysUntilLoan
    );

    return {
      forecastRain,
      rainfallDeviation,
      marketPrices,
      priceDecline,
      bestPrice,
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

  return (
    <div className="min-h-screen bg-[#f8faf6] pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sprout className="size-5 text-green-700" />
            <span className="font-bold text-sm">{t("app.name")}</span>
          </div>
          <LanguageSelector />
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Location & Greeting */}
        <div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <MapPin className="size-3" />
            <span>{farmer.village}, {farmer.district}, {farmer.state}</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">
            {t("farmer.greeting")}, {displayName}
          </h1>
        </div>

        {/* Weather */}
        {weatherLoading ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <div className="animate-pulse text-sm text-muted-foreground">{t("weather.loading")}</div>
          </div>
        ) : weather ? (
          <WeatherCard weather={weather.current} compact />
        ) : (
          <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
            {t("weather.error")}
          </div>
        )}

        {/* Rainfall Deviation */}
        {computedData && (
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="size-4 text-blue-500" />
              <h3 className="text-sm font-semibold">{t("weather.rainfallDeviation")}</h3>
            </div>
            <p className="text-sm text-foreground">
              {computedData.rainfallDeviation < -10
                ? t("weather.belowNormal")
                : computedData.rainfallDeviation > 10
                ? t("weather.aboveNormal")
                : t("weather.onTrack")
              } — {Math.abs(Math.round(computedData.rainfallDeviation))}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t("weather.expectedRainfall")}: {Math.round(computedData.forecastRain)} mm
              {" / "}{t("weather.rainfallNormal")}: {computedData.normalRain} mm
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
        <div className="rounded-xl border border-border bg-card p-4">
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
                ) : "—"}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">{t("farmer.daysSinceSowing")}</span>
              <p className="font-medium text-foreground">{computedData?.daysSinceSowing ?? "—"} days</p>
            </div>
            <div>
              <span className="text-muted-foreground">{t("farmer.irrigation")}</span>
              <p className="font-medium text-foreground">
                {farmer.irrigationAvailable ? `✓ ${t("farmer.available")}` : `✗ ${t("farmer.notAvailable")}`}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">{t("farmer.soilType")}</span>
              <p className="font-medium text-foreground capitalize">{farmer.soilType}</p>
            </div>
          </div>
        </div>

        {/* Schemes */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-2">{t("schemes.title")}</h3>
          <p className="text-xs text-muted-foreground mb-2">{t("schemes.disclaimer")}</p>
          <div className="space-y-1.5 text-xs">
            <p className="text-foreground">• {t("schemes.cropInsurance")} (PMFBY)</p>
            <p className="text-foreground">• {t("schemes.agriCredit")} (KCC)</p>
            <p className="text-foreground">• {t("schemes.pmksy")}</p>
            <p className="text-foreground">• PM-KISAN (₹6,000/year)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

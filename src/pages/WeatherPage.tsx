import { useLanguage } from "@/contexts/LanguageContext";
import { useWeather } from "@/hooks/useWeather";
import { SAMPLE_FARMERS } from "@/data/farmers";
import { getNormalRainfall } from "@/data/rainNormals";
import { calculateRainfallDeviation, getForecastRainfallTotal } from "@/services/weatherService";
import { WeatherCard } from "@/components/WeatherCard";
import { LanguageSelector } from "@/components/LanguageSelector";
import { BottomNav } from "@/components/BottomNav";
import { Sprout, ArrowLeft, Droplets, Sun, CloudRain, TrendingDown } from "lucide-react";
import { useNavigate } from "react-router";

const farmer = SAMPLE_FARMERS[0];

export default function WeatherPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { weather, loading } = useWeather(farmer.location.lat, farmer.location.lng, farmer.district);

  const forecast3Day = weather?.forecast.slice(0, 3) || [];
  const forecastRain = getForecastRainfallTotal(forecast3Day);
  const normalRain = getNormalRainfall(farmer.district, "July");
  const deviation = calculateRainfallDeviation(forecastRain, normalRain);

  const dayNames = ["Today", "Tomorrow", "Day 3"];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate("/dashboard")} className="p-1.5 rounded hover:bg-muted">
            <ArrowLeft className="size-5" />
          </button>
          <Sprout className="size-5 text-green-700" />
          <span className="font-semibold text-sm">{t("nav.weather")}</span>
          <div className="ml-auto"><LanguageSelector /></div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {loading ? (
          <div className="text-center py-8 text-sm text-muted-foreground animate-pulse">{t("weather.loading")}</div>
        ) : weather ? (
          <>
            <WeatherCard weather={weather.current} />

            {/* Rainfall deviation */}
            <div className="border border-border bg-card p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="size-4 text-blue-500" />
                <h3 className="text-sm font-semibold">{t("weather.rainfallDeviation")}</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-bold ${deviation < -20 ? "text-red-600" : deviation < -10 ? "text-amber-600" : "text-green-600"}`}>
                  {deviation > 0 ? "+" : ""}{Math.round(deviation)}%
                </span>
                <span className="text-sm text-muted-foreground">
                  {deviation < -10 ? t("weather.belowNormal") : deviation > 10 ? t("weather.aboveNormal") : t("weather.onTrack")}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                {t("weather.rainfallNormal")}: {normalRain} mm &middot; {t("weather.expectedRainfall")}: {Math.round(forecastRain)} mm
              </p>
            </div>

            {/* 3-day forecast */}
            <div className="border border-border bg-card p-4 rounded-lg">
              <h3 className="text-sm font-semibold mb-3">{t("weather.forecast")}</h3>
              <div className="space-y-2">
                {forecast3Day.map((day, i) => (
                  <div key={day.date} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{dayNames[i] || day.date}</p>
                      <p className="text-xs text-muted-foreground">{day.condition}</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <Sun className="size-3 text-amber-500" />
                        <span>{Math.round(day.maxTemp)}&deg;</span>
                        <span className="text-muted-foreground">/ {Math.round(day.minTemp)}&deg;</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CloudRain className="size-3 text-blue-500" />
                        <span>{day.precipitation} mm</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Crop impact */}
            <div className="border border-border bg-card p-4 rounded-lg">
              <h3 className="text-sm font-semibold mb-2">{t("weather.cropImpact")}</h3>
              <div className="space-y-2 text-xs">
                {deviation < -20 && (
                  <div className="flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded">
                    <TrendingDown className="size-3.5 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-amber-800">{t("weather.irrigationAttention")}</p>
                  </div>
                )}
                {forecastRain > 50 && (
                  <div className="flex items-start gap-2 p-2.5 bg-blue-50 border border-blue-200 rounded">
                    <CloudRain className="size-3.5 text-blue-600 mt-0.5 shrink-0" />
                    <p className="text-blue-800">{t("weather.drainageAttention")}</p>
                  </div>
                )}
                {weather.current.temperature > 36 && (
                  <div className="flex items-start gap-2 p-2.5 bg-red-50 border border-red-200 rounded">
                    <Sun className="size-3.5 text-red-600 mt-0.5 shrink-0" />
                    <p className="text-red-800">{t("weather.heatStress")}</p>
                  </div>
                )}
                {deviation >= -10 && forecastRain <= 50 && weather.current.temperature <= 36 && (
                  <div className="flex items-start gap-2 p-2.5 bg-green-50 border border-green-200 rounded">
                    <p className="text-green-800">Current conditions are manageable. Continue regular monitoring.</p>
                  </div>
                )}
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground text-center">
              {weather.current.isLive ? "Source: Open-Meteo API" : "Source: Cached data (API unavailable)"}
            </p>
          </>
        ) : (
          <div className="text-center py-8 text-sm text-muted-foreground">{t("weather.error")}</div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}

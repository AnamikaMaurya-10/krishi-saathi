import { useLanguage } from "@/contexts/LanguageContext";
import type { CurrentWeather } from "@/services/weatherService";
import { Droplets, Wind, CloudRain } from "lucide-react";

interface WeatherCardProps {
  weather: CurrentWeather;
  compact?: boolean;
}

export function WeatherCard({ weather, compact = false }: WeatherCardProps) {
  const { t } = useLanguage();

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-foreground">{t("weather.current")}</h3>
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
          weather.isLive ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
        }`}>
          {weather.isLive ? t("common.liveWeather") : t("common.cachedData")}
        </span>
      </div>

      <div className="flex items-baseline gap-2 mb-2.5">
        <span className="text-3xl font-bold text-foreground tracking-tight">
          {Math.round(weather.temperature)}&deg;C
        </span>
        <span className="text-sm text-muted-foreground">{weather.condition}</span>
      </div>

      <div className={`grid ${compact ? "grid-cols-2 gap-2" : "grid-cols-3 gap-2"}`}>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Droplets className="size-3.5 text-blue-500" />
          <span>{t("weather.humidity")}: {weather.humidity}%</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CloudRain className="size-3.5 text-blue-400" />
          <span>{t("weather.rainfall")}: {weather.precipitation} mm</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Wind className="size-3.5 text-gray-500" />
          <span>{weather.windSpeed} km/h</span>
        </div>
      </div>
    </div>
  );
}

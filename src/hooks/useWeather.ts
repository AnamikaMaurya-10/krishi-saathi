import { useState, useEffect, useCallback } from "react";
import { fetchWeatherData, type WeatherData } from "@/services/weatherService";

export function useWeather(lat?: number, lng?: number, name?: string) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeatherData(lat, lng, name);
      setWeather(data);
    } catch (err) {
      setError("Weather data unavailable");
    } finally {
      setLoading(false);
    }
  }, [lat, lng, name]);

  useEffect(() => {
    load();
  }, [load]);

  return { weather, loading, error, refetch: load };
}

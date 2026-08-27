/**
 * Weather Service
 * 
 * Uses Open-Meteo API (free, no API key required)
 * Provides: current weather, 7-day forecast, rainfall data
 * 
 * Fallback: cached/demo data when API is unavailable
 */

export interface CurrentWeather {
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  weatherCode: number;
  condition: string;
  isLive: boolean;
  fetchedAt: string;
}

export interface DailyForecast {
  date: string;
  maxTemp: number;
  minTemp: number;
  precipitation: number;
  precipitationProbability: number;
  weatherCode: number;
  condition: string;
}

export interface WeatherData {
  current: CurrentWeather;
  forecast: DailyForecast[];
  location: { lat: number; lng: number; name: string };
}

// Sambalpur district coordinates
const SAMBALPUR_COORDS = { lat: 21.4669, lng: 83.9812 };

// WMO Weather interpretation codes
const WMO_CODES: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

function getWeatherCondition(code: number): string {
  return WMO_CODES[code] || "Unknown";
}

// Cached data for fallback
const CACHED_WEATHER: WeatherData = {
  current: {
    temperature: 29,
    humidity: 78,
    precipitation: 2.5,
    windSpeed: 12,
    weatherCode: 61,
    condition: "Slight rain",
    isLive: false,
    fetchedAt: new Date().toISOString(),
  },
  forecast: [
    {
      date: new Date().toISOString().split("T")[0],
      maxTemp: 31,
      minTemp: 24,
      precipitation: 8,
      precipitationProbability: 65,
      weatherCode: 61,
      condition: "Slight rain",
    },
    {
      date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
      maxTemp: 30,
      minTemp: 23,
      precipitation: 4,
      precipitationProbability: 40,
      weatherCode: 63,
      condition: "Moderate rain",
    },
    {
      date: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0],
      maxTemp: 32,
      minTemp: 25,
      precipitation: 2,
      precipitationProbability: 25,
      weatherCode: 2,
      condition: "Partly cloudy",
    },
    {
      date: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
      maxTemp: 33,
      minTemp: 26,
      precipitation: 1,
      precipitationProbability: 15,
      weatherCode: 0,
      condition: "Clear sky",
    },
    {
      date: new Date(Date.now() + 4 * 86400000).toISOString().split("T")[0],
      maxTemp: 34,
      minTemp: 27,
      precipitation: 0,
      precipitationProbability: 10,
      weatherCode: 0,
      condition: "Clear sky",
    },
    {
      date: new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0],
      maxTemp: 33,
      minTemp: 26,
      precipitation: 3,
      precipitationProbability: 30,
      weatherCode: 2,
      condition: "Partly cloudy",
    },
    {
      date: new Date(Date.now() + 6 * 86400000).toISOString().split("T")[0],
      maxTemp: 31,
      minTemp: 24,
      precipitation: 10,
      precipitationProbability: 70,
      weatherCode: 63,
      condition: "Moderate rain",
    },
  ],
  location: { ...SAMBALPUR_COORDS, name: "Sambalpur" },
};

export async function fetchWeatherData(
  lat: number = SAMBALPUR_COORDS.lat,
  lng: number = SAMBALPUR_COORDS.lng,
  locationName: string = "Sambalpur"
): Promise<WeatherData> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=Asia%2FKolkata&forecast_days=7`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Weather API error: ${response.status}`);

    const data = await response.json();

    const current: CurrentWeather = {
      temperature: data.current.temperature_2m,
      humidity: data.current.relative_humidity_2m,
      precipitation: data.current.precipitation,
      windSpeed: data.current.wind_speed_10m,
      weatherCode: data.current.weather_code,
      condition: getWeatherCondition(data.current.weather_code),
      isLive: true,
      fetchedAt: new Date().toISOString(),
    };

    const forecast: DailyForecast[] = data.daily.time.map(
      (date: string, i: number) => ({
        date,
        maxTemp: data.daily.temperature_2m_max[i],
        minTemp: data.daily.temperature_2m_min[i],
        precipitation: data.daily.precipitation_sum[i],
        precipitationProbability: data.daily.precipitation_probability_max[i],
        weatherCode: data.daily.weather_code[i],
        condition: getWeatherCondition(data.daily.weather_code[i]),
      })
    );

    return {
      current,
      forecast,
      location: { lat, lng, name: locationName },
    };
  } catch (error) {
    console.warn("Weather API failed, using cached data:", error);
    return {
      ...CACHED_WEATHER,
      location: { lat, lng, name: locationName },
    };
  }
}

export function calculateRainfallDeviation(
  actualRainfall: number,
  normalRainfall: number
): number {
  if (normalRainfall === 0) return 0;
  return ((actualRainfall - normalRainfall) / normalRainfall) * 100;
}

export function getForecastRainfallTotal(forecast: DailyForecast[]): number {
  return forecast.reduce((sum, day) => sum + day.precipitation, 0);
}

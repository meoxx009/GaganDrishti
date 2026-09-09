import { City } from "@/lib/types";
import {
  OpenMeteoApiResponse,
  NormalizedWeatherData,
  HourlyForecastItem,
  DailyForecastItem,
} from "./types";
import { interpretWMOCode } from "./wmo";

const OPEN_METEO_BASE_URL = "https://api.open-meteo.com/v1/forecast";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes fresh window
const STORAGE_PREFIX = "gagandrishti_weather_cache_";

interface CacheEntry {
  data: NormalizedWeatherData;
  cachedAt: number;
}

// In-memory cache for fast component remounts
const memoryCache = new Map<string, CacheEntry>();

// In-flight promise map for request deduplication
const inFlightRequests = new Map<string, Promise<NormalizedWeatherData>>();

/**
 * Normalizes raw Open-Meteo response into application data models
 */
function normalizeWeatherData(
  city: City,
  raw: OpenMeteoApiResponse,
  isCached: boolean = false
): NormalizedWeatherData {
  const currentWMO = interpretWMOCode(raw.current.weather_code);

  // Hourly items: Take next 24 hours starting from current time
  const hourlyItems: HourlyForecastItem[] = [];
  const nowIso = raw.current.time;
  const startIndex = Math.max(
    0,
    raw.hourly.time.findIndex((t) => t >= nowIso)
  );

  const hourlySliceCount = 24;
  for (
    let i = startIndex;
    i < Math.min(startIndex + hourlySliceCount, raw.hourly.time.length);
    i++
  ) {
    const rawTime = raw.hourly.time[i];
    const hourDate = new Date(rawTime);
    const hourWMO = interpretWMOCode(raw.hourly.weather_code[i]);

    // Format hour string (e.g., "04:00")
    const formattedHour = hourDate.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    hourlyItems.push({
      time: rawTime,
      formattedHour,
      temperature: raw.hourly.temperature_2m[i],
      relativeHumidity: raw.hourly.relative_humidity_2m[i],
      precipitationProbability: raw.hourly.precipitation_probability[i],
      precipitation: raw.hourly.precipitation[i],
      weatherCode: raw.hourly.weather_code[i],
      cloudCover: raw.hourly.cloud_cover[i],
      windSpeed: raw.hourly.wind_speed_10m[i],
      windGusts: raw.hourly.wind_gusts_10m[i],
      conditionEn: hourWMO.conditionEn,
      conditionHi: hourWMO.conditionHi,
      iconName: hourWMO.iconName,
    });
  }

  // Daily items: 5 days
  const dailyItems: DailyForecastItem[] = [];
  for (let i = 0; i < raw.daily.time.length; i++) {
    const rawDate = raw.daily.time[i];
    const dateObj = new Date(rawDate + "T00:00:00+05:30");
    const dailyWMO = interpretWMOCode(raw.daily.weather_code[i]);

    const isToday = i === 0;
    const dayNameEn = isToday
      ? "Today"
      : dateObj.toLocaleDateString("en-IN", { weekday: "short" });
    const dayNameHi = isToday
      ? "आज"
      : dateObj.toLocaleDateString("hi-IN", { weekday: "short" });

    dailyItems.push({
      date: rawDate,
      dayNameEn,
      dayNameHi,
      weatherCode: raw.daily.weather_code[i],
      tempMax: Math.round(raw.daily.temperature_2m_max[i] * 10) / 10,
      tempMin: Math.round(raw.daily.temperature_2m_min[i] * 10) / 10,
      precipitationSum:
        Math.round((raw.daily.precipitation_sum[i] || 0) * 10) / 10,
      precipitationProbabilityMax:
        raw.daily.precipitation_probability_max[i] || 0,
      windSpeedMax: Math.round(raw.daily.wind_speed_10m_max[i] * 10) / 10,
      conditionEn: dailyWMO.conditionEn,
      conditionHi: dailyWMO.conditionHi,
      iconName: dailyWMO.iconName,
    });
  }

  return {
    cityId: city.id,
    cityNameEn: city.nameEn,
    cityNameHi: city.nameHi,
    latitude: city.lat,
    longitude: city.lon,
    current: {
      temperature: Math.round(raw.current.temperature_2m * 10) / 10,
      apparentTemperature:
        Math.round(raw.current.apparent_temperature * 10) / 10,
      relativeHumidity: raw.current.relative_humidity_2m,
      precipitation: raw.current.precipitation,
      rain: raw.current.rain,
      weatherCode: raw.current.weather_code,
      cloudCover: raw.current.cloud_cover,
      windSpeed: Math.round(raw.current.wind_speed_10m * 10) / 10,
      windGusts: Math.round(raw.current.wind_gusts_10m * 10) / 10,
      time: raw.current.time,
      conditionEn: currentWMO.conditionEn,
      conditionHi: currentWMO.conditionHi,
      iconName: currentWMO.iconName,
    },
    hourly: hourlyItems,
    daily: dailyItems,
    fetchedAt: new Date().toISOString(),
    source: "Open-Meteo Forecast API",
    isCached,
  };
}

/**
 * Retrieve cached data from memory or localStorage
 */
function getCachedWeather(cityId: string): NormalizedWeatherData | null {
  // 1. Try memory cache
  const inMemory = memoryCache.get(cityId);
  if (inMemory) {
    return inMemory.data;
  }

  // 2. Try localStorage if available
  if (typeof window !== "undefined") {
    try {
      const rawStored = localStorage.getItem(STORAGE_PREFIX + cityId);
      if (rawStored) {
        const parsed: CacheEntry = JSON.parse(rawStored);
        if (parsed?.data) {
          memoryCache.set(cityId, parsed);
          return parsed.data;
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }

  return null;
}

/**
 * Persist weather data into memory and localStorage
 */
function saveCachedWeather(cityId: string, data: NormalizedWeatherData): void {
  const entry: CacheEntry = {
    data,
    cachedAt: Date.now(),
  };

  memoryCache.set(cityId, entry);

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_PREFIX + cityId, JSON.stringify(entry));
    } catch {
      // Ignore quota/storage errors
    }
  }
}

/**
 * Fetch live weather from Open-Meteo for the given city
 * Includes in-flight deduplication, cache validation, and offline fallback.
 */
export async function fetchCityWeather(
  city: City,
  forceRefresh: boolean = false
): Promise<NormalizedWeatherData> {
  const cityKey = city.id;

  // Check existing fresh cache if not forced
  if (!forceRefresh) {
    const existingCache = memoryCache.get(cityKey);
    if (existingCache && Date.now() - existingCache.cachedAt < CACHE_TTL_MS) {
      return existingCache.data;
    }
  }

  // Check if a request is already in-flight for this city
  if (inFlightRequests.has(cityKey)) {
    return inFlightRequests.get(cityKey)!;
  }

  const queryParams = new URLSearchParams({
    latitude: city.lat.toString(),
    longitude: city.lon.toString(),
    current:
      "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,cloud_cover,wind_speed_10m,wind_gusts_10m",
    hourly:
      "temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,weather_code,cloud_cover,wind_speed_10m,wind_gusts_10m",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max",
    timezone: "Asia/Kolkata",
    forecast_days: "5",
  });

  const url = `${OPEN_METEO_BASE_URL}?${queryParams.toString()}`;

  const fetchPromise = (async (): Promise<NormalizedWeatherData> => {
    try {
      const response = await fetch(url, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Open-Meteo HTTP error: status ${response.status}`);
      }

      const rawJson: OpenMeteoApiResponse = await response.json();
      const normalized = normalizeWeatherData(city, rawJson, false);
      saveCachedWeather(cityKey, normalized);
      return normalized;
    } catch (networkError: unknown) {
      // Check if we have cached data to fall back to
      const fallback = getCachedWeather(cityKey);
      if (fallback) {
        return {
          ...fallback,
          isCached: true,
        };
      }

      const errorMessage =
        networkError instanceof Error
          ? networkError.message
          : "Unable to retrieve telemetry from Open-Meteo.";
      throw new Error(
        `Open-Meteo service unreachable for ${city.nameEn}: ${errorMessage}`
      );
    } finally {
      inFlightRequests.delete(cityKey);
    }
  })();

  inFlightRequests.set(cityKey, fetchPromise);
  return fetchPromise;
}

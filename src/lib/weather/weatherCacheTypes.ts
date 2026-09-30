/**
 * Weather API Caching System Types (FINAL_001)
 * Speeds up response times, reduces redundant API calls, and preserves API quotas.
 */

export type ApiSource = "Open-Meteo" | "OpenWeatherMap" | "NOAA";

export interface HourlyForecastItemCompact {
  hour: string; // e.g. "14:00"
  time: string; // ISO
  temperature: number; // Celsius
  rain_probability: number; // 0-100 %
  weather_code: number;
  condition_en: string;
  condition_hi: string;
}

export interface DailyForecastItemCompact {
  date: string; // YYYY-MM-DD
  day_en: string; // e.g. "Mon"
  day_hi: string; // e.g. "सोम"
  temp_max: number;
  temp_min: number;
  rain_probability_max: number;
  precipitation_sum_mm: number;
  weather_code: number;
  condition_en: string;
  condition_hi: string;
}

/**
 * WEATHER_CACHE Table Row Schema
 */
export interface WeatherCacheRecord {
  cache_id: number;
  pincode: string; // 6-digit postal code (Indexed for fast lookup)
  latitude: number;
  longitude: number;
  city_name: string;
  temperature: number; // Celsius
  humidity: number; // %
  rain_probability: number; // % (0-100)
  wind_speed: number; // km/h
  weather_code: number; // WMO code
  cloud_cover: number; // %
  forecast_12h: HourlyForecastItemCompact[];
  forecast_7day: DailyForecastItemCompact[];
  cached_at: string; // ISO DateTime
  expires_at: string; // ISO DateTime (cached_at + 2 hours)
  api_source: ApiSource;
  is_valid: boolean;
  hit_count: number;
}

/**
 * Request parameters for GET_WEATHER_WITH_CACHE
 */
export interface GetWeatherWithCacheParams {
  pincode: string;
  force_refresh?: boolean;
  latitude?: number;
  longitude?: number;
  city_name?: string;
}

/**
 * Output of GET_WEATHER_WITH_CACHE
 */
export interface CachedWeatherResult {
  pincode: string;
  city_name: string;
  latitude: number;
  longitude: number;
  temperature: number;
  humidity: number;
  rain_probability: number;
  wind_speed: number;
  weather_code: number;
  cloud_cover: number;
  condition_en: string;
  condition_hi: string;
  forecast_12h: HourlyForecastItemCompact[];
  forecast_7day: DailyForecastItemCompact[];
  cached_at: string;
  expires_at: string;
  is_cached: boolean;
  api_source: ApiSource;
  response_time_ms: number;
  warning_message?: string;
  age_minutes: number;
}

/**
 * PERFORMANCE_LOGS Table Row Schema
 */
export interface PerformanceLogRecord {
  log_id: number;
  pincode: string;
  cache_hit: boolean;
  response_time_ms: number;
  api_used: ApiSource | "Cache" | "FallbackCache";
  timestamp: string;
}

/**
 * MAINTENANCE_LOGS Table Row Schema
 */
export interface MaintenanceLogRecord {
  log_id: number;
  cleanup_date: string;
  entries_deleted: number;
  total_cache_entries_remaining: number;
  status: "SUCCESS" | "FAILED";
  details?: string;
}

/**
 * Cache Statistics for Admin Dashboard (/admin/cache-statistics)
 */
export interface CacheStatisticsSummary {
  cache_hit_rate: number; // %
  total_requests_24h: number;
  cache_hits_24h: number;
  cache_misses_24h: number;
  avg_cached_response_time_ms: number;
  avg_uncached_response_time_ms: number;
  api_quota_limit_daily: number; // 500,000 for Open-Meteo
  api_quota_used_24h: number;
  api_quota_percentage: number;
  total_cached_entries: number;
  estimated_storage_kb: number;
  most_cached_pincodes: Array<{
    pincode: string;
    city_name: string;
    hits: number;
    last_accessed: string;
    expires_in_minutes: number;
  }>;
  recent_performance_logs: PerformanceLogRecord[];
  recent_maintenance_logs: MaintenanceLogRecord[];
  active_alerts: Array<{
    severity: "warning" | "critical" | "info";
    title: string;
    message: string;
    action_required: string;
  }>;
}

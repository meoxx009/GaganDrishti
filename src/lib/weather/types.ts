export interface OpenMeteoCurrentResponse {
  time: string;
  interval: number;
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  precipitation: number;
  rain: number;
  weather_code: number;
  cloud_cover: number;
  wind_speed_10m: number;
  wind_gusts_10m: number;
}

export interface OpenMeteoHourlyResponse {
  time: string[];
  temperature_2m: number[];
  relative_humidity_2m: number[];
  precipitation_probability: number[];
  precipitation: number[];
  weather_code: number[];
  cloud_cover: number[];
  wind_speed_10m: number[];
  wind_gusts_10m: number[];
}

export interface OpenMeteoDailyResponse {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_sum: number[];
  precipitation_probability_max: number[];
  wind_speed_10m_max: number[];
}

export interface OpenMeteoApiResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current: OpenMeteoCurrentResponse;
  hourly: OpenMeteoHourlyResponse;
  daily: OpenMeteoDailyResponse;
}

// Normalized Application Types
export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  relativeHumidity: number;
  precipitation: number;
  rain: number;
  weatherCode: number;
  cloudCover: number;
  windSpeed: number;
  windGusts: number;
  time: string;
  conditionEn: string;
  conditionHi: string;
  iconName: string;
}

export interface HourlyForecastItem {
  time: string;
  formattedHour: string;
  temperature: number;
  relativeHumidity: number;
  precipitationProbability: number;
  precipitation: number;
  weatherCode: number;
  cloudCover: number;
  windSpeed: number;
  windGusts: number;
  conditionEn: string;
  conditionHi: string;
  iconName: string;
}

export interface DailyForecastItem {
  date: string;
  dayNameEn: string;
  dayNameHi: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  precipitationSum: number;
  precipitationProbabilityMax: number;
  windSpeedMax: number;
  conditionEn: string;
  conditionHi: string;
  iconName: string;
}

export interface NormalizedWeatherData {
  cityId: string;
  cityNameEn: string;
  cityNameHi: string;
  latitude: number;
  longitude: number;
  current: CurrentWeather;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  fetchedAt: string;
  source: "Open-Meteo Forecast API";
  isCached: boolean;
}

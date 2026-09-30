/**
 * Types for Hyperlocal Village-Level Weather & Micro-Climate Zones (CHANGE_003)
 */

export interface ClimateZoneRecord {
  zone_id: number;
  zone_code: string;
  zone_name: string;
  zone_name_hi: string;
  representative_cities: string[];
  latitude_min: number;
  latitude_max: number;
  longitude_min: number;
  longitude_max: number;
  average_rainfall_monsoon: string;
  average_temp_summer: string;
  average_temp_winter: string;
  frost_risk: string;
  frost_risk_hi?: string;
  soil_type: string;
  soil_type_hi?: string;
  primary_crops: string[];
  primary_crops_hi?: string[];
  monsoon_start: string;
  monsoon_end: string;
  characteristic_weather: string;
  characteristic_weather_hi: string;
}

export interface PincodeVillageRecord {
  pincode: string;
  village_name: string;
  village_name_hi: string;
  district: string;
  district_hi: string;
  state: string;
  state_hi: string;
  latitude: number;
  longitude: number;
  elevation_m: number;
  soil_type: string;
  soil_type_hi: string;
  climate_zone_id: number;
  climate_zone_name: string;
  is_district_hq?: boolean;
}

export interface MicroClimateAdjustment {
  reference_city_name: string;
  elevation_diff_m: number; // village elevation - reference base elevation
  temperature_adjustment_c: number; // -0.65°C per 100m elevation gain
  adjusted_temperature: number;
  soil_type: string;
  soil_type_hi: string;
  soil_moisture_retention: "Very High" | "High" | "Moderate" | "Low / Rapid Drainage";
  irrigation_interval_adjustment_days: number; // e.g. +3 for black soil, -3 for sandy
  waterlogging_risk: "High" | "Moderate" | "Low";
  orographic_rain_factor: number; // 1.0 = standard, 1.25 = rain-facing windward slopes
  adjusted_rain_probability: number;
  micro_forecast_notes: string[];
  micro_forecast_notes_hi: string[];
}

export interface NearbyVillageForecast {
  pincode: string;
  village_name: string;
  village_name_hi: string;
  district: string;
  district_hi: string;
  latitude: number;
  longitude: number;
  distance_km: number;
  elevation_m: number;
  soil_type: string;
  temperature: number;
  rain_probability: number;
  wind_speed: number;
  weather_condition: string;
  weather_condition_hi: string;
  spray_suitability: "FAVOURABLE" | "CAUTION" | "AVOID";
  farming_suitability_score: number; // 0 to 100
}

export interface HyperlocalVillageWeatherResponse {
  village: PincodeVillageRecord;
  climate_zone: ClimateZoneRecord;
  current_weather: {
    temperature: number;
    apparent_temperature: number;
    relative_humidity: number;
    wind_speed: number;
    wind_gusts: number;
    precipitation: number;
    rain_probability_today: number;
    precipitation_sum_today: number;
    weather_code: number;
    condition_en: string;
    condition_hi: string;
  };
  adjustments: MicroClimateAdjustment;
  farm_suitability: {
    spray_verdict: "SPRAY PERMITTED" | "CAUTION SPRAY" | "DON'T SPRAY";
    spray_verdict_hi: string;
    irrigation_verdict: "IRRIGATE NOW" | "DELAY IRRIGATION" | "STANDARD CYCLE";
    irrigation_verdict_hi: string;
    overall_suitability_score: number;
    suitability_level: "EXCELLENT" | "MODERATE" | "POOR";
    key_advice_en: string;
    key_advice_hi: string;
  };
  nearby_villages: NearbyVillageForecast[];
  timestamp: string;
}

/**
 * Types for Weather-Based Predictive Pest/Disease Forecast Engine (CHANGE_004)
 */

export interface PestDiseaseTriggerRecord {
  trigger_id: number;
  crop_name: string; // e.g. "Soybean", "Paddy", "Wheat", "Chickpea", "Maize", "Cotton"
  pest_disease_name: string;
  pest_disease_name_hi: string;
  type: "Pest" | "Disease" | "Weather Event";
  trigger_temperature_min: number; // °C
  trigger_temperature_max: number; // °C
  trigger_humidity_min: number; // %
  trigger_humidity_max: number; // %
  trigger_rainfall_needed: boolean;
  trigger_rainfall_mm?: number;
  trigger_wind_speed?: number; // km/h
  trigger_leaf_wetness_hours?: number; // hours
  risk_severity: "Low" | "Medium" | "High" | "Critical";
  crop_stage_vulnerable: string; // e.g. "Flowering & Pod-Fill", "All", "Vegetative"
  high_risk_months: string; // e.g. "July-September"
  description: string;
  description_hi: string;
  control_measure: string;
  control_measure_hi: string;
  preventive_measure: string;
  preventive_measure_hi: string;
  recommended_pesticide_disease: string;
  action_urgency: "Immediate" | "Within 48 hours" | "Within 7 days";
}

export interface DayForecastSnapshot {
  dayIndex: number; // 0 to 6
  dateIso: string;
  tempMin: number;
  tempMax: number;
  tempAvg: number;
  humidityAvg: number;
  rainProbability: number;
  precipitationMm: number;
  windSpeed: number;
  weatherCode?: number;
}

export interface PestForecastInput {
  crop_name: string;
  crop_stage?: string | number;
  daily_forecast: DayForecastSnapshot[];
  current_weather?: {
    temperature: number;
    relative_humidity: number;
    wind_speed: number;
    precipitation: number;
  };
}

export interface PredictedPestDiseaseAlert {
  trigger_id: number;
  pest_disease_name: string;
  pest_disease_name_hi: string;
  type: "Pest" | "Disease" | "Weather Event";
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  confidence_pct: number; // e.g. 85%
  predicted_onset_day: number; // 0-6 index
  predicted_date_label: string; // e.g. "Aug 23" or "Day 3 (Wednesday)"
  why_triggered: string;
  why_triggered_hi: string;
  vulnerable_stage: string;
  symptoms_to_watch: string;
  symptoms_to_watch_hi: string;
  preventive_action: string[];
  preventive_action_hi: string[];
  control_if_seen: string;
  control_if_seen_hi: string;
  recommended_chemicals: string;
  action_urgency: "Immediate" | "Within 48 hours" | "Within 7 days";
  action_window: string;
}

export interface PestForecastOutput {
  crop: string;
  crop_hi: string;
  stage: string;
  stage_hi: string;
  forecast_period: string;
  overall_risk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  overall_recommendation: string;
  overall_recommendation_hi: string;
  predicted_alerts: PredictedPestDiseaseAlert[];
  daily_risk_timeline: {
    dayIndex: number;
    dateLabel: string;
    riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    activePestsCount: number;
  }[];
}

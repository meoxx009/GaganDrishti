export type CropStageName =
  | "Sowing (बुआई)"
  | "Vegetative (वानस्पतिक वृद्धि)"
  | "Flowering (फूल आना)"
  | "Pod Fill (फली भरना)"
  | "Maturity (पकना)"
  | "Sowing/Nursery (बीजतल)"
  | "Transplanting (रोपण)"
  | "Vegetative/Tillering (कल्ले निकलना)"
  | "Flowering (फूल आना - Panicle Initiation)"
  | "Maturity/Grain Filling (दाना भरना)"
  | "Grain Development (दाना विकास)"
  | "Late Grain Fill to Dough (दूध से आटा)"
  | "Maturity/Hard Dough (कठोर अवस्था)"
  | "Vegetative Branching (शाखाएं निकलना)"
  | "Pod Formation (घेंघा/फली बनना)"
  | "Knee-High Vegetative (घुटने तक वृद्धि)"
  | "Tasseling & Silking (नर व मादा मंजरी)"
  | "Grain Fill to Milking (दूधिया दाना)"
  | string;

export interface CropStageRecord {
  stage_id: number;
  crop_name: string;
  crop_id: "soybean" | "paddy" | "wheat" | "chickpea" | "maize" | string;
  season: "Kharif" | "Rabi" | "Zaid" | "Both";
  stage_number: number; // 1 to 5
  stage_name: string;
  stage_name_hi: string;
  days_from_sowing_min: number;
  days_from_sowing_max: number;
  ideal_temp_min: number; // °C
  ideal_temp_max: number; // °C
  critical_temp_low: number; // °C
  critical_temp_high: number; // °C
  ideal_humidity_min: number; // %
  ideal_humidity_max: number; // %
  critical_humidity_disease: number; // %
  ideal_rain_probability: number; // %
  critical_rain_probability: number; // %
  critical_rain_mm: number; // mm
  ideal_wind_speed: number; // km/h
  critical_wind_speed: number; // km/h
  primary_pest: string;
  primary_disease: string;
  irrigation_needed: boolean;
  irrigation_interval_days: number;
  spray_suitable: boolean;
  spray_restrictions: string;
  spray_restrictions_hi?: string;
  recommended_action: string;
  recommended_action_hi?: string;
  warning_conditions: string;
  warning_conditions_hi?: string;
  critical_window_days: number;
}

export interface CropDecisionInput {
  crop_name: string;
  crop_stage?: string | number;
  current_temperature: number;
  current_humidity: number;
  rain_probability: number;
  rain_sum_24h?: number;
  current_wind_speed: number;
  current_wind_gusts?: number;
  days_since_sowing?: number;
}

export interface CropDecisionOutput {
  crop: string;
  crop_hi: string;
  stage: string;
  stage_hi: string;
  stage_number: number;
  decision: "DON'T SPRAY" | "SPRAY PERMITTED" | "CAUTION SPRAY" | "IRRIGATION POSTPONE" | "IRRIGATE NOW";
  decision_hi: string;
  decision_confidence: "HIGH" | "MEDIUM";
  current_weather: {
    temperature: number;
    humidity: number;
    rain_probability: number;
    wind_speed: number;
  };
  reasons: string[];
  reasons_hi: string[];
  recommended_action: string[];
  recommended_action_hi: string[];
  best_window: string;
  best_window_hi: string;
  precautions: string[];
  precautions_hi: string[];
  pest_disease_alert: {
    pest: string;
    disease: string;
    risk_level: "HIGH" | "MEDIUM" | "LOW";
    trigger_reason: string;
    trigger_reason_hi: string;
  };
  stage_parameters: CropStageRecord;
}

/**
 * Types for CHANGE_008: Proprietary Dataset & Research (Academic + Commercial Value)
 */

export interface WeatherOutcomeCorrelation {
  crop: string;
  crop_stage: string;
  temperature_range: string;
  humidity_range: string;
  rain_probability_range: string;
  sample_size: number;
  avg_outcome_rating: number; // 1 to 5
  adverse_weather_frequency: number;
  recommendation_effectiveness_percent: number;
}

export interface PestPredictionAccuracyMetric {
  pest_name: string;
  crop: string;
  predicted_triggers_count: number;
  actual_farmer_reports_count: number;
  true_positives: number;
  false_positives: number;
  false_negatives: number;
  precision_percent: number;
  recall_percent: number;
  f1_score: number;
}

export interface DecisionEngineEfficacyResult {
  activity: string;
  crop: string;
  followed_advice: {
    sample_size: number;
    avg_outcome: number;
    satisfaction_rate_percent: number;
  };
  ignored_advice: {
    sample_size: number;
    avg_outcome: number;
    satisfaction_rate_percent: number;
  };
  yield_protection_lift_percent: number;
}

export interface KaggleDatasetRow {
  feedback_date: string;
  district: string;
  crop: string;
  crop_stage: string;
  temperature_celsius: number;
  humidity_percent: number;
  rain_probability_percent: number;
  wind_speed_kmh: number;
  activity_performed: string;
  outcome_rating_1_to_5: number; // Target variable
  pest_observed: boolean;
  disease_observed: boolean;
}

export interface ResearchPaperTopic {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  target_venue: string;
  impact_factor?: number;
  keywords: string[];
  dataset_size_utilized: string;
  status: "Drafted" | "Under Review" | "Accepted" | "Published";
}

export interface ConferencePresentationDeck {
  conference_name: string;
  location: string;
  target_date: string;
  focus: string;
  slides: {
    slide_number: number;
    title: string;
    key_points: string[];
    visual_type: string;
  }[];
}

export interface KaggleCompetitionBrief {
  title: string;
  tagline: string;
  description: string;
  prize_pool_usd: number;
  evaluation_metric: string;
  train_rows: number;
  test_rows: number;
  features_count: number;
  baseline_benchmark_rmse: number;
}

export interface CommercialLicenseTier {
  tier_name: "Academic" | "Startup/SME" | "Enterprise" | "Government";
  price_inr: string;
  target_audience: string;
  deliverables: string[];
  support_level: string;
  commercial_rights: boolean;
}

export interface QuarterlyReportSection {
  title: string;
  subtitle: string;
  summary: string;
  metrics: { label: string; value: string; trend?: string }[];
  key_takeaways: string[];
}

export type FeedbackCropName =
  | "Soybean"
  | "Paddy"
  | "Wheat"
  | "Chickpea"
  | "Maize"
  | "Cotton"
  | "Groundnut"
  | "Mustard"
  | "Arhar"
  | "Moong"
  | "Urad"
  | "Jowar"
  | "Bajra";

export type FeedbackCropStage =
  | "Sowing (0-10 days)"
  | "Vegetative (10-35 days)"
  | "Flowering (35-50 days)"
  | "Pod Fill/Grain Dev (50-80 days)"
  | "Maturity (80-120 days)";

export type FeedbackActivity =
  | "Spraying Pesticide"
  | "Spraying Fungicide"
  | "Irrigation"
  | "Fertilizer Application"
  | "Sowing"
  | "Harvesting"
  | "Weeding"
  | "No Activity"
  | "Other";

export type SubmissionSource =
  | "Web Form"
  | "WhatsApp"
  | "SMS"
  | "Phone Call"
  | "In-person";

export interface FarmerFeedbackRecord {
  feedback_id: number;
  timestamp: string; // ISO 8601 string
  farmer_name: string;
  phone_number: string;
  whatsapp_number?: string;
  pincode: string;
  village_name?: string;
  district?: string;
  state?: string;
  crop_name: FeedbackCropName;
  crop_stage: FeedbackCropStage;
  activity_today: FeedbackActivity;
  weather_today: string;
  action_taken: string;
  outcome_rating: number; // 1 to 5
  outcome_notes?: string;
  photo_url?: string;
  pest_observed?: boolean;
  pest_type?: string;
  disease_observed?: boolean;
  disease_type?: string;
  follow_up_needed?: boolean;
  submission_source: SubmissionSource;
}

export interface PincodeLookupResult {
  pincode: string;
  village_name: string;
  district: string;
  state: string;
  is_valid: boolean;
}

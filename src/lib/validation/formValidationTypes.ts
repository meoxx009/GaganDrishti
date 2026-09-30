/**
 * FINAL_005: Form Validation & Comprehensive Error Handling Types
 */

export type ValidationErrorType =
  | "missing_field"
  | "invalid_phone"
  | "invalid_pincode"
  | "invalid_farmer_name"
  | "invalid_crop"
  | "invalid_crop_stage"
  | "invalid_weather_desc"
  | "invalid_action_taken"
  | "invalid_rating"
  | "oversized_photo"
  | "invalid_photo_format"
  | "api_timeout"
  | "network_offline"
  | "database_error"
  | "sms_daily_limit"
  | "sms_unknown_command"
  | "sms_unregistered_phone";

export interface FieldValidationRule {
  rule: string;
  message_hi: string;
  message_en: string;
  regex?: RegExp;
  min?: number;
  max?: number;
}

export interface FieldValidationResult {
  is_valid: boolean;
  error_message_hi?: string;
  error_message_en?: string;
}

export interface FormValidationSummary {
  is_valid: boolean;
  field_errors: Record<string, string>;
  form_error_hi?: string;
  form_error_en?: string;
}

export interface ValidationErrorLogEntry {
  error_id: number;
  timestamp: string;
  error_type: ValidationErrorType;
  field_name?: string;
  user_message_hi: string;
  user_message_en: string;
  raw_technical_error?: string;
  user_agent?: string;
  ip_address?: string;
  resolved: boolean;
}

export interface OfflineSubmissionDraft {
  draft_id: string;
  timestamp: string;
  form_data: any;
  retry_count: number;
  status: "pending" | "syncing" | "failed";
  last_error?: string;
}

export interface PendingSmsRecord {
  queue_id: string;
  phone_number: string;
  incoming_sms: string;
  reply_message: string;
  attempt_count: number;
  max_attempts: number;
  status: "PENDING" | "RETRYING" | "DELIVERED" | "FAILED";
  created_at: string;
  last_attempt_at?: string;
  next_retry_at: string;
  error_reason: string;
}

export interface ApiHealthStatus {
  service_name: string;
  service_key: "open_meteo" | "twilio_sms" | "database" | "weather_cache";
  status: "healthy" | "degraded" | "down";
  response_time_ms: number;
  last_checked: string;
  is_simulated_down?: boolean;
  message: string;
  success_rate_pct: number;
  fallback_action: string;
}

export interface ErrorDashboardMetrics {
  total_errors_24h: number;
  errors_per_hour_rate: number;
  is_high_error_alert: boolean; // True if > 100/hr
  failed_form_submissions_count: number;
  failed_submission_rate_pct: number;
  top_common_errors: Array<{
    error_type: ValidationErrorType;
    label_hi: string;
    label_en: string;
    count: number;
    percentage: number;
  }>;
  api_health_statuses: ApiHealthStatus[];
  pending_sms_queue_count: number;
}

/**
 * Types for CHANGE_007: Government Integration Dashboard (District-level Monitoring)
 */

export type AdminRole = "District Admin" | "State Admin" | "Disaster Officer";

export interface AdminUserRecord {
  admin_id: number;
  name: string;
  email: string;
  role: AdminRole;
  district?: string; // Required for District Admin (e.g. "Raisen", "Sehore", "Vidisha")
  state: string; // e.g. "Madhya Pradesh"
  password_hash: string;
  phone: string; // 10-digit phone for 2FA SMS
  two_factor_code?: string;
  two_factor_expiry?: string;
  last_login?: string;
  active: boolean;
  department: string; // e.g. "Department of Agriculture", "State Disaster Management Authority"
}

export interface AdminSession {
  token: string;
  admin_id: number;
  name: string;
  email: string;
  role: AdminRole;
  district?: string;
  state: string;
  department: string;
  expires_at: string;
}

export interface DistrictQuickStats {
  district: string;
  state: string;
  active_farmers: number;
  farmers_growth_monthly: number;
  active_alerts_count: number;
  alert_severity_breakdown: {
    high: number;
    medium: number;
    low: number;
  };
  crop_coverage: {
    crop: string;
    percentage: number;
    area_hectares: number;
  }[];
  avg_farm_health: number; // 0 to 10
  feedback_entries_count: number;
  pincodes_covered: number;
  villages_covered: number;
}

export type RiskLevel = "LOW" | "CAUTION" | "SIGNIFICANT" | "HIGH";

export interface DistrictRiskZone {
  pincode: string;
  village_or_tehsil: string;
  district: string;
  latitude: number;
  longitude: number;
  elevation_m: number;
  soil_type: string;
  risk_level: RiskLevel;
  risk_reason: string;
  risk_reason_hi: string;
  farmer_count: number;
  current_temp: number;
  rain_probability: number;
  wind_speed: number;
  vulnerable_crop: string;
  recommended_action: string;
}

export type AlertType =
  | "Cyclone Warning"
  | "Flood Warning"
  | "Heat Wave"
  | "Frost Alert"
  | "Hail Storm"
  | "Heavy Rain"
  | "Strong Wind"
  | "Pest Outbreak"
  | "Other";

export type AlertSeverity = "Caution" | "Significant" | "High" | "Extreme";

export interface BroadcastAlertRecord {
  alert_id: string;
  created_at: string;
  sender_admin_id: number;
  sender_name: string;
  sender_role: AdminRole;
  alert_type: AlertType;
  affected_districts: string[];
  severity: AlertSeverity;
  alert_message: string;
  recommended_action: string;
  channels: ("SMS" | "Email" | "In-app Notification" | "Broadcast")[];
  farmers_reached: number;
  delivery_status: "SENT" | "DELIVERED" | "PARTIAL_FAILURE";
  acknowledgement_rate_percent?: number;
}

export interface BroadcastAlertInput {
  alert_type: AlertType;
  affected_districts: string[];
  severity: AlertSeverity;
  alert_message: string;
  recommended_action: string;
  channels: ("SMS" | "Email" | "In-app Notification" | "Broadcast")[];
}

export type ReportType =
  | "Weekly Summary Report"
  | "Farmer Feedback Report"
  | "Alert Response Report"
  | "District Risk Assessment";

export interface EmailScheduleConfig {
  id: string;
  frequency: "Daily Morning (7 AM)" | "Weekly (Friday Evening)" | "Real-time (On Alert)";
  recipient_role: string;
  recipients: string[];
  subject: string;
  last_sent?: string;
  next_run: string;
  status: "ACTIVE" | "PAUSED";
}

/**
 * Types and interfaces for CHANGE_005: SMS-Based Feature Phone System
 * Rural access without smartphones via basic SMS
 */

export interface SmsRegisteredFarmerRecord {
  farmer_id: number;
  phone_number: string; // 10-digit normalized (e.g., "9826012345")
  name: string;
  pincode: string; // 6-digit Indian pincode
  village_name: string;
  district: string;
  state: string;
  primary_crop: string; // e.g. "Soybean", "Paddy", "Wheat"
  language_preference: "Hindi" | "English" | "Hinglish";
  registration_date: string; // ISO 8601
  last_sms_date?: string; // ISO 8601
  sms_count: number;
  alerts_enabled: boolean;
  sms_daily_limit: number; // Max SMS per day (default 5)
  sms_sent_today: number;
  last_active_date: string; // YYYY-MM-DD to reset daily quota
}

export interface SmsLogRecord {
  log_id: number;
  timestamp: string; // ISO 8601
  phone_number: string;
  incoming_sms: string;
  command_parsed: string;
  parameters: string;
  outgoing_sms: string;
  status: "Success" | "Error" | "Rate_Limited" | "Invalid_Command";
  response_time_ms: number;
  channel?: "Twilio" | "Simulator" | "Direct";
}

export type SmsCommandType =
  | "CROP"
  | "WEATHER"
  | "FORECAST"
  | "PEST"
  | "ALERT"
  | "REGISTER"
  | "LOCATION"
  | "HELP"
  | "UNKNOWN";

export interface ParsedSmsCommand {
  raw_text: string;
  command: SmsCommandType;
  parameters: Record<string, string>;
  crop?: string;
  stage?: string;
  days?: number;
  pincode?: string;
  isRegisteredIntent?: boolean;
}

export interface SmsExecutionResult {
  reply: string; // Concise, <= 160 characters
  command: SmsCommandType | string;
  status: "Success" | "Error" | "Rate_Limited" | "Invalid_Command";
  farmer?: SmsRegisteredFarmerRecord | null;
  execution_time_ms: number;
  char_count: number;
  fits_single_sms: boolean;
}

export interface SmsAnalyticsSummary {
  totalFarmers: number;
  totalSmsProcessed: number;
  todaySmsCount: number;
  commandBreakdown: Record<string, number>;
  activeDistricts: string[];
  averageResponseTimeMs: number;
  successRatePct: number;
}

/**
 * FINAL_005: Form Validation & Comprehensive Error Handling Engine
 * Enforces field-level validation, localized user-friendly errors, offline queuing, and error diagnostics.
 */

import {
  ValidationErrorType,
  FieldValidationResult,
  FormValidationSummary,
  ValidationErrorLogEntry,
  PendingSmsRecord,
  ApiHealthStatus,
  ErrorDashboardMetrics,
} from "./formValidationTypes";
import { lookupPincode } from "@/lib/feedback/pincodeService";

// In-Memory Validation Error Audit Log Table (Step 6)
let autoErrorId = 2001;
const VALIDATION_ERROR_LOG: ValidationErrorLogEntry[] = [
  {
    error_id: 1991,
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    error_type: "invalid_phone",
    field_name: "phone_number",
    user_message_hi: "भारतीय phone नंबर 6-9 से शुरु होता है (10 अंक)।",
    user_message_en: "Indian phone numbers must start with 6-9 and have 10 digits.",
    raw_technical_error: "Pattern mismatch: ^[6-9][0-9]{9}$ on input '5512345678'",
    user_agent: "Mozilla/5.0 (Linux; Android 14; Pixel 7)",
    resolved: true,
  },
  {
    error_id: 1992,
    timestamp: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
    error_type: "invalid_pincode",
    field_name: "pincode",
    user_message_hi: "यह pincode हमारे database में नहीं है। सही pincode enter करें।",
    user_message_en: "This pincode does not exist in the database.",
    raw_technical_error: "Lookup 462999 returned is_valid: false",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    resolved: true,
  },
  {
    error_id: 1993,
    timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    error_type: "missing_field",
    field_name: "weather_today",
    user_message_hi: "कृपया कम से कम 20 letters लिखें (विस्तार से बताएं)",
    user_message_en: "Please write at least 20 characters describing today's weather.",
    raw_technical_error: "Length 8 < minimum 20",
    user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4)",
    resolved: false,
  },
  {
    error_id: 1994,
    timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    error_type: "api_timeout",
    field_name: "weather_api",
    user_message_hi: "⏱️ Server slow है। कुछ seconds में दोबारा try करें।",
    user_message_en: "Server response timed out. Retrying with cached weather telemetry.",
    raw_technical_error: "AbortError: Timeout after 5000ms from Open-Meteo",
    user_agent: "System Cron Daemon",
    resolved: true,
  },
];

// In-Memory Pending SMS Queue Table (Step 4 & Step 8)
let autoQueueId = 501;
const PENDING_SMS_QUEUE: PendingSmsRecord[] = [
  {
    queue_id: "SMS-Q-501",
    phone_number: "+919826012345",
    incoming_sms: "WEATHER 462001",
    reply_message: "Bhopal (462001): Temp 31.5C, Rain 0mm (2% chance). Sky mainly clear. No spray delay.",
    attempt_count: 1,
    max_attempts: 5,
    status: "RETRYING",
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    last_attempt_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    next_retry_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    error_reason: "Twilio Gateway 503: Service Temporarily Unavailable",
  },
  {
    queue_id: "SMS-Q-502",
    phone_number: "+919425178901",
    incoming_sms: "CROP soybean STAGE flowering",
    reply_message: "Soybean Flowering: Heavy humidity >85%. High risk of whitefly and pod blight. Avoid chemical spray today.",
    attempt_count: 2,
    max_attempts: 5,
    status: "PENDING",
    created_at: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    last_attempt_at: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    next_retry_at: new Date(Date.now() + 2 * 60 * 1000).toISOString(),
    error_reason: "Carrier Route Timeout: Airtel MP Circle congested",
  },
];

// API Health Simulator State (Step 4 & Step 8)
const API_HEALTH_SERVICES: Record<string, ApiHealthStatus> = {
  open_meteo: {
    service_name: "Open-Meteo Telemetry API",
    service_key: "open_meteo",
    status: "healthy",
    response_time_ms: 142,
    last_checked: new Date().toISOString(),
    message: "Operating normally (p95 latency < 200ms)",
    success_rate_pct: 99.7,
    fallback_action: "Serve 2-hour cached forecast with ⚠️ staleness warning to farmer",
  },
  twilio_sms: {
    service_name: "Twilio Rural SMS Gateway",
    service_key: "twilio_sms",
    status: "healthy",
    response_time_ms: 280,
    last_checked: new Date().toISOString(),
    message: "Operating normally (2 queued retries active)",
    success_rate_pct: 97.4,
    fallback_action: "Queue SMS in PENDING_SMS_QUEUE — auto-retry up to 5 times over 30 min",
  },
  database: {
    service_name: "Database (SQLite & JSON Store)",
    service_key: "database",
    status: "healthy",
    response_time_ms: 12,
    last_checked: new Date().toISOString(),
    message: "High-speed indexed store (15 active B-tree indexes)",
    success_rate_pct: 99.99,
    fallback_action: "Return last in-memory cache snapshot; no data loss on read operations",
  },
  weather_cache: {
    service_name: "Weather Cache Engine (2h TTL)",
    service_key: "weather_cache",
    status: "healthy",
    response_time_ms: 2,
    last_checked: new Date().toISOString(),
    message: "95.8% cache hit ratio, instant memory access",
    success_rate_pct: 100,
    fallback_action: "Force-fetch from Open-Meteo directly on cache miss (adds ~140ms latency)",
  },
};

/* =========================================================================
   STEP 1: FIELD-LEVEL VALIDATORS
   ========================================================================= */

/**
 * 1. Farmer Name Validator
 * Rules: Required, Min 3, Max 100, Only letters/space/hyphen (English & Hindi)
 */
export function validateFarmerName(name: string): FieldValidationResult {
  const trimmed = (name || "").trim();
  if (!trimmed) {
    return {
      is_valid: false,
      error_message_hi: "कृपया अपना नाम enter करें",
      error_message_en: "Please enter your name",
    };
  }
  if (trimmed.length < 3) {
    return {
      is_valid: false,
      error_message_hi: "नाम कम से कम 3 letters का होना चाहिए",
      error_message_en: "Name must be at least 3 characters long",
    };
  }
  if (trimmed.length > 100) {
    return {
      is_valid: false,
      error_message_hi: "नाम 100 letters से ज्यादा नहीं हो सकता",
      error_message_en: "Name cannot exceed 100 characters",
    };
  }

  // Regex allows English letters, Hindi Devanagari (\u0900-\u097F), spaces, dots, and hyphens
  const nameRegex = /^[a-zA-Z\u0900-\u097F\s\-\.]+$/;
  if (!nameRegex.test(trimmed)) {
    return {
      is_valid: false,
      error_message_hi: "नाम में सिर्फ letters, space, aur hyphen हो सकते हैं",
      error_message_en: "Name can only contain letters, spaces, and hyphens",
    };
  }

  return { is_valid: true };
}

/**
 * 2. Phone Number Validator
 * Rules: Required, Exactly 10 digits, Must start with 6-9, Only numbers
 */
export function validatePhoneNumber(phone: string): FieldValidationResult {
  const trimmed = (phone || "").trim();
  if (!trimmed) {
    return {
      is_valid: false,
      error_message_hi: "Phone नंबर जरूरी है",
      error_message_en: "Phone number is required",
    };
  }

  // Check if non-digits exist
  if (/[^\d]/.test(trimmed)) {
    return {
      is_valid: false,
      error_message_hi: "सिर्फ numbers enter करें",
      error_message_en: "Please enter only numbers",
    };
  }

  // Check length
  if (trimmed.length !== 10) {
    return {
      is_valid: false,
      error_message_hi: "Phone नंबर 10 अंकों का होना चाहिए",
      error_message_en: "Phone number must be exactly 10 digits",
    };
  }

  // Must start with 6-9
  if (!/^[6-9]/.test(trimmed)) {
    return {
      is_valid: false,
      error_message_hi: "भारतीय phone नंबर 6-9 से शुरु होता है",
      error_message_en: "Indian phone numbers must start with 6, 7, 8, or 9",
    };
  }

  return { is_valid: true };
}

/**
 * 3. Pincode Validator
 * Rules: Required, Exactly 6 digits, Must exist in INDIA_PINCODES database
 */
export async function validatePincode(pincode: string): Promise<FieldValidationResult & { locationDetails?: any }> {
  const trimmed = (pincode || "").trim();
  if (!trimmed) {
    return {
      is_valid: false,
      error_message_hi: "Pincode required है",
      error_message_en: "Pincode is required",
    };
  }

  if (!/^\d{6}$/.test(trimmed)) {
    return {
      is_valid: false,
      error_message_hi: "Pincode 6 अंकों का होना चाहिए",
      error_message_en: "Pincode must be exactly 6 digits",
    };
  }

  try {
    const lookup = await lookupPincode(trimmed);
    if (!lookup.is_valid || !lookup.district) {
      return {
        is_valid: false,
        error_message_hi: "यह pincode हमारे database में नहीं है। सही pincode enter करें।",
        error_message_en: "This pincode does not exist in our database. Please enter a valid pincode.",
      };
    }

    return {
      is_valid: true,
      locationDetails: lookup,
    };
  } catch (err) {
    return {
      is_valid: false,
      error_message_hi: "Pincode जांचने में त्रुटि हुई। कृपया पुनः प्रयास करें।",
      error_message_en: "Error validating pincode. Please try again.",
    };
  }
}

/**
 * Synchronous format-only validator for pincode
 */
export function validatePincodeFormat(pincode: string): FieldValidationResult {
  const trimmed = (pincode || "").trim();
  if (!trimmed) {
    return {
      is_valid: false,
      error_message_hi: "Pincode required है",
      error_message_en: "Pincode is required",
    };
  }
  if (!/^\d{6}$/.test(trimmed)) {
    return {
      is_valid: false,
      error_message_hi: "Pincode 6 अंकों का होना चाहिए",
      error_message_en: "Pincode must be exactly 6 digits",
    };
  }
  return { is_valid: true };
}

/**
 * 4. Crop Name Validator
 */
export function validateCropName(crop: string): FieldValidationResult {
  if (!crop || !crop.trim()) {
    return {
      is_valid: false,
      error_message_hi: "कृपया एक crop select करें",
      error_message_en: "Please select a crop",
    };
  }
  return { is_valid: true };
}

/**
 * 5. Crop Stage Validator
 */
export function validateCropStage(stage: string): FieldValidationResult {
  if (!stage || !stage.trim()) {
    return {
      is_valid: false,
      error_message_hi: "कृपया crop stage select करें",
      error_message_en: "Please select a crop stage",
    };
  }
  return { is_valid: true };
}

/**
 * 6. Activity Today Validator
 */
export function validateActivityToday(activity: string): FieldValidationResult {
  if (!activity || !activity.trim()) {
    return {
      is_valid: false,
      error_message_hi: "कृपया आज का activity select करें",
      error_message_en: "Please select today's farm activity",
    };
  }
  return { is_valid: true };
}

/**
 * 7. Weather Today Validator
 * Rules: Required, Min 20 characters, Max 500 characters
 */
export function validateWeatherToday(weather: string): FieldValidationResult {
  const trimmed = (weather || "").trim();
  if (!trimmed) {
    return {
      is_valid: false,
      error_message_hi: "कृपया weather description enter करें",
      error_message_en: "Please enter weather description",
    };
  }
  if (trimmed.length < 20) {
    return {
      is_valid: false,
      error_message_hi: "कृपया कम से कम 20 letters लिखें (विस्तार से बताएं)",
      error_message_en: "Please write at least 20 characters (describe in detail)",
    };
  }
  if (trimmed.length > 500) {
    return {
      is_valid: false,
      error_message_hi: "ज्यादा से ज्यादा 500 letters लिख सकते हैं",
      error_message_en: "Weather description cannot exceed 500 characters",
    };
  }
  return { is_valid: true };
}

/**
 * 8. Action Taken Validator
 * Rules: Required, Min 20 characters
 */
export function validateActionTaken(action: string): FieldValidationResult {
  const trimmed = (action || "").trim();
  if (!trimmed) {
    return {
      is_valid: false,
      error_message_hi: "कृपया detail में बताएं कि आपने क्या किया",
      error_message_en: "Please describe what action was taken",
    };
  }
  if (trimmed.length < 20) {
    return {
      is_valid: false,
      error_message_hi: "कृपया विस्तार से describe करें (कम से कम 20 letters)",
      error_message_en: "Please describe in detail (at least 20 characters)",
    };
  }
  return { is_valid: true };
}

/**
 * 9. Outcome Rating Validator
 * Rules: Required, 1-5 integer
 */
export function validateOutcomeRating(rating: any): FieldValidationResult {
  const num = parseInt(rating, 10);
  if (isNaN(num) || num < 1 || num > 5) {
    return {
      is_valid: false,
      error_message_hi: "कृपया outcome rating select करें (1-5 stars)",
      error_message_en: "Please select an outcome rating (1-5 stars)",
    };
  }
  return { is_valid: true };
}

/**
 * 10. Photo Validator
 * Rules: Optional, Max 1 MB, Allowed formats JPG, PNG, WEBP
 */
export function validatePhoto(file?: { size?: number; type?: string }): FieldValidationResult {
  if (!file || !file.size) return { is_valid: true }; // Optional

  if (file.size > 1024 * 1024) {
    return {
      is_valid: false,
      error_message_hi: "Photo 1 MB से बड़ा नहीं हो सकता। छोटी size की photo upload करें।",
      error_message_en: "Photo cannot exceed 1 MB. Please upload a smaller photo.",
    };
  }

  const mime = (file.type || "").toLowerCase();
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (mime && !allowed.includes(mime)) {
    return {
      is_valid: false,
      error_message_hi: "सिर्फ JPG या PNG format accept हैं",
      error_message_en: "Only JPG, PNG, or WEBP formats are accepted",
    };
  }

  return { is_valid: true };
}

/* =========================================================================
   STEP 2: FORM-LEVEL VALIDATOR AGGREGATOR
   ========================================================================= */

export async function validateEntireFarmerFeedbackForm(data: {
  farmer_name?: string;
  phone_number?: string;
  pincode?: string;
  crop_name?: string;
  crop_stage?: string;
  activity_today?: string;
  weather_today?: string;
  action_taken?: string;
  outcome_rating?: any;
  photo?: { size?: number; type?: string };
}): Promise<FormValidationSummary> {
  const errors: Record<string, string> = {};

  // Check required presence
  const nameRes = validateFarmerName(data.farmer_name || "");
  if (!nameRes.is_valid) errors.farmer_name = nameRes.error_message_hi!;

  const phoneRes = validatePhoneNumber(data.phone_number || "");
  if (!phoneRes.is_valid) errors.phone_number = phoneRes.error_message_hi!;

  const pinRes = await validatePincode(data.pincode || "");
  if (!pinRes.is_valid) errors.pincode = pinRes.error_message_hi!;

  const cropRes = validateCropName(data.crop_name || "");
  if (!cropRes.is_valid) errors.crop_name = cropRes.error_message_hi!;

  const stageRes = validateCropStage(data.crop_stage || "");
  if (!stageRes.is_valid) errors.crop_stage = stageRes.error_message_hi!;

  const actRes = validateActivityToday(data.activity_today || "");
  if (!actRes.is_valid) errors.activity_today = actRes.error_message_hi!;

  const weatherRes = validateWeatherToday(data.weather_today || "");
  if (!weatherRes.is_valid) errors.weather_today = weatherRes.error_message_hi!;

  const actionRes = validateActionTaken(data.action_taken || "");
  if (!actionRes.is_valid) errors.action_taken = actionRes.error_message_hi!;

  const ratingRes = validateOutcomeRating(data.outcome_rating);
  if (!ratingRes.is_valid) errors.outcome_rating = ratingRes.error_message_hi!;

  if (data.photo) {
    const photoRes = validatePhoto(data.photo);
    if (!photoRes.is_valid) errors.photo = photoRes.error_message_hi!;
  }

  const hasErrors = Object.keys(errors).length > 0;
  if (!hasErrors) {
    return { is_valid: true, field_errors: {} };
  }

  // Check if errors are pure missing fields or format errors
  const isMissingOnly = Object.values(errors).some((msg) =>
    msg.includes("जरूरी है") || msg.includes("enter करें") || msg.includes("select करें")
  );

  return {
    is_valid: false,
    field_errors: errors,
    form_error_hi: isMissingOnly ? "कृपया सभी जरूरी fields भरें" : "कुछ fields में errors हैं। ऊपर देखें।",
    form_error_en: isMissingOnly ? "Please fill all required fields." : "Some fields have errors. Please review above.",
  };
}

/* =========================================================================
   STEP 3: SMS COMMAND VALIDATION & RESILIENT FUZZY MATCHING
   ========================================================================= */

const KNOWN_SMS_COMMANDS = ["WEATHER", "CROP", "PEST", "ALERT", "HELP", "REGISTER", "LOCATION", "FORECAST"];
const KNOWN_CROPS = ["Soybean", "Paddy", "Wheat", "Chickpea", "Maize", "Cotton", "Mustard"];
const KNOWN_STAGES = ["sowing", "vegetative", "flowering", "pod fill", "maturity"];

/**
 * Simple Levenshtein distance for fuzzy matching
 */
function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

export function validateSmsCommand(
  rawSms: string,
  farmerRegistered: boolean,
  dailySmsCount: number = 0
): {
  is_valid: boolean;
  reply_message: string;
  matched_command?: string;
  normalized_params?: Record<string, string>;
  should_ignore?: boolean;
  assumption_note?: string;
} {
  const trimmed = (rawSms || "").trim();

  // 1. Message must be non-empty
  if (!trimmed) {
    return {
      is_valid: false,
      reply_message: "खाली SMS मत भेजो। WEATHER, CROP, या HELP लिखकर भेजो।",
      should_ignore: false,
    };
  }

  // 2. Daily SMS limit check (> 10 SMS per day)
  if (dailySmsCount >= 10) {
    return {
      is_valid: false,
      reply_message: "आज की limit पूरी हो गई। कल दोबारा try करो।",
    };
  }

  const tokens = trimmed.split(/\s+/);
  const firstToken = tokens[0].toUpperCase();

  // Fuzzy match command if typo (e.g., 'WEATHR' -> 'WEATHER')
  let matchedCommand = firstToken;
  if (!KNOWN_SMS_COMMANDS.includes(firstToken)) {
    let closest = "";
    let minDistance = 999;
    for (const cmd of KNOWN_SMS_COMMANDS) {
      const maxAllowed = cmd.length <= 4 ? 1 : 2;
      const dist = levenshtein(firstToken, cmd);
      if (dist <= maxAllowed && dist < minDistance) {
        minDistance = dist;
        closest = cmd;
      }
    }
    if (closest) {
      matchedCommand = closest;
    }
  }

  // Check registered requirement
  if (!farmerRegistered && matchedCommand !== "LOCATION" && matchedCommand !== "HELP" && !/^\d{6}$/.test(firstToken)) {
    return {
      is_valid: false,
      reply_message: "LOCATION [pincode] भेजकर पहले register करो। Example: LOCATION 462001",
    };
  }

  // Crop & Stage validation
  if (matchedCommand === "CROP") {
    const rawCrop = tokens[1] || "";
    const stageIdx = trimmed.toLowerCase().indexOf("stage");
    let rawStage = "";
    if (stageIdx !== -1) {
      rawStage = trimmed.substring(stageIdx + 5).trim().toLowerCase();
    }

    // Fuzzy match crop (e.g., 'soyybean' -> 'Soybean')
    let matchedCrop = "Soybean";
    let assumptionNote: string | undefined = undefined;
    for (const c of KNOWN_CROPS) {
      if (levenshtein(rawCrop.toLowerCase(), c.toLowerCase()) <= 2) {
        matchedCrop = c;
        if (rawCrop.toLowerCase() !== c.toLowerCase()) {
          assumptionNote = `(Assuming ${c})`;
        }
        break;
      }
    }

    // Check stage
    if (rawStage && !KNOWN_STAGES.some((s) => rawStage.includes(s))) {
      return {
        is_valid: false,
        reply_message: "Stage समझ नहीं आई। Options: Sowing, Vegetative, Flowering, Pod Formation, Harvesting",
      };
    }

    return {
      is_valid: true,
      reply_message: "OK",
      matched_command: "CROP",
      normalized_params: { crop: matchedCrop, stage: rawStage || "vegetative" },
      assumption_note: assumptionNote,
    };
  }

  if (KNOWN_SMS_COMMANDS.includes(matchedCommand) || /^\d{6}$/.test(trimmed)) {
    return {
      is_valid: true,
      reply_message: "OK",
      matched_command: matchedCommand,
    };
  }

  return {
    is_valid: false,
    reply_message: "कमांड समझ नहीं आई। ये try करो: WEATHER, CROP, ALERT, या HELP",
  };
}

/* =========================================================================
   STEP 5: USER-FRIENDLY ERROR MESSAGES & TRANSLATION TABLE
   ========================================================================= */

export function normalizeTechnicalErrorMessage(
  err: any,
  language: "hi" | "en" = "hi"
): string {
  const errStr = typeof err === "string" ? err : err?.message || err?.toString() || "";
  const lower = errStr.toLowerCase();

  if (lower.includes("pincode") && (lower.includes("undefined") || lower.includes("null") || lower.includes("typeerror") || lower.includes("cannot read"))) {
    return language === "hi"
      ? "❌ Pincode set करने में problem हो रही है। App को refresh करें और फिर try करें।"
      : "❌ Issue resolving pincode. Please refresh the app and try again.";
  }

  if (
    lower.includes("failed to fetch") ||
    lower.includes("networkerror") ||
    lower.includes("internet_disconnected") ||
    lower.includes("offline")
  ) {
    return language === "hi"
      ? "📡 Internet connection problem है। Mobile data या WiFi check करें।"
      : "📡 Internet connection issue. Please check your mobile data or Wi-Fi.";
  }

  if (lower.includes("timeout") || lower.includes("timed out") || lower.includes("5000ms")) {
    return language === "hi"
      ? "⏱️ Server slow है। कुछ seconds में दोबारा try करें।"
      : "⏱️ Server is taking longer than expected. Retrying in a few seconds.";
  }

  if (lower.includes("invalid json") || lower.includes("unexpected token") || lower.includes("syntaxerror")) {
    return language === "hi"
      ? "⚙️ Server पर technical issue है। कुछ देर बाद try करें।"
      : "⚙️ Server technical issue encountered. Please try again shortly.";
  }

  if (lower.includes("503") || lower.includes("502") || lower.includes("gateway")) {
    return language === "hi"
      ? "⚠️ मौसम सेवा अस्थायी रूप से व्यस्त है। कैश्ड मौसम दिखाया जा रहा है।"
      : "⚠️ Weather gateway is temporarily congested. Serving cached forecast.";
  }

  if (lower.includes("twilio") || lower.includes("sms send failed")) {
    return language === "hi"
      ? "SMS भेजने में problem आई। हम 5 मिनट में दोबारा try करेंगे।"
      : "Issue sending SMS. We will automatically retry in 5 minutes.";
  }

  return language === "hi"
    ? "Server पर मामूली समस्या है। कुछ देर बाद try करें।"
    : "Temporary server error encountered. Please try again later.";
}

/* =========================================================================
   STEP 6: VALIDATION ERROR LOGGING TABLE (VALIDATION_ERROR_LOG)
   ========================================================================= */

export function logValidationError(entry: {
  error_type: ValidationErrorType;
  field_name?: string;
  user_message_hi: string;
  user_message_en: string;
  raw_technical_error?: string;
  user_agent?: string;
}): ValidationErrorLogEntry {
  const record: ValidationErrorLogEntry = {
    error_id: autoErrorId++,
    timestamp: new Date().toISOString(),
    error_type: entry.error_type,
    field_name: entry.field_name,
    user_message_hi: entry.user_message_hi,
    user_message_en: entry.user_message_en,
    raw_technical_error: entry.raw_technical_error,
    user_agent: entry.user_agent,
    resolved: false,
  };

  VALIDATION_ERROR_LOG.unshift(record);
  if (VALIDATION_ERROR_LOG.length > 200) VALIDATION_ERROR_LOG.pop();
  return record;
}

export function getValidationErrorLogs(limit: number = 50): ValidationErrorLogEntry[] {
  return VALIDATION_ERROR_LOG.slice(0, limit);
}

export function clearValidationErrorLogs(): boolean {
  VALIDATION_ERROR_LOG.length = 0;
  return true;
}

/* =========================================================================
   STEP 4 & STEP 8: PENDING SMS QUEUE & RETRY ENGINE
   ========================================================================= */

export function enqueuePendingSms(
  phone: string,
  incomingSms: string,
  replyMessage: string,
  errorReason: string
): PendingSmsRecord {
  const queueItem: PendingSmsRecord = {
    queue_id: `SMS-Q-${autoQueueId++}`,
    phone_number: phone,
    incoming_sms: incomingSms,
    reply_message: replyMessage,
    attempt_count: 1,
    max_attempts: 5,
    status: "PENDING",
    created_at: new Date().toISOString(),
    next_retry_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    error_reason: errorReason,
  };

  PENDING_SMS_QUEUE.unshift(queueItem);
  return queueItem;
}

export function getPendingSmsQueue(): PendingSmsRecord[] {
  return PENDING_SMS_QUEUE;
}

export function processPendingSmsRetry(queueId: string): { success: boolean; message: string; record?: PendingSmsRecord } {
  const item = PENDING_SMS_QUEUE.find((q) => q.queue_id === queueId);
  if (!item) {
    return { success: false, message: "Queue record not found" };
  }

  item.attempt_count++;
  item.last_attempt_at = new Date().toISOString();

  if (item.attempt_count >= item.max_attempts) {
    item.status = "FAILED";
    return {
      success: false,
      message: `Max retries (${item.max_attempts}) reached. Notifying district admin.`,
      record: item,
    };
  }

  // Simulate successful dispatch on manual retry
  item.status = "DELIVERED";
  return {
    success: true,
    message: `SMS successfully delivered to ${item.phone_number} on attempt ${item.attempt_count}.`,
    record: item,
  };
}

/* =========================================================================
   STEP 8: ERROR METRICS & API HEALTH STATUS
   ========================================================================= */

export function getErrorDashboardMetrics(): ErrorDashboardMetrics {
  const total = VALIDATION_ERROR_LOG.length;
  const errorsPerHour = Math.round(total / 24 * 10) / 10;
  const isAlert = errorsPerHour > 100;

  // Compute top common error types
  const typeCounts: Record<string, number> = {};
  VALIDATION_ERROR_LOG.forEach((err) => {
    typeCounts[err.error_type] = (typeCounts[err.error_type] || 0) + 1;
  });

  const labelsMap: Record<string, { hi: string; en: string }> = {
    invalid_phone: { hi: "अमान्य मोबाइल नंबर", en: "Invalid Phone Number" },
    invalid_pincode: { hi: "अमान्य पिनकोड", en: "Invalid Pincode" },
    missing_field: { hi: "अनिवार्य फ़ील्ड रिक्त", en: "Missing Mandatory Field" },
    api_timeout: { hi: "API टाइमआउट / देरी", en: "API Latency / Timeout" },
    invalid_weather_desc: { hi: "मौसम विवरण छोटा (< 20 अक्षर)", en: "Weather Description Too Short" },
    invalid_action_taken: { hi: "कार्य विवरण छोटा (< 20 अक्षर)", en: "Action Description Too Short" },
    oversized_photo: { hi: "फ़ोटो आकार सीमा पार (> 1 MB)", en: "Photo Exceeds 1 MB" },
    sms_unknown_command: { hi: "अज्ञात SMS कमांड", en: "Unknown SMS Command" },
    network_offline: { hi: "ऑफ़लाइन नेटवर्क त्रुटि", en: "Offline Network Error" },
  };

  const topErrors = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([type, count]) => ({
      error_type: type as ValidationErrorType,
      label_hi: labelsMap[type]?.hi || type,
      label_en: labelsMap[type]?.en || type,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }));

  return {
    total_errors_24h: total,
    errors_per_hour_rate: errorsPerHour,
    is_high_error_alert: isAlert,
    failed_form_submissions_count: Math.max(1, Math.round(total * 0.04)),
    failed_submission_rate_pct: 3.8, // Healthy < 5% target
    top_common_errors: topErrors,
    api_health_statuses: Object.values(API_HEALTH_SERVICES),
    pending_sms_queue_count: PENDING_SMS_QUEUE.filter((q) => q.status === "PENDING" || q.status === "RETRYING").length,
  };
}

export function simulateApiFailure(
  serviceKey: string,
  simulateDown: boolean
): ApiHealthStatus | null {
  const service = API_HEALTH_SERVICES[serviceKey];
  if (!service) return null;

  service.is_simulated_down = simulateDown;
  if (simulateDown) {
    service.status = "down";
    service.response_time_ms = 5000;
    service.message = "Simulated outage: Automatic fallback to cached telemetry active";
    logValidationError({
      error_type: "api_timeout",
      field_name: serviceKey,
      user_message_hi: "⏱️ Server slow है। कुछ seconds में दोबारा try करें।",
      user_message_en: `${service.service_name} simulated outage.`,
      raw_technical_error: `Simulated timeout on ${serviceKey}`,
    });
  } else {
    service.status = "healthy";
    service.response_time_ms = serviceKey === "database" ? 12 : 140;
    service.message = "Operating normally (p95 latency < 200ms)";
  }
  service.last_checked = new Date().toISOString();
  return service;
}

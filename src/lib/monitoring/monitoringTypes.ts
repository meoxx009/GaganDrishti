/**
 * FINAL_007: Comprehensive Monitoring, Logging & Analytics Types
 * Covers all 6 primary logging tables, database query logging, alert rules,
 * daily health reports, and weekly analytics summaries.
 */

// ── 1. API Call Logs (Step 1) ────────────────────────────────────────────────
export interface ApiCallLogEntry {
  log_id: string;
  timestamp: string;
  api_name: "Open-Meteo" | "OpenWeatherMap" | "NOAA" | "IMD-Kavach" | "Twilio";
  endpoint: string;
  pincode?: string;
  response_time_ms: number;
  status: "success" | "timeout" | "error";
  error_message?: string;
  cache_hit: boolean;
}

// ── 2. Form Submission Logs (Step 1) ─────────────────────────────────────────
export interface FormSubmissionLogEntry {
  log_id: string;
  timestamp: string;
  form_name: "farmer_feedback" | "crop_decision" | "admin_broadcast" | "pwa_registration";
  pincode?: string;
  farmer_name?: string;
  status: "success" | "validation_error" | "network_error" | "database_error";
  error_details?: string;
  submission_time_ms: number;
}

// ── 3. SMS Logs (Step 1) ─────────────────────────────────────────────────────
export interface SmsLogEntry {
  log_id: string;
  timestamp: string;
  phone_number: string;
  direction: "incoming" | "outgoing";
  message_text: string;
  status: "sent" | "delivered" | "delivery_failed" | "received";
  twilio_sid: string;
}

// ── 4. Error Logs (Step 1) ───────────────────────────────────────────────────
export interface ErrorLogEntry {
  log_id: string;
  timestamp: string;
  error_type: "TypeError" | "NetworkError" | "ValidationError" | "TimeoutError" | "DatabaseError" | "SyntaxError";
  error_message: string;
  error_stack_trace: string;
  user_agent: string;
  page_url: string;
  severity: "info" | "warning" | "error" | "critical";
  occurrences: number;
  resolved: boolean;
}

// ── 5. User Session Logs (Step 1) ────────────────────────────────────────────
export interface UserSessionLogEntry {
  session_id: string;
  start_time: string;
  end_time: string;
  duration_seconds: number;
  pages_visited: string[];
  actions_taken: string[];
  device_type: "mobile" | "tablet" | "desktop";
  browser: string;
  country: string;
  pincode?: string;
}

// ── 6. Performance Logs (Step 1 & Step 7) ────────────────────────────────────
export interface PerformanceLogEntry {
  log_id: string;
  timestamp: string;
  page_name: string;
  load_time_ms: number;
  network_time_ms: number;
  rendering_time_ms: number;
  dns_time_ms?: number;
  tcp_time_ms?: number;
  ttfb_ms?: number;
  device_type: "mobile" | "tablet" | "desktop";
  network_speed: "4G" | "3G" | "2G" | "WiFi" | "unknown";
}

// ── 7. Database Query Logs (Step 8) ──────────────────────────────────────────
export interface DatabaseQueryLogEntry {
  query_id: string;
  timestamp: string;
  query_text: string;
  execution_time_ms: number;
  row_count: number;
  indexes_used: string[];
  is_slow_query: boolean; // True if > 1000ms
  table_name: string;
}

// ── 8. Monitoring Alert Rules & Events (Step 2) ──────────────────────────────
export interface MonitoringAlertRule {
  rule_id: string;
  trigger_name: string;
  threshold_description: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  action_description: string;
  is_active: boolean;
}

export interface MonitoringAlertEvent {
  event_id: string;
  timestamp: string;
  rule_id: string;
  title: string;
  message: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  metric_value: string;
  threshold: string;
  dispatched_email_to?: string;
  resolved: boolean;
}

// ── 9. Dashboard Aggregate Data (Step 3) ─────────────────────────────────────
export interface HealthCardMetric {
  title: string;
  subtitle: string;
  status: "green" | "yellow" | "red";
  current_percentage: number;
  target_percentage: number;
  description: string;
}

export interface Performance24hMetrics {
  average_page_load_ms: number;
  p95_page_load_ms: number;
  peak_traffic_time: string;
  total_api_calls: number;
  total_sms_sent: number;
  total_form_submissions: number;
  total_errors_logged: number;
}

export interface TrendDayData {
  date: string;
  day_label: string;
  api_response_time_ms: number;
  form_submissions: number;
  error_rate_pct: number;
  active_users: number;
}

export interface MonitoringDashboardData {
  overall_status: "HEALTHY" | "DEGRADED" | "CRITICAL";
  health_cards: {
    api_health: HealthCardMetric;
    form_health: HealthCardMetric;
    sms_health: HealthCardMetric;
    database_health: HealthCardMetric;
  };
  performance_24h: Performance24hMetrics;
  active_alerts: MonitoringAlertEvent[];
  recent_errors: ErrorLogEntry[];
  seven_day_trends: TrendDayData[];
  log_counts: {
    api_calls: number;
    form_submissions: number;
    sms: number;
    errors: number;
    sessions: number;
    performance: number;
    db_queries: number;
  };
}

// ── 10. Daily Health Report (Step 5) ─────────────────────────────────────────
export interface DailyHealthReport {
  report_date: string;
  generated_at: string;
  email_subject: string;
  recipient: string;
  summary: {
    farmers_submitted_feedback: number;
    sms_commands_processed: number;
    api_calls_made: number;
    total_errors: number;
  };
  issues_identified: Array<{
    severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
    description: string;
  }>;
  top_insights: {
    most_used_command: string;
    top_error: string;
    slowest_page: string;
    fastest_api: string;
  };
  recommended_actions: string[];
}

// ── 11. Weekly Analytics Report (Step 9) ─────────────────────────────────────
export interface WeeklyAnalyticsReport {
  week_range: string;
  generated_at: string;
  total_farmers_active: number;
  farmer_growth_pct: number;
  total_feedback_submissions: number;
  form_success_rate_pct: number;
  avg_page_load_ms: number;
  geographic_distribution: Array<{ district: string; farmers_count: number; pct: number }>;
  crop_distribution: Array<{ crop: string; count: number; pct: number }>;
  device_distribution: { mobile_pct: number; tablet_pct: number; desktop_pct: number };
  performance_trend_7d: Array<{ day: string; avg_load_ms: number }>;
  common_feedback_themes: Array<{ theme: string; count: number }>;
  recommendations_for_next_week: string[];
}

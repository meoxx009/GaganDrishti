import { NextRequest, NextResponse } from "next/server";
import {
  getMonitoringDashboardData,
  API_CALL_LOGS,
  FORM_SUBMISSION_LOGS,
  SMS_LOGS,
  ERROR_LOGS,
  USER_SESSION_LOGS,
  PERFORMANCE_LOGS,
  DB_QUERY_LOGS,
  logError,
  logApiCall,
  logSms,
  resolveAlert,
  evaluateAlertRules,
} from "@/lib/monitoring/monitoringEngine";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const table = searchParams.get("table");

    const dashboard = getMonitoringDashboardData();

    // If specific table logs requested
    if (table) {
      switch (table) {
        case "api_calls":
          return NextResponse.json({ success: true, data: API_CALL_LOGS });
        case "form_submissions":
          return NextResponse.json({ success: true, data: FORM_SUBMISSION_LOGS });
        case "sms":
          return NextResponse.json({ success: true, data: SMS_LOGS });
        case "errors":
          return NextResponse.json({ success: true, data: ERROR_LOGS });
        case "sessions":
          return NextResponse.json({ success: true, data: USER_SESSION_LOGS });
        case "performance":
          return NextResponse.json({ success: true, data: PERFORMANCE_LOGS });
        case "db_queries":
          return NextResponse.json({ success: true, data: DB_QUERY_LOGS });
        default:
          return NextResponse.json({ success: false, error: "Invalid table requested" }, { status: 400 });
      }
    }

    return NextResponse.json({
      success: true,
      dashboard,
      logs: {
        api_calls: API_CALL_LOGS.slice(0, 50),
        form_submissions: FORM_SUBMISSION_LOGS.slice(0, 50),
        sms: SMS_LOGS.slice(0, 50),
        errors: ERROR_LOGS.slice(0, 50),
        sessions: USER_SESSION_LOGS.slice(0, 50),
        performance: PERFORMANCE_LOGS.slice(0, 50),
        db_queries: DB_QUERY_LOGS.slice(0, 50),
      },
    });
  } catch (error) {
    console.error("Monitoring GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch monitoring data" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "resolve_alert") {
      const { event_id } = body;
      const success = resolveAlert(event_id);
      return NextResponse.json({ success, message: "Alert resolved" });
    }

    if (action === "simulate_incident") {
      const { incident_type } = body;
      if (incident_type === "api_timeout") {
        logApiCall({
          api_name: "Open-Meteo",
          endpoint: "/v1/forecast?latitude=23.25&longitude=77.41",
          pincode: "462001",
          response_time_ms: 5200,
          status: "timeout",
          error_message: "Simulated upstream timeout after 5200ms",
          cache_hit: false,
        });
      } else if (incident_type === "sms_failure") {
        logSms({
          phone_number: "+919826099999",
          direction: "outgoing",
          message_text: "Test broadcast failed due to carrier outage",
          status: "delivery_failed",
          twilio_sid: `SM_sim_${Date.now()}`,
        });
      } else if (incident_type === "repeated_error") {
        for (let i = 0; i < 22; i++) {
          logError({
            error_type: "NetworkError",
            error_message: "Simulated carrier connection refused: ECONNRESET on 4G rural tower",
            error_stack_trace: "fetchWithRetry (networkClient.ts:45)",
            user_agent: "Mozilla/5.0 (Mobile; Android 12)",
            page_url: "/farmer-feedback",
            severity: "critical",
          });
        }
      }
      const updatedAlerts = evaluateAlertRules();
      return NextResponse.json({
        success: true,
        message: `Incident '${incident_type}' simulated successfully.`,
        active_alerts: updatedAlerts,
      });
    }

    if (action === "evaluate_alerts") {
      const alerts = evaluateAlertRules();
      return NextResponse.json({ success: true, active_alerts: alerts });
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Monitoring POST error:", error);
    return NextResponse.json({ success: false, error: "Monitoring action failed" }, { status: 500 });
  }
}

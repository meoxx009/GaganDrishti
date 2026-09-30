import { NextRequest, NextResponse } from "next/server";
import {
  getErrorDashboardMetrics,
  getValidationErrorLogs,
  getPendingSmsQueue,
  processPendingSmsRetry,
  simulateApiFailure,
  clearValidationErrorLogs,
  logValidationError,
} from "@/lib/validation/formValidationEngine";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const filter = searchParams.get("filter");

    const metrics = getErrorDashboardMetrics();
    let logs = getValidationErrorLogs(limit);

    if (filter) {
      logs = logs.filter((l) => l.error_type === filter);
    }

    const pendingQueue = getPendingSmsQueue();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      metrics,
      logs,
      pending_sms_queue: pendingQueue,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch error metrics",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    if (action === "retry_sms") {
      const { queue_id } = body;
      if (!queue_id) {
        return NextResponse.json(
          { success: false, error: "queue_id is required" },
          { status: 400 }
        );
      }
      const result = processPendingSmsRetry(queue_id);
      return NextResponse.json({
        success: result.success,
        message: result.message,
        record: result.record,
      });
    }

    if (action === "simulate_failure") {
      const { service, simulateDown } = body;
      if (!service) {
        return NextResponse.json(
          { success: false, error: "service is required (open_meteo, twilio, database, cache)" },
          { status: 400 }
        );
      }
      const updatedStatus = simulateApiFailure(service, Boolean(simulateDown));
      return NextResponse.json({
        success: true,
        service,
        status: updatedStatus,
        message: simulateDown
          ? `Simulated outage applied to ${service}. Fallback mode active.`
          : `Simulated outage removed for ${service}. Service restored to healthy.`,
      });
    }

    if (action === "clear_logs") {
      clearValidationErrorLogs();
      return NextResponse.json({
        success: true,
        message: "Validation error logs successfully cleared.",
      });
    }

    if (action === "log_error") {
      const entry = logValidationError({
        error_type: body.error_type || "general_validation_error",
        field_name: body.field_name,
        user_message_hi: body.user_message_hi,
        user_message_en: body.user_message_en,
        raw_technical_error: body.raw_technical_error,
        user_agent: request.headers.get("user-agent") || undefined,
      });
      return NextResponse.json({
        success: true,
        entry,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: `Unknown action: '${action}'. Supported: retry_sms, simulate_failure, clear_logs, log_error`,
      },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process error admin action",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}

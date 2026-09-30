import { NextRequest, NextResponse } from "next/server";
import { getPreLaunchDashboardData, FINAL_SIGNOFF_ITEMS } from "@/lib/prelaunch/prelaunchEngine";
import { runPreLaunchSecurityAudit, sanitizeInput, checkRateLimit, maskPhoneNumber } from "@/lib/security/securityService";

export async function GET() {
  try {
    const dashboard = getPreLaunchDashboardData();
    const security_audit = runPreLaunchSecurityAudit();

    return NextResponse.json({
      success: true,
      dashboard,
      security_audit,
    });
  } catch (error) {
    console.error("Pre-launch API error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch pre-launch data" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // Interactive Security Test Runner (Step 1 Verification)
    if (action === "test_sql_injection") {
      const { input } = body;
      const result = sanitizeInput(input || "462001'; DROP TABLE INDIA_PINCODES--");
      return NextResponse.json({
        success: true,
        test_type: "SQL_INJECTION_DEFENSE",
        is_safe: result.is_safe,
        threat_detected: result.threat_detected,
        sanitized_value: result.sanitized_value,
        message: result.is_safe
          ? "Input considered safe"
          : `Dangerous SQL pattern caught and neutralized (${result.threat_detected})`,
      });
    }

    if (action === "test_rate_limit") {
      const { client_id } = body;
      const res = checkRateLimit(client_id || "demo-test-client", 5, 10000);
      return NextResponse.json({
        success: true,
        test_type: "RATE_LIMIT_DEFENSE",
        allowed: res.allowed,
        remaining_in_window: res.remaining,
        reset_in_seconds: res.reset_in_seconds,
        message: res.allowed
          ? `Request allowed (${res.remaining} remaining in 10s window)`
          : `Rate limit triggered: Request blocked (reset in ${res.reset_in_seconds}s)`,
      });
    }

    if (action === "test_pii_masking") {
      const { phone } = body;
      const masked = maskPhoneNumber(phone || "+919826012345");
      return NextResponse.json({
        success: true,
        test_type: "PII_MASKING",
        original: phone || "+919826012345",
        masked,
        message: `Phone number successfully masked to ${masked}`,
      });
    }

    if (action === "sign_off") {
      const { key, signee_name } = body;
      const item = FINAL_SIGNOFF_ITEMS.find((s) => s.key === key);
      if (item) {
        item.signed_off = true;
        item.signed_by = signee_name || "Authorized Launch Officer";
        item.signed_at = new Date().toISOString();
        return NextResponse.json({ success: true, message: `Signed off ${item.label}`, item });
      }
      return NextResponse.json({ success: false, error: "Signoff key not found" }, { status: 404 });
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Pre-launch POST error:", error);
    return NextResponse.json({ success: false, error: "Pre-launch action failed" }, { status: 500 });
  }
}

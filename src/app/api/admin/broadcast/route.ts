import { NextRequest, NextResponse } from "next/server";
import { validateAdminSession, ADMIN_USERS } from "@/lib/admin/adminDatabase";
import { dispatchEmergencyBroadcast } from "@/lib/admin/emergencyBroadcastService";
import { BroadcastAlertInput, AdminSession } from "@/lib/admin/adminTypes";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = body.token || req.headers.get("Authorization")?.replace("Bearer ", "");

    let session: AdminSession | null = null;
    if (token) {
      session = validateAdminSession(token);
    }

    // Fallback default admin session if testing without login token
    if (!session) {
      const defaultUser = ADMIN_USERS[0];
      session = {
        token: "gov_sess_demo",
        admin_id: defaultUser.admin_id,
        name: defaultUser.name,
        email: defaultUser.email,
        role: defaultUser.role,
        district: defaultUser.district,
        state: defaultUser.state,
        department: defaultUser.department,
        expires_at: new Date(Date.now() + 3600000).toISOString(),
      };
    }

    const alertInput: BroadcastAlertInput = {
      alert_type: body.alert_type,
      affected_districts: body.affected_districts || [session.district || "Raisen"],
      severity: body.severity || "High",
      alert_message: body.alert_message,
      recommended_action: body.recommended_action,
      channels: body.channels || ["SMS", "In-app Notification"],
    };

    const result = await dispatchEmergencyBroadcast(alertInput, session);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error("Broadcast API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to dispatch broadcast" },
      { status: 500 }
    );
  }
}

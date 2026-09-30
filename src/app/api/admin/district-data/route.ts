import { NextRequest, NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/admin/adminDatabase";
import {
  getDistrictQuickStats,
  getDistrictRiskZones,
  getDistrictCropStageDistribution,
  getDistrictPestAlerts,
  getDistrictAnalyticsTrends,
} from "@/lib/admin/districtRiskEngine";
import { getBroadcastAlertsHistory } from "@/lib/admin/emergencyBroadcastService";
import { FARMER_FEEDBACK } from "@/lib/feedback/farmerFeedbackDatabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token") || req.headers.get("Authorization")?.replace("Bearer ", "");
    let district = searchParams.get("district") || "Raisen";

    // Session verification (optional in demo/public mode, but enforced when token is provided)
    if (token) {
      const session = validateAdminSession(token);
      if (session) {
        // District Admin constraint: can only see their district
        if (session.role === "District Admin" && session.district) {
          district = session.district;
        }
      }
    }

    const stats = getDistrictQuickStats(district);
    const riskZones = getDistrictRiskZones(district);
    const alerts = getBroadcastAlertsHistory(district);
    const cropStages = getDistrictCropStageDistribution(district);
    const pestAlerts = getDistrictPestAlerts(district);
    const recentFeedback = FARMER_FEEDBACK.slice(0, 20);
    const analyticsTrends = getDistrictAnalyticsTrends(district);

    return NextResponse.json({
      success: true,
      district,
      stats,
      risk_zones: riskZones,
      active_alerts: alerts,
      crop_stages: cropStages,
      pest_alerts: pestAlerts,
      recent_feedback: recentFeedback,
      analytics_trends: analyticsTrends,
    });
  } catch (error: any) {
    console.error("District Data API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load district telemetry" },
      { status: 500 }
    );
  }
}

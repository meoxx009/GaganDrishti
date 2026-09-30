import { NextRequest, NextResponse } from "next/server";
import {
  getAllRegisteredFarmers,
  getAllSmsLogs,
  getSmsAnalytics,
  registerOrUpdateFarmer,
} from "@/lib/sms/smsDatabase";

/**
 * GET /api/sms/farmers
 * Returns registered farmers, SMS analytics, and recent logs
 */
export async function GET() {
  try {
    const farmers = getAllRegisteredFarmers();
    const analytics = getSmsAnalytics();
    const logs = getAllSmsLogs(50);

    return NextResponse.json({
      success: true,
      farmers,
      analytics,
      logs,
    });
  } catch (err) {
    console.error("Error fetching SMS farmers:", err);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}

/**
 * POST /api/sms/farmers
 * Registers or updates a farmer
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.phone_number) {
      return NextResponse.json({ success: false, error: "Phone number required" }, { status: 400 });
    }

    const updated = registerOrUpdateFarmer(body.phone_number, {
      name: body.name,
      pincode: body.pincode,
      village_name: body.village_name,
      district: body.district,
      state: body.state,
      primary_crop: body.primary_crop,
      language_preference: body.language_preference,
      alerts_enabled: body.alerts_enabled,
    });

    return NextResponse.json({
      success: true,
      farmer: updated,
    });
  } catch (err) {
    console.error("Error updating farmer:", err);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { processIncomingSms } from "@/lib/sms/smsEngine";
import { getSmsAnalytics } from "@/lib/sms/smsDatabase";

/**
 * POST /api/sms/simulate
 * Simulates an incoming SMS message from a rural feature phone
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const phone = body.phone || body.phone_number || "9826011111";
    const message = body.message || body.sms_text || "HELP";

    const result = await processIncomingSms(phone, message, "Simulator");
    const analytics = getSmsAnalytics();

    return NextResponse.json({
      success: true,
      result,
      analytics,
    });
  } catch (err) {
    console.error("Error in SMS simulation:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Simulation error",
      },
      { status: 500 }
    );
  }
}

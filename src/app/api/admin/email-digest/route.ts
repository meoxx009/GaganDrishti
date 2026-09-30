import { NextRequest, NextResponse } from "next/server";
import { generateGovernmentEmailDigest } from "@/lib/admin/governmentEmailService";
import { EMAIL_SCHEDULES } from "@/lib/admin/adminDatabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const scheduleId = searchParams.get("schedule_id") || "SCHED_DAILY_7AM";
    const district = searchParams.get("district") || "Raisen";

    const digest = generateGovernmentEmailDigest(scheduleId, district);

    return NextResponse.json({
      success: true,
      schedules: EMAIL_SCHEDULES,
      digest,
    });
  } catch (error: any) {
    console.error("Email Digest API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { schedule_id, district } = body;

    const digest = generateGovernmentEmailDigest(schedule_id || "SCHED_DAILY_7AM", district || "Raisen");

    return NextResponse.json({
      success: true,
      message: `Email notification dispatched successfully to ${digest.recipients.length} government officers!`,
      digest,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

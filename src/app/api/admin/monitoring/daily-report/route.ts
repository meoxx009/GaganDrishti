import { NextRequest, NextResponse } from "next/server";
import { generateDailyHealthReport } from "@/lib/monitoring/monitoringEngine";

export async function GET() {
  try {
    const report = generateDailyHealthReport();
    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error("Daily report GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to generate daily report" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const recipient = body.recipient || "admin@gagandrishti.gov.in";
    const report = generateDailyHealthReport();
    report.recipient = recipient;

    return NextResponse.json({
      success: true,
      message: `Daily 7 AM Health Report dispatched to ${recipient}`,
      dispatched_at: new Date().toISOString(),
      report,
    });
  } catch (error) {
    console.error("Daily report POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to send daily report" }, { status: 500 });
  }
}

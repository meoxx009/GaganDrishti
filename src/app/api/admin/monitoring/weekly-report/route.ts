import { NextResponse } from "next/server";
import { generateWeeklyAnalyticsReport } from "@/lib/monitoring/monitoringEngine";

export async function GET() {
  try {
    const report = generateWeeklyAnalyticsReport();
    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error("Weekly report GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to generate weekly report" }, { status: 500 });
  }
}

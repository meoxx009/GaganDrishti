import { NextRequest, NextResponse } from "next/server";
import { generateReportCsv } from "@/lib/admin/reportExportService";
import { ReportType } from "@/lib/admin/adminTypes";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reportType = (searchParams.get("type") || "Weekly Summary Report") as ReportType;
    const district = searchParams.get("district") || "Raisen";
    const format = searchParams.get("format") || "csv";

    const csvContent = generateReportCsv(reportType, district);

    if (format === "download") {
      const filename = `${reportType.toLowerCase().replace(/\s+/g, "_")}_${district}_${new Date().toISOString().split("T")[0]}.csv`;
      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      report_type: reportType,
      district,
      csv: csvContent,
    });
  } catch (error: any) {
    console.error("Reports API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate report" },
      { status: 500 }
    );
  }
}

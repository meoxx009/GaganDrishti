import { NextRequest, NextResponse } from "next/server";
import {
  getDatabaseOptimizationSummary,
  rebuildAllIndexes,
  runDatabaseBenchmarks,
  fastLookupPincode,
  fastFilterFeedback,
  fastLookupFarmerByPhone,
} from "@/lib/database/indexOptimizationEngine";

export async function GET() {
  try {
    const summary = getDatabaseOptimizationSummary();
    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (error: any) {
    console.error("Database indexes GET error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load index optimization summary" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || "benchmark";

    if (action === "rebuild") {
      const result = rebuildAllIndexes();
      const updatedSummary = getDatabaseOptimizationSummary();
      return NextResponse.json({
        success: true,
        message: `Successfully rebuilt ${result.indexes_rebuilt} indexes across ${result.tables.length} tables in ${result.duration_ms}ms.`,
        rebuild_result: result,
        summary: updatedSummary,
      });
    }

    if (action === "benchmark") {
      const benchmarks = runDatabaseBenchmarks();
      const updatedSummary = getDatabaseOptimizationSummary();
      return NextResponse.json({
        success: true,
        benchmarks,
        summary: updatedSummary,
      });
    }

    if (action === "query") {
      const queryType = body.query_type || "pincode";
      const start = performance.now();
      let resultData: any = null;

      if (queryType === "pincode") {
        const pin = body.pincode || "462001";
        resultData = fastLookupPincode(pin);
      } else if (queryType === "feedback") {
        resultData = fastFilterFeedback({
          crop_name: body.crop_name || "Soybean",
          crop_stage: body.crop_stage || "Flowering",
        });
      } else if (queryType === "phone") {
        resultData = fastLookupFarmerByPhone(body.phone || "9826011111");
      }

      const durationMs = Math.round((performance.now() - start) * 100) / 100;
      return NextResponse.json({
        success: true,
        query_type: queryType,
        execution_time_ms: durationMs,
        result: resultData,
      });
    }

    return NextResponse.json(
      { success: false, error: `Unknown action: ${action}` },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Database indexes POST error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to execute database index operation" },
      { status: 500 }
    );
  }
}

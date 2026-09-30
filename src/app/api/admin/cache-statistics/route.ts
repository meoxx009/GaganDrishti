import { NextRequest, NextResponse } from "next/server";
import {
  getCacheStatistics,
  cleanupExpiredCache,
  flushWeatherCache,
  prewarmTopPincodes,
  getWeatherWithCache,
} from "@/lib/weather/weatherCacheDatabase";

export async function GET() {
  try {
    const stats = getCacheStatistics();
    return NextResponse.json({
      success: true,
      statistics: stats,
    });
  } catch (error: any) {
    console.error("Cache statistics GET error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load cache statistics" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || "cleanup";

    if (action === "cleanup") {
      const result = cleanupExpiredCache();
      const updatedStats = getCacheStatistics();
      return NextResponse.json({
        success: true,
        message: `Successfully purged ${result.entries_deleted} expired cache entries. ${result.total_remaining} valid entries remaining.`,
        cleanup_result: result,
        statistics: updatedStats,
      });
    }

    if (action === "flush") {
      flushWeatherCache();
      const updatedStats = getCacheStatistics();
      return NextResponse.json({
        success: true,
        message: "Weather cache table flushed completely.",
        statistics: updatedStats,
      });
    }

    if (action === "warm") {
      const count = await prewarmTopPincodes();
      const updatedStats = getCacheStatistics();
      return NextResponse.json({
        success: true,
        message: `Pre-warmed top ${count} high-density district pincodes.`,
        statistics: updatedStats,
      });
    }

    if (action === "refresh_pincode") {
      const pincode = body.pincode || "462001";
      const result = await getWeatherWithCache({ pincode, force_refresh: true });
      const updatedStats = getCacheStatistics();
      return NextResponse.json({
        success: true,
        message: `Successfully forced refresh for pincode ${pincode}.`,
        weather: result,
        statistics: updatedStats,
      });
    }

    return NextResponse.json(
      { success: false, error: `Unknown action: ${action}` },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Cache statistics POST error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to execute cache operation" },
      { status: 500 }
    );
  }
}

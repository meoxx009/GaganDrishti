import { NextRequest, NextResponse } from "next/server";
import {
  getImagePerformanceMetrics,
  getImageOptimizationLogs,
  getPaginatedPhotoGallery,
  runOptimizeFarmerPhotosWorkflow,
  runCleanupOldPhotosWorkflow,
  validateImageUpload,
} from "@/lib/images/imageOptimizationEngine";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
    const district = searchParams.get("district") || undefined;
    const crop = searchParams.get("crop") || undefined;

    const metrics = getImagePerformanceMetrics();
    const logs = getImageOptimizationLogs();
    const gallery = getPaginatedPhotoGallery(page, pageSize, district, crop);

    return NextResponse.json({
      success: true,
      metrics,
      logs,
      gallery,
    });
  } catch (error: any) {
    console.error("Image optimization GET error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load image optimization data" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || "optimize";

    if (action === "optimize") {
      const result = runOptimizeFarmerPhotosWorkflow();
      const metrics = getImagePerformanceMetrics();
      const logs = getImageOptimizationLogs();
      const gallery = getPaginatedPhotoGallery(1, 20);
      return NextResponse.json({
        success: true,
        message: `Successfully compressed ${result.photos_compressed} large photos. Freed ${result.storage_freed_kb} KB.`,
        result,
        metrics,
        logs,
        gallery,
      });
    }

    if (action === "cleanup") {
      const days = body.days || 90;
      const result = runCleanupOldPhotosWorkflow(days);
      const metrics = getImagePerformanceMetrics();
      const logs = getImageOptimizationLogs();
      const gallery = getPaginatedPhotoGallery(1, 20);
      return NextResponse.json({
        success: true,
        message: `Successfully purged ${result.photos_deleted} photos older than ${days} days. Freed ${result.storage_freed_kb} KB. Remaining photos: ${result.remaining_photos}.`,
        result,
        metrics,
        logs,
        gallery,
      });
    }

    if (action === "validate") {
      const file = body.file || { name: "test.jpg", size: 500000, type: "image/jpeg" };
      const valResult = validateImageUpload(file);
      return NextResponse.json({
        success: true,
        validation: valResult,
      });
    }

    return NextResponse.json(
      { success: false, error: `Unknown action: ${action}` },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Image optimization POST error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to execute image optimization action" },
      { status: 500 }
    );
  }
}

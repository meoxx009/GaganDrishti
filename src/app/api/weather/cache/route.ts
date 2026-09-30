import { NextRequest, NextResponse } from "next/server";
import { getWeatherWithCache } from "@/lib/weather/weatherCacheDatabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pincode = searchParams.get("pincode") || "462001";
    const forceRefresh = searchParams.get("force_refresh") === "true";
    const latParam = searchParams.get("lat");
    const lonParam = searchParams.get("lon");
    const cityName = searchParams.get("city_name") || undefined;

    const lat = latParam ? parseFloat(latParam) : undefined;
    const lon = lonParam ? parseFloat(lonParam) : undefined;

    const result = await getWeatherWithCache({
      pincode,
      force_refresh: forceRefresh,
      latitude: lat,
      longitude: lon,
      city_name: cityName,
    });

    return NextResponse.json({
      success: true,
      weather: result,
    });
  } catch (error: any) {
    console.error("Weather cache API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process weather request" },
      { status: 500 }
    );
  }
}

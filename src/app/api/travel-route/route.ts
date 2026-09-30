import { NextRequest, NextResponse } from "next/server";
import { getTravelDecision } from "@/lib/weather/travelDecisionEngine";
import { getAllTravelRoutes, getRouteByCities } from "@/lib/weather/travelRoutesDatabase";
import { VehicleType } from "@/lib/weather/travelRouteTypes";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const listOnly = searchParams.get("list");

    if (listOnly === "true") {
      const routes = getAllTravelRoutes();
      return NextResponse.json({
        success: true,
        count: routes.length,
        routes: routes.map((r) => ({
          route_id: r.route_id,
          route_name: r.route_name,
          origin_city: r.origin_city,
          destination_city: r.destination_city,
          distance_km: r.distance_km,
          avg_travel_time_hours: r.avg_travel_time_hours,
          route_type: r.route_type,
          accident_history_rating: r.accident_history_rating,
          flood_prone: r.flood_prone,
          landslide_prone: r.landslide_prone,
        })),
      });
    }

    const origin = searchParams.get("origin") || searchParams.get("origin_city");
    const destination = searchParams.get("destination") || searchParams.get("destination_city");
    const vehicle = (searchParams.get("vehicle") || "Car") as VehicleType;

    if (!origin || !destination) {
      return NextResponse.json(
        {
          success: false,
          error: "Both origin and destination parameters are required (e.g. ?origin=Bhopal&destination=Sagar)",
        },
        { status: 400 }
      );
    }

    const decision = await getTravelDecision({
      origin_city: origin,
      destination_city: destination,
      vehicle_type: vehicle,
    });

    return NextResponse.json({
      success: true,
      decision,
    });
  } catch (error: any) {
    console.error("Travel route API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process travel route" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { origin_city, destination_city, vehicle_type, travel_date, time_preference, travel_time_preference } = body;

    if (!origin_city || !destination_city) {
      return NextResponse.json(
        { success: false, error: "origin_city and destination_city are required" },
        { status: 400 }
      );
    }

    const decision = await getTravelDecision({
      origin_city,
      destination_city,
      vehicle_type: vehicle_type || "Car",
      travel_date,
      travel_time_preference: travel_time_preference || time_preference,
    });

    return NextResponse.json({
      success: true,
      decision,
    });
  } catch (error: any) {
    console.error("Travel route POST API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process travel route" },
      { status: 500 }
    );
  }
}

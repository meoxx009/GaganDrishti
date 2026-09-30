/**
 * Types for CHANGE_006: Travel Route Intelligence & Weather-Based Safety Engine
 */

export interface TravelRouteRecord {
  route_id: number;
  origin_city: string;
  destination_city: string;
  route_name: string; // e.g. "Bhopal to Sagar (NH-146 / NH-86)"
  distance_km: number;
  avg_travel_time_hours: number;
  route_type: "National Highway" | "State Highway" | "Expressway" | "Mountain" | "Coastal";
  altitude_change_meters: number;
  weather_risk_zones: string;
  flood_prone: boolean;
  landslide_prone: boolean;
  accident_history_rating: 1 | 2 | 3 | 4 | 5; // 1 = safest, 5 = high accident zone
  intermediate_points_count: number;
  season_difficulty: string; // e.g. "Monsoon: risky (flooding). Winter: good. Summer: hot & safe."
  alternative_routes?: {
    route_name: string;
    distance_km: number;
    avg_travel_time_hours: number;
    safety_advantage: string;
    safety_advantage_hi: string;
  }[];
}

export interface RouteIntermediatePoint {
  point_id: number;
  route_id: number;
  sequence: number; // 1, 2, 3...
  city_name: string;
  pincode: string;
  latitude: number;
  longitude: number;
  km_from_origin: number;
  weather_characteristic: string;
  risk_factor: string;
  elevation_m?: number;
}

export type VehicleType = "Bike" | "Car" | "Truck" | "Bus";

export type TravelTimePreference =
  | "Early Morning (5-8 AM)"
  | "Morning (8-12 PM)"
  | "Afternoon (12-4 PM)"
  | "Evening (4-8 PM)"
  | "Night (8 PM-5 AM)"
  | "Flexible";

export interface TravelDecisionInput {
  origin_city: string;
  destination_city: string;
  travel_date?: string; // YYYY-MM-DD
  travel_time_preference?: TravelTimePreference;
  vehicle_type?: VehicleType;
}

export interface TimeSlotRecommendation {
  time_slot: string;
  time_slot_hi: string;
  safety_score: number; // 1-10
  verdict: string;
  verdict_hi: string;
  is_best: boolean;
  is_worst: boolean;
}

export interface VehicleSafetyAdvice {
  vehicle: VehicleType;
  risk_level: "LOW" | "MEDIUM" | "MEDIUM-HIGH" | "HIGH" | "VERY HIGH";
  reason: string;
  reason_hi: string;
  precautions: string[];
  precautions_hi: string[];
}

export interface WorstWeatherZone {
  location: string;
  km_from_origin: number;
  weather_summary: string;
  weather_summary_hi: string;
  critical_time_window: string;
  risk_factor: string;
}

export interface TravelDecisionOutput {
  route_id?: number;
  route_name: string;
  origin: string;
  destination: string;
  distance_km: number;
  estimated_time_hours: number;
  travel_date: string;
  vehicle_type: VehicleType;
  overall_safety_score: number; // 0 to 10 scale
  safety_verdict: string;
  safety_verdict_hi: string;
  worst_weather_zone: WorstWeatherZone;
  best_travel_time: string;
  worst_travel_time: string;
  time_recommendations: TimeSlotRecommendation[];
  vehicle_specific_risks: VehicleSafetyAdvice;
  all_vehicle_guidance: Record<VehicleType, VehicleSafetyAdvice>;
  route_specific_alerts: string[];
  route_specific_alerts_hi: string[];
  emergency_contacts: {
    police: string;
    ambulance: string;
    traffic_highway_patrol: string;
    disaster_ndrf: string;
  };
  alternative_routes: {
    route: string;
    distance_km: number;
    time_hours: number;
    safety_advantage: string;
    safety_advantage_hi: string;
  }[];
  waypoints: (RouteIntermediatePoint & {
    temperature?: number;
    rain_probability?: number;
    precipitation_mm?: number;
    wind_speed?: number;
    safety_rating?: "GOOD" | "CAUTION" | "HAZARD";
  })[];
}

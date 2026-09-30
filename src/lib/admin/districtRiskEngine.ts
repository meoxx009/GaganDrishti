import {
  DistrictQuickStats,
  DistrictRiskZone,
  RiskLevel,
} from "./adminTypes";
import { INDIA_PINCODES } from "../weather/pincodeVillageDatabase";
import { FARMER_FEEDBACK } from "../feedback/farmerFeedbackDatabase";
import { PEST_DISEASE_TRIGGERS_DATABASE } from "../weather/pestTriggersDatabase";
import { GOVERNMENT_ALERTS } from "./adminDatabase";

// District base statistical benchmarks
const DISTRICT_BENCHMARKS: Record<
  string,
  {
    farmers: number;
    growth: number;
    health: number;
    crops: { crop: string; percentage: number; area_hectares: number }[];
  }
> = {
  Raisen: {
    farmers: 2450,
    growth: 150,
    health: 7.2,
    crops: [
      { crop: "Soybean", percentage: 45, area_hectares: 125000 },
      { crop: "Paddy", percentage: 30, area_hectares: 85000 },
      { crop: "Wheat", percentage: 25, area_hectares: 70000 },
    ],
  },
  Sehore: {
    farmers: 2820,
    growth: 180,
    health: 7.4,
    crops: [
      { crop: "Soybean", percentage: 50, area_hectares: 140000 },
      { crop: "Wheat", percentage: 35, area_hectares: 95000 },
      { crop: "Gram/Chickpea", percentage: 15, area_hectares: 42000 },
    ],
  },
  Vidisha: {
    farmers: 2150,
    growth: 120,
    health: 7.0,
    crops: [
      { crop: "Wheat", percentage: 45, area_hectares: 115000 },
      { crop: "Soybean", percentage: 40, area_hectares: 102000 },
      { crop: "Gram", percentage: 15, area_hectares: 38000 },
    ],
  },
  Bhopal: {
    farmers: 1650,
    growth: 95,
    health: 7.6,
    crops: [
      { crop: "Soybean", percentage: 40, area_hectares: 45000 },
      { crop: "Wheat", percentage: 35, area_hectares: 40000 },
      { crop: "Vegetables/Horticulture", percentage: 25, area_hectares: 28000 },
    ],
  },
  Sagar: {
    farmers: 2980,
    growth: 165,
    health: 6.9,
    crops: [
      { crop: "Soybean", percentage: 42, area_hectares: 130000 },
      { crop: "Wheat", percentage: 38, area_hectares: 118000 },
      { crop: "Gram", percentage: 20, area_hectares: 62000 },
    ],
  },
};

/**
 * Get district quick stats
 */
export function getDistrictQuickStats(districtName: string): DistrictQuickStats {
  const normDistrict = districtName.trim();
  const benchmark = DISTRICT_BENCHMARKS[normDistrict] || {
    farmers: 2200,
    growth: 110,
    health: 7.1,
    crops: [
      { crop: "Soybean", percentage: 45, area_hectares: 90000 },
      { crop: "Wheat", percentage: 35, area_hectares: 70000 },
      { crop: "Paddy", percentage: 20, area_hectares: 40000 },
    ],
  };

  // Count active government alerts for this district
  const districtAlerts = GOVERNMENT_ALERTS.filter(
    (a) =>
      a.affected_districts.includes(normDistrict) ||
      a.affected_districts.includes("All") ||
      a.affected_districts.includes("Statewide")
  );

  const highAlerts = districtAlerts.filter((a) => a.severity === "High" || a.severity === "Extreme").length;
  const medAlerts = districtAlerts.filter((a) => a.severity === "Significant").length;
  const lowAlerts = districtAlerts.filter((a) => a.severity === "Caution").length;

  // Pincodes & Villages from database
  const districtPincodes = INDIA_PINCODES.filter(
    (p) => p.district.toLowerCase() === normDistrict.toLowerCase()
  );

  return {
    district: normDistrict,
    state: "Madhya Pradesh",
    active_farmers: benchmark.farmers,
    farmers_growth_monthly: benchmark.growth,
    active_alerts_count: districtAlerts.length,
    alert_severity_breakdown: {
      high: highAlerts,
      medium: medAlerts,
      low: lowAlerts,
    },
    crop_coverage: benchmark.crops,
    avg_farm_health: benchmark.health,
    feedback_entries_count: FARMER_FEEDBACK.length,
    pincodes_covered: Math.max(districtPincodes.length, 6),
    villages_covered: Math.max(districtPincodes.length * 8, 48),
  };
}

/**
 * Get color-coded district risk zones (Interactive Risk Map)
 */
export function getDistrictRiskZones(districtName: string): DistrictRiskZone[] {
  const normDistrict = districtName.trim();

  // Find matching pincodes in INDIA_PINCODES
  let matched = INDIA_PINCODES.filter(
    (p) => p.district.toLowerCase() === normDistrict.toLowerCase()
  );

  // If few or none found, provide representative administrative clusters for the district
  if (matched.length === 0) {
    matched = INDIA_PINCODES.slice(0, 8);
  }

  // Generate risk zones with simulated meteorological and topographic telemetry
  return matched.map((loc, idx) => {
    let riskLevel: RiskLevel = "LOW";
    let riskReason = "Normal seasonal conditions. Soil moisture adequate.";
    let riskReasonHi = "सामान्य मौसमी स्थिति। मिट्टी में पर्याप्त नमी उपलब्ध।";
    let action = "Continue regular crop management and scouting.";

    // Deterministic simulation based on index & location properties
    if (idx === 0 || loc.village_name.includes("Ghat") || loc.elevation_m > 480) {
      riskLevel = "HIGH";
      riskReason = "Excess soil moisture & high waterlogging risk in heavy vertisol black soil.";
      riskReasonHi = "काली गहरी मिट्टी में अत्यधिक जलभराव एवं जल निकासी अवरुद्ध होने का खतरा।";
      action = "Deploy tractor ditchers to open drainage trenches; hold fertilizer broadcast.";
    } else if (idx === 1 || loc.village_name.includes("River") || loc.soil_type.includes("Sandy")) {
      riskLevel = "SIGNIFICANT";
      riskReason = "Whitefly surge and fungal foliar blight threat due to sustained humidity > 85%.";
      riskReasonHi = "निरंतर 85% से अधिक आर्द्रता के कारण सफेद मक्खी व कवक रोग का बढ़ा खतरा।";
      action = "Inspect underside of leaves; prepare neem-based preventive spray.";
    } else if (idx === 2 || idx === 4) {
      riskLevel = "CAUTION";
      riskReason = "Moderate afternoon convective showers (10-15mm) with squall winds.";
      riskReasonHi = "दोपहर बाद तेज हवाओं के साथ 10-15 मिमी वर्षा की संभावना।";
      action = "Delay chemical spraying until morning calm window.";
    }

    return {
      pincode: loc.pincode,
      village_or_tehsil: loc.village_name,
      district: normDistrict,
      latitude: loc.latitude,
      longitude: loc.longitude,
      elevation_m: loc.elevation_m,
      soil_type: loc.soil_type,
      risk_level: riskLevel,
      risk_reason: riskReason,
      risk_reason_hi: riskReasonHi,
      farmer_count: 180 + (idx * 65) % 250,
      current_temp: 29 + (idx % 4) * 0.8,
      rain_probability: riskLevel === "HIGH" ? 75 : riskLevel === "SIGNIFICANT" ? 55 : riskLevel === "CAUTION" ? 35 : 10,
      wind_speed: 12 + (idx % 5) * 3,
      vulnerable_crop: idx % 2 === 0 ? "Soybean (Flowering)" : "Paddy (Tillering)",
      recommended_action: action,
    };
  });
}

/**
 * Get crop stage distribution for district
 */
export function getDistrictCropStageDistribution(districtName: string) {
  return [
    { stage: "Sowing / Germination", stage_hi: "बुवाई व अंकुरण", farmer_count: 240, percentage: 10, risk_rating: "LOW" },
    { stage: "Vegetative / Tillering", stage_hi: "वानस्पतिक बढ़वार", farmer_count: 850, percentage: 35, risk_rating: "MEDIUM" },
    { stage: "Flowering (Critical)", stage_hi: "फूल आना (अत्यंत संवेदनशील)", farmer_count: 980, percentage: 40, risk_rating: "HIGH" },
    { stage: "Pod / Grain Fill", stage_hi: "दाना / फली भराव", farmer_count: 280, percentage: 11, risk_rating: "MEDIUM" },
    { stage: "Maturity / Harvest", stage_hi: "परिपक्वता व कटाई", farmer_count: 100, percentage: 4, risk_rating: "LOW" },
  ];
}

/**
 * Get pest and disease alerts for district
 */
export function getDistrictPestAlerts(districtName: string) {
  return PEST_DISEASE_TRIGGERS_DATABASE.slice(0, 6).map((trigger, idx) => ({
    trigger_id: trigger.trigger_id,
    pest_name: trigger.pest_disease_name,
    crop: trigger.crop_name,
    type: trigger.type,
    reported_cases_last_7_days: 18 + (idx * 7) % 35,
    risk_level: idx === 0 ? "CRITICAL" : idx <= 2 ? "HIGH" : "MEDIUM",
    urgency: trigger.risk_severity || "High",
    remedy_hindi: trigger.control_measure_hi || trigger.control_measure,
  }));
}

/**
 * Get district analytics trends (last 90 days)
 */
export function getDistrictAnalyticsTrends(districtName: string) {
  const normDistrict = districtName.trim();
  const benchmark = DISTRICT_BENCHMARKS[normDistrict] || DISTRICT_BENCHMARKS.Raisen;

  // Monthly farmer growth
  const farmerGrowth = [
    { date: "Month -3", farmers: benchmark.farmers - 420 },
    { date: "Month -2", farmers: benchmark.farmers - 270 },
    { date: "Month -1", farmers: benchmark.farmers - 150 },
    { date: "Current", farmers: benchmark.farmers },
  ];

  // Alert effectiveness
  const alertEffectiveness = [
    { alert_type: "Heavy Rain", issued: 12, acted_upon: 11, effectiveness_rate: "92%" },
    { alert_type: "Pest Outbreak", issued: 8, acted_upon: 7, effectiveness_rate: "88%" },
    { alert_type: "High Wind", issued: 6, acted_upon: 5, effectiveness_rate: "83%" },
    { alert_type: "Heat Stress", issued: 4, acted_upon: 4, effectiveness_rate: "100%" },
  ];

  // Monthly weather heat patterns
  const weatherPatterns = [
    { month: "June", avg_rain_mm: 120, max_temp: 38, risk_days: 4 },
    { month: "July", avg_rain_mm: 290, max_temp: 32, risk_days: 11 },
    { month: "August", avg_rain_mm: 310, max_temp: 30, risk_days: 14 },
    { month: "September", avg_rain_mm: 180, max_temp: 31, risk_days: 7 },
  ];

  return {
    farmer_growth: farmerGrowth,
    alert_effectiveness: alertEffectiveness,
    weather_patterns: weatherPatterns,
  };
}

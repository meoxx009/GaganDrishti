import { PincodeVillageRecord, MicroClimateAdjustment, ClimateZoneRecord, NearbyVillageForecast } from "./villageLocationTypes";
import { NormalizedWeatherData } from "./types";

/**
 * Micro-Climate Adjustment Engine (Task 5 of CHANGE_003)
 * Applies elevation lapse rate physics, soil moisture-holding mechanics,
 * and terrain slope adjustments to raw meteorological telemetry.
 */
export function computeMicroClimateAdjustments(
  village: PincodeVillageRecord,
  baseWeather: NormalizedWeatherData,
  zone: ClimateZoneRecord,
  referenceElevationM: number = 500 // Typical Central India meteorological base station elevation
): MicroClimateAdjustment {
  const currentTemp = baseWeather.current?.temperature ?? 28;
  const currentRainProb = baseWeather.daily?.[0]?.precipitationProbabilityMax ?? 15;
  const elevationDiff = village.elevation_m - referenceElevationM;

  // 1. Environmental Lapse Rate: -0.65°C per 100m elevation gain
  const tempAdjustment = Math.round((-0.65 * (elevationDiff / 100)) * 10) / 10;
  const adjustedTemp = Math.round((currentTemp + tempAdjustment) * 10) / 10;

  // 2. Soil Type Moisture Retention & Irrigation Adjustments
  const soilLower = village.soil_type.toLowerCase();
  let soilRetention: MicroClimateAdjustment["soil_moisture_retention"] = "Moderate";
  let irrigationAdjustmentDays = 0;
  let waterloggingRisk: MicroClimateAdjustment["waterlogging_risk"] = "Moderate";

  if (soilLower.includes("black") || soilLower.includes("vertisol") || soilLower.includes("clay")) {
    soilRetention = "Very High";
    irrigationAdjustmentDays = 4; // Black soil holds water 4 days longer
    waterloggingRisk = "High";
  } else if (soilLower.includes("alluvial") || soilLower.includes("silt") || soilLower.includes("loam")) {
    soilRetention = "High";
    irrigationAdjustmentDays = 1;
    waterloggingRisk = "Moderate";
  } else if (soilLower.includes("sandy") || soilLower.includes("desert") || soilLower.includes("gravel")) {
    soilRetention = "Low / Rapid Drainage";
    irrigationAdjustmentDays = -3; // Dries 3 days faster
    waterloggingRisk = "Low";
  } else if (soilLower.includes("red") || soilLower.includes("laterite")) {
    soilRetention = "Moderate";
    irrigationAdjustmentDays = -1;
    waterloggingRisk = "Low";
  }

  // 3. Orographic & Slope Rain Intensity Factor
  let orographicFactor = 1.0;
  if (village.elevation_m > 600 || zone.characteristic_weather.toLowerCase().includes("orographic")) {
    orographicFactor = 1.25; // Rain-facing slopes get +25% precipitation accumulation
  }

  const adjustedRainProb = Math.min(
    100,
    Math.round(currentRainProb * (orographicFactor > 1 ? 1.15 : 1.0))
  );

  // 4. Formulate Scientific Explanatory Notes
  const notesEn: string[] = [];
  const notesHi: string[] = [];

  if (Math.abs(tempAdjustment) >= 0.3) {
    if (tempAdjustment < 0) {
      notesEn.push(
        `Elevation cooler by ${Math.abs(tempAdjustment)}°C: Village elevation (${village.elevation_m}m) is ${elevationDiff}m higher than the base station.`
      );
      notesHi.push(
        `ऊंचाई के कारण ${Math.abs(tempAdjustment)}°C कम तापमान: गांव की ऊंचाई (${village.elevation_m} मी) बेस स्टेशन से ${elevationDiff} मी अधिक है।`
      );
    } else {
      notesEn.push(
        `Valley thermal retention (+${tempAdjustment}°C): Village elevation (${village.elevation_m}m) sits in a lower depression than the base station.`
      );
      notesHi.push(
        `निचली घाटी में ताप संचय (+${tempAdjustment}°C): गांव की ऊंचाई (${village.elevation_m} मी) बेस स्टेशन से कम है।`
      );
    }
  }

  if (irrigationAdjustmentDays > 0) {
    notesEn.push(
      `Soil Water-Retention Bonus: ${village.soil_type} stores deep capillary moisture. Extend irrigation cycles by +${irrigationAdjustmentDays} days to save water.`
    );
    notesHi.push(
      `मिट्टी जल-संचय लाभ: ${village.soil_type_hi} में नमी लंबे समय तक टिकती है। सिंचाई का अंतराल ${irrigationAdjustmentDays} दिन बढ़ाएं।`
    );
  } else if (irrigationAdjustmentDays < 0) {
    notesEn.push(
      `Porous Drainage: ${village.soil_type} loses moisture quickly. Irrigate ${Math.abs(irrigationAdjustmentDays)} days earlier to prevent wilting.`
    );
    notesHi.push(
      `तीव्र जल रिसाव: ${village.soil_type_hi} में नमी शीघ्र समाप्त होती है। पौधों को सूखने से बचाने हेतु सिंचाई ${Math.abs(irrigationAdjustmentDays)} दिन पूर्व करें।`
    );
  }

  if (waterloggingRisk === "High") {
    notesEn.push("High Waterlogging Alert: Inspect drainage channels during rainfall >30mm to protect root aeration.");
    notesHi.push("जलभराव चेतावनी: भारी बारिश (>30 मिमी) पर खेत से जल निकासी सुनिश्चित करें ताकि जड़ें न सड़ें।");
  }

  return {
    reference_city_name: (baseWeather as any).cityName || (baseWeather as any).cityNameEn || "Regional District Base",
    elevation_diff_m: elevationDiff,
    temperature_adjustment_c: tempAdjustment,
    adjusted_temperature: adjustedTemp,
    soil_type: village.soil_type,
    soil_type_hi: village.soil_type_hi,
    soil_moisture_retention: soilRetention,
    irrigation_interval_adjustment_days: irrigationAdjustmentDays,
    waterlogging_risk: waterloggingRisk,
    orographic_rain_factor: orographicFactor,
    adjusted_rain_probability: adjustedRainProb,
    micro_forecast_notes: notesEn,
    micro_forecast_notes_hi: notesHi,
  };
}

/**
 * Evaluates Farm Suitability Score & Verdicts for a village
 */
export function evaluateVillageFarmSuitability(
  adjustedTemp: number,
  humidity: number,
  windSpeed: number,
  rainProbability: number,
  soilType: string
) {
  let sprayVerdict: "SPRAY PERMITTED" | "CAUTION SPRAY" | "DON'T SPRAY" = "SPRAY PERMITTED";
  let sprayVerdictHi = "✅ छिड़काव की अनुकूल खिड़की (SPRAY PERMITTED)";
  let irrigationVerdict: "IRRIGATE NOW" | "DELAY IRRIGATION" | "STANDARD CYCLE" = "STANDARD CYCLE";
  let irrigationVerdictHi = "💧 सामान्य सिंचाई चक्र (Standard Cycle)";

  // Spray logic
  if (windSpeed >= 18 || rainProbability >= 50 || adjustedTemp > 38 || adjustedTemp < 10) {
    sprayVerdict = "DON'T SPRAY";
    sprayVerdictHi = "🛑 आज छिड़काव न करें (DON'T SPRAY)";
  } else if (windSpeed >= 12 || rainProbability >= 30) {
    sprayVerdict = "CAUTION SPRAY";
    sprayVerdictHi = "⚠️ सतर्कतापूर्वक सीमित खिड़की (CAUTION SPRAY)";
  }

  // Irrigation logic
  if (rainProbability >= 60) {
    irrigationVerdict = "DELAY IRRIGATION";
    irrigationVerdictHi = "🛑 सिंचाई टालें (वर्षा संकेत)";
  } else if (rainProbability < 20 && adjustedTemp > 30) {
    irrigationVerdict = "IRRIGATE NOW";
    irrigationVerdictHi = "✅ आवश्यकतानुसार सिंचाई करें (IRRIGATE NOW)";
  }

  // Score from 0 to 100
  let score = 90;
  if (sprayVerdict === "DON'T SPRAY") score -= 35;
  else if (sprayVerdict === "CAUTION SPRAY") score -= 15;

  if (irrigationVerdict === "DELAY IRRIGATION") score -= 15;
  if (windSpeed > 25) score -= 20;

  score = Math.max(20, Math.min(100, score));

  const suitabilityLevel: "EXCELLENT" | "MODERATE" | "POOR" =
    score >= 75 ? "EXCELLENT" : score >= 50 ? "MODERATE" : "POOR";

  const adviceEn =
    sprayVerdict === "SPRAY PERMITTED"
      ? "Calm winds and dry foliage make today optimal for scheduled field spraying and weed management."
      : sprayVerdict === "CAUTION SPRAY"
      ? "Moderate wind speed requires low nozzle pressure. Apply sprays during early morning calm."
      : "High wind drift or rainfall probability makes chemical spraying hazardous today. Delay application.";

  const adviceHi =
    sprayVerdict === "SPRAY PERMITTED"
      ? "शांत हवा और सूखी पत्तियां आज कीटनाशक छिड़काव व खरपतवार नियंत्रण हेतु सर्वश्रेष्ठ हैं।"
      : sprayVerdict === "CAUTION SPRAY"
      ? "हवा की मध्यम गति को देखते हुए कम दबाव वाले नोजल का प्रयोग करें और सुबह के समय ही छिड़काव करें।"
      : "तेज हवा या वर्षा की आशंका के कारण आज दवा का छिड़काव न करें; 24-48 घंटे टालें।";

  return {
    spray_verdict: sprayVerdict,
    spray_verdict_hi: sprayVerdictHi,
    irrigation_verdict: irrigationVerdict,
    irrigation_verdict_hi: irrigationVerdictHi,
    overall_suitability_score: score,
    suitability_level: suitabilityLevel,
    key_advice_en: adviceEn,
    key_advice_hi: adviceHi,
  };
}

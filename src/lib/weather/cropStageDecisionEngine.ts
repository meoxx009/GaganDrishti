import {
  CropDecisionInput,
  CropDecisionOutput,
  CropStageRecord,
} from "./cropStageTypes";
import { queryCropStage } from "./cropStageDatabase";

/**
 * Helper to extract phenological stage number or stage name from user text/query
 */
export function extractCropStageFromText(text: string): { stageNumber?: number; stageName?: string } {
  const q = text.toLowerCase();

  // Explicit stage number checks
  if (/\bstage\s*1\b|\bstg\s*1\b|\b1st\s*stage\b|\bpehla\s*stage\b/.test(q)) return { stageNumber: 1 };
  if (/\bstage\s*2\b|\bstg\s*2\b|\b2nd\s*stage\b|\bdoosra\s*stage\b/.test(q)) return { stageNumber: 2 };
  if (/\bstage\s*3\b|\bstg\s*3\b|\b3rd\s*stage\b|\bteesra\s*stage\b/.test(q)) return { stageNumber: 3 };
  if (/\bstage\s*4\b|\bstg\s*4\b|\b4th\s*stage\b|\bchautha\s*stage\b/.test(q)) return { stageNumber: 4 };
  if (/\bstage\s*5\b|\bstg\s*5\b|\b5th\s*stage\b|\bpanchva\s*stage\b/.test(q)) return { stageNumber: 5 };

  // Stage 1: Sowing / Seed Treatment / Germination
  if (
    q.includes("sowing") ||
    q.includes("seed") ||
    q.includes("beej") ||
    q.includes("upchar") ||
    q.includes("ankuran") ||
    q.includes("germination") ||
    q.includes("buwai") ||
    q.includes("bovai") ||
    q.includes("बुवाई") ||
    q.includes("बीज") ||
    q.includes("अंकुरण")
  ) {
    return { stageNumber: 1, stageName: "Sowing / Seed Treatment" };
  }

  // Stage 3: Flowering / Tillering (Check before vegetative as flower/tillering is specific)
  if (
    q.includes("flowering") ||
    q.includes("flower") ||
    q.includes("phool") ||
    q.includes("pushpan") ||
    q.includes("kalle") ||
    q.includes("tillering") ||
    q.includes("फूल") ||
    q.includes("पुष्पन") ||
    q.includes("कल्ले")
  ) {
    return { stageNumber: 3, stageName: "Flowering / Tillering" };
  }

  // Stage 4: Pod-Fill / Grain-Filling
  if (
    q.includes("pod") ||
    q.includes("pod fill") ||
    q.includes("fali") ||
    q.includes("dana") ||
    q.includes("grain fill") ||
    q.includes("grain") ||
    q.includes("फली") ||
    q.includes("दाना")
  ) {
    return { stageNumber: 4, stageName: "Pod-Fill / Grain-Filling" };
  }

  // Stage 5: Maturity / Harvest
  if (
    q.includes("maturity") ||
    q.includes("harvest") ||
    q.includes("katai") ||
    q.includes("paripakvata") ||
    q.includes("pakna") ||
    q.includes("कटाई") ||
    q.includes("परिपक्वता")
  ) {
    return { stageNumber: 5, stageName: "Maturity / Harvesting" };
  }

  // Stage 2: Vegetative / Growth
  if (
    q.includes("vegetative") ||
    q.includes("badhwar") ||
    q.includes("badhav") ||
    q.includes("growth") ||
    q.includes("vanaspatik") ||
    q.includes("वानस्पतिक") ||
    q.includes("बढ़वार")
  ) {
    return { stageNumber: 2, stageName: "Vegetative" };
  }

  return {};
}

/**
 * 100% Deterministic Decision Engine Function (GET_FARM_DECISION)
 * Pure logic-based evaluation matching crop, phenological stage, and weather thresholds.
 */
export function getFarmDecision(input: CropDecisionInput): CropDecisionOutput {
  // 1. Resolve crop stage record
  let stageRecord: CropStageRecord;
  if (input.days_since_sowing !== undefined && input.days_since_sowing >= 0) {
    // Stage lookup by days from sowing
    stageRecord = queryCropStage(input.crop_name);
    // Find stage that encapsulates days_since_sowing if possible
    // Else use provided crop_stage
    stageRecord = queryCropStage(input.crop_name, input.crop_stage);
  } else {
    stageRecord = queryCropStage(input.crop_name, input.crop_stage);
  }

  const {
    current_temperature: temp,
    current_humidity: humidity,
    rain_probability: rainProb,
    rain_sum_24h: rainSum = 0,
    current_wind_speed: windSpeed,
    current_wind_gusts: windGusts = windSpeed * 1.3,
  } = input;

  const reasonsEn: string[] = [];
  const reasonsHi: string[] = [];
  const actionsEn: string[] = [];
  const actionsHi: string[] = [];
  const precautionsEn: string[] = [];
  const precautionsHi: string[] = [];

  let isHighSeverityRisk = false;
  let canSpray = stageRecord.spray_suitable;

  // -------------------------------------------------------------------------
  // Step 2: Compare Temperature
  // -------------------------------------------------------------------------
  if (temp < stageRecord.critical_temp_low) {
    isHighSeverityRisk = true;
    canSpray = false;
    reasonsEn.push(
      `Cold stress/frost damage risk: Temperature is ${temp}°C (critical threshold is ${stageRecord.critical_temp_low}°C).`
    );
    reasonsHi.push(
      `शीत लहर / पाला जोखिम: तापमान ${temp}°C है (न्यूनतम सीमा ${stageRecord.critical_temp_low}°C है)।`
    );
    actionsEn.push(
      "Provide light evening irrigation or field boundary smoke to protect crop from frost injury."
    );
    actionsHi.push("पाले से सुरक्षा हेतु शाम को हल्की सिंचाई करें अथवा मेड़ों पर धुआं करें।");
  } else if (temp > stageRecord.critical_temp_high) {
    isHighSeverityRisk = true;
    reasonsEn.push(
      `Heat stress risk: Temperature is ${temp}°C (heat threshold is ${stageRecord.critical_temp_high}°C).`
    );
    reasonsHi.push(
      `अत्यधिक ताप तनाव: तापमान ${temp}°C है (अधिकतम सुरक्षित सीमा ${stageRecord.critical_temp_high}°C है)।`
    );
    actionsEn.push("Maintain soil moisture to prevent thermal scorching and premature flower/grain drying.");
    actionsHi.push("पौधों को झुलसने से बचाने के लिए खेत में हल्की नमी बनाए रखें।");
  } else if (temp >= stageRecord.ideal_temp_min && temp <= stageRecord.ideal_temp_max) {
    reasonsEn.push(
      `Temperature ${temp}°C is within the ideal physiological range (${stageRecord.ideal_temp_min}°C – ${stageRecord.ideal_temp_max}°C).`
    );
    reasonsHi.push(
      `तापमान ${temp}°C फसल वृद्धि के पूर्णतः अनुकूल है (${stageRecord.ideal_temp_min}°C – ${stageRecord.ideal_temp_max}°C)।`
    );
  }

  // -------------------------------------------------------------------------
  // Step 3: Compare Humidity & Disease Threshold
  // -------------------------------------------------------------------------
  let pestRiskLevel: "HIGH" | "MEDIUM" | "LOW" = "LOW";
  let pestTriggerEn = "Atmospheric moisture is within safe physiological bounds.";
  let pestTriggerHi = "वायुमंडलीय नमी सामान्य सीमा में है।";

  if (humidity >= stageRecord.critical_humidity_disease) {
    pestRiskLevel = "HIGH";
    reasonsEn.push(
      `High fungal pathogen risk: Atmospheric humidity is ${humidity}% (disease threshold is ${stageRecord.critical_humidity_disease}%).`
    );
    reasonsHi.push(
      `उच्च फफूंद रोग जोखिम: सापेक्षिक आर्द्रता ${humidity}% है (रोग सक्रियता सीमा ${stageRecord.critical_humidity_disease}% है)।`
    );
    pestTriggerEn = `High humidity (${humidity}%) + ${temp}°C temperature triggers favorable incubation for ${stageRecord.primary_disease}.`;
    pestTriggerHi = `अत्यधिक नमी (${humidity}%) व ${temp}°C तापमान के कारण ${stageRecord.primary_disease} का तीव्र फैलाव संभव है।`;
    actionsEn.push(
      `Proactively monitor crop for ${stageRecord.primary_disease}. If fungicide is needed, apply BEFORE rain onset.`
    );
    actionsHi.push(
      `${stageRecord.primary_disease} के लक्षणों की निगरानी करें। आवश्यक हो तो वर्षा प्रारंभ होने से पूर्व कवकनाशी छिड़कें।`
    );
  } else if (humidity >= stageRecord.ideal_humidity_min && humidity <= stageRecord.ideal_humidity_max) {
    pestTriggerEn = `Normal relative humidity (${humidity}%) promotes steady vegetative transpiration.`;
    pestTriggerHi = `संतुलित नमी (${humidity}%) से सामान्य वानस्पतिक वृद्धि।`;
  }

  // -------------------------------------------------------------------------
  // Step 4: Compare Rain Probability & Rain Accumulation (Wash-off Risk)
  // -------------------------------------------------------------------------
  if (rainProb >= stageRecord.critical_rain_probability || rainSum >= stageRecord.critical_rain_mm) {
    isHighSeverityRisk = true;
    canSpray = false;
    reasonsEn.push(
      `Rain unsuitable for spray: Rain probability is ${rainProb}% (critical limit: ${stageRecord.critical_rain_probability}%) with ${rainSum} mm precipitation forecast.`
    );
    reasonsHi.push(
      `वर्षा के कारण छिड़काव अनुपयुक्त: वर्षा की संभावना ${rainProb}% है (अधिकतम सीमा ${stageRecord.critical_rain_probability}%) और ${rainSum} मिमी वर्षा संभावित है।`
    );
    actionsEn.push(
      "Delay all chemical and foliar spraying by 48–72 hours until rainfall subsides and foliage dries."
    );
    actionsHi.push(
      "दवा का छिड़काव 48-72 घंटे टालें। बारिश थमने और पत्तियां पूरी तरह सूखने की प्रतीक्षा करें।"
    );
    precautionsEn.push("Do not apply foliar sprays in approaching rain — wash-off waste and soil runoff will occur.");
    precautionsHi.push("आसन्न वर्षा में छिड़काव न करें; दवा धुलने से आर्थिक व पर्यावरण नुकसान होगा।");
  } else if (rainProb >= 30) {
    reasonsEn.push(
      `Moderate rain probability (${rainProb}%): Small showers possible; spray early morning only if urgent.`
    );
    reasonsHi.push(
      `मध्यम वर्षा संभावना (${rainProb}%): हल्की बौछारें संभव; केवल अति-आवश्यक होने पर सुबह शांत मौसम में छिड़काव करें।`
    );
  } else {
    reasonsEn.push(`Rain probability is low (${rainProb}%), presenting dry foliage conditions.`);
    reasonsHi.push(`वर्षा की संभावना न्यूनतम (${rainProb}%) है, पत्तियां सूखी रहेंगी।`);
  }

  // -------------------------------------------------------------------------
  // Step 5: Compare Wind Speed & Chemical Drift
  // -------------------------------------------------------------------------
  if (windSpeed >= stageRecord.critical_wind_speed || windGusts >= 35) {
    canSpray = false;
    reasonsEn.push(
      `High wind speed (${windSpeed} km/h, gusts ${Math.round(windGusts)} km/h): Exceeds safe limit (${stageRecord.critical_wind_speed} km/h). Severe spray drift hazard.`
    );
    reasonsHi.push(
      `तेज हवा गति (${windSpeed} किमी/घंटा, झोंके ${Math.round(windGusts)} किमी/घंटा): सुरक्षित सीमा (${stageRecord.critical_wind_speed} किमी/घंटा) से अधिक; दवा बहने (drift) का भारी जोखिम।`
    );
    precautionsEn.push(
      "Never spray when wind exceeds 15 km/h; chemical drift damages neighboring crops and harms operator."
    );
    precautionsHi.push(
      "15 किमी/घंटे से तेज हवा में छिड़काव न करें; दवा उड़कर पड़ोसी फसलों व किसान को नुकसान पहुंचाती है।"
    );
  } else if (windSpeed <= 10) {
    reasonsEn.push(`Wind speed is calm and optimal for field application (${windSpeed} km/h).`);
    reasonsHi.push(`हवा की गति शांत एवं छिड़काव हेतु पूर्णतः उपयुक्त है (${windSpeed} किमी/घंटा)।`);
  } else {
    reasonsEn.push(`Wind speed is moderate (${windSpeed} km/h). Spray during morning calm.`);
    reasonsHi.push(`हवा मध्यम है (${windSpeed} किमी/घंटा)। सुबह शांत हवा में ही कार्य करें।`);
  }

  // -------------------------------------------------------------------------
  // Step 6: Stage Physiological Sensitivity Check
  // -------------------------------------------------------------------------
  if (!stageRecord.spray_suitable) {
    canSpray = false;
    isHighSeverityRisk = true;
    reasonsEn.push(
      `${stageRecord.crop_name} ${stageRecord.stage_name} stage restriction: ${stageRecord.spray_restrictions}`
    );
    reasonsHi.push(
      `${stageRecord.crop_name} ${stageRecord.stage_name_hi} अवस्था प्रतिबंध: ${stageRecord.spray_restrictions_hi || stageRecord.spray_restrictions}`
    );
    precautionsEn.push(
      `Foliar pesticide application during ${stageRecord.stage_name} disrupts delicate reproductive pollination.`
    );
    precautionsHi.push(
      `${stageRecord.stage_name_hi} अवस्था में रासायनिक छिड़काव से परागकण झड़ने व उपज घटने का गंभीर जोखिम।`
    );
  }

  // -------------------------------------------------------------------------
  // Step 7: Final Decision Synthesis & Best Window Estimation
  // -------------------------------------------------------------------------
  let decision: CropDecisionOutput["decision"] = "DON'T SPRAY";
  let decisionHi = "🛑 आज छिड़काव न करें (DON'T SPRAY)";
  let confidence: "HIGH" | "MEDIUM" = "HIGH";
  let bestWindowEn = "72–96 hours from now (after rain and adverse atmospheric window clears)";
  let bestWindowHi = "आगामी 72-96 घंटे बाद (वर्षा व प्रतिकूल मौसम समाप्त होने के उपरांत)";

  if (!canSpray || isHighSeverityRisk) {
    decision = "DON'T SPRAY";
    decisionHi = "🛑 आज छिड़काव न करें (DON'T SPRAY)";
    confidence = "HIGH";
  } else if (rainProb < 25 && windSpeed <= 12 && temp <= stageRecord.ideal_temp_max) {
    decision = "SPRAY PERMITTED";
    decisionHi = "✅ छिड़काव की अनुकूल खिड़की (SPRAY PERMITTED)";
    confidence = "HIGH";
    bestWindowEn = "Next 4 to 8 hours (morning 7:00 AM – 11:00 AM or evening 4:00 PM – 6:30 PM)";
    bestWindowHi = "आगामी 4 से 8 घंटे (प्रातः 7:00 से 11:00 बजे अथवा सायं 4:00 से 6:30 बजे शांत हवा में)";
    actionsEn.push(
      "Proceed with planned foliar spray in early morning or late afternoon when wind is calm."
    );
    actionsHi.push("सुबह अथवा शाम को शांत मौसम में अनुशंसित छिड़काव पूरा करें।");
  } else {
    decision = "CAUTION SPRAY";
    decisionHi = "⚠️ सतर्कतापूर्वक सीमित खिड़की (CAUTION SPRAY)";
    confidence = "MEDIUM";
    bestWindowEn = "Early morning tomorrow if wind remains below 10 km/h";
    bestWindowHi = "कल प्रातःकाल यदि हवा 10 किमी/घंटे से नीचे रहे";
    actionsEn.push("Use lower spray nozzle pressure and monitor cloud movement closely.");
    actionsHi.push("नोजल का दबाव संतुलित रखें और बादलों की गतिविधि पर नजर रखें।");
  }

  // Standard agricultural safety precautions
  precautionsEn.push("Always wear personal protective equipment (mask, gloves, boots) during application.");
  precautionsEn.push("Do not use unverified chemical brands; consult local KVK agronomy specialists.");
  precautionsHi.push("छिड़काव के समय मास्क, दस्ताने व सुरक्षात्मक परिधान का अनिवार्य उपयोग करें।");
  precautionsHi.push("स्थानीय कृषि विज्ञान केंद्र (KVK) के परामर्श अनुसार ही अनुशंसित घोल बनाएं।");

  return {
    crop: stageRecord.crop_name,
    crop_hi: stageRecord.crop_name === "Soybean" ? "सोयाबीन" : stageRecord.crop_name === "Paddy" ? "धान" : stageRecord.crop_name === "Wheat" ? "गेहूँ" : stageRecord.crop_name === "Chickpea" ? "चना" : "मक्का",
    stage: stageRecord.stage_name,
    stage_hi: stageRecord.stage_name_hi,
    stage_number: stageRecord.stage_number,
    decision,
    decision_hi: decisionHi,
    decision_confidence: confidence,
    current_weather: {
      temperature: temp,
      humidity,
      rain_probability: rainProb,
      wind_speed: windSpeed,
    },
    reasons: reasonsEn,
    reasons_hi: reasonsHi,
    recommended_action: actionsEn.length > 0 ? actionsEn : [stageRecord.recommended_action],
    recommended_action_hi: actionsHi.length > 0 ? actionsHi : [stageRecord.recommended_action_hi || stageRecord.recommended_action],
    best_window: bestWindowEn,
    best_window_hi: bestWindowHi,
    precautions: precautionsEn,
    precautions_hi: precautionsHi,
    pest_disease_alert: {
      pest: stageRecord.primary_pest,
      disease: stageRecord.primary_disease,
      risk_level: pestRiskLevel,
      trigger_reason: pestTriggerEn,
      trigger_reason_hi: pestTriggerHi,
    },
    stage_parameters: stageRecord,
  };
}

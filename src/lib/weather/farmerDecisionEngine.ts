import { NormalizedWeatherData } from "./types";
import {
  CropId,
  StageId,
  FarmerDecisionResult,
  WeatherWindowStatus,
  CROPS,
  STAGES,
} from "./farmerTypes";
import { findCropById } from "../crops";

/**
 * Deterministic weather-suitability decision engine for agriculture.
 * 100% rule-based and independent of Gemini/LLMs.
 * Adheres strictly to hackathon agricultural safety constraints:
 * - No chemical or pesticide brands
 * - No dosages
 * - No exact water liter claims
 * - No guaranteed crop yield promises
 */
export function evaluateFarmerWeatherAdvisory(
  weather: NormalizedWeatherData | null,
  cropId: CropId,
  stageId: StageId
): FarmerDecisionResult {
  const catalogCrop = findCropById(cropId);
  const fallbackCrop = CROPS.find((c) => c.id === cropId) || CROPS[0];
  const crop = catalogCrop
    ? {
        id: catalogCrop.id,
        nameEn: catalogCrop.nameEn,
        nameHi: catalogCrop.nameHi,
        iconName: catalogCrop.iconName,
      }
    : fallbackCrop;
  const stage = STAGES.find((s) => s.id === stageId) || STAGES[1];


  // Rule: Insufficient Data Check
  if (!weather || !weather.current || !weather.hourly || weather.hourly.length === 0) {
    return {
      irrigationStatus: "INSUFFICIENT DATA",
      irrigationReasonEn: "Live meteorological telemetry is currently unavailable to evaluate soil water balance.",
      irrigationReasonHi: "सिंचाई जल संतुलन का आकलन करने के लिए लाइव मौसम डेटा अनुपलब्ध है।",
      sprayStatus: "INSUFFICIENT DATA",
      sprayReasonEn: "Insufficient telemetry to verify atmospheric wind and precipitation thresholds.",
      sprayReasonHi: "हवा की गति और वर्षा का आकलन करने के लिए अपर्याप्त मौसम डेटा।",
      considerTodayEn: ["Consult local Krishi Vigyan Kendra (KVK) officials for manual field recommendations."],
      considerTodayHi: ["मैन्युअल कृषि सलाह के लिए अपने स्थानीय कृषि विज्ञान केंद्र (KVK) से संपर्क करें।"],
      avoidTodayEn: ["Avoid unverified chemical applications until atmospheric telemetry is restored."],
      avoidTodayHi: ["मौसम डेटा बहाल होने तक अनिश्चित रासायनिक छिड़काव से बचें।"],
    };
  }

  const { current, hourly, daily } = weather;

  // Next 24 hours analysis
  const next24h = hourly.slice(0, 24);
  const next12h = hourly.slice(0, 12);

  const maxRainProb24h = next24h.reduce(
    (max, h) => Math.max(max, h.precipitationProbability || 0),
    0
  );
  const sumPrecip24h = next24h.reduce((sum, h) => sum + (h.precipitation || 0), 0);
  const maxRainProb12h = next12h.reduce(
    (max, h) => Math.max(max, h.precipitationProbability || 0),
    0
  );
  const currentRain = current.precipitation > 0 || current.rain > 0;

  const currentWind = current.windSpeed;
  const currentGusts = current.windGusts;
  const maxWind12h = next12h.reduce(
    (max, h) => Math.max(max, h.windSpeed || 0),
    0
  );

  const currentTemp = current.temperature;
  const apparentTemp = current.apparentTemperature;
  const todayMaxTemp = daily[0]?.tempMax ?? currentTemp;

  // Condition Flags
  const isHeavyRainUpcoming = sumPrecip24h >= 8 || maxRainProb24h >= 60;
  const isModerateRainUpcoming = currentRain || sumPrecip24h >= 2 || maxRainProb24h >= 35;
  const isRainNearSpray = currentRain || maxRainProb12h >= 25 || sumPrecip24h >= 1;
  const isStrongWindForSpray = currentWind >= 14 || currentGusts >= 22 || maxWind12h >= 14;
  const isHighWindGeneral = currentWind >= 24 || currentGusts >= 38;
  const isHighHeat = currentTemp >= 34 || apparentTemp >= 37 || todayMaxTemp >= 35;

  // -------------------------------------------------------------
  // 1. IRRIGATION STATUS EVALUATION
  // -------------------------------------------------------------
  let irrigationStatus: WeatherWindowStatus = "GOOD WEATHER WINDOW";
  let irrigationReasonEn = "Rain probability is low over the next 24 hours. Normal scheduled field moisture maintenance may proceed.";
  let irrigationReasonHi = "अगले 24 घंटों में वर्षा की संभावना न्यूनतम है। नियमित आवश्यकतानुसार सिंचाई कार्य जारी रखा जा सकता है।";

  if (isHeavyRainUpcoming) {
    irrigationStatus = "AVOID DUE TO WEATHER";
    irrigationReasonEn = `Heavy rainfall anticipated (up to ${Math.round(sumPrecip24h)} mm, ${maxRainProb24h}% probability). Postpone all artificial irrigation and clear field drainage channels to prevent root water-logging.`;
    irrigationReasonHi = `भारी वर्षा का अनुमान (लगभग ${Math.round(sumPrecip24h)} मिमी, ${maxRainProb24h}% संभावना)। कृत्रिम सिंचाई तुरंत टालें और जलभराव से बचाव हेतु जल निकासी नालियों को खोलें।`;
  } else if (isModerateRainUpcoming) {
    irrigationStatus = "CAUTION";
    irrigationReasonEn = `Natural precipitation expected (${Math.round(sumPrecip24h * 10) / 10} mm, ${maxRainProb24h}% probability). Consider holding irrigation to conserve water and avoid over-saturation.`;
    irrigationReasonHi = `प्राकृतिक वर्षा की संभावना (${Math.round(sumPrecip24h * 10) / 10} मिमी, ${maxRainProb24h}% संभावना)। जल संरक्षण हेतु सिंचाई स्थगित करने पर विचार करें।`;
  } else if (isHighHeat) {
    irrigationStatus = "CAUTION";
    irrigationReasonEn = `Elevated heat (${todayMaxTemp}°C today). If irrigating, schedule strictly during early morning or late evening to minimize rapid evaporation losses.`;
    irrigationReasonHi = `तीव्र तापमान (${todayMaxTemp}°C)। सिंचाई की आवश्यकता होने पर केवल सुबह या शाम के समय करें ताकि वाष्पीकरण से पानी व्यर्थ न हो।`;
  }

  // -------------------------------------------------------------
  // 2. SPRAY WEATHER WINDOW EVALUATION
  // -------------------------------------------------------------
  let sprayStatus: WeatherWindowStatus = "GOOD WEATHER WINDOW";
  let sprayReasonEn = "No major weather restriction detected for application (calm winds and low rain probability). Note: Follow local agricultural extension officer guidelines; weather window does not guarantee chemical efficacy.";
  let sprayReasonHi = "मौसम की दृष्टि से कोई बड़ा अवरोध नहीं है (शांत हवा एवं वर्षा की न्यून संभावना)। ध्यान दें: स्थानीय कृषि विशेषज्ञ के दिशा-निर्देशों का पालन करें; मौसम विंडो रासायनिक प्रभाव की गारंटी नहीं देती।";

  if (isRainNearSpray && isStrongWindForSpray) {
    sprayStatus = "AVOID DUE TO WEATHER";
    sprayReasonEn = `Unsuitable spray conditions: Both rain (${maxRainProb12h}% chance) and elevated wind (${currentWind} km/h, gusts ${currentGusts} km/h) will cause chemical wash-off and hazardous spray drift.`;
    sprayReasonHi = `स्प्रे हेतु मौसम प्रतिकूल: वर्षा (${maxRainProb12h}% संभावना) और तेज हवाएं (${currentWind} km/h) दवा के धुलने और बहाव (ड्रिफ्ट) का कारण बनेंगी।`;
  } else if (isRainNearSpray) {
    sprayStatus = "AVOID DUE TO WEATHER";
    sprayReasonEn = `Rain expected within the 12-hour spray window (${maxRainProb12h}% probability). Foliar treatments will wash off before plant absorption.`;
    sprayReasonHi = `अगले 12 घंटों में वर्षा की संभावना (${maxRainProb12h}%)। पत्तियों पर किया गया छिड़काव अवशोषण से पहले ही धुल जाएगा।`;
  } else if (isStrongWindForSpray) {
    sprayStatus = "AVOID DUE TO WEATHER";
    sprayReasonEn = `Wind speed (${currentWind} km/h, peak gusts ${currentGusts} km/h) exceeds safe application limits (recommended < 12-14 km/h). High risk of spray drift to non-target areas.`;
    sprayReasonHi = `हवा की गति (${currentWind} km/h, झोंके ${currentGusts} km/h) सुरक्षित सीमा से अधिक है। दवा उड़कर अन्य क्षेत्रों में जाने का जोखिम है।`;
  } else if (isHighHeat) {
    sprayStatus = "CAUTION";
    sprayReasonEn = `High ambient temperature (${currentTemp}°C). High heat causes rapid droplet evaporation and may cause foliar burn. Restrict any authorized treatments to early morning.`;
    sprayReasonHi = `उच्च तापमान (${currentTemp}°C)। तेज धूप से दवा की बूंदें जल्दी सूख जाती हैं और पत्तियों को नुकसान हो सकता है। यदि आवश्यक हो तो केवल सुबह के समय करें।`;
  }

  // -------------------------------------------------------------
  // 3. CONSIDER TODAY & AVOID TODAY (Dynamic Lists)
  // -------------------------------------------------------------
  const considerTodayEn: string[] = [];
  const considerTodayHi: string[] = [];
  const avoidTodayEn: string[] = [];
  const avoidTodayHi: string[] = [];

  // Stage-specific considerations
  if (stageId === "harvesting") {
    if (isModerateRainUpcoming || isHeavyRainUpcoming) {
      considerTodayEn.push("Move already harvested crops, grain bundles, and pods into dry, covered storage sheds immediately.");
      considerTodayHi.push("काटी गई फसल, खलिहान में रखे दानों और ढेरों को तुरंत तिरपाल से ढकें या सूखे गोदाम में पहुंचाएं।");
      avoidTodayEn.push("Avoid cutting standing crop during high rain probability periods to prevent grain discoloration and moisture spoiling.");
      avoidTodayHi.push("वर्षा की संभावना के दौरान खड़ी फसल की कटाई टालें ताकि दाना काला पड़ने और सड़ने से बचाया जा सके।");
    } else {
      considerTodayEn.push("Favorable weather window for harvesting, field drying, threshing, and bagging.");
      considerTodayHi.push("फसल कटाई, सुखाने, गहाई एवं भंडारण के लिए अनुकूल मौसम विंडो उपलब्ध है।");
      avoidTodayEn.push("Avoid storing damp grain without proper moisture testing.");
      avoidTodayHi.push("अनाज में अधिक नमी होने पर उसे बिना सुखाए बोरियों में बंद करने से बचें।");
    }
  } else if (stageId === "sowing") {
    if (isHeavyRainUpcoming) {
      avoidTodayEn.push("Avoid immediate seed sowing in heavy precipitation to prevent seed displacement and soil compaction.");
      avoidTodayHi.push("भारी वर्षा के दौरान बुवाई से बचें ताकि बीज बहने और जमीन सख्त होने से बचाव हो सके।");
      considerTodayEn.push("Inspect drainage gradients before emergence.");
      considerTodayHi.push("बीज अंकुरण से पूर्व खेत की जल निकासी ढलान की जांच करें।");
    } else {
      considerTodayEn.push(`Check soil seedbed moisture suitability for ${crop.nameEn} germination.`);
      considerTodayHi.push(`${crop.nameHi} के अंकुरण हेतु मिट्टी में पर्याप्त नमी की पुष्टि करें।`);
    }
  } else if (stageId === "flowering") {
    if (isHeavyRainUpcoming || isHighWindGeneral) {
      avoidTodayEn.push("Avoid any disturbance or foliar contact during adverse weather to protect delicate blossoms and pollen wash-out.");
      avoidTodayHi.push("फूलों एवं परागकणों की सुरक्षा हेतु प्रतिकूल मौसम में खेत में कोई अनावश्यक हस्तक्षेप न करें।");
    }
    considerTodayEn.push(`Monitor ${crop.nameEn} field moisture consistency during flowering.`);
    considerTodayHi.push(`फूल आने की संवेदनशील अवस्था में ${crop.nameHi} में समान नमी बनाए रखने पर ध्यान दें।`);
  } else {
    // Growing stage
    considerTodayEn.push(`Inspect ${crop.nameEn} field plots for uniform vegetative stand and root aeration.`);
    considerTodayHi.push(`${crop.nameHi} के पौधों के समुचित विकास और जड़ों में हवा के संचार की निगरानी करें।`);
  }

  // Weather-specific considerations
  if (isHeavyRainUpcoming || isModerateRainUpcoming) {
    considerTodayEn.push("Clear Bund outlets, drainage ditches, and culverts to ensure unhindered run-off from field lowlands.");
    considerTodayHi.push("खेत की मेड़ के निकास और जल निकासी नालियों को साफ रखें ताकि पानी तुरंत निकल सके।");
    avoidTodayEn.push("Avoid applying any chemical spray or water applications until fields dry out.");
    avoidTodayHi.push("खेत सूखने तक किसी भी प्रकार का रासायनिक स्प्रे या अतिरिक्त सिंचाई कार्य पूरी तरह टालें।");
  } else {
    considerTodayEn.push("Field transit and routine weeding or inter-cultivation may proceed under dry conditions.");
    considerTodayHi.push("शुष्क मौसम का लाभ उठाकर निराई-गुड़ाई एवं खेत की सामान्य देखभाल की जा सकती है।");
  }

  if (isStrongWindForSpray) {
    avoidTodayEn.push(`Avoid spraying or light dusting: Wind speed is ${currentWind} km/h (drift threshold exceeded).`);
    avoidTodayHi.push(`स्प्रे का कार्य टालें: हवा की गति ${currentWind} km/h है जो सुरक्षित सीमा से अधिक है।`);
  }

  if (isHighHeat) {
    considerTodayEn.push("Schedule labor-intensive fieldwork and irrigation operations during cooler morning hours (before 10:00 AM) or late afternoon.");
    considerTodayHi.push("कठिन कृषि कार्य और सिंचाई सुबह 10:00 बजे से पहले अथवा शाम को करें।");
    avoidTodayEn.push("Avoid midday field exposure (12:00 PM - 3:30 PM) during peak solar radiation.");
    avoidTodayHi.push("दोपहर 12:00 से 3:30 बजे के बीच तेज धूप में लगातार काम करने से बचें।");
  }

  // Notices
  let fieldHeatNoticeEn: string | undefined;
  let fieldHeatNoticeHi: string | undefined;
  if (isHighHeat) {
    fieldHeatNoticeEn = `Heat advisory active (${todayMaxTemp}°C). High evapotranspiration rate detected.`;
    fieldHeatNoticeHi = `उच्च तापमान चेतावनी (${todayMaxTemp}°C)। मिट्टी से तीव्र वाष्पीकरण की संभावना।`;
  }

  let drainageNoticeEn: string | undefined;
  let drainageNoticeHi: string | undefined;
  if (isHeavyRainUpcoming || isModerateRainUpcoming) {
    drainageNoticeEn = `Precipitation alert: ${Math.round(sumPrecip24h * 10) / 10} mm expected over next 24h. Ensure field drainage channels are clear.`;
    drainageNoticeHi = `वर्षा सतर्कता: अगले 24 घंटों में ${Math.round(sumPrecip24h * 10) / 10} मिमी वर्षा की संभावना। जल निकासी तैयार रखें।`;
  }

  return {
    irrigationStatus,
    irrigationReasonEn,
    irrigationReasonHi,
    sprayStatus,
    sprayReasonEn,
    sprayReasonHi,
    considerTodayEn,
    considerTodayHi,
    avoidTodayEn,
    avoidTodayHi,
    fieldHeatNoticeEn,
    fieldHeatNoticeHi,
    drainageNoticeEn,
    drainageNoticeHi,
  };
}

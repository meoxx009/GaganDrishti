import { NormalizedWeatherData, HourlyForecastItem } from "@/lib/weather/types";
import { City } from "@/lib/types";
import { ParsedWeatherQuery, TimePeriodOfDay } from "./intentParser";
import { ChatEvidencePackage } from "./types";
import { DetectedConversationLanguage } from "./languageDetector";
import { evaluateFarmerWeatherAdvisory } from "@/lib/weather/farmerDecisionEngine";
import { evaluateWeatherRisks } from "@/lib/weather/riskEngine";
import { CropId, CROPS } from "@/lib/weather/farmerTypes";
import { parseTravelQuery, assessTravelWeather, generateDeterministicTravelReply } from "@/lib/weather/travelWeather";
import { getFarmDecision, extractCropStageFromText } from "@/lib/weather/cropStageDecisionEngine";
import { getPestForecast } from "@/lib/weather/pestForecastEngine";
import { DayForecastSnapshot } from "@/lib/weather/pestForecastTypes";

export interface DeterministicWeatherResult {
  reply: string;
  evidence: ChatEvidencePackage;
  directConclusion: string;
}

/**
 * Formats hour in 12-hour AM/PM format (e.g. "3:00 PM", "6:00 AM")
 */
function formatHour12(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    let hours = d.getHours();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:00 ${ampm}`;
  } catch {
    return dateStr;
  }
}

/**
 * Extracts human-friendly period name in target language
 */
function getPeriodName(hour: number, lang: "hinglish" | "hi" | "mr" | "en"): string {
  if (hour >= 5 && hour < 12) {
    return lang === "hinglish" ? "subah" : lang === "hi" ? "सुबह" : lang === "mr" ? "सकाळी" : "morning";
  }
  if (hour >= 12 && hour < 16) {
    return lang === "hinglish" ? "dopahar" : lang === "hi" ? "दोपहर" : lang === "mr" ? "दुपारी" : "afternoon";
  }
  if (hour >= 16 && hour < 20) {
    return lang === "hinglish" ? "shaam" : lang === "hi" ? "शाम" : lang === "mr" ? "संध्याकाळी" : "evening";
  }
  return lang === "hinglish" ? "raat" : lang === "hi" ? "रात" : lang === "mr" ? "रात्री" : "night";
}

/**
 * Filter hourly slice according to dayOffset and periodOfDay
 */
function getTargetHours(
  hourly: HourlyForecastItem[],
  dayOffset: number,
  periodOfDay: TimePeriodOfDay
): HourlyForecastItem[] {
  const startIdx = Math.max(0, dayOffset * 24);
  const daySlice = hourly.slice(startIdx, startIdx + 24);
  if (daySlice.length === 0) return hourly.slice(0, 24);

  if (periodOfDay === "all_day") return daySlice;

  return daySlice.filter((item) => {
    const d = new Date(item.time);
    const hour = d.getHours();
    if (periodOfDay === "morning") return hour >= 6 && hour < 12;
    if (periodOfDay === "afternoon") return hour >= 12 && hour < 17;
    if (periodOfDay === "evening") return hour >= 17 && hour < 21;
    if (periodOfDay === "night") return hour >= 21 || hour < 6;
    if (periodOfDay === "current") return hour >= new Date().getHours() && hour < new Date().getHours() + 3;
    return true;
  });
}

/**
 * Computes deterministic answer for all weather intents
 */
export function computeDeterministicWeatherAnswer(
  parsed: ParsedWeatherQuery,
  city: City,
  weather: NormalizedWeatherData | null,
  targetLang: DetectedConversationLanguage,
  selectedCrop?: CropId
): DeterministicWeatherResult {
  const cityName =
    targetLang === "mr"
      ? city.nameMr || city.nameHi
      : targetLang === "hi"
      ? city.nameHi
      : city.nameEn;

  const nowIso = new Date().toISOString();

  // Guard for missing telemetry
  if (!weather || !weather.current) {
    const noDataReply =
      targetLang === "hinglish"
        ? `${cityName} ke liye live weather telemetry abhi fetch nahi ho payi hai. Kripya thodi der baad refresh karein.`
        : targetLang === "hi"
        ? `${cityName} के लिए वर्तमान मौसम डेटा उपलब्ध नहीं है। कृपया थोड़ी देर बाद पुनः प्रयास करें।`
        : targetLang === "mr"
        ? `${cityName} साठी थेट हवामान डेटा उपलब्ध नाही.`
        : `Live weather telemetry is currently unavailable for ${cityName}. Please try refreshing in a few moments.`;

    return {
      reply: noDataReply,
      directConclusion: "Weather data unavailable",
      evidence: {
        intent: parsed.intent,
        resolvedLocation: `${cityName}, ${city.stateEn}`,
        targetWindow: "Current",
        weatherVariable: "None",
        keyMetrics: { status: "missing_telemetry" },
        source: "Open-Meteo API",
        timestamp: nowIso,
      },
    };
  }

  const { current, hourly, daily } = weather;
  const dayOffset = parsed.timeSlot.dayOffset;
  const targetDayLabel =
    dayOffset === 1
      ? (targetLang === "hinglish" ? "Kal" : targetLang === "hi" ? "कल" : targetLang === "mr" ? "उद्या" : "Tomorrow")
      : dayOffset === 2
      ? (targetLang === "hinglish" ? "Parso" : targetLang === "hi" ? "परसों" : targetLang === "mr" ? "परवा" : "Day after tomorrow")
      : (targetLang === "hinglish" ? "Aaj" : targetLang === "hi" ? "आज" : targetLang === "mr" ? "आज" : "Today");

  const targetHours = getTargetHours(hourly, dayOffset, parsed.timeSlot.periodOfDay);
  const targetDaily = daily[dayOffset] || daily[0];

  // Resolve Crop
  const cropToUse: CropId = (parsed.cropMention as CropId) || selectedCrop || "wheat";
  const cropObj = CROPS.find((c) => c.id === cropToUse);
  const cropNameEn = cropObj?.nameEn || "Crop";
  const cropNameHi = cropObj?.nameHi || "फसल";

  // ─────────────────────────────────────────────────────────────
  // 1. RAIN TIMING INTENT: "aaj kis time period me jyada barish hogi"
  // ─────────────────────────────────────────────────────────────
  if (parsed.intent === "rain_timing") {
    const hoursToScan = targetHours.length > 0 ? targetHours : hourly.slice(0, 24);

    let peakProbItem = hoursToScan[0];
    let peakPrecipItem = hoursToScan[0];

    for (const item of hoursToScan) {
      if ((item.precipitationProbability || 0) > (peakProbItem.precipitationProbability || 0)) {
        peakProbItem = item;
      }
      if ((item.precipitation || 0) > (peakPrecipItem.precipitation || 0)) {
        peakPrecipItem = item;
      }
    }

    const peakProb = peakProbItem?.precipitationProbability ?? 0;
    const peakPrecip = Math.round((peakPrecipItem?.precipitation ?? 0) * 10) / 10;
    const peakHourStr = peakProbItem?.time ? formatHour12(peakProbItem.time) : "N/A";
    const peakHourNum = peakProbItem?.time ? new Date(peakProbItem.time).getHours() : 12;
    const periodName = getPeriodName(peakHourNum, targetLang);

    // Identify contiguous rainy window (prob >= 30% or precip > 0)
    const rainyHours = hoursToScan.filter(
      (h) => (h.precipitationProbability || 0) >= 30 || (h.precipitation || 0) > 0.1
    );

    let windowDesc = "";
    if (rainyHours.length > 0) {
      const firstHour = formatHour12(rainyHours[0].time);
      const lastHour = formatHour12(rainyHours[rainyHours.length - 1].time);
      windowDesc = `${firstHour} to ${lastHour}`;
    }

    let reply = "";
    let conclusion = "";

    if (peakProb < 25 && peakPrecip === 0) {
      conclusion = "Low chance of rain";
      if (targetLang === "hinglish") {
        reply = `${targetDayLabel} ${cityName} me zyada baarish ki sambhavna nahi hai. Maximum rain probability lagbhag ${peakProb}% hai, aur mausam mukhya roop se saaf/sukha rahega. Bahar nikalne ke liye koi mausam sambandhi rukawat nahi hai.`;
      } else if (targetLang === "hi") {
        reply = `${targetDayLabel} ${cityName} में तेज वर्षा की संभावना काफी कम है। वर्षा की अधिकतम संभावना मात्र ${peakProb}% है और मौसम मुख्य रूप से साफ बना रहेगा। दैनिक कार्यों में बारिश की रुकावट की आशंका नहीं है।`;
      } else if (targetLang === "mr") {
        reply = `${targetDayLabel} ${cityName} मध्ये पावसाची शक्यता कमी आहे. जास्तीत जास्त पाऊस संभाव्यता ${peakProb}% आहे आणि हवामान प्रामुख्याने कोरडे राहील.`;
      } else {
        reply = `${targetDayLabel} in ${cityName}, heavy or persistent rain is unlikely. The peak rain probability is only ${peakProb}%, and conditions will remain predominantly dry with no significant weather disruption.`;
      }
    } else {
      conclusion = `Peak rain around ${peakHourStr} (${peakProb}%)`;
      if (targetLang === "hinglish") {
        reply = `${targetDayLabel} ${cityName} me sabse zyada baarish ki sambhavna **${periodName} ke samay (lagbhag ${peakHourStr})** hai, jahan rain probability **${peakProb}%** tak ja sakti hai.\n\n` +
          `• **Mukhy Barish Window:** ${windowDesc ? `${windowDesc} ke beech` : `${peakHourStr} ke aas-paas`}\n` +
          `• **Peak Rain Probability:** **${peakProb}%**\n` +
          `• **Estimated Precipitation:** ${peakPrecip > 0 ? `${peakPrecip} mm` : "Halki boondabaandi ya passing showers"}\n` +
          `• **Practical Advice:** Agar aap is samay bahar nikal rahe hain to umbrella ya raincoat sath rakhna sahi rahega.`;
      } else if (targetLang === "hi") {
        reply = `${targetDayLabel} ${cityName} में वर्षा की सर्वाधिक संभावना **${periodName} के समय (लगभग ${peakHourStr})** है, जहाँ वर्षा की संभावना **${peakProb}%** रहने का अनुमान है।\n\n` +
          `• **मुख्य वर्षा अवधि:** ${windowDesc ? `${windowDesc} के मध्य` : `${peakHourStr} के आसपास`}\n` +
          `• **अधिकतम वर्षा संभावना:** **${peakProb}%**\n` +
          `• **अनुमानित वर्षा मात्रा:** ${peakPrecip > 0 ? `${peakPrecip} मिमी` : "हल्की बूंदाबांदी"}\n` +
          `• **व्यावहारिक सलाह:** इस समय अंतराल में बाहर निकलते समय छाता या वाटरप्रूफ कवर साथ रखें।`;
      } else if (targetLang === "mr") {
        reply = `${targetDayLabel} ${cityName} मध्ये पावसाची सर्वाधिक शक्यता **${periodName} (सुमारे ${peakHourStr})** दरम्यान आहे, जिथे पावसाची शक्यता **${peakProb}%** असेल.\n\n` +
          `• **पावसाची मुख्य वेळ:** ${windowDesc || peakHourStr}\n` +
          `• **पाऊस संभाव्यता:** **${peakProb}%** (अपेक्षित पाऊस: ${peakPrecip} मिमी)`;
      } else {
        reply = `${targetDayLabel} in ${cityName}, the highest likelihood of rainfall is projected during the **${periodName} around ${peakHourStr}**, with rain probability reaching **${peakProb}%**.\n\n` +
          `• **Primary Rain Window:** ${windowDesc ? windowDesc : `Around ${peakHourStr}`}\n` +
          `• **Peak Rain Probability:** **${peakProb}%**\n` +
          `• **Expected Precipitation:** ${peakPrecip > 0 ? `${peakPrecip} mm` : "Light passing showers"}\n` +
          `• **Guidance:** Carrying rain protection during this window is recommended.`;
      }
    }

    return {
      reply,
      directConclusion: conclusion,
      evidence: {
        intent: "rain_timing",
        resolvedLocation: `${cityName}, ${city.stateEn}`,
        targetWindow: `${targetDayLabel} (${peakHourStr})`,
        weatherVariable: "Precipitation Probability & Hourly Timing",
        keyMetrics: {
          peakProbability: `${peakProb}%`,
          peakHour: peakHourStr,
          estimatedPrecipitationMm: peakPrecip,
          window: windowDesc || "Intermittent",
        },
        source: "Open-Meteo Hourly Forecast",
        timestamp: nowIso,
      },
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 2. RAIN QUANTITATIVE AMOUNT (mm): "baarish kitni mm ho sakti hai"
  // ─────────────────────────────────────────────────────────────
  if (parsed.intent === "rain_amount") {
    const rainMm = targetDaily.precipitationSum ?? 0;
    const rainChance = targetDaily.precipitationProbabilityMax ?? 0;
    const next24hSum = Math.round(hourly.slice(0, 24).reduce((s, h) => s + (h.precipitation || 0), 0) * 10) / 10;

    let reply = "";
    if (targetLang === "hinglish") {
      reply = `${targetDayLabel} ${cityName} me anumanit kul baarish **${rainMm} mm** (next 24 hours me lagbhag ${next24hSum} mm) hone ka aakalan hai, jisme maximum probability **${rainChance}%** hai.\n\n` +
        `• **Expected Rain Amount:** **${rainMm} mm**\n` +
        `• **Rain Probability:** **${rainChance}%**\n` +
        `• **Status:** ${rainMm >= 20 ? "Bhari barish (Heavy rainfall signal)" : rainMm >= 5 ? "Madhyam barish (Moderate showers)" : "Halki boondabaandi ya shant mausam"}`;
    } else if (targetLang === "hi") {
      reply = `${targetDayLabel} ${cityName} में अनुमानित कुल वर्षा **${rainMm} मिमी** (आगामी 24 घंटों में लगभग ${next24hSum} मिमी) होने का अनुमान है, जिसमें वर्षा की अधिकतम संभावना **${rainChance}%** है।\n\n` +
        `• **अनुमानित वर्षा मात्रा:** **${rainMm} मिमी**\n` +
        `• **वर्षा की संभावना:** **${rainChance}%**\n` +
        `• **वर्षा का स्तर:** ${rainMm >= 20 ? "भारी वर्षा की संभावना" : rainMm >= 5 ? "मध्यम वर्षा" : "हल्की वर्षा अथवा बूंदाबांदी"}`;
    } else {
      reply = `${targetDayLabel} in ${cityName}, total projected precipitation accumulation is **${rainMm} mm** (approximately ${next24hSum} mm over the next 24 hours), with a peak rain chance of **${rainChance}%**.\n\n` +
        `• **Precipitation Sum:** **${rainMm} mm**\n` +
        `• **Probability:** **${rainChance}%**\n` +
        `• **Classification:** ${rainMm >= 20 ? "Heavy rain signal" : rainMm >= 5 ? "Moderate rainfall" : "Light or passing showers"}`;
    }

    return {
      reply,
      directConclusion: `Rain amount: ${rainMm} mm (${rainChance}% probability)`,
      evidence: {
        intent: "rain_amount",
        resolvedLocation: `${cityName}, ${city.stateEn}`,
        targetWindow: targetDayLabel,
        weatherVariable: "Precipitation Accumulation (mm)",
        keyMetrics: {
          precipitationSumMm: rainMm,
          probabilityMax: `${rainChance}%`,
          next24hSumMm: next24hSum,
        },
        source: "Open-Meteo Daily & Hourly Telemetry",
        timestamp: nowIso,
      },
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 3. FARMER SPRAY WINDOW ADVISORY: "spray ke liye weather sahi hai kya"
  // ─────────────────────────────────────────────────────────────
  if (parsed.intent === "farmer_spray") {
    const next5h = hourly.slice(0, 5);
    const maxWind5h = next5h.reduce((m, h) => Math.max(m, h.windSpeed || 0), 0);
    const maxRainProb24h = hourly.slice(0, 24).reduce((m, h) => Math.max(m, h.precipitationProbability || 0), 0);

    // Run 100% Deterministic Crop-Stage Decision Engine
    const stageDetected = extractCropStageFromText(parsed.normalizedQuery);
    const farmDecision = getFarmDecision({
      crop_name: cropNameEn,
      crop_stage: stageDetected.stageNumber || 2, // default Vegetative stage
      current_temperature: current.temperature,
      current_humidity: current.relativeHumidity,
      rain_probability: maxRainProb24h,
      rain_sum_24h: targetDaily.precipitationSum || 0,
      current_wind_speed: current.windSpeed,
      current_wind_gusts: current.windGusts,
    });

    const status = farmDecision.decision === "DON'T SPRAY"
      ? "AVOID DUE TO WEATHER"
      : farmDecision.decision === "CAUTION SPRAY"
      ? "CAUTION"
      : "FAVOURABLE";

    let reply = "";
    if (targetLang === "hinglish") {
      reply = `🌿 **${farmDecision.crop} (${farmDecision.crop_hi}) — Stage ${farmDecision.stage_number} (${farmDecision.stage_hi}) Decision Engine:**\n\n` +
        `• **Fasal Nirnay (Decision):** **${farmDecision.decision_hi}** [Confidence: ${farmDecision.decision_confidence}]\n` +
        `• **Karyawahi (Recommended Action):** ${farmDecision.recommended_action_hi[0]}\n` +
        `• **Sabse Anukool Samay (Best Window):** ${farmDecision.best_window_hi}\n\n` +
        `• **Weather Telemetry Evidence:**\n` +
        `- Rain Probability: **${maxRainProb24h}%** (Wash-off limit: ${farmDecision.stage_parameters.critical_rain_probability}%, Rain: ${current.precipitation} mm)\n` +
        `- Wind Speed: **${current.windSpeed} km/h** (Drift limit: ${farmDecision.stage_parameters.critical_wind_speed} km/h, Gusts: **${current.windGusts} km/h**)\n` +
        `- Humidity: **${current.relativeHumidity}%** (Disease threshold: ${farmDecision.stage_parameters.critical_humidity_disease}%) | Temp: **${current.temperature}°C**\n\n` +
        `• **Rog / Keet Alert (${farmDecision.pest_disease_alert.risk_level} Risk):**\n` +
        `- Mukhya Keet: **${farmDecision.pest_disease_alert.pest}**\n` +
        `- Mukhya Rog: **${farmDecision.pest_disease_alert.disease}**\n` +
        `- ${farmDecision.pest_disease_alert.trigger_reason_hi}\n\n` +
        `• **Kisan Savdhaaniyan (Precautions):**\n` +
        `- ${farmDecision.precautions_hi.slice(0, 2).join("\n- ")}`;
    } else if (targetLang === "hi") {
      reply = `🌿 **${farmDecision.crop_hi} — अवस्था ${farmDecision.stage_number} (${farmDecision.stage_hi}) निर्णय इंजन:**\n\n` +
        `• **निर्णय (Decision):** **${farmDecision.decision_hi}** [विश्वसनीयता: ${farmDecision.decision_confidence}]\n` +
        `• **अनुशंसित कार्य:** ${farmDecision.recommended_action_hi[0]}\n` +
        `• **सर्वश्रेष्ठ समय खिड़की:** ${farmDecision.best_window_hi}\n\n` +
        `• **मौसम साक्ष्य (Telemetry):**\n` +
        `- वर्षा संभावना: **${maxRainProb24h}%** (धुलने की सीमा: ${farmDecision.stage_parameters.critical_rain_probability}%), हवा: **${current.windSpeed} km/h** (झोंके **${current.windGusts} km/h**)\n` +
        `- सापेक्षिक आर्द्रता: **${current.relativeHumidity}%** (रोग सीमा: ${farmDecision.stage_parameters.critical_humidity_disease}%), तापमान: **${current.temperature}°C**\n\n` +
        `• **कीट एवं रोग चेतावनी (${farmDecision.pest_disease_alert.risk_level} जोखिम):**\n` +
        `- मुख्य कीट: **${farmDecision.pest_disease_alert.pest}** | मुख्य रोग: **${farmDecision.pest_disease_alert.disease}**\n` +
        `- ${farmDecision.pest_disease_alert.trigger_reason_hi}\n\n` +
        `• **सावधानियां:**\n` +
        `- ${farmDecision.precautions_hi.slice(0, 2).join("\n- ")}`;
    } else {
      reply = `🌿 **${farmDecision.crop} — Stage ${farmDecision.stage_number} (${farmDecision.stage}) Deterministic Decision Engine:**\n\n` +
        `• **Decision:** **${farmDecision.decision}** [Confidence: ${farmDecision.decision_confidence}]\n` +
        `• **Recommended Action:** ${farmDecision.recommended_action[0]}\n` +
        `• **Best Window:** ${farmDecision.best_window}\n\n` +
        `• **Telemetry Evidence:** Rain Probability **${maxRainProb24h}%** (Wash-off Limit: ${farmDecision.stage_parameters.critical_rain_probability}%), Wind **${current.windSpeed} km/h** (Drift Limit: ${farmDecision.stage_parameters.critical_wind_speed} km/h, Gusts: **${current.windGusts} km/h**), Humidity **${current.relativeHumidity}%**, Temp **${current.temperature}°C**\n\n` +
        `• **Pest & Disease Alert (${farmDecision.pest_disease_alert.risk_level} Risk):**\n` +
        `- Primary Pest: **${farmDecision.pest_disease_alert.pest}** | Primary Disease: **${farmDecision.pest_disease_alert.disease}**\n` +
        `- ${farmDecision.pest_disease_alert.trigger_reason}\n\n` +
        `• **Precautions:**\n` +
        `- ${farmDecision.precautions.slice(0, 2).join("\n- ")}`;
    }

    return {
      reply,
      directConclusion: `Spray Decision: ${farmDecision.decision} (${farmDecision.crop} - ${farmDecision.stage})`,
      evidence: {
        intent: "farmer_spray",
        resolvedLocation: `${cityName}, ${city.stateEn}`,
        targetWindow: farmDecision.best_window,
        weatherVariable: "Spray Window Feasibility & Crop-Stage Decision",
        keyMetrics: {
          crop: farmDecision.crop,
          stage: farmDecision.stage,
          stageNumber: farmDecision.stage_number,
          decision: farmDecision.decision,
          confidence: farmDecision.decision_confidence,
          windSpeedKmH: current.windSpeed,
          windGustsKmH: current.windGusts,
          rainProbability24h: `${maxRainProb24h}%`,
          primaryPest: farmDecision.pest_disease_alert.pest,
          primaryDisease: farmDecision.pest_disease_alert.disease,
        },
        source: "GaganDrishti Agro-Meteorological Crop-Stage Engine",
        timestamp: nowIso,
      },
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 4. FARMER IRRIGATION ADVISORY: "irrigation karni chahiye kya"
  // ─────────────────────────────────────────────────────────────
  if (parsed.intent === "farmer_irrigation") {
    const advisory = evaluateFarmerWeatherAdvisory(weather, cropToUse, "growing");
    const status = advisory.irrigationStatus;
    const rain48h = Math.round(((daily[0]?.precipitationSum || 0) + (daily[1]?.precipitationSum || 0)) * 10) / 10;
    const maxRainProb24h = hourly.slice(0, 24).reduce((m, h) => Math.max(m, h.precipitationProbability || 0), 0);

    let reply = "";
    if (targetLang === "hinglish") {
      reply = `💧 **${cropNameEn} (${cropNameHi}) Sinchai (Irrigation) Advisory (${cityName}):**\n\n` +
        `• **Status:** **${status === "AVOID DUE TO WEATHER" ? "🛑 Sinchai Talen (Avoid Irrigation)" : "✅ Sinchai Kar Sakte Hain (Favourable Window)"}**\n\n` +
        `• **Weather Evidence:**\n` +
        `- Agle 48 ghanton me kul anumanit barish: **${rain48h} mm** (Max Rain Prob: **${maxRainProb24h}%**)\n` +
        `- Vartaman Taapman: **${current.temperature}°C** | Humidity: **${current.relativeHumidity}%**\n\n` +
        `• **Advisory:** ${
          status === "AVOID DUE TO WEATHER"
            ? `Agle 24–48 ghanton me barish ki sambhavna hai. Khet me krtrim sinchai talen taaki jalbhaaraav (waterlogging) na ho.`
            : `Barish ka koi nikattam sanket nahi hai. Mitti ki nami dekhkar samanya sinchai kar sakte hain.`
        }`;
    } else if (targetLang === "hi") {
      reply = `💧 **${cropNameHi} सिंचाई मौसम परामर्श (${cityName}):**\n\n` +
        `• **स्थिति:** **${status === "AVOID DUE TO WEATHER" ? "🛑 सिंचाई टालें (Avoid Irrigation)" : "✅ सामान्य सिंचाई खिड़की (Favourable)"}**\n` +
        `• **मौसम साक्ष्य:** आगामी 48 घंटों में कुल अनुमानित वर्षा **${rain48h} मिमी** (संभावना ${maxRainProb24h}%)\n` +
        `• **परामर्श:** ${advisory.irrigationReasonHi}`;
    } else {
      reply = `💧 **${cropNameEn} Irrigation Advisory (${cityName}):**\n\n` +
        `• **Status:** **${status}**\n` +
        `• **Precipitation Outlook:** 48-hour cumulative rainfall is **${rain48h} mm** with a maximum rain probability of **${maxRainProb24h}%**.\n` +
        `• **Guidance:** ${advisory.irrigationReasonEn}`;
    }

    return {
      reply,
      directConclusion: `Irrigation Status: ${status}`,
      evidence: {
        intent: "farmer_irrigation",
        resolvedLocation: `${cityName}, ${city.stateEn}`,
        targetWindow: "Next 24–48 Hours",
        weatherVariable: "Irrigation Requirement",
        keyMetrics: {
          irrigationStatus: status,
          rain48hMm: rain48h,
          maxRainProb24h: `${maxRainProb24h}%`,
          crop: cropNameEn,
        },
        source: "GaganDrishti Agro-Meteorological Engine",
        timestamp: nowIso,
      },
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 4.5 PEST & DISEASE PREDICTIVE FORECAST ENGINE (CHANGE_004)
  // ─────────────────────────────────────────────────────────────
  if (parsed.intent === "pest_forecast") {
    const stageDetected = extractCropStageFromText(parsed.normalizedQuery);
    const daySnapshots: DayForecastSnapshot[] = daily.slice(0, 7).map((d, idx) => {
      const slice = hourly.slice(idx * 24, (idx + 1) * 24);
      let avgHum = current.relativeHumidity;
      let avgWind = current.windSpeed;
      if (slice.length > 0) {
        avgHum = Math.round(slice.reduce((acc, h) => acc + (h.relativeHumidity || 0), 0) / slice.length);
        avgWind = Math.round(slice.reduce((acc, h) => acc + (h.windSpeed || 0), 0) / slice.length);
      }
      const tMin = d.tempMin ?? current.temperature;
      const tMax = d.tempMax ?? current.temperature;
      return {
        dayIndex: idx,
        dateIso: d.date || `Day ${idx + 1}`,
        tempMin: tMin,
        tempMax: tMax,
        tempAvg: Math.round(((tMin + tMax) / 2) * 10) / 10,
        humidityAvg: avgHum,
        rainProbability: d.precipitationProbabilityMax ?? 0,
        precipitationMm: d.precipitationSum ?? 0,
        windSpeed: avgWind,
        weatherCode: d.weatherCode,
      };
    });

    const pestForecast = getPestForecast({
      crop_name: cropNameEn,
      crop_stage: stageDetected.stageNumber || 2,
      daily_forecast: daySnapshots,
      current_weather: {
        temperature: current.temperature,
        relative_humidity: current.relativeHumidity,
        wind_speed: current.windSpeed,
        precipitation: current.precipitation || 0,
      },
    });

    const alerts = pestForecast.predicted_alerts;
    let reply = "";

    if (targetLang === "hinglish") {
      reply = `🐛 **${pestForecast.crop} (${pestForecast.crop_hi}) — 7-Day Weather-Based Pest & Disease Forecast (${cityName}):**\n\n` +
        `• **Samagra Jokhim (Overall Risk):** **${pestForecast.overall_risk} RISK**\n` +
        `• **Mukhya Paramarsh:** ${pestForecast.overall_recommendation}\n\n`;

      if (alerts.length > 0) {
        reply += `• **Sambhavit Khatre (Predicted Threats & Timeline):**\n`;
        alerts.slice(0, 3).forEach((a, i) => {
          reply += `\n**${i + 1}. ${a.pest_disease_name} (${a.pest_disease_name_hi})** — [Risk: **${a.risk_level}**, Confidence: **${a.confidence_pct}%**]\n` +
            `- **Onset Window:** ${a.predicted_date_label} (Urgency: **${a.action_urgency}**)\n` +
            `- **Trigger:** ${a.why_triggered}\n` +
            `- **Nivarak Upay (Preventive Action):** ${a.preventive_action[0]}\n` +
            `- **Upchar (Control/Chemical):** ${a.recommended_chemicals}\n`;
        });
      } else {
        reply += `• **Status:** Agle 7 dino ke mausam anuman me koi gambhir bimari ya keet ka trigger sakriya nahi hai. Niyamit khet nirikshan karte rahein.`;
      }
    } else if (targetLang === "hi") {
      reply = `🐛 **${pestForecast.crop_hi} — 7-दिवसीय मौसम आधारित कीट एवं रोग पूर्वानुमान (${cityName}):**\n\n` +
        `• **समग्र जोखिम स्तर:** **${pestForecast.overall_risk} जोखिम**\n` +
        `• **मुख्य परामर्श:** ${pestForecast.overall_recommendation_hi}\n\n`;

      if (alerts.length > 0) {
        reply += `• **पूर्वानुमानित प्रकोप एवं समय सारणी:**\n`;
        alerts.slice(0, 3).forEach((a, i) => {
          reply += `\n**${i + 1}. ${a.pest_disease_name_hi} (${a.pest_disease_name})** — [जोखिम: **${a.risk_level}**, सटीकता: **${a.confidence_pct}%**]\n` +
            `- **संभावित शुरुआत:** ${a.predicted_date_label} (समय सीमा: **${a.action_urgency}**)\n` +
            `- **मौसम अनुकूलता:** ${a.why_triggered_hi}\n` +
            `- **रोकथाम उपाय:** ${a.preventive_action_hi[0]}\n` +
            `- **अनुशंसित उपचार/रसायन:** ${a.recommended_chemicals}\n`;
        });
      } else {
        reply += `• **स्थिति:** आगामी 7 दिनों के मौसम में किसी गंभीर कीट या फफूंद रोग के प्रकोप की संभावना नहीं है। सामान्य खेत निगरानी जारी रखें।`;
      }
    } else {
      reply = `🐛 **${pestForecast.crop} — 7-Day Weather-Based Pest & Disease Forecast (${cityName}):**\n\n` +
        `• **Overall Risk Assessment:** **${pestForecast.overall_risk} RISK**\n` +
        `• **Core Advisory:** ${pestForecast.overall_recommendation}\n\n`;

      if (alerts.length > 0) {
        reply += `• **Predicted Outbreak Alerts & Timeline:**\n`;
        alerts.slice(0, 3).forEach((a, i) => {
          reply += `\n**${i + 1}. ${a.pest_disease_name}** — [Risk: **${a.risk_level}**, Confidence: **${a.confidence_pct}%**]\n` +
            `- **Onset Window:** ${a.predicted_date_label} (Urgency: **${a.action_urgency}**)\n` +
            `- **Weather Trigger:** ${a.why_triggered}\n` +
            `- **Preventive Action:** ${a.preventive_action[0]}\n` +
            `- **Treatment/Chemical:** ${a.recommended_chemicals}\n`;
        });
      } else {
        reply += `• **Status:** Forecast conditions over the next 7 days indicate low pest/disease pressure. Maintain routine scouting.`;
      }
    }

    return {
      reply,
      directConclusion: `Pest Forecast: ${pestForecast.overall_risk} Risk for ${pestForecast.crop} (${alerts.length} predicted alert(s))`,
      evidence: {
        intent: "pest_forecast",
        resolvedLocation: `${cityName}, ${city.stateEn}`,
        targetWindow: "Next 7 Days",
        weatherVariable: "7-Day Pest & Disease Weather Triggers",
        keyMetrics: {
          crop: pestForecast.crop,
          overallRisk: pestForecast.overall_risk,
          totalAlerts: alerts.length,
          topAlert: alerts[0]?.pest_disease_name || "None",
          topOnset: alerts[0]?.predicted_date_label || "N/A",
          topConfidence: alerts[0]?.confidence_pct ? `${alerts[0].confidence_pct}%` : "N/A",
        },
        source: "GaganDrishti Weather Predictive Pest Engine",
        timestamp: nowIso,
      },
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 5. FARMER GENERAL / CROP-SPECIFIC OVERVIEW: "farmer ke liye aaj weather kaisa hai"
  // ─────────────────────────────────────────────────────────────
  if (parsed.intent === "farmer_general") {
    const advisory = evaluateFarmerWeatherAdvisory(weather, cropToUse, "growing");
    const rainProb = targetDaily.precipitationProbabilityMax ?? 0;
    const rainSum = targetDaily.precipitationSum ?? 0;

    const stageDetected = extractCropStageFromText(parsed.normalizedQuery);
    const farmDecision = getFarmDecision({
      crop_name: cropNameEn,
      crop_stage: stageDetected.stageNumber || 2,
      current_temperature: current.temperature,
      current_humidity: current.relativeHumidity,
      rain_probability: rainProb,
      rain_sum_24h: rainSum,
      current_wind_speed: current.windSpeed,
      current_wind_gusts: current.windGusts,
    });

    let reply = "";
    if (targetLang === "hinglish") {
      reply = `🌾 **${farmDecision.crop} (${farmDecision.crop_hi}) — Stage ${farmDecision.stage_number} (${farmDecision.stage_hi}) Kisan Advisory (${cityName}):**\n\n` +
        `• **Fasal Nirnay (Decision):** **${farmDecision.decision_hi}** [Confidence: ${farmDecision.decision_confidence}]\n` +
        `• **Spray Window:** ${farmDecision.decision === "DON'T SPRAY" ? "🛑 Anukool nahi hai (Avoid Spray)" : "✅ Anukool (Favourable)"}\n` +
        `• **Sinchai Status:** ${advisory.irrigationStatus === "AVOID DUE TO WEATHER" ? "🛑 Talen (Precipitation Expected)" : "✅ Anukool"}\n` +
        `• **Mausam Telemetry:** Taapman **${current.temperature}°C** (High ${targetDaily.tempMax}°C), Hawa **${current.windSpeed} km/h**, Rain Prob **${rainProb}%** (${rainSum} mm)\n` +
        `• **Rog / Keet Warning:** ${farmDecision.pest_disease_alert.disease} / ${farmDecision.pest_disease_alert.pest} (${farmDecision.pest_disease_alert.risk_level} Risk)\n` +
        `• **Karyawahi:** ${farmDecision.recommended_action_hi[0]}`;
    } else if (targetLang === "hi") {
      reply = `🌾 **${farmDecision.crop_hi} — अवस्था ${farmDecision.stage_number} (${farmDecision.stage_hi}) किसान परामर्श (${cityName}):**\n\n` +
        `• **निर्णय:** **${farmDecision.decision_hi}** [विश्वसनीयता: ${farmDecision.decision_confidence}]\n` +
        `• **छिड़काव स्थिति:** ${farmDecision.decision === "DON'T SPRAY" ? "🛑 आज टालें" : "✅ अनुकूल"}\n` +
        `• **सिंचाई स्थिति:** ${advisory.irrigationStatus === "AVOID DUE TO WEATHER" ? "🛑 टालें (वर्षा संकेत)" : "✅ आवश्यकतानुसार करें"}\n` +
        `• **मौसम साक्ष्य:** तापमान **${current.temperature}°C**, हवा **${current.windSpeed} km/h**, वर्षा संभावना **${rainProb}%** (${rainSum} मिमी)\n` +
        `• **कीट/रोग चेतावनी:** ${farmDecision.pest_disease_alert.disease} (${farmDecision.pest_disease_alert.risk_level} जोखिम)\n` +
        `• **अनुशंसित कार्य:** ${farmDecision.recommended_action_hi[0]}`;
    } else {
      reply = `🌾 **${farmDecision.crop} — Stage ${farmDecision.stage_number} (${farmDecision.stage}) Agricultural Summary (${cityName}):**\n\n` +
        `• **Decision:** **${farmDecision.decision}** [Confidence: ${farmDecision.decision_confidence}]\n` +
        `• **Spray Status:** ${farmDecision.decision}\n` +
        `• **Irrigation Status:** ${advisory.irrigationStatus}\n` +
        `• **Telemetry:** Temp ${current.temperature}°C, Wind ${current.windSpeed} km/h, Rain Chance ${rainProb}% (${rainSum} mm).\n` +
        `• **Pest / Disease Alert:** ${farmDecision.pest_disease_alert.disease} / ${farmDecision.pest_disease_alert.pest} (${farmDecision.pest_disease_alert.risk_level} Risk)\n` +
        `• **Recommended Action:** ${farmDecision.recommended_action[0]}`;
    }

    return {
      reply,
      directConclusion: `${farmDecision.crop} (${farmDecision.stage}): Spray [${farmDecision.decision}], Irrigation [${advisory.irrigationStatus}]`,
      evidence: {
        intent: "farmer_general",
        resolvedLocation: `${cityName}, ${city.stateEn}`,
        targetWindow: targetDayLabel,
        weatherVariable: "Agro-Meteorological Summary",
        keyMetrics: {
          crop: cropNameEn,
          sprayStatus: advisory.sprayStatus,
          irrigationStatus: advisory.irrigationStatus,
          rainSumMm: rainSum,
        },
        source: "GaganDrishti Agro-Meteorological Engine",
        timestamp: nowIso,
      },
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 6. THUNDERSTORM, LIGHTNING & SEVERE WEATHER: "thunderstorm ka chance hai kya"
  // ─────────────────────────────────────────────────────────────
  if (parsed.intent === "thunderstorm_risk") {
    const isThunderstormNow = [95, 96, 99].includes(current.weatherCode);
    const hasThunderstormDaily = [95, 96, 99].includes(targetDaily.weatherCode ?? 0);
    const maxGust = current.windGusts;
    const rainProb = targetDaily.precipitationProbabilityMax ?? 0;

    const hasRisk = isThunderstormNow || hasThunderstormDaily || maxGust >= 45 || rainProb >= 75;

    let reply = "";
    if (targetLang === "hinglish") {
      reply = `⚡ **${targetDayLabel} ${cityName} me Thunderstorm / Mausam Jokhim:**\n\n` +
        `• **Thunderstorm Status:** **${hasRisk ? "⚠️ Thunderstorm Risk Active (Garjan wa aandhi ki sambhavna)" : "✅ Low Risk (Mausam shant hai)"}**\n` +
        `• **Telemetry Evidence:**\n` +
        `- Weather Code: ${current.conditionEn} / ${current.conditionHi}\n` +
        `- Peak Wind Gusts: **${maxGust} km/h**\n` +
        `- Rain Probability: **${rainProb}%**\n\n` +
        `• **Safety Advice:** ${
          hasRisk
            ? "Bijli chamakne aur tez aandhi ke samay pedon ke neeche ya khule maidan me na khade hon. Pakke aashray me rahein."
            : "Vartaman me gambhir toofan ya bijli ka koi sakriya sanket nahi hai. Din samanya bana rahega."
        }`;
    } else if (targetLang === "hi") {
      reply = `⚡ **${targetDayLabel} ${cityName} में आंधी-तूफान व गर्जन जोखिम:**\n\n` +
        `• **स्थिति:** **${hasRisk ? "⚠️ गर्जन एवं आंधी जोखिम सक्रिय" : "✅ जोखिम नगण्य / सामान्य मौसम"}**\n` +
        `• **मौसम साक्ष्य:** हवा के झोंके **${maxGust} km/h**, वर्षा संभावना **${rainProb}%**, स्थिति: ${current.conditionHi}\n` +
        `• **सुरक्षा सलाह:** ${hasRisk ? "गर्जन के समय खुले मैदान व पेड़ों से दूर रहें और सुरक्षित स्थान पर आश्रय लें।" : "वर्तमान में गंभीर संवहनीय तूफान की आशंका नहीं है।"}`;
    } else {
      reply = `⚡ **Thunderstorm & Convective Risk Outlook for ${cityName}:**\n\n` +
        `• **Status:** **${hasRisk ? "⚠️ Thunderstorm Risk Active" : "✅ Low / Negligible Risk"}**\n` +
        `• **Telemetry Evidence:** Current condition: ${current.conditionEn}, Peak Gusts: **${maxGust} km/h**, Rain Probability: **${rainProb}%**.\n` +
        `• **Precaution:** ${hasRisk ? "Take shelter indoors during thunderstorm activity and avoid open fields or trees." : "No severe convective signatures detected."}`;
    }

    return {
      reply,
      directConclusion: hasRisk ? "Thunderstorm risk active" : "Low thunderstorm risk",
      evidence: {
        intent: "thunderstorm_risk",
        resolvedLocation: `${cityName}, ${city.stateEn}`,
        targetWindow: targetDayLabel,
        weatherVariable: "Convective Storm & Lightning Potential",
        keyMetrics: {
          hasThunderstormRisk: hasRisk,
          peakGustsKmH: maxGust,
          rainProbMax: `${rainProb}%`,
          weatherCode: current.weatherCode,
        },
        source: "Open-Meteo Atmospheric Models",
        timestamp: nowIso,
      },
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 7. TEMPERATURE TIMING & RANGE
  // ─────────────────────────────────────────────────────────────
  if (parsed.intent === "temperature_timing" || parsed.intent === "temperature_range") {
    const hoursToScan = targetHours.length > 0 ? targetHours : hourly.slice(0, 24);

    let maxTItem = hoursToScan[0];
    let minTItem = hoursToScan[0];

    for (const item of hoursToScan) {
      if ((item.temperature || 0) > (maxTItem.temperature || 0)) maxTItem = item;
      if ((item.temperature || 0) < (minTItem.temperature || 0)) minTItem = item;
    }

    const peakTemp = maxTItem?.temperature ?? targetDaily.tempMax;
    const minTemp = minTItem?.temperature ?? targetDaily.tempMin;
    const peakHourStr = maxTItem?.time ? formatHour12(maxTItem.time) : "3:00 PM";
    const minHourStr = minTItem?.time ? formatHour12(minTItem.time) : "5:00 AM";

    let reply = "";
    if (targetLang === "hinglish") {
      reply = `${targetDayLabel} ${cityName} me sabse zyada temperature **lagbhag ${peakHourStr} ke aas-paas (${peakTemp}°C)** rahega, jabki sabse thanda samay **tadke ${minHourStr} (${minTemp}°C)** ke kareeb hoga.\n\n` +
        `• **Maximum Temperature:** **${peakTemp}°C** (${peakHourStr})\n` +
        `• **Minimum Temperature:** **${minTemp}°C** (${minHourStr})\n` +
        `• **Current Temperature:** ${current.temperature}°C (Feels like ${current.apparentTemperature}°C)`;
    } else if (targetLang === "hi") {
      reply = `${targetDayLabel} ${cityName} में अधिकतम तापमान **लगभग ${peakHourStr} पर (${peakTemp}°C)** दर्ज होने का अनुमान है, और न्यूनतम तापमान **तड़के ${minHourStr} पर (${minTemp}°C)** रहेगा।\n\n` +
        `• **अधिकतम तापमान:** **${peakTemp}°C** (${peakHourStr})\n` +
        `• **न्यूनतम तापमान:** **${minTemp}°C** (${minHourStr})\n` +
        `• **वर्तमान तापमान:** ${current.temperature}°C (अनुभूत ${current.apparentTemperature}°C)`;
    } else if (targetLang === "mr") {
      reply = `${targetDayLabel} ${cityName} मध्ये कमाल तापमान **${peakHourStr} वाजता (${peakTemp}°C)** आणि किमान तापमान **${minHourStr} वाजता (${minTemp}°C)** राहण्याचा अंदाज आहे.`;
    } else {
      reply = `${targetDayLabel} in ${cityName}, the temperature will peak at approximately **${peakTemp}°C around ${peakHourStr}**, with the overnight low reaching **${minTemp}°C around ${minHourStr}**.\n\n` +
        `• **Projected High:** **${peakTemp}°C** (${peakHourStr})\n` +
        `• **Projected Low:** **${minTemp}°C** (${minHourStr})\n` +
        `• **Current Reading:** ${current.temperature}°C (feels like ${current.apparentTemperature}°C)`;
    }

    return {
      reply,
      directConclusion: `Peak temperature ${peakTemp}°C around ${peakHourStr}`,
      evidence: {
        intent: parsed.intent,
        resolvedLocation: `${cityName}, ${city.stateEn}`,
        targetWindow: `${targetDayLabel} (${peakHourStr})`,
        weatherVariable: "Temperature & Hourly Peak",
        keyMetrics: {
          peakTemp: `${peakTemp}°C`,
          peakHour: peakHourStr,
          minTemp: `${minTemp}°C`,
          minHour: minHourStr,
        },
        source: "Open-Meteo Hourly Forecast",
        timestamp: nowIso,
      },
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 8. RAIN PROBABILITY & AMOUNT (General Rain query)
  // ─────────────────────────────────────────────────────────────
  if (parsed.intent === "rain_probability_amount") {
    const rainChance = targetDaily.precipitationProbabilityMax ?? 0;
    const rainMm = targetDaily.precipitationSum ?? 0;
    const currentRain = current.precipitation || 0;

    let reply = "";
    if (targetLang === "hinglish") {
      reply = `${targetDayLabel} ${cityName} me rain probability **${rainChance}%** hai aur kul anumanit barish **${rainMm} mm** hai. ${
        rainChance >= 50
          ? "Barish hone ke kafi achhe chances hain, isliye bahar nikalte waqt umbrella sath rakhein."
          : rainChance >= 25
          ? "Halki boondabaandi ya aakash me badal hone ki sambhavna hai."
          : "Bhari barish ka koi sanket nahi hai; din samanya bana rahega."
      }`;
    } else if (targetLang === "hi") {
      reply = `${targetDayLabel} ${cityName} में वर्षा की अधिकतम संभावना **${rainChance}%** है और अनुमानित वर्षा **${rainMm} मिमी** है। ${
        rainChance >= 50
          ? "वर्षा की अच्छी संभावना है, बाहर निकलते समय छाता साथ रखना उचित रहेगा।"
          : rainChance >= 25
          ? "हल्की बूंदाबांदी या बादलों की आवाजाही संभव है।"
          : "भारी वर्षा की कोई आशंका नहीं है; मौसम सामान्य बना रहेगा।"
      }`;
    } else if (targetLang === "mr") {
      reply = `${targetDayLabel} ${cityName} मध्ये पावसाची संभाव्यता **${rainChance}%** आणि एकूण अंदाजित पाऊस **${rainMm} मिमी** आहे.`;
    } else {
      reply = `${targetDayLabel} in ${cityName}, the maximum rain probability is **${rainChance}%** with an estimated total accumulation of **${rainMm} mm**. ${
        rainChance >= 50
          ? "Rain is likely; carrying rain protection is advisable."
          : rainChance >= 25
          ? "Passing light showers or cloud cover are possible."
          : "No significant rainfall expected under current forecast models."
      }`;
    }

    return {
      reply,
      directConclusion: `Rain probability ${rainChance}%, expected ${rainMm} mm`,
      evidence: {
        intent: "rain_probability_amount",
        resolvedLocation: `${cityName}, ${city.stateEn}`,
        targetWindow: targetDayLabel,
        weatherVariable: "Precipitation Probability & Sum",
        keyMetrics: {
          probabilityMax: `${rainChance}%`,
          precipitationSumMm: rainMm,
          currentPrecipitationMm: currentRain,
        },
        source: "Open-Meteo Daily & Current Telemetry",
        timestamp: nowIso,
      },
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 9. WIND & GUST INTENT
  // ─────────────────────────────────────────────────────────────
  if (parsed.intent === "wind_gust") {
    const hoursToScan = targetHours.length > 0 ? targetHours : hourly.slice(0, 24);
    let maxWindItem = hoursToScan[0];
    for (const h of hoursToScan) {
      if ((h.windSpeed || 0) > (maxWindItem.windSpeed || 0)) maxWindItem = h;
    }

    const maxSpeed = maxWindItem?.windSpeed ?? current.windSpeed;
    const maxGust = maxWindItem?.windGusts ?? current.windGusts;
    const peakHour = maxWindItem?.time ? formatHour12(maxWindItem.time) : "N/A";

    let reply = "";
    if (targetLang === "hinglish") {
      reply = `${targetDayLabel} ${cityName} me hawa ki gati lagbhag **${maxSpeed} km/h** rehne ka anuman hai, jisme peak gusts **${maxGust} km/h** tak ja sakte hain (${peakHour} ke aas-paas). ${
        maxSpeed >= 25
          ? "Tez hawaon ke jhonke chal sakte hain, do-pahiya chalate samay savdhani bartein."
          : "Hawa ki gati samanya aur shant rahegi."
      }`;
    } else if (targetLang === "hi") {
      reply = `${targetDayLabel} ${cityName} में हवा की गति लगभग **${maxSpeed} km/h** रहने का अनुमान है और झोंके **${maxGust} km/h** तक पहुँच सकते हैं (${peakHour})। ${
        maxSpeed >= 25 ? "हवाएं तेज रह सकती हैं, बाहरी गतिविधियों में सावधानी बरतें।" : "हवा की स्थिति सामान्य व नियंत्रित है।"
      }`;
    } else if (targetLang === "mr") {
      reply = `${targetDayLabel} ${cityName} मध्ये वाऱ्याचा वेग सुमारे **${maxSpeed} km/h** आणि कमाल झोत **${maxGust} km/h** राहण्याची शक्यता आहे.`;
    } else {
      reply = `${targetDayLabel} in ${cityName}, sustained wind speeds are projected around **${maxSpeed} km/h** with peak gusts reaching **${maxGust} km/h** (near ${peakHour}). Conditions will be ${
        maxSpeed >= 25 ? "moderately breezy with noticeable gusts." : "calm to gentle."
      }`;
    }

    return {
      reply,
      directConclusion: `Wind ${maxSpeed} km/h, Gusts ${maxGust} km/h`,
      evidence: {
        intent: "wind_gust",
        resolvedLocation: `${cityName}, ${city.stateEn}`,
        targetWindow: `${targetDayLabel} (${peakHour})`,
        weatherVariable: "Wind Speed & Gust Velocity",
        keyMetrics: {
          sustainedSpeed: `${maxSpeed} km/h`,
          peakGust: `${maxGust} km/h`,
          peakHour,
        },
        source: "Open-Meteo Hourly Forecast",
        timestamp: nowIso,
      },
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 10. HUMIDITY & MOISTURE INTENT: "humidity kitni hai"
  // ─────────────────────────────────────────────────────────────
  if (parsed.intent === "humidity") {
    const hum = current.relativeHumidity;
    const cloud = current.cloudCover;

    let reply = "";
    if (targetLang === "hinglish") {
      reply = `${cityName} me vartaman sapeksh aadrata (relative humidity) **${hum}%** hai aur badal aavaran (cloud cover) lagbhag **${cloud}%** hai. ${
        hum >= 75
          ? "Hawa me kafi nami hai, chipchipahat ya barish jaisa anubhav ho sakta hai."
          : hum <= 30
          ? "Hawa shushk (dry) hai, paryapt pani pite rahein."
          : "Nami ka star samanya aur santulit hai."
      }`;
    } else if (targetLang === "hi") {
      reply = `${cityName} में वर्तमान सापेक्ष आर्द्रता **${hum}%** है और बादल आवरण **${cloud}%** दर्ज किया गया है। ${
        hum >= 75 ? "हवा में उच्च नमी है।" : "आर्द्रता का स्तर सामान्य व संतुलित है।"
      }`;
    } else {
      reply = `The relative humidity in ${cityName} is currently **${hum}%** with approximately **${cloud}%** cloud cover. Atmospheric moisture is ${
        hum >= 75 ? "high and humid." : hum <= 30 ? "dry." : "within comfortable seasonal bounds."
      }`;
    }

    return {
      reply,
      directConclusion: `Humidity ${hum}%, Cloud cover ${cloud}%`,
      evidence: {
        intent: "humidity",
        resolvedLocation: `${cityName}, ${city.stateEn}`,
        targetWindow: "Current",
        weatherVariable: "Relative Humidity & Cloud Cover",
        keyMetrics: {
          humidityPercent: hum,
          cloudCoverPercent: cloud,
        },
        source: "Open-Meteo Current Telemetry",
        timestamp: nowIso,
      },
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 11. SKY & SUNSHINE INTENT
  // ─────────────────────────────────────────────────────────────
  if (parsed.intent === "sky_sunshine") {
    const cloud = current.cloudCover;
    let reply = "";

    if (cloud <= 25) {
      reply =
        targetLang === "hinglish"
          ? `${targetDayLabel} ${cityName} me aasman mukhya roop se saaf rahega aur achhi dhoop niklegi (cloud cover matra ${cloud}%). Din me dhoop khili rahegi.`
          : targetLang === "hi"
          ? `${targetDayLabel} ${cityName} में आसमान मुख्य रूप से साफ रहेगा और अच्छी धूप खिली रहेगी (बादल मात्र ${cloud}%)।`
          : `${targetDayLabel} in ${cityName}, skies are predominantly clear with plenty of direct sunshine (${cloud}% cloud cover).`;
    } else if (cloud <= 70) {
      reply =
        targetLang === "hinglish"
          ? `${targetDayLabel} ${cityName} me aanshik badal chhaye rahenge (${cloud}% cloud cover). Beech-beech me dhoop aur chhaon ki aawajahi bani rahegi.`
          : targetLang === "hi"
          ? `${targetDayLabel} ${cityName} में आंशिक बादल छाए रहेंगे (${cloud}%)। धूप और बादलों की आवाजाही बनी रहेगी।`
          : `${targetDayLabel} in ${cityName}, expect partly cloudy skies (${cloud}% cloud cover) with intermittent intervals of sunshine.`;
    } else {
      reply =
        targetLang === "hinglish"
          ? `${targetDayLabel} ${cityName} me ghane badal chhaye rahenge (${cloud}% cloud cover). Direct dhoop nikalne ke chances kam hain.`
          : targetLang === "hi"
          ? `${targetDayLabel} ${cityName} में घने बादल छाए रहेंगे (${cloud}%)। सीधी धूप निकलने की संभावना सीमित रहेगी।`
          : `${targetDayLabel} in ${cityName}, overcast conditions dominate with ${cloud}% cloud cover; sunshine will be limited.`;
    }

    return {
      reply,
      directConclusion: `Cloud cover ${cloud}%`,
      evidence: {
        intent: "sky_sunshine",
        resolvedLocation: `${cityName}, ${city.stateEn}`,
        targetWindow: targetDayLabel,
        weatherVariable: "Cloud Cover & Sunshine",
        keyMetrics: { cloudCoverPercent: cloud },
        source: "Open-Meteo Telemetry",
        timestamp: nowIso,
      },
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 12. MULTI-DAY SUMMARY: "agle 3 din", "next week", "weekend"
  // ─────────────────────────────────────────────────────────────
  if (parsed.intent === "multi_day_summary") {
    const numDays = parsed.timeSlot.multiDayCount || (parsed.timeSlot.isWeekend ? 2 : 5);
    const daySlice = daily.slice(0, numDays);
    const totalRain = Math.round(daySlice.reduce((s, d) => s + (d.precipitationSum || 0), 0) * 10) / 10;
    const maxT = Math.max(...daySlice.map((d) => d.tempMax));
    const minT = Math.min(...daySlice.map((d) => d.tempMin));

    const wettestDay = daySlice.reduce(
      (p, c) => ((c.precipitationSum || 0) > (p.precipitationSum || 0) ? c : p),
      daySlice[0]
    );

    let reply = "";
    if (targetLang === "hinglish") {
      reply = `📅 **${cityName} ke liye agle ${numDays} dinon ka forecast:**\n\n` +
        `• **Temperature Range:** Maximum **${maxT}°C** | Minimum **${minT}°C**\n` +
        `• **Kul Anumanit Baarish:** **${totalRain} mm**\n` +
        `• **Sabse Zyada Baarish Wala Din:** ${wettestDay?.date || "N/A"} (${wettestDay?.precipitationSum || 0} mm, chance ${wettestDay?.precipitationProbabilityMax || 0}%)\n` +
        `Agle ${numDays} dinon me mausam samanya roop se ${totalRain >= 25 ? "varsha prabhavit" : "anukool wa shant"} rehne ka anuman hai.`;
    } else if (targetLang === "hi") {
      reply = `📅 **${cityName} के लिए आगामी ${numDays} दिनों का मौसम परिदृश्य:**\n\n` +
        `• **तापमान सीमा:** अधिकतम **${maxT}°C** | न्यूनतम **${minT}°C**\n` +
        `• **कुल अनुमानित वर्षा:** **${totalRain} मिमी**\n` +
        `• **सर्वाधिक वर्षा का दिन:** ${wettestDay?.date || "आगामी दिन"} (${wettestDay?.precipitationSum || 0} मिमी)\n` +
        `आगामी ${numDays} दिनों में मौसम सामान्यतः ${totalRain >= 25 ? "वर्षा प्रभावित" : "संतुलित एवं अनुकूल"} रहने का अनुमान है।`;
    } else {
      reply = `📅 **${numDays}-Day Weather Outlook for ${cityName}:**\n\n` +
        `• **Temperature Bounds:** High **${maxT}°C** | Low **${minT}°C**\n` +
        `• **Cumulative Precipitation:** **${totalRain} mm**\n` +
        `• **Wettest Day:** ${wettestDay?.date || "N/A"} (${wettestDay?.precipitationSum || 0} mm, ${wettestDay?.precipitationProbabilityMax || 0}% prob)\n` +
        `Overall pattern appears ${totalRain >= 25 ? "unsettled with precipitation" : "generally stable"}.`;
    }

    return {
      reply,
      directConclusion: `${numDays}-day rain ${totalRain} mm, temp ${minT}°C - ${maxT}°C`,
      evidence: {
        intent: "multi_day_summary",
        resolvedLocation: `${cityName}, ${city.stateEn}`,
        targetWindow: `Next ${numDays} Days`,
        weatherVariable: "Cumulative Rain & Temperature Range",
        keyMetrics: {
          days: numDays,
          cumulativeRainMm: totalRain,
          highestTemp: `${maxT}°C`,
          lowestTemp: `${minT}°C`,
        },
        source: "Open-Meteo Multi-Day Model",
        timestamp: nowIso,
      },
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 13. FLOOD & WATERLOGGING INTENT: "badh", "jalbharav", "4-5 din barish"
  // ─────────────────────────────────────────────────────────────
  if (parsed.intent === "flood_inundation") {
    const next5Days = daily.slice(0, 5);
    const sum5d = Math.round(next5Days.reduce((s, d) => s + (d.precipitationSum || 0), 0) * 10) / 10;
    const peakDay = next5Days.reduce((p, c) => ((c.precipitationSum || 0) > (p.precipitationSum || 0) ? c : p), next5Days[0]);

    let reply = "";
    if (targetLang === "hinglish") {
      reply = `🌊 **${cityName} me Baarish wa Jalbhaaraav (Waterlogging) Jokhim:**\n\n` +
        `• **Mukhy Nishkarsh:** ${
          sum5d >= 40
            ? `Agle 5 dinon me kul lagbhag **${sum5d} mm** barish anumanit hai, jisse nichle ilakon me jalbhaaraav (waterlogging) ho sakta hai.`
            : `Open-Meteo atmospheric models ke anusaar agle 5 dinon me gambhir baadh ya jalbhaaraav ka koi sakriya sanket nahi hai (5 dinon me kul anumanit barish matra ${sum5d} mm hai).`
        }\n\n` +
        `• **5-Day Telemetry Breakdown:**\n` +
        `- 5 Dinon ki Kul Baarish: **${sum5d} mm**\n` +
        `- Sabse Zyada Barish Wala Din: ${peakDay?.date || "N/A"} (${peakDay?.precipitationSum || 0} mm, ${peakDay?.precipitationProbabilityMax || 0}% chance)\n\n` +
        `• **Hydrological Limitation:** GaganDrishti Open-Meteo vayumandaliya barish model par aadharit hai. Nadiyon ke jal-star ya baandh (dam release) ke aadhikarik updates ke liye CWC / SDMA bulletin dekhein.`;
    } else if (targetLang === "hi") {
      reply = `🌊 **${cityName} में वर्षा एवं बाढ़/जलभराव जोखिम विश्लेषण:**\n\n` +
        `• **मुख्य निष्कर्ष:** ${
          sum5d >= 40
            ? `आगामी 5 दिनों में कुल लगभग **${sum5d} मिमी** वर्षा संभावित है, जिससे निचले इलाकों में जलभराव हो सकता है।`
            : `ओपन-मेटियो मॉडल के अनुसार आगामी 5 दिनों में गंभीर बाढ़ का कोई सक्रिय संकेतक नहीं है (कुल वर्षा मात्र ${sum5d} मिमी है)।`
        }\n` +
        `• **5 दिनों का पूर्वानुमान:** कुल वर्षा **${sum5d} मिमी**, सर्वाधिक वर्षा का दिन: ${peakDay?.date || "आगामी दिन"}\n` +
        `• **सीमाएं:** नदियों के जलस्तर व बांध निकासी की आधिकारिक जानकारी हेतु CWC / SDMA देखें।`;
    } else {
      reply = `🌊 **Precipitation & Inundation / Flood Assessment for ${cityName}:**\n\n` +
        `• **Core Finding:** ${
          sum5d >= 40
            ? `Cumulative 5-day precipitation is projected at **${sum5d} mm**, indicating potential localized waterlogging in low-lying sectors.`
            : `Forecast models show no severe flooding precipitation triggers over the next 5 days (cumulative rain is ${sum5d} mm).`
        }\n` +
        `• **5-Day Outlook:** Total precipitation: **${sum5d} mm**, peak day: ${peakDay?.date} (${peakDay?.precipitationSum} mm).\n` +
        `• **Hydrological Note:** GaganDrishti models atmospheric rain only; consult CWC / SDMA for river level monitoring.`;
    }

    return {
      reply,
      directConclusion: `5-day rain: ${sum5d} mm`,
      evidence: {
        intent: "flood_inundation",
        resolvedLocation: `${cityName}, ${city.stateEn}`,
        targetWindow: "Next 5 Days",
        weatherVariable: "Multi-Day Inundation & Precipitation Sum",
        keyMetrics: {
          cumulative5DayMm: sum5d,
          peakDayDate: peakDay?.date || "N/A",
          peakDayMm: peakDay?.precipitationSum || 0,
        },
        source: "Open-Meteo Multi-Day NWP Model",
        timestamp: nowIso,
      },
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 14. GENERAL SUMMARY (Default / "aaj mausam kaisa hai" / "kal mausam kaisa rhega")
  // ─────────────────────────────────────────────────────────────
  const maxT = targetDaily.tempMax;
  const minT = targetDaily.tempMin;
  const rainProb = targetDaily.precipitationProbabilityMax ?? 0;
  const rainMm = targetDaily.precipitationSum ?? 0;
  const condEn = targetDaily.conditionEn || current.conditionEn;
  const condHi = targetDaily.conditionHi || current.conditionHi;

  let reply = "";
  if (targetLang === "hinglish") {
    reply = `🌤️ **${targetDayLabel} ${cityName} me mausam ka hal:**\n\n` +
      `• **Condition:** ${condEn} (${condHi}), vartaman temperature **${current.temperature}°C** (feels like ${current.apparentTemperature}°C)\n` +
      `• **Taapman Range:** Maximum **${maxT}°C** | Minimum **${minT}°C**\n` +
      `• **Baarish ki Sambhavna:** **${rainProb}%** (${rainMm > 0 ? `${rainMm} mm anumanit` : "kam risk"})\n` +
      `• **Hawa wa Nami:** Hawa **${current.windSpeed} km/h** (jhoke ${current.windGusts} km/h tak), humidity **${current.relativeHumidity}%**\n` +
      `Mausam samanya roop se ${rainProb >= 50 ? "nam aur barish prabhavit" : "anukool"} bana rahega.`;
  } else if (targetLang === "hi") {
    reply = `🌤️ **${targetDayLabel} ${cityName} में मौसम का हाल:**\n\n` +
      `• **स्थिति:** ${condHi}, वर्तमान तापमान **${current.temperature}°C** (अनुभूत ${current.apparentTemperature}°C)\n` +
      `• **तापमान विस्तार:** अधिकतम **${maxT}°C** | न्यूनतम **${minT}°C**\n` +
      `• **वर्षा की संभावना:** **${rainProb}%** (${rainMm > 0 ? `${rainMm} मिमी अनुमानित` : "न्यूनतम जोखिम"})\n` +
      `• **हवा व आर्द्रता:** **${current.windSpeed} km/h** (झोंके ${current.windGusts} km/h तक), नमी **${current.relativeHumidity}%**\n` +
      `दैनिक गतिविधियों के लिए मौसम सामान्यतः ${rainProb >= 50 ? "वर्षा प्रभावित" : "अनुकूल"} रहेगा।`;
  } else if (targetLang === "mr") {
    reply = `🌤️ **${targetDayLabel} ${cityName} मध्ये हवामानाचा अंदाज:**\n\n` +
      `• **स्थिती:** तापमान **${current.temperature}°C**, कमाल **${maxT}°C**, किमान **${minT}°C**\n` +
      `• **पाऊस संभाव्यता:** **${rainProb}%** (${rainMm} मिमी)`;
  } else {
    reply = `🌤️ **${targetDayLabel}'s Weather Summary for ${cityName}:**\n\n` +
      `• **Condition:** ${condEn}, Current temperature **${current.temperature}°C** (feels like ${current.apparentTemperature}°C)\n` +
      `• **Temperature Range:** High **${maxT}°C** | Low **${minT}°C**\n` +
      `• **Rain Probability:** **${rainProb}%** (${rainMm > 0 ? `${rainMm} mm expected` : "low probability"})\n` +
      `• **Wind & Humidity:** **${current.windSpeed} km/h** (gusts up to ${current.windGusts} km/h), Humidity **${current.relativeHumidity}%**\n` +
      `Conditions are generally ${rainProb >= 50 ? "unsettled with rain potential" : "favourable"}.`;
  }

  return {
    reply,
    directConclusion: `${condEn}, High ${maxT}°C, Rain ${rainProb}%`,
    evidence: {
      intent: "general_summary",
      resolvedLocation: `${cityName}, ${city.stateEn}`,
      targetWindow: targetDayLabel,
      weatherVariable: "Multi-Factor Weather Summary",
      keyMetrics: {
        currentTemp: `${current.temperature}°C`,
        maxTemp: `${maxT}°C`,
        minTemp: `${minT}°C`,
        rainProbMax: `${rainProb}%`,
        windSpeed: `${current.windSpeed} km/h`,
      },
      source: "Open-Meteo Current & Daily Telemetry",
      timestamp: nowIso,
    },
  };
}

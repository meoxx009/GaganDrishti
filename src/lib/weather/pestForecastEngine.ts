import {
  DayForecastSnapshot,
  PestForecastInput,
  PestForecastOutput,
  PredictedPestDiseaseAlert,
  PestDiseaseTriggerRecord,
} from "./pestForecastTypes";
import { getTriggersByCrop } from "./pestTriggersDatabase";

/**
 * Format a human-readable date label from ISO date or day offset
 */
function formatDateLabel(dateIso: string, dayIndex: number): string {
  try {
    const d = new Date(dateIso);
    if (!isNaN(d.getTime())) {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const dayName = days[d.getDay()];
      const monthName = months[d.getMonth()];
      const dateNum = d.getDate();
      return `Day ${dayIndex + 1} (${dayName}, ${monthName} ${dateNum})`;
    }
  } catch {
    // fallback
  }
  return `Day ${dayIndex + 1}`;
}

/**
 * Normalized crop name mapping
 */
function normalizeCropName(rawCrop: string): { en: string; hi: string } {
  const c = (rawCrop || "").toLowerCase().trim();
  if (c.includes("soy") || c.includes("सोया")) return { en: "Soybean", hi: "सोयाबीन" };
  if (c.includes("paddy") || c.includes("rice") || c.includes("धान") || c.includes("चावल")) return { en: "Paddy", hi: "धान (चावल)" };
  if (c.includes("wheat") || c.includes("गेहूं") || c.includes("गेहूँ")) return { en: "Wheat", hi: "गेहूँ" };
  if (c.includes("chickpea") || c.includes("gram") || c.includes("चना")) return { en: "Chickpea", hi: "चना" };
  if (c.includes("maize") || c.includes("corn") || c.includes("मक्का")) return { en: "Maize", hi: "मक्का" };
  if (c.includes("cotton") || c.includes("कपास")) return { en: "Cotton", hi: "कपास" };
  return { en: rawCrop || "Crop", hi: rawCrop || "फसल" };
}

/**
 * Evaluates whether a daily forecast snapshot matches trigger conditions
 */
function evaluateDayMatch(
  day: DayForecastSnapshot,
  trigger: PestDiseaseTriggerRecord
): { matches: boolean; tempMatches: boolean; humidityMatches: boolean; rainMatches: boolean } {
  // Temperature check: average temp inside bounds or range overlap
  const tempMatches =
    (day.tempAvg >= trigger.trigger_temperature_min - 2 && day.tempAvg <= trigger.trigger_temperature_max + 2) ||
    (day.tempMax >= trigger.trigger_temperature_min && day.tempMin <= trigger.trigger_temperature_max);

  // Humidity check: humidity within trigger range (with 5% buffer)
  const humidityMatches =
    day.humidityAvg >= trigger.trigger_humidity_min - 5 &&
    day.humidityAvg <= trigger.trigger_humidity_max + 10;

  // Rain check: if rainfall needed, check precipitation or rain probability
  let rainMatches = true;
  if (trigger.trigger_rainfall_needed) {
    const requiredMm = trigger.trigger_rainfall_mm ?? 1.0;
    rainMatches = day.precipitationMm >= requiredMm || day.rainProbability >= 40;
  }

  // Wind speed check (if specified)
  let windMatches = true;
  if (trigger.trigger_wind_speed) {
    windMatches = day.windSpeed >= trigger.trigger_wind_speed - 5;
  }

  const matches = tempMatches && humidityMatches && rainMatches && windMatches;
  return { matches, tempMatches, humidityMatches, rainMatches };
}

/**
 * Main function: Predicts upcoming pest and disease outbreaks for the next 7 days
 */
export function getPestForecast(input: PestForecastInput): PestForecastOutput {
  const cropMeta = normalizeCropName(input.crop_name);
  const triggers = getTriggersByCrop(cropMeta.en);

  const dailyForecast = input.daily_forecast && input.daily_forecast.length > 0
    ? input.daily_forecast
    : [];

  const predictedAlerts: PredictedPestDiseaseAlert[] = [];
  const dailyRiskPestCounts: { [dayIndex: number]: { count: number; maxSeverityRank: number } } = {};

  // Initialize timeline day trackers
  for (let i = 0; i < Math.max(dailyForecast.length, 7); i++) {
    dailyRiskPestCounts[i] = { count: 0, maxSeverityRank: 0 };
  }

  const severityWeightMap = {
    Low: 1,
    Medium: 2,
    High: 3,
    Critical: 4,
  };

  const severityRankMap = {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    CRITICAL: 4,
  };

  const stageInputStr = String(input.crop_stage || "").toLowerCase();

  for (const trigger of triggers) {
    let matchingDaysCount = 0;
    let firstMatchingDay: DayForecastSnapshot | null = null;
    const matchingDayIndices: number[] = [];

    // Stage factor multiplier
    let stageMultiplier = 1.0;
    if (stageInputStr && trigger.crop_stage_vulnerable !== "All") {
      const stageVuln = trigger.crop_stage_vulnerable.toLowerCase();
      if (stageVuln.includes(stageInputStr) || stageInputStr.includes(stageVuln)) {
        stageMultiplier = 1.25;
      } else {
        stageMultiplier = 0.85;
      }
    }

    // Evaluate each forecast day
    dailyForecast.forEach((day) => {
      const evaluation = evaluateDayMatch(day, trigger);
      if (evaluation.matches) {
        matchingDaysCount++;
        matchingDayIndices.push(day.dayIndex);
        if (!firstMatchingDay) {
          firstMatchingDay = day;
        }
      }
    });

    // Check if trigger meets threshold:
    // If matching days >= 2, or >= 1 for Critical/High severity diseases
    const isCriticalOrHigh = trigger.risk_severity === "Critical" || trigger.risk_severity === "High";
    const thresholdMet = matchingDaysCount >= 2 || (isCriticalOrHigh && matchingDaysCount >= 1);

    if (thresholdMet && firstMatchingDay) {
      const onsetDay = firstMatchingDay as DayForecastSnapshot;
      const severityWeight = severityWeightMap[trigger.risk_severity] || 2;
      
      // Calculate risk score: 0 to 100
      const daysRatio = matchingDaysCount / Math.max(dailyForecast.length, 1);
      const rawScore = daysRatio * 100 * (severityWeight / 3.0) * stageMultiplier;
      const normalizedScore = Math.min(100, Math.max(10, Math.round(rawScore)));

      let riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "LOW";
      if (normalizedScore >= 70 || (trigger.risk_severity === "Critical" && matchingDaysCount >= 2)) {
        riskLevel = "CRITICAL";
      } else if (normalizedScore >= 45 || trigger.risk_severity === "High") {
        riskLevel = "HIGH";
      } else if (normalizedScore >= 25 || trigger.risk_severity === "Medium") {
        riskLevel = "MEDIUM";
      }

      // Calculate confidence percentage (e.g. 70% to 94%)
      const confidencePct = Math.min(
        95,
        Math.max(65, 60 + matchingDaysCount * 6 + (trigger.risk_severity === "Critical" ? 10 : 5))
      );

      const dateLabel = formatDateLabel(onsetDay.dateIso, onsetDay.dayIndex);

      const whyTriggeredEn = `Forecast detects favorable conditions over ${matchingDaysCount} day(s): Avg Temp ${Math.round(
        onsetDay.tempAvg
      )}°C (Trigger: ${trigger.trigger_temperature_min}-${trigger.trigger_temperature_max}°C), Humidity ~${Math.round(
        onsetDay.humidityAvg
      )}% (Trigger: ${trigger.trigger_humidity_min}-${trigger.trigger_humidity_max}%)${
        trigger.trigger_rainfall_needed ? `, Rainfall: ${onsetDay.precipitationMm.toFixed(1)}mm` : ""
      }.`;

      const whyTriggeredHi = `पूर्वानुमान में ${matchingDaysCount} दिन अनुकूल दशाएं: औसत तापमान ${Math.round(
        onsetDay.tempAvg
      )}°C (अनुकूल दायरा: ${trigger.trigger_temperature_min}-${trigger.trigger_temperature_max}°C), आर्द्रता ~${Math.round(
        onsetDay.humidityAvg
      )}%${trigger.trigger_rainfall_needed ? `, वर्षा: ${onsetDay.precipitationMm.toFixed(1)}mm` : ""}।`;

      // Update daily timeline tallies
      matchingDayIndices.forEach((dIdx) => {
        if (dailyRiskPestCounts[dIdx]) {
          dailyRiskPestCounts[dIdx].count++;
          const curRank = severityRankMap[riskLevel];
          if (curRank > dailyRiskPestCounts[dIdx].maxSeverityRank) {
            dailyRiskPestCounts[dIdx].maxSeverityRank = curRank;
          }
        }
      });

      predictedAlerts.push({
        trigger_id: trigger.trigger_id,
        pest_disease_name: trigger.pest_disease_name,
        pest_disease_name_hi: trigger.pest_disease_name_hi,
        type: trigger.type,
        risk_level: riskLevel,
        confidence_pct: confidencePct,
        predicted_onset_day: onsetDay.dayIndex,
        predicted_date_label: dateLabel,
        why_triggered: whyTriggeredEn,
        why_triggered_hi: whyTriggeredHi,
        vulnerable_stage: trigger.crop_stage_vulnerable,
        symptoms_to_watch: trigger.description,
        symptoms_to_watch_hi: trigger.description_hi,
        preventive_action: [
          trigger.preventive_measure,
          `Action urgency: ${trigger.action_urgency}`,
        ],
        preventive_action_hi: [
          trigger.preventive_measure_hi,
          `कार्रवाई समय सीमा: ${trigger.action_urgency}`,
        ],
        control_if_seen: trigger.control_measure,
        control_if_seen_hi: trigger.control_measure_hi,
        recommended_chemicals: trigger.recommended_pesticide_disease,
        action_urgency: trigger.action_urgency,
        action_window: trigger.action_urgency === "Immediate" ? "Next 24-48 Hours" : "Next 3-7 Days",
      });
    }
  }

  // Sort alerts by risk severity rank descending, then confidence descending
  predictedAlerts.sort((a, b) => {
    const diff = severityRankMap[b.risk_level] - severityRankMap[a.risk_level];
    if (diff !== 0) return diff;
    return b.confidence_pct - a.confidence_pct;
  });

  // Build daily timeline
  const dailyRiskTimeline = dailyForecast.map((day) => {
    const tracker = dailyRiskPestCounts[day.dayIndex] || { count: 0, maxSeverityRank: 0 };
    let riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "LOW";
    if (tracker.maxSeverityRank >= 4) riskLevel = "CRITICAL";
    else if (tracker.maxSeverityRank >= 3) riskLevel = "HIGH";
    else if (tracker.maxSeverityRank >= 2) riskLevel = "MEDIUM";

    return {
      dayIndex: day.dayIndex,
      dateLabel: formatDateLabel(day.dateIso, day.dayIndex),
      riskLevel,
      activePestsCount: tracker.count,
    };
  });

  // Calculate overall risk
  let overallRisk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "LOW";
  if (predictedAlerts.length > 0) {
    const topAlertRisk = predictedAlerts[0].risk_level;
    overallRisk = topAlertRisk;
  }

  // Generate overall bilingual summary recommendation
  let overallRecEn = "";
  let overallRecHi = "";

  if (predictedAlerts.length === 0) {
    overallRecEn = `Weather over the next 7 days does not indicate elevated outbreaks of major pests or diseases for ${cropMeta.en}. Maintain routine field scouting and standard cultural practices.`;
    overallRecHi = `आगामी 7 दिनों के मौसम में ${cropMeta.hi} के लिए किसी गंभीर कीट या रोग के प्रकोप के लक्षण नहीं हैं। नियमित खेत निरीक्षण बनाए रखें।`;
  } else {
    const highAlerts = predictedAlerts.filter(a => a.risk_level === "CRITICAL" || a.risk_level === "HIGH");
    const countStr = highAlerts.length > 0 ? `${highAlerts.length} high/critical risk threat(s)` : `${predictedAlerts.length} potential threat(s)`;
    const topThreat = predictedAlerts[0];
    
    overallRecEn = `Weather triggers detect ${countStr} for ${cropMeta.en}, led by ${topThreat.pest_disease_name} around ${topThreat.predicted_date_label}. Take proactive preventive measures before onset to protect crop yield.`;
    overallRecHi = `मौसम पूर्वानुमान अनुसार ${cropMeta.hi} में ${topThreat.pest_disease_name_hi} सहित ${countStr} की संभावना है (${topThreat.predicted_date_label} के आसपास)। फसल सुरक्षा हेतु समय पूर्व निवारक उपाय करें।`;
  }

  const stageDisplayEn = input.crop_stage ? String(input.crop_stage) : "All Stages";
  const stageDisplayHi = input.crop_stage ? String(input.crop_stage) : "सभी अवस्थाएँ";

  const firstDay = dailyForecast[0]?.dateIso || "Today";
  const lastDay = dailyForecast[dailyForecast.length - 1]?.dateIso || "Day 7";
  const forecastPeriod = `${firstDay} to ${lastDay}`;

  return {
    crop: cropMeta.en,
    crop_hi: cropMeta.hi,
    stage: stageDisplayEn,
    stage_hi: stageDisplayHi,
    forecast_period: forecastPeriod,
    overall_risk: overallRisk,
    overall_recommendation: overallRecEn,
    overall_recommendation_hi: overallRecHi,
    predicted_alerts: predictedAlerts,
    daily_risk_timeline: dailyRiskTimeline,
  };
}

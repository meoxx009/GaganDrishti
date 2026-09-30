import { City } from "@/lib/types";
import { CITIES } from "@/lib/cities";
import { NormalizedWeatherData } from "./types";
import { fetchCityWeather } from "./weatherService";
import { evaluateWeatherRisks } from "./riskEngine";
import { RiskAssessmentResult, RiskLevel } from "./riskTypes";

export type MapTierLevel = "HIGH" | "SIGNIFICANT" | "MODERATE" | "LOW" | "UNAVAILABLE";

export interface CityRiskPoint {
  city: City;
  weather: NormalizedWeatherData | null;
  riskResult: RiskAssessmentResult;
  riskLevel: RiskLevel;
  tierLevel: MapTierLevel;
  riskColor: string;
  fillColor: string;
  temp: number;
  rainProb: number;
  windSpeed: number;
  windGusts: number;
  precipitation: number;
  conditionEn: string;
  conditionHi: string;
  evaluatedAt: string;
  primaryReasonEn: string;
  primaryReasonHi: string;
  forecastMetricEn: string;
  forecastMetricHi: string;
  timeframeEn: string;
  timeframeHi: string;
}

// In-memory cache for map telemetry
let cachedMapRisks: { timestamp: number; data: CityRiskPoint[] } | null = null;
const MAP_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

export async function fetchAllCitiesRisk(forceRefresh: boolean = false): Promise<CityRiskPoint[]> {
  if (!forceRefresh && cachedMapRisks && Date.now() - cachedMapRisks.timestamp < MAP_CACHE_TTL_MS) {
    return cachedMapRisks.data;
  }

  const results = await Promise.allSettled(
    CITIES.map((city) => fetchCityWeather(city, forceRefresh))
  );

  const points: CityRiskPoint[] = CITIES.map((city, idx) => {
    const res = results[idx];
    const weather = res.status === "fulfilled" ? res.value : null;

    if (!weather || !weather.current) {
      return {
        city,
        weather: null,
        riskResult: {
          overallLevel: "LOW",
          risks: [],
          hasSignificantRisk: false,
          evaluatedAt: new Date().toISOString(),
        },
        riskLevel: "LOW",
        tierLevel: "UNAVAILABLE",
        riskColor: "#94A3B8", // Slate / Gray
        fillColor: "#94A3B833",
        temp: 0,
        rainProb: 0,
        windSpeed: 0,
        windGusts: 0,
        precipitation: 0,
        conditionEn: "Telemetry Unavailable",
        conditionHi: "डेटा अनुपलब्ध",
        evaluatedAt: new Date().toISOString(),
        primaryReasonEn: "Live telemetry feed currently offline or unreachable.",
        primaryReasonHi: "लाइव मौसम टेलीमेट्री फ़ीड वर्तमान में ऑफ़लाइन है।",
        forecastMetricEn: "N/A",
        forecastMetricHi: "उपलब्ध नहीं",
        timeframeEn: "Current",
        timeframeHi: "वर्तमान",
      };
    }

    const current = weather.current;
    const next24h = weather.hourly?.slice(0, 24) || [];
    const maxRainProb = next24h.reduce(
      (max, h) => Math.max(max, h.precipitationProbability || 0),
      0
    );
    const sumPrecip24h = next24h.reduce(
      (sum, h) => sum + (h.precipitation || 0),
      0
    );
    const maxGusts24h = next24h.reduce(
      (max, h) => Math.max(max, h.windGusts || 0),
      current.windGusts || 0
    );

    const riskResult = evaluateWeatherRisks(weather);
    const hasHighRisk = riskResult.risks.some((r) => r.level === "HIGH");
    const hasModerateRisk = riskResult.risks.some((r) => r.level === "MODERATE");

    // Differentiate between 4 tiers:
    // RED = High (extreme weatherCode like hail 96/99, heavy precip >= 20mm, gale gusts >= 55km/h, extreme heat >= 40°C)
    // ORANGE = Significant (high rain >= 15mm, wind gusts >= 45km/h, or multiple moderate risks)
    // YELLOW = Moderate / Caution (moderate precipitation, heat, or wind)
    // GREEN = Low / Normal (no triggers exceeded)
    let tierLevel: MapTierLevel = "LOW";
    let riskColor = "#10B981"; // Green (Low)
    let fillColor = "#10B98133";

    const topRisk = riskResult.risks[0];

    if (hasHighRisk) {
      const isSevereRed =
        sumPrecip24h >= 25 ||
        current.windGusts >= 55 ||
        maxGusts24h >= 60 ||
        [96, 99].includes(current.weatherCode) ||
        current.temperature >= 41;

      if (isSevereRed) {
        tierLevel = "HIGH";
        riskColor = "#EF4444"; // Red
        fillColor = "#EF444444";
      } else {
        tierLevel = "SIGNIFICANT";
        riskColor = "#F97316"; // Orange
        fillColor = "#F9731644";
      }
    } else if (hasModerateRisk) {
      tierLevel = "MODERATE";
      riskColor = "#EAB308"; // Amber / Yellow
      fillColor = "#EAB30833";
    }

    // Determine primary reasons & live metrics
    let primaryReasonEn = "Normal seasonal conditions; no critical forecast thresholds triggered.";
    let primaryReasonHi = "सामान्य मौसमी स्थिति; कोई गंभीर मौसम सीमा पार नहीं हुई।";
    let forecastMetricEn = `Rain: ${Math.round(sumPrecip24h * 10) / 10} mm | Max prob: ${maxRainProb}% | Gusts: ${Math.round(maxGusts24h)} km/h`;
    let forecastMetricHi = `वर्षा: ${Math.round(sumPrecip24h * 10) / 10} मिमी | अधिकतम संभावना: ${maxRainProb}% | झोंके: ${Math.round(maxGusts24h)} km/h`;
    let timeframeEn = "Next 24 Hours";
    let timeframeHi = "अगले 24 घंटे";

    if (topRisk) {
      primaryReasonEn = topRisk.titleEn;
      primaryReasonHi = topRisk.titleHi;
      forecastMetricEn = topRisk.underlyingValueEn;
      forecastMetricHi = topRisk.underlyingValueHi;
      timeframeEn = topRisk.timeframeEn;
      timeframeHi = topRisk.timeframeHi;
    }

    return {
      city,
      weather,
      riskResult,
      riskLevel: riskResult.overallLevel,
      tierLevel,
      riskColor,
      fillColor,
      temp: Math.round(current.temperature),
      rainProb: maxRainProb,
      windSpeed: Math.round(current.windSpeed),
      windGusts: Math.round(current.windGusts),
      precipitation: Math.round((current.precipitation || 0) * 10) / 10,
      conditionEn: current.conditionEn || "Fair",
      conditionHi: current.conditionHi || "सामान्य",
      evaluatedAt: riskResult.evaluatedAt,
      primaryReasonEn,
      primaryReasonHi,
      forecastMetricEn,
      forecastMetricHi,
      timeframeEn,
      timeframeHi,
    };
  });

  cachedMapRisks = {
    timestamp: Date.now(),
    data: points,
  };

  return points;
}

/**
 * Sort city risk points: RED -> ORANGE -> YELLOW -> GREEN -> UNAVAILABLE
 */
export function sortCityRisksBySeverity(points: CityRiskPoint[]): CityRiskPoint[] {
  const priorityOrder: Record<MapTierLevel, number> = {
    HIGH: 1,
    SIGNIFICANT: 2,
    MODERATE: 3,
    LOW: 4,
    UNAVAILABLE: 5,
  };

  return [...points].sort((a, b) => {
    const rankDiff = priorityOrder[a.tierLevel] - priorityOrder[b.tierLevel];
    if (rankDiff !== 0) return rankDiff;
    // Tie breaker: higher rain probability, then higher temperature
    if (b.rainProb !== a.rainProb) return b.rainProb - a.rainProb;
    return b.temp - a.temp;
  });
}


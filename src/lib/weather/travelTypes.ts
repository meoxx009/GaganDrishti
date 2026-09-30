export interface ResolvedLocation {
  name: string;
  nameHi?: string;
  state?: string;
  country: string;
  lat: number;
  lon: number;
}

export type TravelPeriodType =
  | "tonight"
  | "today"
  | "tomorrow_morning"
  | "tomorrow_evening"
  | "tomorrow"
  | "general";

export interface TravelTimeWindow {
  periodType: TravelPeriodType;
  labelEn: string;
  labelHi: string;
  targetDateIso: string; // YYYY-MM-DD
  startHour: number; // 0-23
  endHour: number; // 0-23
}

export interface TravelHourlyMetric {
  timeIso: string;
  formattedHour: string;
  temperature: number;
  precipitationProbability: number;
  precipitation: number;
  weatherCode: number;
  conditionEn: string;
  conditionHi: string;
  windSpeed: number;
  windGusts: number;
  visibilityMeters?: number;
}

export interface LocationForecastSummary {
  location: ResolvedLocation;
  hours: TravelHourlyMetric[];
  avgTemp: number;
  maxTemp: number;
  minTemp: number;
  maxRainProb: number;
  sumPrecipitation: number;
  maxWindSpeed: number;
  maxWindGusts: number;
  minVisibilityMeters?: number;
  dominantConditionEn: string;
  dominantConditionHi: string;
  hasThunderstorm: boolean;
}

export type TravelRiskLevel =
  | "favorable"
  | "caution"
  | "avoid_if_possible"
  | "insufficient";

export interface TransportSuitability {
  twoWheeler: {
    statusEn: "Favourable" | "Caution Advised" | "Not Recommended";
    statusHi: "अनुकूल" | "सावधानी बरतें" | "असुरक्षित / टालें";
    noteEn: string;
    noteHi: string;
  };
  fourWheeler: {
    statusEn: "Favourable" | "Proceed with Caution" | "Delay if Possible";
    statusHi: "अनुकूल" | "सावधानी से चलाएं" | "संभव हो तो टालें";
    noteEn: string;
    noteHi: string;
  };
}

export interface TravelAssessmentResult {
  origin: ResolvedLocation;
  destination: ResolvedLocation;
  intermediateSamples: LocationForecastSummary[];
  originSummary: LocationForecastSummary;
  destinationSummary: LocationForecastSummary;
  timeWindow: TravelTimeWindow;
  riskLevel: TravelRiskLevel;
  levelLabelEn: string;
  levelLabelHi: string;
  color: "green" | "yellow" | "red" | "gray";
  primaryConcernsEn: string[];
  primaryConcernsHi: string[];
  precautionsEn: string[];
  precautionsHi: string[];
  summaryEn: string;
  summaryHi: string;
  transportSuitability?: TransportSuitability;
  travelDecision?: any;
  evaluatedAt: string;
}

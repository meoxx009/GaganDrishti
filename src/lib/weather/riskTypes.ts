export type RiskLevel = "HIGH" | "MODERATE" | "LOW";

export type RiskCategory =
  | "precipitation"
  | "heat"
  | "wind"
  | "thunderstorm";

export interface WeatherRiskItem {
  id: string;
  category: RiskCategory;
  level: RiskLevel;
  titleEn: string;
  titleHi: string;
  timeframeEn: string;
  timeframeHi: string;
  underlyingValueEn: string;
  underlyingValueHi: string;
  impactEn: string;
  impactHi: string;
  actionEn: string;
  actionHi: string;
  iconName: string;
}

export interface RiskAssessmentResult {
  overallLevel: RiskLevel;
  risks: WeatherRiskItem[];
  hasSignificantRisk: boolean;
  evaluatedAt: string;
}

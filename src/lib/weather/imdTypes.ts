export type ImdWarningLevel = "NO_WARNING" | "WATCH" | "ALERT" | "WARNING";

export type ImdColorCode = "GREEN" | "YELLOW" | "ORANGE" | "RED";

export interface ImdWarningItem {
  id: string;
  district: string;
  state: string;
  subdivision?: string;
  color: ImdColorCode;
  level: ImdWarningLevel;
  phenomenonEn: string;
  phenomenonHi: string;
  phenomenonMr: string;
  actionEn: string;
  actionHi: string;
  actionMr: string;
  validFrom: string;
  validTo: string;
  issuedAt: string;
}

export interface ImdForecastDay {
  day: number;
  date: string;
  color: ImdColorCode;
  phenomenonEn: string;
  phenomenonHi: string;
}

export interface ImdWarningResponse {
  status: "AVAILABLE" | "NO_ACTIVE_WARNING" | "UNAVAILABLE";
  cacheStatus?: "LIVE" | "CACHED" | "UNAVAILABLE";
  district: string;
  state: string;
  matchedDistrict?: string;
  warning: ImdWarningItem | null;
  forecastDays?: ImdForecastDay[];
  allDistrictWarnings?: ImdWarningItem[];
  source: string;
  sourceUrl: string;
  retrievedAt: string;
  disclaimer: string;
  errorReason?: string;
}

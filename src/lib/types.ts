export type NavSection =
  | "citizen"
  | "farmer"
  | "alerts"
  | "climate"
  | "ask"
  | "emergency"
  | "resources";

export type Language = "en" | "hi" | "mr";

export type Theme = "dark" | "light";

export interface City {
  id: string;
  nameEn: string;
  nameHi: string;
  nameMr?: string;
  stateEn: string;
  stateHi: string;
  stateMr?: string;
  district?: string;
  country?: string;
  lat: number;
  lon: number;
  isCustom?: boolean;
}

export interface NavItem {
  id: NavSection;
  label: string;
  hindiLabel: string;
  marathiLabel?: string;
  description: string;
}

export interface NavItemConfig {
  id: NavSection;
  iconName: "Users" | "Sprout" | "AlertTriangle" | "TrendingUp" | "Bot" | "ShieldAlert" | "BookOpen";
}

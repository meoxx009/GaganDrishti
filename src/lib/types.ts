export type NavSection =
  | "citizen"
  | "farmer"
  | "alerts"
  | "ask"
  | "emergency";

export type Language = "en" | "hi";

export type Theme = "dark" | "light";

export interface City {
  id: string;
  nameEn: string;
  nameHi: string;
  stateEn: string;
  stateHi: string;
  lat: number;
  lon: number;
}

export interface NavItem {
  id: NavSection;
  label: string;
  hindiLabel: string;
  description: string;
}

export interface NavItemConfig {
  id: NavSection;
  iconName: "Users" | "Sprout" | "AlertTriangle" | "Bot" | "ShieldAlert";
}

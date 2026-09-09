export type NavSection =
  | "citizen"
  | "farmer"
  | "alerts"
  | "ask"
  | "emergency";

export interface NavItem {
  id: NavSection;
  label: string;
  hindiLabel: string;
  description: string;
}

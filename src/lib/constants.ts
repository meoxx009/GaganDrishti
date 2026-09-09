import { NavItem } from "./types";

export const APP_CONFIG = {
  brand: "GaganDrishti",
  brandHindi: "गगनदृष्टि",
  badge: "SIH 2026 Prototype",
  tagline: "Bilingual Weather Intelligence for Citizens and Farmers",
  taglineHindi: "नागरिकों और किसानों के लिए द्विभाषी मौसम आसूचना",
  version: "0.1.0-alpha",
};

export const NAV_ITEMS: NavItem[] = [
  {
    id: "citizen",
    label: "Citizen",
    hindiLabel: "नागरिक",
    description: "Localized weather advisories and daily planning alerts for citizens.",
  },
  {
    id: "farmer",
    label: "Farmer",
    hindiLabel: "किसान",
    description: "Agro-meteorological advisories, crop weather impacts, and irrigation alerts.",
  },
  {
    id: "alerts",
    label: "Weather Alerts",
    hindiLabel: "मौसम चेतावनी",
    description: "Official severe weather notifications, early warnings, and danger zones.",
  },
  {
    id: "ask",
    label: "Ask GaganDrishti",
    hindiLabel: "गगनदृष्टि से पूछें",
    description: "Natural language weather guidance and conversational query assistant.",
  },
  {
    id: "emergency",
    label: "Emergency",
    hindiLabel: "आपातकालीन सेवा",
    description: "Critical SOS coordination, disaster contacts, and civil defense protocols.",
  },
];

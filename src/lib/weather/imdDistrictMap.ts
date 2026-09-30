/**
 * IMD Geography & District Mapping Table
 * Maps GaganDrishti city identifiers and names to official IMD district names in the IMD GIS geoserver.
 */

export interface ImdDistrictMapping {
  cityName: string;
  stateName: string;
  imdDistricts: string[];
}

export const FEATURED_CITY_IMD_MAP: Record<string, ImdDistrictMapping> = {
  bhopal: {
    cityName: "Bhopal",
    stateName: "Madhya Pradesh",
    imdDistricts: ["BHOPAL"],
  },
  indore: {
    cityName: "Indore",
    stateName: "Madhya Pradesh",
    imdDistricts: ["INDORE"],
  },
  jabalpur: {
    cityName: "Jabalpur",
    stateName: "Madhya Pradesh",
    imdDistricts: ["JABALPUR"],
  },
  delhi: {
    cityName: "Delhi",
    stateName: "Delhi",
    imdDistricts: ["CENTRAL DELHI", "NEW DELHI", "NORTH DELHI", "SOUTH DELHI", "DELHI"],
  },
  mumbai: {
    cityName: "Mumbai",
    stateName: "Maharashtra",
    imdDistricts: ["MUMBAI CITY", "MUMBAI SUBURBAN"],
  },
  bengaluru: {
    cityName: "Bengaluru",
    stateName: "Karnataka",
    imdDistricts: ["BANGLORE URBAN", "BANGLORE RURAL"],
  },
  chennai: {
    cityName: "Chennai",
    stateName: "Tamil Nadu",
    imdDistricts: ["CHENNAI"],
  },
  kolkata: {
    cityName: "Kolkata",
    stateName: "West Bengal",
    imdDistricts: ["KOLKATA"],
  },
  hyderabad: {
    cityName: "Hyderabad",
    stateName: "Telangana",
    imdDistricts: ["HYDERABAD"],
  },
  jaipur: {
    cityName: "Jaipur",
    stateName: "Rajasthan",
    imdDistricts: ["JAIPUR"],
  },
};

/**
 * Resolve a given city and state to a list of candidate IMD district query names.
 */
export function resolveImdDistrictNames(city: string, _state?: string): string[] {
  if (!city) return ["BHOPAL"];

  const normalized = city.trim().toLowerCase();

  // Direct featured city lookup
  if (FEATURED_CITY_IMD_MAP[normalized]) {
    return FEATURED_CITY_IMD_MAP[normalized].imdDistricts;
  }

  // Check if any featured city name is part of the query
  for (const [key, mapping] of Object.entries(FEATURED_CITY_IMD_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return mapping.imdDistricts;
    }
  }

  // Handle common Indian city variations
  if (normalized.includes("bangalore")) return ["BANGLORE URBAN", "BANGLORE RURAL"];
  if (normalized.includes("bombay")) return ["MUMBAI CITY", "MUMBAI SUBURBAN"];
  if (normalized.includes("calcutta")) return ["KOLKATA"];
  if (normalized.includes("madras")) return ["CHENNAI"];
  if (normalized.includes("pune") || normalized.includes("poona")) return ["PUNE"];
  if (normalized.includes("lucknow")) return ["LUCKNOW"];
  if (normalized.includes("ahmedabad")) return ["AHMEDABAD"];
  if (normalized.includes("patna")) return ["PATNA"];
  if (normalized.includes("nagpur")) return ["NAGPUR"];
  if (normalized.includes("chandigarh")) return ["CHANDIGARH"];
  if (normalized.includes("surat")) return ["SURAT"];
  if (normalized.includes("varanasi") || normalized.includes("banaras")) return ["VARANASI"];

  // Default fallback: uppercase single word or alphanumeric name for CQL query
  const cleanName = city.trim().replace(/[^a-zA-Z0-9\s]/g, "").toUpperCase();
  return [cleanName];
}

import { Language } from "@/lib/types";
import {
  ResolvedLocation,
  TravelPeriodType,
  TravelTimeWindow,
  TravelHourlyMetric,
  LocationForecastSummary,
  TravelAssessmentResult,
  TravelRiskLevel,
  TransportSuitability,
} from "./travelTypes";
import { interpretWMOCode } from "./wmo";
import { VehicleType } from "./travelRouteTypes";
import { extractVehicleFromText, getTravelDecision } from "./travelDecisionEngine";

// Cache for geocoded locations
const locationCache = new Map<string, ResolvedLocation>();

// Pre-seeded well-known locations
export const KNOWN_LOCATIONS: ResolvedLocation[] = [
  { name: "Bhopal", nameHi: "भोपाल", state: "Madhya Pradesh", country: "India", lat: 23.2599, lon: 77.4126 },
  { name: "Vidisha", nameHi: "विदिशा", state: "Madhya Pradesh", country: "India", lat: 23.526, lon: 77.8109 },
  { name: "Indore", nameHi: "इन्दौर", state: "Madhya Pradesh", country: "India", lat: 22.7196, lon: 75.8577 },
  { name: "Jabalpur", nameHi: "जबलपुर", state: "Madhya Pradesh", country: "India", lat: 23.1815, lon: 79.9864 },
  { name: "Delhi", nameHi: "दिल्ली", state: "Delhi", country: "India", lat: 28.6139, lon: 77.209 },
  { name: "Mumbai", nameHi: "मुंबई", state: "Maharashtra", country: "India", lat: 19.076, lon: 72.8777 },
  { name: "Bengaluru", nameHi: "बेंगलुरु", state: "Karnataka", country: "India", lat: 12.9716, lon: 77.5946 },
  { name: "Chennai", nameHi: "चेन्नई", state: "Tamil Nadu", country: "India", lat: 13.0827, lon: 80.2707 },
  { name: "Kolkata", nameHi: "कोलकाता", state: "West Bengal", country: "India", lat: 22.5726, lon: 88.3639 },
  { name: "Hyderabad", nameHi: "हैदराबाद", state: "Telangana", country: "India", lat: 17.385, lon: 78.4867 },
  { name: "Jaipur", nameHi: "जयपुर", state: "Rajasthan", country: "India", lat: 26.9124, lon: 75.7873 },
  { name: "Ujjain", nameHi: "उज्जैन", state: "Madhya Pradesh", country: "India", lat: 23.1765, lon: 75.7885 },
  { name: "Sehore", nameHi: "सीहोर", state: "Madhya Pradesh", country: "India", lat: 23.2031, lon: 77.0844 },
  { name: "Hoshangabad", nameHi: "होशंगाबाद", state: "Madhya Pradesh", country: "India", lat: 22.7519, lon: 77.7275 },
  { name: "Gwalior", nameHi: "ग्वालियर", state: "Madhya Pradesh", country: "India", lat: 26.2183, lon: 78.1828 },
  { name: "Sagar", nameHi: "सागर", state: "Madhya Pradesh", country: "India", lat: 23.8388, lon: 78.7378 },
  { name: "Raisen", nameHi: "रायसेन", state: "Madhya Pradesh", country: "India", lat: 23.3323, lon: 77.7818 },
  { name: "Dewas", nameHi: "देवास", state: "Madhya Pradesh", country: "India", lat: 22.9676, lon: 76.0534 },
  { name: "Ratlam", nameHi: "रतलाम", state: "Madhya Pradesh", country: "India", lat: 23.3315, lon: 75.0367 },
  { name: "Rewa", nameHi: "रीवा", state: "Madhya Pradesh", country: "India", lat: 24.5362, lon: 81.3037 },
  { name: "Satna", nameHi: "सतना", state: "Madhya Pradesh", country: "India", lat: 24.6005, lon: 80.8322 },
  { name: "Chhindwara", nameHi: "छिंदवाड़ा", state: "Madhya Pradesh", country: "India", lat: 22.0574, lon: 78.9382 },
  { name: "Agra", nameHi: "आगरा", state: "Uttar Pradesh", country: "India", lat: 27.1767, lon: 78.0081 },
  { name: "Lucknow", nameHi: "लखनऊ", state: "Uttar Pradesh", country: "India", lat: 26.8467, lon: 80.9462 },
  { name: "Kanpur", nameHi: "कानपुर", state: "Uttar Pradesh", country: "India", lat: 26.4499, lon: 80.3319 },
  { name: "Prayagraj", nameHi: "प्रयागराज", state: "Uttar Pradesh", country: "India", lat: 25.4358, lon: 81.8463 },
  { name: "Varanasi", nameHi: "वाराणसी", state: "Uttar Pradesh", country: "India", lat: 25.3176, lon: 82.9739 },
  { name: "Patna", nameHi: "पटना", state: "Bihar", country: "India", lat: 25.5941, lon: 85.1376 },
  { name: "Ahmedabad", nameHi: "अहमदाबाद", state: "Gujarat", country: "India", lat: 23.0225, lon: 72.5714 },
  { name: "Surat", nameHi: "सूरत", state: "Gujarat", country: "India", lat: 21.1702, lon: 72.8311 },
  { name: "Pune", nameHi: "पुणे", state: "Maharashtra", country: "India", lat: 18.5204, lon: 73.8567 },
  { name: "Nagpur", nameHi: "नागपुर", state: "Maharashtra", country: "India", lat: 21.1458, lon: 79.0882 },
  { name: "Chandigarh", nameHi: "चंडीगढ़", state: "Punjab", country: "India", lat: 30.7333, lon: 76.7794 },
  { name: "Mysuru", nameHi: "मैसूर", state: "Karnataka", country: "India", lat: 12.2958, lon: 76.6394 },
  { name: "Puducherry", nameHi: "पुडुचेरी", state: "Puducherry", country: "India", lat: 11.9416, lon: 79.8083 },
  { name: "Vadodara", nameHi: "वडोदरा", state: "Gujarat", country: "India", lat: 22.3072, lon: 73.1812 },
  { name: "Warangal", nameHi: "वारंगल", state: "Telangana", country: "India", lat: 17.9689, lon: 79.5941 },
  { name: "Digha", nameHi: "दीघा", state: "West Bengal", country: "India", lat: 21.6266, lon: 87.5074 },
];

KNOWN_LOCATIONS.forEach((loc) => {
  locationCache.set(loc.name.toLowerCase(), loc);
  if (loc.nameHi) locationCache.set(loc.nameHi.toLowerCase(), loc);
});

/**
 * Resolve an Indian location using Open-Meteo Geocoding API or memory cache
 */
export async function resolveIndianLocation(name: string): Promise<ResolvedLocation | null> {
  const cleanName = name.trim().toLowerCase();
  if (!cleanName) return null;

  if (locationCache.has(cleanName)) {
    return locationCache.get(cleanName)!;
  }

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      name.trim()
    )}&count=5&language=en&format=json`;

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;

    const data = await res.json();
    if (!data.results || data.results.length === 0) return null;

    // Prefer Indian results
    const indianResult =
      data.results.find((r: { country_code?: string }) => r.country_code === "IN") ||
      data.results[0];

    const resolved: ResolvedLocation = {
      name: indianResult.name,
      state: indianResult.admin1 || indianResult.country,
      country: indianResult.country || "India",
      lat: indianResult.latitude,
      lon: indianResult.longitude,
    };

    locationCache.set(cleanName, resolved);
    locationCache.set(resolved.name.toLowerCase(), resolved);

    return resolved;
  } catch (err) {
    console.error(`Geocoding error for "${name}":`, err);
    return null;
  }
}

/**
 * Natural language parser to detect travel queries and extract origin, destination, and time window
 */
export function parseTravelQuery(query: string): {
  isTravelQuery: boolean;
  originName?: string;
  destinationName?: string;
  timePeriod: TravelPeriodType;
  vehicleType?: VehicleType;
} {
  const q = query.toLowerCase().trim();

  // Determine time period
  let timePeriod: TravelPeriodType = "general";
  if (
    q.includes("tonight") ||
    q.includes("आज रात") ||
    q.includes("रात में") ||
    q.includes("रात को") ||
    q.includes("aaj raat") ||
    q.includes("raat ko")
  ) {
    timePeriod = "tonight";
  } else if (
    q.includes("tomorrow morning") ||
    q.includes("कल सुबह") ||
    q.includes("अगली सुबह") ||
    q.includes("kal subah") ||
    q.includes("cal subah")
  ) {
    timePeriod = "tomorrow_morning";
  } else if (
    q.includes("tomorrow evening") ||
    q.includes("कल शाम") ||
    q.includes("कल रात") ||
    q.includes("kal sham") ||
    q.includes("cal sham")
  ) {
    timePeriod = "tomorrow_evening";
  } else if (
    q.includes("tomorrow") ||
    q.includes("कल") ||
    q.includes("kal") ||
    q.includes("cal") ||
    q.includes("agle din")
  ) {
    timePeriod = "tomorrow";
  } else if (
    q.includes("today") ||
    q.includes("आज") ||
    q.includes("aaj") ||
    q.includes("now") ||
    q.includes("अभी")
  ) {
    timePeriod = "today";
  }

  // Common Hindi travel keywords: "से", "jana", "जाना", "यात्रा", "सफर", "nikalna", "निकलना"
  // Common English keywords: "from", "to", "travel", "journey", "trip", "going to", "drive to"
  const travelKeywords = [
    "travel",
    "trip",
    "journey",
    "going from",
    "travel from",
    "drive from",
    "reach",
    "drive",
    "expressway",
    "highway",
    "road",
    "route",
    "se",
    "से",
    "jana",
    "जाना",
    "yatra",
    "यात्रा",
    "safar",
    "सफर",
    "nikalna",
    "निकलना",
    "jaana",
    "te",
    "ते",
    "pravas",
    "प्रवास",
    "गाडीने",
    "gadi ne",
  ];

  const hasTravelKeyword =
    travelKeywords.some((kw) => q.includes(kw)) ||
    q.includes(" to ") ||
    q.includes(" te ") ||
    q.includes(" ते ");
  if (!hasTravelKeyword) {
    return { isTravelQuery: false, timePeriod };
  }

  let originName: string | undefined;
  let destinationName: string | undefined;

  // Clean noise helper for extracted candidate tokens
  const cleanCandidate = (w?: string) => {
    if (!w) return undefined;
    const cleaned = w
      .replace(/(?:^|\s+)(?:mujhe|humko|humein|i\s+need\s+to|want\s+to|plan\s+to|tonight|today|tomorrow|morning|evening|night|रात|आज|कल|सुबह|शाम|मौसम|weather|कैसा|kaisa|rahega|रहेगा|जाना|jana|jaana|हूँ|हैं|था|थी|गा|गी|गे)(?:\s+|$)/gi, " ")
      .replace(/[।,?!]/g, "")
      .trim();
    return cleaned.length >= 2 ? cleaned : undefined;
  };

  // Pre-check with KNOWN_LOCATIONS for high-precision entity identification
  // Check if query contains two known locations
  const mentionedKnown = KNOWN_LOCATIONS.filter((loc) => {
    const n1 = loc.name.toLowerCase();
    const n2 = loc.nameHi ? loc.nameHi.toLowerCase() : "";
    return q.includes(n1) || (n2 ? query.includes(loc.nameHi!) : false);
  });

  if (mentionedKnown.length >= 2) {
    // Determine order of appearance in the query
    const sorted = [...mentionedKnown].sort((a, b) => {
      const idxA = Math.min(
        q.indexOf(a.name.toLowerCase()) !== -1 ? q.indexOf(a.name.toLowerCase()) : 9999,
        a.nameHi && query.indexOf(a.nameHi) !== -1 ? query.indexOf(a.nameHi) : 9999
      );
      const idxB = Math.min(
        q.indexOf(b.name.toLowerCase()) !== -1 ? q.indexOf(b.name.toLowerCase()) : 9999,
        b.nameHi && query.indexOf(b.nameHi) !== -1 ? query.indexOf(b.nameHi) : 9999
      );
      return idxA - idxB;
    });

    if (sorted[0] && sorted[1] && sorted[0].name !== sorted[1].name) {
      originName = sorted[0].name;
      destinationName = sorted[1].name;
    }
  }

  // Normalized query removing personal pronouns between origin and destination
  const normalizedQuery = query.replace(/\b(?:mujhe|humko|humein|i|we|want|to|mera|meri|mere|aap|tum|apko)\b/gi, " ");

  // Pattern 1: "travel from [X] to [Y]" or "from [X] to [Y]"
  if (!originName || !destinationName) {
    const enMatch = query.match(/(?:travel(?:ling)?|go(?:ing)?|drive|journey)?\s*from\s+([a-zA-Z\s]+?)\s+to\s+([a-zA-Z\s]+?)(?:tonight|today|tomorrow|night|morning|evening|\?|\.|\,|$)/i);
    if (enMatch && enMatch[1] && enMatch[2]) {
      originName = cleanCandidate(enMatch[1]);
      destinationName = cleanCandidate(enMatch[2]);
    }
  }

  // Pattern 2: "[X] to [Y]" or "[X] te [Y]" or "[X] ते [Y]"
  if (!originName || !destinationName) {
    const enMatch2 = query.match(/([a-zA-Z\u0900-\u097F]+)\s+(?:to|te|ते)\s+([a-zA-Z\u0900-\u097F]+)/i);
    if (enMatch2 && enMatch2[1] && enMatch2[2]) {
      const cand1 = cleanCandidate(enMatch2[1]);
      const cand2 = cleanCandidate(enMatch2[2]);
      const known1 = KNOWN_LOCATIONS.find(l => l.name.toLowerCase() === cand1?.toLowerCase() || l.nameHi === cand1);
      const known2 = KNOWN_LOCATIONS.find(l => l.name.toLowerCase() === cand2?.toLowerCase() || l.nameHi === cand2);
      originName = known1 ? known1.name : cand1;
      destinationName = known2 ? known2.name : cand2;
    }
  }

  // Pattern 3: Hindi/Hinglish "[X] से [Y] (optional words) (जाना/सफर/यात्रा/travel)"
  if (!originName || !destinationName) {
    const hiMatch = normalizedQuery.match(/([^\s,।\?]+)\s*(?:से|se)\s+([^\s,।\?]+)(?:[\s\S]*?)(?:जाना|jana|jaana|यात्रा|सफर|निकलन|nikal|travel|trip)/i);
    if (hiMatch && hiMatch[1] && hiMatch[2]) {
      originName = cleanCandidate(hiMatch[1]);
      destinationName = cleanCandidate(hiMatch[2]);
    }
  }

  // Pattern 4: Hindi "[X] से [Y]"
  if (!originName || !destinationName) {
    const hiMatch2 = normalizedQuery.match(/([^\s,।\?]+)\s*(?:से|se)\s+([^\s,।\?]+)/i);
    if (hiMatch2 && hiMatch2[1] && hiMatch2[2]) {
      const w1 = cleanCandidate(hiMatch2[1]);
      const w2 = cleanCandidate(hiMatch2[2]);
      const stopWords = ["मौसम", "weather", "घर", "home", "कल", "आज", "रात", "दिन"];
      if (w1 && w2 && !stopWords.includes(w1.toLowerCase()) && !stopWords.includes(w2.toLowerCase())) {
        originName = w1;
        destinationName = w2;
      }
    }
  }

  const isTravelQuery = Boolean(originName && destinationName && originName.toLowerCase() !== destinationName.toLowerCase());
  const vehicleType = extractVehicleFromText(query);

  return {
    isTravelQuery,
    originName,
    destinationName,
    timePeriod,
    vehicleType,
  };
}

/**
 * Calculates current or target IST time window
 */
export function calculateTravelTimeWindow(period: TravelPeriodType): TravelTimeWindow {
  // Current time in Asia/Kolkata
  const nowUtc = new Date();
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(nowUtc.getTime() + istOffsetMs);

  const getIsoDate = (d: Date) => d.toISOString().split("T")[0];

  const todayIso = getIsoDate(istNow);
  const tomorrowDate = new Date(istNow.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowIso = getIsoDate(tomorrowDate);

  const currentHour = istNow.getUTCHours();

  switch (period) {
    case "tonight":
      return {
        periodType: "tonight",
        labelEn: "Tonight (18:00 – 24:00 IST)",
        labelHi: "आज रात (18:00 – 24:00 भा.मा.स)",
        targetDateIso: todayIso,
        startHour: 18,
        endHour: 23,
      };

    case "tomorrow_morning":
      return {
        periodType: "tomorrow_morning",
        labelEn: "Tomorrow Morning (06:00 – 12:00 IST)",
        labelHi: "कल सुबह (06:00 – 12:00 भा.मा.स)",
        targetDateIso: tomorrowIso,
        startHour: 6,
        endHour: 12,
      };

    case "tomorrow_evening":
      return {
        periodType: "tomorrow_evening",
        labelEn: "Tomorrow Evening (16:00 – 21:00 IST)",
        labelHi: "कल शाम (16:00 – 21:00 भा.मा.स)",
        targetDateIso: tomorrowIso,
        startHour: 16,
        endHour: 21,
      };

    case "tomorrow":
      return {
        periodType: "tomorrow",
        labelEn: "Tomorrow (06:00 – 22:00 IST)",
        labelHi: "कल दिन भर (06:00 – 22:00 भा.मा.स)",
        targetDateIso: tomorrowIso,
        startHour: 6,
        endHour: 22,
      };

    case "today":
    case "general":
    default:
      // If late evening already, default to tonight; otherwise next 6 hours
      if (currentHour >= 18) {
        return {
          periodType: "tonight",
          labelEn: "Tonight (18:00 – 24:00 IST)",
          labelHi: "आज रात (18:00 – 24:00 भा.मा.स)",
          targetDateIso: todayIso,
          startHour: Math.max(18, currentHour),
          endHour: 23,
        };
      }
      return {
        periodType: "today",
        labelEn: `Today (Next 6 Hours, ${currentHour}:00 – ${Math.min(currentHour + 6, 23)}:00 IST)`,
        labelHi: `आज (अगले 6 घंटे, ${currentHour}:00 – ${Math.min(currentHour + 6, 23)}:00 भा.मा.स)`,
        targetDateIso: todayIso,
        startHour: currentHour,
        endHour: Math.min(currentHour + 6, 23),
      };
  }
}

/**
 * Fetch forecast metrics for a single location during the given time window
 */
export async function fetchLocationWindowForecast(
  location: ResolvedLocation,
  window: TravelTimeWindow
): Promise<LocationForecastSummary | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&hourly=temperature_2m,precipitation_probability,precipitation,weather_code,visibility,wind_speed_10m,wind_gusts_10m&timezone=Asia%2FKolkata&forecast_days=2`;

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;

    const data = await res.json();
    if (!data.hourly || !data.hourly.time) return null;

    const hourly = data.hourly;
    const matchedMetrics: TravelHourlyMetric[] = [];

    for (let i = 0; i < hourly.time.length; i++) {
      const timeIso: string = hourly.time[i]; // "2026-09-10T19:00"
      const [datePart, timePart] = timeIso.split("T");
      if (datePart !== window.targetDateIso) continue;

      const hourNum = parseInt(timePart.split(":")[0], 10);
      if (hourNum >= window.startHour && hourNum <= window.endHour) {
        const wmoCode = hourly.weather_code[i] ?? 0;
        const wmo = interpretWMOCode(wmoCode);

        matchedMetrics.push({
          timeIso,
          formattedHour: timePart,
          temperature: Math.round(hourly.temperature_2m[i] * 10) / 10,
          precipitationProbability: hourly.precipitation_probability[i] ?? 0,
          precipitation: Math.round((hourly.precipitation[i] ?? 0) * 10) / 10,
          weatherCode: wmoCode,
          conditionEn: wmo.conditionEn,
          conditionHi: wmo.conditionHi,
          windSpeed: Math.round(hourly.wind_speed_10m[i] ?? 0),
          windGusts: Math.round(hourly.wind_gusts_10m[i] ?? 0),
          visibilityMeters: hourly.visibility ? Math.round(hourly.visibility[i]) : undefined,
        });
      }
    }

    if (matchedMetrics.length === 0) return null;

    const temps = matchedMetrics.map((m) => m.temperature);
    const rainProbs = matchedMetrics.map((m) => m.precipitationProbability);
    const rainSums = matchedMetrics.map((m) => m.precipitation);
    const winds = matchedMetrics.map((m) => m.windSpeed);
    const gusts = matchedMetrics.map((m) => m.windGusts);
    const visibilities = matchedMetrics
      .map((m) => m.visibilityMeters)
      .filter((v): v is number => typeof v === "number");

    const hasThunderstorm = matchedMetrics.some((m) => [95, 96, 99].includes(m.weatherCode));
    const dominantConditionEn = matchedMetrics[0]?.conditionEn || "Fair";
    const dominantConditionHi = matchedMetrics[0]?.conditionHi || "सामान्य";

    return {
      location,
      hours: matchedMetrics,
      avgTemp: Math.round((temps.reduce((a, b) => a + b, 0) / temps.length) * 10) / 10,
      maxTemp: Math.max(...temps),
      minTemp: Math.min(...temps),
      maxRainProb: Math.max(...rainProbs),
      sumPrecipitation: Math.round(rainSums.reduce((a, b) => a + b, 0) * 10) / 10,
      maxWindSpeed: Math.max(...winds),
      maxWindGusts: Math.max(...gusts),
      minVisibilityMeters: visibilities.length > 0 ? Math.min(...visibilities) : undefined,
      dominantConditionEn,
      dominantConditionHi,
      hasThunderstorm,
    };
  } catch (err) {
    console.error(`Error fetching window forecast for ${location.name}:`, err);
    return null;
  }
}

/**
 * Calculates geographic midpoint between two coordinates
 */
export function interpolateMidpoint(
  origin: ResolvedLocation,
  destination: ResolvedLocation
): ResolvedLocation {
  const midLat = (origin.lat + destination.lat) / 2;
  const midLon = (origin.lon + destination.lon) / 2;
  return {
    name: `${origin.name}–${destination.name} Corridor Midpoint`,
    nameHi: `${origin.nameHi || origin.name}–${destination.nameHi || destination.name} मार्ग मध्य-बिंदु`,
    country: "India",
    lat: Math.round(midLat * 10000) / 10000,
    lon: Math.round(midLon * 10000) / 10000,
  };
}

/**
 * Evaluates transport mode suitability (2-wheeler vs 4-wheeler)
 */
export function evaluateTransportSuitability(
  hasThunderstorm: boolean,
  maxRainProb: number,
  maxRainSum: number,
  maxWindGust: number,
  minVisibility?: number
): TransportSuitability {
  if (
    hasThunderstorm ||
    maxWindGust >= 45 ||
    maxRainSum >= 15 ||
    (minVisibility !== undefined && minVisibility < 1000)
  ) {
    return {
      twoWheeler: {
        statusEn: "Not Recommended",
        statusHi: "असुरक्षित / टालें",
        noteEn: "Severe risk of lightning, gust destabilization, and skidding. Avoid two-wheelers.",
        noteHi: "वज्रपात, तेज आंधी एवं तीव्र फिसलन के कारण बाइक/स्कूटर से यात्रा बिल्कुल न करें।",
      },
      fourWheeler: {
        statusEn: "Delay if Possible",
        statusHi: "संभव हो तो टालें",
        noteEn: "Four-wheeler provides enclosed protection, but intense rain/wind warrants delaying if feasible.",
        noteHi: "चार-पहिया वाहन में सुरक्षा अधिक है, फिर भी गंभीर स्थिति के चलते यात्रा टालना सुरक्षित होगा।",
      },
    };
  }

  if (
    maxRainProb >= 40 ||
    maxRainSum >= 3 ||
    maxWindGust >= 30 ||
    (minVisibility !== undefined && minVisibility < 3000)
  ) {
    return {
      twoWheeler: {
        statusEn: "Caution Advised",
        statusHi: "सावधानी बरतें",
        noteEn: "Wet roads and passing showers. Carry rain gear, wear full helmet, and ride cautiously.",
        noteHi: "गीली सड़कों पर फिसलने का खतरा। रेनकोट व वाइज़र हेलमेट पहनें और गति धीमी रखें।",
      },
      fourWheeler: {
        statusEn: "Proceed with Caution",
        statusHi: "सावधानी से चलाएं",
        noteEn: "Check wipers and headlights. Maintain safe distance from heavy vehicles.",
        noteHi: "वाइपर व हेडलाइट का उपयोग करें और आगे चल रहे वाहनों से पर्याप्त दूरी बनाकर चलें।",
      },
    };
  }

  return {
    twoWheeler: {
      statusEn: "Favourable",
      statusHi: "अनुकूल",
      noteEn: "Road and atmospheric conditions are suitable for two-wheelers. Wear standard helmet.",
      noteHi: "दुपहिया यात्रा के लिए मौसम पूरी तरह अनुकूल है। हेलमेट पहनें और सुरक्षित चलें।",
    },
    fourWheeler: {
      statusEn: "Favourable",
      statusHi: "अनुकूल",
      noteEn: "Corridor conditions are calm and clear for four-wheelers.",
      noteHi: "कार एवं चौपहिया वाहनों के लिए मार्ग अनुकूल एवं सुरक्षित है।",
    },
  };
}

/**
 * Deterministic travel weather assessment engine
 */
export function evaluateTravelCorridor(
  originSummary: LocationForecastSummary,
  destinationSummary: LocationForecastSummary,
  intermediateSummaries: LocationForecastSummary[],
  window: TravelTimeWindow
): TravelAssessmentResult {
  const allSummaries = [originSummary, ...intermediateSummaries, destinationSummary];

  const corridorMaxRainProb = Math.max(...allSummaries.map((s) => s.maxRainProb));
  const corridorMaxRainSum = Math.max(...allSummaries.map((s) => s.sumPrecipitation));
  const corridorMaxWindGust = Math.max(...allSummaries.map((s) => s.maxWindGusts));
  const corridorHasThunderstorm = allSummaries.some((s) => s.hasThunderstorm);

  const visibilities = allSummaries
    .map((s) => s.minVisibilityMeters)
    .filter((v): v is number => typeof v === "number");
  const corridorMinVisibility = visibilities.length > 0 ? Math.min(...visibilities) : undefined;

  const concernsEn: string[] = [];
  const concernsHi: string[] = [];
  const precautionsEn: string[] = [];
  const precautionsHi: string[] = [];

  let riskLevel: TravelRiskLevel = "favorable";
  let color: "green" | "yellow" | "red" | "gray" = "green";
  let levelLabelEn = "Weather conditions appear generally favourable";
  let levelLabelHi = "मौसम की स्थिति सामान्यतः अनुकूल दिख रही है";

  // Check Avoid (Red) conditions
  if (corridorHasThunderstorm) {
    riskLevel = "avoid_if_possible";
    color = "red";
    levelLabelEn = "Consider delaying travel due to thunderstorm risk";
    levelLabelHi = "तड़ित झंझा (आंधी-तूफान) के कारण यात्रा टालने पर विचार करें";
    concernsEn.push("Thunderstorm activity with potential lightning strikes along the corridor.");
    concernsHi.push("मार्ग में आकाशीय बिजली एवं संवहनीय आंधी की संभावना।");
    precautionsEn.push("Avoid travelling on two-wheelers or open vehicles; stay inside covered shelters.");
    precautionsHi.push("दुपहिया वाहन से यात्रा से बचें; गर्जन के समय सुरक्षित पक्के स्थान पर रुकें।");
  } else if (corridorMaxRainSum >= 20 || (corridorMaxRainProb >= 75 && corridorMaxRainSum >= 10)) {
    riskLevel = "avoid_if_possible";
    color = "red";
    levelLabelEn = "Consider delaying travel due to adverse heavy rainfall";
    levelLabelHi = "प्रतिकूल भारी वर्षा के कारण संभव हो तो यात्रा टालने पर विचार करें";
    concernsEn.push(`Significant precipitation expected (${corridorMaxRainSum} mm, max ${corridorMaxRainProb}% probability).`);
    concernsHi.push(`मार्ग पर भारी बारिश की संभावना (${corridorMaxRainSum} मिमी, ${corridorMaxRainProb}% संभावना)।`);
    precautionsEn.push("Expect severe waterlogging at culverts and underpasses; keep vehicle headlights on.");
    precautionsHi.push("पुलियों एवं निचले रास्तों पर जलभराव की आशंका; हेडलाइट जलाकर धीमी गति से चलें।");
  } else if (corridorMinVisibility !== undefined && corridorMinVisibility < 1000) {
    riskLevel = "avoid_if_possible";
    color = "red";
    levelLabelEn = "Consider delaying travel due to dense fog and severely low visibility";
    levelLabelHi = "घने कोहरे एवं अत्यंत कम दृश्यता के कारण यात्रा टालने पर विचार करें";
    concernsEn.push(`Dense fog/mist causing visibility drop below ${corridorMinVisibility} meters.`);
    concernsHi.push(`घने कोहरे के कारण दृश्यता ${corridorMinVisibility} मीटर से कम रहने का अनुमान।`);
    precautionsEn.push("Use fog lights and hazard indicators; strictly maintain safe stopping distance.");
    precautionsHi.push("फॉग लैम्प का प्रयोग करें एवं आगे चल रहे वाहन से सुरक्षित दूरी बनाए रखें।");
  } else if (corridorMaxWindGust >= 48) {
    riskLevel = "avoid_if_possible";
    color = "red";
    levelLabelEn = "Consider delaying travel due to strong gale winds";
    levelLabelHi = "तीव्र आंधी-तूफानी हवाओं के कारण यात्रा टालने पर विचार करें";
    concernsEn.push(`High wind gusts up to ${corridorMaxWindGust} km/h.`);
    concernsHi.push(`मार्ग में ${corridorMaxWindGust} किमी/घंटा तक के तेज झोंके संभव।`);
    precautionsEn.push("High-sided vehicles and two-wheelers face strong destabilization risks on open highways.");
    precautionsHi.push("खुले राजमार्गों पर दुपहिया एवं भारी वाहनों का संतुलन बिगड़ने का जोखिम।");
  }
  // Check Caution (Yellow) conditions
  else if (corridorMaxRainSum >= 5 || corridorMaxRainProb >= 45) {
    riskLevel = "caution";
    color = "yellow";
    levelLabelEn = "Travel with weather caution (wet road risk)";
    levelLabelHi = "मौसम को देखते हुए सावधानी से यात्रा करें (गीली सड़क की संभावना)";
    concernsEn.push(`Passing showers expected (${corridorMaxRainSum} mm, ${corridorMaxRainProb}% probability).`);
    concernsHi.push(`हल्की से मध्यम बारिश संभव (${corridorMaxRainSum} मिमी, ${corridorMaxRainProb}% संभावना)।`);
    precautionsEn.push("Ensure windshield wipers work properly; expect reduced traction on wet asphalt.");
    precautionsHi.push("वाइपर की कार्यप्रणाली जांचें और गीली सड़कों पर अचानक ब्रेक लगाने से बचें।");
  } else if (corridorMaxWindGust >= 32) {
    riskLevel = "caution";
    color = "yellow";
    levelLabelEn = "Travel with weather caution (moderate wind gusts)";
    levelLabelHi = "मौसम को देखते हुए सावधानी से यात्रा करें (तेज हवाएं)";
    concernsEn.push(`Breezy conditions with gusts up to ${corridorMaxWindGust} km/h.`);
    concernsHi.push(`हवा की गति मध्यम से तेज (${corridorMaxWindGust} किमी/घंटा झोंके)।`);
    precautionsEn.push("Maintain a firm grip on the steering wheel on flyovers and open stretches.");
    precautionsHi.push("फ्लाईओवर एवं खुले रास्तों पर वाहन नियंत्रित गति में चलाएं।");
  } else if (corridorMinVisibility !== undefined && corridorMinVisibility < 3500) {
    riskLevel = "caution";
    color = "yellow";
    levelLabelEn = "Travel with weather caution (moderate mist/haze)";
    levelLabelHi = "मौसम को देखते हुए सावधानी से यात्रा करें (धुंध/हल्का कोहरा)";
    concernsEn.push(`Reduced visibility down to ${corridorMinVisibility} meters.`);
    concernsHi.push(`धुंध के कारण दृश्यता लगभग ${corridorMinVisibility} मीटर तक रह सकती है।`);
    precautionsEn.push("Drive with low-beam headlights on.");
    precautionsHi.push("गाड़ी की लो-बीम लाइट चालू रखें।");
  } else {
    // Favorable (Green)
    riskLevel = "favorable";
    color = "green";
    levelLabelEn = "Weather conditions appear generally favourable";
    levelLabelHi = "मौसम की स्थिति सामान्यतः अनुकूल दिख रही है";
    concernsEn.push("No major precipitation, thunderstorm, or adverse wind signals detected.");
    concernsHi.push("मार्ग में भारी वर्षा, आंधी या प्रतिकूल मौसमी बाधा का कोई स्पष्ट संकेत नहीं।");
    precautionsEn.push("Regular highway driving precautions apply. Check standard route traffic independently.");
    precautionsHi.push("सामान्य यातायात नियमों का पालन करें। निकलने से पहले सामान्य सड़क स्थिति की जानकारी ले लें।");
  }

  // Generate clean summaries
  const originName = originSummary.location.name;
  const destName = destinationSummary.location.name;
  const originNameHi = originSummary.location.nameHi || originName;
  const destNameHi = destinationSummary.location.nameHi || destName;

  const summaryEn = `${window.labelEn}: Travel corridor from ${originName} to ${destName}. ${levelLabelEn}. At ${originName}, expected ${originSummary.avgTemp}°C and ${originSummary.maxRainProb}% rain chance. At ${destName}, expected ${destinationSummary.avgTemp}°C and ${destinationSummary.maxRainProb}% rain chance.`;
  const summaryHi = `${window.labelHi}: ${originNameHi} से ${destNameHi} यात्रा मार्ग। ${levelLabelHi}। ${originNameHi} में तापमान लगभग ${originSummary.avgTemp}°C व वर्षा संभावना ${originSummary.maxRainProb}% है, जबकि ${destNameHi} में ${destinationSummary.avgTemp}°C व ${destinationSummary.maxRainProb}% वर्षा संभावना है।`;

  const transportSuitability = evaluateTransportSuitability(
    corridorHasThunderstorm,
    corridorMaxRainProb,
    corridorMaxRainSum,
    corridorMaxWindGust,
    corridorMinVisibility
  );

  return {
    origin: originSummary.location,
    destination: destinationSummary.location,
    intermediateSamples: intermediateSummaries,
    originSummary,
    destinationSummary,
    timeWindow: window,
    riskLevel,
    levelLabelEn,
    levelLabelHi,
    color,
    primaryConcernsEn: concernsEn,
    primaryConcernsHi: concernsHi,
    precautionsEn,
    precautionsHi,
    summaryEn,
    summaryHi,
    transportSuitability,
    evaluatedAt: new Date().toISOString(),
  };
}

/**
 * End-to-end corridor assessment pipeline
 */
export async function assessTravelWeather(
  originQuery: string,
  destinationQuery: string,
  periodType: TravelPeriodType = "tonight",
  vehicleType?: VehicleType
): Promise<TravelAssessmentResult | null> {
  const [origin, destination] = await Promise.all([
    resolveIndianLocation(originQuery),
    resolveIndianLocation(destinationQuery),
  ]);

  if (!origin || !destination) {
    return null;
  }

  const timeWindow = calculateTravelTimeWindow(periodType);

  // Determine distance approximation to decide on route sampling
  const latDiff = Math.abs(origin.lat - destination.lat);
  const lonDiff = Math.abs(origin.lon - destination.lon);
  const approxDistanceKm = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff) * 111;

  const intermediateLocations: ResolvedLocation[] = [];
  if (approxDistanceKm > 70) {
    // Add 1 interpolated midpoint for longer routes
    intermediateLocations.push(interpolateMidpoint(origin, destination));
  }

  const [originSummary, destSummary, ...intermediateSummaries] = await Promise.all([
    fetchLocationWindowForecast(origin, timeWindow),
    fetchLocationWindowForecast(destination, timeWindow),
    ...intermediateLocations.map((loc) => fetchLocationWindowForecast(loc, timeWindow)),
  ]);

  if (!originSummary || !destSummary) {
    return null;
  }

  const validIntermediates = intermediateSummaries.filter(
    (s): s is LocationForecastSummary => s !== null
  );

  const corridorAssessment = evaluateTravelCorridor(originSummary, destSummary, validIntermediates, timeWindow);

  try {
    const travelDecision = await getTravelDecision({
      origin_city: origin.name,
      destination_city: destination.name,
      vehicle_type: vehicleType || "Car",
    });
    corridorAssessment.travelDecision = travelDecision;
  } catch (err) {
    console.error("Travel decision engine error:", err);
  }

  return corridorAssessment;
}

/**
 * Deterministic bilingual travel reply for fallback or instant answer
 */
export function generateDeterministicTravelReply(
  assessment: TravelAssessmentResult,
  language: Language
): string {
  const isHi = language === "hi";
  const oName = isHi ? assessment.origin.nameHi || assessment.origin.name : assessment.origin.name;
  const dName = isHi ? assessment.destination.nameHi || assessment.destination.name : assessment.destination.name;

  const timeStr = isHi ? assessment.timeWindow.labelHi : assessment.timeWindow.labelEn;
  const statusStr = isHi ? assessment.levelLabelHi : assessment.levelLabelEn;
  const oSum = assessment.originSummary;
  const dSum = assessment.destinationSummary;

  const concerns = isHi ? assessment.primaryConcernsHi.join(" ") : assessment.primaryConcernsEn.join(" ");
  const precautions = isHi ? assessment.precautionsHi.join(" ") : assessment.precautionsEn.join(" ");
  const transport = assessment.transportSuitability;
  const decision = assessment.travelDecision;

  if (isHi) {
    const decisionBlocksHi: string[] = [];
    if (decision) {
      decisionBlocksHi.push(`• **मार्ग सुरक्षा स्कोर (Safety Score):** ${decision.overall_safety_score}/10 — **${decision.safety_verdict_hi}**`);
      decisionBlocksHi.push(`• **सबसे संवेदनशील मौसमी क्षेत्र (Worst Zone):** ${decision.worst_weather_zone.location} (${decision.worst_weather_zone.risk_factor})`);
      decisionBlocksHi.push(`• **सर्वश्रेष्ठ प्रस्थान समय (Best Departure):** ${decision.best_travel_time} (टालने योग्य समय: ${decision.worst_travel_time})`);
      if (decision.vehicle_specific_risks) {
        decisionBlocksHi.push(`• **वाहन विशिष्ट सलाह (${decision.vehicle_specific_risks.vehicle}):** जोखिम: ${decision.vehicle_specific_risks.risk_level}। ${decision.vehicle_specific_risks.precautions_hi.join(" ")}`);
      }
      if (decision.alternative_routes && decision.alternative_routes.length > 0) {
        const alt = decision.alternative_routes[0];
        decisionBlocksHi.push(`• **वैकल्पिक सुरक्षित मार्ग (Alternative Route):** ${alt.route} (${alt.distance_km} किमी, ~${alt.time_hours} घंटे) — ${alt.safety_advantage_hi}`);
      }
      decisionBlocksHi.push(`• **आपातकालीन हेल्पलाइन:** NHAI हाईवे पेट्रोल: ${decision.emergency_contacts.traffic_highway_patrol} | आपातकाल: ${decision.emergency_contacts.police} | एम्बुलेंस: ${decision.emergency_contacts.ambulance}`);
    }

    const transportBlockHi = (!decision && transport)
      ? `\n• **वाहन प्रकार सलाह (Vehicle Suitability):**\n  - **दुपहिया (Bike/Scooter):** ${transport.twoWheeler.statusHi} — ${transport.twoWheeler.noteHi}\n  - **कार/बस (Car/Bus):** ${transport.fourWheeler.statusHi} — ${transport.fourWheeler.noteHi}`
      : "";

    return `🚗 **यात्रा मौसम परामर्श (${timeStr}):**
${oName} से ${dName} के लिए: **${statusStr}**।

• **${oName} मौसम:** तापमान लगभग ${oSum.avgTemp}°C, वर्षा संभावना ${oSum.maxRainProb}%, हवा ${oSum.maxWindSpeed} km/h (${oSum.dominantConditionHi})।
• **${dName} मौसम:** तापमान लगभग ${dSum.avgTemp}°C, वर्षा संभावना ${dSum.maxRainProb}%, हवा ${dSum.maxWindSpeed} km/h (${dSum.dominantConditionHi})।
${decisionBlocksHi.length > 0 ? decisionBlocksHi.join("\n") : ""}${transportBlockHi}
${concerns ? `• **मौसमी स्थिति:** ${concerns}` : ""}
${precautions ? `• **सलाह:** ${precautions}` : ""}

*स्रोत: Open-Meteo संख्यात्मक पूर्वानुमान व भारतीय राष्ट्रीय राजमार्ग डेटाबेस। सूचनात्मक परामर्श: गगनदृष्टि मौसम अनुकूलता का विश्लेषण करता है, निकलने से पहले स्थानीय प्रशासन/यातायात निर्देशों की पुष्टि करें।*`;
  }

  const decisionBlocksEn: string[] = [];
  if (decision) {
    decisionBlocksEn.push(`• **Route Safety Score:** ${decision.overall_safety_score}/10 — **${decision.safety_verdict}**`);
    decisionBlocksEn.push(`• **Worst Weather Zone:** ${decision.worst_weather_zone.location} (${decision.worst_weather_zone.risk_factor})`);
    decisionBlocksEn.push(`• **Best Departure Window:** ${decision.best_travel_time} (Avoid: ${decision.worst_travel_time})`);
    if (decision.vehicle_specific_risks) {
      decisionBlocksEn.push(`• **Vehicle Guidance (${decision.vehicle_specific_risks.vehicle}):** Risk: ${decision.vehicle_specific_risks.risk_level}. ${decision.vehicle_specific_risks.precautions.join(" ")}`);
    }
    if (decision.alternative_routes && decision.alternative_routes.length > 0) {
      const alt = decision.alternative_routes[0];
      decisionBlocksEn.push(`• **Alternative Safer Route:** ${alt.route} (${alt.distance_km} km, ~${alt.time_hours} hrs) — ${alt.safety_advantage}`);
    }
    decisionBlocksEn.push(`• **Emergency Helplines:** NHAI Highway Patrol: ${decision.emergency_contacts.traffic_highway_patrol} | Emergency: ${decision.emergency_contacts.police} | Ambulance: ${decision.emergency_contacts.ambulance}`);
  }

  const transportBlockEn = (!decision && transport)
    ? `\n• **Vehicle Mode Guidance:**\n  - **Two-Wheeler (Bike/Scooter):** ${transport.twoWheeler.statusEn} — ${transport.twoWheeler.noteEn}\n  - **Four-Wheeler (Car/Bus):** ${transport.fourWheeler.statusEn} — ${transport.fourWheeler.noteEn}`
    : "";

  return `🚗 **Travel Weather Assessment (${timeStr}):**
For travel from ${oName} to ${dName}: **${statusStr}**.

• **${oName} Weather:** Around ${oSum.avgTemp}°C, ${oSum.maxRainProb}% rain probability, wind ${oSum.maxWindSpeed} km/h (${oSum.dominantConditionEn}).
• **${dName} Weather:** Around ${dSum.avgTemp}°C, ${dSum.maxRainProb}% rain probability, wind ${dSum.maxWindSpeed} km/h (${dSum.dominantConditionEn}).
${decisionBlocksEn.length > 0 ? decisionBlocksEn.join("\n") : ""}${transportBlockEn}
${concerns ? `• **Weather Observations:** ${concerns}` : ""}
${precautions ? `• **Precautions:** ${precautions}` : ""}

*Source: Open-Meteo Numerical Forecast & Indian National Highway Corridor Telemetry. Informational advisory: Please verify official highway advisories with local traffic authorities before departure.*`;
}

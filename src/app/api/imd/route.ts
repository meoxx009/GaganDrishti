import { NextRequest, NextResponse } from "next/server";
import { ImdWarningResponse, ImdWarningItem, ImdColorCode, ImdWarningLevel, ImdForecastDay } from "@/lib/weather/imdTypes";
import { resolveImdDistrictNames } from "@/lib/weather/imdDistrictMap";

// Official IMD Geoserver WFS endpoint (active source powering mausam.imd.gov.in GIS warnings)
const IMD_WFS_BASE_URL = "https://reactjs.imd.gov.in/geoserver/wfs";
const FETCH_TIMEOUT_MS = 6000;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes cache

// In-memory cache to ensure high availability during transient upstream network spikes
interface CacheEntry {
  data: ImdWarningResponse;
  timestamp: number;
}
const imdCache = new Map<string, CacheEntry>();

// IMD Official Warning Phenomenon dictionary
const PHENOMENON_MAP: Record<string, { en: string; hi: string; mr: string }> = {
  "1": {
    en: "No Warning / Normal Seasonal Weather",
    hi: "कोई चेतावनी नहीं / सामान्य मौसमी स्थिति",
    mr: "कोणताही इशारा नाही / सामान्य हंगामी हवामान",
  },
  "2": {
    en: "Heavy Rain (64.5 - 115.5 mm)",
    hi: "भारी वर्षा (64.5 - 115.5 मिमी)",
    mr: "मुसळधार पाऊस (६४.५ - ११५.५ मिमी)",
  },
  "3": {
    en: "Heavy Snow",
    hi: "भारी बर्फबारी",
    mr: "मुसळधार बर्फवृष्टी",
  },
  "4": {
    en: "Thunderstorms, Lightning & Gusty Winds",
    hi: "मेघगर्जना, आकाशीय बिजली एवं तेज़ हवाएं",
    mr: "गडगडाटी वादळ, विजांचा कडकडाट व सोसाट्याचा वारा",
  },
  "5": {
    en: "Hailstorm",
    hi: "ओलावृष्टि",
    mr: "गारपीट",
  },
  "6": {
    en: "Dust Storm",
    hi: "धूल भरी आंधी",
    mr: "धुळीचे वादळ",
  },
  "7": {
    en: "Dust Raising Winds",
    hi: "धूल उड़ाने वाली तेज़ हवाएं",
    mr: "धुळीचे वारे",
  },
  "8": {
    en: "Strong Surface Winds",
    hi: "मजबूत सतही हवाएं",
    mr: "जोरदार पृष्ठभागीय वारे",
  },
  "9": {
    en: "Heat Wave",
    hi: "लू / हीट वेव",
    mr: "उष्णतेची लाट",
  },
  "10": {
    en: "Hot Day",
    hi: "गर्म दिन",
    mr: "उष्ण दिवस",
  },
  "11": {
    en: "Warm Night",
    hi: "गर्म रात",
    mr: "उबदार रात्र",
  },
  "12": {
    en: "Cold Wave",
    hi: "शीत लहर",
    mr: "थंडीची लाट",
  },
  "13": {
    en: "Cold Day",
    hi: "ठंडा दिन",
    mr: "थंड दिवस",
  },
  "14": {
    en: "Ground Frost",
    hi: "पाला / पाला पड़ना",
    mr: "धुके / दव",
  },
  "15": {
    en: "Dense Fog",
    hi: "घना कोहरा",
    mr: "दाट धुके",
  },
  "16": {
    en: "Very Heavy Rain (115.6 - 204.4 mm)",
    hi: "बहुत भारी वर्षा (115.6 - 204.4 मिमी)",
    mr: "अति मुसळधार पाऊस (११५.६ - २०४.४ मिमी)",
  },
  "17": {
    en: "Extremely Heavy Rain (> 204.4 mm)",
    hi: "अत्यधिक भारी वर्षा (> 204.4 मिमी)",
    mr: "अत्यंत मुसळधार पाऊस (> २०४.४ मिमी)",
  },
};

function parseImdColor(colorNum: number | string | undefined): ImdColorCode {
  const num = typeof colorNum === "string" ? parseInt(colorNum, 10) : colorNum;
  if (num === 1) return "RED";
  if (num === 2) return "ORANGE";
  if (num === 3) return "YELLOW";
  return "GREEN";
}

function parseImdLevel(color: ImdColorCode): ImdWarningLevel {
  if (color === "RED") return "WARNING";
  if (color === "ORANGE") return "ALERT";
  if (color === "YELLOW") return "WATCH";
  return "NO_WARNING";
}

function getImdActions(color: ImdColorCode): { en: string; hi: string; mr: string } {
  if (color === "RED") {
    return {
      en: "Take Action: Follow instructions from local district disaster management authorities.",
      hi: "कार्रवाई करें: स्थानीय जिला आपदा प्रबंधन प्राधिकरण एवं प्रशासन के निर्देशों का पालन करें।",
      mr: "कृती करा: स्थानिक जिल्हा आपत्ती व्यवस्थापन प्राधिकरणाच्या सूचनांचे काटेकोर पालन करा.",
    };
  }
  if (color === "ORANGE") {
    return {
      en: "Be Prepared: Keep updated on evolving weather alerts; secure outdoor assets.",
      hi: "तैयार रहें: मौसम के बदलाव पर नज़र रखें और आवश्यक सुरक्षा सावधानियां बरतें।",
      mr: "सज्ज राहा: हवामानाच्या बदलांवर लक्ष ठेवा आणि आवश्यक ती खबरदारी घ्या.",
    };
  }
  if (color === "YELLOW") {
    return {
      en: "Be Updated: Stay aware of changing local conditions during daily activities.",
      hi: "अपडेट रहें: दैनिक कार्यों के दौरान स्थानीय मौसम की स्थिति पर नज़र रखें।",
      mr: "अपडेट राहा: दैनंदिन कामादरम्यान स्थानिक हवामानातील बदलांबद्दल जागरूक राहा.",
    };
  }
  return {
    en: "No Action Required: Normal seasonal conditions. Check routine forecasts.",
    hi: "किसी विशेष कार्रवाई की आवश्यकता नहीं: सामान्य मौसमी स्थिति। दैनिक पूर्वानुमान देखें।",
    mr: "कोणत्याही विशेष कृतीची गरज नाही: सामान्य हंगामी हवामान. दैनंदिन अंदाज तपासा.",
  };
}

function formatPhenomenon(codesStr: string, customText?: string): { en: string; hi: string; mr: string } {
  if (customText && customText.trim().length > 0) {
    return {
      en: customText.trim(),
      hi: customText.trim(),
      mr: customText.trim(),
    };
  }

  if (!codesStr) {
    return PHENOMENON_MAP["1"];
  }

  const codes = codesStr.split(",").map((s) => s.trim()).filter(Boolean);
  const activeCodes = codes.filter((c) => c !== "1");

  if (activeCodes.length === 0) {
    return PHENOMENON_MAP["1"];
  }

  const enList = activeCodes.map((c) => PHENOMENON_MAP[c]?.en || `Phenomenon Code ${c}`);
  const hiList = activeCodes.map((c) => PHENOMENON_MAP[c]?.hi || `मौसम कोड ${c}`);
  const mrList = activeCodes.map((c) => PHENOMENON_MAP[c]?.mr || `हवामान कोड ${c}`);

  return {
    en: enList.join("; "),
    hi: hiList.join("; "),
    mr: mrList.join("; "),
  };
}

export async function GET(req: NextRequest): Promise<NextResponse<ImdWarningResponse>> {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city") || "Bhopal";
  const state = searchParams.get("state") || "Madhya Pradesh";

  const cacheKey = `${city.toLowerCase()}_${state.toLowerCase()}`;
  const now = Date.now();

  // Check in-memory cache freshness
  const cached = imdCache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json({
      ...cached.data,
      cacheStatus: "CACHED",
    });
  }

  const candidateDistricts = resolveImdDistrictNames(city, state);
  const cqlFilter = `District IN (${candidateDistricts.map((d) => `'${d}'`).join(",")})`;

  const properties = [
    "id",
    "District",
    "Date",
    "Day_1",
    "Day_2",
    "Day_3",
    "Day_4",
    "Day_5",
    "Day1_Color",
    "Day2_Color",
    "Day3_Color",
    "Day4_Color",
    "Day5_Color",
    "Day1_text",
    "Day2_text",
    "updated_at",
  ].join(",");

  const params = new URLSearchParams({
    service: "WFS",
    version: "1.1.0",
    request: "GetFeature",
    typename: "imd:district_warnings_india",
    srsname: "EPSG:4326",
    outputFormat: "application/json",
    propertyName: properties,
    cql_filter: cqlFilter,
  });

  const targetUrl = `${IMD_WFS_BASE_URL}?${params.toString()}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        Accept: "application/json, text/plain, */*",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) GaganDrishti/1.0",
      },
      next: { revalidate: 900 }, // 15-minute server ISR
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`IMD Geoserver responded with status ${res.status}`);
    }

    const geojson = await res.json();
    const features = geojson.features || [];

    if (features.length === 0) {
      // District has no warning entry or is calm
      const responsePayload: ImdWarningResponse = {
        status: "NO_ACTIVE_WARNING",
        cacheStatus: "LIVE",
        district: city,
        state,
        warning: {
          id: `imd_calm_${city.toLowerCase()}`,
          district: city,
          state,
          color: "GREEN",
          level: "NO_WARNING",
          phenomenonEn: "No Official Severe Weather Warning (Calm/Seasonal)",
          phenomenonHi: "कोई आधिकारिक गंभीर चेतावनी नहीं (सामान्य/शांत मौसम)",
          phenomenonMr: "कोणताही अधिकृत तीव्र हवामानाचा इशारा नाही (शांत/सामान्य)",
          actionEn: "No special emergency action required. Check daily routine forecast.",
          actionHi: "किसी विशेष आपातकालीन कार्रवाई की आवश्यकता नहीं। दैनिक पूर्वानुमान देखें।",
          actionMr: "कोणत्याही विशेष आपत्कालीन कृतीची गरज नाही. दैनंदिन अंदाज पहा.",
          validFrom: new Date().toISOString(),
          validTo: new Date(Date.now() + 86400000).toISOString(),
          issuedAt: new Date().toISOString(),
        },
        source: "India Meteorological Department (IMD) GIS Warning System",
        sourceUrl: "https://mausam.imd.gov.in/responsive/districtWiseWarningGIS.php",
        retrievedAt: new Date().toISOString(),
        disclaimer:
          "Official warnings are sourced exclusively from public IMD bulletins. GaganDrishti never fabricates or converts independent forecast risks into IMD warnings.",
      };

      imdCache.set(cacheKey, { data: responsePayload, timestamp: now });
      return NextResponse.json(responsePayload);
    }

    // Match the best feature
    const firstFeature = features[0];
    const props = firstFeature.properties || {};

    const color = parseImdColor(props.Day1_Color);
    const level = parseImdLevel(color);
    const actions = getImdActions(color);
    const phenomenon = formatPhenomenon(props.Day_1, props.Day1_text);

    const issueDateStr = props.Date || new Date().toISOString().slice(0, 10);
    const updatedAtStr = props.updated_at || new Date().toISOString();

    const matchedDistrict = props.District || candidateDistricts[0];

    // Multi-day outlook (Day 1 to 5)
    const forecastDays: ImdForecastDay[] = [1, 2, 3, 4, 5].map((dayNum) => {
      const dayColor = parseImdColor(props[`Day${dayNum}_Color`]);
      const dayPhenom = formatPhenomenon(props[`Day_${dayNum}`], props[`Day${dayNum}_text`]);
      const targetDate = new Date(Date.now() + (dayNum - 1) * 86400000).toISOString().slice(0, 10);
      return {
        day: dayNum,
        date: targetDate,
        color: dayColor,
        phenomenonEn: dayPhenom.en,
        phenomenonHi: dayPhenom.hi,
      };
    });

    const warningItem: ImdWarningItem = {
      id: `imd_${props.id || matchedDistrict.toLowerCase()}`,
      district: matchedDistrict,
      state,
      color,
      level,
      phenomenonEn: phenomenon.en,
      phenomenonHi: phenomenon.hi,
      phenomenonMr: phenomenon.mr,
      actionEn: actions.en,
      actionHi: actions.hi,
      actionMr: actions.mr,
      validFrom: new Date(issueDateStr).toISOString(),
      validTo: new Date(Date.now() + 86400000).toISOString(),
      issuedAt: updatedAtStr,
    };

    const responsePayload: ImdWarningResponse = {
      status: color === "GREEN" && props.Day_1 === "1" ? "NO_ACTIVE_WARNING" : "AVAILABLE",
      cacheStatus: "LIVE",
      district: city,
      state,
      matchedDistrict,
      warning: warningItem,
      forecastDays,
      source: "India Meteorological Department (IMD) GIS Warning System",
      sourceUrl: "https://mausam.imd.gov.in/responsive/districtWiseWarningGIS.php",
      retrievedAt: new Date().toISOString(),
      disclaimer:
        "Official warnings are sourced exclusively from public IMD bulletins. GaganDrishti never fabricates or converts independent forecast risks into IMD warnings.",
    };

    // Cache successful response
    imdCache.set(cacheKey, { data: responsePayload, timestamp: now });

    return NextResponse.json(responsePayload);
  } catch (err: unknown) {
    clearTimeout(timeoutId);

    // If cache has any prior data for this key, return it as CACHED fallback
    if (cached) {
      return NextResponse.json({
        ...cached.data,
        cacheStatus: "CACHED",
      });
    }

    return NextResponse.json({
      status: "UNAVAILABLE",
      cacheStatus: "UNAVAILABLE",
      district: city,
      state,
      warning: null,
      source: "India Meteorological Department (IMD)",
      sourceUrl: "https://mausam.imd.gov.in",
      retrievedAt: new Date().toISOString(),
      disclaimer:
        "Official warnings are sourced exclusively from public IMD bulletins. GaganDrishti never fabricates or converts independent forecast risks into IMD warnings.",
      errorReason:
        "Official IMD public warning feed is currently unreachable or undergoing routine synchronization.",
    });
  }
}

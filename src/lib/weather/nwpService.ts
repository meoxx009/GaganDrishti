/**
 * Numerical Weather Prediction (NWP) Multi-Model Service
 * Compares European ECMWF IFS (0.25°) and American NOAA GFS (seamless)
 * via Open-Meteo Multi-Model API for model consensus and uncertainty quantification.
 * 
 * Free tier / Open data only - strictly ₹0 prototype budget.
 */

export interface NWPModelSummary {
  id: "ecmwf_ifs025" | "gfs_seamless";
  name: string;
  organization: string;
  resolution: string;
  tempNext24hAvg: number;
  tempMax: number;
  tempMin: number;
  precipTotal: number;
  windMax: number;
  hourly: {
    time: string[];
    formattedTime: string[];
    temp: number[];
    precip: number[];
    wind: number[];
  };
}

export interface NWPComparisonResult {
  ecmwf: NWPModelSummary;
  gfs: NWPModelSummary;
  agreementLevel: "HIGH" | "MODERATE" | "DIVERGENT";
  tempDifference: number;
  precipDifference: number;
  agreementExplanationEn: string;
  agreementExplanationHi: string;
  agreementExplanationMr: string;
  fetchedAt: string;
  status: "SUCCESS" | "FALLBACK" | "ERROR";
}

const CACHE_KEY_PREFIX = "gagandrishti_nwp_";
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 mins

interface CacheEntry {
  data: NWPComparisonResult;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry>();

/**
 * Fetch and compare ECMWF IFS and GFS forecasts for a given coordinate
 */
export async function fetchNWPComparison(
  lat: number,
  lon: number
): Promise<NWPComparisonResult> {
  const cacheKey = `${lat.toFixed(2)}_${lon.toFixed(2)}`;
  const now = Date.now();

  // 1. Check in-memory cache
  const inMem = memoryCache.get(cacheKey);
  if (inMem && now - inMem.timestamp < CACHE_TTL_MS) {
    return inMem.data;
  }

  // 2. Check localStorage cache
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(`${CACHE_KEY_PREFIX}${cacheKey}`);
      if (stored) {
        const parsed: CacheEntry = JSON.parse(stored);
        if (now - parsed.timestamp < CACHE_TTL_MS) {
          memoryCache.set(cacheKey, parsed);
          return parsed.data;
        }
      }
    } catch {
      // ignore storage access errors
    }
  }

  // 3. Network Fetch from Open-Meteo multi-model API
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&models=ecmwf_ifs025,gfs_seamless&hourly=temperature_2m,precipitation,wind_speed_10m&timezone=Asia%2FKolkata&forecast_days=2`;
    
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) {
      throw new Error(`Open-Meteo model endpoint status: ${res.status}`);
    }

    const json = await res.json();
    const hourly = json.hourly;
    if (!hourly || !hourly.time) {
      throw new Error("Invalid hourly payload from model endpoint");
    }

    // Slice next 24 hours
    const times: string[] = hourly.time.slice(0, 24);
    const formattedTimes = times.map((t: string) => {
      const d = new Date(t);
      return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
    });

    const ecmwfTemp: number[] = (hourly.temperature_2m_ecmwf_ifs025 || []).slice(0, 24);
    const gfsTemp: number[] = (hourly.temperature_2m_gfs_seamless || []).slice(0, 24);
    const ecmwfPrecip: number[] = (hourly.precipitation_ecmwf_ifs025 || []).slice(0, 24);
    const gfsPrecip: number[] = (hourly.precipitation_gfs_seamless || []).slice(0, 24);
    const ecmwfWind: number[] = (hourly.wind_speed_10m_ecmwf_ifs025 || []).slice(0, 24);
    const gfsWind: number[] = (hourly.wind_speed_10m_gfs_seamless || []).slice(0, 24);

    const calcStats = (temps: number[], precips: number[], winds: number[]) => {
      const validTemps = temps.filter((v) => typeof v === "number" && !isNaN(v));
      const validPrecips = precips.filter((v) => typeof v === "number" && !isNaN(v));
      const validWinds = winds.filter((v) => typeof v === "number" && !isNaN(v));

      const avgTemp = validTemps.length ? validTemps.reduce((a, b) => a + b, 0) / validTemps.length : 25;
      const maxTemp = validTemps.length ? Math.max(...validTemps) : 30;
      const minTemp = validTemps.length ? Math.min(...validTemps) : 20;
      const totalPrecip = validPrecips.reduce((a, b) => a + b, 0);
      const maxWind = validWinds.length ? Math.max(...validWinds) : 10;

      return {
        avgTemp: Math.round(avgTemp * 10) / 10,
        maxTemp: Math.round(maxTemp * 10) / 10,
        minTemp: Math.round(minTemp * 10) / 10,
        totalPrecip: Math.round(totalPrecip * 10) / 10,
        maxWind: Math.round(maxWind * 10) / 10,
      };
    };

    const eStats = calcStats(ecmwfTemp, ecmwfPrecip, ecmwfWind);
    const gStats = calcStats(gfsTemp, gfsPrecip, gfsWind);

    const tempDiff = Math.round(Math.abs(eStats.avgTemp - gStats.avgTemp) * 10) / 10;
    const precipDiff = Math.round(Math.abs(eStats.totalPrecip - gStats.totalPrecip) * 10) / 10;

    // Agreement Level calculation
    let agreementLevel: "HIGH" | "MODERATE" | "DIVERGENT" = "HIGH";
    if (tempDiff > 3.0 || precipDiff > 10.0 || (eStats.totalPrecip > 5 && gStats.totalPrecip === 0)) {
      agreementLevel = "DIVERGENT";
    } else if (tempDiff > 1.5 || precipDiff > 3.0) {
      agreementLevel = "MODERATE";
    }

    let explanationEn = "ECMWF and GFS numerical solutions show tight convergence for the next 24 hours.";
    let explanationHi = "ईसीएमडब्ल्यूएफ और जीएफएस मॉडल अगले 24 घंटों के लिए उच्च समानता दर्शा रहे हैं।";
    let explanationMr = "ECMWF आणि GFS मॉडेल्स पुढील 24 तासांसाठी उच्च सहमती दर्शवत आहेत.";

    if (agreementLevel === "DIVERGENT") {
      explanationEn = `Models diverge significantly: temp variance is ${tempDiff}°C and precipitation divergence is ${precipDiff}mm. Exercise caution with outdoor planning.`;
      explanationHi = `मॉडलों में मतभेद है: तापमान में ${tempDiff}°C और वर्षा में ${precipDiff}mm का अंतर है। मौसम में अचानक बदलाव संभव है।`;
      explanationMr = `मॉडेल्समध्ये तफावत आहे: तापमानात ${tempDiff}°C आणि पावसात ${precipDiff}mm चा फरक आहे. हवामान बदलांवर लक्ष ठेवा.`;
    } else if (agreementLevel === "MODERATE") {
      explanationEn = `Minor spread observed between ECMWF and GFS (${tempDiff}°C temp spread, ${precipDiff}mm rain difference). General trend remains consistent.`;
      explanationHi = `ईसीएमडब्ल्यूएफ और जीएफएस में मामूली अंतर (${tempDiff}°C तापमान, ${precipDiff}mm वर्षा)। मुख्य रुझान समान है।`;
      explanationMr = `ECMWF आणि GFS मध्ये किरकोळ फरक (${tempDiff}°C तापमान, ${precipDiff}mm पाऊस). मुख्य कल सारखाच आहे.`;
    }

    const result: NWPComparisonResult = {
      ecmwf: {
        id: "ecmwf_ifs025",
        name: "ECMWF IFS (0.25°)",
        organization: "European Centre for Medium-Range Weather Forecasts",
        resolution: "~25 km global grid",
        tempNext24hAvg: eStats.avgTemp,
        tempMax: eStats.maxTemp,
        tempMin: eStats.minTemp,
        precipTotal: eStats.totalPrecip,
        windMax: eStats.maxWind,
        hourly: {
          time: times,
          formattedTime: formattedTimes,
          temp: ecmwfTemp,
          precip: ecmwfPrecip,
          wind: ecmwfWind,
        },
      },
      gfs: {
        id: "gfs_seamless",
        name: "NOAA GFS (Seamless)",
        organization: "National Oceanic and Atmospheric Administration (USA)",
        resolution: "~13-28 km global grid",
        tempNext24hAvg: gStats.avgTemp,
        tempMax: gStats.maxTemp,
        tempMin: gStats.minTemp,
        precipTotal: gStats.totalPrecip,
        windMax: gStats.maxWind,
        hourly: {
          time: times,
          formattedTime: formattedTimes,
          temp: gfsTemp,
          precip: gfsPrecip,
          wind: gfsWind,
        },
      },
      agreementLevel,
      tempDifference: tempDiff,
      precipDifference: precipDiff,
      agreementExplanationEn: explanationEn,
      agreementExplanationHi: explanationHi,
      agreementExplanationMr: explanationMr,
      fetchedAt: new Date().toISOString(),
      status: "SUCCESS",
    };

    // Cache result
    memoryCache.set(cacheKey, { data: result, timestamp: now });
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          `${CACHE_KEY_PREFIX}${cacheKey}`,
          JSON.stringify({ data: result, timestamp: now })
        );
      } catch {
        // ignore storage quota
      }
    }

    return result;
  } catch {
    // Graceful offline fallback
    return createFallbackNWP(lat, lon);
  }
}

function createFallbackNWP(lat: number, lon: number): NWPComparisonResult {
  const dummyHours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, "0")}:00`);
  return {
    ecmwf: {
      id: "ecmwf_ifs025",
      name: "ECMWF IFS (0.25°)",
      organization: "European Centre for Medium-Range Weather Forecasts",
      resolution: "~25 km grid",
      tempNext24hAvg: 28.2,
      tempMax: 33.5,
      tempMin: 22.8,
      precipTotal: 0.0,
      windMax: 14.5,
      hourly: {
        time: dummyHours,
        formattedTime: dummyHours,
        temp: Array(24).fill(28),
        precip: Array(24).fill(0),
        wind: Array(24).fill(10),
      },
    },
    gfs: {
      id: "gfs_seamless",
      name: "NOAA GFS (Seamless)",
      organization: "National Oceanic and Atmospheric Administration (USA)",
      resolution: "~25 km grid",
      tempNext24hAvg: 27.8,
      tempMax: 34.0,
      tempMin: 22.0,
      precipTotal: 0.0,
      windMax: 16.0,
      hourly: {
        time: dummyHours,
        formattedTime: dummyHours,
        temp: Array(24).fill(28),
        precip: Array(24).fill(0),
        wind: Array(24).fill(11),
      },
    },
    agreementLevel: "HIGH",
    tempDifference: 0.4,
    precipDifference: 0.0,
    agreementExplanationEn: "ECMWF and GFS models converge with high confidence under typical atmospheric baseline.",
    agreementExplanationHi: "ईसीएमडब्ल्यूएफ और जीएफएस मॉडल उच्च विश्वसनीयता के साथ समान रुझान दिखा रहे हैं।",
    agreementExplanationMr: "ECMWF आणि GFS मॉडेल उच्च विश्वासाने सुसंगत कल दाखवत आहेत.",
    fetchedAt: new Date().toISOString(),
    status: "FALLBACK",
  };
}

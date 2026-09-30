import { ChatHistoryItem } from "./types";
import { extractCropFromQuery } from "@/lib/crops";
import { KNOWN_LOCATIONS } from "@/lib/weather/travelWeather";

export type WeatherIntent =
  | "rain_timing"
  | "rain_amount"
  | "rain_probability_amount"
  | "temperature_timing"
  | "temperature_range"
  | "wind_gust"
  | "sky_sunshine"
  | "humidity"
  | "thunderstorm_risk"
  | "farmer_spray"
  | "farmer_irrigation"
  | "farmer_general"
  | "flood_inundation"
  | "travel_weather"
  | "pest_forecast"
  | "multi_day_summary"
  | "general_summary"
  | "app_info"
  | "unsupported";

export type TimePeriodOfDay = "all_day" | "morning" | "afternoon" | "evening" | "night" | "current";

export interface ParsedTimeSlot {
  dayOffset: number; // 0 = today, 1 = tomorrow, 2 = day after tomorrow
  isMultiDay: boolean;
  multiDayCount?: number; // e.g. 3, 5, or 7
  isWeekend?: boolean;
  periodOfDay: TimePeriodOfDay;
  rawTimePhrase?: string;
}

export interface ParsedWeatherQuery {
  normalizedQuery: string;
  intent: WeatherIntent;
  timeSlot: ParsedTimeSlot;
  explicitCityMention?: string;
  cropMention?: string;
  isEllipticalFollowUp: boolean;
  rawLanguageDetected: "hinglish" | "hi" | "mr" | "en";
}

/**
 * Normalizes colloquial spellings, abbreviations, and mixed code-switching
 * in Roman Hindi, Hindi, and English.
 */
export function normalizeWeatherQuery(raw: string): string {
  let text = raw.trim().toLowerCase();

  // Remove excessive punctuation but preserve alphanumeric and Devanagari characters
  text = text.replace(/[?!,.;:।॥_/\\]+/g, " ");

  // Normalization mappings for Roman Hindi / Hinglish colloquialisms
  const replacements: [RegExp, string][] = [
    [/\b(kb|kabb|kab)\b/g, "kab"],
    [/\b(aj|aajj)\b/g, "aaj"],
    [/\b(kl|kll)\b/g, "kal"],
    [/\b(parson|parso)\b/g, "parso"],
    [/\b(kesa|kese|kesi|kaisey|kasa|kase)\b/g, "kaisa"],
    [/\b(rhega|rhegi|rhga|rahegi|rahenge|rhne)\b/g, "rahega"],
    [/\b(hoga|hogi|honge|hoge)\b/g, "hoga"],
    [/\b(mosam|mausm|mosm|mausham|mousam)\b/g, "mausam"],
    [/\b(baris|baarish|baaris|barsat|barsaat|varsha)\b/g, "barish"],
    [/\b(subh|subah|subha)\b/g, "subah"],
    [/\b(dopahar|dopehar|dophar)\b/g, "dopahar"],
    [/\b(shaam|sham|shm)\b/g, "shaam"],
    [/\b(raat|rat|raath)\b/g, "raat"],
    [/\b(dhup|dhoop)\b/g, "dhoop"],
    [/\b(jyada|zyada|jada|jaada|adhik)\b/g, "zyada"],
    [/\b(km|kam)\b/g, "kam"],
    [/\b(tez|tej)\b/g, "tez"],
    [/\b(kitna|kitni|kitne)\b/g, "kitna"],
    [/\b(samay|smay|time\s*period|time|waqt)\b/g, "time"],
    [/\b(chhidkav|chhidkaav|chidkav|chhidkav)\b/g, "spray"],
    [/\b(sinchai|sinchayi)\b/g, "irrigation"],
    [/\b(badh|baadh)\b/g, "flood"],
    [/\b(jalbharav|jal\s*bharav)\b/g, "waterlogging"],
    [/\b(kya\s*scene\s*hai|kya\s*scene|kya\s*haal\s*hai|kya\s*haal)\b/g, "kaisa rahega"],
    [/\b(btao|batao|bataiye|bataye|bata)\b/g, "batao"],
    [/\b(hawaa|hawa|pawan)\b/g, "hawa"],
    [/\b(taapman|tapman|temp|temperature)\b/g, "temperature"],
    [/\b(paani|pani)\b/g, "pani"],
  ];

  for (const [pattern, replacement] of replacements) {
    text = text.replace(pattern, replacement);
  }

  return text.replace(/\s+/g, " ").trim();
}

/**
 * Extracts temporal slots (day offset, multi-day range, period of day)
 */
export function extractTimeSlot(normalized: string, history?: ChatHistoryItem[]): ParsedTimeSlot {
  let dayOffset = 0;
  let isMultiDay = false;
  let multiDayCount: number | undefined = undefined;
  let isWeekend = false;
  let periodOfDay: TimePeriodOfDay = "all_day";
  let rawTimePhrase: string | undefined = undefined;

  // 1. Check Multi-day phrases
  if (
    normalized.includes("agle 7 din") ||
    normalized.includes("next 7 days") ||
    normalized.includes("agle hafte") ||
    normalized.includes("next week") ||
    normalized.includes("is hafte") ||
    normalized.includes("is week") ||
    normalized.includes("pure hafte") ||
    normalized.includes("hafta") ||
    normalized.includes("hafte") ||
    normalized.includes("week")
  ) {
    isMultiDay = true;
    multiDayCount = 7;
    rawTimePhrase = "agle hafte";
  } else if (
    normalized.includes("agle 3 din") ||
    normalized.includes("next 3 days") ||
    normalized.includes("teen din") ||
    normalized.includes("3 din")
  ) {
    isMultiDay = true;
    multiDayCount = 3;
    rawTimePhrase = "agle 3 din";
  } else if (
    normalized.includes("agle 4-5 din") ||
    normalized.includes("4-5 din") ||
    normalized.includes("char panch din") ||
    normalized.includes("5 din") ||
    normalized.includes("panch din") ||
    normalized.includes("next 5 days")
  ) {
    isMultiDay = true;
    multiDayCount = 5;
    rawTimePhrase = "agle 5 din";
  } else if (normalized.includes("weekend") || normalized.includes("shaniwar raviwar")) {
    isMultiDay = true;
    isWeekend = true;
    rawTimePhrase = "weekend";
  }

  // 2. Check Specific Day
  if (!isMultiDay) {
    if (normalized.includes("parso") || normalized.includes("day after tomorrow")) {
      dayOffset = 2;
      rawTimePhrase = "parso";
    } else if (
      normalized.includes("kal") ||
      normalized.includes("tomorrow") ||
      normalized.includes("agle din") ||
      normalized.includes("next day")
    ) {
      dayOffset = 1;
      rawTimePhrase = "kal";
    } else if (
      normalized.includes("aaj") ||
      normalized.includes("today") ||
      normalized.includes("abhi") ||
      normalized.includes("now")
    ) {
      dayOffset = 0;
      rawTimePhrase = normalized.includes("abhi") ? "abhi" : "aaj";
    } else {
      // Multi-turn context inheritance for day offset
      if (history && history.length > 0) {
        const lastUser = [...history].reverse().find((h) => h.role === "user");
        if (lastUser) {
          const lastNorm = normalizeWeatherQuery(lastUser.content);
          if (lastNorm.includes("kal") || lastNorm.includes("tomorrow")) {
            dayOffset = 1;
            rawTimePhrase = "kal (contextual)";
          } else if (lastNorm.includes("parso")) {
            dayOffset = 2;
            rawTimePhrase = "parso (contextual)";
          }
        }
      }
    }
  }

  // 3. Check Period of the day
  if (normalized.includes("subah") || normalized.includes("morning") || normalized.includes("sawere")) {
    periodOfDay = "morning";
  } else if (
    normalized.includes("dopahar") ||
    normalized.includes("afternoon") ||
    normalized.includes("dopehar") ||
    normalized.includes("tisre pehar")
  ) {
    periodOfDay = "afternoon";
  } else if (
    normalized.includes("shaam") ||
    normalized.includes("evening") ||
    normalized.includes("godhuli") ||
    normalized.includes("sanjh")
  ) {
    periodOfDay = "evening";
  } else if (
    normalized.includes("raat") ||
    normalized.includes("night") ||
    normalized.includes("tonight") ||
    normalized.includes("madhyaratri")
  ) {
    periodOfDay = "night";
  } else if (normalized.includes("abhi") || normalized.includes("current") || normalized.includes("now")) {
    periodOfDay = "current";
  }

  return {
    dayOffset,
    isMultiDay,
    multiDayCount,
    isWeekend,
    periodOfDay,
    rawTimePhrase,
  };
}

/**
 * Checks if query is an elliptical follow-up
 */
function checkEllipticalFollowUp(normalized: string): boolean {
  return (
    normalized.startsWith("aur ") ||
    normalized.startsWith("or ") ||
    normalized === "kal" ||
    normalized === "kal ka" ||
    normalized === "kal ka kaisa hai" ||
    normalized === "parso" ||
    normalized === "parso ka" ||
    normalized === "raat ko" ||
    normalized === "shaam ko" ||
    normalized === "subah" ||
    normalized === "kis time" ||
    normalized === "kis time par" ||
    normalized.startsWith("aur kal") ||
    normalized.startsWith("or kal")
  );
}

/**
 * Main intent and slot classifier
 */
export function parseWeatherIntentAndSlots(
  rawQuery: string,
  history?: ChatHistoryItem[]
): ParsedWeatherQuery {
  const normalized = normalizeWeatherQuery(rawQuery);
  const timeSlot = extractTimeSlot(normalized, history);
  const isElliptical = checkEllipticalFollowUp(normalized);

  // Extract explicit crop mention
  const extractedCrop = extractCropFromQuery(rawQuery);
  const cropMention = extractedCrop ? extractedCrop.id : undefined;

  // Extract explicit city mention if present in query
  let explicitCityMention: string | undefined = undefined;
  const qLower = rawQuery.toLowerCase();
  for (const loc of KNOWN_LOCATIONS) {
    const en = loc.name.toLowerCase();
    const hi = loc.nameHi ? loc.nameHi.toLowerCase() : "";
    if (qLower.includes(en) || (loc.nameHi && rawQuery.includes(loc.nameHi))) {
      explicitCityMention = loc.name;
      break;
    }
  }

  // App Info queries
  if (
    normalized.includes("gagandrishti") ||
    normalized.includes("गगनदृष्टि") ||
    normalized.includes("app kya hai") ||
    normalized.includes("features") ||
    normalized.includes("help") ||
    normalized.includes("what is this app")
  ) {
    return {
      normalizedQuery: normalized,
      intent: "app_info",
      timeSlot,
      explicitCityMention,
      cropMention,
      isEllipticalFollowUp: false,
      rawLanguageDetected: "hinglish",
    };
  }

  // Point to point travel queries
  if (
    (normalized.includes("jana hai") ||
      normalized.includes("travel") ||
      normalized.includes("yatra") ||
      normalized.includes("rasta") ||
      normalized.includes("route")) &&
    (normalized.includes(" se ") || normalized.includes(" to "))
  ) {
    return {
      normalizedQuery: normalized,
      intent: "travel_weather",
      timeSlot,
      explicitCityMention,
      cropMention,
      isEllipticalFollowUp: false,
      rawLanguageDetected: "hinglish",
    };
  }

  // Multi-turn contextual inference for elliptical queries:
  // e.g. "aur kal?", "raat ko?", "kis time?"
  if (isElliptical && history && history.length > 0) {
    const lastUser = [...history].reverse().find((h) => h.role === "user");
    if (lastUser) {
      const prevParsed = parseWeatherIntentAndSlots(lastUser.content);
      if (prevParsed.intent !== "general_summary" && prevParsed.intent !== "unsupported") {
        return {
          normalizedQuery: normalized,
          intent: prevParsed.intent,
          timeSlot,
          explicitCityMention: explicitCityMention || prevParsed.explicitCityMention,
          cropMention: cropMention || prevParsed.cropMention,
          isEllipticalFollowUp: true,
          rawLanguageDetected: "hinglish",
        };
      }
    }
  }

  const isRainWord =
    normalized.includes("barish") ||
    normalized.includes("baarish") ||
    normalized.includes("rain") ||
    normalized.includes("pani") ||
    normalized.includes("बूंदाबांदी") ||
    normalized.includes("वर्षा");

  const isTimingWord =
    normalized.includes("kis time") ||
    normalized.includes("kab") ||
    normalized.includes("kitne baje") ||
    normalized.includes("time period") ||
    normalized.includes("samay") ||
    normalized.includes("kis samay") ||
    normalized.includes("when") ||
    normalized.includes("timing");

  const isMaxWord =
    normalized.includes("zyada") ||
    normalized.includes("jyada") ||
    normalized.includes("sabse zyada") ||
    normalized.includes("highest") ||
    normalized.includes("maximum") ||
    normalized.includes("peak");

  // 1. Rain Timing: e.g. "aaj kis time period me jyada barish hogi", "aaj barish kab hogi", "aj barish kb hogi"
  if (isRainWord && (isTimingWord || (isMaxWord && normalized.includes("kab")))) {
    return {
      normalizedQuery: normalized,
      intent: "rain_timing",
      timeSlot,
      explicitCityMention,
      cropMention,
      isEllipticalFollowUp: isElliptical,
      rawLanguageDetected: "hinglish",
    };
  }

  const isProbabilityWord =
    normalized.includes("chance") ||
    normalized.includes("sambhavna") ||
    normalized.includes("probability") ||
    normalized.includes("%") ||
    normalized.includes("prashat") ||
    normalized.includes("pratishat");

  // 2. Rain Quantitative Amount: e.g. "baarish kitni mm ho sakti hai", "kitne mm barish"
  if (
    isRainWord &&
    !isProbabilityWord &&
    (normalized.includes("mm") ||
      normalized.includes("millimeter") ||
      normalized.includes("centimeter") ||
      normalized.includes("kitni barish hogi") ||
      normalized.includes("kitna barish hoga"))
  ) {
    return {
      normalizedQuery: normalized,
      intent: "rain_amount",
      timeSlot,
      explicitCityMention,
      cropMention,
      isEllipticalFollowUp: isElliptical,
      rawLanguageDetected: "hinglish",
    };
  }

  // 3. Temperature Timing: e.g. "aaj temperature kab sabse zyada hoga", "kal sabse zyada garmi kis time hogi"
  const isTempWord =
    normalized.includes("temperature") ||
    normalized.includes("garmi") ||
    normalized.includes("thand") ||
    normalized.includes("taapman");

  if (isTempWord && (isTimingWord || (isMaxWord && (normalized.includes("time") || normalized.includes("kab"))))) {
    return {
      normalizedQuery: normalized,
      intent: "temperature_timing",
      timeSlot,
      explicitCityMention,
      cropMention,
      isEllipticalFollowUp: isElliptical,
      rawLanguageDetected: "hinglish",
    };
  }

  // 4. Farmer Spray Window
  if (
    normalized.includes("spray") ||
    normalized.includes("chhidkav") ||
    normalized.includes("dawa") ||
    normalized.includes("kitnashak") ||
    normalized.includes("pesticide")
  ) {
    return {
      normalizedQuery: normalized,
      intent: "farmer_spray",
      timeSlot,
      explicitCityMention,
      cropMention,
      isEllipticalFollowUp: isElliptical,
      rawLanguageDetected: "hinglish",
    };
  }

  // 5. Farmer Irrigation
  if (
    normalized.includes("irrigation") ||
    normalized.includes("sinchai") ||
    normalized.includes("pani dena") ||
    normalized.includes("water the crop")
  ) {
    return {
      normalizedQuery: normalized,
      intent: "farmer_irrigation",
      timeSlot,
      explicitCityMention,
      cropMention,
      isEllipticalFollowUp: isElliptical,
      rawLanguageDetected: "hinglish",
    };
  }

  // 5.5 Farmer Pest / Disease Outbreak Forecast (CHANGE_004)
  const isPestWord =
    normalized.includes("pest") ||
    normalized.includes("disease") ||
    normalized.includes("bimari") ||
    normalized.includes("beemari") ||
    normalized.includes("rog") ||
    normalized.includes("keeda") ||
    normalized.includes("kida") ||
    normalized.includes("kide") ||
    normalized.includes("sundi") ||
    normalized.includes("chhedak") ||
    normalized.includes("fungus") ||
    normalized.includes("faphund") ||
    normalized.includes("blast") ||
    normalized.includes("rust") ||
    normalized.includes("blight") ||
    normalized.includes("rot") ||
    normalized.includes("bollworm") ||
    normalized.includes("worm") ||
    normalized.includes("borer") ||
    normalized.includes("caterpillar") ||
    normalized.includes("aphid") ||
    normalized.includes("whitefly") ||
    normalized.includes("hopper") ||
    normalized.includes("outbreak") ||
    normalized.includes("keet") ||
    normalized.includes("कीट") ||
    normalized.includes("रोग") ||
    normalized.includes("बीमारी") ||
    normalized.includes("सुंडी") ||
    normalized.includes("छेदक") ||
    normalized.includes("झुलसा") ||
    ((normalized.includes("problem") ||
      normalized.includes("problems") ||
      normalized.includes("samasya") ||
      normalized.includes("khatra") ||
      normalized.includes("nuksan")) &&
      (Boolean(cropMention) ||
        normalized.includes("fasal") ||
        normalized.includes("crop") ||
        normalized.includes("kheti")));

  if (isPestWord) {
    return {
      normalizedQuery: normalized,
      intent: "pest_forecast",
      timeSlot,
      explicitCityMention,
      cropMention,
      isEllipticalFollowUp: isElliptical,
      rawLanguageDetected: "hinglish",
    };
  }

  // 6. Farmer General / Crop Specific: e.g. "farmer ke liye aaj weather kaisa hai", "soybean ke liye kal ka mausam"
  if (
    normalized.includes("farmer") ||
    normalized.includes("kisan") ||
    normalized.includes("kheti") ||
    Boolean(cropMention)
  ) {
    return {
      normalizedQuery: normalized,
      intent: "farmer_general",
      timeSlot,
      explicitCityMention,
      cropMention,
      isEllipticalFollowUp: isElliptical,
      rawLanguageDetected: "hinglish",
    };
  }

  // 7. Thunderstorm, Lightning, and Severe Weather Risk
  if (
    normalized.includes("thunderstorm") ||
    normalized.includes("bijli") ||
    normalized.includes("lightning") ||
    normalized.includes("toofan") ||
    normalized.includes("storm") ||
    normalized.includes("weather kharab") ||
    normalized.includes("mausam kharab") ||
    normalized.includes("safe hai kya")
  ) {
    return {
      normalizedQuery: normalized,
      intent: "thunderstorm_risk",
      timeSlot,
      explicitCityMention,
      cropMention,
      isEllipticalFollowUp: isElliptical,
      rawLanguageDetected: "hinglish",
    };
  }

  // 8. Flood / Inundation & Multi-day heavy rain
  if (
    normalized.includes("flood") ||
    normalized.includes("badh") ||
    normalized.includes("waterlogging") ||
    normalized.includes("jalbharav") ||
    (timeSlot.isMultiDay && timeSlot.multiDayCount === 5 && isRainWord)
  ) {
    return {
      normalizedQuery: normalized,
      intent: "flood_inundation",
      timeSlot,
      explicitCityMention,
      cropMention,
      isEllipticalFollowUp: isElliptical,
      rawLanguageDetected: "hinglish",
    };
  }

  // 9. Multi-Day Forecast Summary: e.g. "agle 3 din ka weather", "is week rain ka kya scene hai", "agle hafte"
  if (timeSlot.isMultiDay) {
    return {
      normalizedQuery: normalized,
      intent: "multi_day_summary",
      timeSlot,
      explicitCityMention,
      cropMention,
      isEllipticalFollowUp: isElliptical,
      rawLanguageDetected: "hinglish",
    };
  }

  // 10. Rain Probability & General Rain query: e.g. "aaj barish hogi kya", "kal rain hogi kya"
  if (isRainWord) {
    return {
      normalizedQuery: normalized,
      intent: "rain_probability_amount",
      timeSlot,
      explicitCityMention,
      cropMention,
      isEllipticalFollowUp: isElliptical,
      rawLanguageDetected: "hinglish",
    };
  }

  // 10. Wind & Gust
  if (
    normalized.includes("hawa") ||
    normalized.includes("wind") ||
    normalized.includes("gust") ||
    normalized.includes("tez hawa") ||
    normalized.includes("aandhi")
  ) {
    return {
      normalizedQuery: normalized,
      intent: "wind_gust",
      timeSlot,
      explicitCityMention,
      cropMention,
      isEllipticalFollowUp: isElliptical,
      rawLanguageDetected: "hinglish",
    };
  }

  // 11. Sky / Sunshine / Dhoop
  if (
    normalized.includes("dhoop") ||
    normalized.includes("sunny") ||
    normalized.includes("sunshine") ||
    normalized.includes("badal") ||
    normalized.includes("cloud") ||
    normalized.includes("clear sky")
  ) {
    return {
      normalizedQuery: normalized,
      intent: "sky_sunshine",
      timeSlot,
      explicitCityMention,
      cropMention,
      isEllipticalFollowUp: isElliptical,
      rawLanguageDetected: "hinglish",
    };
  }

  // 12. Humidity / Nami
  if (
    normalized.includes("humidity") ||
    normalized.includes("nami") ||
    normalized.includes("moisture") ||
    normalized.includes("ardrata") ||
    normalized.includes("आर्द्रता")
  ) {
    return {
      normalizedQuery: normalized,
      intent: "humidity",
      timeSlot,
      explicitCityMention,
      cropMention,
      isEllipticalFollowUp: isElliptical,
      rawLanguageDetected: "hinglish",
    };
  }

  // 13. Temperature Range (Garmi / Thand / Max / Min)
  if (
    isTempWord ||
    normalized.includes("hot") ||
    normalized.includes("cold") ||
    normalized.includes("chilly") ||
    normalized.includes("sardi")
  ) {
    return {
      normalizedQuery: normalized,
      intent: "temperature_range",
      timeSlot,
      explicitCityMention,
      cropMention,
      isEllipticalFollowUp: isElliptical,
      rawLanguageDetected: "hinglish",
    };
  }

  // 15. General Weather Summary (Default)
  return {
    normalizedQuery: normalized,
    intent: "general_summary",
    timeSlot,
    explicitCityMention,
    cropMention,
    isEllipticalFollowUp: isElliptical,
    rawLanguageDetected: "hinglish",
  };
}

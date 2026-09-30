import { Language } from "@/lib/types";

export type DetectedConversationLanguage = "hi" | "en" | "hinglish" | "mr";

const MARATHI_KEYWORDS = [
  "आहे",
  "नाही",
  "कसे",
  "पाऊस",
  "पडेल",
  "राहील",
  "शेतात",
  "पिकांवर",
  "फवारणी",
  "होईल",
  "काय",
  "कधी",
  "करावे",
  "करा",
  "शेतकरी",
  "हवामान",
  "पुण्यात",
  "गाडीने",
  "मुसळधार",
  "पिकाला",
  "दिवसांत",
  "गगनदृष्टी",
  "ऍपमध्ये",
  "तपशील",
  "प्रवास",
];

const MARATHI_ROMAN_PATTERNS = [
  /\bpaus\b/i,
  /\bpadel\b/i,
  /\bkahe\b/i,
  /\bkasa\b/i,
  /\bkase\b/i,
  /\brahil\b/i,
  /\bshetat\b/i,
  /\bpikanvar\b/i,
  /\bfavarni\b/i,
  /\bpravas\b/i,
];

// Common transliterated Hindi / Hinglish keywords and tokens
const HINGLISH_PATTERNS = [
  /\baaj\b/i,
  /\baj\b/i,
  /\bkal\b/i,
  /\bkl\b/i,
  /\bparso\b/i,
  /\bkaisa\b/i,
  /\bkaise\b/i,
  /\bkaisi\b/i,
  /\bkesa\b/i,
  /\bkese\b/i,
  /\bkasa\b/i,
  /\brahega\b/i,
  /\brahegi\b/i,
  /\brhega\b/i,
  /\brhegi\b/i,
  /\bhoga\b/i,
  /\bhogi\b/i,
  /\bmausam\b/i,
  /\bmosam\b/i,
  /\bmausm\b/i,
  /\bbaarish\b/i,
  /\bbarish\b/i,
  /\bbaris\b/i,
  /\bgarmi\b/i,
  /\bthand\b/i,
  /\bpaani\b/i,
  /\bpani\b/i,
  /\bse\b/i,
  /\bme\b/i,
  /\bmein\b/i,
  /\bpar\b/i,
  /\bko\b/i,
  /\bki\b/i,
  /\bka\b/i,
  /\bke\b/i,
  /\bchahiye\b/i,
  /\btheek\b/i,
  /\bthik\b/i,
  /\bkarein\b/i,
  /\bkare\b/i,
  /\bkarun\b/i,
  /\bkaru\b/i,
  /\bkyun\b/i,
  /\bkyu\b/i,
  /\bkya\b/i,
  /\bkitna\b/i,
  /\bkitni\b/i,
  /\bkitne\b/i,
  /\bkab\b/i,
  /\bkb\b/i,
  /\bzyada\b/i,
  /\bjyada\b/i,
  /\bkahan\b/i,
  /\bjaana\b/i,
  /\bjana\b/i,
  /\bjayein\b/i,
  /\byatra\b/i,
  /\bsafar\b/i,
  /\braat\b/i,
  /\bsubah\b/i,
  /\bdopehar\b/i,
  /\bdopahar\b/i,
  /\bsham\b/i,
  /\bshaam\b/i,
  /\bkhet\b/i,
  /\bfasal\b/i,
  /\bchana\b/i,
  /\bsoyabean\b/i,
  /\bgehu\b/i,
  /\bdhan\b/i,
  /\bpaala\b/i,
  /\bpala\b/i,
  /\bola\b/i,
  /\bchata\b/i,
  /\bchaata\b/i,
  /\bdhoop\b/i,
  /\bhawa\b/i,
  /\bbatao\b/i,
  /\bbtao\b/i,
  /\bscene\b/i,
  /\bbike\s+se\b/i,
  /\bcar\s+se\b/i,
];

/**
 * Detect query language independently of the website UI language setting:
 * - Returns "mr" for Marathi
 * - Returns "hi" for Devanagari Hindi
 * - Returns "hinglish" for Roman Hindi / Hinglish queries
 * - Returns "en" for English queries
 */
export function detectQueryLanguage(query: string): DetectedConversationLanguage {
  const text = query.trim();
  if (!text) return "en";

  // 1. Check for specific Marathi markers
  for (const kw of MARATHI_KEYWORDS) {
    if (text.includes(kw)) {
      return "mr";
    }
  }

  for (const pattern of MARATHI_ROMAN_PATTERNS) {
    if (pattern.test(text)) {
      return "mr";
    }
  }

  // 2. Check for Devanagari characters (Unicode range \u0900 - \u097F)
  const devanagariMatches = text.match(/[\u0900-\u097F]/g);
  if (devanagariMatches && devanagariMatches.length >= 2) {
    return "hi";
  }

  // 3. Check for Hinglish / Roman Hindi vocabulary
  let hinglishHits = 0;
  for (const pattern of HINGLISH_PATTERNS) {
    if (pattern.test(text)) {
      hinglishHits++;
      if (hinglishHits >= 2) {
        return "hinglish";
      }
    }
  }

  if (hinglishHits === 1 && text.split(/\s+/).length <= 5) {
    return "hinglish";
  }

  return "en";
}

/**
 * Maps the detected conversation language into standard Language code:
 */
export function resolveTargetLanguage(
  detected: DetectedConversationLanguage,
  fallbackPreference: Language = "en"
): Language {
  if (detected === "mr") {
    return "mr";
  }
  if (detected === "hi" || detected === "hinglish") {
    return "hi";
  }
  if (detected === "en") {
    if (fallbackPreference === "mr") return "mr";
    if (fallbackPreference === "hi") return "hi";
    return "en";
  }
  return fallbackPreference;
}

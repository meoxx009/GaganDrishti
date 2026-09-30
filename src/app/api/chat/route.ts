import { NextRequest, NextResponse } from "next/server";
import { ChatApiRequest, ChatApiResponse } from "@/lib/chat/types";
import { getDeterministicFallbackReply } from "@/lib/chat/chatFallbackEngine";
import {
  parseTravelQuery,
  assessTravelWeather,
  generateDeterministicTravelReply,
  resolveIndianLocation,
  KNOWN_LOCATIONS,
} from "@/lib/weather/travelWeather";
import { fetchCityWeather } from "@/lib/weather/weatherService";
import { detectQueryLanguage, resolveTargetLanguage } from "@/lib/chat/languageDetector";
import { City } from "@/lib/types";
import { extractCropFromQuery } from "@/lib/crops";
import { evaluateFarmerWeatherAdvisory } from "@/lib/weather/farmerDecisionEngine";
import { evaluateWeatherRisks } from "@/lib/weather/riskEngine";
import { CropId } from "@/lib/weather/farmerTypes";
import { parseWeatherIntentAndSlots } from "@/lib/chat/intentParser";
import { computeDeterministicWeatherAnswer } from "@/lib/chat/weatherAnswerEngine";

const DEFAULT_GEMINI_MODEL = "gemini-2.0-flash";
const API_TIMEOUT_MS = 6500; // 6.5-second strict timeout to prevent hanging

export async function POST(req: NextRequest): Promise<NextResponse<ChatApiResponse>> {
  try {
    const body: Partial<ChatApiRequest> = await req.json();

    // Validate request schema
    if (!body || typeof body.message !== "string" || !body.message.trim()) {
      return NextResponse.json(
        {
          reply: "Please provide a valid question.",
          isFallback: true,
        },
        { status: 400 }
      );
    }

    const {
      message,
      language: reqLanguage = "en",
      city: initialCity,
      weather: initialWeather = null,
      selectedCrop,
      selectedStage,
      history = [],
    } = body as ChatApiRequest;

    if (!initialCity || !initialCity.nameEn) {
      return NextResponse.json(
        {
          reply: "City context is required.",
          isFallback: true,
        },
        { status: 400 }
      );
    }

    // Language independence: detect user's query language regardless of website UI language
    const detectedLang = detectQueryLanguage(message);
    const resolvedLang = resolveTargetLanguage(detectedLang, reqLanguage);

    // Read server-only environment variables
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;

    // 1. Detect if this is a point-to-point travel query
    const travelParsed = parseTravelQuery(message);
    let travelAssessment = null;
    if (travelParsed.isTravelQuery && travelParsed.originName && travelParsed.destinationName) {
      try {
        travelAssessment = await assessTravelWeather(
          travelParsed.originName,
          travelParsed.destinationName,
          travelParsed.timePeriod,
          travelParsed.vehicleType
        );
      } catch (err) {
        console.error("Travel weather assessment error:", err);
      }
    }

    // 2. City Entity Resolution: Check if user explicitly asked about a DIFFERENT city than currently selected
    let effectiveCity = initialCity;
    let effectiveWeather = initialWeather;

    if (!travelAssessment) {
      const qLower = message.toLowerCase();
      // Look for a matched known location or Indian city in the user query
      const explicitLoc = KNOWN_LOCATIONS.find((loc) => {
        const en = loc.name.toLowerCase();
        const hi = loc.nameHi ? loc.nameHi.toLowerCase() : "";
        const initHi = initialCity.nameHi ? initialCity.nameHi.toLowerCase() : "";
        return (
          (qLower.includes(en) || (loc.nameHi && message.includes(loc.nameHi))) &&
          en !== initialCity.nameEn.toLowerCase() &&
          (!initHi || hi !== initHi)
        );
      });

      if (explicitLoc) {
        const queryCity: City = {
          id: explicitLoc.name.toLowerCase(),
          nameEn: explicitLoc.name,
          nameHi: explicitLoc.nameHi || explicitLoc.name,
          stateEn: explicitLoc.state || "India",
          stateHi: explicitLoc.state || "भारत",
          lat: explicitLoc.lat,
          lon: explicitLoc.lon,
        };
        try {
          const freshWeather = await fetchCityWeather(queryCity);
          if (freshWeather) {
            effectiveCity = queryCity;
            effectiveWeather = freshWeather;
          }
        } catch (err) {
          console.error(`Failed to fetch weather for explicitly queried city ${explicitLoc.name}:`, err);
        }
      }
    }

    // 3. Pre-compute Deterministic Weather Facts & Intent
    const parsedQuery = parseWeatherIntentAndSlots(message, history);
    const deterministicResult = computeDeterministicWeatherAnswer(
      parsedQuery,
      effectiveCity,
      effectiveWeather,
      detectedLang,
      selectedCrop
    );

    // 4. If travel query resolved and no API key, return deterministic travel reply
    if (travelAssessment) {
      if (!apiKey) {
        const reply = generateDeterministicTravelReply(travelAssessment, resolvedLang);
        return NextResponse.json({
          reply,
          isFallback: true,
          evidence: deterministicResult.evidence,
        });
      }
    } else if (!apiKey) {
      // Normal weather / farmer query: return precomputed deterministic answer directly
      return NextResponse.json({
        reply: deterministicResult.reply,
        isFallback: true,
        evidence: deterministicResult.evidence,
      });
    }

    // Language-specific directive for Gemini
    const languageInstruction =
      detectedLang === "hinglish"
        ? "Target language: Hinglish (Conversational Roman Hindi, e.g., 'Aaj Bhopal me halki barish ki sambhavna hai'). The user asked in Roman Hindi / Hinglish, so reply naturally in conversational Roman Hindi. Do NOT respond in pure English."
        : resolvedLang === "mr"
        ? "Target language: Marathi (मराठी Devanagari). Reply in clear, respectful, natural Marathi (मराठी) in Devanagari script (e.g., 'आज पुण्यात पावसाची शक्यता...')."
        : resolvedLang === "hi"
        ? "Target language: Hindi (हिंदी Devanagari). Reply in clear, respectful, natural Hindi (हिंदी) in Devanagari script."
        : "Target language: English. Reply in clear, professional English.";

    // 5. Prepare telemetry context
    let contextTelemetryStr = "";
    let systemInstruction = "";

    if (travelAssessment) {
      const transport = travelAssessment.transportSuitability;
      const transportTelemetry = transport
        ? `\n- Vehicle Suitability Analysis:\n  * Two-Wheeler (Bike/Scooter): ${transport.twoWheeler.statusEn} (${transport.twoWheeler.noteEn})\n  * Four-Wheeler (Car/Bus): ${transport.fourWheeler.statusEn} (${transport.fourWheeler.noteEn})`
        : "";

      contextTelemetryStr = `
POINT-TO-POINT TRAVEL TELEMETRY (Open-Meteo Forecast API):
- Origin: ${travelAssessment.origin.name} (${travelAssessment.origin.state || "India"})
  * Expected Window Temperature: ~${travelAssessment.originSummary.avgTemp}°C (Min ${travelAssessment.originSummary.minTemp}°C, Max ${travelAssessment.originSummary.maxTemp}°C)
  * Rain Probability: ${travelAssessment.originSummary.maxRainProb}% (Precipitation: ${travelAssessment.originSummary.sumPrecipitation} mm)
  * Wind: ${travelAssessment.originSummary.maxWindSpeed} km/h (Peak Gusts: ${travelAssessment.originSummary.maxWindGusts} km/h)
  * Dominant Condition: ${travelAssessment.originSummary.dominantConditionEn} / ${travelAssessment.originSummary.dominantConditionHi}
  * Thunderstorm Detected: ${travelAssessment.originSummary.hasThunderstorm ? "YES" : "NO"}

- Destination: ${travelAssessment.destination.name} (${travelAssessment.destination.state || "India"})
  * Expected Window Temperature: ~${travelAssessment.destinationSummary.avgTemp}°C
  * Rain Probability: ${travelAssessment.destinationSummary.maxRainProb}% (Precipitation: ${travelAssessment.destinationSummary.sumPrecipitation} mm)
  * Wind: ${travelAssessment.destinationSummary.maxWindSpeed} km/h (Peak Gusts: ${travelAssessment.destinationSummary.maxWindGusts} km/h)
  * Dominant Condition: ${travelAssessment.destinationSummary.dominantConditionEn} / ${travelAssessment.destinationSummary.dominantConditionHi}
  * Thunderstorm Detected: ${travelAssessment.destinationSummary.hasThunderstorm ? "YES" : "NO"}

- Target Time Window: ${travelAssessment.timeWindow.labelEn} / ${travelAssessment.timeWindow.labelHi}
- Deterministic Meteorological Suitability: ${travelAssessment.levelLabelEn} [RISK TIER: ${travelAssessment.riskLevel.toUpperCase()}]
- Primary Meteorological Observations: ${travelAssessment.primaryConcernsEn.join(" ")}
- Recommended Practical Precautions: ${travelAssessment.precautionsEn.join(" ")}${transportTelemetry}
`;

      systemInstruction = `
You are "GaganDrishti", a bilingual Indian weather intelligence assistant.
${languageInstruction}

MANDATORY TRAVEL-WEATHER INSTRUCTIONS:
1. Ground all numerical values strictly in the travel telemetry provided below. Never invent or hallucinate weather values.
2. The weather source is "Open-Meteo Numerical Forecast".
3. Evaluate ONLY meteorological suitability from the supplied origin, destination and route-sample forecast context.
4. NEVER claim to know traffic, accidents, exact road conditions, road closures, potholes, or crime.
5. NEVER describe a journey as "100% safe" or "guaranteed safe". Use wording such as "weather conditions appear generally favourable" or "exercise weather caution".
6. If severe weather (thunderstorm, heavy rain, gale winds, dense fog) is present, advise considering delaying travel and consulting official local administrative/traffic bulletins.
7. Structure your reply clearly: Direct conclusion first, summary of origin & destination, vehicle suitability, and driving precautions.

${contextTelemetryStr}
`;
    } else {
      // Normal selected-city context
      const qLower = message.toLowerCase();
      const extractedCrop = extractCropFromQuery(message);
      const cropToUse: CropId = (extractedCrop?.id as CropId) || selectedCrop || "wheat";
      const cropNameHi = extractedCrop?.nameHi || "फसल";
      const cropNameEn = extractedCrop?.nameEn || "Crop";

      const isFarmingQuery =
        parsedQuery.intent === "farmer_spray" ||
        parsedQuery.intent === "farmer_irrigation" ||
        Boolean(extractedCrop);

      const isFloodRiskQuery = parsedQuery.intent === "flood_inundation";

      let farmerIntelligenceBlock = "";
      if (isFarmingQuery && effectiveWeather) {
        const farmerDecision = evaluateFarmerWeatherAdvisory(effectiveWeather, cropToUse, selectedStage || "growing");
        const next5hProgression = effectiveWeather.hourly.slice(0, 5).map((h, i) =>
          `  * +${i + 1}h: Temp ${h.temperature}°C, RainProb ${h.precipitationProbability}%, Precip ${h.precipitation}mm, Wind ${h.windSpeed}km/h (Gusts ${h.windGusts}km/h)`
        ).join("\n");

        farmerIntelligenceBlock = `
AGROMETEOROLOGICAL DECISION SUPPORT:
- Targeted Crop: ${cropNameEn} (${cropNameHi})
- Spray Window Status: ${farmerDecision.sprayStatus}
  * Evaluated Reason: ${farmerDecision.sprayReasonEn} / ${farmerDecision.sprayReasonHi}
- Irrigation Window Status: ${farmerDecision.irrigationStatus}
  * Evaluated Reason: ${farmerDecision.irrigationReasonEn} / ${farmerDecision.irrigationReasonHi}
- Next 5 Hours Hourly Progression:
${next5hProgression}
- Operational Boundaries: Never recommend pesticide/chemical brands or dosages. Optimal spray wind speed is 5-15 km/h. Advise against spraying if rain is expected or wind >15 km/h.
`;
      }

      let floodRiskIntelligenceBlock = "";
      if (isFloodRiskQuery && effectiveWeather) {
        const riskAssessment = evaluateWeatherRisks(effectiveWeather);
        const sum5d = Math.round(effectiveWeather.daily.slice(0, 5).reduce((s, d) => s + (d.precipitationSum || 0), 0) * 10) / 10;
        const fiveDayOutlook = effectiveWeather.daily.slice(0, 5).map((d, i) =>
          `  * Day ${i + 1} (${d.date}): RainSum ${d.precipitationSum ?? 0}mm, RainProbMax ${d.precipitationProbabilityMax ?? 0}%, TempMax ${d.tempMax}°C, WindSpeedMax ${d.windSpeedMax ?? "N/A"}km/h`
        ).join("\n");

        floodRiskIntelligenceBlock = `
INUNDATION & MULTI-DAY RAINFALL TELEMETRY:
- Meteorological Risk Tier: ${riskAssessment.overallLevel}
- 5-Day Cumulative Precipitation: ${sum5d} mm
- 5-Day Daily Progression:
${fiveDayOutlook}
- HYDROLOGICAL SCOPE LIMITATION: Open-Meteo forecast models atmospheric rain only. It does NOT track river levels, upstream dam releases, or municipal drainage blockages. Always refer to CWC / SDMA for official flood alerts.
`;
      }

      const weatherContextStr = effectiveWeather && effectiveWeather.current
        ? `
CURRENT TELEMETRY (Open-Meteo Forecast API):
- City: ${effectiveCity.nameEn} (${effectiveCity.nameHi}), ${effectiveCity.stateEn} [GPS: ${effectiveCity.lat}°N, ${effectiveCity.lon}°E]
- Current Temperature: ${effectiveWeather.current.temperature}°C (Feels like ${effectiveWeather.current.apparentTemperature}°C)
- Relative Humidity: ${effectiveWeather.current.relativeHumidity}%
- Wind Speed: ${effectiveWeather.current.windSpeed} km/h (Gusts: ${effectiveWeather.current.windGusts} km/h)
- Precipitation: ${effectiveWeather.current.precipitation} mm (Rain: ${effectiveWeather.current.rain} mm)
- Cloud Cover: ${effectiveWeather.current.cloudCover}%
- WMO Condition: ${effectiveWeather.current.conditionEn} / ${effectiveWeather.current.conditionHi}
- Today's Max Temp: ${effectiveWeather.daily[0]?.tempMax ?? "N/A"}°C, Min: ${effectiveWeather.daily[0]?.tempMin ?? "N/A"}°C
- Today's Rain Probability Max: ${effectiveWeather.daily[0]?.precipitationProbabilityMax ?? 0}%, Rain Sum: ${effectiveWeather.daily[0]?.precipitationSum ?? 0} mm
- Tomorrow's Max Temp: ${effectiveWeather.daily[1]?.tempMax ?? "N/A"}°C, Rain Probability: ${effectiveWeather.daily[1]?.precipitationProbabilityMax ?? 0}%
${farmerIntelligenceBlock}${floodRiskIntelligenceBlock}
`
        : `No current weather telemetry available for ${effectiveCity.nameEn}.`;

      systemInstruction = `
You are "GaganDrishti", a bilingual Indian weather intelligence assistant engineered for citizens and farmers (SIH 2026).
${languageInstruction}

AUTHORITATIVE PRE-CALCULATED FACTS (USE THESE EXACT NUMBERS):
- Direct Conclusion: ${deterministicResult.directConclusion}
- Evaluated Intent: ${parsedQuery.intent}
- Target Forecast Window: ${deterministicResult.evidence.targetWindow}
- Key Verified Metrics: ${JSON.stringify(deterministicResult.evidence.keyMetrics)}

CRITICAL RULES:
1. ANSWER DIRECTLY: In the very first sentence, state the direct conclusion or weather status.
2. DO NOT INTRODUCE YOURSELF: NEVER start with "नमस्ते! मैं गगनदृष्टि हूँ" or "Hello! I am GaganDrishti" when asked about weather, temperature, rain, or farming.
3. NEVER OUTPUT INTERNAL THOUGHTS: Do NOT generate <thought> blocks, chain-of-thought, drafting notes, or debug messages.
4. Ground all numerical facts exclusively in the verified metrics and telemetry provided above. Never fabricate weather values or hours.
5. If the user asked in Roman Hindi (Hinglish), reply naturally in conversational Roman Hindi.
6. The weather source is "Open-Meteo Forecast API". Never claim this is an IMD warning unless official IMD bulletin is cited.

${weatherContextStr}
`;
    }

    // Construct request to Gemini REST API with fallback models
    const candidateModels = [model, "gemini-2.0-flash", "gemini-1.5-flash"];
    const uniqueModels = Array.from(new Set(candidateModels));

    // Prepare contents payload including multi-turn history if provided
    const contentsPayload: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    if (history && history.length > 0) {
      // Include up to the last 4 turns to provide context without bloat
      const recentHistory = history.slice(-4);
      for (const item of recentHistory) {
        contentsPayload.push({
          role: item.role === "assistant" ? "model" : "user",
          parts: [{ text: item.content }],
        });
      }
    }

    contentsPayload.push({
      role: "user",
      parts: [{ text: message }],
    });

    let geminiSuccessReply = "";
    let modelUsed = "";

    for (const m of uniqueModels) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

      try {
        const geminiRes = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: systemInstruction }],
            },
            contents: contentsPayload,
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 800,
            },
          }),
        });

        clearTimeout(timeout);

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const parts = geminiData?.candidates?.[0]?.content?.parts || [];
          let replyText = parts
            .map((p: { text?: string }) => p.text || "")
            .join("")
            .trim();

          // Sanitize any model artifacts (<thought>, internal monologue)
          replyText = replyText.replace(/<thought>[\s\S]*?<\/thought>/gi, "").trim();
          replyText = replyText.replace(/^(internal reasoning|draft|system prompt|thought):\s*/i, "").trim();

          if (replyText) {
            geminiSuccessReply = replyText;
            modelUsed = m;
            break;
          }
        }
      } catch {
        clearTimeout(timeout);
        // Continue to fallback model or deterministic answer
      }
    }

    if (geminiSuccessReply) {
      return NextResponse.json({
        reply: geminiSuccessReply,
        isFallback: false,
        modelUsed,
        evidence: deterministicResult.evidence,
      });
    }

    // If Gemini models failed or timed out, return the pre-computed deterministic answer immediately
    if (travelAssessment) {
      return NextResponse.json({
        reply: generateDeterministicTravelReply(travelAssessment, resolvedLang),
        isFallback: true,
        evidence: deterministicResult.evidence,
      });
    }

    return NextResponse.json({
      reply: deterministicResult.reply,
      isFallback: true,
      evidence: deterministicResult.evidence,
    });
  } catch (error: unknown) {
    console.error("Chat API route error:", error);
    return NextResponse.json(
      {
        reply: "Service temporarily unavailable. Please try asking again.",
        isFallback: true,
      },
      { status: 500 }
    );
  }
}

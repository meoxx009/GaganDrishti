import { NextRequest, NextResponse } from "next/server";
import { ChatApiRequest, ChatApiResponse } from "@/lib/chat/types";
import { getDeterministicFallbackReply } from "@/lib/chat/chatFallbackEngine";

const DEFAULT_GEMINI_MODEL = "gemini-3.6-flash";
const API_TIMEOUT_MS = 12000; // 12-second timeout

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
      language = "en",
      city,
      weather = null,
      selectedCrop,
      selectedStage,
    } = body as ChatApiRequest;

    if (!city || !city.nameEn) {
      return NextResponse.json(
        {
          reply: "City context is required.",
          isFallback: true,
        },
        { status: 400 }
      );
    }

    // Read server-only environment variables
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;

    // If API key is not configured, immediately use deterministic fallback
    if (!apiKey) {
      const fallbackReply = getDeterministicFallbackReply(
        message,
        language,
        city,
        weather,
        selectedCrop,
        selectedStage
      );
      return NextResponse.json({
        reply: fallbackReply,
        isFallback: true,
      });
    }

    // Format current weather telemetry facts for the system prompt
    const weatherContextStr = weather && weather.current
      ? `
CURRENT TELEMETRY (Open-Meteo Forecast API):
- City: ${city.nameEn} (${city.nameHi}), ${city.stateEn} [GPS: ${city.lat}°N, ${city.lon}°E]
- Current Temperature: ${weather.current.temperature}°C (Feels like ${weather.current.apparentTemperature}°C)
- Relative Humidity: ${weather.current.relativeHumidity}%
- Wind Speed: ${weather.current.windSpeed} km/h (Gusts: ${weather.current.windGusts} km/h)
- Precipitation: ${weather.current.precipitation} mm (Rain: ${weather.current.rain} mm)
- Cloud Cover: ${weather.current.cloudCover}%
- WMO Condition: ${weather.current.conditionEn} / ${weather.current.conditionHi}
- Today's Max Temp: ${weather.daily[0]?.tempMax ?? "N/A"}°C, Min: ${weather.daily[0]?.tempMin ?? "N/A"}°C
- Today's Rain Probability Max: ${weather.daily[0]?.precipitationProbabilityMax ?? 0}%, Rain Sum: ${weather.daily[0]?.precipitationSum ?? 0} mm
- Tomorrow's Max Temp: ${weather.daily[1]?.tempMax ?? "N/A"}°C, Rain Probability: ${weather.daily[1]?.precipitationProbabilityMax ?? 0}%
- Selected Crop: ${selectedCrop || "Not specified"} (Stage: ${selectedStage || "Not specified"})
`
      : `No current weather telemetry available for ${city.nameEn}.`;

    const systemInstruction = `
You are "GaganDrishti", a bilingual Indian weather intelligence assistant engineered for citizens and farmers (SIH 2026).
Target language: ${language === "hi" ? "Hindi (हिंदी)" : "English"}.

STRICT INSTRUCTIONS:
1. Ground all numerical facts exclusively in the verified telemetry provided below. Never fabricate weather values.
2. The weather source is "Open-Meteo Forecast API". Never claim this is an IMD warning or official government alert bulletin.
3. For farming queries, offer conservative weather-based decision support only (e.g. soil drainage, wind drift considerations).
4. NEVER recommend pesticide or fertilizer brands, dosages, exact water quantities, or guarantee crop outcomes.
5. Politely decline non-weather and unrelated questions.
6. Keep answers concise (under 3-4 sentences where possible) for quick citizen and farmer readability.
7. Reply in ${language === "hi" ? "clear, respectful Hindi (हिंदी)" : "clear English"}.

${weatherContextStr}
`;

    // Construct request to Gemini REST API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

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
          contents: [
            {
              role: "user",
              parts: [{ text: message }],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1200,
          },
        }),
      });

      clearTimeout(timeout);

      if (!geminiRes.ok) {
        // Fall back gracefully
        const fallbackReply = getDeterministicFallbackReply(
          message,
          language,
          city,
          weather,
          selectedCrop,
          selectedStage
        );
        return NextResponse.json({
          reply: fallbackReply,
          isFallback: true,
        });
      }

      const geminiData = await geminiRes.json();
      const parts = geminiData?.candidates?.[0]?.content?.parts || [];
      const replyText = parts
        .map((p: { text?: string }) => p.text || "")
        .join("")
        .trim();

      if (!replyText) {
        throw new Error("Empty candidate received from Gemini.");
      }

      return NextResponse.json({
        reply: replyText,
        isFallback: false,
        modelUsed: model,
      });
    } catch {
      clearTimeout(timeout);
      // On timeout or fetch error: Fall back deterministically without crashing
      const fallbackReply = getDeterministicFallbackReply(
        message,
        language,
        city,
        weather,
        selectedCrop,
        selectedStage
      );
      return NextResponse.json({
        reply: fallbackReply,
        isFallback: true,
      });
    }
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json(
      {
        reply: "Service temporarily unavailable. Please try asking again.",
        isFallback: true,
      },
      { status: 500 }
    );
  }
}

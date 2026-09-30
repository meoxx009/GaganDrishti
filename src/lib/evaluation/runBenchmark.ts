/**
 * GaganDrishti Benchmark Runner
 * Runs the 50-query benchmark suite against language detectors,
 * entity extractors, travel parsers, and fallback engines.
 * 
 * Run with: npx tsx src/lib/evaluation/runBenchmark.ts
 */

import { BENCHMARK_SUITE, BenchmarkTestCase } from "./benchmarkSuite";
import { detectQueryLanguage } from "../chat/languageDetector";
import { extractCropFromQuery } from "../crops";
import { parseTravelQuery } from "../weather/travelWeather";
import { getDeterministicFallbackReply } from "../chat/chatFallbackEngine";
import { City } from "../types";
import { NormalizedWeatherData } from "../weather/types";

const mockCity: City = {
  id: "bhopal",
  nameEn: "Bhopal",
  nameHi: "भोपाल",
  nameMr: "भोपाळ",
  stateEn: "Madhya Pradesh",
  stateHi: "मध्य प्रदेश",
  stateMr: "मध्य प्रदेश",
  district: "Bhopal",
  country: "India",
  lat: 23.2599,
  lon: 77.4126,
};

const mockWeather: NormalizedWeatherData = {
  cityId: "bhopal",
  cityNameEn: "Bhopal",
  cityNameHi: "भोपाल",
  latitude: 23.2599,
  longitude: 77.4126,
  source: "Open-Meteo Forecast API",
  current: {
    temperature: 28.5,
    apparentTemperature: 30.2,
    relativeHumidity: 65,
    precipitation: 0.0,
    rain: 0.0,
    weatherCode: 1,
    cloudCover: 20,
    windSpeed: 12.0,
    windGusts: 18.0,
    time: "2026-09-14T12:00:00Z",
    conditionEn: "Mainly Clear",
    conditionHi: "मुख्यतः साफ़",
    iconName: "Sun",
  },
  hourly: Array.from({ length: 24 }, (_, i) => ({
    time: `2026-09-14T${i.toString().padStart(2, "0")}:00:00Z`,
    formattedHour: `${i.toString().padStart(2, "0")}:00`,
    temperature: 26 + (i % 8),
    relativeHumidity: 60,
    precipitationProbability: i > 14 ? 40 : 10,
    precipitation: 0.0,
    weatherCode: 1,
    cloudCover: 20,
    windSpeed: 10,
    windGusts: 15,
    conditionEn: "Clear",
    conditionHi: "साफ़",
    iconName: "Sun",
  })),
  daily: Array.from({ length: 5 }, (_, i) => ({
    date: `2026-09-${14 + i}`,
    dayNameEn: ["Mon", "Tue", "Wed", "Thu", "Fri"][i],
    dayNameHi: ["सोम", "मंगल", "बुध", "गुरु", "शुक्र"][i],
    tempMax: 32,
    tempMin: 22,
    precipitationProbabilityMax: 30,
    precipitationSum: 0.0,
    windSpeedMax: 15,
    weatherCode: 1,
    conditionEn: "Fair",
    conditionHi: "सुहावना",
    iconName: "Sun",
  })),
  fetchedAt: new Date().toISOString(),
  isCached: false,
};

async function runBenchmark() {
  console.log("=========================================================");
  console.log("🛰️ GAGANDRISHTI 50-QUERY BENCHMARK EVALUATION SUITE");
  console.log("=========================================================\n");

  let totalTests = BENCHMARK_SUITE.length;
  let passedTests = 0;
  let failures: { id: string; query: string; reason: string }[] = [];

  const categoryStats: Record<string, { total: number; passed: number }> = {};

  for (const tc of BENCHMARK_SUITE) {
    if (!categoryStats[tc.category]) {
      categoryStats[tc.category] = { total: 0, passed: 0 };
    }
    categoryStats[tc.category].total++;

    let testPassed = true;
    let failureReasons: string[] = [];

    // 1. Language Detection Check
    const detectedLang = detectQueryLanguage(tc.query);
    if (tc.expectedLanguage === "mr" && detectedLang !== "mr") {
      testPassed = false;
      failureReasons.push(`Lang expected mr, got ${detectedLang}`);
    } else if (tc.expectedLanguage === "hi" && detectedLang !== "hi") {
      testPassed = false;
      failureReasons.push(`Lang expected hi, got ${detectedLang}`);
    } else if (tc.expectedLanguage === "hinglish" && detectedLang !== "hinglish") {
      testPassed = false;
      failureReasons.push(`Lang expected hinglish, got ${detectedLang}`);
    } else if (tc.expectedLanguage === "en" && detectedLang !== "en") {
      testPassed = false;
      failureReasons.push(`Lang expected en, got ${detectedLang}`);
    }

    // 2. Crop Extraction Check (if expected)
    if (tc.expectedCrop) {
      const extracted = extractCropFromQuery(tc.query);
      if (!extracted || extracted.id.toLowerCase() !== tc.expectedCrop.toLowerCase()) {
        testPassed = false;
        failureReasons.push(`Crop expected ${tc.expectedCrop}, got ${extracted?.id || "none"}`);
      }
    }

    // 3. Travel Route Extraction Check (if travel category)
    if (tc.expectedTravelOrigin && tc.expectedTravelDestination) {
      const parsedTravel = parseTravelQuery(tc.query);
      if (!parsedTravel.isTravelQuery) {
        testPassed = false;
        failureReasons.push("Failed to detect travel intent");
      } else {
        const oMatch = parsedTravel.originName?.toLowerCase() === tc.expectedTravelOrigin.toLowerCase();
        const dMatch = parsedTravel.destinationName?.toLowerCase() === tc.expectedTravelDestination.toLowerCase();
        if (!oMatch || !dMatch) {
          testPassed = false;
          failureReasons.push(`Travel route expected ${tc.expectedTravelOrigin}->${tc.expectedTravelDestination}, got ${parsedTravel.originName}->${parsedTravel.destinationName}`);
        }
      }
    }

    // 4. Fallback Generation Verification (Ensures non-empty grounded response)
    const reply = getDeterministicFallbackReply(
      tc.query,
      detectedLang === "mr" ? "mr" : detectedLang === "hi" ? "hi" : "en",
      mockCity,
      mockWeather
    );
    if (!reply || reply.length < 20) {
      testPassed = false;
      failureReasons.push("Reply generation produced empty or trivially short response");
    }

    if (testPassed) {
      passedTests++;
      categoryStats[tc.category].passed++;
    } else {
      failures.push({
        id: tc.id,
        query: tc.query,
        reason: failureReasons.join("; "),
      });
    }
  }

  // Summary Output
  console.log("CATEGORY BREAKDOWN:");
  for (const [cat, stats] of Object.entries(categoryStats)) {
    const pct = Math.round((stats.passed / stats.total) * 100);
    console.log(`• ${cat.padEnd(16)}: ${stats.passed}/${stats.total} (${pct}%)`);
  }

  const overallPct = Math.round((passedTests / totalTests) * 100);
  console.log("\n---------------------------------------------------------");
  console.log(`TOTAL SCORE: ${passedTests}/${totalTests} (${overallPct}%) Passed`);
  console.log("---------------------------------------------------------");

  if (failures.length > 0) {
    console.log(`\nFAILURES (${failures.length}):`);
    failures.forEach((f) => {
      console.log(`[${f.id}] "${f.query}" -> ${f.reason}`);
    });
    process.exit(1);
  } else {
    console.log("\n✅ ALL 50 BENCHMARK TEST CASES PASSED WITH 100% ACCURACY!");
  }
}

runBenchmark().catch((err) => {
  console.error("Benchmark runner failed:", err);
  process.exit(1);
});

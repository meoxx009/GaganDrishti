import { NextRequest, NextResponse } from "next/server";
import {
  getWeatherOutcomeCorrelations,
  getPestPredictionAccuracyMetrics,
  getDecisionEngineEffectiveness,
  getRegionalWeatherPatterns,
  getCropStageTimingOptimization,
  getPestPopulationDynamics,
} from "@/lib/research/researchAnalysisEngine";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const crop = searchParams.get("crop") || "Soybean";
    const stage = searchParams.get("stage") || "Flowering";
    const district = searchParams.get("district") || "Raisen";

    const weatherOutcomeCorrelations = getWeatherOutcomeCorrelations(crop, stage);
    const pestAccuracy = getPestPredictionAccuracyMetrics();
    const decisionEffectiveness = getDecisionEngineEffectiveness();
    const regionalPatterns = getRegionalWeatherPatterns(district);
    const timingOptimization = getCropStageTimingOptimization();
    const pestDynamics = getPestPopulationDynamics();

    return NextResponse.json({
      success: true,
      queries: {
        weather_outcome_correlation: weatherOutcomeCorrelations,
        pest_prediction_accuracy: pestAccuracy,
        decision_engine_effectiveness: decisionEffectiveness,
        regional_weather_patterns: regionalPatterns,
        crop_stage_timing_optimization: timingOptimization,
        pest_population_dynamics: pestDynamics,
      },
    });
  } catch (error: any) {
    console.error("Research Analysis API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to execute research queries" },
      { status: 500 }
    );
  }
}

"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Thermometer,
  Droplets,
  CloudRain,
  Wind,
  Bug,
  Calendar,
  Sparkles,
  Info,
  Clock,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import { NormalizedWeatherData } from "@/lib/weather/types";
import { getFarmDecision } from "@/lib/weather/cropStageDecisionEngine";
import { queryCropStagesList } from "@/lib/weather/cropStageDatabase";
import { CropStageRecord } from "@/lib/weather/cropStageTypes";

interface CropStageDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: "en" | "hi" | "mr";
  cityName: string;
  weather: NormalizedWeatherData | null;
  initialCrop?: string;
  initialStage?: number;
}

const SUPPORTED_CROPS = [
  { id: "Soybean", nameEn: "Soybean", nameHi: "सोयाबीन", icon: "🌱" },
  { id: "Paddy", nameEn: "Paddy / Rice", nameHi: "धान", icon: "🌾" },
  { id: "Wheat", nameEn: "Wheat", nameHi: "गेहूँ", icon: "🌾" },
  { id: "Chickpea", nameEn: "Chickpea / Chana", nameHi: "चना", icon: "🌿" },
  { id: "Maize", nameEn: "Maize / Corn", nameHi: "मक्का", icon: "🌽" },
];

export const CropStageDecisionModal: React.FC<CropStageDecisionModalProps> = ({
  isOpen,
  onClose,
  language,
  cityName,
  weather,
  initialCrop = "Soybean",
  initialStage = 2,
}) => {
  // Normalize initialCrop to one of SUPPORTED_CROPS
  const matchedInitialCrop = useMemo(() => {
    const c = initialCrop.toLowerCase();
    if (c.includes("paddy") || c.includes("rice") || c.includes("dhan")) return "Paddy";
    if (c.includes("wheat") || c.includes("gehu")) return "Wheat";
    if (c.includes("chickpea") || c.includes("chana") || c.includes("gram")) return "Chickpea";
    if (c.includes("maize") || c.includes("corn") || c.includes("makka")) return "Maize";
    return "Soybean";
  }, [initialCrop]);

  const [selectedCrop, setSelectedCrop] = useState<string>(matchedInitialCrop);
  const [selectedStageNumber, setSelectedStageNumber] = useState<number>(initialStage);

  // Simulation mode allows adjusting weather sliders to test deterministic rules
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simTemp, setSimTemp] = useState<number>(weather?.current?.temperature ?? 28);
  const [simHumidity, setSimHumidity] = useState<number>(weather?.current?.relativeHumidity ?? 65);
  const [simRainProb, setSimRainProb] = useState<number>(weather?.daily?.[0]?.precipitationProbabilityMax ?? 15);
  const [simWindSpeed, setSimWindSpeed] = useState<number>(weather?.current?.windSpeed ?? 9);
  const [simRainMm, setSimRainMm] = useState<number>(weather?.daily?.[0]?.precipitationSum ?? 0);

  // Available stages for selected crop
  const cropStages = useMemo(() => {
    return queryCropStagesList(selectedCrop);
  }, [selectedCrop]);

  // Actual weather values to use (live or simulated)
  const currentTemp = isSimulating ? simTemp : (weather?.current?.temperature ?? 28);
  const currentHumidity = isSimulating ? simHumidity : (weather?.current?.relativeHumidity ?? 65);
  const currentRainProb = isSimulating
    ? simRainProb
    : (weather?.daily?.[0]?.precipitationProbabilityMax ?? 15);
  const currentWindSpeed = isSimulating ? simWindSpeed : (weather?.current?.windSpeed ?? 9);
  const currentRainMm = isSimulating ? simRainMm : (weather?.daily?.[0]?.precipitationSum ?? 0);

  // Run the 100% Deterministic Decision Engine
  const decisionOutput = useMemo(() => {
    return getFarmDecision({
      crop_name: selectedCrop,
      crop_stage: selectedStageNumber,
      current_temperature: currentTemp,
      current_humidity: currentHumidity,
      rain_probability: currentRainProb,
      rain_sum_24h: currentRainMm,
      current_wind_speed: currentWindSpeed,
      current_wind_gusts: currentWindSpeed * 1.3,
    });
  }, [
    selectedCrop,
    selectedStageNumber,
    currentTemp,
    currentHumidity,
    currentRainProb,
    currentRainMm,
    currentWindSpeed,
  ]);

  if (!isOpen) return null;

  const currentStageRecord = decisionOutput.stage_parameters;

  const resetToLiveWeather = () => {
    setSimTemp(weather?.current?.temperature ?? 28);
    setSimHumidity(weather?.current?.relativeHumidity ?? 65);
    setSimRainProb(weather?.daily?.[0]?.precipitationProbabilityMax ?? 15);
    setSimWindSpeed(weather?.current?.windSpeed ?? 9);
    setSimRainMm(weather?.daily?.[0]?.precipitationSum ?? 0);
    setIsSimulating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080E14] text-slate-900 dark:text-slate-100 shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0A1118]/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold tracking-tight">
                  {language === "hi"
                    ? "फसल-अवस्था निर्णय इंजन"
                    : "Crop-Stage Decision Engine"}
                </h3>
                <span className="hidden sm:inline-flex items-center text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20">
                  Deterministic Logic
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {language === "hi"
                  ? `${cityName} मौसम टेलीमेट्री • फसल अवस्था • कोई LLM भ्रम नहीं`
                  : `Real-Time Agronomic Telemetry in ${cityName} • 0% AI Hallucination`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-2xl p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-6 py-6 space-y-6 flex-1">
          {/* Crop & Stage Selector Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Crop Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                {language === "hi" ? "फसल चुनें (Crop)" : "Select Crop"}
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {SUPPORTED_CROPS.map((crop) => (
                  <button
                    key={crop.id}
                    onClick={() => {
                      setSelectedCrop(crop.id);
                      setSelectedStageNumber(2);
                    }}
                    type="button"
                    className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-xs font-semibold transition-all ${
                      selectedCrop === crop.id
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 shadow-xs ring-1 ring-emerald-500"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-[#0C141C]"
                    }`}
                  >
                    <span className="text-base mb-1">{crop.icon}</span>
                    <span className="truncate">{language === "hi" ? crop.nameHi : crop.nameEn.split("/")[0].trim()}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Growth Stage Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-sky-500" />
                {language === "hi" ? "विकास अवस्था (Growth Stage)" : "Phenological Stage (1–5)"}
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {cropStages.map((stg: CropStageRecord) => (
                  <button
                    key={stg.stage_number}
                    onClick={() => setSelectedStageNumber(stg.stage_number)}
                    type="button"
                    className={`flex flex-col items-center justify-center p-2 rounded-2xl border text-center transition-all ${
                      selectedStageNumber === stg.stage_number
                        ? "border-sky-500 bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 shadow-xs ring-1 ring-sky-500"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-[#0C141C]"
                    }`}
                  >
                    <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300">
                      #{stg.stage_number}
                    </span>
                    <span className="text-[11px] font-semibold truncate w-full mt-0.5">
                      {language === "hi" ? stg.stage_name_hi : stg.stage_name}
                    </span>
                    <span className="text-[9px] text-slate-600 dark:text-slate-300">
                      {stg.days_from_sowing_min}-{stg.days_from_sowing_max}d
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Decision Verdict Banner */}
          <div
            className={`rounded-3xl border p-5 sm:p-6 transition-all ${
              decisionOutput.decision === "SPRAY PERMITTED"
                ? "border-emerald-500/40 bg-emerald-50/70 dark:bg-emerald-950/20"
                : decisionOutput.decision === "CAUTION SPRAY"
                ? "border-amber-500/40 bg-amber-50/70 dark:bg-amber-950/20"
                : "border-rose-500/40 bg-rose-50/70 dark:bg-rose-950/20"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                    decisionOutput.decision === "SPRAY PERMITTED"
                      ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                      : decisionOutput.decision === "CAUTION SPRAY"
                      ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                      : "bg-rose-500/20 text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {decisionOutput.decision === "SPRAY PERMITTED" ? (
                    <CheckCircle2 className="h-8 w-8" />
                  ) : decisionOutput.decision === "CAUTION SPRAY" ? (
                    <AlertTriangle className="h-8 w-8" />
                  ) : (
                    <XCircle className="h-8 w-8" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
                      {decisionOutput.crop} • Stage {decisionOutput.stage_number} ({decisionOutput.stage})
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        decisionOutput.decision_confidence === "HIGH"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {decisionOutput.decision_confidence} Confidence
                    </span>
                  </div>

                  <h4
                    className={`text-xl sm:text-2xl font-black mt-1 ${
                      decisionOutput.decision === "SPRAY PERMITTED"
                        ? "text-emerald-700 dark:text-emerald-300"
                        : decisionOutput.decision === "CAUTION SPRAY"
                        ? "text-amber-700 dark:text-amber-300"
                        : "text-rose-700 dark:text-rose-300"
                    }`}
                  >
                    {language === "hi" ? decisionOutput.decision_hi : decisionOutput.decision}
                  </h4>

                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1 max-w-xl">
                    {language === "hi"
                      ? decisionOutput.recommended_action_hi[0]
                      : decisionOutput.recommended_action[0]}
                  </p>
                </div>
              </div>

              {/* Best Window Card */}
              <div className="shrink-0 bg-white/80 dark:bg-[#070D14]/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 min-w-[220px]">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs font-semibold">
                  <Clock className="h-3.5 w-3.5 text-sky-500" />
                  <span>{language === "hi" ? "सर्वोत्तम समय खिड़की" : "Optimal Time Window"}</span>
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                  {language === "hi" ? decisionOutput.best_window_hi : decisionOutput.best_window}
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Simulation Toggle */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0B121A] p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {language === "hi" ? "मौसम सिम्युलेटर (परीक्षण हेतु)" : "Weather Telemetry Simulator"}
                </span>
                <span className="text-[10px] text-slate-600 dark:text-slate-300">
                  {isSimulating
                    ? language === "hi"
                      ? "(सिमुलेशन सक्रिय)"
                      : "(Custom Sliders Active)"
                    : language === "hi"
                    ? "(वास्तविक लाइव डेटा)"
                    : `(Live ${cityName} Telemetry)`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {isSimulating && (
                  <button
                    onClick={resetToLiveWeather}
                    type="button"
                    className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white px-2.5 py-1 rounded-xl bg-slate-200 dark:bg-slate-800 transition-colors"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>{language === "hi" ? "लाइव रीसेट" : "Reset to Live"}</span>
                  </button>
                )}
                <button
                  onClick={() => setIsSimulating(!isSimulating)}
                  type="button"
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                    isSimulating
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {isSimulating
                    ? language === "hi"
                      ? "सिम्युलेटर बंद करें"
                      : "Close Simulator"
                    : language === "hi"
                    ? "स्लाइडर से टेस्ट करें"
                    : "Simulate Edge Cases"}
                </button>
              </div>
            </div>

            {isSimulating && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/60 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-600 dark:text-slate-300">Temp:</span>
                    <span className="font-bold">{simTemp}°C</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={48}
                    value={simTemp}
                    onChange={(e) => setSimTemp(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-600 dark:text-slate-300">Humidity:</span>
                    <span className="font-bold">{simHumidity}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={simHumidity}
                    onChange={(e) => setSimHumidity(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-600 dark:text-slate-300">Rain Prob:</span>
                    <span className="font-bold">{simRainProb}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={simRainProb}
                    onChange={(e) => setSimRainProb(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-600 dark:text-slate-300">Wind:</span>
                    <span className="font-bold">{simWindSpeed} km/h</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={45}
                    value={simWindSpeed}
                    onChange={(e) => setSimWindSpeed(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 4-Parameter Deterministic Rule Audit Table */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {language === "hi"
                ? "नियम मूल्यांकन मैट्रिक्स (Deterministic Threshold Matrix)"
                : "Deterministic Threshold Matrix (Live vs Allowed Limits)"}
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* 1. Temperature Check */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070D14] p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Thermometer className="h-3.5 w-3.5 text-amber-500" />
                    {language === "hi" ? "तापमान" : "Temperature"}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      currentTemp >= currentStageRecord.ideal_temp_min &&
                      currentTemp <= currentStageRecord.ideal_temp_max
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : currentTemp < currentStageRecord.critical_temp_low ||
                          currentTemp > currentStageRecord.critical_temp_high
                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {currentTemp >= currentStageRecord.ideal_temp_min &&
                    currentTemp <= currentStageRecord.ideal_temp_max
                      ? "Ideal"
                      : currentTemp < currentStageRecord.critical_temp_low ||
                        currentTemp > currentStageRecord.critical_temp_high
                      ? "Critical Stress"
                      : "Marginal"}
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-black">{currentTemp}°C</span>
                  <span className="text-[11px] text-slate-600 dark:text-slate-300">
                    Ideal: {currentStageRecord.ideal_temp_min}–{currentStageRecord.ideal_temp_max}°C
                  </span>
                </div>
                <p className="text-[10px] text-slate-600 dark:text-slate-300">
                  Critical Limits: &lt;{currentStageRecord.critical_temp_low}°C or &gt;{currentStageRecord.critical_temp_high}°C
                </p>
              </div>

              {/* 2. Humidity Check */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070D14] p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Droplets className="h-3.5 w-3.5 text-sky-500" />
                    {language === "hi" ? "आर्द्रता" : "Humidity"}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      currentHumidity >= currentStageRecord.critical_humidity_disease
                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {currentHumidity >= currentStageRecord.critical_humidity_disease
                      ? "Pathogen Risk"
                      : "Safe"}
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-black">{currentHumidity}%</span>
                  <span className="text-[11px] text-slate-600 dark:text-slate-300">
                    Ideal: {currentStageRecord.ideal_humidity_min}–{currentStageRecord.ideal_humidity_max}%
                  </span>
                </div>
                <p className="text-[10px] text-slate-600 dark:text-slate-300">
                  Disease Threshold: &ge;{currentStageRecord.critical_humidity_disease}%
                </p>
              </div>

              {/* 3. Rain Probability & Wash-off */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070D14] p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <CloudRain className="h-3.5 w-3.5 text-blue-500" />
                    {language === "hi" ? "वर्षा धुलने का जोखिम" : "Wash-off Risk"}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      currentRainProb >= currentStageRecord.critical_rain_probability
                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        : currentRainProb >= 30
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {currentRainProb >= currentStageRecord.critical_rain_probability
                      ? "High Wash-off"
                      : currentRainProb >= 30
                      ? "Caution"
                      : "Dry Leaf"}
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-black">{currentRainProb}%</span>
                  <span className="text-[11px] text-slate-600 dark:text-slate-300">
                    Sum: {currentRainMm} mm
                  </span>
                </div>
                <p className="text-[10px] text-slate-600 dark:text-slate-300">
                  Critical Wash Limit: &ge;{currentStageRecord.critical_rain_probability}%
                </p>
              </div>

              {/* 4. Wind Speed & Chemical Drift */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070D14] p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Wind className="h-3.5 w-3.5 text-teal-500" />
                    {language === "hi" ? "हवा ड्रिफ्ट जोखिम" : "Spray Drift"}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      currentWindSpeed >= currentStageRecord.critical_wind_speed
                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        : currentWindSpeed <= 10
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {currentWindSpeed >= currentStageRecord.critical_wind_speed
                      ? "Excessive Drift"
                      : "Optimal"}
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-black">{currentWindSpeed} km/h</span>
                  <span className="text-[11px] text-slate-600 dark:text-slate-300">
                    Safe: &le;{currentStageRecord.critical_wind_speed} km/h
                  </span>
                </div>
                <p className="text-[10px] text-slate-600 dark:text-slate-300">
                  Drift limit: &gt;{currentStageRecord.critical_wind_speed} km/h
                </p>
              </div>
            </div>
          </div>

          {/* Pest & Disease Alert Box */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#070E17] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                <Bug className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  {language === "hi" ? "कीट एवं फफूंद रोग चेतावनी" : "Pest & Pathogen Surveillance"}
                </span>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {language === "hi" ? "प्रमुख कीट:" : "Primary Pest:"} <span className="font-bold text-slate-900 dark:text-white">{decisionOutput.pest_disease_alert.pest}</span> • {language === "hi" ? "प्रमुख रोग:" : "Disease:"} <span className="font-bold text-slate-900 dark:text-white">{decisionOutput.pest_disease_alert.disease}</span>
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  {language === "hi" ? decisionOutput.pest_disease_alert.trigger_reason_hi : decisionOutput.pest_disease_alert.trigger_reason}
                </p>
              </div>
            </div>

            <span
              className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${
                decisionOutput.pest_disease_alert.risk_level === "HIGH"
                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                  : decisionOutput.pest_disease_alert.risk_level === "MEDIUM"
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              }`}
            >
              {decisionOutput.pest_disease_alert.risk_level} RISK
            </span>
          </div>

          {/* Reasons & Specific Precautions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2 bg-white dark:bg-[#070D14]">
              <h6 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Info className="h-4 w-4 text-sky-500" />
                {language === "hi" ? "वैज्ञानिक तर्क (Agronomic Logic)" : "Evaluated Agronomic Logic"}
              </h6>
              <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
                {(language === "hi" ? decisionOutput.reasons_hi : decisionOutput.reasons).map((r, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2 bg-white dark:bg-[#070D14]">
              <h6 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                {language === "hi" ? "किसान सावधानियां (Precautions)" : "Operational Precautions"}
              </h6>
              <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
                {(language === "hi" ? decisionOutput.precautions_hi : decisionOutput.precautions).map((p, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0A1118]/80 shrink-0">
          <span className="text-[11px] text-slate-600 dark:text-slate-300">
            {language === "hi"
              ? "CROP_STAGES डेटाबेस: 25 रिकॉर्ड्स • ICAR/KVK मानक"
              : "CROP_STAGES Engine: 25 phenological growth records • ICAR/KVK benchmarks"}
          </span>
          <button
            onClick={onClose}
            type="button"
            className="rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 font-bold px-4 py-2 text-xs hover:bg-slate-800 dark:hover:bg-white transition-colors"
          >
            {language === "hi" ? "बंद करें" : "Close Inspector"}
          </button>
        </div>
      </div>
    </div>
  );
};

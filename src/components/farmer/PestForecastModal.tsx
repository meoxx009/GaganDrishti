"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Bug,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Thermometer,
  Droplets,
  CloudRain,
  Wind,
  Info,
  Clock,
  Sparkles,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";
import { NormalizedWeatherData } from "@/lib/weather/types";
import { getPestForecast } from "@/lib/weather/pestForecastEngine";
import { DayForecastSnapshot } from "@/lib/weather/pestForecastTypes";

interface PestForecastModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: "en" | "hi" | "mr";
  cityName: string;
  weather: NormalizedWeatherData | null;
  initialCrop?: string;
}

const SUPPORTED_CROPS = [
  { id: "Soybean", nameEn: "Soybean", nameHi: "सोयाबीन", icon: "🌱" },
  { id: "Paddy", nameEn: "Paddy / Rice", nameHi: "धान", icon: "🌾" },
  { id: "Wheat", nameEn: "Wheat", nameHi: "गेहूँ", icon: "🌾" },
  { id: "Chickpea", nameEn: "Chickpea / Chana", nameHi: "चना", icon: "🌿" },
  { id: "Maize", nameEn: "Maize / Corn", nameHi: "मक्का", icon: "🌽" },
  { id: "Cotton", nameEn: "Cotton", nameHi: "कपास", icon: "⚪" },
];

export const PestForecastModal: React.FC<PestForecastModalProps> = ({
  isOpen,
  onClose,
  language,
  cityName,
  weather,
  initialCrop = "Soybean",
}) => {
  const matchedInitialCrop = useMemo(() => {
    const c = (initialCrop || "").toLowerCase();
    if (c.includes("paddy") || c.includes("rice") || c.includes("dhan")) return "Paddy";
    if (c.includes("wheat") || c.includes("gehu")) return "Wheat";
    if (c.includes("chickpea") || c.includes("chana") || c.includes("gram")) return "Chickpea";
    if (c.includes("maize") || c.includes("corn") || c.includes("makka")) return "Maize";
    if (c.includes("cotton") || c.includes("kapas")) return "Cotton";
    return "Soybean";
  }, [initialCrop]);

  const [selectedCrop, setSelectedCrop] = useState<string>(matchedInitialCrop);

  // Simulation mode allows testing dynamic weather triggers
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simTemp, setSimTemp] = useState<number>(28);
  const [simHumidity, setSimHumidity] = useState<number>(85);
  const [simRainProb, setSimRainProb] = useState<number>(75);
  const [simRainMm, setSimRainMm] = useState<number>(14);

  // Build 7-day snapshots from live weather or simulated scenario
  const daySnapshots: DayForecastSnapshot[] = useMemo(() => {
    const daily = weather?.daily || [];
    const hourly = weather?.hourly || [];
    const current = weather?.current;

    return Array.from({ length: 7 }).map((_, idx) => {
      const d = daily[idx];
      const slice = hourly.slice(idx * 24, (idx + 1) * 24);

      let avgHum = current?.relativeHumidity ?? 65;
      let avgWind = current?.windSpeed ?? 10;
      if (slice.length > 0) {
        avgHum = Math.round(slice.reduce((acc, h) => acc + (h.relativeHumidity || 0), 0) / slice.length);
        avgWind = Math.round(slice.reduce((acc, h) => acc + (h.windSpeed || 0), 0) / slice.length);
      }

      const tMin = d?.tempMin ?? (current?.temperature ? current.temperature - 5 : 22);
      const tMax = d?.tempMax ?? (current?.temperature ? current.temperature + 5 : 32);
      const rainProb = d?.precipitationProbabilityMax ?? 20;
      const rainMm = d?.precipitationSum ?? 0;

      if (isSimulating) {
        return {
          dayIndex: idx,
          dateIso: d?.date || `2026-10-0${idx + 1}`,
          tempMin: simTemp - 3,
          tempMax: simTemp + 3,
          tempAvg: simTemp,
          humidityAvg: simHumidity,
          rainProbability: simRainProb,
          precipitationMm: simRainMm,
          windSpeed: avgWind,
        };
      }

      return {
        dayIndex: idx,
        dateIso: d?.date || `2026-10-0${idx + 1}`,
        tempMin: tMin,
        tempMax: tMax,
        tempAvg: Math.round(((tMin + tMax) / 2) * 10) / 10,
        humidityAvg: avgHum,
        rainProbability: rainProb,
        precipitationMm: rainMm,
        windSpeed: avgWind,
        weatherCode: d?.weatherCode,
      };
    });
  }, [weather, isSimulating, simTemp, simHumidity, simRainProb, simRainMm]);

  // Compute 7-day forecast output
  const pestForecast = useMemo(() => {
    return getPestForecast({
      crop_name: selectedCrop,
      crop_stage: "Vegetative / Flowering",
      daily_forecast: daySnapshots,
      current_weather: {
        temperature: weather?.current?.temperature ?? 28,
        relative_humidity: weather?.current?.relativeHumidity ?? 65,
        wind_speed: weather?.current?.windSpeed ?? 10,
        precipitation: weather?.current?.precipitation ?? 0,
      },
    });
  }, [selectedCrop, daySnapshots, weather]);

  if (!isOpen) return null;

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "CRITICAL":
        return "bg-rose-500/20 text-rose-300 border-rose-500/30";
      case "HIGH":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "MEDIUM":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      default:
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl border border-slate-700/60 bg-[#070D14] text-slate-100 shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 px-6 py-5 bg-gradient-to-r from-slate-900 via-[#0A121C] to-slate-900">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Bug className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  CHANGE_004: Predictive Engine
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {cityName} • 7-Day Forecast
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">
                {language === "hi"
                  ? "7-दिवसीय मौसम-आधारित कीट एवं रोग पूर्वानुमान"
                  : "7-Day Weather-Based Pest & Disease Forecast"}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-2xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          {/* Crop Selector Tabs */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              {language === "hi" ? "फसल चुनें (Select Crop):" : "Select Crop:"}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {SUPPORTED_CROPS.map((c) => {
                const isSelected = selectedCrop === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCrop(c.id)}
                    type="button"
                    className={`flex items-center gap-2 p-2.5 rounded-2xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? "border-amber-500 bg-amber-500/15 text-amber-200 shadow-sm"
                        : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <span className="text-base">{c.icon}</span>
                    <span className="truncate">
                      {language === "hi" ? c.nameHi : c.nameEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Simulation / What-If Toggle */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-cyan-400" />
                <span className="text-xs font-bold text-slate-200">
                  {language === "hi"
                    ? "मौसम स्थिति परीक्षण (Simulate Outbreak Triggers):"
                    : "Simulate Outbreak Triggers (What-If Analysis):"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsSimulating(!isSimulating)}
                className={`text-xs px-3 py-1 rounded-xl font-bold transition-all ${
                  isSimulating
                    ? "bg-cyan-500 text-slate-950 shadow-sm"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {isSimulating ? "Simulation ON" : "Test Triggers"}
              </button>
            </div>

            {isSimulating && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-4 pt-3 border-t border-slate-800/80">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Temp</span>
                    <span className="font-mono text-cyan-300">{simTemp}°C</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="42"
                    value={simTemp}
                    onChange={(e) => setSimTemp(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Humidity</span>
                    <span className="font-mono text-cyan-300">{simHumidity}%</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="98"
                    value={simHumidity}
                    onChange={(e) => setSimHumidity(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Rain Probability</span>
                    <span className="font-mono text-cyan-300">{simRainProb}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={simRainProb}
                    onChange={(e) => setSimRainProb(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Rain (mm)</span>
                    <span className="font-mono text-cyan-300">{simRainMm} mm</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    value={simRainMm}
                    onChange={(e) => setSimRainMm(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Overall Status Banner */}
          <div
            className={`rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              pestForecast.overall_risk === "CRITICAL"
                ? "bg-rose-950/30 border-rose-500/40 text-rose-200"
                : pestForecast.overall_risk === "HIGH"
                ? "bg-amber-950/30 border-amber-500/40 text-amber-200"
                : pestForecast.overall_risk === "MEDIUM"
                ? "bg-yellow-950/20 border-yellow-500/30 text-yellow-200"
                : "bg-emerald-950/20 border-emerald-500/30 text-emerald-200"
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider opacity-80">
                  {language === "hi" ? "समग्र जोखिम मूल्यांकन:" : "Overall 7-Day Assessment:"}
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-extrabold border ${getRiskBadge(
                    pestForecast.overall_risk
                  )}`}
                >
                  {pestForecast.overall_risk} RISK
                </span>
              </div>
              <p className="text-sm font-medium mt-1 text-slate-200">
                {language === "hi"
                  ? pestForecast.overall_recommendation_hi
                  : pestForecast.overall_recommendation}
              </p>
            </div>
          </div>

          {/* 7-Day Predictive Timeline */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-cyan-400" />
              <span>
                {language === "hi"
                  ? "7-दिवसीय दैनिक जोखिम कैलेंडर (Daily Outbreak Calendar)"
                  : "7-Day Daily Risk Timeline"}
              </span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {pestForecast.daily_risk_timeline.map((day, idx) => {
                const snapshot = daySnapshots[idx];
                return (
                  <div
                    key={day.dayIndex}
                    className={`rounded-2xl border p-3 flex flex-col justify-between ${
                      day.riskLevel === "CRITICAL"
                        ? "border-rose-500/40 bg-rose-950/20"
                        : day.riskLevel === "HIGH"
                        ? "border-amber-500/40 bg-amber-950/20"
                        : day.riskLevel === "MEDIUM"
                        ? "border-yellow-500/30 bg-yellow-950/15"
                        : "border-slate-800 bg-slate-900/60"
                    }`}
                  >
                    <div>
                      <div className="text-[11px] font-bold text-slate-300 truncate">
                        {day.dateLabel.split("(")[0]}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {day.dateLabel.split("(")[1]?.replace(")", "") || ""}
                      </div>
                      <div className="mt-2 text-xs font-mono font-bold text-slate-200">
                        {snapshot ? `${Math.round(snapshot.tempAvg)}°C` : "--"}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Droplets className="h-2.5 w-2.5 text-blue-400" />
                        <span>{snapshot?.humidityAvg}%</span>
                      </div>
                      {snapshot && snapshot.precipitationMm > 0 && (
                        <div className="text-[10px] text-cyan-300 flex items-center gap-1 mt-0.5 font-mono">
                          <CloudRain className="h-2.5 w-2.5 text-cyan-400" />
                          <span>{snapshot.precipitationMm}mm</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/80">
                      <span
                        className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md border block text-center ${getRiskBadge(
                          day.riskLevel
                        )}`}
                      >
                        {day.riskLevel}
                      </span>
                      {day.activePestsCount > 0 && (
                        <span className="text-[10px] text-slate-400 text-center block mt-1">
                          {day.activePestsCount} alert(s)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Outbreak Cards */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>
                {language === "hi"
                  ? `पूर्वानुमानित कीट व रोग सूची (${pestForecast.predicted_alerts.length} सक्रिय अलर्ट)`
                  : `Active Predicted Outbreak Alerts (${pestForecast.predicted_alerts.length})`}
              </span>
            </h4>

            {pestForecast.predicted_alerts.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center text-slate-400">
                <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-2 opacity-80" />
                <p className="text-sm font-semibold text-slate-200">
                  {language === "hi"
                    ? "आगामी 7 दिनों में किसी गंभीर कीट अथवा रोग के अनुकूल मौसम संकेत नहीं हैं।"
                    : "No high-risk pest or disease conditions triggered in the 7-day outlook."}
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  {language === "hi"
                    ? "सामान्य निगरानी बनाए रखें। आप ऊपर 'Test Triggers' बटन दबाकर उच्च आर्द्रता/वर्षा में कीट प्रकोप का परीक्षण कर सकते हैं।"
                    : "Maintain routine field scouting. Click 'Test Triggers' above to simulate what-if scenarios."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pestForecast.predicted_alerts.map((alert) => (
                  <div
                    key={alert.trigger_id}
                    className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 hover:border-slate-700 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-base font-bold text-white">
                            {language === "hi" ? alert.pest_disease_name_hi : alert.pest_disease_name}
                          </h5>
                          <span className="text-xs text-slate-400">
                            ({language === "hi" ? alert.pest_disease_name : alert.pest_disease_name_hi})
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                            {alert.type}
                          </span>
                        </div>
                        <div className="text-xs text-cyan-400 mt-0.5 flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          <span>
                            {language === "hi" ? "संभावित शुरुआत: " : "Predicted Onset: "}
                            <strong>{alert.predicted_date_label}</strong> ({alert.action_window})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${getRiskBadge(
                            alert.risk_level
                          )}`}
                        >
                          {alert.risk_level} RISK
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-cyan-950/40 text-cyan-300 border border-cyan-500/20">
                          {alert.confidence_pct}% Conf.
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs">
                      {/* Left Column: Triggers and Symptoms */}
                      <div className="space-y-3">
                        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/70">
                          <div className="font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            <span>
                              {language === "hi" ? "मौसम ट्रिगर (Weather Trigger):" : "Why Triggered:"}
                            </span>
                          </div>
                          <p className="text-slate-300 leading-relaxed">
                            {language === "hi" ? alert.why_triggered_hi : alert.why_triggered}
                          </p>
                        </div>

                        <div>
                          <span className="font-bold text-slate-400 block mb-1">
                            {language === "hi" ? "लक्षण जिन्हें देखें (Symptoms to Scout):" : "Symptoms to Scout:"}
                          </span>
                          <p className="text-slate-300 leading-relaxed">
                            {language === "hi" ? alert.symptoms_to_watch_hi : alert.symptoms_to_watch}
                          </p>
                        </div>
                      </div>

                      {/* Right Column: Preventive & Curative Measures */}
                      <div className="space-y-3">
                        <div className="bg-emerald-950/30 p-3 rounded-xl border border-emerald-500/20">
                          <div className="font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            <span>
                              {language === "hi" ? "रोकथाम उपाय (Preventive Action):" : "Preventive Action:"}
                            </span>
                          </div>
                          <p className="text-slate-200 leading-relaxed">
                            {language === "hi" ? alert.preventive_action_hi[0] : alert.preventive_action[0]}
                          </p>
                        </div>

                        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/70">
                          <span className="font-bold text-cyan-400 block mb-1">
                            {language === "hi" ? "उपचार एवं अनुशंसित रसायन:" : "Curative Control & Recommended Chemical:"}
                          </span>
                          <p className="text-slate-300 leading-relaxed">
                            {language === "hi" ? alert.control_if_seen_hi : alert.control_if_seen}
                          </p>
                          <div className="mt-2 text-[11px] font-mono text-cyan-200 bg-cyan-950/50 p-1.5 rounded-lg border border-cyan-800/40">
                            <strong>Chemical:</strong> {alert.recommended_chemicals}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800/80 px-6 py-4 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-cyan-400" />
            <span>
              {language === "hi"
                ? "यह पूर्वानुमान भारतीय कृषि अनुसंधान परिषद (ICAR) एवं मौसम विज्ञान अनुसंधान पर आधारित है।"
                : "Predictive triggers verified against ICAR & agricultural meteorological models."}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-all"
          >
            {language === "hi" ? "बंद करें (Close)" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};

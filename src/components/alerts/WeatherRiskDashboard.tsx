"use client";

import React from "react";
import {
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  Compass,
  Database,
  Info,
  Layers,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useWeather } from "@/context/WeatherContext";
import { evaluateWeatherRisks } from "@/lib/weather/riskEngine";
import { WeatherRiskCard } from "./WeatherRiskCard";
import { NoRiskStateCard } from "./NoRiskStateCard";

export const WeatherRiskDashboard: React.FC = () => {
  const { language, city } = useApp();
  const { weather, isLoading, error, refreshWeather, isRefreshing } = useWeather();

  const riskResult = evaluateWeatherRisks(weather);

  const cityName = language === "hi" ? city.nameHi : city.nameEn;
  const stateName = language === "hi" ? city.stateHi : city.stateEn;

  const updatedTime = weather
    ? new Date(weather.fetchedAt).toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
    : "--:--:--";

  // Loading skeleton
  if (isLoading && !weather) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-24 rounded-3xl border border-slate-800 bg-slate-900/60 p-6" />
        <div className="h-64 rounded-3xl border border-slate-800 bg-slate-900/60 p-6" />
        <div className="h-64 rounded-3xl border border-slate-800 bg-slate-900/60 p-6" />
      </div>
    );
  }

  // Error screen
  if (error && !weather) {
    return (
      <div className="rounded-3xl border border-rose-500/40 bg-rose-950/20 p-8 sm:p-10 text-center backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h3 className="mt-4 text-xl sm:text-2xl font-bold text-white">
          {language === "hi"
            ? "मौसम जोखिम डेटा अनुपलब्ध है"
            : "Weather Risk Telemetry Unavailable"}
        </h3>
        <p className="mx-auto mt-2 max-w-lg text-sm text-slate-400">
          {error}
        </p>

        <div className="mt-6 flex justify-center">
          <button
            onClick={() => refreshWeather(true)}
            type="button"
            className="flex items-center gap-2 rounded-2xl bg-cyan-500 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20"
          >
            <RefreshCw className="h-4 w-4" />
            <span>{language === "hi" ? "पुनः प्रयास करें" : "Retry Connection"}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. CRITICAL MANDATORY NON-OFFICIAL DISCLAIMER BANNER */}
      <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-4 sm:p-5 backdrop-blur-md">
        <div className="flex items-start gap-3.5">
          <Info className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-cyan-300 text-xs uppercase tracking-wider block">
              {language === "hi" ? "महत्वपूर्ण सत्यता सूचना" : "Important Truthfulness Notice"}
            </span>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              {language === "hi"
                ? "गगनदृष्टि पूर्वानुमान-आधारित मौसम जोखिम संकेतक; यह भारतीय मौसम विभाग (IMD) की आधिकारिक चेतावनी नहीं है।"
                : "GaganDrishti forecast-derived weather-risk indicator; not an official IMD warning."}
            </p>
            <p className="text-[11px] text-slate-400 leading-normal pt-0.5">
              {language === "hi"
                ? "यह संकेतक ओपन-मेटियो (Open-Meteo) संख्यात्मक पूर्वानुमान डेटा से तैयार किए गए हैं। आधिकारिक चेतावनी एवं आपातकालीन आदेशों के लिए स्थानीय मौसम केंद्र (IMD) एवं राज्य आपदा प्रबंधन प्राधिकरण (SDMA) को ही अधिकृत मानें।"
                : "Indicators are mathematically derived from Open-Meteo numerical telemetry to support citizen situational awareness. Consult the India Meteorological Department (IMD) for official color-coded alert bulletins."}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Header Area: City & Actions */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-700/60 bg-gradient-to-br from-[#0D1B2A]/90 via-[#07111F]/90 to-slate-950 p-6 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl border border-amber-500/40 bg-amber-500/15 text-amber-300 shadow-inner">
              <AlertTriangle className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  {language === "hi" ? "मौसम जोखिम संकेतक" : "Weather Risk Indicators"}
                </h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border border-slate-700 bg-slate-800 text-slate-300">
                  {cityName}
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-slate-400">
                {language === "hi"
                  ? "वर्तमान संख्यात्मक पूर्वानुमान के आधार पर वर्षा, गर्मी, हवा एवं संवहनीय आंधी की स्थिति का मूल्यांकन।"
                  : "Deterministic conversion of forecast values into simple situational risk indicators."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl">
              <Compass className="h-3.5 w-3.5 text-cyan-400" />
              <span>
                {city.lat.toFixed(4)}°N, {city.lon.toFixed(4)}°E
              </span>
            </div>

            <button
              onClick={() => refreshWeather(true)}
              disabled={isRefreshing}
              type="button"
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-700/80 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-all disabled:opacity-50"
              title="Refresh Telemetry"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 text-cyan-400 ${
                  isRefreshing ? "animate-spin" : ""
                }`}
              />
              <span className="hidden sm:inline">
                {isRefreshing ? (language === "hi" ? "अपडेट हो रहा..." : "Refreshing...") : (language === "hi" ? "रिफ्रेश" : "Refresh")}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Body: Either Active Risk Cards or Reassuring No-Risk State */}
      {riskResult.hasSignificantRisk ? (
        <div className="space-y-5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              {language === "hi"
                ? `सक्रिय जोखिम संकेतक (${riskResult.risks.length})`
                : `Active Risk Indicators (${riskResult.risks.length})`}
            </span>
            <span className="text-xs text-slate-400">
              {language === "hi" ? "पूर्वानुमान सीमा आधारित" : "Threshold-evaluated"}
            </span>
          </div>

          <div className="space-y-4">
            {riskResult.risks.map((risk) => (
              <WeatherRiskCard
                key={risk.id}
                risk={risk}
                updatedTime={updatedTime}
              />
            ))}
          </div>
        </div>
      ) : (
        weather && (
          <NoRiskStateCard
            weather={weather}
            updatedTime={updatedTime}
          />
        )
      )}
    </div>
  );
};

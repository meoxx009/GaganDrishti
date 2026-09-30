"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import {
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  Compass,
  Database,
  Info,
  Layers,
  Map,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useWeather } from "@/context/WeatherContext";
import { evaluateWeatherRisks } from "@/lib/weather/riskEngine";
import { WeatherRiskCard } from "./WeatherRiskCard";
import { NoRiskStateCard } from "./NoRiskStateCard";
import { RiskMapExplanations } from "./RiskMapExplanations";
import { CityRiskPoint } from "@/lib/weather/mapRiskService";
import { OfficialIMDAlertCard } from "./OfficialIMDAlertCard";
import { IncidentBriefCard } from "./IncidentBriefCard";

const WeatherRiskMap = dynamic(() => import("./WeatherRiskMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[460px] sm:h-[520px] rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/50 flex flex-col items-center justify-center gap-2 text-xs text-slate-500 animate-pulse">
      <RefreshCw className="h-6 w-6 animate-spin text-sky-500" />
      <span>Loading interactive risk map...</span>
    </div>
  ),
});

export const WeatherRiskDashboard: React.FC = () => {
  const { language, city, setCity } = useApp();
  const { weather, isLoading, error, refreshWeather, isRefreshing } = useWeather();
  const [viewMode, setViewMode] = useState<"cards" | "map">("cards");
  const [mapPoints, setMapPoints] = useState<CityRiskPoint[]>([]);
  const [focusedPoint, setFocusedPoint] = useState<CityRiskPoint | null>(null);

  const riskResult = evaluateWeatherRisks(weather);

  const handleSelectCityOnMap = (point: CityRiskPoint) => {
    setViewMode("map");
    setFocusedPoint(point);
    // Scroll smoothly to map container if needed
    window.scrollTo({ top: 120, behavior: "smooth" });
  };


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
        <div className="h-24 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 p-6" />
        <div className="h-64 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 p-6" />
        <div className="h-64 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 p-6" />
      </div>
    );
  }

  // Error screen
  if (error && !weather) {
    return (
      <div className="rounded-3xl border border-rose-200 dark:border-rose-500/40 bg-rose-50/50 dark:bg-rose-950/20 p-8 sm:p-10 text-center shadow-xs">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h3 className="mt-4 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          {language === "hi"
            ? "मौसम जोखिम डेटा अनुपलब्ध है"
            : "Weather Risk Telemetry Unavailable"}
        </h3>
        <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600 dark:text-slate-400">
          {error}
        </p>

        <div className="mt-6 flex justify-center">
          <button
            onClick={() => refreshWeather(true)}
            type="button"
            className="flex items-center gap-2 rounded-2xl bg-sky-600 dark:bg-cyan-500 px-6 py-3 text-sm font-bold text-white dark:text-slate-950 hover:bg-sky-700 dark:hover:bg-cyan-400 transition-all shadow-xs"
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
      <div className="rounded-2xl border border-sky-200 dark:border-sky-500/20 bg-sky-50/60 dark:bg-[#080E14] p-4 sm:p-5 shadow-2xs">
        <div className="flex items-start gap-3.5">
          <Info className="h-5 w-5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-sky-800 dark:text-sky-300 text-xs uppercase tracking-wider block">
              {language === "hi" ? "महत्वपूर्ण सत्यता सूचना" : "Important Truthfulness Notice"}
            </span>
            <p className="text-xs sm:text-sm text-slate-900 dark:text-[#CBD5E1] font-medium leading-relaxed">
              {language === "hi"
                ? "गगनदृष्टि पूर्वानुमान-आधारित मौसम जोखिम संकेतक; यह भारतीय मौसम विभाग (IMD) की आधिकारिक चेतावनी नहीं है।"
                : "GaganDrishti forecast-derived weather-risk indicator; not an official IMD warning."}
            </p>
            <p className="text-[11px] text-slate-600 dark:text-[#7F91A3] leading-normal pt-0.5">
              {language === "hi"
                ? "यह संकेतक ओपन-मेटियो (Open-Meteo) संख्यात्मक पूर्वानुमान डेटा से तैयार किए गए हैं। आधिकारिक चेतावनी एवं आपातकालीन आदेशों के लिए स्थानीय मौसम केंद्र (IMD) एवं राज्य आपदा प्रबंधन प्राधिकरण (SDMA) को ही अधिकृत मानें।"
                : "Indicators are mathematically derived from Open-Meteo numerical telemetry to support citizen situational awareness. Consult the India Meteorological Department (IMD) for official color-coded alert bulletins."}
            </p>
          </div>
        </div>
      </div>

      {/* 1.1 OFFICIAL GOVERNMENT IMD BULLETIN (STRICTLY SEPARATED) */}
      <OfficialIMDAlertCard />

      {/* 2. Header Area: City & Actions */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800/50 bg-white dark:bg-[#080E14] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-[#0B1219] text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
                  {language === "hi" ? "मौसम जोखिम संकेतक" : "Weather Risk Indicators"}
                </h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-[#060C12] text-slate-700 dark:text-slate-300">
                  {cityName}
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-[#7F91A3]">
                {language === "hi"
                  ? "वर्तमान संख्यात्मक पूर्वानुमान के आधार पर वर्षा, गर्मी, हवा एवं संवहनीय आंधी की स्थिति का मूल्यांकन।"
                  : "Deterministic conversion of forecast values into simple situational risk indicators."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-700 dark:text-cyan-300 bg-[#F8FAFC] dark:bg-[#060C12] border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl">
              <Compass className="h-3.5 w-3.5 text-sky-600 dark:text-cyan-400" />
              <span>
                {city.lat.toFixed(4)}°N, {city.lon.toFixed(4)}°E
              </span>
            </div>

            <button
              onClick={() => refreshWeather(true)}
              disabled={isRefreshing}
              type="button"
              className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#0B1219] hover:bg-slate-50 dark:hover:bg-[#0E1821] px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all disabled:opacity-50 shadow-2xs"
              title="Refresh Telemetry"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 text-sky-600 dark:text-cyan-400 ${
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

      {/* 2.1 SITUATIONAL INCIDENT & RISK OVERVIEW BRIEF */}
      <IncidentBriefCard />

      {/* 3. View Switcher: Segmented Cards vs Pan-India Map Toggle */}
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-slate-100/90 dark:bg-[#060C12] shadow-2xs">
          <button
            type="button"
            onClick={() => setViewMode("cards")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all min-h-[44px] touch-target-sm ${
              viewMode === "cards"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200/80 dark:border-transparent dark:bg-sky-500 dark:text-slate-950"
                : "text-slate-600 dark:text-[#7F91A3] hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>{language === "hi" ? "जोखिम कार्ड्स" : "Risk Cards"}</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("map")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all min-h-[44px] touch-target-sm ${
              viewMode === "map"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200/80 dark:border-transparent dark:bg-sky-500 dark:text-slate-950"
                : "text-slate-600 dark:text-[#7F91A3] hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Map className="h-4 w-4" />
            <span>{language === "hi" ? "मानचित्र देखें (Map)" : "Live Risk Map"}</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-500 dark:text-[#7F91A3] hidden sm:inline font-medium">
          {viewMode === "cards"
            ? language === "hi"
              ? `${cityName} के विस्तृत संकेतक`
              : `Detailed indicators for ${cityName}`
            : language === "hi"
            ? "10 प्रमुख शहरों का पैन-इंडिया दृश्य"
            : "Pan-India view across 10 major hubs"}
        </span>
      </div>

      {/* 4. Main Viewport: Map View OR Cards View */}
      {viewMode === "map" ? (
        <div className="space-y-6">
          <WeatherRiskMap
            focusedPoint={focusedPoint}
            onPointsLoaded={(pts) => setMapPoints(pts)}
          />
          <RiskMapExplanations
            points={mapPoints}
            onSelectCityOnMap={handleSelectCityOnMap}
          />
        </div>
      ) : riskResult.hasSignificantRisk ? (

        <div className="space-y-5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500 dark:text-amber-400 flex items-center gap-1.5">
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

"use client";

import React from "react";
import { AlertTriangle, RefreshCw, ShieldAlert, Sparkles, Database } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useWeather } from "@/context/WeatherContext";
import { CitizenSmartSummary } from "./CitizenSmartSummary";
import { CitizenHeroMetrics } from "./CitizenHeroMetrics";
import { CitizenHourly12H } from "./CitizenHourly12H";
import { CitizenDaily5D } from "./CitizenDaily5D";

export const CitizenDashboard: React.FC = () => {
  const { language } = useApp();
  const { weather, isLoading, error, refreshWeather } = useWeather();

  // Loading Skeleton State
  if (isLoading && !weather) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 rounded-3xl border border-slate-800 bg-slate-900/60 p-6" />
        <div className="h-64 rounded-3xl border border-slate-800 bg-slate-900/60 p-6" />
        <div className="h-44 rounded-3xl border border-slate-800 bg-slate-900/50 p-6" />
        <div className="h-56 rounded-3xl border border-slate-800 bg-slate-900/50 p-6" />
      </div>
    );
  }

  // Error State (Network failed & no cached data)
  if (error && !weather) {
    return (
      <div className="rounded-3xl border border-rose-500/40 bg-rose-950/20 p-8 sm:p-10 text-center backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h3 className="mt-4 text-xl sm:text-2xl font-bold text-white">
          {language === "hi"
            ? "नागरिक मौसम डेटा अनुपलब्ध है"
            : "Citizen Weather Telemetry Unavailable"}
        </h3>
        <p className="mx-auto mt-2 max-w-lg text-sm text-slate-400">
          {error}
        </p>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-amber-400">
          <ShieldAlert className="h-4 w-4" />
          <span>
            {language === "hi"
              ? "सत्यता नियम: नकली मौसम डेटा उत्पन्न नहीं किया गया है।"
              : "Integrity Rule: No synthetic weather values have been fabricated."}
          </span>
        </div>

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
      {/* 1. Deterministic Smart Summary Advisory */}
      <CitizenSmartSummary />

      {/* 2. Hero Weather Metrics Section */}
      <CitizenHeroMetrics />

      {/* 3. Next 12-Hour Forecast (Horizontally Scrollable) */}
      <CitizenHourly12H />

      {/* 4. 5-Day Synoptic Outlook */}
      <CitizenDaily5D />
    </div>
  );
};

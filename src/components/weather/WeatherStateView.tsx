"use client";

import React from "react";
import { AlertTriangle, RefreshCw, Radio, ShieldAlert } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useWeather } from "@/context/WeatherContext";
import { CurrentWeatherCard } from "./CurrentWeatherCard";
import { HourlyForecastStrip } from "./HourlyForecastStrip";
import { DailyForecastGrid } from "./DailyForecastGrid";

export const WeatherStateView: React.FC = () => {
  const { language } = useApp();
  const { weather, isLoading, error, refreshWeather } = useWeather();

  // Loading skeleton when no prior weather data exists yet
  if (isLoading && !weather) {
    return (
      <div className="space-y-4 animate-pulse">
        {/* Skeleton Top Card */}
        <div className="h-64 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="h-5 w-48 rounded-lg bg-slate-800" />
            <div className="h-5 w-24 rounded-lg bg-slate-800" />
          </div>
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 rounded-2xl bg-slate-800" />
            <div className="space-y-3">
              <div className="h-10 w-32 rounded-xl bg-slate-800" />
              <div className="h-4 w-48 rounded-lg bg-slate-800" />
            </div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-16 rounded-xl bg-slate-800" />
            ))}
          </div>
        </div>

        {/* Skeleton Hourly */}
        <div className="h-36 rounded-3xl border border-slate-800 bg-slate-900/40 p-4" />

        {/* Skeleton Daily */}
        <div className="h-44 rounded-3xl border border-slate-800 bg-slate-900/40 p-4" />
      </div>
    );
  }

  // Error view if fetch failed and no cache is available
  if (error && !weather) {
    return (
      <div className="rounded-3xl border border-rose-500/30 bg-rose-950/20 p-8 text-center backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h3 className="mt-4 text-xl font-bold text-slate-100">
          {language === "hi"
            ? "ओपन-मेटियो सेवा अनुपलब्ध है"
            : "Open-Meteo Weather Service Unavailable"}
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
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
            className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20"
          >
            <RefreshCw className="h-4 w-4" />
            <span>{language === "hi" ? "पुनः प्रयास करें" : "Retry Connection"}</span>
          </button>
        </div>
      </div>
    );
  }

  // Normal live weather display
  return (
    <div className="space-y-6">
      <CurrentWeatherCard />
      <HourlyForecastStrip />
      <DailyForecastGrid />
    </div>
  );
};

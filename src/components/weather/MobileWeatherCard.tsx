"use client";

/**
 * FINAL_006 Step 5: Mobile-optimized compact weather card
 * Shown ONLY on mobile (< lg) via CSS. Replaces heavy CitizenHeroMetrics + CitizenDaily5D
 * with a single-column, thumb-friendly layout designed for outdoor use on budget phones.
 */

import React, { useState } from "react";
import { Umbrella, Droplets, Wind, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useWeather } from "@/context/WeatherContext";
import { WeatherIcon } from "./WeatherIcon";

export const MobileWeatherCard: React.FC = () => {
  const { language } = useApp();
  const { weather, isRefreshing, refreshWeather } = useWeather();
  const [show7Days, setShow7Days] = useState(false);

  if (!weather) return null;

  const { current, cityNameEn, cityNameHi, hourly, daily } = weather;
  const conditionLabel = language === "hi" ? current.conditionHi : current.conditionEn;
  const cityName = language === "hi" ? cityNameHi : cityNameEn;
  const rainProb = hourly[0]?.precipitationProbability ?? 0;

  // Rain alert threshold
  const hasRainAlert = rainProb >= 70;

  return (
    <div className="lg:hidden space-y-3">
      {/* === Current Weather Card === */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800/40 bg-white dark:bg-[#080E14] p-4 shadow-xs">
        {/* Location + Refresh */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">{cityName}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === "hi" ? "लाइव मौसम" : "Live Weather"}
            </p>
          </div>
          <button
            onClick={() => refreshWeather(true)}
            disabled={isRefreshing}
            type="button"
            className="flex items-center gap-1.5 rounded-xl bg-sky-50 dark:bg-sky-500/10 border border-sky-100 dark:border-sky-500/20 px-3 py-2 text-xs font-semibold text-sky-700 dark:text-sky-400 min-h-[44px] min-w-[44px] touch-target-sm"
            aria-label="Refresh weather"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="sr-only sm:not-sr-only">
              {isRefreshing
                ? language === "hi" ? "अपडेट..." : "Updating..."
                : language === "hi" ? "रिफ्रेश" : "Refresh"}
            </span>
          </button>
        </div>

        {/* Big Temperature + Icon — 2-column */}
        <div className="grid grid-cols-2 gap-4 items-center mb-4">
          {/* Temperature block */}
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-6xl font-black tracking-tighter text-slate-900 dark:text-white">
                {current.temperature}
              </span>
              <span className="text-3xl font-bold text-sky-500">°C</span>
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-0.5">
              {conditionLabel}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === "hi" ? "अनुभूत:" : "Feels:"}{" "}
              <strong className="font-mono">{current.apparentTemperature}°C</strong>
            </p>
          </div>

          {/* Weather Icon */}
          <div className="flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-50 dark:bg-[#0B1219] border border-slate-200 dark:border-slate-800/40">
              <WeatherIcon name={current.iconName} className="h-12 w-12" />
            </div>
          </div>
        </div>

        {/* Rain Alert Banner */}
        {hasRainAlert && (
          <div className="mb-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 px-4 py-3">
            <p className="text-sm font-bold text-amber-800 dark:text-amber-400">
              ⚠️{" "}
              {language === "hi"
                ? `भारी बारिश की संभावना ${rainProb}%`
                : `Heavy rain likely — ${rainProb}% chance`}
            </p>
          </div>
        )}

        {/* 3 Quick Metrics — single row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-slate-50 dark:bg-[#0B1219] border border-slate-200/60 dark:border-slate-800/40 p-2.5 text-center">
            <div className="flex justify-center text-sky-500 mb-1">
              <Umbrella className="h-4 w-4" />
            </div>
            <p className="font-mono text-base font-bold text-slate-900 dark:text-white">{rainProb}%</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {language === "hi" ? "बारिश" : "Rain"}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 dark:bg-[#0B1219] border border-slate-200/60 dark:border-slate-800/40 p-2.5 text-center">
            <div className="flex justify-center text-sky-500 mb-1">
              <Droplets className="h-4 w-4" />
            </div>
            <p className="font-mono text-base font-bold text-slate-900 dark:text-white">
              {current.relativeHumidity}%
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {language === "hi" ? "नमी" : "Humidity"}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 dark:bg-[#0B1219] border border-slate-200/60 dark:border-slate-800/40 p-2.5 text-center">
            <div className="flex justify-center text-sky-500 mb-1">
              <Wind className="h-4 w-4" />
            </div>
            <p className="font-mono text-base font-bold text-slate-900 dark:text-white">
              {current.windSpeed}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">km/h</p>
          </div>
        </div>
      </div>

      {/* === 7-Day Forecast (Compact List) === */}
      {daily && daily.length > 0 && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800/40 bg-white dark:bg-[#080E14] overflow-hidden shadow-xs">
          {/* Toggle Header */}
          <button
            type="button"
            onClick={() => setShow7Days((p) => !p)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-200 min-h-[48px] touch-target"
          >
            <span>
              📅{" "}
              {language === "hi" ? "अगले 7 दिन का मौसम" : "7-Day Forecast"}
            </span>
            {show7Days ? (
              <ChevronUp className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            )}
          </button>

          {/* Day List — simple text rows, NO scrolling needed */}
          {show7Days && (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
              {daily.slice(0, 7).map((day, idx) => {
                const dayName = language === "hi" ? day.dayNameHi : day.dayNameEn;
                const cond = language === "hi" ? day.conditionHi : day.conditionEn;
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-4 py-3 min-h-[48px]"
                  >
                    {/* Day name */}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <WeatherIcon name={day.iconName} className="h-5 w-5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {idx === 0
                            ? language === "hi" ? "आज" : "Today"
                            : idx === 1
                            ? language === "hi" ? "कल" : "Tomorrow"
                            : dayName}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{cond}</p>
                      </div>
                    </div>

                    {/* Temp range + rain */}
                    <div className="text-right shrink-0 ml-3">
                      <p className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                        <span className="text-amber-500">{day.tempMax}°</span>
                        <span className="text-slate-400 mx-1">/</span>
                        <span className="text-sky-500">{day.tempMin}°</span>
                      </p>
                      <p className="text-[10.5px] text-sky-500 font-mono">
                        💧 {day.precipitationProbabilityMax}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

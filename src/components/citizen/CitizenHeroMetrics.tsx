"use client";

import React from "react";
import {
  RefreshCw,
  Umbrella,
  Droplets,
  Wind,
  Cloud,
  MapPin,
  Compass,
  Database,
  AlertCircle,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useWeather } from "@/context/WeatherContext";
import { WeatherIcon } from "../weather/WeatherIcon";

export const CitizenHeroMetrics: React.FC = () => {
  const { language, city } = useApp();
  const { weather, isRefreshing, refreshWeather } = useWeather();

  if (!weather) return null;

  const { current, cityNameEn, cityNameHi, fetchedAt, isCached, hourly } = weather;
  const conditionLabel =
    language === "hi" ? current.conditionHi : current.conditionEn;
  const cityName = language === "hi" ? cityNameHi : cityNameEn;
  const stateName = language === "hi" ? city.stateHi : city.stateEn;

  // Rain probability for current hour from normalized hourly array
  const currentRainProbability = hourly[0]?.precipitationProbability ?? 0;

  // Format fetchedAt to readable IST time
  const updatedTime = new Date(fetchedAt).toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-700/60 bg-gradient-to-br from-[#0D1B2A]/90 via-[#07111F]/90 to-slate-950 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 -bottom-16 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />

      {/* Top Header: Location, Open-Meteo attribution, Last updated, Refresh */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shadow-inner">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {cityName}
              </h2>
              <span className="text-xs sm:text-sm font-medium text-slate-400">
                ({stateName})
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-cyan-400 font-mono mt-0.5">
              <Compass className="h-3 w-3" />
              <span>
                {city.lat.toFixed(4)}°N, {city.lon.toFixed(4)}°E
              </span>
            </div>
          </div>
        </div>

        {/* Status, Updated time & Refresh */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Source Attribution */}
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-700/60 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-300">
            <Database className="h-3.5 w-3.5 text-cyan-400" />
            <span className="font-semibold text-slate-200">Open-Meteo</span>
            <span className="text-slate-500">•</span>
            {isCached ? (
              <span className="text-amber-400 font-medium flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {language === "hi" ? "कैश्ड" : "Cached"} ({updatedTime})
              </span>
            ) : (
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                {language === "hi" ? "लाइव" : "Live"} {updatedTime} IST
              </span>
            )}
          </div>

          {/* Refresh Action */}
          <button
            onClick={() => refreshWeather(true)}
            disabled={isRefreshing}
            type="button"
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-700/80 px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:text-white transition-all disabled:opacity-50"
            title={language === "hi" ? "मौसम अपडेट करें" : "Refresh Weather"}
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-cyan-400 ${
                isRefreshing ? "animate-spin" : ""
              }`}
            />
            <span>
              {isRefreshing
                ? language === "hi"
                  ? "अपडेटिंग..."
                  : "Updating..."
                : language === "hi"
                ? "रिफ्रेश"
                : "Refresh"}
            </span>
          </button>
        </div>
      </div>

      {/* Main Hero Metric: Large Temperature & Condition */}
      <div className="relative z-10 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-5 flex items-center gap-6">
          <div className="flex h-24 w-24 sm:h-28 sm:w-28 shrink-0 items-center justify-center rounded-3xl border border-slate-700/60 bg-slate-800/50 shadow-inner">
            <WeatherIcon name={current.iconName} className="h-14 w-14 sm:h-16 sm:w-16" />
          </div>

          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-6xl sm:text-7xl font-extrabold tracking-tighter text-white">
                {current.temperature}
              </span>
              <span className="text-3xl sm:text-4xl font-bold text-cyan-400">°C</span>
            </div>

            <div className="text-lg sm:text-xl font-bold text-slate-100 mt-1">
              {conditionLabel}
            </div>

            <div className="text-xs sm:text-sm text-slate-400 mt-1">
              {language === "hi" ? "अनुभूत तापमान" : "Feels like"}:{" "}
              <strong className="text-slate-200 font-mono text-sm">
                {current.apparentTemperature}°C
              </strong>
            </div>
          </div>
        </div>

        {/* 4 Required Primary Citizen Metrics */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {/* 1. Rain Probability */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 transition-all hover:border-cyan-500/40">
            <div className="flex items-center gap-2 text-cyan-400">
              <Umbrella className="h-4 w-4" />
              <span className="text-xs font-semibold text-slate-400">
                {language === "hi" ? "वर्षा संभावना" : "Rain Prob"}
              </span>
            </div>
            <div className="mt-2.5 font-mono text-2xl font-bold text-slate-100">
              {currentRainProbability}%
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">
              {current.precipitation > 0
                ? `${current.precipitation} mm`
                : language === "hi"
                ? "वर्तमान में शुष्क"
                : "Dry currently"}
            </div>
          </div>

          {/* 2. Humidity */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 transition-all hover:border-blue-500/40">
            <div className="flex items-center gap-2 text-blue-400">
              <Droplets className="h-4 w-4" />
              <span className="text-xs font-semibold text-slate-400">
                {language === "hi" ? "आर्द्रता" : "Humidity"}
              </span>
            </div>
            <div className="mt-2.5 font-mono text-2xl font-bold text-slate-100">
              {current.relativeHumidity}%
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {current.relativeHumidity > 70
                ? language === "hi"
                  ? "अधिक नमी"
                  : "High moisture"
                : current.relativeHumidity > 40
                ? language === "hi"
                  ? "संतुलित"
                  : "Comfortable"
                : language === "hi"
                ? "शुष्क"
                : "Dry"}
            </div>
          </div>

          {/* 3. Wind Speed */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 transition-all hover:border-emerald-500/40">
            <div className="flex items-center gap-2 text-emerald-400">
              <Wind className="h-4 w-4" />
              <span className="text-xs font-semibold text-slate-400">
                {language === "hi" ? "हवा की गति" : "Wind Speed"}
              </span>
            </div>
            <div className="mt-2.5 font-mono text-2xl font-bold text-slate-100">
              {current.windSpeed}{" "}
              <span className="text-xs text-slate-400 font-normal">km/h</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">
              {language === "hi" ? "झोंके" : "Gusts"}: {current.windGusts} km/h
            </div>
          </div>

          {/* 4. Cloud Cover */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 transition-all hover:border-indigo-500/40">
            <div className="flex items-center gap-2 text-indigo-400">
              <Cloud className="h-4 w-4" />
              <span className="text-xs font-semibold text-slate-400">
                {language === "hi" ? "बादल आवरण" : "Cloud Cover"}
              </span>
            </div>
            <div className="mt-2.5 font-mono text-2xl font-bold text-slate-100">
              {current.cloudCover}%
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {current.cloudCover > 80
                ? language === "hi"
                  ? "घने बादल"
                  : "Overcast"
                : current.cloudCover > 30
                ? language === "hi"
                  ? "आंशिक बादल"
                  : "Partly cloudy"
                : language === "hi"
                ? "खुला आसमान"
                : "Clear skies"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

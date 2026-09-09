"use client";

import React from "react";
import {
  RefreshCw,
  Droplets,
  Wind,
  Cloud,
  CloudRain,
  Gauge,
  Database,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useWeather } from "@/context/WeatherContext";
import { WeatherIcon } from "./WeatherIcon";

export const CurrentWeatherCard: React.FC = () => {
  const { language } = useApp();
  const { weather, isRefreshing, refreshWeather } = useWeather();

  if (!weather) return null;

  const { current, cityNameEn, cityNameHi, fetchedAt, isCached } = weather;
  const conditionLabel =
    language === "hi" ? current.conditionHi : current.conditionEn;
  const cityName = language === "hi" ? cityNameHi : cityNameEn;

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
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

      {/* Top Bar: Source Attribution & Refresh */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-cyan-300">
            <Database className="h-3.5 w-3.5" />
            <span className="font-semibold">Open-Meteo Forecast API</span>
          </div>

          {isCached ? (
            <div className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-amber-300">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>
                {language === "hi" ? "कैश्ड डेटा (ऑफ़लाइन)" : "Cached Telemetry"} ({updatedTime} IST)
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-emerald-300">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span>
                {language === "hi" ? "लाइव अपडेट" : "Live"}: {updatedTime} IST
              </span>
            </div>
          )}
        </div>

        {/* Refresh Action */}
        <button
          onClick={() => refreshWeather(true)}
          disabled={isRefreshing}
          type="button"
          className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-700/60 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition-all disabled:opacity-50"
          title={language === "hi" ? "मौसम डेटा पुनः लोड करें" : "Refresh weather telemetry"}
        >
          <RefreshCw
            className={`h-3.5 w-3.5 text-cyan-400 ${
              isRefreshing ? "animate-spin" : ""
            }`}
          />
          <span>{isRefreshing ? (language === "hi" ? "अपडेट हो रहा..." : "Refreshing...") : (language === "hi" ? "रिफ्रेश" : "Refresh")}</span>
        </button>
      </div>

      {/* Main Meteorological Card Display */}
      <div className="relative z-10 mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
        {/* Left Column: Temperature & Big Weather Icon */}
        <div className="lg:col-span-6 flex items-center gap-6">
          <div className="flex h-24 w-24 sm:h-28 sm:w-28 shrink-0 items-center justify-center rounded-3xl border border-slate-700/60 bg-slate-800/40 shadow-inner">
            <WeatherIcon name={current.iconName} className="h-14 w-14 sm:h-16 sm:w-16" />
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-5xl sm:text-6xl font-extrabold tracking-tight text-white">
                {current.temperature}
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-cyan-400">°C</span>
            </div>

            <div className="mt-1 flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold text-slate-200">
                {conditionLabel}
              </span>
            </div>

            <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
              <span>
                {language === "hi" ? "अनुभूत तापमान" : "Feels like"}:{" "}
                <strong className="text-slate-200 font-mono">
                  {current.apparentTemperature}°C
                </strong>
              </span>
              <span>•</span>
              <span className="font-medium text-cyan-300">
                {cityName}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Key Micro-Metrics Grid */}
        <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Humidity */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-3">
            <div className="flex items-center gap-2 text-cyan-400">
              <Droplets className="h-4 w-4" />
              <span className="text-[11px] font-semibold text-slate-400">
                {language === "hi" ? "आर्द्रता" : "Humidity"}
              </span>
            </div>
            <div className="mt-2 font-mono text-lg font-bold text-slate-100">
              {current.relativeHumidity}%
            </div>
          </div>

          {/* Wind Speed & Gusts */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <Wind className="h-4 w-4" />
              <span className="text-[11px] font-semibold text-slate-400">
                {language === "hi" ? "हवा की गति" : "Wind"}
              </span>
            </div>
            <div className="mt-2 font-mono text-lg font-bold text-slate-100">
              {current.windSpeed}{" "}
              <span className="text-xs text-slate-400 font-normal">km/h</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
              {language === "hi" ? "झोंके" : "Gusts"}: {current.windGusts} km/h
            </div>
          </div>

          {/* Precipitation & Rain */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-3">
            <div className="flex items-center gap-2 text-blue-400">
              <CloudRain className="h-4 w-4" />
              <span className="text-[11px] font-semibold text-slate-400">
                {language === "hi" ? "वर्षा" : "Rainfall"}
              </span>
            </div>
            <div className="mt-2 font-mono text-lg font-bold text-slate-100">
              {current.precipitation}{" "}
              <span className="text-xs text-slate-400 font-normal">mm</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
              {language === "hi" ? "वर्षा दर" : "Rain"}: {current.rain} mm
            </div>
          </div>

          {/* Cloud Cover */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-3">
            <div className="flex items-center gap-2 text-slate-300">
              <Cloud className="h-4 w-4" />
              <span className="text-[11px] font-semibold text-slate-400">
                {language === "hi" ? "बादल आवरण" : "Cloud Cover"}
              </span>
            </div>
            <div className="mt-2 font-mono text-lg font-bold text-slate-100">
              {current.cloudCover}%
            </div>
          </div>

          {/* WMO Weather Code */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-3">
            <div className="flex items-center gap-2 text-amber-400">
              <Gauge className="h-4 w-4" />
              <span className="text-[11px] font-semibold text-slate-400">
                {language === "hi" ? "डब्ल्यूएमओ कोड" : "WMO Code"}
              </span>
            </div>
            <div className="mt-2 font-mono text-lg font-bold text-slate-100">
              WW #{current.weatherCode}
            </div>
          </div>

          {/* Timezone */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-3">
            <div className="flex items-center gap-2 text-indigo-400">
              <ExternalLink className="h-4 w-4" />
              <span className="text-[11px] font-semibold text-slate-400">
                {language === "hi" ? "समय क्षेत्र" : "Timezone"}
              </span>
            </div>
            <div className="mt-2 text-xs font-semibold text-slate-200">
              Asia/Kolkata (IST)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

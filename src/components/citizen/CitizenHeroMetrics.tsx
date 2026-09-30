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
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800/40 bg-white dark:bg-[#080E14] p-6 sm:p-8 shadow-xs">
      {/* Top Header: Location, Open-Meteo attribution, Last updated, Refresh */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/40 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 border border-sky-100 dark:bg-sky-500/10 dark:border-sky-500/20 text-sky-600 dark:text-sky-400">
            <MapPin className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
                {cityName}
              </h2>
              <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-[#7F91A3]">
                ({stateName})
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10.5px] text-sky-600 dark:text-sky-400 font-mono mt-0.5">
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
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800/50 bg-[#F8FAFC] dark:bg-[#0B1219] px-3 py-1.5 text-xs text-slate-600 dark:text-[#CBD5E1]">
            <Database className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
            <span className="font-semibold text-slate-700 dark:text-[#CBD5E1]">Open-Meteo</span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            {isCached ? (
              <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {language === "hi" ? "कैश्ड" : "Cached"} ({updatedTime})
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                {language === "hi" ? "लाइव" : "Live"} {updatedTime} IST
              </span>
            )}
          </div>

          {/* Refresh Action */}
          <button
            onClick={() => refreshWeather(true)}
            disabled={isRefreshing}
            type="button"
            className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800/50 bg-white dark:bg-[#0B1219] hover:bg-[#F8FAFC] dark:hover:bg-[#0E1821] px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-[#CBD5E1] transition-all disabled:opacity-50 shadow-2xs"
            title={language === "hi" ? "मौसम अपडेट करें" : "Refresh Weather"}
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-sky-600 dark:text-sky-400 ${
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
          <div className="flex h-22 w-22 sm:h-26 sm:w-26 shrink-0 items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-[#F8FAFC] dark:bg-[#0B1219] shadow-2xs">
            <WeatherIcon name={current.iconName} className="h-12 w-12 sm:h-14 sm:w-14" />
          </div>

          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-5xl sm:text-6xl font-black tracking-tighter text-slate-900 dark:text-[#F8FAFC]">
                {current.temperature}
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-sky-600 dark:text-sky-400">°C</span>
            </div>

            <div className="text-base sm:text-lg font-bold text-slate-800 dark:text-[#F8FAFC] mt-0.5">
              {conditionLabel}
            </div>

            <div className="text-xs text-slate-500 dark:text-[#7F91A3] mt-0.5">
              {language === "hi" ? "अनुभूत तापमान" : "Feels like"}:{" "}
              <strong className="text-slate-700 dark:text-[#CBD5E1] font-mono text-xs">
                {current.apparentTemperature}°C
              </strong>
            </div>
          </div>
        </div>

        {/* 4 Required Primary Citizen Metrics */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* 1. Rain Probability */}
          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/40 bg-[#F8FAFC] dark:bg-[#0B1219] p-3.5 transition-all hover:border-slate-300 hover:bg-[#F1F5F9] dark:hover:bg-[#0E1821]">
            <div className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
              <Umbrella className="h-3.5 w-3.5" />
              <span className="text-[11px] font-medium text-slate-500 dark:text-[#7F91A3]">
                {language === "hi" ? "वर्षा संभावना" : "Rain Prob"}
              </span>
            </div>
            <div className="mt-2 font-mono text-xl font-bold text-slate-900 dark:text-[#F8FAFC]">
              {currentRainProbability}%
            </div>
            <div className="text-[10.5px] text-slate-500 dark:text-[#7F91A3] mt-0.5 font-mono">
              {current.precipitation > 0
                ? `${current.precipitation} mm`
                : language === "hi"
                ? "वर्तमान में शुष्क"
                : "Dry currently"}
            </div>
          </div>

          {/* 2. Humidity */}
          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/40 bg-[#F8FAFC] dark:bg-[#0B1219] p-3.5 transition-all hover:border-slate-300 hover:bg-[#F1F5F9] dark:hover:bg-[#0E1821]">
            <div className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
              <Droplets className="h-3.5 w-3.5" />
              <span className="text-[11px] font-medium text-slate-500 dark:text-[#7F91A3]">
                {language === "hi" ? "आर्द्रता" : "Humidity"}
              </span>
            </div>
            <div className="mt-2 font-mono text-xl font-bold text-slate-900 dark:text-[#F8FAFC]">
              {current.relativeHumidity}%
            </div>
            <div className="text-[10.5px] text-slate-500 dark:text-[#7F91A3] mt-0.5">
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
          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/40 bg-[#F8FAFC] dark:bg-[#0B1219] p-3.5 transition-all hover:border-slate-300 hover:bg-[#F1F5F9] dark:hover:bg-[#0E1821]">
            <div className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
              <Wind className="h-3.5 w-3.5" />
              <span className="text-[11px] font-medium text-slate-500 dark:text-[#7F91A3]">
                {language === "hi" ? "हवा की गति" : "Wind Speed"}
              </span>
            </div>
            <div className="mt-2 font-mono text-xl font-bold text-slate-900 dark:text-[#F8FAFC]">
              {current.windSpeed}{" "}
              <span className="text-xs text-slate-500 font-normal">km/h</span>
            </div>
            <div className="text-[10.5px] text-slate-500 dark:text-[#7F91A3] mt-0.5 font-mono">
              {language === "hi" ? "झोंके" : "Gusts"}: {current.windGusts} km/h
            </div>
          </div>

          {/* 4. Cloud Cover */}
          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/40 bg-[#F8FAFC] dark:bg-[#0B1219] p-3.5 transition-all hover:border-slate-300 hover:bg-[#F1F5F9] dark:hover:bg-[#0E1821]">
            <div className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
              <Cloud className="h-3.5 w-3.5" />
              <span className="text-[11px] font-medium text-slate-500 dark:text-[#7F91A3]">
                {language === "hi" ? "बादल आवरण" : "Cloud Cover"}
              </span>
            </div>
            <div className="mt-2 font-mono text-xl font-bold text-slate-900 dark:text-[#F8FAFC]">
              {current.cloudCover}%
            </div>
            <div className="text-[10.5px] text-slate-500 dark:text-[#7F91A3] mt-0.5">
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


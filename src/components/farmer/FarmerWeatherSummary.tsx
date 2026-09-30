"use client";

import React from "react";
import {
  Thermometer,
  Umbrella,
  Droplet,
  Droplets,
  Wind,
  CloudSun,
  Clock,
  Compass,
  MapPin,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useWeather } from "@/context/WeatherContext";
import { WeatherIcon } from "../weather/WeatherIcon";

export const FarmerWeatherSummary: React.FC = () => {
  const { language, city } = useApp();
  const { weather } = useWeather();

  if (!weather) return null;

  const { current, hourly, cityNameEn, cityNameHi } = weather;
  const cityName = language === "hi" ? cityNameHi : cityNameEn;
  const stateName = language === "hi" ? city.stateHi : city.stateEn;

  // Next 24-hour calculations
  const next24h = hourly.slice(0, 24);
  const maxRainProb24h = next24h.reduce(
    (max, h) => Math.max(max, h.precipitationProbability || 0),
    0
  );
  const sumPrecip24h = next24h.reduce((sum, h) => sum + (h.precipitation || 0), 0);
  const conditionLabel =
    language === "hi" ? current.conditionHi : current.conditionEn;

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800/50 bg-white dark:bg-[#080E14] p-5 sm:p-6 shadow-xs space-y-4">
      {/* Title & City Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-[#0B1219] border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
            <CloudSun className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-[#F8FAFC] flex items-center gap-2">
              <span>{language === "hi" ? "खेत मौसम अवलोकन" : "Field Weather Status"}</span>
              <span className="text-xs font-normal text-slate-500 dark:text-[#7F91A3]">
                • {cityName}, {stateName}
              </span>
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-cyan-400 font-mono">
              {city.lat.toFixed(4)}°N, {city.lon.toFixed(4)}°E (Open-Meteo)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-[#7F91A3] bg-[#F8FAFC] dark:bg-[#060C12] border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-xl">
          <Clock className="h-3.5 w-3.5 text-sky-600 dark:text-cyan-400" />
          <span>
            {language === "hi" ? "24-घंटे का दृष्टिकोण" : "24-Hour Horizon"}
          </span>
        </div>
      </div>

      {/* 6 Agricultural Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Temperature */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800/40 bg-[#F8FAFC] dark:bg-[#0B1219] p-3.5 hover:bg-slate-100/80 dark:hover:bg-[#0E1821] transition-colors">
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
            <Thermometer className="h-4 w-4" />
            <span className="text-[11px] font-semibold text-slate-600 dark:text-[#7F91A3]">
              {language === "hi" ? "तापमान" : "Temperature"}
            </span>
          </div>
          <div className="mt-2 font-mono text-xl font-bold text-slate-900 dark:text-[#F8FAFC]">
            {current.temperature}°C
          </div>
          <div className="text-[10px] text-slate-500 dark:text-[#7F91A3] mt-0.5">
            {language === "hi" ? "अनुभूत" : "Feels"} {current.apparentTemperature}°C
          </div>
        </div>

        {/* 2. Rain Probability */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800/40 bg-[#F8FAFC] dark:bg-[#0B1219] p-3.5 hover:bg-slate-100/80 dark:hover:bg-[#0E1821] transition-colors">
          <div className="flex items-center gap-1.5 text-sky-600 dark:text-cyan-400">
            <Umbrella className="h-4 w-4" />
            <span className="text-[11px] font-semibold text-slate-600 dark:text-[#7F91A3]">
              {language === "hi" ? "वर्षा संभावना" : "Rain Prob (24h)"}
            </span>
          </div>
          <div className="mt-2 font-mono text-xl font-bold text-sky-600 dark:text-cyan-300">
            {maxRainProb24h}%
          </div>
          <div className="text-[10px] text-slate-500 dark:text-[#7F91A3] mt-0.5">
            {maxRainProb24h > 40
              ? language === "hi" ? "वर्षा संभव" : "Rain likely"
              : language === "hi" ? "न्यून संभावना" : "Low likelihood"}
          </div>
        </div>

        {/* 3. Expected Precipitation */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800/40 bg-[#F8FAFC] dark:bg-[#0B1219] p-3.5 hover:bg-slate-100/80 dark:hover:bg-[#0E1821] transition-colors">
          <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
            <Droplet className="h-4 w-4" />
            <span className="text-[11px] font-semibold text-slate-600 dark:text-[#7F91A3]">
              {language === "hi" ? "अपेक्षित वर्षा" : "Precipitation"}
            </span>
          </div>
          <div className="mt-2 font-mono text-xl font-bold text-slate-900 dark:text-[#F8FAFC]">
            {Math.round(sumPrecip24h * 10) / 10} <span className="text-xs font-normal text-slate-500 dark:text-[#7F91A3]">mm</span>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-[#7F91A3] mt-0.5 font-mono">
            {language === "hi" ? "वर्तमान दर" : "Current"}: {current.precipitation} mm
          </div>
        </div>

        {/* 4. Humidity */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800/40 bg-[#F8FAFC] dark:bg-[#0B1219] p-3.5 hover:bg-slate-100/80 dark:hover:bg-[#0E1821] transition-colors">
          <div className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400">
            <Droplets className="h-4 w-4" />
            <span className="text-[11px] font-semibold text-slate-600 dark:text-[#7F91A3]">
              {language === "hi" ? "आर्द्रता" : "Humidity"}
            </span>
          </div>
          <div className="mt-2 font-mono text-xl font-bold text-slate-900 dark:text-[#F8FAFC]">
            {current.relativeHumidity}%
          </div>
          <div className="text-[10px] text-slate-500 dark:text-[#7F91A3] mt-0.5">
            {current.relativeHumidity > 70
              ? language === "hi" ? "उच्च नमी" : "High humidity"
              : language === "hi" ? "सामान्य नमी" : "Optimal"}
          </div>
        </div>

        {/* 5. Wind Speed & Gusts */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800/40 bg-[#F8FAFC] dark:bg-[#0B1219] p-3.5 hover:bg-slate-100/80 dark:hover:bg-[#0E1821] transition-colors">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <Wind className="h-4 w-4" />
            <span className="text-[11px] font-semibold text-slate-600 dark:text-[#7F91A3]">
              {language === "hi" ? "पवन गति" : "Wind"}
            </span>
          </div>
          <div className="mt-2 font-mono text-xl font-bold text-slate-900 dark:text-[#F8FAFC]">
            {current.windSpeed} <span className="text-xs font-normal text-slate-500 dark:text-[#7F91A3]">km/h</span>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-[#7F91A3] mt-0.5 font-mono">
            {language === "hi" ? "झोंके" : "Gusts"}: {current.windGusts} km/h
          </div>
        </div>

        {/* 6. Current WMO Condition */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800/40 bg-[#F8FAFC] dark:bg-[#0B1219] p-3.5 hover:bg-slate-100/80 dark:hover:bg-[#0E1821] transition-colors">
          <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
            <WeatherIcon name={current.iconName} className="h-4 w-4" />
            <span className="text-[11px] font-semibold text-slate-600 dark:text-[#7F91A3]">
              {language === "hi" ? "स्थिति" : "Condition"}
            </span>
          </div>
          <div className="mt-2 text-xs font-bold text-slate-800 dark:text-[#F8FAFC] truncate" title={conditionLabel}>
            {conditionLabel}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-[#7F91A3] mt-0.5 font-mono">
            WMO #{current.weatherCode}
          </div>
        </div>
      </div>
    </div>
  );
};

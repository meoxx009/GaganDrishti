"use client";

import React from "react";
import { Calendar, Umbrella, Wind, Droplet, ArrowUp, ArrowDown } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useWeather } from "@/context/WeatherContext";
import { WeatherIcon } from "../weather/WeatherIcon";

export const FarmerOutlook5D: React.FC = () => {
  const { language } = useApp();
  const { weather } = useWeather();

  if (!weather || !weather.daily || weather.daily.length === 0) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800/50 bg-white dark:bg-[#080E14] p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
          <Calendar className="h-4 w-4" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-[#F8FAFC]">
            {language === "hi"
              ? "5 दिवसीय कृषि-मौसम दृष्टिकोण"
              : "5-Day Agricultural Weather Outlook"}
          </h3>
        </div>
        <span className="text-xs text-slate-500 dark:text-[#7F91A3]">
          {language === "hi" ? "वर्षा, तापमान एवं हवा का रुझान" : "Precipitation, Temp & Wind Trends"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {weather.daily.map((day, idx) => {
          const dayName = language === "hi" ? day.dayNameHi : day.dayNameEn;
          const condition =
            language === "hi" ? day.conditionHi : day.conditionEn;

          return (
            <div
              key={idx}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800/40 bg-[#F8FAFC] dark:bg-[#0B1219] p-4 transition-all hover:border-emerald-400 dark:hover:border-emerald-500/30 hover:bg-slate-100/80 dark:hover:bg-[#0E1821]"
            >
              {/* Day Header */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2">
                <span className="font-bold text-sm text-slate-900 dark:text-[#F8FAFC]">
                  {dayName}
                </span>
                <span className="text-[11px] font-mono text-slate-500 dark:text-[#7F91A3]">
                  {day.date.slice(5)}
                </span>
              </div>

              {/* Weather Condition */}
              <div className="my-3 flex items-center gap-2.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-[#060C12] border border-slate-200 dark:border-slate-800/50">
                  <WeatherIcon name={day.iconName} className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs font-semibold text-slate-800 dark:text-[#CBD5E1] truncate" title={condition}>
                    {condition}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] font-semibold text-sky-600 dark:text-cyan-400 mt-0.5">
                    <Umbrella className="h-3 w-3 shrink-0" />
                    <span>{day.precipitationProbabilityMax}% rain</span>
                  </div>
                </div>
              </div>

              {/* Farm Parameters */}
              <div className="space-y-1.5 border-t border-slate-200 dark:border-slate-800/80 pt-2.5 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 dark:text-[#7F91A3] font-sans">
                    {language === "hi" ? "तापमान" : "Temp"}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-amber-600 dark:text-amber-400 font-bold">{day.tempMax}°</span>
                    <span className="text-slate-400 dark:text-slate-500">/</span>
                    <span className="text-sky-600 dark:text-sky-300 font-bold">{day.tempMin}°C</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 dark:text-[#7F91A3] font-sans">
                    {language === "hi" ? "वर्षा" : "Rain"}
                  </span>
                  <span className="text-slate-800 dark:text-[#CBD5E1] font-semibold">
                    {day.precipitationSum} mm
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 dark:text-[#7F91A3] font-sans">
                    {language === "hi" ? "अधिकतम हवा" : "Max Wind"}
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    {day.windSpeedMax} km/h
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

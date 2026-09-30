"use client";

import React from "react";
import { Calendar, Umbrella, Wind, ArrowUp, ArrowDown, Droplet } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useWeather } from "@/context/WeatherContext";
import { WeatherIcon } from "../weather/WeatherIcon";

export const CitizenDaily5D: React.FC = () => {
  const { language } = useApp();
  const { weather } = useWeather();

  if (!weather || !weather.daily || weather.daily.length === 0) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800/40 bg-white dark:bg-[#080E14] p-5 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
          <Calendar className="h-4 w-4" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-[#F8FAFC]">
            {language === "hi"
              ? "5 दिवसीय मौसम पूर्वानुमान"
              : "5-Day Synoptic Outlook"}
          </h3>
        </div>
        <span className="text-xs text-slate-500 dark:text-[#7F91A3]">
          {language === "hi" ? "आगामी 5 दिन का दृष्टिकोण" : "5-Day Comprehensive Metrics"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {weather.daily.map((day, index) => {
          const dayName = language === "hi" ? day.dayNameHi : day.dayNameEn;
          const condition =
            language === "hi" ? day.conditionHi : day.conditionEn;

          return (
            <div
              key={index}
              className="flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800/40 bg-[#F8FAFC] dark:bg-[#0B1219] p-3.5 transition-all hover:border-slate-300 hover:bg-[#F1F5F9] dark:hover:bg-[#0E1821]"
            >
              {/* Day Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/40 pb-2">
                <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-[#F8FAFC]">
                  {dayName}
                </span>
                <span className="text-[10.5px] font-mono text-slate-500 dark:text-[#7F91A3]">
                  {day.date.slice(5)}
                </span>
              </div>

              {/* Weather Condition & Icon */}
              <div className="my-3 flex items-center gap-2.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-[#080E14] border border-slate-200/60 dark:border-slate-800/40 shadow-2xs">
                  <WeatherIcon name={day.iconName} className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs font-semibold text-slate-900 dark:text-[#CBD5E1] truncate" title={condition}>
                    {condition}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-sky-600 dark:text-sky-400 mt-0.5">
                    <Umbrella className="h-3 w-3 shrink-0" />
                    <span>{day.precipitationProbabilityMax}% rain</span>
                  </div>
                </div>
              </div>

              {/* Metrics Box */}
              <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-800/40 pt-2 text-xs">
                {/* Max / Min Temp */}
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-slate-500 dark:text-[#7F91A3]">
                    {language === "hi" ? "अधि / न्यून" : "High / Low"}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center text-amber-600 dark:text-amber-400 font-bold">
                      <ArrowUp className="h-2.5 w-2.5" />
                      {day.tempMax}°
                    </span>
                    <span className="flex items-center text-sky-600 dark:text-sky-300 font-bold">
                      <ArrowDown className="h-2.5 w-2.5" />
                      {day.tempMin}°
                    </span>
                  </div>
                </div>

                {/* Rainfall Sum */}
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-slate-500 dark:text-[#7F91A3] flex items-center gap-1">
                    <Droplet className="h-2.5 w-2.5 text-blue-500" />
                    {language === "hi" ? "कुल वर्षा" : "Rain"}
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-[#CBD5E1]">
                    {day.precipitationSum} mm
                  </span>
                </div>

                {/* Maximum Wind Speed */}
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-slate-500 dark:text-[#7F91A3] flex items-center gap-1">
                    <Wind className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400" />
                    {language === "hi" ? "तेज हवा" : "Max Wind"}
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-[#CBD5E1]">
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

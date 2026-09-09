"use client";

import React from "react";
import { Calendar, Umbrella, Wind, ArrowUp, ArrowDown } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useWeather } from "@/context/WeatherContext";
import { WeatherIcon } from "./WeatherIcon";

export const DailyForecastGrid: React.FC = () => {
  const { language } = useApp();
  const { weather } = useWeather();

  if (!weather || !weather.daily || weather.daily.length === 0) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-slate-700/60 bg-slate-900/60 dark:bg-[#0D1B2A]/60 p-5 sm:p-6 backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-emerald-400">
          <Calendar className="h-4 w-4" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            {language === "hi"
              ? "5 दिवसीय मौसम दृष्टिकोण"
              : "5-Day Synoptic Outlook"}
          </h2>
        </div>
        <span className="text-xs text-slate-400">
          {language === "hi" ? "दैनिक अधिकतम / न्यूनतम" : "Daily High / Low"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {weather.daily.map((day, index) => {
          const dayName = language === "hi" ? day.dayNameHi : day.dayNameEn;
          const condition =
            language === "hi" ? day.conditionHi : day.conditionEn;

          return (
            <div
              key={index}
              className="flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-slate-950/40 p-4 transition-all hover:border-emerald-500/40 hover:bg-slate-800/50"
            >
              {/* Day Header */}
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-200">
                  {dayName}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {day.date.slice(5)}
                </span>
              </div>

              {/* Weather Icon & Condition */}
              <div className="my-3 flex items-center gap-2.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800/60">
                  <WeatherIcon name={day.iconName} className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs font-semibold text-slate-200 truncate">
                    {condition}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-cyan-400">
                    <Umbrella className="h-3 w-3 shrink-0" />
                    <span>{day.precipitationProbabilityMax}% rain</span>
                  </div>
                </div>
              </div>

              {/* Temperature High / Low */}
              <div className="border-t border-slate-800/80 pt-2.5">
                <div className="flex items-center justify-between font-mono text-xs">
                  <div className="flex items-center text-amber-400 font-semibold">
                    <ArrowUp className="h-3 w-3 mr-0.5" />
                    <span>{day.tempMax}°C</span>
                  </div>
                  <div className="flex items-center text-sky-300">
                    <ArrowDown className="h-3 w-3 mr-0.5" />
                    <span>{day.tempMin}°C</span>
                  </div>
                </div>

                {/* Additional metrics: rain sum and max wind */}
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>{day.precipitationSum} mm</span>
                  <div className="flex items-center gap-0.5">
                    <Wind className="h-2.5 w-2.5 text-emerald-400" />
                    <span>{day.windSpeedMax} km/h</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

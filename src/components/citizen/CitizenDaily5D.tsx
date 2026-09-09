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
    <div className="rounded-3xl border border-slate-700/60 bg-slate-900/60 dark:bg-[#0D1B2A]/60 p-5 sm:p-6 backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-emerald-400">
          <Calendar className="h-4 w-4" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            {language === "hi"
              ? "5 दिवसीय मौसम पूर्वानुमान"
              : "5-Day Synoptic Outlook"}
          </h3>
        </div>
        <span className="text-xs text-slate-400">
          {language === "hi" ? "आगामी 5 दिन का दृष्टिकोण" : "5-Day Comprehensive Metrics"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {weather.daily.map((day, index) => {
          const dayName = language === "hi" ? day.dayNameHi : day.dayNameEn;
          const condition =
            language === "hi" ? day.conditionHi : day.conditionEn;

          return (
            <div
              key={index}
              className="flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-slate-950/50 p-4 transition-all hover:border-emerald-500/40 hover:bg-slate-800/50"
            >
              {/* Day Header */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="font-bold text-sm text-slate-100">
                  {dayName}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {day.date.slice(5)}
                </span>
              </div>

              {/* Weather Condition & Icon */}
              <div className="my-3.5 flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <WeatherIcon name={day.iconName} className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs font-semibold text-slate-200 truncate" title={condition}>
                    {condition}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400 mt-0.5">
                    <Umbrella className="h-3 w-3 shrink-0" />
                    <span>{day.precipitationProbabilityMax}% rain</span>
                  </div>
                </div>
              </div>

              {/* Metrics Box */}
              <div className="space-y-2 border-t border-slate-800/80 pt-2.5 text-xs">
                {/* Max / Min Temp */}
                <div className="flex items-center justify-between font-mono">
                  <span className="text-[11px] text-slate-400">
                    {language === "hi" ? "अधि / न्यून" : "High / Low"}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center text-amber-400 font-bold">
                      <ArrowUp className="h-3 w-3" />
                      {day.tempMax}°
                    </span>
                    <span className="flex items-center text-sky-300 font-bold">
                      <ArrowDown className="h-3 w-3" />
                      {day.tempMin}°
                    </span>
                  </div>
                </div>

                {/* Rainfall Sum */}
                <div className="flex items-center justify-between font-mono">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Droplet className="h-3 w-3 text-blue-400" />
                    {language === "hi" ? "कुल वर्षा" : "Rainfall"}
                  </span>
                  <span className="font-semibold text-slate-200">
                    {day.precipitationSum} mm
                  </span>
                </div>

                {/* Maximum Wind Speed */}
                <div className="flex items-center justify-between font-mono">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Wind className="h-3 w-3 text-emerald-400" />
                    {language === "hi" ? "अधिकतम हवा" : "Max Wind"}
                  </span>
                  <span className="font-semibold text-slate-200">
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

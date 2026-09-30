"use client";

import React from "react";
import { Clock, Umbrella, Droplet } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useWeather } from "@/context/WeatherContext";
import { WeatherIcon } from "../weather/WeatherIcon";

export const CitizenHourly12H: React.FC = () => {
  const { language } = useApp();
  const { weather } = useWeather();

  if (!weather || !weather.hourly || weather.hourly.length === 0) {
    return null;
  }

  // Exactly next 12 hours
  const next12Hours = weather.hourly.slice(0, 12);

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800/40 bg-white dark:bg-[#080E14] p-5 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
          <Clock className="h-4 w-4" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-[#F8FAFC]">
            {language === "hi"
              ? "अगले 12 घंटे का पूर्वानुमान"
              : "Next 12-Hour Microcast"}
          </h3>
        </div>
        <span className="text-xs text-slate-500 dark:text-[#7F91A3]">
          {language === "hi" ? "घंटेवार विवरण (12 घंटे)" : "12-Hour Progression"}
        </span>
      </div>

      {/* Horizontally scrollable track */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-thin">
        {next12Hours.map((item, index) => {
          const condition =
            language === "hi" ? item.conditionHi : item.conditionEn;

          return (
            <div
              key={index}
              className="flex flex-col items-center justify-between min-w-[96px] sm:min-w-[104px] rounded-2xl border border-slate-200/80 dark:border-slate-800/40 bg-[#F8FAFC] dark:bg-[#0B1219] p-3 text-center transition-all hover:border-slate-300 hover:bg-[#F1F5F9] dark:hover:bg-[#0E1821]"
              title={`${item.formattedHour} IST: ${condition}`}
            >
              {/* Hour Time */}
              <div className="font-mono text-[11px] font-medium text-slate-500 dark:text-[#7F91A3]">
                {item.formattedHour}
              </div>

              {/* Weather Icon */}
              <div className="my-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white dark:bg-[#080E14] border border-slate-200/60 dark:border-slate-800/40 shadow-2xs">
                <WeatherIcon name={item.iconName} className="h-5 w-5" />
              </div>

              {/* Temperature */}
              <div className="font-mono text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">
                {Math.round(item.temperature)}°C
              </div>

              {/* Rain Probability */}
              <div className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-sky-600 dark:text-sky-400">
                <Umbrella className="h-3 w-3 shrink-0" />
                <span>{item.precipitationProbability}%</span>
              </div>

              {/* Expected Precipitation */}
              <div className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-500 dark:text-[#7F91A3] font-mono">
                <Droplet className="h-2.5 w-2.5 text-blue-500 shrink-0" />
                <span>{item.precipitation} mm</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

};

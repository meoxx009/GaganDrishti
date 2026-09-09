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
    <div className="rounded-3xl border border-slate-700/60 bg-slate-900/60 dark:bg-[#0D1B2A]/60 p-5 sm:p-6 backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-cyan-400">
          <Clock className="h-4 w-4" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            {language === "hi"
              ? "अगले 12 घंटे का पूर्वानुमान"
              : "Next 12-Hour Microcast"}
          </h3>
        </div>
        <span className="text-xs text-slate-400">
          {language === "hi" ? "घंटेवार विवरण (12 घंटे)" : "12-Hour Progression"}
        </span>
      </div>

      {/* Horizontally scrollable track */}
      <div className="flex gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin">
        {next12Hours.map((item, index) => {
          const condition =
            language === "hi" ? item.conditionHi : item.conditionEn;

          return (
            <div
              key={index}
              className="flex flex-col items-center justify-between min-w-[100px] sm:min-w-[110px] rounded-2xl border border-slate-800/80 bg-slate-950/50 p-3.5 text-center transition-all hover:border-cyan-500/40 hover:bg-slate-800/50"
              title={`${item.formattedHour} IST: ${condition}`}
            >
              {/* Hour Time */}
              <div className="font-mono text-xs font-semibold text-slate-300">
                {item.formattedHour}
              </div>

              {/* Weather Icon */}
              <div className="my-2.5 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/40 shadow-xs">
                <WeatherIcon name={item.iconName} className="h-5 w-5" />
              </div>

              {/* Temperature */}
              <div className="font-mono text-base font-bold text-white">
                {Math.round(item.temperature)}°C
              </div>

              {/* Rain Probability */}
              <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-cyan-400">
                <Umbrella className="h-3.5 w-3.5 shrink-0" />
                <span>{item.precipitationProbability}%</span>
              </div>

              {/* Expected Precipitation */}
              <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                <Droplet className="h-3 w-3 text-blue-400 shrink-0" />
                <span>{item.precipitation} mm</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

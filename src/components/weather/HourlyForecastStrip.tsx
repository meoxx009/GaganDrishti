"use client";

import React from "react";
import { Clock, Umbrella, Wind } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useWeather } from "@/context/WeatherContext";
import { WeatherIcon } from "./WeatherIcon";

export const HourlyForecastStrip: React.FC = () => {
  const { language } = useApp();
  const { weather } = useWeather();

  if (!weather || !weather.hourly || weather.hourly.length === 0) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-slate-700/60 bg-slate-900/60 dark:bg-[#0D1B2A]/60 p-5 sm:p-6 backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-cyan-400">
          <Clock className="h-4 w-4" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            {language === "hi"
              ? "24 घंटे का पूर्वानुमान (घंटेवार)"
              : "24-Hour Horizon Forecast"}
          </h2>
        </div>
        <span className="text-xs text-slate-400">
          {language === "hi" ? "स्क्रॉल करें →" : "Scroll for 24h →"}
        </span>
      </div>

      {/* Horizontal Carousel */}
      <div className="flex gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin">
        {weather.hourly.map((item, index) => {
          const condition =
            language === "hi" ? item.conditionHi : item.conditionEn;

          return (
            <div
              key={index}
              className="flex flex-col items-center justify-between min-w-[90px] sm:min-w-[100px] rounded-2xl border border-slate-800/80 bg-slate-950/40 p-3 text-center transition-all hover:border-cyan-500/40 hover:bg-slate-800/50"
              title={`${item.formattedHour} IST: ${condition}`}
            >
              {/* Hour */}
              <span className="font-mono text-xs font-semibold text-slate-400">
                {item.formattedHour}
              </span>

              {/* Icon */}
              <div className="my-2.5 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800/40">
                <WeatherIcon name={item.iconName} className="h-5 w-5" />
              </div>

              {/* Temperature */}
              <div className="font-mono text-base font-bold text-slate-100">
                {Math.round(item.temperature)}°
              </div>

              {/* Rain probability */}
              <div className="mt-2 flex items-center gap-1 text-[11px] font-medium text-cyan-300">
                <Umbrella className="h-3 w-3 shrink-0" />
                <span>{item.precipitationProbability}%</span>
              </div>

              {/* Wind */}
              <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
                <Wind className="h-2.5 w-2.5 shrink-0" />
                <span>{Math.round(item.windSpeed)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

"use client";

import React from "react";
import {
  Umbrella,
  Wind,
  Sun,
  CloudRain,
  CheckCircle,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useWeather } from "@/context/WeatherContext";
import { generateCitizenSmartSummary } from "@/lib/weather/citizenSummary";

export const CitizenSmartSummary: React.FC = () => {
  const { language } = useApp();
  const { weather } = useWeather();

  if (!weather) return null;

  const summary = generateCitizenSmartSummary(weather, language);

  const getIcon = () => {
    switch (summary.iconType) {
      case "Umbrella":
        return <Umbrella className="h-6 w-6 text-sky-400" />;
      case "CloudRain":
        return <CloudRain className="h-6 w-6 text-blue-400" />;
      case "Wind":
        return <Wind className="h-6 w-6 text-amber-400" />;
      case "Sun":
        return <Sun className="h-6 w-6 text-orange-400" />;
      case "CheckCircle":
      default:
        return <CheckCircle className="h-6 w-6 text-emerald-400" />;
    }
  };

  const getCardTheme = () => {
    switch (summary.severity) {
      case "warning":
        return {
          border: "border-sky-200 dark:border-sky-500/30",
          bg: "bg-white dark:bg-[#080E14]",
          badgeBg: "bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-500/10 dark:border-sky-500/30 dark:text-sky-400",
          bulletColor: "text-sky-600 dark:text-sky-400",
        };
      case "caution":
        return {
          border: "border-amber-200 dark:border-amber-500/30",
          bg: "bg-white dark:bg-[#080E14]",
          badgeBg: "bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-400",
          bulletColor: "text-amber-600 dark:text-amber-400",
        };
      case "success":
      default:
        return {
          border: "border-slate-200 dark:border-slate-800/40",
          bg: "bg-white dark:bg-[#080E14]",
          badgeBg: "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400",
          bulletColor: "text-emerald-600 dark:text-emerald-400",
        };
    }
  };

  const theme = getCardTheme();

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border ${theme.border} ${theme.bg} p-6 sm:p-7 shadow-xs transition-all`}
    >
      <div className="relative z-10 flex flex-col gap-4">
        {/* Top Header Row: Badge & Smart Summary Pill */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700/50 shadow-2xs">
              {getIcon()}
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-sky-600 dark:text-cyan-400" />
                {language === "hi"
                  ? "नागरिक दैनिक मौसम सारांश (स्मार्ट इंटेलिजेंस)"
                  : "Citizen Smart Advisory (Deterministic)"}
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {summary.title}
              </h3>
            </div>
          </div>

          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${theme.badgeBg}`}
          >
            {summary.badge}
          </span>
        </div>

        {/* Narrative Description */}
        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed max-w-4xl">
          {summary.advisory}
        </p>

        {/* Actionable Tips Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          {summary.tips.map((tip, index) => (
            <div
              key={index}
              className="flex items-start gap-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0B1219] p-2.5 text-xs text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800/60"
            >
              <ArrowRight
                className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${theme.bulletColor}`}
              />
              <span className="leading-snug">{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

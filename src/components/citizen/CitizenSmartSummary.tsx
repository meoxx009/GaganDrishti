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
          border: "border-sky-500/40",
          bg: "from-sky-950/40 via-slate-900/60 to-slate-950/80",
          badgeBg: "bg-sky-500/15 border-sky-500/30 text-sky-300",
          bulletColor: "text-sky-400",
        };
      case "caution":
        return {
          border: "border-amber-500/40",
          bg: "from-amber-950/30 via-slate-900/60 to-slate-950/80",
          badgeBg: "bg-amber-500/15 border-amber-500/30 text-amber-300",
          bulletColor: "text-amber-400",
        };
      case "success":
      default:
        return {
          border: "border-emerald-500/40",
          bg: "from-emerald-950/30 via-slate-900/60 to-slate-950/80",
          badgeBg: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
          bulletColor: "text-emerald-400",
        };
    }
  };

  const theme = getCardTheme();

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border ${theme.border} bg-gradient-to-br ${theme.bg} p-6 sm:p-7 backdrop-blur-xl shadow-xl transition-all`}
    >
      <div className="relative z-10 flex flex-col gap-4">
        {/* Top Header Row: Badge & Smart Summary Pill */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900/70 border border-slate-700/50 shadow-xs">
              {getIcon()}
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                {language === "hi"
                  ? "नागरिक दैनिक मौसम सारांश (स्मार्ट इंटेलिजेंस)"
                  : "Citizen Smart Advisory (Deterministic)"}
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-slate-100 mt-0.5">
                {summary.title}
              </h3>
            </div>
          </div>

          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${theme.badgeBg}`}
          >
            {summary.badge}
          </span>
        </div>

        {/* Narrative Description */}
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-4xl">
          {summary.advisory}
        </p>

        {/* Actionable Tips Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-800/80">
          {summary.tips.map((tip, index) => (
            <div
              key={index}
              className="flex items-start gap-2 rounded-xl bg-slate-950/40 p-2.5 text-xs text-slate-300 border border-slate-800/60"
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

"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, ArrowRight, X, ShieldAlert } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useWeather } from "@/context/WeatherContext";
import { evaluateWeatherRisks } from "@/lib/weather/riskEngine";

export const ProactiveAlertBanner: React.FC = () => {
  const { city, language, setActiveSection, activeSection } = useApp();
  const { weather } = useWeather();
  const [dismissedId, setDismissedId] = useState<string | null>(null);

  // If already on the alerts page, do not clutter with duplicate banner
  const isOnAlerts = activeSection === "alerts";

  const riskResult = weather ? evaluateWeatherRisks(weather) : null;
  const topRisk = riskResult && riskResult.risks.length > 0
    ? riskResult.risks.find((r) => r.level === "HIGH") || riskResult.risks[0]
    : null;

  // Reset dismissal if city changes
  useEffect(() => {
    setDismissedId(null);
  }, [city.lat, city.lon]);

  if (isOnAlerts || !topRisk || topRisk.level === "LOW") {
    return null;
  }

  const alertKey = `${city.lat.toFixed(2)}_${topRisk.id}_${topRisk.level}`;
  if (dismissedId === alertKey) {
    return null;
  }

  const cityName =
    language === "hi"
      ? city.nameHi
      : language === "mr" && city.nameMr
      ? city.nameMr
      : city.nameEn;

  const title = language === "hi" ? topRisk.titleHi : topRisk.titleEn;
  const impact = language === "hi" ? topRisk.impactHi : topRisk.impactEn;

  const isHigh = topRisk.level === "HIGH";

  return (
    <div
      role="alert"
      className={`relative z-30 w-full border-b transition-all ${
        isHigh
          ? "border-amber-400/40 bg-amber-500/10 text-amber-900 dark:text-amber-200 backdrop-blur-md"
          : "border-sky-400/30 bg-sky-500/10 text-sky-900 dark:text-sky-200 backdrop-blur-md"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:px-6 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="relative flex h-3 w-3 shrink-0">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isHigh ? "bg-amber-400" : "bg-sky-400"
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-3 w-3 ${
                isHigh ? "bg-amber-500" : "bg-sky-500"
              }`}
            />
          </span>

          <span className="font-bold uppercase tracking-wider text-[11px] px-2 py-0.5 rounded-full border border-current shrink-0">
            {isHigh
              ? language === "hi"
                ? "मौसम चेतावनी"
                : language === "mr"
                ? "हवामान इशारा"
                : "Weather Risk Alert"
              : language === "hi"
              ? "मौसम सतर्कता"
              : language === "mr"
              ? "हवामान सतर्कता"
              : "Weather Advisory"}
          </span>

          <span className="font-bold shrink-0">{cityName}:</span>
          <span className="truncate font-medium">{title} — {impact}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <button
            type="button"
            onClick={() => setActiveSection("alerts")}
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer ${
              isHigh
                ? "bg-amber-500 text-slate-950 hover:bg-amber-400"
                : "bg-sky-600 dark:bg-sky-500 text-white dark:text-slate-950 hover:bg-sky-700"
            }`}
          >
            <span>{language === "hi" ? "जोखिम देखें" : language === "mr" ? "तपशील पहा" : "View Advisory"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setDismissedId(alertKey)}
            className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            title="Dismiss alert banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

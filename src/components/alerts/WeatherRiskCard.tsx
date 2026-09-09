"use client";

import React from "react";
import {
  AlertTriangle,
  Info,
  Clock,
  Compass,
  MapPin,
  Database,
  CloudRain,
  CloudDrizzle,
  Sun,
  SunMedium,
  Wind,
  CloudLightning,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { WeatherRiskItem, RiskLevel } from "@/lib/weather/riskTypes";

interface WeatherRiskCardProps {
  risk: WeatherRiskItem;
  updatedTime: string;
}

function getSeverityBadge(level: RiskLevel, language: string) {
  switch (level) {
    case "HIGH":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-300">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>{language === "hi" ? "उच्च जोखिम (HIGH)" : "HIGH RISK"}</span>
        </span>
      );
    case "MODERATE":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/40 bg-cyan-500/15 px-3 py-1 text-xs font-bold text-cyan-300">
          <Info className="h-3.5 w-3.5" />
          <span>{language === "hi" ? "मध्यम जोखिम (MODERATE)" : "MODERATE RISK"}</span>
        </span>
      );
    case "LOW":
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>{language === "hi" ? "न्यून जोखिम (LOW)" : "LOW RISK"}</span>
        </span>
      );
  }
}

function getRiskIcon(iconName: string, level: RiskLevel) {
  const iconClass = `h-6 w-6 ${
    level === "HIGH"
      ? "text-amber-400"
      : level === "MODERATE"
      ? "text-cyan-400"
      : "text-emerald-400"
  }`;

  switch (iconName) {
    case "CloudRain":
      return <CloudRain className={iconClass} />;
    case "CloudDrizzle":
      return <CloudDrizzle className={iconClass} />;
    case "Sun":
      return <Sun className={iconClass} />;
    case "SunMedium":
      return <SunMedium className={iconClass} />;
    case "Wind":
      return <Wind className={iconClass} />;
    case "CloudLightning":
      return <CloudLightning className={iconClass} />;
    default:
      return <AlertTriangle className={iconClass} />;
  }
}

export const WeatherRiskCard: React.FC<WeatherRiskCardProps> = ({
  risk,
  updatedTime,
}) => {
  const { language, city } = useApp();

  const title = language === "hi" ? risk.titleHi : risk.titleEn;
  const timeframe = language === "hi" ? risk.timeframeHi : risk.timeframeEn;
  const underlyingValue =
    language === "hi" ? risk.underlyingValueHi : risk.underlyingValueEn;
  const impact = language === "hi" ? risk.impactHi : risk.impactEn;
  const action = language === "hi" ? risk.actionHi : risk.actionEn;

  const cityName = language === "hi" ? city.nameHi : city.nameEn;
  const stateName = language === "hi" ? city.stateHi : city.stateEn;

  const cardBorder =
    risk.level === "HIGH"
      ? "border-amber-500/40"
      : risk.level === "MODERATE"
      ? "border-cyan-500/30"
      : "border-slate-700/60";

  return (
    <div
      className={`rounded-3xl border ${cardBorder} bg-gradient-to-br from-[#0D1B2A]/90 via-[#07111F]/90 to-slate-950 p-6 sm:p-7 backdrop-blur-xl shadow-xl space-y-5 transition-all`}
    >
      {/* 1. Header Row: Type, Severity, City */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900/80 border border-slate-700/60 shadow-inner">
            {getRiskIcon(risk.iconName, risk.level)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-extrabold text-white">
                {title}
              </h3>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
              <MapPin className="h-3.5 w-3.5 text-cyan-400" />
              <span>
                {cityName}, {stateName}
              </span>
              <span className="text-slate-600">•</span>
              <span className="font-mono text-[11px] text-cyan-300">
                {city.lat.toFixed(4)}°N, {city.lon.toFixed(4)}°E
              </span>
            </div>
          </div>
        </div>

        <div>{getSeverityBadge(risk.level, language)}</div>
      </div>

      {/* 2. Metadata: Expected Timeframe & Underlying Forecast Value */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Timeframe */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1">
            <Clock className="h-3.5 w-3.5 text-cyan-400" />
            <span>{language === "hi" ? "अपेक्षित समय-सीमा" : "Expected Timeframe"}</span>
          </div>
          <div className="text-sm font-bold text-slate-100 font-mono">
            {timeframe}
          </div>
        </div>

        {/* Underlying Forecast Value */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1">
            <Database className="h-3.5 w-3.5 text-emerald-400" />
            <span>{language === "hi" ? "मूल पूर्वानुमान मान" : "Underlying Forecast Value"}</span>
          </div>
          <div className="text-xs sm:text-sm font-semibold text-cyan-300 font-mono leading-snug">
            {underlyingValue}
          </div>
        </div>
      </div>

      {/* 3. The 2 Core Citizen Questions */}
      <div className="space-y-3">
        {/* What could happen? */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <HelpCircle className="h-4 w-4" />
            <span>{language === "hi" ? "क्या हो सकता है? (संभावित प्रभाव)" : "What could happen?"}</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-6">
            {impact}
          </p>
        </div>

        {/* What should I do? */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <ArrowRight className="h-4 w-4" />
            <span>{language === "hi" ? "मुझे क्या करना चाहिए? (व्यावहारिक कदम)" : "What should I do?"}</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-6">
            {action}
          </p>
        </div>
      </div>

      {/* 4. Footer: Updated Time & Open-Meteo Source */}
      <div className="border-t border-slate-800/80 pt-3 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3 w-3 text-slate-500" />
          <span>
            {language === "hi" ? "अंतिम मूल्यांकन" : "Evaluated"}: {updatedTime} IST
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-cyan-400 font-medium">
          <Database className="h-3 w-3" />
          <span>Source: Open-Meteo Forecast API (Derived Indicator)</span>
        </div>
      </div>
    </div>
  );
};

"use client";

import React from "react";
import { CheckCircle2, ShieldCheck, Database, Clock, Compass } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { NormalizedWeatherData } from "@/lib/weather/types";

interface NoRiskStateCardProps {
  weather: NormalizedWeatherData;
  updatedTime: string;
}

export const NoRiskStateCard: React.FC<NoRiskStateCardProps> = ({
  weather,
  updatedTime,
}) => {
  const { language, city } = useApp();

  const cityName = language === "hi" ? city.nameHi : city.nameEn;
  const stateName = language === "hi" ? city.stateHi : city.stateEn;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/20 via-slate-900/70 to-slate-950 p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
      <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-emerald-500/10 blur-3xl" />

      {/* Reassuring Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 shadow-inner">
          <ShieldCheck className="h-8 w-8" />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              {language === "hi"
                ? "कोई मुख्य मौसम जोखिम नहीं"
                : "No Major Weather Risk Detected"}
            </h3>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-0.5 text-xs font-bold text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{language === "hi" ? "सामान्य वायुमंडलीय स्थिति" : "Baseline Conditions Normal"}</span>
            </span>
          </div>

          <p className="mt-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
            {language === "hi"
              ? `${cityName} (${stateName}) के लिए वर्तमान पूर्वानुमान के आधार पर कोई गंभीर वर्षा, अत्यधिक तापमान, तीव्र हवा अथवा तूफान का जोखिम दर्ज नहीं हुआ है। सभी वायुमंडलीय संकेतक सामान्य सीमा में हैं।`
              : `Atmospheric parameters derived from the Open-Meteo forecast for ${cityName} (${stateName}) remain within comfortable baseline thresholds. No severe precipitation, critical heat, high winds, or convective storm signatures were detected.`}
          </p>
        </div>
      </div>

      {/* Baseline Verification Grid */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-3.5">
          <span className="text-[11px] text-slate-400 font-semibold block">
            {language === "hi" ? "वर्षा दर" : "Rainfall Rate"}
          </span>
          <div className="mt-1.5 font-mono text-base sm:text-lg font-bold text-slate-100">
            {weather.current.precipitation} mm
          </div>
          <span className="text-[10px] text-emerald-400 font-medium">✓ Normal Range</span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-3.5">
          <span className="text-[11px] text-slate-400 font-semibold block">
            {language === "hi" ? "तापमान" : "Ambient Temperature"}
          </span>
          <div className="mt-1.5 font-mono text-base sm:text-lg font-bold text-slate-100">
            {weather.current.temperature}°C
          </div>
          <span className="text-[10px] text-emerald-400 font-medium">✓ Below Heat Threshold</span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-3.5">
          <span className="text-[11px] text-slate-400 font-semibold block">
            {language === "hi" ? "पवन गति" : "Wind Speed"}
          </span>
          <div className="mt-1.5 font-mono text-base sm:text-lg font-bold text-slate-100">
            {weather.current.windSpeed} km/h
          </div>
          <span className="text-[10px] text-emerald-400 font-medium">✓ Below Drift Limit</span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-3.5">
          <span className="text-[11px] text-slate-400 font-semibold block">
            {language === "hi" ? "डब्ल्यूएमओ कोड" : "WMO Code"}
          </span>
          <div className="mt-1.5 font-mono text-base sm:text-lg font-bold text-slate-100">
            #{weather.current.weatherCode}
          </div>
          <span className="text-[10px] text-emerald-400 font-medium">✓ No Storm Code</span>
        </div>
      </div>

      {/* Card Footer */}
      <div className="relative z-10 border-t border-slate-800/80 pt-3 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-slate-500" />
          <span>
            {language === "hi" ? "मूल्यांकन समय" : "Evaluated"}: {updatedTime} IST
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-cyan-400">
          <Database className="h-3.5 w-3.5" />
          <span>Source: Open-Meteo Forecast API (Derived Baseline)</span>
        </div>
      </div>
    </div>
  );
};

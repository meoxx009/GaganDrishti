"use client";

import React, { useEffect } from "react";
import {
  X,
  TrendingUp,
  Thermometer,
  CloudRain,
  Calendar,
  Info,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  Droplets,
  Layers,
  Sparkles,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { ClimateTrendReport } from "@/lib/climate/climateService";

export type ClimateCardKey = "temp_trajectory" | "precip_climatology" | "anomalies";

interface ClimateFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardKey: ClimateCardKey | null;
  report: ClimateTrendReport | null;
}

export const ClimateFeatureModal: React.FC<ClimateFeatureModalProps> = ({
  isOpen,
  onClose,
  cardKey,
  report,
}) => {
  const { language, city } = useApp();

  // Handle ESC key and scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !cardKey) return null;

  const cityName =
    language === "mr" ? city.nameMr || city.nameHi : language === "hi" ? city.nameHi : city.nameEn;
  const stateName =
    language === "mr" ? city.stateMr || city.stateHi : language === "hi" ? city.stateHi : city.stateEn;

  const year = report?.yearAnalyzed || 2024;
  const annualTemp = report?.annualMeanTemp ?? 25.0;
  const annualPrecip = report?.annualTotalPrecip ?? 850;
  const tempAnomaly = report?.tempAnomaly ?? 0.0;
  const precipAnomalyPercent = report?.precipAnomalyPercent ?? 0;
  const monsoonPrecip = report?.monsoonTotalPrecip ?? 650;
  const monsoonPercent = report?.monsoonContributionPercent ?? 75;
  const heatwaveDays = report?.heatwaveDays ?? 0;
  const heavyRainDays = report?.heavyRainDays ?? 0;
  const monthly = report?.monthly || [];

  // Monthly stats calculations
  const maxRainfallInMonth = Math.max(...monthly.map((m) => m.totalPrecip), 1);
  const warmestMonth = monthly.reduce(
    (max, m) => (m.avgTemp > (max?.avgTemp ?? -99) ? m : max),
    monthly[0]
  );
  const coolestMonth = monthly.reduce(
    (min, m) => (m.avgTemp < (min?.avgTemp ?? 99) ? m : min),
    monthly[0]
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080E14] p-5 sm:p-7 shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shrink-0">
              {cardKey === "temp_trajectory" ? (
                <Thermometer className="h-5 w-5" />
              ) : cardKey === "precip_climatology" ? (
                <CloudRain className="h-5 w-5" />
              ) : (
                <TrendingUp className="h-5 w-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  {cardKey === "temp_trajectory"
                    ? language === "hi"
                      ? "10-वर्षीय तापमान प्रवृत्ति (Temperature Trajectory)"
                      : language === "mr"
                      ? "१०-वर्षीय तापमान कल (Temperature Trajectory)"
                      : "10-Year Temperature Trajectory"
                    : cardKey === "precip_climatology"
                    ? language === "hi"
                      ? "वर्षा जलवायु विज्ञान (Precipitation Climatology)"
                      : language === "mr"
                      ? "पाऊस हवामानशास्त्र (Precipitation Climatology)"
                      : "Precipitation Climatology"
                    : language === "hi"
                    ? "जलवायु विसंगतियां (Climatological Anomalies)"
                    : language === "mr"
                    ? "हवामान विसंगती (Climatological Anomalies)"
                    : "Climatological Anomalies"}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-[#7F91A3]">
                {cityName}, {stateName} • {year} ERA5 Reanalysis (0.25° grid)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body based on Card Key */}
        {cardKey === "temp_trajectory" && (
          <div className="space-y-4">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-purple-50/50 dark:bg-[#0B1219] border border-purple-200/50 dark:border-purple-500/20">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  {language === "hi" ? "वार्षिक औसत" : "Annual Mean"}
                </span>
                <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {annualTemp}°C
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-purple-50/50 dark:bg-[#0B1219] border border-purple-200/50 dark:border-purple-500/20">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  {language === "hi" ? "सर्वाधिक गर्म माह" : "Warmest Month"}
                </span>
                <span className="text-lg font-extrabold text-rose-500">
                  {warmestMonth
                    ? language === "hi"
                      ? warmestMonth.monthNameHi
                      : warmestMonth.monthNameEn
                    : "--"}{" "}
                  ({warmestMonth?.avgTemp ?? "--"}°C)
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-purple-50/50 dark:bg-[#0B1219] border border-purple-200/50 dark:border-purple-500/20">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  {language === "hi" ? "सर्वाधिक ठंडा माह" : "Coolest Month"}
                </span>
                <span className="text-lg font-extrabold text-sky-500">
                  {coolestMonth
                    ? language === "hi"
                      ? coolestMonth.monthNameHi
                      : coolestMonth.monthNameEn
                    : "--"}{" "}
                  ({coolestMonth?.avgTemp ?? "--"}°C)
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-purple-50/50 dark:bg-[#0B1219] border border-purple-200/50 dark:border-purple-500/20">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  {language === "hi" ? "उष्ण दिन (≥40°C)" : "Heat Days (≥40°C)"}
                </span>
                <span className="text-lg font-extrabold text-amber-500">
                  {heatwaveDays} {language === "hi" ? "दिन" : "days"}
                </span>
              </div>
            </div>

            {/* Trajectory Breakdown Narrative */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B1219] border border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>
                  {language === "hi"
                    ? "दीर्घकालिक तापीय अवलोकन (Decadal Trajectory)"
                    : "10-Year Decadal Thermal Pattern Analysis"}
                </span>
              </h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {language === "hi"
                  ? `${cityName} क्षेत्र में पिछले दशक के ERA5 डेटा के अनुसार ग्रीष्मकालीन अधिकतम तापमान मई और जून में केंद्रित रहता है। वार्षिक औसत तापमान मानक आधाररेखा (1991-2020) की तुलना में ${
                      tempAnomaly >= 0 ? `+${tempAnomaly}°C अधिक` : `${tempAnomaly}°C कम`
                    } दर्ज किया गया है।`
                  : `Across the last decade for ${cityName}, atmospheric reanalysis identifies concentrated summer heating peaks in May-June followed by monsoon cooling. The annual mean temperature demonstrates a departure of ${
                      tempAnomaly >= 0 ? `+${tempAnomaly}°C above` : `${tempAnomaly}°C below`
                    } the 1991–2020 climatological normal.`}
              </p>
            </div>

            {/* Monthly Trend Mini-bars */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                {language === "hi" ? "मासिक तापमान प्रोफाइल" : "Monthly Mean Temperatures"}
              </span>
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 text-center font-mono">
                {monthly.map((m) => (
                  <div
                    key={m.monthIndex}
                    className="p-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#0B1219]"
                  >
                    <span className="text-[10px] text-slate-400 block">{m.monthNameEn}</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {m.avgTemp}°
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {cardKey === "precip_climatology" && (
          <div className="space-y-4">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-sky-50/50 dark:bg-[#0B1219] border border-sky-200/50 dark:border-sky-500/20">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  {language === "hi" ? "कुल वार्षिक वर्षा" : "Total Rainfall"}
                </span>
                <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {annualPrecip} mm
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-sky-50/50 dark:bg-[#0B1219] border border-sky-200/50 dark:border-sky-500/20">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  {language === "hi" ? "मानसून योगदान" : "Monsoon Share"}
                </span>
                <span className="text-lg font-extrabold text-emerald-500">
                  {monsoonPercent}%
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-sky-50/50 dark:bg-[#0B1219] border border-sky-200/50 dark:border-sky-500/20">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  {language === "hi" ? "मानसूनी वर्षा (Jun-Sep)" : "Monsoon Sum"}
                </span>
                <span className="text-lg font-extrabold text-sky-500">
                  {monsoonPrecip} mm
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-sky-50/50 dark:bg-[#0B1219] border border-sky-200/50 dark:border-sky-500/20">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  {language === "hi" ? "भारी वर्षा दिन (>25mm)" : "Heavy Rain Days"}
                </span>
                <span className="text-lg font-extrabold text-indigo-500">
                  {heavyRainDays} {language === "hi" ? "दिन" : "days"}
                </span>
              </div>
            </div>

            {/* Precipitation Dynamics Explanation */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B1219] border border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
                <CloudRain className="h-3.5 w-3.5" />
                <span>
                  {language === "hi"
                    ? "मौसमी वर्षा वितरण व कृषि महत्व"
                    : "Seasonal Precipitation Distribution & Agro-Hydrology"}
                </span>
              </h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {language === "hi"
                  ? `वार्षिक कुल वर्षा का ${monsoonPercent}% भाग दक्षिण-पश्चिम मानसून (जून से सितंबर) के दौरान प्राप्त होता है। यह खरीफ बुवाई और भूजल पुनर्भरण की रीढ़ है। शेष वर्षा पश्चिमी विक्षोभ और लौटते मानसून से प्राप्त होती है।`
                  : `${monsoonPercent}% of the annual precipitation budget is concentrated strictly within the Southwest Monsoon window (June to September). This seasonal distribution is vital for rainfed Kharif crop establishment and groundwater replenishment across ${cityName}.`}
              </p>
            </div>

            {/* Monthly Precipitation Bars */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                {language === "hi" ? "मासिक वर्षा संचय (मिमी)" : "Monthly Precipitation Accumulation (mm)"}
              </span>
              <div className="space-y-1.5">
                {monthly.map((m) => {
                  const barWidth = Math.min(100, Math.round((m.totalPrecip / maxRainfallInMonth) * 100));
                  return (
                    <div key={m.monthIndex} className="flex items-center gap-2 text-xs">
                      <span className="w-8 font-mono text-slate-400 text-[11px]">{m.monthNameEn}</span>
                      <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-sky-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                      <span className="w-14 text-right font-mono font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                        {m.totalPrecip} mm
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {cardKey === "anomalies" && (
          <div className="space-y-4">
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-[#0B1219] border border-amber-200/50 dark:border-amber-500/20">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  {language === "hi" ? "तापीय विसंगति (Temp Anomaly)" : "Thermal Departure"}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {tempAnomaly >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-rose-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-sky-500" />
                  )}
                  <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {tempAnomaly >= 0 ? `+${tempAnomaly}` : tempAnomaly}°C
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  {tempAnomaly >= 0.5
                    ? language === "hi"
                      ? "सामान्य से अधिक (Above Normal)"
                      : "Above Normal"
                    : tempAnomaly <= -0.5
                    ? language === "hi"
                      ? "सामान्य से कम (Below Normal)"
                      : "Below Normal"
                    : language === "hi"
                    ? "सामान्य के निकट (Near Normal)"
                    : "Near Normal"}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-sky-50/50 dark:bg-[#0B1219] border border-sky-200/50 dark:border-sky-500/20">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  {language === "hi" ? "वर्षा विसंगति (Precip Anomaly)" : "Rainfall Departure"}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {precipAnomalyPercent >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-rose-500" />
                  )}
                  <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {precipAnomalyPercent >= 0 ? `+${precipAnomalyPercent}` : precipAnomalyPercent}%
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  {precipAnomalyPercent >= 10
                    ? language === "hi"
                      ? "अधिशेष वर्षा (Above Normal)"
                      : "Excess Rainfall"
                    : precipAnomalyPercent <= -10
                    ? language === "hi"
                      ? "कमी (Below Normal)"
                      : "Deficit Rainfall"
                    : language === "hi"
                    ? "सामान्य स्तर (Near Normal)"
                    : "Near Normal"}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0B1219] border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  {language === "hi" ? "आधाररेखा संदर्भ" : "Baseline Reference"}
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white block mt-1">
                  1991–2020 Normal
                </span>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  WMO 30-year climatological normal standard
                </span>
              </div>
            </div>

            {/* Plain-language explanation */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B1219] border border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5" />
                <span>
                  {language === "hi"
                    ? "विसंगतियों का सरल अर्थ"
                    : "Plain-Language Interpretation for Citizens"}
                </span>
              </h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {language === "hi"
                  ? `जलवायु विसंगति का अर्थ है कि चयनित वर्ष का मौसम 30-वर्षीय मानक औसत (1991-2020) से कितना भिन्न था। तापमान में ${
                      Math.abs(tempAnomaly)
                    }°C का अंतर और वर्षा में ${Math.abs(precipAnomalyPercent)}% का अंतर दर्ज किया गया। यह डेटा विशुद्ध रूप से संख्यात्मक है और बिना वैज्ञानिक प्रमाण के कोई काल्पनिक दावा नहीं करता।`
                  : `A climate anomaly measures how much weather in the selected year deviated from the recognized 30-year climatological normal (1991–2020). The observed departure is ${
                      Math.abs(tempAnomaly)
                    }°C in thermal mean and ${Math.abs(precipAnomalyPercent)}% in annual rainfall. GaganDrishti presents direct numerical deviations without speculative claims.`}
              </p>
            </div>
          </div>
        )}

        {/* Footer Attribution */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Copernicus ERA5 Atmospheric Reanalysis via Open-Meteo Archive</span>
          </div>
          <span className="font-mono text-[10.5px]">30-Yr Climatology Normal</span>
        </div>
      </div>
    </div>
  );
};

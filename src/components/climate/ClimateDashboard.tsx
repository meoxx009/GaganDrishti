"use client";

import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  Thermometer,
  CloudRain,
  Flame,
  Calendar,
  Layers,
  RefreshCw,
  Info,
  ShieldCheck,
  Compass,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Sun,
  Activity,
  Droplets,
  ExternalLink,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { fetchClimateTrends, ClimateTrendReport } from "@/lib/climate/climateService";
import { ClimateFeatureModal, ClimateCardKey } from "./ClimateFeatureModal";

const AVAILABLE_YEARS = [2024, 2023, 2022, 2020, 2015];

export const ClimateDashboard: React.FC = () => {
  const { city, language } = useApp();
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [report, setReport] = useState<ClimateTrendReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeModalCard, setActiveModalCard] = useState<ClimateCardKey | null>(null);

  const cityName =
    language === "mr" ? city.nameMr || city.nameHi : language === "hi" ? city.nameHi : city.nameEn;
  const stateName =
    language === "mr" ? city.stateMr || city.stateHi : language === "hi" ? city.stateHi : city.stateEn;

  const loadClimateData = async (yr: number) => {
    setLoading(true);
    try {
      const data = await fetchClimateTrends(city.lat, city.lon, yr);
      setReport(data);
    } catch {
      // handled by service fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClimateData(selectedYear);
  }, [city.lat, city.lon, selectedYear]);

  const monthly = report?.monthly || [];
  const maxRainfallInMonth = Math.max(...monthly.map((m) => m.totalPrecip), 1);

  const warmestMonth = monthly.reduce(
    (max, m) => (m.avgTemp > (max?.avgTemp ?? -99) ? m : max),
    monthly[0]
  );
  const coolestMonth = monthly.reduce(
    (min, m) => (m.avgTemp < (min?.avgTemp ?? 99) ? m : min),
    monthly[0]
  );

  const summary = report
    ? language === "hi"
      ? report.decadalTrendSummaryHi
      : language === "mr"
      ? report.decadalTrendSummaryMr
      : report.decadalTrendSummaryEn
    : "";

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Year Selector */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800/50 bg-white dark:bg-[#080E14] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl border border-purple-200 dark:border-purple-500/30 bg-purple-50 dark:bg-[#120D1E] text-purple-600 dark:text-purple-400">
              <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
                  {language === "hi"
                    ? "जलवायु एवं ऐतिहासिक प्रवृत्तियां"
                    : language === "mr"
                    ? "हवामान आणि ऐतिहासिक कल"
                    : "Climate & Decadal Trends"}
                </h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-500/30 bg-purple-50 dark:bg-[#140D1E] text-purple-700 dark:text-purple-300">
                  {cityName}
                </span>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  ERA5 0.25° (~25km)
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-[#7F91A3]">
                {language === "hi"
                  ? "ईसीएमडब्ल्यूएफ ईआरए5 ऐतिहासिक पुनर्विश्लेषण: 1991-2020 मानक आधाररेखा की तुलना में वार्षिक तापमान, वर्षा और विसंगतियों का विस्तृत अवलोकन।"
                  : language === "mr"
                  ? "ECMWF ERA5 ऐतिहासिक पुनर्विश्लेषण: १९९१-२०२० आधाररेषेच्या तुलनेत वार्षिक तापमान, पाऊस व विसंगतींचे सविस्तर विश्लेषण."
                  : "Copernicus ERA5 atmospheric reanalysis benchmarking temperatures, monsoon distribution, and thermal anomalies against the 1991–2020 normal."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Year Selector */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-[#060C12]">
              {AVAILABLE_YEARS.map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setSelectedYear(yr)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    selectedYear === yr
                      ? "bg-white text-slate-900 shadow-xs border border-slate-200/80 dark:border-transparent dark:bg-purple-600 dark:text-white"
                      : "text-slate-600 dark:text-[#7F91A3] hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>

            <button
              onClick={() => loadClimateData(selectedYear)}
              disabled={loading}
              type="button"
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1219] px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#0E1821] transition-all disabled:opacity-50"
              title="Reload Climate Data"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-purple-500 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. SECTION 1: OVERVIEW (Key Metrics at a Glance) */}
      <div>
        <div className="flex items-center justify-between px-1 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {language === "hi"
              ? "1. मुख्य जलवायु अवलोकन (Overview)"
              : "1. Climate Overview at a Glance"}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {selectedYear} • {cityName}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Overview 1: Annual Mean Temp */}
          <div
            onClick={() => setActiveModalCard("temp_trajectory")}
            className="group rounded-3xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#080E14] p-5 space-y-2 shadow-xs hover:border-purple-400 dark:hover:border-purple-500/40 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {language === "hi" ? "वार्षिक औसत तापमान" : "Annual Mean Temp"}
              </span>
              <Thermometer className="h-4 w-4 text-rose-500 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {report?.annualMeanTemp ?? "--"}°C
              </span>
              {report && (
                <span
                  className={`text-xs font-bold flex items-center ${
                    report.tempAnomaly >= 0 ? "text-rose-500" : "text-sky-500"
                  }`}
                >
                  {report.tempAnomaly >= 0 ? (
                    <ArrowUpRight className="h-3.5 w-3.5 inline" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5 inline" />
                  )}
                  {Math.abs(report.tempAnomaly)}°C
                </span>
              )}
            </div>
            <div className="flex items-center justify-between pt-1">
              <p className="text-[11px] text-slate-500 dark:text-[#7F91A3]">
                {language === "hi" ? "1991-2020 मानक तुलना" : "vs 1991–2020 baseline"}
              </p>
              <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 group-hover:underline">
                {language === "hi" ? "विवरण देखें →" : "View Details →"}
              </span>
            </div>
          </div>

          {/* Overview 2: Total Rainfall */}
          <div
            onClick={() => setActiveModalCard("precip_climatology")}
            className="group rounded-3xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#080E14] p-5 space-y-2 shadow-xs hover:border-sky-400 dark:hover:border-sky-500/40 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {language === "hi" ? "कुल वार्षिक वर्षा" : "Total Precipitation"}
              </span>
              <CloudRain className="h-4 w-4 text-sky-500 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {report?.annualTotalPrecip ?? "--"}
              </span>
              <span className="text-sm font-semibold text-slate-500">mm</span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <p className="text-[11px] text-slate-500 dark:text-[#7F91A3]">
                {language === "hi"
                  ? `${report?.heavyRainDays ?? 0} भारी वर्षा दिन (>25mm)`
                  : `${report?.heavyRainDays ?? 0} heavy rain days (>25mm)`}
              </p>
              <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 group-hover:underline">
                {language === "hi" ? "विवरण देखें →" : "View Details →"}
              </span>
            </div>
          </div>

          {/* Overview 3: Heat-stress Days */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#080E14] p-5 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {language === "hi" ? "उष्ण दिन (≥40°C)" : "Heat-Stress Days (≥40°C)"}
              </span>
              <Flame className="h-4 w-4 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {report?.heatwaveDays ?? "--"}
              </span>
              <span className="text-sm font-semibold text-slate-500">
                {language === "hi" ? "दिन" : "days"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-[#7F91A3]">
              {language === "hi" ? "ERA5 संख्यात्मक सीमा आधारित" : "ERA5 thermal threshold (not IMD warning)"}
            </p>
          </div>

          {/* Overview 4: Monsoon Concentration */}
          <div
            onClick={() => setActiveModalCard("precip_climatology")}
            className="group rounded-3xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#080E14] p-5 space-y-2 shadow-xs hover:border-emerald-400 dark:hover:border-emerald-500/40 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {language === "hi" ? "मानसून का योगदान" : "Monsoon Share (Jun-Sep)"}
              </span>
              <BarChart3 className="h-4 w-4 text-emerald-500 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {report?.monsoonContributionPercent ?? "--"}%
              </span>
              <span className="text-xs text-slate-500">
                ({report?.monsoonTotalPrecip ?? 0} mm)
              </span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <p className="text-[11px] text-slate-500 dark:text-[#7F91A3]">
                {language === "hi" ? "खरीफ कृषि जल सुरक्षा" : "Core Kharif water budget"}
              </p>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 group-hover:underline">
                {language === "hi" ? "विवरण देखें →" : "View Details →"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SECTION 2 & 3: TEMPERATURE & RAINFALL DETAILS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION 2: Temperature Category */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#080E14] p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3">
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-rose-500" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                {language === "hi" ? "2. तापमान विश्लेषण (Temperature)" : "2. Temperature Profile"}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setActiveModalCard("temp_trajectory")}
              className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-1"
            >
              <span>{language === "hi" ? "10-वर्षीय प्रवृत्ति" : "10-Yr Trajectory"}</span>
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0B1219] border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">
                {language === "hi" ? "सर्वाधिक गर्म माह" : "Warmest Month"}
              </span>
              <span className="text-sm font-bold text-rose-500 block mt-0.5">
                {warmestMonth
                  ? language === "hi"
                    ? warmestMonth.monthNameHi
                    : warmestMonth.monthNameEn
                  : "--"}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {warmestMonth?.avgTemp ?? "--"}°C avg ({warmestMonth?.maxTemp ?? "--"}°C max)
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0B1219] border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">
                {language === "hi" ? "सर्वाधिक ठंडा माह" : "Coolest Month"}
              </span>
              <span className="text-sm font-bold text-sky-500 block mt-0.5">
                {coolestMonth
                  ? language === "hi"
                    ? coolestMonth.monthNameHi
                    : coolestMonth.monthNameEn
                  : "--"}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {coolestMonth?.avgTemp ?? "--"}°C avg ({coolestMonth?.minTemp ?? "--"}°C min)
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0B1219] border border-slate-100 dark:border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">
                {language === "hi" ? "मानक आधाररेखा अंतर" : "vs Baseline"}
              </span>
              <span
                className={`text-sm font-bold block mt-0.5 ${
                  (report?.tempAnomaly ?? 0) >= 0 ? "text-rose-500" : "text-sky-500"
                }`}
              >
                {(report?.tempAnomaly ?? 0) >= 0
                  ? `+${report?.tempAnomaly}`
                  : report?.tempAnomaly}
                °C
              </span>
              <span className="text-[11px] text-slate-500">
                1991–2020 ERA5 normal
              </span>
            </div>
          </div>

          {/* Plain Language Interpretation */}
          <div className="text-xs text-slate-600 dark:text-slate-300 bg-purple-50/40 dark:bg-[#0E0B19] p-3 rounded-2xl border border-purple-200/40 dark:border-purple-500/20 leading-relaxed">
            {language === "hi"
              ? `वर्ष ${selectedYear} में वार्षिक औसत तापमान ${report?.annualMeanTemp}°C रहा। सबसे गर्म महीना ${
                  warmestMonth ? warmestMonth.monthNameHi : "मई"
                } रहा, जबकि सबसे ठंडा महीना ${
                  coolestMonth ? coolestMonth.monthNameHi : "जनवरी"
                } दर्ज हुआ।`
              : `Annual mean thermal state in ${selectedYear} stood at ${report?.annualMeanTemp}°C. Peak seasonal heating occurred in ${
                  warmestMonth?.monthNameEn ?? "May"
                }, while minimum winter conditions were observed in ${
                  coolestMonth?.monthNameEn ?? "January"
                }.`}
          </div>
        </div>

        {/* SECTION 3: Rainfall & Precipitation Category */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#080E14] p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3">
            <div className="flex items-center gap-2">
              <CloudRain className="h-4 w-4 text-sky-500" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                {language === "hi"
                  ? "3. वर्षा एवं वर्षण (Rainfall & Precipitation)"
                  : "3. Rainfall & Precipitation"}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setActiveModalCard("precip_climatology")}
              className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline inline-flex items-center gap-1"
            >
              <span>{language === "hi" ? "जलवायु विज्ञान" : "Climatology"}</span>
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0B1219] border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">
                {language === "hi" ? "कुल वर्षा" : "Total Rainfall"}
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white block mt-0.5">
                {report?.annualTotalPrecip} mm
              </span>
              <span className="text-[11px] text-slate-500">
                12-month accumulation
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0B1219] border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">
                {language === "hi" ? "वर्षा वाले दिन (≥1mm)" : "Rainy Days"}
              </span>
              <span className="text-sm font-bold text-sky-500 block mt-0.5">
                {monthly.reduce((s, m) => s + m.rainyDays, 0)} {language === "hi" ? "दिन" : "days"}
              </span>
              <span className="text-[11px] text-slate-500">
                Across full year
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0B1219] border border-slate-100 dark:border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">
                {language === "hi" ? "भारी वर्षा दिन (≥25mm)" : "Heavy Rain Days"}
              </span>
              <span className="text-sm font-bold text-indigo-500 block mt-0.5">
                {report?.heavyRainDays} {language === "hi" ? "दिन" : "days"}
              </span>
              <span className="text-[11px] text-slate-500">
                Daily sum ≥ 25mm
              </span>
            </div>
          </div>

          {/* Plain Language Interpretation */}
          <div className="text-xs text-slate-600 dark:text-slate-300 bg-sky-50/40 dark:bg-[#0B141F] p-3 rounded-2xl border border-sky-200/40 dark:border-sky-500/20 leading-relaxed">
            {language === "hi"
              ? `कुल वार्षिक वर्षा ${report?.annualTotalPrecip}mm रही। मानसूनी महीनों (जून-सितंबर) का हिस्सा ${report?.monsoonContributionPercent}% (${report?.monsoonTotalPrecip}mm) रहा।`
              : `Total annual precipitation reached ${report?.annualTotalPrecip}mm, with the Southwest Monsoon accounting for ${report?.monsoonContributionPercent}% (${report?.monsoonTotalPrecip}mm).`}
          </div>
        </div>
      </div>

      {/* 4. SECTION 4 & 5: HEAT STRESS & MONSOON SEASONALITY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION 4: Heat & Thermal Stress */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#080E14] p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/60 pb-3">
            <Flame className="h-4 w-4 text-amber-500" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
              {language === "hi"
                ? "4. ताप एवं तापीय तनाव (Heat & Thermal Stress)"
                : "4. Heat & Thermal Stress"}
            </h3>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-amber-50/40 dark:bg-[#120D08] border border-amber-200/50 dark:border-amber-500/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
                  {language === "hi" ? "40°C से अधिक अधिकतम तापमान वाले दिन" : "Days with Max Temperature ≥ 40°C"}
                </span>
                <span className="text-base font-extrabold text-amber-600 dark:text-amber-400">
                  {report?.heatwaveDays} {language === "hi" ? "दिन" : "days"}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                {language === "hi"
                  ? "ईसीएमडब्ल्यूएफ ईआरए5 पुनःविश्लेषण दैनिक अधिकतम तापमान से निकाला गया संकेतक। यह आईएमडी की आधिकारिक 'हीटवेव चेतावनी' नहीं है।"
                  : "Derived deterministically from ERA5 daily maximum temperatures. Not an official IMD heatwave alert bulletin."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0B1219] border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">
                  {language === "hi" ? "उच्चतम तापीय माह" : "Peak Thermal Period"}
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 block">
                  {warmestMonth ? warmestMonth.monthNameEn : "May-Jun"}
                </span>
                <span className="text-[10px] text-slate-500">
                  Max monthly avg {warmestMonth?.avgTemp}°C
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0B1219] border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">
                  {language === "hi" ? "तापीय प्रभाव" : "Human Thermal Stress"}
                </span>
                <span className="text-sm font-bold text-amber-500 mt-0.5 block">
                  {(report?.heatwaveDays ?? 0) > 20 ? "Elevated" : "Seasonal"}
                </span>
                <span className="text-[10px] text-slate-500">
                  Pre-monsoon dry heat exposure
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5: Monsoon & Seasonality */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#080E14] p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/60 pb-3">
            <BarChart3 className="h-4 w-4 text-emerald-500" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
              {language === "hi"
                ? "5. मानसून एवं मौसमी एकाग्रता (Monsoon & Seasonality)"
                : "5. Monsoon & Seasonality"}
            </h3>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-emerald-50/40 dark:bg-[#08120B] border border-emerald-200/50 dark:border-emerald-500/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                  {language === "hi" ? "जून से सितंबर कुल वर्षा संचय" : "June–September Rainfall Volume"}
                </span>
                <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                  {report?.monsoonTotalPrecip} mm ({report?.monsoonContributionPercent}%)
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                {language === "hi"
                  ? "खरीफ फसलों (सोयाबीन, धान, मक्का आदि) की जल आवश्यकता इसी 4-माह की संचयी वर्षा पर आधारित होती है।"
                  : "Kharif season cropping (Soybean, Paddy, Maize) relies directly on this 4-month concentrated monsoon window."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0B1219] border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">
                  {language === "hi" ? "गैर-मानसूनी वर्षा" : "Post/Pre-Monsoon"}
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 block">
                  {Math.max(0, (report?.annualTotalPrecip ?? 0) - (report?.monsoonTotalPrecip ?? 0))} mm
                </span>
                <span className="text-[10px] text-slate-500">
                  Oct-May winter/summer rain
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0B1219] border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">
                  {language === "hi" ? "मौसमी एकाग्रता" : "Concentration"}
                </span>
                <span className="text-sm font-bold text-emerald-500 mt-0.5 block">
                  High ({(report?.monsoonContributionPercent ?? 0)}%)
                </span>
                <span className="text-[10px] text-slate-500">
                  Tropical monsoon regime
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. SECTION 6: CLIMATE ANOMALIES */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#080E14] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-purple-500" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
              {language === "hi"
                ? "6. जलवायु विसंगतियां (Climate Anomalies vs 1991–2020 Baseline)"
                : "6. Climate Anomalies vs 1991–2020 Baseline"}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setActiveModalCard("anomalies")}
            className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-1"
          >
            <span>{language === "hi" ? "विसंगति विश्लेषण" : "Anomaly Details"}</span>
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B1219] border border-slate-100 dark:border-slate-800 space-y-1">
            <span className="text-[11px] font-bold uppercase text-slate-400">
              {language === "hi" ? "तापमान विसंगति" : "Temperature Anomaly"}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {(report?.tempAnomaly ?? 0) >= 0 ? `+${report?.tempAnomaly}` : report?.tempAnomaly}°C
              </span>
              <span
                className={`text-xs font-semibold ${
                  (report?.tempAnomaly ?? 0) >= 0.5
                    ? "text-rose-500"
                    : (report?.tempAnomaly ?? 0) <= -0.5
                    ? "text-sky-500"
                    : "text-emerald-500"
                }`}
              >
                {(report?.tempAnomaly ?? 0) >= 0.5
                  ? "Above Normal"
                  : (report?.tempAnomaly ?? 0) <= -0.5
                  ? "Below Normal"
                  : "Near Normal"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Actual: {report?.annualMeanTemp}°C vs Baseline ~25.0°C
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B1219] border border-slate-100 dark:border-slate-800 space-y-1">
            <span className="text-[11px] font-bold uppercase text-slate-400">
              {language === "hi" ? "वर्षा विसंगति प्रतिशत" : "Rainfall Departure"}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {(report?.precipAnomalyPercent ?? 0) >= 0 ? `+${report?.precipAnomalyPercent}` : report?.precipAnomalyPercent}%
              </span>
              <span
                className={`text-xs font-semibold ${
                  (report?.precipAnomalyPercent ?? 0) >= 10
                    ? "text-emerald-500"
                    : (report?.precipAnomalyPercent ?? 0) <= -10
                    ? "text-rose-500"
                    : "text-slate-500"
                }`}
              >
                {(report?.precipAnomalyPercent ?? 0) >= 10
                  ? "Excess"
                  : (report?.precipAnomalyPercent ?? 0) <= -10
                  ? "Deficit"
                  : "Near Normal"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Actual: {report?.annualTotalPrecip}mm vs Baseline ~850mm
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B1219] border border-slate-100 dark:border-slate-800 space-y-1">
            <span className="text-[11px] font-bold uppercase text-slate-400">
              {language === "hi" ? "मानक आधाररेखा अवधि" : "Reference Baseline"}
            </span>
            <span className="text-xl font-bold text-slate-900 dark:text-white block">
              1991–2020 WMO Normal
            </span>
            <p className="text-[11px] text-slate-500">
              Strictly preserved scientific reference without synthetic offsets
            </p>
          </div>
        </div>
      </div>

      {/* 6. SECTION 7: LONG-TERM DECADAL TRENDS */}
      {summary && (
        <div className="rounded-3xl border border-purple-200/60 dark:border-purple-500/20 bg-purple-50/40 dark:bg-[#0E0B19] p-5 sm:p-6 shadow-2xs">
          <div className="flex items-start gap-3.5">
            <Info className="h-5 w-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-800 dark:text-purple-300">
                {language === "hi"
                  ? `7. दीर्घकालिक प्रवृत्ति संश्लेषण (${selectedYear})`
                  : `7. Long-Term Decadal Trend Synthesis (${selectedYear})`}
              </span>
              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                {summary}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 7. Month-by-Month Climatological Profile Grid */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#080E14] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-500" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">
              {language === "hi"
                ? `${selectedYear} मासिक तापमान एवं वर्षा विवरण`
                : `${selectedYear} Monthly Temperature & Rainfall Profile`}
            </h3>
          </div>
          <span className="text-xs text-slate-500 hidden sm:inline">
            {cityName} ({city.lat.toFixed(3)}°N, {city.lon.toFixed(3)}°E)
          </span>
        </div>

        {loading ? (
          <div className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-900/60 animate-pulse" />
        ) : report ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {report.monthly.map((m) => {
              const rainBarWidth = Math.min(
                100,
                Math.round((m.totalPrecip / maxRainfallInMonth) * 100)
              );
              const mName =
                language === "hi"
                  ? m.monthNameHi
                  : language === "mr"
                  ? m.monthNameMr
                  : m.monthNameEn;

              return (
                <div
                  key={m.monthIndex}
                  className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-[#0B1219] p-3.5 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                      {mName}
                    </span>
                    <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                      {m.avgTemp}°C
                    </span>
                  </div>

                  {/* Temperature Span */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>Range:</span>
                    <span className="font-mono">
                      {m.minTemp}°C min — {m.maxTemp}°C peak
                    </span>
                  </div>

                  {/* Rainfall visual bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <CloudRain className="h-3 w-3 text-sky-500" />
                        {m.totalPrecip} mm
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 text-[10px]">
                        {m.rainyDays} {language === "hi" ? "वर्षा दिन" : "rain days"}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-sky-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${rainBarWidth}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* 8. SECTION 8: DATA PROVENANCE & METHODOLOGY */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#060C12] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 dark:text-[#7F91A3]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
          <span>
            {language === "hi"
              ? "8. डेटा स्रोत एवं कार्यप्रणाली: कॉपरनिकस क्लाइमेट चेंज सर्विस (C3S) ERA5 वायुमंडलीय पुनर्विश्लेषण (0.25° ग्रिड ~25km), 1991-2020 विश्व मौसम विज्ञान संगठन (WMO) आधाररेखा।"
              : "8. Data & Methodology: Copernicus Climate Change Service (C3S) ERA5 Reanalysis (0.25° grid ~25km), WMO 1991–2020 baseline reference via Open-Meteo Archive."}
          </span>
        </div>
        <span className="font-mono text-[11px] shrink-0 text-slate-500">
          Location: {city.lat.toFixed(4)}°N, {city.lon.toFixed(4)}°E
        </span>
      </div>

      {/* Interactive Detail Modal / Bottom-Sheet */}
      <ClimateFeatureModal
        isOpen={activeModalCard !== null}
        onClose={() => setActiveModalCard(null)}
        cardKey={activeModalCard}
        report={report}
      />
    </div>
  );
};

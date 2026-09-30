"use client";

import React, { useEffect, useState } from "react";
import {
  Cpu,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  RefreshCw,
  Layers,
  Wind,
  CloudRain,
  Thermometer,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { fetchNWPComparison, NWPComparisonResult } from "@/lib/weather/nwpService";

export const ForecastModelPanel: React.FC = () => {
  const { city, language } = useApp();
  const [data, setData] = useState<NWPComparisonResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchNWPComparison(city.lat, city.lon);
      setData(res);
    } catch {
      // safe fallback already in service
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [city.lat, city.lon]);

  const agreementConfig = {
    HIGH: {
      badgeBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      icon: CheckCircle2,
      labelEn: "High Model Consensus",
      labelHi: "उच्च मॉडल सहमति",
      labelMr: "उच्च मॉडेल सहमती",
      subEn: "Low forecast uncertainty across NWP solutions",
      subHi: "संख्यात्मक पूर्वानुमानों में न्यूनतम अनिश्चितता",
      subMr: "संख्यात्मक हवामान अंदाजांमध्ये कमी अनिश्चितता",
    },
    MODERATE: {
      badgeBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
      icon: HelpCircle,
      labelEn: "Moderate Spread",
      labelHi: "मध्यम मॉडल भिन्नता",
      labelMr: "मध्यम मॉडेल फरक",
      subEn: "Minor spread between European and American runs",
      subHi: "ईसीएमडब्ल्यूएफ व जीएफएस में मामूली अंतर",
      subMr: "ECMWF आणि GFS मध्ये किरकोळ फरक",
    },
    DIVERGENT: {
      badgeBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
      icon: AlertTriangle,
      labelEn: "High Model Divergence",
      labelHi: "उच्च मॉडल मतभेद",
      labelMr: "उच्च मॉडेल तफावत",
      subEn: "Elevated forecast uncertainty — outdoor caution advised",
      subHi: "पूर्वानुमान में उच्च अनिश्चितता — सावधानी बरतें",
      subMr: "अंदाजात उच्च अनिश्चितता — खबरदारी बाळगा",
    },
  };

  const currentAgreement = data ? agreementConfig[data.agreementLevel] : agreementConfig.HIGH;
  const AgreementIcon = currentAgreement.icon;

  const explanation = data
    ? language === "hi"
      ? data.agreementExplanationHi
      : language === "mr"
      ? data.agreementExplanationMr
      : data.agreementExplanationEn
    : "";

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#080E14] overflow-hidden shadow-xs transition-all">
      {/* Header bar */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="cursor-pointer p-4 sm:p-5 flex items-center justify-between gap-3 select-none hover:bg-slate-50 dark:hover:bg-[#0B1219] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-500/20">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-[#F8FAFC]">
                {language === "hi"
                  ? "NWP मॉडल तुलना (ECMWF बनाम GFS)"
                  : language === "mr"
                  ? "NWP मॉडेल तुलना (ECMWF विरुद्ध GFS)"
                  : "NWP Multi-Model Comparison (ECMWF vs GFS)"}
              </h2>
              {data && (
                <span
                  className={`text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full border ${currentAgreement.badgeBg} flex items-center gap-1`}
                >
                  <AgreementIcon className="h-3 w-3" />
                  <span>
                    {language === "hi"
                      ? currentAgreement.labelHi
                      : language === "mr"
                      ? currentAgreement.labelMr
                      : currentAgreement.labelEn}
                  </span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-[#7F91A3] mt-0.5">
              {language === "hi"
                ? "यूरोपीय (ECMWF IFS) एवं अमेरिकी (NOAA GFS) संख्यात्मक मौसम मॉडलों का सीधा संरेखण"
                : language === "mr"
                ? "युरोपियन (ECMWF) आणि अमेरिकन (NOAA GFS) संख्यात्मक मॉडेल्सची थेट तुलना"
                : "Parallel 24-hour evaluation from European ECMWF IFS and American NOAA GFS"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              loadData();
            }}
            disabled={loading}
            className="p-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            title="Refresh NWP models"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <div className="p-1 text-slate-400">
            {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 dark:border-slate-800/50 space-y-4">
          {/* Explanation Alert */}
          {data && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#060C12] p-3 sm:p-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <span className="font-semibold text-slate-900 dark:text-white">
                {language === "hi" ? "मॉडल विश्लेषण: " : language === "mr" ? "मॉडेल विश्लेषण: " : "Consensus Analysis: "}
              </span>
              {explanation}
            </div>
          )}

          {/* Side by side comparison cards */}
          {loading && !data ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
              <div className="h-36 rounded-2xl bg-slate-100 dark:bg-slate-900/60" />
              <div className="h-36 rounded-2xl bg-slate-100 dark:bg-slate-900/60" />
            </div>
          ) : data ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ECMWF Card */}
              <div className="rounded-2xl border border-sky-200/60 dark:border-sky-500/20 bg-sky-50/30 dark:bg-[#0B141E] p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-sky-300 text-sm sm:text-base">
                        {data.ecmwf.name}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400">
                        {data.ecmwf.resolution}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-[#7F91A3]">
                      {data.ecmwf.organization}
                    </p>
                  </div>
                  <Layers className="h-4 w-4 text-sky-500" />
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Thermometer className="h-3 w-3 text-rose-500" /> 24h Avg
                    </span>
                    <span className="text-sm font-bold text-slate-800 dark:text-white">
                      {data.ecmwf.tempNext24hAvg}°C
                    </span>
                    <div className="text-[10px] text-slate-500">
                      {data.ecmwf.tempMin}° / {data.ecmwf.tempMax}°
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <CloudRain className="h-3 w-3 text-sky-500" /> Rain 24h
                    </span>
                    <span className="text-sm font-bold text-slate-800 dark:text-white">
                      {data.ecmwf.precipTotal} mm
                    </span>
                    <div className="text-[10px] text-slate-500">
                      {data.ecmwf.precipTotal > 0 ? "Precip predicted" : "Dry spell"}
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Wind className="h-3 w-3 text-cyan-500" /> Max Gust
                    </span>
                    <span className="text-sm font-bold text-slate-800 dark:text-white">
                      {data.ecmwf.windMax} km/h
                    </span>
                    <div className="text-[10px] text-slate-500">10m wind</div>
                  </div>
                </div>
              </div>

              {/* GFS Card */}
              <div className="rounded-2xl border border-indigo-200/60 dark:border-indigo-500/20 bg-indigo-50/30 dark:bg-[#0E121E] p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-indigo-300 text-sm sm:text-base">
                        {data.gfs.name}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400">
                        {data.gfs.resolution}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-[#7F91A3]">
                      {data.gfs.organization}
                    </p>
                  </div>
                  <Layers className="h-4 w-4 text-indigo-500" />
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Thermometer className="h-3 w-3 text-rose-500" /> 24h Avg
                    </span>
                    <span className="text-sm font-bold text-slate-800 dark:text-white">
                      {data.gfs.tempNext24hAvg}°C
                    </span>
                    <div className="text-[10px] text-slate-500">
                      {data.gfs.tempMin}° / {data.gfs.tempMax}°
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <CloudRain className="h-3 w-3 text-sky-500" /> Rain 24h
                    </span>
                    <span className="text-sm font-bold text-slate-800 dark:text-white">
                      {data.gfs.precipTotal} mm
                    </span>
                    <div className="text-[10px] text-slate-500">
                      {data.gfs.precipTotal > 0 ? "Precip predicted" : "Dry spell"}
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Wind className="h-3 w-3 text-cyan-500" /> Max Gust
                    </span>
                    <span className="text-sm font-bold text-slate-800 dark:text-white">
                      {data.gfs.windMax} km/h
                    </span>
                    <div className="text-[10px] text-slate-500">10m wind</div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* Provenance footer */}
          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-[#7F91A3] pt-1">
            <span>
              {language === "hi"
                ? "डेटा स्रोत: ओपन-मेटियो मल्टी-मॉडल एपीआई (ECMWF एवं NOAA)"
                : "Source: Open-Meteo Multi-Model API (ECMWF IFS & NOAA GFS)"}
            </span>
            <span className="font-mono">
              Spread: ΔT {data?.tempDifference ?? 0}°C | ΔP {data?.precipDifference ?? 0}mm
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

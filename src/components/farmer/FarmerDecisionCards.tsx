"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  Droplets,
  Wind,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Info,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { FarmerDecisionResult, WeatherWindowStatus } from "@/lib/weather/farmerTypes";
import { EvidenceProvenanceDrawer, EvidenceDetails } from "@/components/common/EvidenceProvenanceDrawer";

interface FarmerDecisionCardsProps {
  decision: FarmerDecisionResult;
}

function getStatusBadge(status: WeatherWindowStatus, language: string) {
  switch (status) {
    case "GOOD WEATHER WINDOW":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>{language === "hi" ? "अनुकूल मौसम विंडो" : "GOOD WEATHER WINDOW"}</span>
        </span>
      );
    case "CAUTION":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-800 dark:text-amber-300">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>{language === "hi" ? "सतर्कता आवश्यक" : "CAUTION"}</span>
        </span>
      );
    case "AVOID DUE TO WEATHER":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-300 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-500/15 px-3 py-1 text-xs font-bold text-rose-800 dark:text-rose-300">
          <XCircle className="h-3.5 w-3.5" />
          <span>{language === "hi" ? "मौसम के कारण टालें" : "AVOID DUE TO WEATHER"}</span>
        </span>
      );
    case "INSUFFICIENT DATA":
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-300">
          <HelpCircle className="h-3.5 w-3.5" />
          <span>{language === "hi" ? "अपर्याप्त डेटा" : "INSUFFICIENT DATA"}</span>
        </span>
      );
  }
}

export const FarmerDecisionCards: React.FC<FarmerDecisionCardsProps> = ({
  decision,
}) => {
  const { language, city } = useApp();
  const [showProvenance, setShowProvenance] = useState(false);

  const cityName = language === "hi" ? city.nameHi : city.nameEn;
  const stateName = language === "hi" ? city.stateHi : city.stateEn;

  const considerList =
    language === "hi" ? decision.considerTodayHi : decision.considerTodayEn;
  const avoidList =
    language === "hi" ? decision.avoidTodayHi : decision.avoidTodayEn;

  const evidenceData: EvidenceDetails = {
    title: `Agro-Meteorological Advisory (${cityName})`,
    sourceName: "Open-Meteo Deterministic Agro Engine",
    locationName: `${cityName}, ${stateName}`,
    coordinates: `${city.lat.toFixed(4)}°N, ${city.lon.toFixed(4)}°E`,
    fetchedAt: new Date().toISOString(),
    rulesTriggered: [
      `Irrigation Advisory: ${decision.irrigationStatus}`,
      `Spray Window: ${decision.sprayStatus}`,
      `Rain threshold: ${decision.irrigationReasonEn}`,
      `Wind/Drift threshold: ${decision.sprayReasonEn}`,
    ],
    thresholds: [
      "Spray Window: Wind Speed < 14 km/h AND Rain Prob < 25%",
      "Irrigation Window: 24h Rain Accumulation < 5mm AND Humidity < 85%",
    ],
    modelsUsed: ["Open-Meteo Numerical Forecast", "ECMWF IFS (0.25°)", "NOAA GFS"],
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* CARD 1: What to consider today / आज क्या करें */}
      <div className="rounded-3xl border border-slate-200 dark:border-emerald-500/20 bg-white dark:bg-[#080E14] p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-[#0B1219] border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">
                  {language === "hi" ? "आज क्या करें" : "What to consider today"}
                </h3>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                  {language === "hi" ? "अनुकूल कृषि सुझाव" : "Favorable Field Actions"}
                </span>
              </div>
            </div>
            <span className="text-xs bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200 dark:border-emerald-500/20">
              {considerList.length} {language === "hi" ? "सुझाव" : "Points"}
            </span>
          </div>

          <div className="space-y-3">
            {considerList.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 rounded-2xl border border-slate-200 dark:border-slate-800/50 bg-[#F8FAFC] dark:bg-[#0B1219] p-3.5 text-xs sm:text-sm text-slate-700 dark:text-[#CBD5E1]"
              >
                <ArrowRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {decision.fieldHeatNoticeEn && (
          <div className="mt-4 rounded-xl bg-amber-50/70 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 p-2.5 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <Info className="h-4 w-4 shrink-0" />
            <span>
              {language === "hi"
                ? decision.fieldHeatNoticeHi
                : decision.fieldHeatNoticeEn}
            </span>
          </div>
        )}
      </div>

      {/* CARD 2: What to avoid / आज क्या टालें */}
      <div className="rounded-3xl border border-slate-200 dark:border-rose-500/20 bg-white dark:bg-[#080E14] p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 dark:bg-[#0B1219] border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400">
                <XCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">
                  {language === "hi" ? "आज क्या टालें" : "What to avoid"}
                </h3>
                <span className="text-[11px] text-rose-700 dark:text-rose-400 font-medium">
                  {language === "hi" ? "मौसम जोखिम कारक" : "Weather Risk Factors"}
                </span>
              </div>
            </div>
            <span className="text-xs bg-rose-50 dark:bg-rose-500/10 text-rose-800 dark:text-rose-400 px-2.5 py-0.5 rounded-full font-semibold border border-rose-200 dark:border-rose-500/20">
              {avoidList.length} {language === "hi" ? "सावधानियां" : "Precautions"}
            </span>
          </div>

          <div className="space-y-3">
            {avoidList.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 rounded-2xl border border-slate-200 dark:border-slate-800/50 bg-[#F8FAFC] dark:bg-[#0B1219] p-3.5 text-xs sm:text-sm text-slate-700 dark:text-[#CBD5E1]"
              >
                <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {decision.drainageNoticeEn && (
          <div className="mt-4 rounded-xl bg-blue-50/70 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 p-2.5 text-xs text-blue-800 dark:text-blue-300 flex items-center gap-2">
            <Info className="h-4 w-4 shrink-0" />
            <span>
              {language === "hi"
                ? decision.drainageNoticeHi
                : decision.drainageNoticeEn}
            </span>
          </div>
        )}
      </div>

      {/* CARD 3: Irrigation Weather Check / सिंचाई मौसम जाँच */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800/50 bg-white dark:bg-[#080E14] p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 dark:bg-[#0B1219] border border-cyan-200 dark:border-cyan-500/30 text-cyan-600 dark:text-cyan-400">
                <Droplets className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">
                  {language === "hi" ? "सिंचाई मौसम जाँच" : "Irrigation Weather Check"}
                </h3>
                <span className="text-[11px] text-cyan-700 dark:text-cyan-400 font-medium">
                  {language === "hi" ? "जल आवश्यकता एवं वर्षा संतुलन" : "Precipitation & Soil Moisture Support"}
                </span>
              </div>
            </div>

            {getStatusBadge(decision.irrigationStatus, language)}
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800/50 bg-[#F8FAFC] dark:bg-[#0B1219] p-4 text-xs sm:text-sm text-slate-700 dark:text-[#CBD5E1] leading-relaxed">
            <p>
              {language === "hi"
                ? decision.irrigationReasonHi
                : decision.irrigationReasonEn}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-[#7F91A3]">
          <span>{language === "hi" ? "स्रोत: 24h पूर्वानुमान वर्षा" : "Based on next 24h precipitation forecast"}</span>
          <span className="font-semibold text-cyan-700 dark:text-cyan-400">{language === "hi" ? "कृषि जल प्रबंधन" : "Agro-Hydrology"}</span>
        </div>
      </div>

      {/* CARD 4: Spray Weather Window / स्प्रे मौसम विंडो */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800/50 bg-white dark:bg-[#080E14] p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-[#0B1219] border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400">
                <Wind className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">
                  {language === "hi" ? "स्प्रे मौसम विंडो" : "Spray Weather Window"}
                </h3>
                <span className="text-[11px] text-indigo-700 dark:text-indigo-400 font-medium">
                  {language === "hi" ? "हवा, बहाव (ड्रिफ्ट) एवं धुलने का जोखिम" : "Wind Drift & Wash-off Risk Check"}
                </span>
              </div>
            </div>

            {getStatusBadge(decision.sprayStatus, language)}
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800/50 bg-[#F8FAFC] dark:bg-[#0B1219] p-4 text-xs sm:text-sm text-slate-700 dark:text-[#CBD5E1] leading-relaxed">
            <p>
              {language === "hi"
                ? decision.sprayReasonHi
                : decision.sprayReasonEn}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-[#7F91A3]">
          <span>{language === "hi" ? "सीमा: हवा < 14 km/h, वर्षा < 25%" : "Criteria: Wind < 14 km/h, Rain < 25%"}</span>
          <button
            type="button"
            onClick={() => setShowProvenance(true)}
            className="flex items-center gap-1 font-semibold text-sky-600 dark:text-cyan-400 hover:underline cursor-pointer"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>{language === "hi" ? "तर्क व प्रमाण" : "Why this advisory?"}</span>
          </button>
        </div>
      </div>

      <EvidenceProvenanceDrawer
        isOpen={showProvenance}
        onClose={() => setShowProvenance(false)}
        evidence={evidenceData}
      />
    </div>
  );
};

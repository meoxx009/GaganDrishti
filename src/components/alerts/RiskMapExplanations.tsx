"use client";

import React from "react";
import {
  HelpCircle,
  MapPin,
  Clock,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Flame,
  CloudRain,
  Wind,
  CheckCircle2,
} from "lucide-react";
import { CityRiskPoint, sortCityRisksBySeverity, MapTierLevel } from "@/lib/weather/mapRiskService";
import { useApp } from "@/context/AppContext";
import { City } from "@/lib/types";

interface RiskMapExplanationsProps {
  points: CityRiskPoint[];
  onSelectCityOnMap: (point: CityRiskPoint) => void;
}

const TIER_BADGES: Record<
  MapTierLevel,
  { labelEn: string; labelHi: string; bg: string; text: string; border: string; dot: string }
> = {
  HIGH: {
    labelEn: "High Risk",
    labelHi: "उच्च जोखिम",
    bg: "bg-rose-50 dark:bg-rose-500/15",
    text: "text-rose-800 dark:text-rose-400",
    border: "border-rose-200 dark:border-rose-500/40",
    dot: "bg-rose-500",
  },
  SIGNIFICANT: {
    labelEn: "Significant Risk",
    labelHi: "महत्वपूर्ण जोखिम",
    bg: "bg-orange-50 dark:bg-orange-500/15",
    text: "text-orange-800 dark:text-orange-400",
    border: "border-orange-200 dark:border-orange-500/40",
    dot: "bg-orange-500",
  },
  MODERATE: {
    labelEn: "Caution",
    labelHi: "सावधानी / मध्यम",
    bg: "bg-amber-50 dark:bg-amber-500/15",
    text: "text-amber-800 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-500/40",
    dot: "bg-amber-500",
  },
  LOW: {
    labelEn: "Low Risk / Fair",
    labelHi: "निम्न / सामान्य",
    bg: "bg-emerald-50 dark:bg-emerald-500/15",
    text: "text-emerald-800 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-500/40",
    dot: "bg-emerald-500",
  },
  UNAVAILABLE: {
    labelEn: "Unavailable",
    labelHi: "डेटा अनुपलब्ध",
    bg: "bg-slate-100 dark:bg-slate-500/15",
    text: "text-slate-700 dark:text-slate-400",
    border: "border-slate-200 dark:border-slate-500/40",
    dot: "bg-slate-400",
  },
};

export const RiskMapExplanations: React.FC<RiskMapExplanationsProps> = ({
  points,
  onSelectCityOnMap,
}) => {
  const { language, city: currentCity } = useApp();
  const sortedPoints = sortCityRisksBySeverity(points);

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800/50 bg-white dark:bg-[#080E14] p-5 sm:p-6 shadow-xs space-y-5">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-sky-200 dark:border-sky-500/30 bg-sky-50 dark:bg-[#0B1219] text-sky-600 dark:text-sky-400">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
              {language === "hi"
                ? "इन क्षेत्रों के रंग ऐसे क्यों हैं? (क्षेत्रीय विश्लेषण)"
                : "Why are these zones coloured? (Zone Explanations)"}
            </h3>
            <p className="text-xs text-slate-600 dark:text-[#7F91A3]">
              {language === "hi"
                ? "प्रत्येक शहर का रंग ओपन-मेटियो के वास्तविक संख्यात्मक पूर्वानुमान मानों पर आधारित है।"
                : "Objective meteorological triggers evaluated from live Open-Meteo telemetry across all 10 hubs."}
            </p>
          </div>
        </div>

        {/* Tier Legend Pills */}
        <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto text-[10px] font-semibold">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-500/15 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            <span>{language === "hi" ? "लाल: उच्च" : "Red: High"}</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-50 dark:bg-orange-500/15 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
            <span>{language === "hi" ? "नारंगी: महत्वपूर्ण" : "Orange: Signif."}</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            <span>{language === "hi" ? "पीला: सावधानी" : "Yellow: Caution"}</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>{language === "hi" ? "हरा: सामान्य" : "Green: Normal"}</span>
          </span>
        </div>
      </div>

      {/* Sorted Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {sortedPoints.map((pt) => {
          const isCurrentActive = pt.city.id === currentCity.id;
          const badge = TIER_BADGES[pt.tierLevel];
          const cityName = language === "hi" ? pt.city.nameHi : pt.city.nameEn;
          const stateName = language === "hi" ? pt.city.stateHi : pt.city.stateEn;
          const primaryReason = language === "hi" ? pt.primaryReasonHi : pt.primaryReasonEn;
          const forecastMetric = language === "hi" ? pt.forecastMetricHi : pt.forecastMetricEn;
          const timeframe = language === "hi" ? pt.timeframeHi : pt.timeframeEn;

          return (
            <div
              key={pt.city.id}
              className={`relative rounded-2xl p-4 border transition-all duration-200 flex flex-col justify-between space-y-3 ${
                isCurrentActive
                  ? "border-sky-300 dark:border-sky-500/60 bg-sky-50/50 dark:bg-[#0B1A28] shadow-2xs ring-1 ring-sky-300 dark:ring-sky-500/40"
                  : "border-slate-200 dark:border-slate-800/50 bg-[#F8FAFC] dark:bg-[#0B1219] hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/70 dark:hover:bg-[#0E1821]"
              }`}
            >
              {/* Card Header: City, State & Badge */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
                      {cityName}
                    </h4>
                    <span className="text-[11px] text-slate-500 dark:text-[#7F91A3]">
                      ({stateName})
                    </span>
                    {isCurrentActive && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/40">
                        {language === "hi" ? "सक्रिय शहर" : "Active City"}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-[#7F91A3] mt-0.5">
                    <Clock className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                    <span>{timeframe}</span>
                  </div>
                </div>

                <div
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${badge.bg} ${badge.text} border ${badge.border}`}
                >
                  <span className={`h-2 w-2 rounded-full ${badge.dot}`} />
                  <span>{language === "hi" ? badge.labelHi : badge.labelEn}</span>
                </div>
              </div>

              {/* Underlying Live Telemetry Reason */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#060C12] p-3 space-y-1.5 text-xs">
                <div className="font-semibold text-slate-800 dark:text-[#F8FAFC] flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: pt.riskColor }} />
                  <span>{primaryReason}</span>
                </div>
                <div className="text-[11px] text-slate-600 dark:text-[#7F91A3] font-mono leading-relaxed pl-3">
                  {forecastMetric}
                </div>
              </div>

              {/* Weather Snapshot & View on Map Button */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800/60 text-xs">
                <div className="flex items-center gap-3 text-slate-500 dark:text-[#7F91A3] text-[11px]">
                  <span>
                    <strong className="text-slate-800 dark:text-[#F8FAFC]">{pt.temp}°C</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Rain: <strong className="text-slate-800 dark:text-[#F8FAFC]">{pt.rainProb}%</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Wind: <strong className="text-slate-800 dark:text-[#F8FAFC]">{pt.windSpeed} km/h</strong>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectCityOnMap(pt)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-sky-700 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 px-2.5 py-1 rounded-xl bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-100 dark:hover:bg-sky-500/20 border border-sky-200 dark:border-sky-500/30 transition-colors shadow-2xs"
                >
                  <MapPin className="h-3 w-3" />
                  <span>{language === "hi" ? "मानचित्र पर देखें" : "View on Map"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

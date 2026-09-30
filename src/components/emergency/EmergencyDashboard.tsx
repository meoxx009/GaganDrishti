"use client";

import React from "react";
import {
  ShieldAlert,
  MapPin,
  Compass,
  AlertTriangle,
  Info,
  Radio,
  FileCheck2,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { VerifiedHelplines } from "./VerifiedHelplines";
import { EmergencyPrecautions } from "./EmergencyPrecautions";
import { ReliefCentresNotice } from "./ReliefCentresNotice";

export const EmergencyDashboard: React.FC = () => {
  const { city, language, t } = useApp();

  const cityName = language === "hi" ? city.nameHi : city.nameEn;
  const stateName = language === "hi" ? city.stateHi : city.stateEn;

  return (
    <div className="space-y-6">
      {/* 1. Official Truthfulness & Emergency Guidance Banner */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#080E14] p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 text-sky-600 dark:text-sky-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
                  {language === "hi"
                    ? "नागरिक आपदा एवं आपातकालीन सुरक्षा"
                    : "Civil Defense & Emergency Safety"}
                </h1>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 dark:border-sky-500/30 bg-sky-50 dark:bg-sky-500/10 px-2.5 py-0.5 text-xs font-semibold text-sky-800 dark:text-sky-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse" />
                  <span>{language === "hi" ? "हेल्पलाइन निर्देशिका" : "Emergency Helplines"}</span>
                </span>
              </div>

              {/* Truthfulness Disclaimer */}
              <div className="mt-2 space-y-1 text-xs">
                <p className="font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {language === "hi"
                      ? "लाइव मौसम जानकारी सूचनात्मक है। आधिकारिक आपातकालीन चेतावनियों के लिए IMD या संबंधित प्राधिकरण की जानकारी सत्यापित करें।"
                      : "Live weather data is informational. Verify official emergency warnings with IMD or competent authorities."}
                  </span>
                </p>
                <p className="text-slate-600 dark:text-[#7F91A3] leading-relaxed text-[11px] sm:text-xs">
                  {language === "hi"
                    ? "गगनदृष्टि मौसम आसूचना मंच है। आपात स्थिति में स्थानीय प्रशासन (DDMA/NDMA) तथा राज्य आपदा नियंत्रण कक्ष द्वारा जारी निर्देश ही सर्वोच्च और बाध्यकारी हैं।"
                    : "GaganDrishti provides meteorological intelligence. During active emergencies, instructions issued by local administration (DDMA/NDMA) and civil defense authorities take absolute precedence."}
                </p>
              </div>
            </div>
          </div>

          {/* Active GPS & City Coordinates Pill */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-[#F8FAFC] dark:bg-[#060C12] p-3.5 shrink-0">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-[#7F91A3] tracking-wider">
                  {language === "hi" ? "निगरानी क्षेत्र" : "Monitoring Zone"}
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">
                  {cityName}, {stateName}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l lg:border-t lg:border-l-0 border-slate-200 dark:border-slate-800/80 pt-2 sm:pt-0 sm:pl-3 lg:pt-2 lg:pl-0">
              <Compass className="h-4 w-4 text-emerald-600 dark:text-emerald-500 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 dark:text-[#7F91A3] font-medium">
                  {t.section.coordinatesLabel}
                </span>
                <span className="font-mono text-xs font-semibold text-slate-700 dark:text-sky-300">
                  {city.lat.toFixed(4)}° N, {city.lon.toFixed(4)}° E
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Verified National Helplines (Top Action Priority) */}
      <VerifiedHelplines />

      {/* 3. Actionable Emergency Precautions (Heavy Rain, Lightning, Heatwave, Strong Wind) */}
      <EmergencyPrecautions />

      {/* 4. Relief & Evacuation Centres Notice (No Fabrication Guarantee) */}
      <ReliefCentresNotice />
    </div>
  );
};

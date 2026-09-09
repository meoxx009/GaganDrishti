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
    <div className="space-y-8">
      {/* 1. Official Truthfulness & SIH Prototype Disclaimer (Prominent Top Banner) */}
      <div className="rounded-3xl border border-rose-500/50 bg-gradient-to-br from-rose-950/60 via-slate-900/90 to-[#07111F] p-5 sm:p-7 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-lg shadow-rose-600/30">
              <ShieldAlert className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {language === "hi"
                    ? "नागरिक आपदा एवं आपातकालीन सुरक्षा"
                    : "Civil Defense & Emergency Safety"}
                </h1>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/40 bg-rose-500/20 px-3 py-0.5 text-xs font-extrabold text-rose-300">
                  <span className="h-2 w-2 rounded-full bg-rose-400 animate-ping" />
                  <span>24×7 Helplines</span>
                </span>
              </div>

              {/* Prototype Identification & Truthfulness Disclaimer */}
              <div className="mt-2.5 space-y-1.5 text-xs sm:text-sm">
                <p className="font-semibold text-rose-200 flex items-center gap-1.5">
                  <Info className="h-4 w-4 text-rose-400 shrink-0" />
                  <span>
                    {language === "hi"
                      ? "लाइव मौसम जानकारी सूचनात्मक है। आधिकारिक आपातकालीन चेतावनियों के लिए IMD या संबंधित प्राधिकरण की जानकारी सत्यापित करें।"
                      : "Live weather data is informational. Verify official emergency warnings with IMD or the competent authorities."}
                  </span>
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {language === "hi"
                    ? "गगनदृष्टि (GaganDrishti) स्मार्ट इंडिया हैकाथॉन (SIH 2026) प्रोटोटाइप है, यह पृथ्वी विज्ञान मंत्रालय (MoES) या भारतीय मौसम विभाग (IMD) का आधिकारिक अनुप्रयोग नहीं है। आपात स्थिति में स्थानीय प्रशासन (DDMA/NDMA) के निर्देश ही सर्वोच्च और बाध्यकारी हैं।"
                    : "GaganDrishti is an SIH 2026 Prototype and not an official MoES/IMD application. During emergencies, instructions issued by local administrative authorities (DDMA/NDMA) take absolute priority."}
                </p>
              </div>
            </div>
          </div>

          {/* Active GPS & City Coordinates Pill */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shrink-0 shadow-inner">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-rose-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  {language === "hi" ? "आपदा निगरानी क्षेत्र" : "Disaster Zone"}
                </span>
                <span className="text-sm font-black text-slate-100">
                  {cityName}, {stateName}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l lg:border-t lg:border-l-0 border-slate-800 pt-2 sm:pt-0 sm:pl-3 lg:pt-2 lg:pl-0">
              <Compass className="h-4 w-4 text-emerald-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-medium">
                  {t.section.coordinatesLabel}
                </span>
                <span className="font-mono text-xs font-bold text-cyan-300">
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

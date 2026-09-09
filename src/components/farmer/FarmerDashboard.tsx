"use client";

import React, { useState } from "react";
import {
  Sprout,
  MessageSquare,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  Compass,
  ArrowRight,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useWeather } from "@/context/WeatherContext";
import { CropId, StageId, CROPS, STAGES } from "@/lib/weather/farmerTypes";
import { evaluateFarmerWeatherAdvisory } from "@/lib/weather/farmerDecisionEngine";
import { FarmerCropSelector } from "./FarmerCropSelector";
import { FarmerWeatherSummary } from "./FarmerWeatherSummary";
import { FarmerDecisionCards } from "./FarmerDecisionCards";
import { FarmerOutlook5D } from "./FarmerOutlook5D";

export const FarmerDashboard: React.FC = () => {
  const { language, city, setActiveSection } = useApp();
  const { weather, isLoading, error, refreshWeather } = useWeather();

  const [selectedCrop, setSelectedCrop] = useState<CropId>("soybean");
  const [selectedStage, setSelectedStage] = useState<StageId>("growing");

  // Evaluate the deterministic decision engine
  const decision = evaluateFarmerWeatherAdvisory(
    weather,
    selectedCrop,
    selectedStage
  );

  const cropObj = CROPS.find((c) => c.id === selectedCrop) || CROPS[0];
  const stageObj = STAGES.find((s) => s.id === selectedStage) || STAGES[1];

  const cropName = language === "hi" ? cropObj.nameHi : cropObj.nameEn;
  const stageName = language === "hi" ? stageObj.nameHi : stageObj.nameEn;
  const cityName = language === "hi" ? city.nameHi : city.nameEn;

  // Handle Loading Skeleton
  if (isLoading && !weather) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 rounded-3xl border border-slate-800 bg-slate-900/60 p-6" />
        <div className="h-44 rounded-3xl border border-slate-800 bg-slate-900/60 p-6" />
        <div className="h-64 rounded-3xl border border-slate-800 bg-slate-900/60 p-6" />
      </div>
    );
  }

  // Handle Error Screen
  if (error && !weather) {
    return (
      <div className="rounded-3xl border border-rose-500/40 bg-rose-950/20 p-8 sm:p-10 text-center backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h3 className="mt-4 text-xl sm:text-2xl font-bold text-white">
          {language === "hi"
            ? "किसान मौसम डेटा अनुपलब्ध है"
            : "Agricultural Weather Telemetry Unavailable"}
        </h3>
        <p className="mx-auto mt-2 max-w-lg text-sm text-slate-400">
          {error}
        </p>

        <div className="mt-6 flex justify-center">
          <button
            onClick={() => refreshWeather(true)}
            type="button"
            className="flex items-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
          >
            <RefreshCw className="h-4 w-4" />
            <span>{language === "hi" ? "पुनः प्रयास करें" : "Retry Connection"}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Module Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 via-slate-900/60 to-[#07111F]/80 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/40 bg-emerald-950/60 text-emerald-300 shadow-inner">
              <Sprout className="h-7 w-7 sm:h-8 sm:w-8" />
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  {language === "hi" ? "किसान मौसम सलाह" : "Farm Weather Advisory"}
                </h1>
                <span className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                  {cropName} • {stageName}
                </span>
              </div>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {language === "hi"
                  ? `${cityName} क्षेत्र के लिए ${cropName} (${stageName}) हेतु मौसम-आधारित व्यावहारिक निर्णय सहायता।`
                  : `Weather-suitability intelligence for ${cropName} (${stageName}) in ${cityName} based on verified Open-Meteo telemetry.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 bg-slate-900/80 border border-slate-800 px-3.5 py-2 rounded-2xl shrink-0">
            <Compass className="h-4 w-4 text-emerald-400" />
            <span>
              {city.lat.toFixed(4)}°N, {city.lon.toFixed(4)}°E
            </span>
          </div>
        </div>
      </div>

      {/* 2. Crop & Growth Stage Selectors */}
      <FarmerCropSelector
        selectedCrop={selectedCrop}
        onSelectCrop={setSelectedCrop}
        selectedStage={selectedStage}
        onSelectStage={setSelectedStage}
      />

      {/* 3. Field Weather Status (6 Core Agricultural Metrics) */}
      <FarmerWeatherSummary />

      {/* 4. The 4 Main Decision Cards */}
      <FarmerDecisionCards decision={decision} />

      {/* 5. 5-Day Agricultural Weather Outlook */}
      <FarmerOutlook5D />

      {/* 6. Ask GaganDrishti Interactive Action */}
      <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/30 via-slate-900/60 to-slate-950 p-6 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">
              {language === "hi"
                ? `गगनदृष्टि से पूछें: ${cropName} एवं वर्तमान मौसम`
                : `Ask GaganDrishti about ${cropName} & Weather`}
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              {language === "hi"
                ? `${cityName} में ${cropName} की ${stageName} अवस्था पर विस्तृत जानकारी प्राप्त करें।`
                : `Get conversational meteorological answers customized for ${cropName} in ${cityName}.`}
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveSection("ask")}
          type="button"
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-xs sm:text-sm font-bold text-slate-950 hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/25 shrink-0"
        >
          <span>
            {language === "hi"
              ? `${cropName} पर प्रश्न पूछें`
              : `Consult Ask GaganDrishti`}
          </span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* 7. Official Agronomic Disclaimer Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 text-xs text-slate-400 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
            {language === "hi" ? "आधिकारिक कृषि परामर्श अस्वीकरण" : "Official Agrometeorological Disclaimer"}
          </span>
          <p className="leading-relaxed">
            {language === "hi"
              ? "कृषि सुझाव मौसम-आधारित निर्णय सहायता हैं। फसल-विशिष्ट निर्णय के लिए आधिकारिक कृषि-मौसम सलाह को प्राथमिकता दें। यह प्रणाली किसी भी प्रकार के कीटनाशक ब्रांड, रासायनिक खुराक अथवा फसल परिणाम की गारंटी का दावा नहीं करती है।"
              : "Farm recommendations are weather-based decision support, not a substitute for official agrometeorological or crop-specific professional advice. This platform does not endorse pesticide brands, provide chemical dosages, or guarantee crop outcomes."}
          </p>
        </div>
      </div>
    </div>
  );
};

"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sprout,
  MessageSquare,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  Compass,
  ArrowRight,
  Bug,
  Smartphone,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useWeather } from "@/context/WeatherContext";
import { CropId, StageId, CROPS, STAGES } from "@/lib/weather/farmerTypes";
import { evaluateFarmerWeatherAdvisory } from "@/lib/weather/farmerDecisionEngine";
import { SeasonId, findCropById, getPriorityCropsBySeason } from "@/lib/crops";
import { getSuggestedSeason, SEASONS } from "@/lib/seasonConfig";
import { FarmerSeasonSelector } from "./FarmerSeasonSelector";
import { FarmerCropSelector } from "./FarmerCropSelector";
import { FarmerWeatherSummary } from "./FarmerWeatherSummary";
import { FarmerDecisionCards } from "./FarmerDecisionCards";
import { FarmerOutlook5D } from "./FarmerOutlook5D";
import { CropStageDecisionModal } from "./CropStageDecisionModal";
import { PestForecastModal } from "./PestForecastModal";

export const FarmerDashboard: React.FC = () => {
  const { language, city, setActiveSection } = useApp();
  const { weather, isLoading, error, refreshWeather } = useWeather();

  // Dynamic suggested season based on IST calendar month
  const suggestedSeason = getSuggestedSeason();
  const [selectedSeason, setSelectedSeason] = useState<SeasonId>(suggestedSeason);
  const [isAutoSuggested, setIsAutoSuggested] = useState<boolean>(true);

  // Default initial crop based on season priority
  const defaultCropForSeason = getPriorityCropsBySeason(suggestedSeason)[0]?.id || "soybean";
  const [selectedCrop, setSelectedCrop] = useState<CropId>(defaultCropForSeason);
  const [selectedStage, setSelectedStage] = useState<StageId>("growing");
  const [isCropDecisionModalOpen, setIsCropDecisionModalOpen] = useState<boolean>(false);
  const [isPestForecastModalOpen, setIsPestForecastModalOpen] = useState<boolean>(false);

  // Handle season switch
  const handleSelectSeason = (season: SeasonId, isAuto: boolean) => {
    setSelectedSeason(season);
    setIsAutoSuggested(isAuto);
    // If current crop is not available in new season, auto-select top priority crop of that season
    const seasonPriorityCrops = getPriorityCropsBySeason(season);
    const catalogCrop = findCropById(selectedCrop);
    if (!catalogCrop || !catalogCrop.seasons.includes(season)) {
      if (seasonPriorityCrops.length > 0) {
        setSelectedCrop(seasonPriorityCrops[0].id);
      }
    }
  };

  const handleResetToSuggested = () => {
    handleSelectSeason(suggestedSeason, true);
  };

  // Evaluate the deterministic decision engine
  const decision = evaluateFarmerWeatherAdvisory(
    weather,
    selectedCrop,
    selectedStage
  );

  const catalogCrop = findCropById(selectedCrop);
  const fallbackCrop = CROPS.find((c) => c.id === selectedCrop) || CROPS[0];
  const cropObj = catalogCrop || fallbackCrop;
  const stageObj = STAGES.find((s) => s.id === selectedStage) || STAGES[1];

  const cropName = language === "hi" ? cropObj.nameHi : cropObj.nameEn;
  const stageName = language === "hi" ? stageObj.nameHi : stageObj.nameEn;
  const seasonName = language === "hi" ? SEASONS[selectedSeason].nameHi : SEASONS[selectedSeason].nameEn;
  const cityName = language === "hi" ? city.nameHi : city.nameEn;


  // Handle Loading Skeleton
  if (isLoading && !weather) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 p-6" />
        <div className="h-44 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 p-6" />
        <div className="h-64 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 p-6" />
      </div>
    );
  }

  // Handle Error Screen
  if (error && !weather) {
    return (
      <div className="rounded-3xl border border-rose-200 dark:border-rose-500/40 bg-rose-50/50 dark:bg-rose-950/20 p-8 sm:p-10 text-center shadow-xs">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h3 className="mt-4 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          {language === "hi"
            ? "किसान मौसम डेटा अनुपलब्ध है"
            : "Agricultural Weather Telemetry Unavailable"}
        </h3>
        <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600 dark:text-slate-400">
          {error}
        </p>

        <div className="mt-6 flex justify-center">
          <button
            onClick={() => refreshWeather(true)}
            type="button"
            className="flex items-center gap-2 rounded-2xl bg-emerald-600 dark:bg-emerald-500 px-6 py-3 text-sm font-bold text-white dark:text-slate-950 hover:bg-emerald-700 dark:hover:bg-emerald-400 transition-all shadow-xs"
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
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800/50 bg-white dark:bg-[#080E14] p-6 sm:p-8 shadow-xs">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/5 dark:bg-emerald-500/5 blur-3xl" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-[#0B1219] text-emerald-600 dark:text-emerald-400">
              <Sprout className="h-7 w-7 sm:h-8 sm:w-8" />
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
                  {language === "hi" ? "किसान मौसम सलाह" : "Farm Weather Advisory"}
                </h1>
                <span className="inline-flex items-center rounded-full border border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  {seasonName} • {cropName} • {stageName}
                </span>
              </div>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-[#7F91A3] max-w-2xl leading-relaxed">
                {language === "hi"
                  ? `${cityName} क्षेत्र के लिए ${seasonName} मौसम में ${cropName} (${stageName}) हेतु मौसम-आधारित व्यावहारिक निर्णय सहायता।`
                  : `Weather-suitability intelligence for ${cropName} (${stageName}) during ${seasonName} season in ${cityName} based on verified Open-Meteo telemetry.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-700 dark:text-cyan-300 bg-[#F8FAFC] dark:bg-[#060C12] border border-slate-200 dark:border-slate-800/50 px-3.5 py-2 rounded-2xl shrink-0">
            <Compass className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>
              {city.lat.toFixed(4)}°N, {city.lon.toFixed(4)}°E
            </span>
          </div>
        </div>
      </div>

      {/* 2. Indian Crop Season Cycle Selector */}
      <FarmerSeasonSelector
        selectedSeason={selectedSeason}
        suggestedSeason={suggestedSeason}
        isAutoSuggested={isAutoSuggested}
        onSelectSeason={handleSelectSeason}
        onResetToSuggested={handleResetToSuggested}
      />

      {/* 3. Crop & Growth Stage Selectors */}
      <FarmerCropSelector
        selectedSeason={selectedSeason}
        selectedCrop={selectedCrop}
        onSelectCrop={setSelectedCrop}
        selectedStage={selectedStage}
        onSelectStage={setSelectedStage}
      />


      {/* 3. Field Weather Status (6 Core Agricultural Metrics) */}
      <FarmerWeatherSummary />

      {/* 3.5. CHANGE_002: Deterministic Crop-Stage Decision Engine Inspector Banner */}
      <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-cyan-950/40 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                Deterministic Rule Engine (No Hallucination)
              </span>
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
              {language === "hi"
                ? `🔬 फसल-अवस्था निर्णय इंजन: ${cropName} (${stageName})`
                : `🔬 Crop-Stage Decision Engine: ${cropName} (${stageName})`}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              {language === "hi"
                ? "मौसम सीमाएं (तापमान, वर्षा धुलाई, हवा ड्रिफ्ट, रोग आर्द्रता) + 25 विकास अवस्थाओं का गणितीय मूल्यांकन।"
                : "Live evaluation across 28 agronomic parameters, rain wash-off risks, chemical drift limits, and fungal thresholds."}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCropDecisionModalOpen(true)}
          type="button"
          className="flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-slate-950 px-5 py-3 text-xs sm:text-sm font-bold transition-all shadow-xs shrink-0 w-full sm:w-auto justify-center"
        >
          <span>
            {language === "hi"
              ? "निर्णय व नियम मैट्रिक्स जांचें"
              : "Inspect Rule Matrix"}
          </span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* 3.6. CHANGE_004: Weather-Based Predictive Pest/Disease Engine (7-Day Forecast) */}
      <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-slate-900/80 to-rose-950/40 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Bug className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                Predictive Warning Engine (7-Day Horizon)
              </span>
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
              {language === "hi"
                ? `🐛 7-दिवसीय कीट एवं रोग पूर्वानुमान: ${cropName}`
                : `🐛 7-Day Pest & Disease Forecast: ${cropName}`}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              {language === "hi"
                ? "मौसम पूर्वानुमान (तापमान, आर्द्रता, वर्षा व पत्ती गीलापन) के आधार पर 50+ कीट-रोगों का 7 दिन पूर्व सटीक पूर्वानुमान।"
                : "Predicts pest/disease outbreaks 7 days in advance across 52 trigger records based on Open-Meteo microclimate telemetry."}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsPestForecastModalOpen(true)}
          type="button"
          className="flex items-center gap-2 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-slate-950 px-5 py-3 text-xs sm:text-sm font-bold transition-all shadow-xs shrink-0 w-full sm:w-auto justify-center"
        >
          <span>
            {language === "hi"
              ? "7-दिवसीय कीट कैलेंडर देखें"
              : "Inspect 7-Day Pest Calendar"}
          </span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* 4. The 4 Main Decision Cards */}
      <FarmerDecisionCards decision={decision} />

      {/* 5. 5-Day Agricultural Weather Outlook */}
      <FarmerOutlook5D />

      {/* 6. Ask GaganDrishti Interactive Action */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800/50 bg-white dark:bg-[#080E14] p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 dark:bg-[#0B1219] text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-500/20">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">
              {language === "hi"
                ? `गगनदृष्टि से पूछें: ${cropName} एवं वर्तमान मौसम`
                : `Ask GaganDrishti about ${cropName} & Weather`}
            </h4>
            <p className="text-xs text-slate-600 dark:text-[#7F91A3] mt-0.5">
              {language === "hi"
                ? `${cityName} में ${cropName} की ${stageName} अवस्था पर विस्तृत जानकारी प्राप्त करें।`
                : `Get conversational meteorological answers customized for ${cropName} in ${cityName}.`}
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveSection("ask")}
          type="button"
          className="flex items-center gap-2 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white dark:bg-sky-500 dark:hover:bg-sky-400 dark:text-slate-950 px-5 py-3 text-xs sm:text-sm font-semibold transition-all shadow-xs shrink-0"
        >
          <span>
            {language === "hi"
              ? `${cropName} पर प्रश्न पूछें`
              : `Consult Ask GaganDrishti`}
          </span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* 6.5. CHANGE_003: Hyperlocal Village-Level Weather Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-sky-500/30 bg-gradient-to-r from-sky-950/40 via-slate-900/80 to-[#07111F] p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <Compass className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                Micro-Location Accuracy
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                500k+ Pincodes
              </span>
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
              {language === "hi"
                ? "📍 गांव-स्तर हाइपरलोकल मौसम व माइक्रो-क्लाइमेट"
                : "📍 Hyperlocal Village-Level Weather & Micro-Climates"}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              {language === "hi"
                ? "शहर केंद्र के बजाय अपने गांव के सटीक पिनकोड, ऊंचाई (-0.65°C/100m) व मिट्टी के अनुसार पूर्वानुमान देखें।"
                : "Get village-specific forecasts by exact coordinates, elevation lapse rates, and soil moisture retention."}
            </p>
          </div>
        </div>

        <Link
          href="/village-weather"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold px-5 py-3 text-xs sm:text-sm transition-all shadow-md shrink-0 w-full sm:w-auto"
        >
          <span>{language === "hi" ? "गांव का मौसम देखें" : "Open Village Weather"}</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* 7. CHANGE_001: Real Farmer Feedback Loop System CTA */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-[#07111F] p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Sprout className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Ground-Truth Dataset
              </span>
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
              {language === "hi"
                ? "🌾 आज का खेती अनुभव साझा करें (2 मिनट का फॉर्म)"
                : "🌾 Share Today's Farm Activity & Real Outcomes"}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              {language === "hi"
                ? "मौसम की सलाह का आपके खेत पर क्या असर हुआ? आपका अनुभव अन्य किसानों के लिए सलाह को और सटीक बनाएगा।"
                : "Help validate meteorological advisories with your ground observations, crop stage, and spray/irrigation results."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
          <a
            href="/feedback-analytics"
            className="flex-1 sm:flex-none text-center rounded-2xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300 px-4 py-3 text-xs font-semibold transition-colors"
          >
            {language === "hi" ? "एनालिटिक्स" : "Analytics"}
          </a>
          <a
            href="/farmer-feedback"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 text-xs sm:text-sm transition-all shadow-md hover:shadow-lg"
          >
            <span>{language === "hi" ? "फीडबैक दर्ज करें" : "Submit Feedback"}</span>
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>

      {/* 7.5. CHANGE_005: SMS-Based Feature Phone System Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-slate-900/80 to-[#120F08] p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Smartphone className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                2G Feature Phone Offline Access
              </span>
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
              {language === "hi"
                ? "📱 ग्रामीण फीचर फोन SMS सेवा (बिना इंटरनेट व स्मार्टफोन)"
                : "📱 Feature Phone SMS Gateway (Rural Access without App)"}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              {language === "hi"
                ? "बेसिक फोन से केवल SMS भेजकर (WEATHER, CROP, PEST, ALERT) 160 अक्षरों में तुरंत सटीक सलाह प्राप्त करें।"
                : "Farmers with basic phones can text WEATHER, CROP, PEST, ALERT to receive instant concise agronomic advice."}
            </p>
          </div>
        </div>

        <Link
          href="/sms-feature-phone"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-3 text-xs sm:text-sm transition-all shadow-md shrink-0 w-full sm:w-auto"
        >
          <span>{language === "hi" ? "SMS सिम्युलेटर व पोर्टल" : "Open SMS Simulator"}</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* 8. Official Agronomic Disclaimer Banner */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800/50 bg-[#F8FAFC] dark:bg-[#060C12] p-4 text-xs text-slate-600 dark:text-[#7F91A3] flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider text-[10px]">
            {language === "hi" ? "आधिकारिक कृषि परामर्श अस्वीकरण" : "Official Agrometeorological Disclaimer"}
          </span>
          <p className="leading-relaxed">
            {language === "hi"
              ? "कृषि सुझाव मौसम-आधारित निर्णय सहायता हैं। फसल-विशिष्ट निर्णय के लिए आधिकारिक कृषि-मौसम सलाह को प्राथमिकता दें। यह प्रणाली किसी भी प्रकार के कीटनाशक ब्रांड, रासायनिक खुराक अथवा फसल परिणाम की गारंटी का दावा नहीं करती है।"
              : "Farm recommendations are weather-based decision support, not a substitute for official agrometeorological or crop-specific professional advice. This platform does not endorse pesticide brands, provide chemical dosages, or guarantee crop outcomes."}
          </p>
        </div>
      </div>

      {/* Crop-Stage Decision Engine Modal */}
      <CropStageDecisionModal
        isOpen={isCropDecisionModalOpen}
        onClose={() => setIsCropDecisionModalOpen(false)}
        language={language}
        cityName={cityName}
        weather={weather}
        initialCrop={selectedCrop}
        initialStage={selectedStage === "sowing" ? 1 : selectedStage === "growing" ? 2 : selectedStage === "flowering" ? 3 : selectedStage === "harvesting" ? 5 : 2}
      />

      {/* 7-Day Pest & Disease Predictive Forecast Modal */}
      <PestForecastModal
        isOpen={isPestForecastModalOpen}
        onClose={() => setIsPestForecastModalOpen(false)}
        language={language}
        cityName={cityName}
        weather={weather}
        initialCrop={cropName}
      />
    </div>
  );
};

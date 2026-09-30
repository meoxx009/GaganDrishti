"use client";
import React, { useState } from "react";
import {
  Users,
  Sprout,
  AlertTriangle,
  Bot,
  ShieldAlert,
  MapPin,
  Compass,
  Cpu,
  ShieldCheck,
  Radio,
  Layers,
  ExternalLink,
  TrendingUp,
  BookOpen,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { NavSection } from "@/lib/types";
import { WeatherStateView } from "./weather/WeatherStateView";
import { CitizenDashboard } from "./citizen/CitizenDashboard";
import { FarmerDashboard } from "./farmer/FarmerDashboard";
import { ClimateDashboard } from "./climate/ClimateDashboard";
import { WeatherRiskDashboard } from "./alerts/WeatherRiskDashboard";
import { AskChat } from "./ask/AskChat";
import { EmergencyDashboard } from "./emergency/EmergencyDashboard";
import { ResourcesDashboard } from "./resources/ResourcesDashboard";
import { SafetyDetailModal } from "./safety/SafetyDetailModal";
import { FarmerFeatureModal, FarmerCardKey } from "./farmer/FarmerFeatureModal";
import { CitizenFeatureModal, CitizenCardKey } from "./citizen/CitizenFeatureModal";
import { ClimateFeatureModal, ClimateCardKey } from "./climate/ClimateFeatureModal";

const SECTION_ICONS: Record<NavSection, React.ReactNode> = {
  citizen: <Users className="h-6 w-6 text-cyan-400" />,
  farmer: <Sprout className="h-6 w-6 text-emerald-400" />,
  climate: <TrendingUp className="h-6 w-6 text-purple-400" />,
  alerts: <AlertTriangle className="h-6 w-6 text-amber-400" />,
  ask: <Bot className="h-6 w-6 text-indigo-400" />,
  emergency: <ShieldAlert className="h-6 w-6 text-rose-400" />,
  resources: <BookOpen className="h-6 w-6 text-sky-400" />,
};

export const SectionShell: React.FC = () => {
  const { activeSection, city, language, t } = useApp();
  const [activeModalCard, setActiveModalCard] = useState<"card1" | "card2" | "card3" | null>(null);
  const [activeFarmerCard, setActiveFarmerCard] = useState<FarmerCardKey | null>(null);
  const [activeCitizenCard, setActiveCitizenCard] = useState<CitizenCardKey | null>(null);
  const [activeClimateCard, setActiveClimateCard] = useState<ClimateCardKey | null>(null);

  const isAlerts = activeSection === "alerts";
  const isFarmer = activeSection === "farmer";
  const isCitizen = activeSection === "citizen";
  const isClimate = activeSection === "climate";
  const isInteractive = isAlerts || isFarmer || isCitizen || isClimate;

  const handleCardClick = (cardNum: 1 | 2 | 3) => {
    if (isAlerts) {
      setActiveModalCard(`card${cardNum}` as "card1" | "card2" | "card3");
    } else if (isFarmer) {
      const keys: FarmerCardKey[] = ["sowing_harvesting", "soil_moisture", "hail_frost"];
      setActiveFarmerCard(keys[cardNum - 1]);
    } else if (isCitizen) {
      const keys: CitizenCardKey[] = ["local_forecast", "heat_uv", "air_quality"];
      setActiveCitizenCard(keys[cardNum - 1]);
    } else if (isClimate) {
      const keys: ClimateCardKey[] = ["temp_trajectory", "precip_climatology", "anomalies"];
      setActiveClimateCard(keys[cardNum - 1]);
    }
  };

  const sectionInfo = t.navigation[activeSection];
  const cityName = language === "hi" ? city.nameHi : city.nameEn;
  const stateName = language === "hi" ? city.stateHi : city.stateEn;

  // Highlights specific to the active module
  const highlights = (() => {
    switch (activeSection) {
      case "citizen":
        return t.section.citizenHighlights;
      case "farmer":
        return t.section.farmerHighlights;
      case "climate":
        return t.section.climateHighlights;
      case "alerts":
        return t.section.alertsHighlights;
      case "ask":
        return t.section.askHighlights;
      case "emergency":
        return t.section.emergencyHighlights;
      case "resources":
        return t.section.resourcesHighlights;
    }
  })();

  const isEmergency = activeSection === "emergency";

  return (
    <div className="space-y-6 pb-16 lg:pb-6">
      {/* Specialized Dashboards per Section */}
      {activeSection === "citizen" ? (
        <CitizenDashboard />
      ) : activeSection === "farmer" ? (
        <FarmerDashboard />
      ) : activeSection === "climate" ? (
        <ClimateDashboard />
      ) : activeSection === "alerts" ? (
        <WeatherRiskDashboard />
      ) : activeSection === "ask" ? (
        <AskChat />
      ) : activeSection === "emergency" ? (
        <EmergencyDashboard />
      ) : activeSection === "resources" ? (
        <ResourcesDashboard />
      ) : (
        <>
          {/* Active Module & City Banner for non-citizen modules */}
          <div
            className={`relative overflow-hidden rounded-3xl border p-6 sm:p-8 backdrop-blur-xl shadow-xl transition-all duration-300 ${
              isEmergency
                ? "border-rose-500/30 bg-gradient-to-br from-rose-950/40 via-slate-900/60 to-slate-950/80"
                : "border-slate-700/50 bg-gradient-to-br from-slate-900/70 via-[#0D1B2A]/60 to-[#07111F]/80"
            }`}
          >
            {/* Subtle background ambient glow */}
            <div
              className={`pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl opacity-20 ${
                isEmergency ? "bg-rose-500" : "bg-cyan-500"
              }`}
            />

            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4 sm:gap-5">
                <div
                  className={`flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl border shadow-inner ${
                    isEmergency
                      ? "border-rose-500/40 bg-rose-950/60 text-rose-300"
                      : "border-cyan-500/30 bg-slate-800/80 text-cyan-300"
                  }`}
                >
                  {SECTION_ICONS[activeSection]}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                      {sectionInfo.label}
                    </h1>
                    <span className="text-sm sm:text-base font-semibold text-cyan-600 dark:text-cyan-400">
                      {sectionInfo.sub}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                        isEmergency
                          ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
                          : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                      {t.section.statusBadge}
                    </span>
                  </div>

                  <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                    {sectionInfo.desc}
                  </p>
                </div>
              </div>

              {/* Active City & Coordinates Pill */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-2 rounded-2xl border border-slate-700/60 bg-slate-900/60 p-4 shrink-0">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-cyan-400 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400">
                      {t.section.activeLocation}
                    </span>
                    <span className="text-sm font-bold text-slate-100">
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
                    <span className="font-mono text-xs font-semibold text-cyan-300">
                      {city.lat.toFixed(4)}° N, {city.lon.toFixed(4)}° E
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Telemetry Overview */}
          <WeatherStateView />
        </>
      )}

      {/* Module Capabilities & Architecture Highlights */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 px-1">
          {highlights.heading}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => isInteractive && handleCardClick(1)}
            onKeyDown={(e) => isInteractive && e.key === "Enter" && handleCardClick(1)}
            role={isInteractive ? "button" : undefined}
            tabIndex={isInteractive ? 0 : undefined}
            className={`group rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#080E14] p-5 transition-all shadow-xs ${
              isInteractive
                ? "hover:border-sky-400 dark:hover:border-sky-500/50 hover:bg-slate-50 dark:hover:bg-[#0B1219] cursor-pointer"
                : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="h-9 w-9 rounded-xl bg-sky-500/10 dark:bg-sky-500/15 flex items-center justify-center text-sky-600 dark:text-sky-400">
                <Layers className="h-5 w-5" />
              </div>
              {isInteractive && (
                <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-500 transition-colors" />
              )}
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
              {highlights.card1Title}
            </h3>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-[#7F91A3] leading-relaxed">
              {highlights.card1Desc}
            </p>
            {isInteractive && (
              <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-sky-600 dark:text-sky-400">
                <span>
                  {language === "hi"
                    ? (isFarmer ? "फसल बुवाई व कटाई परामर्श" : isCitizen ? "घंटेवार पूर्वानुमान व मौसम विवरण" : isClimate ? "10-वर्षीय तापमान प्रवृत्ति देखें" : "विस्तृत परामर्श देखें")
                    : (isFarmer ? "Sowing & Harvest Advisory" : isCitizen ? "Hourly Telemetry & Details" : isClimate ? "View Decadal Trajectory" : "View Safety Advisory")}
                </span>
                <span>→</span>
              </div>
            )}
          </div>

          <div
            onClick={() => isInteractive && handleCardClick(2)}
            onKeyDown={(e) => isInteractive && e.key === "Enter" && handleCardClick(2)}
            role={isInteractive ? "button" : undefined}
            tabIndex={isInteractive ? 0 : undefined}
            className={`group rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#080E14] p-5 transition-all shadow-xs ${
              isInteractive
                ? "hover:border-emerald-400 dark:hover:border-emerald-500/50 hover:bg-slate-50 dark:hover:bg-[#0B1219] cursor-pointer"
                : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Radio className="h-5 w-5" />
              </div>
              {isInteractive && (
                <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-500 transition-colors" />
              )}
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
              {highlights.card2Title}
            </h3>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-[#7F91A3] leading-relaxed">
              {highlights.card2Desc}
            </p>
            {isInteractive && (
              <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <span>
                  {language === "hi"
                    ? (isFarmer ? "मृदा नमी व वाष्पोत्सर्जन स्थिति" : isCitizen ? "लू व पराबैंगनी सुरक्षा विश्लेषण" : isClimate ? "वर्षा जलवायु विज्ञान देखें" : "विस्तृत परामर्श देखें")
                    : (isFarmer ? "Soil Moisture & ET Guide" : isCitizen ? "Heatwave & UV Safety Guidance" : isClimate ? "View Climatology Data" : "View Safety Advisory")}
                </span>
                <span>→</span>
              </div>
            )}
          </div>

          <div
            onClick={() => isInteractive && handleCardClick(3)}
            onKeyDown={(e) => isInteractive && e.key === "Enter" && handleCardClick(3)}
            role={isInteractive ? "button" : undefined}
            tabIndex={isInteractive ? 0 : undefined}
            className={`group rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#080E14] p-5 transition-all shadow-xs ${
              isInteractive
                ? "hover:border-amber-400 dark:hover:border-amber-500/50 hover:bg-slate-50 dark:hover:bg-[#0B1219] cursor-pointer"
                : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="h-9 w-9 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              {isInteractive && (
                <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors" />
              )}
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
              {highlights.card3Title}
            </h3>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-[#7F91A3] leading-relaxed">
              {highlights.card3Desc}
            </p>
            {isInteractive && (
              <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                <span>
                  {language === "hi"
                    ? (isFarmer ? "पाला व ओलावृष्टि पूर्व चेतावनी" : isCitizen ? "वायु स्थिति व श्वसन परामर्श" : isClimate ? "जलवायु विसंगतियां देखें" : "विस्तृत परामर्श देखें")
                    : (isFarmer ? "Frost & Hailstorm Warnings" : isCitizen ? "Air Quality & Commute Health" : isClimate ? "View Climate Anomalies" : "View Safety Advisory")}
                </span>
                <span>→</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compliance & System Architecture Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Module State */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#080E14] p-6 backdrop-blur-md">
          <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
            <Cpu className="h-5 w-5" />
            <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-900 dark:text-[#F8FAFC]">
              {t.section.moduleStatusTitle}
            </h3>
          </div>

          <div className="mt-5 space-y-3.5 text-xs sm:text-sm text-slate-600 dark:text-[#7F91A3]">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
              <span>{t.section.sectionKey}:</span>
              <span className="font-mono text-sky-600 dark:text-sky-400 font-semibold uppercase">
                {activeSection}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
              <span>{t.section.languageMode}:</span>
              <span className="font-medium text-slate-900 dark:text-[#CBD5E1]">
                {language === "hi" ? "हिन्दी (Hindi)" : "English (अंग्रेज़ी)"}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
              <span>{t.section.streamState}:</span>
              <span className="font-medium text-amber-600 dark:text-amber-400">
                {t.section.streamStateValue}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span>{t.section.authAndDb}:</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                {t.section.authAndDbValue}
              </span>
            </div>
          </div>
        </div>

        {/* SIH Compliance Note */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#080E14] p-6 backdrop-blur-md">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
            <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-900 dark:text-[#F8FAFC]">
              {t.section.architectureTitle}
            </h3>
          </div>

          <p className="mt-4 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-[#7F91A3]">
            {t.section.readinessDescription}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-slate-100 dark:bg-[#0B1219] border border-slate-200 dark:border-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:text-[#CBD5E1]">
              ✓ No Mock Data
            </span>
            <span className="rounded-lg bg-slate-100 dark:bg-[#0B1219] border border-slate-200 dark:border-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:text-[#CBD5E1]">
              ✓ 10 Accurate Coordinates
            </span>
            <span className="rounded-lg bg-slate-100 dark:bg-[#0B1219] border border-slate-200 dark:border-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:text-[#CBD5E1]">
              ✓ Bilingual Dictionaries
            </span>
            <span className="rounded-lg bg-slate-100 dark:bg-[#0B1219] border border-slate-200 dark:border-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:text-[#CBD5E1]">
              ✓ SSR Hydration Protected
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Safety Detail Modal */}
      <SafetyDetailModal
        isOpen={activeModalCard !== null}
        onClose={() => setActiveModalCard(null)}
        cardKey={activeModalCard}
      />

      {/* Interactive Farmer Feature Modal */}
      <FarmerFeatureModal
        isOpen={activeFarmerCard !== null}
        onClose={() => setActiveFarmerCard(null)}
        cardKey={activeFarmerCard}
      />

      {/* Interactive Citizen Feature Modal */}
      <CitizenFeatureModal
        isOpen={activeCitizenCard !== null}
        onClose={() => setActiveCitizenCard(null)}
        cardKey={activeCitizenCard}
      />

      {/* Interactive Climate Feature Modal */}
      <ClimateFeatureModal
        isOpen={activeClimateCard !== null}
        onClose={() => setActiveClimateCard(null)}
        cardKey={activeClimateCard}
        report={null}
      />
    </div>
  );
};

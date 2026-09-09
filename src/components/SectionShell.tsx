"use client";

import React from "react";
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
  ChevronRight,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { NavSection } from "@/lib/types";
import { WeatherStateView } from "./weather/WeatherStateView";
import { CitizenDashboard } from "./citizen/CitizenDashboard";
import { FarmerDashboard } from "./farmer/FarmerDashboard";
import { WeatherRiskDashboard } from "./alerts/WeatherRiskDashboard";

const SECTION_ICONS: Record<NavSection, React.ReactNode> = {
  citizen: <Users className="h-6 w-6 text-cyan-400" />,
  farmer: <Sprout className="h-6 w-6 text-emerald-400" />,
  alerts: <AlertTriangle className="h-6 w-6 text-amber-400" />,
  ask: <Bot className="h-6 w-6 text-indigo-400" />,
  emergency: <ShieldAlert className="h-6 w-6 text-rose-400" />,
};

export const SectionShell: React.FC = () => {
  const { activeSection, city, language, t } = useApp();

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
      case "alerts":
        return t.section.alertsHighlights;
      case "ask":
        return t.section.askHighlights;
      case "emergency":
        return t.section.emergencyHighlights;
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
      ) : activeSection === "alerts" ? (
        <WeatherRiskDashboard />
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
          <div className="group rounded-2xl border border-slate-800/80 bg-slate-900/50 dark:bg-[#0D1B2A]/60 p-5 backdrop-blur-md transition-all hover:border-cyan-500/40 hover:bg-slate-900/80">
            <div className="flex items-center justify-between">
              <div className="h-9 w-9 rounded-xl bg-cyan-500/15 flex items-center justify-center text-cyan-400">
                <Layers className="h-5 w-5" />
              </div>
              <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-100">
              {highlights.card1Title}
            </h3>
            <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
              {highlights.card1Desc}
            </p>
          </div>

          <div className="group rounded-2xl border border-slate-800/80 bg-slate-900/50 dark:bg-[#0D1B2A]/60 p-5 backdrop-blur-md transition-all hover:border-emerald-500/40 hover:bg-slate-900/80">
            <div className="flex items-center justify-between">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                <Radio className="h-5 w-5" />
              </div>
              <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-emerald-400 transition-colors" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-100">
              {highlights.card2Title}
            </h3>
            <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
              {highlights.card2Desc}
            </p>
          </div>

          <div className="group rounded-2xl border border-slate-800/80 bg-slate-900/50 dark:bg-[#0D1B2A]/60 p-5 backdrop-blur-md transition-all hover:border-amber-500/40 hover:bg-slate-900/80">
            <div className="flex items-center justify-between">
              <div className="h-9 w-9 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-amber-400 transition-colors" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-100">
              {highlights.card3Title}
            </h3>
            <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
              {highlights.card3Desc}
            </p>
          </div>
        </div>
      </div>

      {/* Compliance & System Architecture Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Module State */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 dark:bg-[#0D1B2A]/40 p-6 backdrop-blur-md">
          <div className="flex items-center gap-2 text-cyan-400">
            <Cpu className="h-5 w-5" />
            <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-200">
              {t.section.moduleStatusTitle}
            </h3>
          </div>

          <div className="mt-5 space-y-3.5 text-xs sm:text-sm text-slate-400">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <span>{t.section.sectionKey}:</span>
              <span className="font-mono text-cyan-300 font-semibold uppercase">
                {activeSection}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <span>{t.section.languageMode}:</span>
              <span className="font-medium text-slate-200">
                {language === "hi" ? "हिन्दी (Hindi)" : "English (अंग्रेज़ी)"}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <span>{t.section.streamState}:</span>
              <span className="font-medium text-amber-400">
                {t.section.streamStateValue}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span>{t.section.authAndDb}:</span>
              <span className="font-medium text-emerald-400">
                {t.section.authAndDbValue}
              </span>
            </div>
          </div>
        </div>

        {/* SIH Compliance Note */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 dark:bg-[#0D1B2A]/40 p-6 backdrop-blur-md">
          <div className="flex items-center gap-2 text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
            <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-200">
              {t.section.architectureTitle}
            </h3>
          </div>

          <p className="mt-4 text-xs sm:text-sm leading-relaxed text-slate-400">
            {t.section.readinessDescription}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-slate-800/70 px-2.5 py-1 text-[11px] font-medium text-slate-300">
              ✓ No Mock Data
            </span>
            <span className="rounded-lg bg-slate-800/70 px-2.5 py-1 text-[11px] font-medium text-slate-300">
              ✓ 10 Accurate Coordinates
            </span>
            <span className="rounded-lg bg-slate-800/70 px-2.5 py-1 text-[11px] font-medium text-slate-300">
              ✓ Bilingual Dictionaries
            </span>
            <span className="rounded-lg bg-slate-800/70 px-2.5 py-1 text-[11px] font-medium text-slate-300">
              ✓ SSR Hydration Protected
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

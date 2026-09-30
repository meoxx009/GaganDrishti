"use client";

import React, { useState } from "react";
import {
  CloudRain,
  Zap,
  Sun,
  Wind,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Flame,
  ShieldCheck,
  ChevronRight,
  Info,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import {
  EMERGENCY_TOPICS,
  EmergencyTopic,
  EmergencyCategory,
} from "@/lib/emergency/emergencyData";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  CloudRain: <CloudRain className="h-6 w-6 text-cyan-400" />,
  Zap: <Zap className="h-6 w-6 text-amber-400" />,
  Sun: <Sun className="h-6 w-6 text-rose-400" />,
  Wind: <Wind className="h-6 w-6 text-blue-400" />,
};

export const EmergencyPrecautions: React.FC = () => {
  const { language } = useApp();
  const [selectedCat, setSelectedCat] = useState<EmergencyCategory>("heavy_rain");

  const activeTopic =
    EMERGENCY_TOPICS.find((t) => t.id === selectedCat) || EMERGENCY_TOPICS[0];
  const prec = language === "hi" ? activeTopic.hi : activeTopic.en;

  return (
    <div className="space-y-6">
      {/* 1. Category Switcher Tabs (Touch-friendly >= 44px) */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-[#F8FAFC] tracking-tight flex items-center gap-2.5 px-1 mb-3">
          <AlertTriangle className="h-6 w-6 text-amber-500" />
          <span>
            {language === "hi"
              ? "आपदा-वार तत्काल सुरक्षा निर्देश एवं सावधानियां"
              : "Disaster-Specific Emergency Action Protocols"}
          </span>
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {EMERGENCY_TOPICS.map((topic: EmergencyTopic) => {
            const isSelected = selectedCat === topic.id;
            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => setSelectedCat(topic.id)}
                className={`flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl border text-left transition-all min-h-[56px] ${
                  isSelected
                    ? "border-sky-300 bg-sky-50 dark:bg-[#0B1A28] dark:border-sky-500/60 shadow-xs"
                    : "border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#080E14] hover:bg-slate-50 dark:hover:bg-[#0E1821] hover:border-slate-300 dark:hover:border-slate-700/80"
                }`}
              >
                <div className="shrink-0">
                  {CATEGORY_ICONS[topic.iconName]}
                </div>
                <div className="min-w-0">
                  <span className="block text-xs sm:text-sm font-extrabold text-slate-900 dark:text-[#F8FAFC] truncate">
                    {language === "hi" ? topic.titleHi : topic.titleEn}
                  </span>
                  <span className="block text-[10px] font-bold text-slate-500 dark:text-[#7F91A3] uppercase tracking-wider">
                    {topic.badgeLevel} RISK
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Active Category Detailed Card */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#080E14] p-6 sm:p-8 shadow-xs space-y-6">
        {/* Header of Active Category */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-5">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20">
              {CATEGORY_ICONS[activeTopic.iconName]}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-[#F8FAFC]">
                  {language === "hi" ? activeTopic.titleHi : activeTopic.titleEn}
                </h3>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-black uppercase tracking-wider ${
                    activeTopic.badgeLevel === "SEVERE"
                      ? "bg-rose-50 dark:bg-rose-500/20 text-rose-800 dark:text-rose-400 border border-rose-200 dark:border-rose-500/40"
                      : activeTopic.badgeLevel === "HIGH"
                      ? "bg-amber-50 dark:bg-amber-500/20 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-500/40"
                      : "bg-sky-50 dark:bg-sky-500/20 text-sky-800 dark:text-sky-400 border border-sky-200 dark:border-sky-500/40"
                  }`}
                >
                  {language === "hi" ? activeTopic.severityLabelHi : activeTopic.severityLabelEn}
                </span>
              </div>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-[#CBD5E1] max-w-2xl leading-relaxed">
                {language === "hi" ? activeTopic.summaryHi : activeTopic.summaryEn}
              </p>
            </div>
          </div>
        </div>

        {/* 3. Immediate Life-Saving Action Summary (Large Highlighted Box) */}
        <div className="rounded-2xl border border-rose-200 dark:border-rose-500/40 bg-rose-50/40 dark:bg-[#12090C] p-5 space-y-3">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-rose-800 dark:text-rose-300">
              {language === "hi"
                ? "तत्काल जीवनरक्षक नियम (Immediate Survival Rules)"
                : "Immediate Life-Saving Survival Rules"}
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {prec.criticalTips.map((tip, index) => (
              <div
                key={index}
                className="rounded-xl border border-rose-200 dark:border-rose-500/20 bg-white dark:bg-[#060C12] p-3.5 text-xs text-slate-800 dark:text-rose-100/90 leading-relaxed flex items-start gap-2.5"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-500/30 text-rose-700 dark:text-rose-300 font-mono text-[10px] font-bold mt-0.5">
                  {index + 1}
                </span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Actionable Dos & Don'ts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Actionable Dos (क्या करें) */}
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/40 dark:bg-[#08140E] p-5 space-y-3.5">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 border-b border-emerald-200 dark:border-emerald-500/20 pb-2.5">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                {language === "hi" ? "क्या करें (Actionable DOs)" : "What You Should Do (DOs)"}
              </h4>
            </div>

            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 dark:text-[#CBD5E1]">
              {prec.doList.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 mt-2 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Critical Don'ts (क्या न करें) */}
          <div className="rounded-2xl border border-rose-200 dark:border-rose-500/30 bg-rose-50/40 dark:bg-[#14080A] p-5 space-y-3.5">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 border-b border-rose-200 dark:border-rose-500/20 pb-2.5">
              <XCircle className="h-5 w-5 shrink-0" />
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-rose-800 dark:text-rose-300">
                {language === "hi" ? "क्या न करें (Critical DON'Ts)" : "What You Must Avoid (DON'Ts)"}
              </h4>
            </div>

            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 dark:text-[#CBD5E1]">
              {prec.dontList.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 dark:bg-rose-400 mt-2 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

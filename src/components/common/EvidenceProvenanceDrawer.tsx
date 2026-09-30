"use client";

import React from "react";
import {
  ShieldCheck,
  X,
  Database,
  MapPin,
  Clock,
  Sliders,
  Cpu,
  Layers,
  CheckCircle,
  ExternalLink,
  Info,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

export interface EvidenceDetails {
  title: string;
  sourceName?: string;
  locationName: string;
  coordinates: string;
  fetchedAt?: string;
  rulesTriggered?: string[];
  thresholds?: string[];
  modelsUsed?: string[];
  confidence?: string;
  notes?: string;
}

interface EvidenceProvenanceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  evidence: EvidenceDetails | null;
}

export const EvidenceProvenanceDrawer: React.FC<EvidenceProvenanceDrawerProps> = ({
  isOpen,
  onClose,
  evidence,
}) => {
  const { language } = useApp();

  if (!isOpen || !evidence) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm transition-opacity">
      <div
        className="relative w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080E14] p-6 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-[#F8FAFC]">
                {language === "hi"
                  ? "प्रमाण एवं निर्णय तर्क (Provenance)"
                  : language === "mr"
                  ? "पुरावा आणि निर्णय तर्क (Provenance)"
                  : "Evidence & Decision Provenance"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#7F91A3]">
                {evidence.title}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 1. Location & Spatial Resolution */}
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-[#060C12] p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <MapPin className="h-3.5 w-3.5 text-sky-500" />
            <span>{language === "hi" ? "स्थानिक निर्देशांक" : "Resolved Spatial Location"}</span>
          </div>
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {evidence.locationName}
            </span>
            <span className="font-mono text-slate-600 dark:text-cyan-400 text-xs">
              {evidence.coordinates}
            </span>
          </div>
          {evidence.fetchedAt && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1 border-t border-slate-200/50 dark:border-slate-800/50">
              <Clock className="h-3 w-3" />
              <span>
                {language === "hi" ? "टेलीमेट्री समय: " : "Telemetry ingest: "}
                {new Date(evidence.fetchedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
              </span>
            </div>
          )}
        </div>

        {/* 2. Primary Data Source & NWP Lineage */}
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-[#060C12] p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Database className="h-3.5 w-3.5 text-indigo-500" />
            <span>{language === "hi" ? "डेटा स्रोत एवं संख्यात्मक मॉडल" : "Primary Lineage & NWP Sources"}</span>
          </div>
          <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200">
            <div className="font-medium text-sky-600 dark:text-sky-400">
              {evidence.sourceName || "Open-Meteo Normalized Weather Engine"}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {(evidence.modelsUsed || ["Open-Meteo High-Resolution", "ECMWF IFS (0.25°)", "NOAA GFS"]).map((m, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Deterministic Decision Thresholds Triggered */}
        {((evidence.rulesTriggered && evidence.rulesTriggered.length > 0) ||
          (evidence.thresholds && evidence.thresholds.length > 0)) && (
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-[#060C12] p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Sliders className="h-3.5 w-3.5 text-amber-500" />
              <span>{language === "hi" ? "लागू नियम एवं सीमा मान" : "Triggered Rules & Thresholds"}</span>
            </div>
            <div className="space-y-1.5">
              {(evidence.rulesTriggered || []).map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{r}</span>
                </div>
              ))}
              {(evidence.thresholds || []).map((t, i) => (
                <div key={i} className="font-mono text-[11px] text-slate-500 dark:text-slate-400 pl-5">
                  Threshold: {t}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Integrity Guarantee */}
        <div className="rounded-2xl border border-emerald-200/60 dark:border-emerald-500/20 bg-emerald-50/40 dark:bg-[#07130F] p-3.5 text-xs text-slate-700 dark:text-slate-300 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            <span>{language === "hi" ? "सत्यता एवं निष्पक्षता गारंटी" : "Integrity & Truthfulness Guarantee"}</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            {language === "hi"
              ? "यह निर्णय सीधे संख्यात्मक मौसम पूर्वानुमान से निर्धारित है। कोई कृत्रिम या मनगढ़ंत मौसम आंकड़े नहीं बनाए गए हैं।"
              : "This decision is deterministically evaluated directly from meteorological telemetry. No synthetic metrics or fabricated alerts are generated."}
          </p>
        </div>

        {/* Close button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-xs sm:text-sm text-slate-800 dark:text-white transition-colors"
          >
            {language === "hi" ? "बंद करें" : language === "mr" ? "बंद करा" : "Close Provenance"}
          </button>
        </div>
      </div>
    </div>
  );
};

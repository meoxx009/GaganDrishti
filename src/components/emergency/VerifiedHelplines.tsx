"use client";

import React, { useState } from "react";
import { Phone, PhoneCall, Copy, Check, Shield, AlertTriangle } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { OFFICIAL_HELPLINES, OfficialHelpline } from "@/lib/emergency/emergencyData";

export const VerifiedHelplines: React.FC = () => {
  const { language } = useApp();
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  const handleCopy = (num: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(num);
      setCopiedNumber(num);
      setTimeout(() => setCopiedNumber(null), 2000);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <PhoneCall className="h-6 w-6 text-rose-500" />
            <span>
              {language === "hi"
                ? "सत्यापित राष्ट्रीय आपदा एवं आपातकालीन नंबर"
                : "Verified National Emergency & Disaster Helplines"}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {language === "hi"
              ? "भारत सरकार द्वारा अधिकृत 24x7 निःशुल्क (टोल-फ्री) आपातकालीन संपर्क।"
              : "Official Government of India 24x7 toll-free emergency response networks."}
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-400">
          <Shield className="h-3.5 w-3.5" />
          <span>{language === "hi" ? "100% आधिकारिक नंबर" : "100% Official Verified"}</span>
        </div>
      </div>

      {/* Grid of Helpline Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {OFFICIAL_HELPLINES.map((helpline: OfficialHelpline) => {
          const isCopied = copiedNumber === helpline.number;
          const isPrimary = helpline.number === "112" || helpline.number === "1078";

          return (
            <div
              key={helpline.number}
              className={`relative overflow-hidden rounded-3xl border p-5 sm:p-6 transition-all duration-200 flex flex-col justify-between backdrop-blur-md shadow-lg ${
                isPrimary
                  ? "border-rose-500/50 bg-gradient-to-br from-rose-950/40 via-[#0D1B2A]/90 to-slate-950/90 hover:border-rose-400/80"
                  : "border-slate-800 bg-gradient-to-br from-slate-900/80 via-[#0D1B2A]/70 to-slate-950/80 hover:border-cyan-500/50"
              }`}
            >
              <div>
                {/* Top Badge & Number Header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-3xl sm:text-4xl font-black tracking-tight text-white">
                      {helpline.number}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                        isPrimary
                          ? "bg-rose-500 text-slate-950"
                          : "bg-slate-800 text-cyan-300 border border-slate-700"
                      }`}
                    >
                      24×7 Active
                    </span>
                  </div>

                  <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                    {language === "hi" ? "टोल-फ्री" : "Toll-Free"}
                  </span>
                </div>

                {/* Title & Agency */}
                <div className="mt-3">
                  <h3 className="text-base font-bold text-slate-100">
                    {language === "hi" ? helpline.nameHi : helpline.nameEn}
                  </h3>
                  <p className="text-[11px] font-semibold text-cyan-400 mt-0.5">
                    {language === "hi" ? helpline.agencyHi : helpline.agencyEn}
                  </p>
                </div>

                {/* Description */}
                <p className="mt-2.5 text-xs text-slate-300 dark:text-slate-400 leading-relaxed">
                  {language === "hi" ? helpline.descHi : helpline.descEn}
                </p>
              </div>

              {/* Action Buttons: Call & Copy (Large Touch Targets >= 44px) */}
              <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center gap-2.5">
                <a
                  href={`tel:${helpline.number}`}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs sm:text-sm h-12 shadow-md shadow-rose-600/30 transition-all active:scale-[0.98]"
                  title={`Call ${helpline.number}`}
                >
                  <Phone className="h-4 w-4" />
                  <span>
                    {language === "hi" ? `कॉल करें ${helpline.number}` : `Call ${helpline.number}`}
                  </span>
                </a>

                <button
                  type="button"
                  onClick={() => handleCopy(helpline.number)}
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-all shrink-0 ${
                    isCopied
                      ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                      : "border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white hover:border-slate-600 active:scale-[0.98]"
                  }`}
                  title={language === "hi" ? "नंबर कॉपी करें" : "Copy number"}
                >
                  {isCopied ? (
                    <Check className="h-4 w-4 text-emerald-400 animate-bounce" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

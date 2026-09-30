"use client";

import React, { useState } from "react";
import { Phone, PhoneCall, Copy, Check, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { OFFICIAL_HELPLINES, OfficialHelpline } from "@/lib/emergency/emergencyData";

export const VerifiedHelplines: React.FC = () => {
  const { language } = useApp();
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleCopy = (num: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(num);
      setCopiedNumber(num);
      setToastMessage(
        language === "hi"
          ? `नंबर ${num} क्लिपबोर्ड पर कॉपी हो गया`
          : `Helpline ${num} copied to clipboard`
      );
      setTimeout(() => {
        setCopiedNumber(null);
        setToastMessage(null);
      }, 2500);
    }
  };

  return (
    <div className="space-y-4 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl border border-sky-500/40 bg-slate-900/95 px-4 py-3 text-xs font-semibold text-sky-200 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400">
            <PhoneCall className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {language === "hi"
                ? "राष्ट्रीय आपदा एवं आपातकालीन हेल्पलाइन"
                : "National Emergency & Disaster Helplines"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === "hi"
                ? "भारत सरकार द्वारा संचालित अधिकृत संपर्क नंबर"
                : "Standard toll-free Government of India emergency response services"}
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full bg-slate-100 dark:bg-[#080E14] border border-slate-200 dark:border-slate-800/80 px-3 py-1 text-xs font-medium text-slate-600 dark:text-[#CBD5E1]">
          <ShieldCheck className="h-3.5 w-3.5 text-sky-500" />
          <span>{language === "hi" ? "सत्यापित संपर्क" : "Verified Directory"}</span>
        </div>
      </div>

      {/* Grid of Helpline Cards (Responsive 3-col on lg, 2-col on md, 1-col on mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {OFFICIAL_HELPLINES.map((helpline: OfficialHelpline) => {
          const isCopied = copiedNumber === helpline.number;
          const isPrimary = helpline.number === "112" || helpline.number === "1078";

          return (
            <div
              key={helpline.number}
              className={`rounded-2xl border p-4 sm:p-5 transition-all duration-200 flex flex-col justify-between shadow-2xs ${
                isPrimary
                  ? "border-sky-300 dark:border-sky-500/40 bg-white dark:bg-[#080E14] hover:border-sky-400 dark:hover:bg-[#0B1219]"
                  : "border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#080E14] hover:border-slate-300 dark:hover:border-slate-700/80 dark:hover:bg-[#0B1219]"
              }`}
            >
              <div>
                {/* Top Badge & Number Header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
                      {helpline.number}
                    </span>
                    {isPrimary && (
                      <span className="rounded-md bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 px-2 py-0.5 text-[10px] font-semibold text-sky-800 dark:text-sky-300">
                        {language === "hi" ? "प्राथमिक" : "Primary"}
                      </span>
                    )}
                  </div>

                  <span className="rounded-full bg-[#F8FAFC] dark:bg-[#0B1219] border border-slate-200 dark:border-slate-800 px-2.5 py-0.5 text-[10px] font-medium text-slate-600 dark:text-[#CBD5E1]">
                    {language === "hi" ? "टोल-फ्री" : "Toll-Free"}
                  </span>
                </div>

                {/* Title & Agency */}
                <div className="mt-3">
                  <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
                    {language === "hi" ? helpline.nameHi : helpline.nameEn}
                  </h3>
                  <p className="text-[11px] font-medium text-sky-700 dark:text-sky-400 mt-0.5">
                    {language === "hi" ? helpline.agencyHi : helpline.agencyEn}
                  </p>
                </div>

                {/* Description */}
                <p className="mt-2 text-xs text-slate-600 dark:text-[#7F91A3] leading-relaxed line-clamp-3">
                  {language === "hi" ? helpline.descHi : helpline.descEn}
                </p>
              </div>

              {/* Action Buttons: Call & Copy */}
              <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
                <a
                  href={`tel:${helpline.number}`}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-semibold text-xs h-10 px-3 shadow-xs transition-colors"
                  title={`Call ${helpline.number}`}
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>
                    {language === "hi" ? `कॉल ${helpline.number}` : `Call ${helpline.number}`}
                  </span>
                </a>

                <button
                  type="button"
                  onClick={() => handleCopy(helpline.number)}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all shrink-0 ${
                    isCopied
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "border-slate-200 dark:border-slate-700/80 bg-[#F8FAFC] dark:bg-[#060C12] text-slate-600 dark:text-[#CBD5E1] hover:text-slate-900 dark:hover:text-[#F8FAFC] hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                  title={language === "hi" ? "नंबर कॉपी करें" : "Copy number"}
                >
                  {isCopied ? (
                    <Check className="h-4 w-4 text-emerald-500 animate-bounce" />
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

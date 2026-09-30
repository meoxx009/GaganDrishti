"use client";

import React from "react";
import Link from "next/link";
import { Radio, ArrowLeft, Activity, Sprout } from "lucide-react";
import { useApp } from "@/context/AppContext";

export const ShellHeaderMinimal: React.FC = () => {
  const { language, setLanguage } = useApp();

  return (
    <header className="border-b border-slate-200 dark:border-slate-800/60 bg-white/95 dark:bg-[#05090D]/95 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>{language === "hi" ? "मुख्य डैशबोर्ड" : "Main App"}</span>
        </Link>

        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
            <Sprout className="h-4 w-4" />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white block">
              GaganDrishti
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block -mt-0.5">
              {language === "hi" ? "किसान ग्राउंड-ट्रुथ फीडबैक लूप" : "Farmer Feedback System"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <Link
          href="/feedback-analytics"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080E14] px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-sky-500 transition-colors"
        >
          <Activity className="h-3.5 w-3.5 text-sky-500" />
          <span className="hidden sm:inline">{language === "hi" ? "एनालिटिक्स" : "Analytics"}</span>
        </Link>

        <button
          type="button"
          onClick={() => setLanguage(language === "hi" ? "en" : "hi")}
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080E14] px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          {language === "hi" ? "EN" : "हिन्दी"}
        </button>
      </div>
    </header>
  );
};

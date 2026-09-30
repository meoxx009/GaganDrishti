"use client";

import React from "react";
import { Sun, Moon, Globe, Radio, RefreshCw, Database } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useWeather } from "@/context/WeatherContext";
import { CitySelector } from "./CitySelector";
import { ISTClock } from "./ISTClock";
import { DataFreshnessBadge } from "./common/DataFreshnessBadge";

export const Header: React.FC = () => {
  const { language, setLanguage, theme, toggleTheme, t } = useApp();
  const { weather, isRefreshing, refreshWeather } = useWeather();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800/40 bg-white/95 dark:bg-[#05090D]/95 backdrop-blur-xl transition-colors">
      <div className="mx-auto flex w-full items-center justify-between px-4 py-3 sm:px-6 lg:px-8 gap-3">
        {/* Left Area: Mobile Brand & Badge + City Selector */}
        <div className="flex items-center gap-3">
          {/* Mobile Only Brand Icon */}
          <div className="flex lg:hidden items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600 text-white dark:bg-[#0B1A28] dark:border dark:border-sky-500/30 dark:text-sky-400 shadow-xs">
              <Radio className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC] leading-tight">
                {t.brand.title}
              </span>
              <span className="text-[10px] font-medium text-slate-500 dark:text-sky-400 leading-tight">
                {t.brand.sub}
              </span>
            </div>
          </div>

          {/* Global City Selector */}
          <CitySelector />
        </div>

        {/* Center/Right Area: Live Feeds Status, IST Clock, Language Toggle, Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Weather Status Indicator (Desktop/Tablet) */}
          <div className="hidden md:flex items-center">
            <DataFreshnessBadge
              timestamp={weather?.fetchedAt}
              sourceName="Open-Meteo"
              onRefresh={() => refreshWeather(true)}
              isRefreshing={isRefreshing}
            />
          </div>

          {/* Live IST Clock */}
          <ISTClock />

          {/* Language Switch: English / हिन्दी / मराठी */}
          <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800/50 bg-[#F8FAFC] dark:bg-[#080E14] p-0.5">
            <button
              onClick={() => setLanguage("en")}
              type="button"
              className={`rounded-lg px-2 sm:px-2.5 py-1 text-xs font-semibold transition-all ${
                language === "en"
                  ? "bg-white text-slate-900 border border-slate-200/80 shadow-2xs dark:bg-[#0B1A28] dark:text-sky-300 dark:border-sky-500/40"
                  : "text-slate-500 dark:text-[#7F91A3] hover:text-slate-900 dark:hover:text-[#F8FAFC]"
              }`}
              title="Switch to English"
            >
              EN
            </button>
            <button
              onClick={() => setLanguage("hi")}
              type="button"
              className={`rounded-lg px-2 sm:px-2.5 py-1 text-xs font-semibold transition-all ${
                language === "hi"
                  ? "bg-white text-slate-900 border border-slate-200/80 shadow-2xs dark:bg-[#0B1A28] dark:text-sky-300 dark:border-sky-500/40"
                  : "text-slate-500 dark:text-[#7F91A3] hover:text-slate-900 dark:hover:text-[#F8FAFC]"
              }`}
              title="हिंदी में बदलें"
            >
              हिन्दी
            </button>
            <button
              onClick={() => setLanguage("mr")}
              type="button"
              className={`rounded-lg px-2 sm:px-2.5 py-1 text-xs font-semibold transition-all ${
                language === "mr"
                  ? "bg-white text-slate-900 border border-slate-200/80 shadow-2xs dark:bg-[#0B1A28] dark:text-sky-300 dark:border-sky-500/40"
                  : "text-slate-500 dark:text-[#7F91A3] hover:text-slate-900 dark:hover:text-[#F8FAFC]"
              }`}
              title="मराठीत बदला"
            >
              मराठी
            </button>
          </div>

          {/* Minimal Theme Toggle: Dark / Light Mode */}
          <button
            onClick={toggleTheme}
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#080E14] text-slate-600 hover:text-slate-900 dark:text-[#CBD5E1] dark:hover:text-[#F8FAFC] hover:border-slate-300 dark:hover:bg-[#0B1219] transition-all shadow-2xs"
            title={
              theme === "dark"
                ? language === "hi"
                  ? "लाइट मोड चालू करें"
                  : "Switch to Light Mode"
                : language === "hi"
                ? "डार्क मोड चालू करें"
                : "Switch to Dark Mode"
            }
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-amber-400 transition-transform duration-200 hover:rotate-45" />
            ) : (
              <Moon className="h-4 w-4 text-slate-600 transition-transform duration-200 hover:-rotate-12" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

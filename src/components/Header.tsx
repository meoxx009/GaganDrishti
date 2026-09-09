"use client";

import React from "react";
import { Sun, Moon, Globe, Radio, RefreshCw, Database } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useWeather } from "@/context/WeatherContext";
import { CitySelector } from "./CitySelector";
import { ISTClock } from "./ISTClock";

export const Header: React.FC = () => {
  const { language, setLanguage, theme, toggleTheme, t } = useApp();
  const { weather, isRefreshing, refreshWeather } = useWeather();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-700/40 bg-slate-900/85 dark:bg-[#07111F]/85 backdrop-blur-xl transition-colors">
      <div className="mx-auto flex w-full items-center justify-between px-4 py-3 sm:px-6 lg:px-8 gap-3">
        {/* Left Area: Mobile Brand & Badge + City Selector */}
        <div className="flex items-center gap-3">
          {/* Mobile Only Brand Icon */}
          <div className="flex lg:hidden items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-600 text-white shadow-md">
              <Radio className="h-5 w-5 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                {t.brand.title}
              </span>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                {t.brand.badge}
              </span>
            </div>
          </div>

          {/* Global City Selector */}
          <CitySelector />
        </div>

        {/* Center/Right Area: Live Feeds Status, IST Clock, Language Toggle, Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Weather Status Indicator (Desktop/Tablet) */}
          <div className="hidden md:flex items-center gap-2 rounded-xl border border-slate-700/60 bg-slate-800/40 dark:bg-slate-900/80 px-2.5 py-1 text-xs">
            <div className="flex items-center gap-1.5 text-cyan-400">
              <Database className="h-3.5 w-3.5 text-cyan-400" />
              <span className="font-semibold text-[11px]">Open-Meteo</span>
            </div>
            <span className="text-slate-500">•</span>
            {weather?.isCached ? (
              <span className="text-[11px] font-medium text-amber-400">
                {language === "hi" ? "कैश्ड" : "Cached"}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>{language === "hi" ? "लाइव" : "Live"}</span>
              </span>
            )}
            <button
              onClick={() => refreshWeather(true)}
              disabled={isRefreshing}
              className="ml-1 rounded-md p-1 text-slate-400 hover:text-white transition-colors disabled:opacity-40"
              title={language === "hi" ? "रिफ्रेश करें" : "Refresh Telemetry"}
            >
              <RefreshCw
                className={`h-3 w-3 ${
                  isRefreshing ? "animate-spin text-cyan-400" : ""
                }`}
              />
            </button>
          </div>

          {/* Live IST Clock */}
          <ISTClock />

          {/* Language Switch: English / हिन्दी */}
          <div className="flex items-center rounded-xl border border-slate-700/60 bg-slate-800/40 dark:bg-slate-900/80 p-0.5">
            <button
              onClick={() => setLanguage("en")}
              type="button"
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                language === "en"
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Switch to English"
            >
              EN
            </button>
            <button
              onClick={() => setLanguage("hi")}
              type="button"
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                language === "hi"
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="हिंदी में बदलें"
            >
              हिन्दी
            </button>
          </div>

          {/* Dark / Light Mode Switch */}
          <button
            onClick={toggleTheme}
            type="button"
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-slate-700/60 bg-slate-800/40 dark:bg-slate-900/80 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/50 transition-all"
            title={`${t.header.toggleTheme} (${
              theme === "dark" ? t.header.lightMode : t.header.darkMode
            })`}
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-500 hover:-rotate-12 transition-transform" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

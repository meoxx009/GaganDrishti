"use client";

import React from "react";
import { Sun, Moon, Globe, Radio } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { CitySelector } from "./CitySelector";
import { ISTClock } from "./ISTClock";

export const Header: React.FC = () => {
  const { language, setLanguage, theme, toggleTheme, t } = useApp();

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
          <div className="hidden md:flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-600 dark:text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium">{t.header.liveFeeds}</span>
            <span className="opacity-60">•</span>
            <span className="font-semibold">{t.header.systemActive}</span>
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

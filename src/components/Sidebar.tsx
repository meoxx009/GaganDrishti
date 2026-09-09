"use client";

import React from "react";
import {
  Users,
  Sprout,
  AlertTriangle,
  Bot,
  ShieldAlert,
  Radio,
  Sparkles,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { NavSection } from "@/lib/types";

export const Sidebar: React.FC = () => {
  const { activeSection, setActiveSection, language, t } = useApp();

  const navItems: Array<{
    id: NavSection;
    icon: React.ReactNode;
    isEmergency?: boolean;
  }> = [
    {
      id: "citizen",
      icon: <Users className="h-5 w-5" />,
    },
    {
      id: "farmer",
      icon: <Sprout className="h-5 w-5" />,
    },
    {
      id: "alerts",
      icon: <AlertTriangle className="h-5 w-5" />,
    },
    {
      id: "ask",
      icon: <Bot className="h-5 w-5" />,
    },
    {
      id: "emergency",
      icon: <ShieldAlert className="h-5 w-5" />,
      isEmergency: true,
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 xl:w-72 shrink-0 border-r border-slate-700/40 bg-slate-900/90 dark:bg-[#0D1B2A]/90 backdrop-blur-xl p-4 min-h-screen">
      {/* Brand & Prototype Info */}
      <div className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-slate-800">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
          <Radio className="h-6 w-6 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              {t.brand.title}
            </span>
            <span className="text-xs font-semibold text-cyan-500 dark:text-cyan-400">
              {t.brand.sub}
            </span>
          </div>
          <div className="mt-1">
            <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              {t.brand.badge}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Title */}
      <div className="px-3 mb-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
          {language === "hi" ? "मौसम आसूचना मॉड्यूल" : "Meteorological Modules"}
        </span>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-1.5" aria-label="Sidebar Navigation">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          const info = t.navigation[item.id];

          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              type="button"
              className={`w-full group flex items-start gap-3 rounded-2xl p-3 text-left transition-all duration-200 ${
                isActive
                  ? item.isEmergency
                    ? "bg-rose-500/15 border border-rose-500/40 text-rose-300 shadow-md shadow-rose-950/20"
                    : "bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 shadow-md shadow-cyan-950/20"
                  : item.isEmergency
                  ? "text-rose-400 hover:bg-rose-950/30 border border-transparent"
                  : "text-slate-400 hover:bg-slate-800/60 dark:hover:bg-slate-800/50 hover:text-slate-100 border border-transparent"
              }`}
            >
              <div
                className={`mt-0.5 rounded-xl p-2 transition-colors ${
                  isActive
                    ? item.isEmergency
                      ? "bg-rose-500/20 text-rose-300"
                      : "bg-cyan-500/20 text-cyan-300"
                    : item.isEmergency
                    ? "bg-rose-950/40 text-rose-400"
                    : "bg-slate-800 text-slate-400 group-hover:text-slate-200"
                }`}
              >
                {item.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold tracking-tight">
                    {info.label}
                  </span>
                  <span className="text-[10px] font-medium opacity-60">
                    {info.sub}
                  </span>
                </div>
                <p className="mt-1 text-xs line-clamp-2 leading-relaxed opacity-70">
                  {info.desc}
                </p>
              </div>
            </button>
          );
        })}
      </nav>

      {/* System Status Card */}
      <div className="mt-auto pt-4 border-t border-slate-800/80">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-slate-300">
                {t.header.liveFeeds}: {t.header.systemActive}
              </span>
            </div>
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          </div>
          <p className="mt-1.5 text-[11px] text-slate-400 leading-tight">
            {language === "hi"
              ? "आईएमडी रडार और मौसम उपग्रह कनेक्टिविटी हेतु तत्पर।"
              : "Synchronized for IMD radar & meteorological telemetry feeds."}
          </p>
        </div>
      </div>
    </aside>
  );
};

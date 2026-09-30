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
  TrendingUp,
  BookOpen,
  Activity,
  Compass,
  Smartphone,
  MapPin,
  Landmark,
  GraduationCap,
  Zap,
  Database,
  ImageIcon,
  Settings,
  Award,
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
      id: "climate",
      icon: <TrendingUp className="h-5 w-5" />,
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
    {
      id: "resources",
      icon: <BookOpen className="h-5 w-5" />,
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 xl:w-72 shrink-0 border-r border-slate-200 dark:border-slate-800/40 bg-[#F7F9FC] dark:bg-[#05090D] p-4 min-h-screen">
      {/* Brand & Subtitle */}
      <div className="flex items-center gap-3 px-2 py-3 mb-5 border-b border-slate-200/80 dark:border-slate-800/50">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600 text-white dark:bg-[#0B1A28] dark:border dark:border-sky-500/30 dark:text-sky-400 shadow-xs">
          <Radio className="h-4 w-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
              {t.brand.title}
            </span>
          </div>
          <p className="text-[11px] font-medium text-slate-500 dark:text-sky-400">
            {t.brand.sub}
          </p>
        </div>
      </div>

      {/* Navigation Title */}
      <div className="px-3 mb-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-[#7F91A3]">
          {language === "hi" ? "मौसम मॉड्यूल" : "Weather Modules"}
        </span>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-1" aria-label="Sidebar Navigation">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          const info = t.navigation[item.id];

          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              type="button"
              className={`w-full group flex items-center gap-3 rounded-xl p-2.5 text-left transition-all duration-150 ${
                isActive
                  ? item.isEmergency
                    ? "bg-rose-50 border border-rose-200 text-rose-800 shadow-2xs dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-300"
                    : "bg-sky-50/80 border border-sky-200 text-sky-800 shadow-2xs dark:bg-[#0B1A28] dark:border-sky-500/30 dark:text-sky-300"
                  : item.isEmergency
                  ? "text-rose-700/80 hover:bg-rose-50 hover:text-rose-900 border border-transparent dark:text-rose-400/80 dark:hover:bg-rose-950/20 dark:hover:text-rose-300"
                  : "text-slate-600 hover:bg-white hover:border-slate-200/80 hover:text-slate-900 border border-transparent dark:text-[#CBD5E1] dark:hover:bg-[#0B1219] dark:hover:text-[#F8FAFC]"
              }`}
            >
              <div
                className={`rounded-lg p-1.5 transition-colors shrink-0 ${
                  isActive
                    ? item.isEmergency
                      ? "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300"
                      : "bg-white text-sky-700 shadow-2xs dark:bg-sky-500/20 dark:text-sky-300"
                    : item.isEmergency
                    ? "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400"
                    : "text-slate-500 dark:text-[#7F91A3] group-hover:text-slate-700 dark:group-hover:text-[#CBD5E1]"
                }`}
              >
                {item.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-[13px] font-semibold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
                    {info.label}
                  </span>
                  <span className="text-[10px] font-normal text-slate-400 dark:text-[#7F91A3]">
                    {info.sub}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Innovation Portals: Government, Travel, SMS, Feedback, Village, Research */}
      <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800/40 space-y-1.5">
        <a
          href="/research"
          className="flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold text-indigo-700 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 shrink-0" />
            <span>{language === "hi" ? "शोध एवं ओपन डेटासेट" : "Research & Open Data"}</span>
          </div>
          <span className="text-[10px] bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 px-1.5 py-0.5 rounded font-bold">100k Data</span>
        </a>

        <a
          href="/admin/district-dashboard"
          className="flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Landmark className="h-4 w-4 shrink-0" />
            <span>{language === "hi" ? "शासकीय जिला डैशबोर्ड" : "Govt District Portal"}</span>
          </div>
          <span className="text-[10px] bg-amber-500/20 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded font-bold">Admin</span>
        </a>

        <a
          href="/admin/cache-statistics"
          className="flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 shrink-0 text-emerald-500" />
            <span>{language === "hi" ? "API कैश गति नियंत्रण" : "API Cache & Speed"}</span>
          </div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded font-bold">2h TTL</span>
        </a>

        <a
          href="/admin/database-indexes"
          className="flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold text-cyan-700 dark:text-cyan-400 bg-cyan-50/70 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-500/20 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 shrink-0 text-cyan-500" />
            <span>{language === "hi" ? "डेटाबेस इंडेक्सिंग व गति" : "DB Indexes & Speed"}</span>
          </div>
          <span className="text-[10px] bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 px-1.5 py-0.5 rounded font-bold">100x</span>
        </a>

        <a
          href="/admin/image-optimization"
          className="flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 shrink-0 text-rose-500" />
            <span>{language === "hi" ? "इमेज कम्प्रेशन व लोडिंग" : "Image Optimization"}</span>
          </div>
          <span className="text-[10px] bg-rose-500/20 text-rose-800 dark:text-rose-300 px-1.5 py-0.5 rounded font-bold">-71%</span>
        </a>

        <a
          href="/admin/errors"
          className="flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500" />
            <span>{language === "hi" ? "त्रुटि निगरानी व लचीलापन" : "Error Monitoring"}</span>
          </div>
          <span className="text-[10px] bg-rose-500/20 text-rose-800 dark:text-rose-300 px-1.5 py-0.5 rounded font-bold">Resilience</span>
        </a>

        <a
          href="/admin/monitoring"
          className="flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold text-cyan-700 dark:text-cyan-400 bg-cyan-50/70 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-500/20 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 shrink-0 text-cyan-500" />
            <span>{language === "hi" ? "सिस्टम मॉनिटरिंग व एनालिटिक्स" : "System Monitoring"}</span>
          </div>
          <span className="text-[10px] bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 px-1.5 py-0.5 rounded font-bold">Health</span>
        </a>

        <a
          href="/admin/pre-launch"
          className="flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 shrink-0 text-emerald-500" />
            <span>{language === "hi" ? "प्री-लॉन्च चेकलिस्ट व साइन-ऑफ" : "Pre-Launch Sign-Off"}</span>
          </div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded font-bold">Ready</span>
        </a>

        <a
          href="/install"
          className="flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 shrink-0 text-emerald-500" />
            <span>{language === "hi" ? "PWA मोबाइल ऐप" : "Install PWA App"}</span>
          </div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded font-bold">PWA</span>
        </a>

        <a
          href="/settings"
          className="flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold text-cyan-700 dark:text-cyan-400 bg-cyan-50/70 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-500/20 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 shrink-0 text-cyan-500" />
            <span>{language === "hi" ? "ऐप सेटिंग्स व डेटा मोड" : "App Settings & Data"}</span>
          </div>
          <span className="text-[10px] bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 px-1.5 py-0.5 rounded font-bold">3G/4G</span>
        </a>

        <a
          href="/travel-routes"
          className="flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold text-blue-700 dark:text-blue-400 bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-500/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
            <span>{language === "hi" ? "मार्ग मौसम सुरक्षा" : "Travel Route Safety"}</span>
          </div>
          <span className="text-[10px] bg-blue-500/20 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-bold">50+ Routes</span>
        </a>

        <a
          href="/sms-feature-phone"
          className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#0B1219] transition-colors"
        >
          <Smartphone className="h-4 w-4 text-purple-500 shrink-0" />
          <span>{language === "hi" ? "SMS फीचर फोन सेवा" : "SMS Feature Phone"}</span>
        </a>

        <a
          href="/village-weather"
          className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#0B1219] transition-colors"
        >
          <MapPin className="h-4 w-4 text-amber-500 shrink-0" />
          <span>{language === "hi" ? "गांव मौसम (पिनकोड)" : "Village Weather"}</span>
        </a>

        <a
          href="/farmer-feedback"
          className="flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Sprout className="h-4 w-4 shrink-0" />
            <span>{language === "hi" ? "किसान फीडबैक फॉर्म" : "Farmer Feedback"}</span>
          </div>
          <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded font-bold">New</span>
        </a>

        <a
          href="/feedback-analytics"
          className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#0B1219] transition-colors"
        >
          <Activity className="h-4 w-4 text-sky-500 shrink-0" />
          <span>{language === "hi" ? "फीडबैक एनालिटिक्स" : "Feedback Analytics"}</span>
        </a>
      </div>

      {/* System Status Card */}
      <div className="mt-auto pt-3">
        <div className="rounded-xl border border-slate-200 bg-white dark:bg-[#060C12] dark:border-slate-800/50 p-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-slate-800 dark:text-[#CBD5E1]">
                {t.header.liveFeeds}: {t.header.systemActive}
              </span>
            </div>
            <Sparkles className="h-3.5 w-3.5 text-sky-500" />
          </div>
          <p className="mt-1 text-[10.5px] text-slate-500 dark:text-[#7F91A3] leading-tight">
            {language === "hi"
              ? "ओपन-मेटियो एवं आईएमडी टेलीमेट्री समकालिक।"
              : "Telemetry synchronized for open meteorological feeds."}
          </p>
        </div>
      </div>
    </aside>

  );
};

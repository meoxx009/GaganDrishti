"use client";

import React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { ProactiveAlertBanner } from "./alerts/ProactiveAlertBanner";
import { SectionShell } from "./SectionShell";
import { MobileNav } from "./MobileNav";
import { FloatingAssistant } from "./assistant/FloatingAssistant";
import { useApp } from "@/context/AppContext";

export const Shell: React.FC = () => {
  const { t, language } = useApp();

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] dark:bg-[#030609] text-slate-900 dark:text-[#F8FAFC] transition-colors">
      {/* Desktop Left Sidebar */}
      <Sidebar />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Top Header */}
        <Header />

        {/* Proactive Weather Severity Banner */}
        <ProactiveAlertBanner />

        {/* Dynamic Section Content */}
        <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <SectionShell />
        </main>

        {/* Application Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800/40 bg-white dark:bg-[#05090D] py-5 text-center text-xs text-slate-500 dark:text-[#7F91A3]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-2">
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              {t.footer.productLine}
            </p>
            {/* Global Informational & IMD Verification Disclaimer */}
            <p className="text-[11px] text-slate-500 dark:text-amber-400/90 font-medium max-w-2xl mx-auto leading-relaxed">
              {t.footer.disclaimer}
            </p>

            {/* Quick Links: Privacy, Help & FAQ, Helpline (FINAL_008) */}
            <div className="flex items-center justify-center gap-4 text-[11px] font-semibold text-slate-600 dark:text-slate-400 pt-1">
              <a href="/help" className="hover:text-cyan-500 transition">
                {language === "hi" ? "📖 उपयोगकर्ता गाइड व FAQ" : "📖 User Manual & FAQ"}
              </a>
              <span>•</span>
              <a href="/privacy" className="hover:text-cyan-500 transition">
                {language === "hi" ? "🔒 गोपनीयता नीति (Privacy)" : "🔒 Privacy Policy"}
              </a>
              <span>•</span>
              <a href="tel:18001801551" className="hover:text-emerald-500 transition font-mono">
                📞 1800-180-1551
              </a>
            </div>

            <p className="text-[10px] text-slate-400 dark:text-slate-500 pt-0.5">
              {t.footer.copyright}
            </p>
          </div>
        </footer>

        {/* Mobile Bottom Navigation */}
        {/* FINAL_006 Step 9: Spacer prevents content hiding behind fixed bottom nav */}
        <div className="mobile-nav-spacer" />
        <MobileNav />

        {/* Global Floating AI Assistant */}
        <FloatingAssistant />
      </div>
    </div>
  );
};

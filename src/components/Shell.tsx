"use client";

import React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { SectionShell } from "./SectionShell";
import { MobileNav } from "./MobileNav";
import { useApp } from "@/context/AppContext";

export const Shell: React.FC = () => {
  const { t } = useApp();

  return (
    <div className="min-h-screen flex bg-[#f8fafc] dark:bg-[#07111F] text-slate-900 dark:text-slate-100 transition-colors">
      {/* Desktop Left Sidebar */}
      <Sidebar />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Top Header */}
        <Header />

        {/* Dynamic Section Content */}
        <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <SectionShell />
        </main>

        {/* Application Footer */}
        <footer className="border-t border-slate-700/40 bg-slate-100 dark:bg-[#0D1B2A]/60 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-1">
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              {t.footer.sihNote}
            </p>
            <p className="text-[11px] text-slate-500">
              {t.footer.techStack}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 pt-1">
              {t.footer.copyright}
            </p>
          </div>
        </footer>

        {/* Mobile Bottom Navigation */}
        <MobileNav />
      </div>
    </div>
  );
};

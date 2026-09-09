"use client";

import React, { useState } from "react";
import { Header } from "./Header";
import { SectionShell } from "./SectionShell";
import { APP_CONFIG, NAV_ITEMS } from "@/lib/constants";
import { NavSection } from "@/lib/types";

export const Shell: React.FC = () => {
  const [activeSection, setActiveSection] = useState<NavSection>("citizen");

  const currentNavItem =
    NAV_ITEMS.find((item) => item.id === activeSection) || NAV_ITEMS[0];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-white">
      {/* Header with Brand, Badge, and Nav Tabs */}
      <Header
        navItems={NAV_ITEMS}
        activeSection={activeSection}
        onSelectSection={setActiveSection}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <SectionShell section={currentNavItem} />
      </main>

      {/* Application Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p>
            {APP_CONFIG.brand} ({APP_CONFIG.brandHindi}) — {APP_CONFIG.badge}
          </p>
          <p className="mt-1 text-slate-600">
            Engineered for Smart India Hackathon (SIH) 2026. Next.js App Router Architecture.
          </p>
        </div>
      </footer>
    </div>
  );
};

import React from "react";
import { CloudSun, Radio } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";
import { NavItem, NavSection } from "@/lib/types";

interface HeaderProps {
  navItems: NavItem[];
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
}

export const Header: React.FC<HeaderProps> = ({
  navItems,
  activeSection,
  onSelectSection,
}) => {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand & Badge */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
            <CloudSun className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white">
                {APP_CONFIG.brand}
              </span>
              <span className="text-xs font-medium text-cyan-400">
                {APP_CONFIG.brandHindi}
              </span>
              <span className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-950/60 px-2.5 py-0.5 text-xs font-semibold text-cyan-300">
                {APP_CONFIG.badge}
              </span>
            </div>
            <p className="hidden text-xs text-slate-400 sm:block">
              {APP_CONFIG.tagline}
            </p>
          </div>
        </div>

        {/* System Status */}
        <div className="hidden items-center gap-2 md:flex">
          <span className="flex h-2 w-2 relative">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <span className="text-xs font-medium text-slate-400">System Ready</span>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="border-t border-slate-800/80 bg-slate-900/50">
        <div className="mx-auto flex max-w-7xl overflow-x-auto px-4 py-2 sm:px-6 lg:px-8 scrollbar-none">
          <nav className="flex space-x-1 sm:space-x-2">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              const isEmergency = item.id === "emergency";

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectSection(item.id)}
                  type="button"
                  className={`group relative flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? isEmergency
                        ? "bg-rose-500/15 text-rose-300 border border-rose-500/40"
                        : "bg-cyan-500/15 text-cyan-300 border border-cyan-500/40"
                      : isEmergency
                      ? "text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 border border-transparent"
                      : "text-slate-300 hover:bg-slate-800/60 hover:text-white border border-transparent"
                  }`}
                >
                  {isEmergency && <Radio className="h-3.5 w-3.5 animate-pulse text-rose-400" />}
                  <span>{item.label}</span>
                  <span className="text-xs opacity-60">({item.hindiLabel})</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};

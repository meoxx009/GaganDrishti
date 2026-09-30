"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Sprout,
  AlertTriangle,
  Bot,
  ShieldAlert,
  TrendingUp,
  BookOpen,
  Settings,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { NavSection } from "@/lib/types";

export const MobileNav: React.FC = () => {
  const { activeSection, setActiveSection, t } = useApp();
  const pathname = usePathname();

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

  const isSettingsActive = pathname === "/settings";

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 dark:border-slate-800/40 bg-white/95 dark:bg-[#05090D]/95 backdrop-blur-xl px-2 py-1.5 safe-area-pb"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          const info = t.navigation[item.id];

          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              type="button"
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl min-h-[48px] min-w-[52px] transition-all ${
                isActive
                  ? item.isEmergency
                    ? "text-rose-400 bg-rose-500/15 border border-rose-500/30"
                    : "text-sky-300 bg-sky-500/15 border border-sky-500/30 dark:bg-[#0B1A28]"
                  : item.isEmergency
                  ? "text-rose-400/80 hover:text-rose-300"
                  : "text-slate-500 dark:text-[#7F91A3] hover:text-slate-900 dark:hover:text-[#F8FAFC]"
              }`}
            >

              <div className="relative">
                {item.icon}
                {isActive && (
                  <span
                    className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
                      item.isEmergency ? "bg-rose-400" : "bg-cyan-400"
                    }`}
                  />
                )}
              </div>
              <span className="text-[10px] font-medium mt-1 truncate max-w-[62px]">
                {info.label}
              </span>
            </button>
          );
        })}

        {/* Settings link — navigates to /settings page (not a section change) */}
        <Link
          href="/settings"
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl min-h-[48px] min-w-[52px] transition-all ${
            isSettingsActive
              ? "text-sky-300 bg-sky-500/15 border border-sky-500/30 dark:bg-[#0B1A28]"
              : "text-slate-500 dark:text-[#7F91A3] hover:text-slate-900 dark:hover:text-[#F8FAFC]"
          }`}
          aria-label="Settings / सेटिंग"
        >
          <div className="relative">
            <Settings className="h-5 w-5" />
            {isSettingsActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400" />
            )}
          </div>
          <span className="text-[10px] font-medium mt-1 truncate max-w-[62px]">
            सेटिंग
          </span>
        </Link>
      </div>
    </nav>
  );
};

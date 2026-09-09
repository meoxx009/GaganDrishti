import React from "react";
import {
  Users,
  Sprout,
  AlertTriangle,
  Bot,
  ShieldAlert,
  Clock,
  Sparkles,
  Info,
} from "lucide-react";
import { NavItem, NavSection } from "@/lib/types";

interface SectionShellProps {
  section: NavItem;
}

const SECTION_ICONS: Record<NavSection, React.ReactNode> = {
  citizen: <Users className="h-6 w-6 text-cyan-400" />,
  farmer: <Sprout className="h-6 w-6 text-emerald-400" />,
  alerts: <AlertTriangle className="h-6 w-6 text-amber-400" />,
  ask: <Bot className="h-6 w-6 text-indigo-400" />,
  emergency: <ShieldAlert className="h-6 w-6 text-rose-400" />,
};

export const SectionShell: React.FC<SectionShellProps> = ({ section }) => {
  return (
    <div className="space-y-6">
      {/* Section Header Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 border border-slate-700">
              {SECTION_ICONS[section.id]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  {section.label}
                </h1>
                <span className="text-sm font-semibold text-slate-400">
                  {section.hindiLabel}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-400">
                {section.description}
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-400">
            <Clock className="h-3.5 w-3.5 text-cyan-400" />
            <span>Ready for Live Data Connection</span>
          </div>
        </div>
      </div>

      {/* Prototype Workspace Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Module Status */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
          <div className="flex items-center gap-2 text-slate-200">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <h2 className="font-semibold text-sm tracking-wide uppercase text-slate-300">
              Module Status / मॉड्यूल स्थिति
            </h2>
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-400">
            <div className="flex justify-between border-b border-slate-800/80 pb-2">
              <span>Section Key:</span>
              <code className="text-cyan-300 font-mono">{section.id}</code>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-2">
              <span>Language Support:</span>
              <span className="text-slate-300">Bilingual (English / हिन्दी)</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-2">
              <span>Data Stream:</span>
              <span className="text-amber-400/90 font-medium">Pending Provider Integration</span>
            </div>
            <div className="flex justify-between">
              <span>Auth & DB:</span>
              <span className="text-emerald-400 font-medium">None Required (Stateless)</span>
            </div>
          </div>
        </div>

        {/* Integration Architecture */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
          <div className="flex items-center gap-2 text-slate-200">
            <Info className="h-4 w-4 text-blue-400" />
            <h2 className="font-semibold text-sm tracking-wide uppercase text-slate-300">
              Architecture Note / वास्तुकला विवरण
            </h2>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            This module is structured for SIH 2026 weather intelligence workflows. In accordance with project constraints, no synthetic/fake weather values or third-party map overlays have been injected. The module shell is prepared for real-time IMD / open meteorology API pipelines.
          </p>
        </div>
      </div>
    </div>
  );
};

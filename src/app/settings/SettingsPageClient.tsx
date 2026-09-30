"use client";

import React, { useState, useEffect } from "react";
import { ShellHeaderMinimal } from "@/components/feedback/ShellHeaderMinimal";
import { useLowBandwidthMode } from "@/lib/lowBandwidth";
import {
  Wifi,
  RefreshCw,
  Sun,
  Info,
  Trash2,
  ChevronRight,
} from "lucide-react";

const HIGH_CONTRAST_KEY = "gagandrishti_high_contrast";
const OFFLINE_QUEUE_KEY = "gagandrishti_offline_submissions";

/** Toggle row for a settings boolean option */
function SettingsToggle({
  label,
  sublabel,
  description,
  checked,
  onChange,
  disabled,
  icon,
}: {
  label: string;
  sublabel: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  icon: React.ReactNode;
}) {
  return (
    <div
      className={`flex items-start gap-4 p-4 rounded-2xl border transition-colors ${
        checked
          ? "bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-700/40"
          : "bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/40"
      } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
    >
      <div className="mt-0.5 text-sky-500">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-slate-900 dark:text-white">
          {label}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{sublabel}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          {description}
        </p>
      </div>
      {/* Toggle switch — min 48px touch target */}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative flex-shrink-0 h-7 w-13 rounded-full border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 min-h-[48px] min-w-[52px] flex items-center justify-center ${
          checked
            ? "bg-sky-500 border-sky-500"
            : "bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600"
        }`}
        style={{ minWidth: 52, minHeight: 48 }}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transform transition-transform ${
            checked ? "translate-x-3" : "-translate-x-3"
          }`}
        />
      </button>
    </div>
  );
}

/**
 * SettingsPageClient (FINAL_006 Step 4)
 * Full settings page with low-bandwidth, auto-refresh, high-contrast toggles
 * and app info section.
 */
export function SettingsPageClient() {
  const [lowBandwidth, setLowBandwidth] = useLowBandwidthMode();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [offlineCount, setOfflineCount] = useState(0);
  const [cleared, setCleared] = useState(false);

  // Hydrate persisted values on mount
  useEffect(() => {
    try {
      setHighContrast(
        localStorage.getItem(HIGH_CONTRAST_KEY) === "true"
      );
      const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setOfflineCount(Array.isArray(parsed) ? parsed.length : 0);
      }
    } catch {
      // ignore
    }
  }, []);

  // When LBM turns ON, disable auto-refresh
  useEffect(() => {
    if (lowBandwidth) setAutoRefresh(false);
  }, [lowBandwidth]);

  const handleHighContrastChange = (v: boolean) => {
    setHighContrast(v);
    try {
      localStorage.setItem(HIGH_CONTRAST_KEY, String(v));
      document.documentElement.classList.toggle("high-contrast", v);
    } catch {
      // ignore
    }
  };

  const handleClearCache = () => {
    try {
      const keys = Object.keys(localStorage).filter((k) =>
        k.startsWith("gagandrishti_")
      );
      keys.forEach((k) => localStorage.removeItem(k));
      setOfflineCount(0);
      setCleared(true);
      setTimeout(() => setCleared(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#05090D]">
      <ShellHeaderMinimal />

      <main className="max-w-lg mx-auto px-4 py-6 pb-28 space-y-6">
        {/* Page title */}
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            ⚙️ App Settings
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            ऐप सेटिंग्स
          </p>
        </div>

        {/* ── Section 1: Display & Bandwidth ─────────────────────────── */}
        <section aria-labelledby="display-section">
          <h2
            id="display-section"
            className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3"
          >
            Display &amp; Bandwidth / डिस्प्ले और डेटा
          </h2>

          <div className="space-y-3">
            {/* Low Bandwidth Toggle */}
            <SettingsToggle
              label="Low Bandwidth Mode"
              sublabel="कम डेटा मोड"
              description="धीमे 3G/4G नेटवर्क पर डेटा बचाएं। Images, Maps, Charts को सरल बनाएगा।"
              checked={lowBandwidth}
              onChange={setLowBandwidth}
              icon={<Wifi className="h-5 w-5" />}
            />

            {/* LBM status badge */}
            {lowBandwidth && (
              <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 text-amber-800 dark:text-amber-300 text-sm font-medium">
                <span>📶 Low bandwidth mode ON — Data saving active</span>
                <span className="ml-auto rounded-full bg-amber-200 dark:bg-amber-700/50 text-amber-900 dark:text-amber-200 text-[11px] font-bold px-2.5 py-0.5">
                  ~80% कम डेटा उपयोग
                </span>
              </div>
            )}

            {/* Auto-Refresh Toggle — disabled when LBM is ON */}
            <SettingsToggle
              label="Auto-Refresh"
              sublabel="ऑटो रिफ्रेश"
              description="हर 5 मिनट पर weather अपने आप refresh होगा"
              checked={autoRefresh}
              onChange={setAutoRefresh}
              disabled={lowBandwidth}
              icon={<RefreshCw className="h-5 w-5" />}
            />

            {/* High Contrast Toggle */}
            <SettingsToggle
              label="High Contrast Mode"
              sublabel="हाई कॉन्ट्रास्ट मोड"
              description="धूप में screen पढ़ने के लिए — bright colors"
              checked={highContrast}
              onChange={handleHighContrastChange}
              icon={<Sun className="h-5 w-5" />}
            />
          </div>
        </section>

        {/* ── Section 2: App Info ─────────────────────────────────────── */}
        <section aria-labelledby="app-info-section">
          <h2
            id="app-info-section"
            className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3"
          >
            App Info / ऐप जानकारी
          </h2>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-700/40 bg-white dark:bg-slate-800/40 overflow-hidden divide-y divide-slate-100 dark:divide-slate-700/40">
            {/* App version */}
            <div className="flex items-center gap-3 px-4 py-3.5">
              <Info className="h-4.5 w-4.5 text-slate-400 flex-shrink-0" />
              <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">
                App Version
              </span>
              <span className="text-sm font-bold text-sky-500">v2.5.0</span>
            </div>

            {/* Offline queue */}
            <div className="flex items-center gap-3 px-4 py-3.5">
              <Wifi className="h-4.5 w-4.5 text-slate-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Offline Queue
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  ऑफलाइन सबमिशन
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  offlineCount > 0
                    ? "bg-amber-100 dark:bg-amber-800/30 text-amber-700 dark:text-amber-300"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                }`}
              >
                {offlineCount} pending
              </span>
            </div>

            {/* Clear Cache button */}
            <button
              type="button"
              onClick={handleClearCache}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors group min-h-[52px]"
            >
              <Trash2 className="h-4.5 w-4.5 text-rose-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">
                  Clear Cache
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  सभी gagandrishti_ localStorage keys हटाएं
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-rose-400 opacity-60 group-hover:opacity-100" />
            </button>
          </div>

          {/* Clear success toast */}
          {cleared && (
            <p
              role="status"
              className="mt-2 text-center text-xs font-semibold text-emerald-600 dark:text-emerald-400"
            >
              ✅ Cache cleared successfully!
            </p>
          )}
        </section>
      </main>
    </div>
  );
}

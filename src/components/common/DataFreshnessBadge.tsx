"use client";

import React, { useEffect, useState } from "react";
import { Clock, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";

interface DataFreshnessBadgeProps {
  timestamp?: string | number;
  sourceName?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const DataFreshnessBadge: React.FC<DataFreshnessBadgeProps> = ({
  timestamp,
  sourceName = "Open-Meteo",
  onRefresh,
  isRefreshing = false,
}) => {
  const { language } = useApp();
  const [minutesAgo, setMinutesAgo] = useState<number>(0);

  useEffect(() => {
    if (!timestamp) return;

    const calcMinutes = () => {
      const timeMs = typeof timestamp === "string" ? new Date(timestamp).getTime() : timestamp;
      const diffMs = Date.now() - timeMs;
      setMinutesAgo(Math.max(0, Math.floor(diffMs / 60000)));
    };

    calcMinutes();
    const interval = setInterval(calcMinutes, 30000); // recheck every 30s
    return () => clearInterval(interval);
  }, [timestamp]);

  if (!timestamp) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500">
        <Clock className="h-3 w-3" />
        <span>{language === "hi" ? "समय अनुपलब्ध" : "Telemetry Pending"}</span>
      </span>
    );
  }

  // Categories: LIVE (<15m), RECENT (15-60m), STALE (>60m)
  const isLive = minutesAgo < 15;
  const isRecent = minutesAgo >= 15 && minutesAgo < 60;

  const badgeColor = isLive
    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
    : isRecent
    ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
    : "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400";

  const statusLabel = isLive
    ? language === "hi"
      ? "लाइव डेटा"
      : language === "mr"
      ? "थेट डेटा"
      : "LIVE"
    : isRecent
    ? language === "hi"
      ? "कैश डेटा"
      : language === "mr"
      ? "कॅश डेटा"
      : "CACHED"
    : language === "hi"
    ? "पुराना डेटा"
    : language === "mr"
    ? "जुना डेटा"
    : "STALE";

  const timeLabel =
    minutesAgo === 0
      ? language === "hi"
        ? "अभी-अभी"
        : language === "mr"
        ? "आत्ताच"
        : "Just now"
      : language === "hi"
      ? `${minutesAgo} मि. पूर्व`
      : language === "mr"
      ? `${minutesAgo} मि. पूर्वी`
      : `${minutesAgo}m ago`;

  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-xl text-[11px] font-medium border ${badgeColor} transition-all select-none`}
    >
      <span className="relative flex h-2 w-2">
        {isLive && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isLive ? "bg-emerald-500" : isRecent ? "bg-amber-500" : "bg-rose-500"
          }`}
        />
      </span>

      <span className="font-bold tracking-wider">{statusLabel}</span>
      <span className="opacity-40">•</span>
      <span>{timeLabel}</span>

      {onRefresh && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRefresh();
          }}
          disabled={isRefreshing}
          className="ml-1 hover:opacity-75 p-0.5 transition-opacity disabled:opacity-50 cursor-pointer"
          title="Refresh telemetry"
        >
          <RefreshCw className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} />
        </button>
      )}
    </div>
  );
};

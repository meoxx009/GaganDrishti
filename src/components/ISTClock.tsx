"use client";

import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { useApp } from "@/context/AppContext";

export const ISTClock: React.FC = () => {
  const { language, isMounted } = useApp();
  const [timeStr, setTimeStr] = useState<string>("--:--:--");
  const [dateStr, setDateStr] = useState<string>("IST Weather Clock");

  useEffect(() => {
    const updateIST = () => {
      const now = new Date();

      // IST Time formatter
      const timeFormatter = new Intl.DateTimeFormat(
        language === "hi" ? "hi-IN" : "en-IN",
        {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }
      );

      // IST Date formatter
      const dateFormatter = new Intl.DateTimeFormat(
        language === "hi" ? "hi-IN" : "en-IN",
        {
          timeZone: "Asia/Kolkata",
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );

      setTimeStr(timeFormatter.format(now));
      setDateStr(dateFormatter.format(now));
    };

    updateIST();
    const timer = setInterval(updateIST, 1000);
    return () => clearInterval(timer);
  }, [language]);

  if (!isMounted) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-100 dark:bg-[#060C12] px-3 py-1.5 text-xs text-slate-400">
        <Clock className="h-3.5 w-3.5 text-sky-500 animate-pulse" />
        <span className="font-mono">--:--:-- IST</span>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-100/80 dark:bg-[#060C12] px-3 py-1.5 text-xs shadow-xs"
      title={`Indian Standard Time (Asia/Kolkata) - ${dateStr}`}
    >
      <Clock className="h-3.5 w-3.5 text-sky-500 shrink-0" />
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
        <span className="font-mono font-semibold tracking-wider text-slate-800 dark:text-[#F8FAFC]">
          {timeStr}
        </span>
        <span className="text-[10px] uppercase font-bold text-sky-700 dark:text-sky-400 bg-sky-500/10 px-1 rounded">
          IST
        </span>
      </div>
      <span className="hidden xl:inline-block text-[11px] text-slate-500 dark:text-[#7F91A3] border-l border-slate-300 dark:border-slate-800/80 pl-2">
        {dateStr}
      </span>
    </div>
  );
};

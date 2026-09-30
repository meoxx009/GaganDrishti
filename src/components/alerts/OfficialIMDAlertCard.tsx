"use client";

import React, { useEffect, useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Clock,
  Landmark,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { ImdWarningResponse, ImdColorCode } from "@/lib/weather/imdTypes";

const COLOR_MAP: Record<
  ImdColorCode,
  {
    border: string;
    bg: string;
    badgeBg: string;
    text: string;
    labelEn: string;
    labelHi: string;
    labelMr: string;
  }
> = {
  GREEN: {
    border: "border-emerald-500/30 dark:border-emerald-500/30",
    bg: "bg-emerald-50/50 dark:bg-emerald-950/10",
    badgeBg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
    text: "text-emerald-700 dark:text-emerald-400",
    labelEn: "GREEN (NO WARNING)",
    labelHi: "हरा (कोई चेतावनी नहीं)",
    labelMr: "हिरवा (कोणताही इशारा नाही)",
  },
  YELLOW: {
    border: "border-amber-500/40 dark:border-amber-500/30",
    bg: "bg-amber-50/50 dark:bg-amber-950/10",
    badgeBg: "bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-300",
    text: "text-amber-700 dark:text-amber-400",
    labelEn: "YELLOW (WATCH / BE UPDATED)",
    labelHi: "पीला (निगरानी / अपडेट रहें)",
    labelMr: "पिवळा (निरीक्षण / अपडेट राहा)",
  },
  ORANGE: {
    border: "border-orange-500/50 dark:border-orange-500/40",
    bg: "bg-orange-50/60 dark:bg-orange-950/15",
    badgeBg: "bg-orange-100 text-orange-900 dark:bg-orange-500/25 dark:text-orange-300",
    text: "text-orange-700 dark:text-orange-400",
    labelEn: "ORANGE (ALERT / BE PREPARED)",
    labelHi: "नारंगी (सतर्कता / तैयार रहें)",
    labelMr: "नारंगी (सतर्कता / सज्ज राहा)",
  },
  RED: {
    border: "border-rose-500/60 dark:border-rose-500/50",
    bg: "bg-rose-50/70 dark:bg-rose-950/20",
    badgeBg: "bg-rose-100 text-rose-900 dark:bg-rose-500/30 dark:text-rose-200",
    text: "text-rose-700 dark:text-rose-400",
    labelEn: "RED (WARNING / TAKE ACTION)",
    labelHi: "लाल (चेतावनी / कार्रवाई करें)",
    labelMr: "लाल (धोका / कृती करा)",
  },
};

export const OfficialIMDAlertCard: React.FC = () => {
  const { city, language } = useApp();
  const [data, setData] = useState<ImdWarningResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchImdWarning = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/imd?city=${encodeURIComponent(city.nameEn)}&state=${encodeURIComponent(city.stateEn)}`
      );
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        setData({
          status: "UNAVAILABLE",
          cacheStatus: "UNAVAILABLE",
          district: city.nameEn,
          state: city.stateEn,
          warning: null,
          source: "India Meteorological Department (IMD)",
          sourceUrl: "https://mausam.imd.gov.in",
          retrievedAt: new Date().toISOString(),
          disclaimer:
            "Official alerts are sourced exclusively from public IMD bulletins. GaganDrishti never generates or alters official government alerts.",
          errorReason: "IMD bulletin server responded with an unexpected status.",
        });
      }
    } catch {
      setData({
        status: "UNAVAILABLE",
        cacheStatus: "UNAVAILABLE",
        district: city.nameEn,
        state: city.stateEn,
        warning: null,
        source: "India Meteorological Department (IMD)",
        sourceUrl: "https://mausam.imd.gov.in",
        retrievedAt: new Date().toISOString(),
        disclaimer:
          "Official alerts are sourced exclusively from public IMD bulletins. GaganDrishti never generates or alters official government alerts.",
        errorReason: "Network connection to IMD feed timed out.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImdWarning();
  }, [city.id]);

  const colorConfig = data?.warning?.color
    ? COLOR_MAP[data.warning.color]
    : COLOR_MAP.GREEN;

  return (
    <div
      className={`rounded-3xl border ${
        data?.status === "UNAVAILABLE"
          ? "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#080E14]"
          : `${colorConfig.border} ${colorConfig.bg}`
      } p-5 sm:p-6 transition-all shadow-xs`}
    >
      {/* Header bar: Official IMD badge vs Derived Warning separation */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-800/60 pb-3.5 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400 shrink-0">
            <Landmark className="h-4 w-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {language === "hi"
                  ? "आधिकारिक भारत मौसम विज्ञान विभाग (IMD) बुलेटिन"
                  : language === "mr"
                  ? "अधिकृत भारतीय हवामान विभाग (IMD) बुलेटिन"
                  : "Official India Meteorological Dept (IMD) Alerts"}
              </h3>
              <span className="rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-300 dark:border-sky-800 px-2 py-0.5 text-[9.5px] font-bold">
                GOVERNMENT SOURCE
              </span>
              {data?.cacheStatus === "LIVE" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 text-[9px] font-bold">
                  <CheckCircle2 className="h-2.5 w-2.5" />
                  LIVE BULLETIN
                </span>
              )}
              {data?.cacheStatus === "CACHED" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-800 px-2 py-0.5 text-[9px] font-bold">
                  CACHED (15m)
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-[#7F91A3] mt-0.5">
              {language === "hi"
                ? `स्थान: ${city.nameHi}, ${city.stateHi}${
                    data?.matchedDistrict && data.matchedDistrict.toUpperCase() !== city.nameEn.toUpperCase()
                      ? ` (IMD जिला: ${data.matchedDistrict})`
                      : ""
                  }`
                : language === "mr"
                ? `स्थान: ${city.nameMr || city.nameHi}, ${city.stateMr || city.stateHi}${
                    data?.matchedDistrict && data.matchedDistrict.toUpperCase() !== city.nameEn.toUpperCase()
                      ? ` (IMD जिल्हा: ${data.matchedDistrict})`
                      : ""
                  }`
                : `Target: ${city.nameEn}, ${city.stateEn}${
                    data?.matchedDistrict && data.matchedDistrict.toUpperCase() !== city.nameEn.toUpperCase()
                      ? ` (IMD District: ${data.matchedDistrict})`
                      : ""
                  }`}
            </p>
          </div>
        </div>

        <button
          onClick={fetchImdWarning}
          disabled={isLoading}
          type="button"
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1219] px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors shadow-2xs"
          title="Refresh IMD Feed"
        >
          <RefreshCw
            className={`h-3 w-3 ${isLoading ? "animate-spin text-sky-500" : ""}`}
          />
          <span className="hidden sm:inline">
            {language === "hi" ? "ताज़ा करें" : language === "mr" ? "रीफ्रेश" : "Refresh"}
          </span>
        </button>
      </div>

      {/* Body: Warning details or graceful unavailable state */}
      {isLoading ? (
        <div className="py-6 flex items-center justify-center gap-2 text-xs text-slate-500">
          <RefreshCw className="h-4 w-4 animate-spin text-sky-500" />
          <span>
            {language === "hi"
              ? "आधिकारिक आईएमडी बुलेटिन की पुष्टि हो रही है..."
              : language === "mr"
              ? "अधिकृत IMD बुलेटिन तपासत आहे..."
              : "Querying official IMD public warning bulletin..."}
          </span>
        </div>
      ) : data?.status === "UNAVAILABLE" ? (
        <div className="space-y-3">
          <div className="flex items-start gap-3 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 p-4 border border-slate-200 dark:border-slate-800">
            <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {language === "hi"
                  ? "आधिकारिक आईएमडी अलर्ट डेटा वर्तमान में अनुपलब्ध है"
                  : language === "mr"
                  ? "अधिकृत IMD इशारा डेटा सध्या उपलब्ध नाही"
                  : "Official IMD alert data is temporarily unavailable right now."}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {data.errorReason ||
                  "Public IMD server connection is undergoing routine maintenance."}
              </p>
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={fetchImdWarning}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 dark:bg-sky-500 px-3 py-1 text-xs font-semibold text-white dark:text-slate-950 hover:bg-sky-700 transition"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>{language === "hi" ? "पुनः प्रयास करें" : "Retry"}</span>
                </button>
                <a
                  href="https://mausam.imd.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-sky-600 dark:text-sky-400 hover:underline font-semibold"
                >
                  <span>Mausam IMD Portal</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-[#7F91A3] italic">
            {language === "hi"
              ? "सत्यता नियम: गगनदृष्टि स्वतंत्र पूर्वानुमान जोखिमों को कभी भी आधिकारिक आईएमडी चेतावनी में परिवर्तित नहीं करता। गगनदृष्टि का स्वतंत्र जोखिम विश्लेषण नीचे दिया गया है।"
              : language === "mr"
              ? "सत्यता नियम: गगनदृष्टी स्वतःच्या अंदाजातील जोखीम कधीही अधिकृत IMD इशाऱ्यात बदलत नाही. गगनदृष्टीचे स्वतंत्र जोखीम विश्लेषण खाली दिलेले आहे."
              : "Integrity Rule: GaganDrishti never converts independent forecast risk into an official government alert. See GaganDrishti's independently derived meteorological risk below."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${colorConfig.badgeBg}`}
            >
              {data?.warning?.color === "GREEN" ? (
                <ShieldCheck className="h-3.5 w-3.5" />
              ) : (
                <AlertTriangle className="h-3.5 w-3.5" />
              )}
              <span>
                {language === "hi"
                  ? colorConfig.labelHi
                  : language === "mr"
                  ? colorConfig.labelMr
                  : colorConfig.labelEn}
              </span>
            </span>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              <Clock className="h-3 w-3" />
              <span>
                {language === "hi"
                  ? "बुलेटिन समय: "
                  : language === "mr"
                  ? "बुलेटिन वेळ: "
                  : "Updated: "}
                {data?.warning?.issuedAt
                  ? new Date(data.warning.issuedAt).toLocaleTimeString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    }) + " IST"
                  : "Latest"}
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {language === "hi"
                ? data?.warning?.phenomenonHi || data?.warning?.phenomenonEn
                : language === "mr"
                ? data?.warning?.phenomenonMr || data?.warning?.phenomenonEn
                : data?.warning?.phenomenonEn}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              {language === "hi"
                ? data?.warning?.actionHi || data?.warning?.actionEn
                : language === "mr"
                ? data?.warning?.actionMr || data?.warning?.actionEn
                : data?.warning?.actionEn}
            </p>
          </div>

          {/* 5-Day Warning Outlook from IMD */}
          {data?.forecastDays && data.forecastDays.length > 0 && (
            <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2">
                <Calendar className="h-3 w-3 text-sky-500" />
                <span>
                  {language === "hi"
                    ? "आईएमडी 5-दिवसीय जिला चेतावनी दृष्टिकोण"
                    : language === "mr"
                    ? "IMD ५-दिवसीय जिल्हा इशारा दृष्टिकोन"
                    : "IMD 5-Day District Warning Outlook"}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {data.forecastDays.map((fDay) => {
                  const cfg = COLOR_MAP[fDay.color] || COLOR_MAP.GREEN;
                  const dayDate = new Date(fDay.date);
                  const dayName = dayDate.toLocaleDateString("en-IN", { weekday: "short" });
                  return (
                    <div
                      key={fDay.day}
                      className={`rounded-xl border p-2 text-center text-xs transition-colors ${cfg.border} ${cfg.bg}`}
                      title={fDay.phenomenonEn}
                    >
                      <span className="block font-bold text-[11px] text-slate-800 dark:text-slate-200">
                        {dayName}
                      </span>
                      <span className="block text-[9.5px] text-slate-500 dark:text-slate-400">
                        Day {fDay.day}
                      </span>
                      <span
                        className={`inline-block mt-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${cfg.badgeBg}`}
                      >
                        {fDay.color}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Legal Attribution & Direct Link to Mausam IMD */}
          <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-wrap items-center justify-between gap-2 text-[10.5px] text-slate-500 dark:text-slate-400">
            <span>
              {language === "hi"
                ? "स्रोत: भारतीय मौसम विभाग (Ministry of Earth Sciences, Govt. of India)"
                : language === "mr"
                ? "स्रोत: भारतीय हवामान विभाग (Ministry of Earth Sciences, Govt. of India)"
                : "Source: India Meteorological Department (Ministry of Earth Sciences)"}
            </span>
            <a
              href="https://mausam.imd.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sky-600 dark:text-sky-400 hover:underline font-semibold"
            >
              <span>mausam.imd.gov.in</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

"use client";

import React from "react";
import { Calendar, Sparkles, SlidersHorizontal, RotateCcw, CloudSun, Sun, CloudRain } from "lucide-react";
import { SeasonId } from "@/lib/crops";
import { SEASONS, SeasonInfo } from "@/lib/seasonConfig";
import { useApp } from "@/context/AppContext";

interface FarmerSeasonSelectorProps {
  selectedSeason: SeasonId;
  suggestedSeason: SeasonId;
  isAutoSuggested: boolean;
  onSelectSeason: (season: SeasonId, isAuto: boolean) => void;
  onResetToSuggested: () => void;
}

const SEASON_ICONS: Record<SeasonId, React.ReactNode> = {
  kharif: <CloudRain className="h-4 w-4 text-emerald-400" />,
  rabi: <CloudSun className="h-4 w-4 text-sky-400" />,
  zaid: <Sun className="h-4 w-4 text-amber-400" />,
};

export const FarmerSeasonSelector: React.FC<FarmerSeasonSelectorProps> = ({
  selectedSeason,
  suggestedSeason,
  isAutoSuggested,
  onSelectSeason,
  onResetToSuggested,
}) => {
  const { language } = useApp();
  const seasonKeys: SeasonId[] = ["kharif", "rabi", "zaid"];
  const currentSeasonInfo: SeasonInfo = SEASONS[selectedSeason];

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800/50 bg-white dark:bg-[#080E14] p-5 sm:p-6 shadow-xs space-y-4">
      {/* Header & Status Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 dark:bg-[#0B1219] text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-300">
                {language === "hi" ? "फसल मौसम चक्र" : "Crop Season Cycle"}
              </span>
              {isAutoSuggested ? (
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30">
                  <Sparkles className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{language === "hi" ? "स्वतः सुझाया गया" : "Auto Suggested"}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30">
                  <SlidersHorizontal className="h-2.5 w-2.5 text-amber-600 dark:text-amber-400" />
                  <span>{language === "hi" ? "मैन्युअल चयन" : "Manual Selection"}</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-[#7F91A3] mt-0.5">
              {language === "hi"
                ? "कैलेंडर माह (IST) आधारित मौसम सुझाव • किसी भी मौसम की फसलें देखने के लिए टैब बदलें"
                : "Calendar-based agricultural season • Switch tabs to plan or inspect other cropping seasons"}
            </p>
          </div>
        </div>

        {/* Reset button when user manually overrides away from suggested */}
        {!isAutoSuggested && (
          <button
            type="button"
            onClick={onResetToSuggested}
            className="flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#0B1219] px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-[#F8FAFC] dark:hover:bg-[#0E1821] transition-colors shadow-2xs"
            title={language === "hi" ? "सुझाए गए मौसम पर वापस जाएं" : "Revert to suggested season"}
          >
            <RotateCcw className="h-3 w-3" />
            <span>
              {language === "hi"
                ? `सुझाया गया मौसम (${SEASONS[suggestedSeason].nameHi}) चुनें`
                : `Use Suggested Season (${SEASONS[suggestedSeason].nameEn})`}
            </span>
          </button>
        )}
      </div>

      {/* Season Tab Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {seasonKeys.map((sKey) => {
          const info = SEASONS[sKey];
          const isSelected = selectedSeason === sKey;
          const isSuggested = suggestedSeason === sKey;

          return (
            <button
              key={sKey}
              type="button"
              onClick={() => onSelectSeason(sKey, sKey === suggestedSeason)}
              className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all duration-200 ${
                isSelected
                  ? "border-emerald-300 bg-emerald-50/70 text-slate-900 shadow-2xs dark:bg-[#0B1A24] dark:border-emerald-500/40 dark:text-[#F8FAFC]"
                  : "border-slate-200/80 bg-[#F8FAFC] text-slate-700 hover:border-slate-300 hover:bg-[#F1F5F9] dark:border-slate-800/50 dark:bg-[#0B1219] dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-[#0E1821]"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                      isSelected
                        ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                        : "bg-slate-200/70 dark:bg-[#060C12] text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {SEASON_ICONS[sKey]}
                  </div>
                  <div>
                    <span className="font-bold text-sm block">
                      {language === "hi" ? info.nameHi : info.nameEn}
                    </span>
                  </div>
                </div>

                {isSuggested && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                    {language === "hi" ? "वर्तमान" : "Current"}
                  </span>
                )}
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-[#7F91A3]">
                <span>{language === "hi" ? info.subTitleHi : info.subTitleEn}</span>
                <span className="font-mono text-[10px] text-slate-500 dark:text-[#7F91A3]">{language === "hi" ? info.periodHi : info.periodEn}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Season Context Explainer Banner */}
      <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/50 bg-slate-50/70 dark:bg-[#060C12] p-3 text-xs text-slate-600 dark:text-[#7F91A3] leading-relaxed flex items-start gap-2.5">
        <div className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
        <div>
          <span className="font-semibold text-slate-800 dark:text-[#F8FAFC]">
            {language === "hi" ? currentSeasonInfo.nameHi : currentSeasonInfo.nameEn} (
            {language === "hi" ? currentSeasonInfo.periodHi : currentSeasonInfo.periodEn}
            ):{" "}
          </span>
          <span>
            {language === "hi"
              ? currentSeasonInfo.descriptionHi
              : currentSeasonInfo.descriptionEn}
          </span>
        </div>
      </div>
    </div>
  );
};

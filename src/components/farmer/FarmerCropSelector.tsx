"use client";

import React, { useState, useMemo } from "react";
import {
  Sprout,
  Wheat,
  Leaf,
  Tractor,
  Flower,
  Check,
  ChevronDown,
  ChevronUp,
  Search,
  X,
  Sparkles,
} from "lucide-react";
import { CropId, StageId, STAGES } from "@/lib/weather/farmerTypes";
import { SeasonId, CropItem, getPriorityCropsBySeason, getCropsBySeason, searchCrops, findCropById } from "@/lib/crops";
import { useApp } from "@/context/AppContext";

interface FarmerCropSelectorProps {
  selectedSeason: SeasonId;
  selectedCrop: CropId;
  onSelectCrop: (crop: CropId) => void;
  selectedStage: StageId;
  onSelectStage: (stage: StageId) => void;
}

const getCropIcon = (iconName: string, className: string = "h-4 w-4") => {
  switch (iconName) {
    case "Wheat":
      return <Wheat className={className} />;
    case "Sprout":
      return <Sprout className={className} />;
    case "Leaf":
      return <Leaf className={className} />;
    case "Tractor":
      return <Tractor className={className} />;
    case "Flower":
      return <Flower className={className} />;
    default:
      return <Sprout className={className} />;
  }
};

export const FarmerCropSelector: React.FC<FarmerCropSelectorProps> = ({
  selectedSeason,
  selectedCrop,
  onSelectCrop,
  selectedStage,
  onSelectStage,
}) => {
  const { language } = useApp();
  const [showAllDrawer, setShowAllDrawer] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Priority crops for active season (prominent 4-6 cards)
  const priorityCrops = useMemo(() => {
    return getPriorityCropsBySeason(selectedSeason);
  }, [selectedSeason]);

  // All crops for active season
  const allSeasonCrops = useMemo(() => {
    return getCropsBySeason(selectedSeason);
  }, [selectedSeason]);

  // Filtered crops in search drawer
  const filteredCrops = useMemo(() => {
    return searchCrops(selectedSeason, searchQuery);
  }, [selectedSeason, searchQuery]);

  // If current crop is not in priority list, show it as an active pill
  const activeCropObj = findCropById(selectedCrop);
  const isSelectedCropInPriority = priorityCrops.some((c) => c.id === selectedCrop);

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800/50 bg-white dark:bg-[#080E14] p-5 sm:p-6 shadow-xs space-y-5">
      {/* Crop Selection Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-300 flex items-center gap-2">
            <Sprout className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>
              {language === "hi" ? "फसल का चयन करें (Crop Selection)" : "Select Crop"}
            </span>
          </label>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 dark:text-[#7F91A3]">
              {language === "hi"
                ? `प्रमुख ${priorityCrops.length} फसलें (${allSeasonCrops.length} कुल)`
                : `Showing ${priorityCrops.length} Priority Crops (${allSeasonCrops.length} Total)`}
            </span>

            <button
              type="button"
              onClick={() => {
                setShowAllDrawer(!showAllDrawer);
                setSearchQuery("");
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-[#F8FAFC] dark:bg-emerald-500/15 dark:border-emerald-500/30 dark:text-emerald-300 dark:hover:bg-emerald-500/25 transition-colors shadow-2xs"
            >
              <span>
                {showAllDrawer
                  ? language === "hi"
                    ? "कम दिखाएँ"
                    : "View Less"
                  : language === "hi"
                  ? "सभी फसलें देखें"
                  : "View More"}
              </span>
              {showAllDrawer ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Priority Crop Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {priorityCrops.map((crop) => {
            const isSelected = selectedCrop === crop.id;
            return (
              <button
                key={crop.id}
                onClick={() => onSelectCrop(crop.id)}
                type="button"
                className={`flex flex-col justify-between rounded-2xl p-3 text-left transition-all duration-150 ${
                  isSelected
                    ? "border border-sky-300 bg-sky-50/80 text-sky-950 shadow-2xs font-semibold dark:bg-[#0B1A24] dark:border-emerald-500/40 dark:text-[#F8FAFC]"
                    : "border border-slate-200/80 bg-[#F8FAFC] text-slate-700 hover:border-slate-300 hover:bg-[#F1F5F9] dark:border-slate-800/50 dark:bg-[#0B1219] dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-[#0E1821] dark:hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${
                      isSelected
                        ? "bg-white text-sky-700 shadow-2xs dark:bg-emerald-500/20 dark:text-emerald-300"
                        : "bg-white border border-slate-200/60 text-slate-600 dark:bg-[#060C12] dark:border-transparent dark:text-slate-400"
                    }`}
                  >
                    {getCropIcon(crop.iconName)}
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-sky-600 dark:text-emerald-400" />}
                </div>

                <div className="min-w-0">
                  <div className="text-xs font-bold truncate text-slate-900 dark:text-[#F8FAFC]">
                    {language === "hi" ? crop.nameHi : crop.nameEn}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-[#7F91A3] truncate mt-0.5">
                    {language === "hi" ? crop.nameEn : crop.nameHi}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* If user selected a crop from View More that is not in priority cards, show it as selected indicator */}
        {!isSelectedCropInPriority && activeCropObj && (
          <div className="mt-3 p-2.5 rounded-2xl border border-sky-200 bg-sky-50/80 dark:border-emerald-500/40 dark:bg-[#0B1A24] flex items-center justify-between text-xs text-sky-900 dark:text-emerald-300 shadow-2xs">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-sky-700 border border-sky-100 dark:bg-emerald-500/20 dark:text-emerald-300">
                {getCropIcon(activeCropObj.iconName, "h-3.5 w-3.5")}
              </div>
              <div>
                <span className="font-bold">
                  {language === "hi" ? activeCropObj.nameHi : activeCropObj.nameEn}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-[#7F91A3] ml-1.5 font-normal">
                  ({language === "hi" ? activeCropObj.nameEn : activeCropObj.nameHi})
                </span>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
              {language === "hi" ? "अतिरिक्त चयनित फसल" : "Selected from Full Catalog"}
            </span>
          </div>
        )}

        {/* Searchable Full Crop Drawer */}
        {showAllDrawer && (
          <div className="mt-4 rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-[#080E14] p-4 space-y-3.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>
                  {language === "hi"
                    ? "सभी उपलब्ध फसलें खोजें व चुनें"
                    : "Search & Select from All Season Crops"}
                </span>
              </span>

              <button
                type="button"
                onClick={() => setShowAllDrawer(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs p-1"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Bilingual Search Filter */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  language === "hi"
                    ? "फसल का नाम खोजें (उदा: चना, अलसी, Gram, Mustard...)"
                    : "Search crop by English/Hindi name or category..."
                }
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#060C12] text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#7F91A3] focus:outline-none focus:border-emerald-500 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Crop Options List */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1">
              {filteredCrops.length > 0 ? (
                filteredCrops.map((crop) => {
                  const isSelected = selectedCrop === crop.id;
                  return (
                    <button
                      key={crop.id}
                      type="button"
                      onClick={() => {
                        onSelectCrop(crop.id);
                        setShowAllDrawer(false);
                      }}
                      className={`flex items-center gap-2 p-2.5 rounded-xl text-left border transition-all text-xs ${
                        isSelected
                          ? "border-emerald-500/50 bg-emerald-50 dark:bg-[#0B1A24] text-emerald-700 dark:text-emerald-300 font-bold"
                          : "border-slate-200 dark:border-slate-800/50 bg-white dark:bg-[#0B1219] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-[#0E1821] hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <div
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${
                          isSelected
                            ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                            : "bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {getCropIcon(crop.iconName, "h-3 w-3")}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold truncate">
                          {language === "hi" ? crop.nameHi : crop.nameEn}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-[#7F91A3] truncate opacity-80">
                          {language === "hi" ? crop.nameEn : crop.nameHi}
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="col-span-full py-4 text-center text-xs text-slate-500 dark:text-[#7F91A3]">
                  {language === "hi"
                    ? `"${searchQuery}" के लिए कोई फसल नहीं मिली`
                    : `No crops found matching "${searchQuery}"`}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Growth Stage Selection */}
      <div className="border-t border-slate-200 dark:border-slate-800/80 pt-4">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-300 flex items-center gap-2">
            <Wheat className="h-4 w-4 text-sky-600 dark:text-cyan-400" />
            <span>
              {language === "hi" ? "फसल अवस्था (Growth Stage)" : "Growth Stage"}
            </span>
          </label>
          <span className="text-[11px] text-slate-500 dark:text-[#7F91A3]">
            {language === "hi" ? "चरण-विशिष्ट सलाह" : "Stage-Specific Analysis"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {STAGES.map((stage) => {
            const isSelected = selectedStage === stage.id;
            return (
              <button
                key={stage.id}
                onClick={() => onSelectStage(stage.id)}
                type="button"
                className={`flex flex-col justify-between rounded-2xl p-3 text-left transition-all duration-150 ${
                  isSelected
                    ? "border border-sky-300 bg-sky-50 text-sky-950 shadow-2xs font-semibold dark:bg-[#0B1A28] dark:border-cyan-500/40 dark:text-cyan-200"
                    : "border border-slate-200/80 bg-[#F8FAFC] text-slate-700 hover:border-slate-300 hover:bg-[#F1F5F9] dark:border-slate-800/50 dark:bg-[#0B1219] dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-[#0E1821] dark:hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-slate-900 dark:text-inherit">
                    {language === "hi" ? stage.nameHi : stage.nameEn}
                  </span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-sky-600 dark:text-cyan-400" />}
                </div>
                <span className="text-[10px] text-slate-500 dark:text-[#7F91A3] mt-1 line-clamp-1">
                  {language === "hi" ? stage.descriptionHi : stage.descriptionEn}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};


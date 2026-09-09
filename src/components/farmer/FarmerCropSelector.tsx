"use client";

import React from "react";
import { Sprout, Wheat, Leaf, Tractor, Flower, Check } from "lucide-react";
import { CropId, StageId, CROPS, STAGES } from "@/lib/weather/farmerTypes";
import { useApp } from "@/context/AppContext";

interface FarmerCropSelectorProps {
  selectedCrop: CropId;
  onSelectCrop: (crop: CropId) => void;
  selectedStage: StageId;
  onSelectStage: (stage: StageId) => void;
}

const CROP_ICONS: Record<CropId, React.ReactNode> = {
  wheat: <Wheat className="h-4 w-4" />,
  paddy: <Sprout className="h-4 w-4" />,
  soybean: <Leaf className="h-4 w-4" />,
  maize: <Tractor className="h-4 w-4" />,
  mustard: <Flower className="h-4 w-4" />,
};

export const FarmerCropSelector: React.FC<FarmerCropSelectorProps> = ({
  selectedCrop,
  onSelectCrop,
  selectedStage,
  onSelectStage,
}) => {
  const { language } = useApp();

  return (
    <div className="rounded-3xl border border-slate-700/60 bg-gradient-to-br from-[#0D1B2A]/90 via-[#07111F]/90 to-slate-950 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-5">
      {/* Crop Selection */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Sprout className="h-4 w-4 text-emerald-400" />
            <span>
              {language === "hi" ? "फसल चुनें (Crops)" : "Select Crop"}
            </span>
          </label>
          <span className="text-[11px] text-slate-400">
            {language === "hi" ? "5 प्रमुख फसलें" : "5 Standard Crops"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {CROPS.map((crop) => {
            const isSelected = selectedCrop === crop.id;
            return (
              <button
                key={crop.id}
                onClick={() => onSelectCrop(crop.id)}
                type="button"
                className={`flex items-center gap-2.5 rounded-2xl p-3 text-left transition-all duration-150 ${
                  isSelected
                    ? "border border-emerald-500/50 bg-emerald-500/20 text-emerald-300 shadow-md shadow-emerald-950/40 font-semibold"
                    : "border border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${
                    isSelected
                      ? "bg-emerald-500/30 text-emerald-200"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {CROP_ICONS[crop.id]}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">
                    {language === "hi" ? crop.nameHi : crop.nameEn}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate opacity-80">
                    {language === "hi" ? crop.nameEn : crop.nameHi}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Growth Stage Selection */}
      <div className="border-t border-slate-800/80 pt-4">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Wheat className="h-4 w-4 text-cyan-400" />
            <span>
              {language === "hi" ? "फसल अवस्था (Growth Stage)" : "Growth Stage"}
            </span>
          </label>
          <span className="text-[11px] text-slate-400">
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
                    ? "border border-cyan-500/50 bg-cyan-500/20 text-cyan-200 shadow-md shadow-cyan-950/40"
                    : "border border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold">
                    {language === "hi" ? stage.nameHi : stage.nameEn}
                  </span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-cyan-400" />}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 line-clamp-1">
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

"use client";

import React, { useState, useRef, useEffect } from "react";
import { MapPin, ChevronDown, Check, Compass } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { CITIES } from "@/lib/cities";
import { City } from "@/lib/types";

export const CitySelector: React.FC = () => {
  const { city, setCity, language, t } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cityName = language === "hi" ? city.nameHi : city.nameEn;
  const stateName = language === "hi" ? city.stateHi : city.stateEn;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* City Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        className="group flex items-center gap-2.5 rounded-xl border border-slate-700/60 bg-slate-800/40 dark:bg-slate-900/80 px-3 py-1.5 text-left transition-all duration-150 hover:border-cyan-500/50 hover:bg-slate-800/80 dark:hover:bg-slate-800/90 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/30"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        title={t.header.searchCity}
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-400">
          <MapPin className="h-4 w-4" />
        </div>

        <div className="flex flex-col pr-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
              {cityName}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              ({stateName})
            </span>
          </div>
          <span className="font-mono text-[10px] text-cyan-600 dark:text-cyan-400">
            {city.lat.toFixed(4)}°N, {city.lon.toFixed(4)}°E
          </span>
        </div>

        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-cyan-400" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 sm:left-0 z-50 mt-2 w-80 rounded-2xl border border-slate-700/80 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-xl transition-all"
        >
          <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {t.header.selectCity} (10 Regions)
            </span>
            <Compass className="h-3.5 w-3.5 text-cyan-400" />
          </div>

          <div className="mt-1 max-h-72 overflow-y-auto space-y-1 pr-1">
            {CITIES.map((c: City) => {
              const isSelected = c.id === city.id;
              const itemCityName = language === "hi" ? c.nameHi : c.nameEn;
              const itemStateName = language === "hi" ? c.stateHi : c.stateEn;

              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setCity(c);
                    setIsOpen(false);
                  }}
                  type="button"
                  className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-left transition-all ${
                    isSelected
                      ? "bg-cyan-500/20 text-cyan-200 border border-cyan-500/40"
                      : "text-slate-300 hover:bg-slate-800/80 hover:text-white border border-transparent"
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div>
                    <div className="flex items-center gap-1.5 font-medium text-xs">
                      <span>{itemCityName}</span>
                      <span className="text-[10px] text-slate-400">
                        ({itemStateName})
                      </span>
                    </div>
                    <div className="font-mono text-[10px] text-slate-400 group-hover:text-cyan-300">
                      {c.lat.toFixed(4)}°N, {c.lon.toFixed(4)}°E
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="h-4 w-4 text-cyan-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  MapPin,
  ChevronDown,
  Check,
  Compass,
  Search,
  Crosshair,
  Loader2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { CITIES } from "@/lib/cities";
import { City } from "@/lib/types";
import {
  searchLocations,
  requestBrowserLocation,
} from "@/lib/location/locationService";

const RECENT_CITIES_KEY = "gagandrishti_recent_cities";

export const CitySelector: React.FC = () => {
  const { city, setCity, language, t } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<City[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [recentCities, setRecentCities] = useState<City[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_CITIES_KEY);
      if (stored) {
        setRecentCities(JSON.parse(stored));
      }
    } catch {
      // Ignore
    }
  }, []);

  // Save to recent searches
  const saveRecentCity = useCallback((selected: City) => {
    setRecentCities((prev) => {
      const filtered = prev.filter((c) => c.id !== selected.id);
      const updated = [selected, ...filtered].slice(0, 5);
      try {
        localStorage.setItem(RECENT_CITIES_KEY, JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  }, []);

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

  // Focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery("");
      setSearchResults([]);
      setGeoError(null);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchLocations(searchQuery);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle GPS location request
  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    setGeoError(null);
    try {
      const gpsCity = await requestBrowserLocation();
      setCity(gpsCity);
      saveRecentCity(gpsCity);
      setIsOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Location access failed.";
      setGeoError(msg);
    } finally {
      setIsLocating(false);
    }
  };

  const handleSelectCity = (c: City) => {
    setCity(c);
    saveRecentCity(c);
    setIsOpen(false);
  };

  const getCityDisplayName = (c: City) => {
    if (language === "mr") return c.nameMr || c.nameHi || c.nameEn;
    if (language === "hi") return c.nameHi;
    return c.nameEn;
  };

  const getStateDisplayName = (c: City) => {
    if (language === "mr") return c.stateMr || c.stateHi || c.stateEn;
    if (language === "hi") return c.stateHi;
    return c.stateEn;
  };

  const cityName = getCityDisplayName(city);
  const stateName = getStateDisplayName(city);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* City Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        className="group flex items-center gap-2.5 rounded-xl border border-slate-200 dark:border-slate-800/50 bg-white dark:bg-[#080E14] px-3 py-1.5 text-left transition-all duration-150 hover:border-slate-300 dark:hover:border-sky-500/40 hover:bg-[#F8FAFC] dark:hover:bg-[#0B1219] focus:outline-hidden focus:ring-1 focus:ring-sky-500/30 shadow-2xs"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        title={t.header.searchCity}
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400">
          <MapPin className="h-3.5 w-3.5" />
        </div>

        <div className="flex flex-col pr-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-900 dark:text-[#F8FAFC] truncate max-w-[140px] sm:max-w-[180px]">
              {cityName}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-[#7F91A3] truncate max-w-[100px] hidden sm:inline">
              ({stateName})
            </span>
          </div>
          <span className="font-mono text-[9.5px] text-sky-600 dark:text-sky-400">
            {city.lat.toFixed(3)}°N, {city.lon.toFixed(3)}°E
          </span>
        </div>

        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-sky-600 dark:text-sky-400" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Mobile backdrop to dismiss and ensure no underlying clicks */}
          <div
            className="fixed inset-0 z-40 bg-black/20 dark:bg-black/40 sm:hidden backdrop-blur-2xs"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div
            role="listbox"
            className="absolute left-0 sm:left-auto right-auto sm:right-0 md:left-0 md:right-auto z-50 mt-2 w-[calc(100vw-2rem)] max-w-sm sm:w-96 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#080E14] p-3 shadow-2xl transition-all"
          >
          {/* Search Box */}
          <div className="relative mb-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === "hi"
                  ? "भारत का कोई भी शहर/ज़िला या निर्देशांक..."
                  : language === "mr"
                  ? "भारतातील कोणतेही शहर/जिल्हा किंवा निर्देशांक..."
                  : "Search any Indian city, district or coordinates..."
              }
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B1219] pl-9 pr-8 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-sky-500 focus:outline-none"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-sky-500" />
            )}
          </div>

          {/* Use Current GPS Location Button */}
          <button
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            type="button"
            className="w-full mb-2.5 flex items-center gap-2 rounded-xl border border-dashed border-sky-300 dark:border-sky-500/40 bg-sky-50/50 dark:bg-sky-500/10 px-3 py-2 text-xs font-semibold text-sky-700 dark:text-sky-300 hover:bg-sky-100/70 dark:hover:bg-sky-500/20 transition-all"
          >
            {isLocating ? (
              <Loader2 className="h-4 w-4 animate-spin text-sky-600" />
            ) : (
              <Crosshair className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            )}
            <span>
              {isLocating
                ? language === "hi"
                  ? "जीपीएस स्थान प्राप्त किया जा रहा है..."
                  : language === "mr"
                  ? "जीपीएस स्थान मिळवत आहे..."
                  : "Detecting GPS location..."
                : language === "hi"
                ? "वर्तमान स्थान का उपयोग करें (GPS)"
                : language === "mr"
                ? "सध्याचे स्थान वापरा (GPS)"
                : "Use My Current Location (GPS)"}
            </span>
          </button>

          {/* Geolocation Permission Error */}
          {geoError && (
            <div className="mb-2 p-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-[11px] text-rose-600 dark:text-rose-400 flex items-start gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>{geoError}</span>
            </div>
          )}

          {/* Results List */}
          <div className="max-h-72 overflow-y-auto space-y-1 pr-1">
            {/* Search Results Mode */}
            {searchQuery.trim().length >= 2 ? (
              <div>
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {language === "hi"
                    ? "खोज परिणाम (Open-Meteo Geocoding)"
                    : language === "mr"
                    ? "शोध निकाल (Open-Meteo Geocoding)"
                    : "Search Results (All-India Geocoding)"}
                </div>

                {searchResults.length === 0 && !isSearching ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    {language === "hi"
                      ? "कोई स्थान नहीं मिला। कृपया वर्तनी जांचें।"
                      : language === "mr"
                      ? "कोणतेही स्थान सापडले नाही. कृपया स्पेलिंग तपासा."
                      : "No locations found. Check spelling or try coordinates."}
                  </div>
                ) : (
                  searchResults.map((c) => {
                    const isSelected = c.id === city.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => handleSelectCity(c)}
                        type="button"
                        className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-left transition-all ${
                          isSelected
                            ? "bg-sky-50 text-sky-900 border border-sky-200 dark:bg-[#0B1A28] dark:text-sky-300 dark:border-sky-500/30"
                            : "text-slate-700 dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-[#0B1219] hover:text-slate-900 dark:hover:text-white border border-transparent"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5 font-medium text-xs">
                            <span>{getCityDisplayName(c)}</span>
                            <span className="text-[10px] text-slate-400">
                              ({getStateDisplayName(c)})
                            </span>
                          </div>
                          <div className="font-mono text-[10px] text-slate-400">
                            {c.lat.toFixed(3)}°N, {c.lon.toFixed(3)}°E
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="h-4 w-4 text-sky-500 shrink-0" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            ) : (
              <>
                {/* Recent Searches */}
                {recentCities.length > 0 && (
                  <div className="mb-2">
                    <div className="px-2 py-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <Clock className="h-3 w-3" />
                      <span>
                        {language === "hi"
                          ? "हाल के स्थान"
                          : language === "mr"
                          ? "अलीकडील स्थाने"
                          : "Recent Searches"}
                      </span>
                    </div>
                    {recentCities.map((c) => {
                      const isSelected = c.id === city.id;
                      return (
                        <button
                          key={`recent_${c.id}`}
                          onClick={() => handleSelectCity(c)}
                          type="button"
                          className={`w-full flex items-center justify-between rounded-xl px-3 py-1.5 text-left transition-all ${
                            isSelected
                              ? "bg-sky-50 text-sky-900 border border-sky-200 dark:bg-[#0B1A28] dark:text-sky-300 dark:border-sky-500/30"
                              : "text-slate-700 dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-[#0B1219] border border-transparent"
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-1.5 font-medium text-xs">
                              <span>{getCityDisplayName(c)}</span>
                              <span className="text-[10px] text-slate-400">
                                ({getStateDisplayName(c)})
                              </span>
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="h-3.5 w-3.5 text-sky-500 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Featured 10 Indian Cities */}
                <div>
                  <div className="px-2 py-1 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/50">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#7F91A3]">
                      {language === "hi"
                        ? "प्रमुख शहर (10 Featured Cities)"
                        : language === "mr"
                        ? "प्रमुख शहरे (10 Featured Cities)"
                        : "Featured Cities (10 Pinned Regions)"}
                    </span>
                    <Compass className="h-3 w-3 text-sky-500 dark:text-sky-400" />
                  </div>

                  <div className="mt-1 space-y-0.5">
                    {CITIES.map((c) => {
                      const isSelected = c.id === city.id;
                      return (
                        <button
                          key={c.id}
                          onClick={() => handleSelectCity(c)}
                          type="button"
                          className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-left transition-all ${
                            isSelected
                              ? "bg-sky-50 text-sky-900 border border-sky-200 dark:bg-[#0B1A28] dark:text-sky-300 dark:border-sky-500/30"
                              : "text-slate-700 dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-[#0B1219] hover:text-slate-900 dark:hover:text-white border border-transparent"
                          }`}
                          role="option"
                          aria-selected={isSelected}
                        >
                          <div>
                            <div className="flex items-center gap-1.5 font-medium text-xs">
                              <span>{getCityDisplayName(c)}</span>
                              <span className="text-[10px] text-slate-400 dark:text-[#7F91A3]">
                                ({getStateDisplayName(c)})
                              </span>
                            </div>
                            <div className="font-mono text-[10px] text-slate-400 dark:text-[#7F91A3]">
                              {c.lat.toFixed(4)}°N, {c.lon.toFixed(4)}°E
                            </div>
                          </div>

                          {isSelected && (
                            <Check className="h-4 w-4 text-sky-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
          </div>
        </>
      )}
    </div>
  );
};

"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  MapPin,
  Search,
  ShieldCheck,
  Compass,
  ArrowLeft,
  Thermometer,
  Droplets,
  CloudRain,
  Wind,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  Navigation,
} from "lucide-react";
import {
  PincodeVillageRecord,
  HyperlocalVillageWeatherResponse,
  NearbyVillageForecast,
} from "@/lib/weather/villageLocationTypes";

export default function VillageWeatherPage() {
  const [language, setLanguage] = useState<"en" | "hi">("hi");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<PincodeVillageRecord[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [selectedPincode, setSelectedPincode] = useState<string>("466001"); // Default Kotri, Sehore
  const [weatherData, setWeatherData] = useState<HyperlocalVillageWeatherResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Quick preset villages for immediate testing
  const QUICK_VILLAGES = [
    { nameEn: "Kotri (Sehore)", nameHi: "कोटरी (सीहोर)", pin: "466001" },
    { nameEn: "Bilkisganj", nameHi: "बिलकिसगंज", pin: "466115" },
    { nameEn: "Ashta", nameHi: "आष्टा मंडी", pin: "466116" },
    { nameEn: "Sanchi", nameHi: "सांची (रायसेन)", pin: "464551" },
    { nameEn: "Ganj Basoda", nameHi: "गंज बासोदा (विदिशा)", pin: "464221" },
    { nameEn: "Pipariya", nameHi: "पिपरिया (नर्मदापुरम)", pin: "461775" },
    { nameEn: "Sanwer", nameHi: "सांवेर (इंदौर)", pin: "453551" },
  ];

  // Fetch Hyperlocal Weather
  const loadVillageWeather = useCallback(async (pin: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/village-weather?pincode=${encodeURIComponent(pin)}`);
      const data = await res.json();
      if (data.success && data.data) {
        setWeatherData(data.data);
      } else {
        setError(data.error || "Failed to fetch village weather data.");
      }
    } catch {
      setError("Network connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVillageWeather(selectedPincode);
  }, [selectedPincode, loadVillageWeather]);

  // Autocomplete search
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q || q.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/village-weather?search=${encodeURIComponent(q)}`);
        const json = await res.json();
        if (json.success && json.results) {
          setSearchResults(json.results);
        }
      } catch {
        // ignore
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectVillage = (pin: string) => {
    setSelectedPincode(pin);
    setSearchQuery("");
    setSearchResults([]);
  };

  const current = weatherData?.current_weather;
  const village = weatherData?.village;
  const climateZone = weatherData?.climate_zone;
  const adjustments = weatherData?.adjustments;
  const suitability = weatherData?.farm_suitability;
  const nearby = weatherData?.nearby_villages || [];

  return (
    <div className="min-h-screen bg-[#070D14] text-slate-100 antialiased">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#070D14]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{language === "hi" ? "वापस" : "Back"}</span>
            </Link>

            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <span>{language === "hi" ? "हाइपरलोकल गांव-स्तर मौसम" : "Hyperlocal Village Weather"}</span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    CHANGE_003
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  {language === "hi"
                    ? "5,00,000+ पिनकोड • 50 माइक्रो-क्लाइमेट जोन • सटीक भौगोलिक निर्देशांक"
                    : "500k+ Pincodes • 50 Micro-Climate Zones • Exact Geo-Coordinates"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <div className="flex items-center rounded-xl border border-slate-800 bg-slate-900/80 p-0.5 text-xs font-semibold">
              <button
                onClick={() => setLanguage("hi")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  language === "hi"
                    ? "bg-emerald-600 text-white font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                हिन्दी
              </button>
              <button
                onClick={() => setLanguage("en")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  language === "en"
                    ? "bg-emerald-600 text-white font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                English
              </button>
            </div>

            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors"
            >
              <span>{language === "hi" ? "किसान डैशबोर्ड" : "Farmer Dashboard"}</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
        {/* Search & Quick Chips Bar */}
        <div className="rounded-3xl border border-slate-800 bg-[#0A121A] p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Search className="h-5 w-5 text-emerald-400" />
                <span>{language === "hi" ? "अपना गांव या 6-अंकीय पिनकोड खोजें" : "Search Village Name or 6-Digit Pincode"}</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === "hi"
                  ? "भारत का कोई भी पिनकोड या मध्य प्रदेश के गांव दर्ज करें"
                  : "Type any Indian 6-digit PIN code (110001 - 855120) or agricultural village"}
              </p>
            </div>

            {/* Live Search Input */}
            <div className="relative w-full sm:w-96">
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === "hi" ? "पिनकोड या गांव का नाम (उदा. 466001, कोटरी)..." : "Enter PIN or Village (e.g. 466001, Kotri)..."}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
                {isSearching && (
                  <RefreshCw className="absolute right-3.5 h-4 w-4 animate-spin text-slate-400" />
                )}
              </div>

              {/* Autocomplete Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl border border-slate-700 bg-[#0C1520] py-2 shadow-2xl overflow-hidden max-h-64 overflow-y-auto">
                  {searchResults.map((res) => (
                    <button
                      key={`${res.pincode}-${res.village_name}`}
                      onClick={() => handleSelectVillage(res.pincode)}
                      type="button"
                      className="w-full flex items-center justify-between px-4 py-2.5 text-left text-xs hover:bg-slate-800/80 transition-colors"
                    >
                      <div>
                        <span className="font-bold text-white">
                          {language === "hi" ? res.village_name_hi : res.village_name}
                        </span>
                        <span className="text-slate-400 ml-2">
                          ({language === "hi" ? res.district_hi : res.district}, {res.state})
                        </span>
                      </div>
                      <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        {res.pincode}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Preset Chips */}
          <div className="pt-2 border-t border-slate-800/60 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-slate-500 shrink-0 font-medium">
              {language === "hi" ? "त्वरित चयन:" : "Quick Select:"}
            </span>
            {QUICK_VILLAGES.map((v) => (
              <button
                key={v.pin}
                onClick={() => handleSelectVillage(v.pin)}
                type="button"
                className={`shrink-0 px-3 py-1 rounded-xl border text-xs font-semibold transition-all ${
                  selectedPincode === v.pin
                    ? "border-emerald-500 bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500"
                    : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:text-white"
                }`}
              >
                {language === "hi" ? v.nameHi : v.nameEn} ({v.pin})
              </button>
            ))}
          </div>
        </div>

        {/* Loading / Error States */}
        {isLoading && !weatherData && (
          <div className="space-y-4 animate-pulse">
            <div className="h-64 rounded-3xl border border-slate-800 bg-slate-900/60" />
            <div className="h-48 rounded-3xl border border-slate-800 bg-slate-900/60" />
          </div>
        )}

        {error && (
          <div className="rounded-3xl border border-rose-500/40 bg-rose-950/20 p-6 text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-rose-400" />
            <h3 className="mt-2 text-base font-bold text-white">{error}</h3>
            <button
              onClick={() => loadVillageWeather(selectedPincode)}
              type="button"
              className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500 transition-colors"
            >
              {language === "hi" ? "पुनः प्रयास करें" : "Retry"}
            </button>
          </div>
        )}

        {/* SECTION 1: आपका गांव का मौसम (Your Village Forecast) */}
        {weatherData && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-[#0A121A] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-500/5 blur-3xl" />

              {/* Village Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {language === "hi" ? "हाइपरलोकल गांव केंद्र" : "Hyperlocal Village Center"}
                    </span>
                    <span className="text-xs font-mono text-cyan-400">PIN: {village?.pincode}</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black text-white mt-1.5 tracking-tight flex items-center gap-2.5">
                    <span>{language === "hi" ? village?.village_name_hi : village?.village_name}</span>
                    <span className="text-sm font-normal text-slate-400">
                      ({language === "hi" ? village?.district_hi : village?.district}, {language === "hi" ? village?.state_hi : village?.state})
                    </span>
                  </h3>

                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1 font-mono">
                      <Compass className="h-3.5 w-3.5 text-emerald-400" />
                      {village?.latitude.toFixed(4)}°N, {village?.longitude.toFixed(4)}°E
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-mono">
                      <Layers className="h-3.5 w-3.5 text-sky-400" />
                      {language === "hi" ? `ऊंचाई: ${village?.elevation_m} मी` : `Elevation: ${village?.elevation_m}m`}
                    </span>
                    <span>•</span>
                    <span className="text-amber-300 font-medium">
                      {language === "hi" ? `मिट्टी: ${village?.soil_type_hi}` : `Soil: ${village?.soil_type}`}
                    </span>
                  </p>
                </div>

                {/* Farm Suitability Badge */}
                {suitability && (
                  <div
                    className={`rounded-2xl border p-4 shrink-0 sm:min-w-[260px] ${
                      suitability.suitability_level === "EXCELLENT"
                        ? "border-emerald-500/30 bg-emerald-950/30 text-emerald-300"
                        : suitability.suitability_level === "MODERATE"
                        ? "border-amber-500/30 bg-amber-950/30 text-amber-300"
                        : "border-rose-500/30 bg-rose-950/30 text-rose-300"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-1">
                      <span>{language === "hi" ? "आज खेती अनुकूलता" : "Farm Suitability"}</span>
                      <span className="text-base font-black">{suitability.overall_suitability_score}/100</span>
                    </div>
                    <div className="text-sm font-extrabold text-white">
                      {language === "hi" ? suitability.spray_verdict_hi : suitability.spray_verdict}
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                      {language === "hi" ? suitability.key_advice_hi : suitability.key_advice_en}
                    </p>
                  </div>
                )}
              </div>

              {/* Weather Telemetry Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                {/* 1. Temperature with Elevation Adjustment */}
                <div className="rounded-2xl border border-slate-800 bg-[#0E1722] p-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-semibold">
                      <Thermometer className="h-4 w-4 text-amber-400" />
                      {language === "hi" ? "तापमान" : "Temperature"}
                    </span>
                    {adjustments && adjustments.temperature_adjustment_c !== 0 && (
                      <span className="flex items-center text-[10px] font-mono text-cyan-400 font-bold">
                        {adjustments.temperature_adjustment_c < 0 ? (
                          <TrendingDown className="h-3 w-3 mr-0.5" />
                        ) : (
                          <TrendingUp className="h-3 w-3 mr-0.5" />
                        )}
                        {adjustments.temperature_adjustment_c > 0 ? "+" : ""}
                        {adjustments.temperature_adjustment_c}°C
                      </span>
                    )}
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white">
                    {adjustments?.adjusted_temperature ?? current?.temperature}°C
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {language === "hi"
                      ? `अनुभूत: ${current?.apparent_temperature}°C (ऊंचाई समायोजित)`
                      : `Feels like: ${current?.apparent_temperature}°C (Elevation corrected)`}
                  </p>
                </div>

                {/* 2. Rain Probability & Accumulation */}
                <div className="rounded-2xl border border-slate-800 bg-[#0E1722] p-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-semibold">
                      <CloudRain className="h-4 w-4 text-sky-400" />
                      {language === "hi" ? "वर्षा संभावना" : "Rain Probability"}
                    </span>
                    <span className="text-[10px] font-bold text-sky-400">
                      {current?.precipitation_sum_today} mm
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white">
                    {adjustments?.adjusted_rain_probability ?? current?.rain_probability_today}%
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {language === "hi"
                      ? current?.precipitation_sum_today! > 0
                        ? `${current?.precipitation_sum_today} मिमी संभावित`
                        : "मौसम सूखा रहने का अनुमान"
                      : current?.precipitation_sum_today! > 0
                      ? `${current?.precipitation_sum_today} mm expected`
                      : "Predominantly dry conditions"}
                  </p>
                </div>

                {/* 3. Humidity & Disease Trigger */}
                <div className="rounded-2xl border border-slate-800 bg-[#0E1722] p-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-semibold">
                      <Droplets className="h-4 w-4 text-blue-400" />
                      {language === "hi" ? "सापेक्षिक आर्द्रता" : "Humidity"}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {current?.relative_humidity! >= 75 ? "⚠️ High" : "Normal"}
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white">
                    {current?.relative_humidity}%
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {language === "hi"
                      ? `स्थिति: ${current?.condition_hi}`
                      : `Condition: ${current?.condition_en}`}
                  </p>
                </div>

                {/* 4. Wind Speed & Chemical Drift */}
                <div className="rounded-2xl border border-slate-800 bg-[#0E1722] p-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-semibold">
                      <Wind className="h-4 w-4 text-teal-400" />
                      {language === "hi" ? "हवा की गति" : "Wind Speed"}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {language === "hi" ? `झोंके ${current?.wind_gusts} km/h` : `Gusts ${current?.wind_gusts} km/h`}
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white">
                    {current?.wind_speed} <span className="text-xs font-normal text-slate-400">km/h</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {current?.wind_speed! <= 12
                      ? language === "hi"
                        ? "छिड़काव हेतु शांत हवा"
                        : "Calm: safe spray window"
                      : language === "hi"
                      ? "तेज हवा: दवा बहने का जोखिम"
                      : "Breezy: spray drift hazard"}
                  </p>
                </div>
              </div>

              {/* Task 5: Soil Retention & Elevation Correction Explanatory Card */}
              {adjustments && (
                <div className="mt-5 rounded-2xl border border-cyan-500/20 bg-cyan-950/10 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
                    <Sparkles className="h-4 w-4" />
                    <span>{language === "hi" ? "माइक्रो-क्लाइमेट भौतिक समायोजन" : "Micro-Climate Physics Corrections"}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
                    <div className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold">•</span>
                      <span>
                        {language === "hi"
                          ? `ऊंचाई अंतर: बेस स्टेशन से ${adjustments.elevation_diff_m > 0 ? "+" : ""}${adjustments.elevation_diff_m} मी (तापमान सुधार: ${adjustments.temperature_adjustment_c}°C)`
                          : `Elevation Delta: ${adjustments.elevation_diff_m > 0 ? "+" : ""}${adjustments.elevation_diff_m}m vs district station (Lapse Rate correction: ${adjustments.temperature_adjustment_c}°C)`}
                      </span>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold">•</span>
                      <span>
                        {language === "hi"
                          ? `मिट्टी जलधारण क्षमता: ${adjustments.soil_type_hi} (${adjustments.soil_moisture_retention}) — सिंचाई अंतराल में ${adjustments.irrigation_interval_adjustment_days > 0 ? "+" : ""}${adjustments.irrigation_interval_adjustment_days} दिन का समायोजन`
                          : `Soil Water Capacity: ${adjustments.soil_type} (${adjustments.soil_moisture_retention}) — Irrigation cycle adjusted by ${adjustments.irrigation_interval_adjustment_days > 0 ? "+" : ""}${adjustments.irrigation_interval_adjustment_days} days`}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Linked Micro-Climate Zone Details Card (Task 2 & 3) */}
            {climateZone && (
              <div className="rounded-3xl border border-slate-800 bg-[#0A121A] p-6 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      <Layers className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-purple-400 uppercase font-bold tracking-wider">
                        Zone #{climateZone.zone_id} • {climateZone.zone_code}
                      </span>
                      <h4 className="text-base font-bold text-white">
                        {language === "hi" ? climateZone.zone_name_hi : climateZone.zone_name}
                      </h4>
                    </div>
                  </div>

                  <span className="text-xs font-semibold px-3 py-1 rounded-xl bg-slate-800 text-slate-300">
                    {language === "hi" ? `पाला जोखिम: ${climateZone.frost_risk_hi || climateZone.frost_risk}` : `Frost Risk: ${climateZone.frost_risk}`}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 text-xs">
                  <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-3">
                    <span className="text-slate-400 font-semibold">{language === "hi" ? "औसत मानसूनी वर्षा:" : "Average Monsoon Rain:"}</span>
                    <p className="font-bold text-white mt-0.5">{climateZone.average_rainfall_monsoon}</p>
                    <p className="text-[11px] text-slate-500 mt-1">{climateZone.monsoon_start} – {climateZone.monsoon_end}</p>
                  </div>

                  <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-3">
                    <span className="text-slate-400 font-semibold">{language === "hi" ? "तापमान सीमाएं (ग्रीष्म/शीत):" : "Temp Extremes (Summer/Winter):"}</span>
                    <p className="font-bold text-white mt-0.5">{climateZone.average_temp_summer} / {climateZone.average_temp_winter}</p>
                    <p className="text-[11px] text-slate-500 mt-1">{climateZone.soil_type}</p>
                  </div>

                  <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-3">
                    <span className="text-slate-400 font-semibold">{language === "hi" ? "प्रमुख क्षेत्रीय फसलें:" : "Primary Regional Crops:"}</span>
                    <p className="font-bold text-white mt-0.5">{climateZone.primary_crops.join(", ")}</p>
                    <p className="text-[11px] text-slate-500 mt-1 truncate">{climateZone.characteristic_weather}</p>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 2: पास के गांव (Nearby Villages Micro-Forecasts) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Navigation className="h-5 w-5 text-sky-400" />
                    <span>{language === "hi" ? "पास के गांव (माइक्रो-पूर्वानुमान तुलना)" : "Nearby Villages (Micro-Forecast Comparison)"}</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {language === "hi"
                      ? `${village?.village_name} के 10-50 किमी दायरे के गांव • किसी पर क्लिक करके उसका मौसम देखें`
                      : `Villages within 10-50 km of ${village?.village_name} • Click any to switch view`}
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-400 font-semibold">
                  {nearby.length} {language === "hi" ? "गांव उपलब्ध" : "localities found"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {nearby.map((nb) => (
                  <button
                    key={`${nb.pincode}-${nb.village_name}`}
                    onClick={() => handleSelectVillage(nb.pincode)}
                    type="button"
                    className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-[#0A121A] p-4 text-left hover:border-emerald-500/50 hover:bg-[#0E1824] transition-all group shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-cyan-400 font-bold">
                          PIN {nb.pincode}
                        </span>
                        <span className="text-slate-400 text-[11px] font-semibold bg-slate-800 px-2 py-0.5 rounded-md">
                          {nb.distance_km} km
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white mt-1 group-hover:text-emerald-400 transition-colors">
                        {language === "hi" ? nb.village_name_hi : nb.village_name}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {language === "hi" ? nb.district_hi : nb.district} • {nb.elevation_m}m
                      </p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-base font-black text-white">{nb.temperature}°C</span>
                        <span className="text-[11px] text-slate-400 ml-1.5">Rain {nb.rain_probability}%</span>
                      </div>

                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          nb.spray_suitability === "FAVOURABLE"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : nb.spray_suitability === "CAUTION"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        {nb.spray_suitability}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* SECTION 3: तुलना एवं हीटमैप (Micro-Climate Comparison Heatmap) */}
            <div className="rounded-3xl border border-slate-800 bg-[#0A121A] p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-400" />
                    <span>{language === "hi" ? "तुलना एवं माइक्रो-क्लाइमेट हीटमैप" : "Micro-Climate Comparison Heatmap"}</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    {language === "hi"
                      ? "आज कौन से गांव में छिड़काव व सिंचाई के सबसे सुरक्षित हालात हैं"
                      : "Which neighboring villages have the safest spray & soil conditions today"}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    {language === "hi" ? "अनुकूल (75+)" : "Favourable (75+)"}
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    {language === "hi" ? "सावधानी (50-74)" : "Caution (50-74)"}
                  </span>
                  <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                    {language === "hi" ? "प्रतिकूल (<50)" : "Adverse (<50)"}
                  </span>
                </div>
              </div>

              {/* Table / Heatmap Matrix */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                      <th className="py-2.5 px-3">{language === "hi" ? "गांव / पिनकोड" : "Village / PIN"}</th>
                      <th className="py-2.5 px-3">{language === "hi" ? "दूरी" : "Distance"}</th>
                      <th className="py-2.5 px-3">{language === "hi" ? "ऊंचाई" : "Elevation"}</th>
                      <th className="py-2.5 px-3">{language === "hi" ? "तापमान" : "Temp"}</th>
                      <th className="py-2.5 px-3">{language === "hi" ? "वर्षा संभावना" : "Rain Prob"}</th>
                      <th className="py-2.5 px-3">{language === "hi" ? "हवा" : "Wind"}</th>
                      <th className="py-2.5 px-3">{language === "hi" ? "स्प्रे निर्णय" : "Spray Verdict"}</th>
                      <th className="py-2.5 px-3 text-right">{language === "hi" ? "स्कोर" : "Score"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {/* Active Village Row */}
                    <tr className="bg-emerald-950/20 font-bold text-white">
                      <td className="py-3 px-3">
                        <span className="text-emerald-400 font-black">★ </span>
                        {language === "hi" ? village?.village_name_hi : village?.village_name} ({village?.pincode})
                      </td>
                      <td className="py-3 px-3 text-emerald-400">{language === "hi" ? "सक्रिय गांव" : "Active"}</td>
                      <td className="py-3 px-3">{village?.elevation_m}m</td>
                      <td className="py-3 px-3">{adjustments?.adjusted_temperature}°C</td>
                      <td className="py-3 px-3">{adjustments?.adjusted_rain_probability}%</td>
                      <td className="py-3 px-3">{current?.wind_speed} km/h</td>
                      <td className="py-3 px-3">
                        <span className="text-emerald-300">{suitability?.spray_verdict}</span>
                      </td>
                      <td className="py-3 px-3 text-right font-black text-emerald-400">
                        {suitability?.overall_suitability_score}/100
                      </td>
                    </tr>

                    {/* Nearby Villages */}
                    {nearby.map((nb) => (
                      <tr
                        key={`heatmap-${nb.pincode}-${nb.village_name}`}
                        className="hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3 px-3">
                          <button
                            onClick={() => handleSelectVillage(nb.pincode)}
                            type="button"
                            className="font-medium text-white hover:text-emerald-400 hover:underline text-left"
                          >
                            {language === "hi" ? nb.village_name_hi : nb.village_name} ({nb.pincode})
                          </button>
                        </td>
                        <td className="py-3 px-3 text-slate-400">{nb.distance_km} km</td>
                        <td className="py-3 px-3 text-slate-300">{nb.elevation_m}m</td>
                        <td className="py-3 px-3 text-white font-bold">{nb.temperature}°C</td>
                        <td className="py-3 px-3 text-slate-300">{nb.rain_probability}%</td>
                        <td className="py-3 px-3 text-slate-300">{nb.wind_speed} km/h</td>
                        <td className="py-3 px-3">
                          <span
                            className={`font-semibold ${
                              nb.spray_suitability === "FAVOURABLE"
                                ? "text-emerald-400"
                                : nb.spray_suitability === "CAUTION"
                                ? "text-amber-400"
                                : "text-rose-400"
                            }`}
                          >
                            {nb.spray_suitability}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-bold">
                          <span
                            className={`px-2 py-0.5 rounded-md ${
                              nb.farming_suitability_score >= 75
                                ? "bg-emerald-500/10 text-emerald-400"
                                : nb.farming_suitability_score >= 50
                                ? "bg-amber-500/10 text-amber-400"
                                : "bg-rose-500/10 text-rose-400"
                            }`}
                          >
                            {nb.farming_suitability_score}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

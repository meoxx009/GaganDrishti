"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Navigation,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Compass,
  MapPin,
  Car,
  Bike,
  Truck,
  Bus,
  CloudRain,
  Wind,
  Thermometer,
  ArrowRight,
  PhoneCall,
  Search,
  CheckCircle2,
  ChevronRight,
  Route,
  Info,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { VehicleType, TravelDecisionOutput } from "@/lib/weather/travelRouteTypes";

interface PredefinedRouteItem {
  origin: string;
  destination: string;
  name: string;
  distance: number;
}

const PREDEFINED_ROUTES: PredefinedRouteItem[] = [
  { origin: "Bhopal", destination: "Sagar", name: "Bhopal to Sagar (NH-39)", distance: 168 },
  { origin: "Bhopal", destination: "Indore", name: "Bhopal to Indore Expressway", distance: 195 },
  { origin: "Bhopal", destination: "Gwalior", name: "Bhopal to Gwalior (NH-46)", distance: 425 },
  { origin: "Bhopal", destination: "Jabalpur", name: "Bhopal to Jabalpur (NH-45)", distance: 295 },
  { origin: "Mumbai", destination: "Pune", name: "Mumbai to Pune Expressway", distance: 148 },
  { origin: "Delhi", destination: "Jaipur", name: "Delhi to Jaipur (NH-48)", distance: 280 },
  { origin: "Delhi", destination: "Agra", name: "Yamuna Expressway (Delhi to Agra)", distance: 210 },
  { origin: "Delhi", destination: "Chandigarh", name: "Delhi to Chandigarh (NH-44)", distance: 245 },
  { origin: "Bengaluru", destination: "Chennai", name: "Bengaluru to Chennai (NH-48)", distance: 345 },
  { origin: "Bengaluru", destination: "Mysuru", name: "Bengaluru to Mysuru Expressway", distance: 145 },
  { origin: "Hyderabad", destination: "Vijayawada", name: "Hyderabad to Vijayawada (NH-65)", distance: 275 },
  { origin: "Kolkata", destination: "Digha", name: "Kolkata to Digha Coastal Highway", distance: 185 },
];

export default function TravelRoutesPage() {
  const [origin, setOrigin] = useState<string>("Bhopal");
  const [destination, setDestination] = useState<string>("Sagar");
  const [vehicle, setVehicle] = useState<VehicleType>("Bike");
  const [language, setLanguage] = useState<"en" | "hi">("hi");
  const [loading, setLoading] = useState<boolean>(false);
  const [decision, setDecision] = useState<TravelDecisionOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch travel route assessment
  const fetchRouteDecision = async (orig: string, dest: string, veh: VehicleType) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/travel-route?origin=${encodeURIComponent(orig)}&destination=${encodeURIComponent(
          dest
        )}&vehicle=${encodeURIComponent(veh)}`
      );
      const data = await res.json();
      if (data.success && data.decision) {
        setDecision(data.decision);
      } else {
        setError(data.error || "Route could not be evaluated");
      }
    } catch (err: any) {
      setError(err.message || "Failed to reach server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRouteDecision(origin, destination, vehicle);
  }, []);

  const handleInspect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin.trim() || !destination.trim()) return;
    fetchRouteDecision(origin.trim(), destination.trim(), vehicle);
  };

  const handleSelectPreset = (preset: PredefinedRouteItem) => {
    setOrigin(preset.origin);
    setDestination(preset.destination);
    fetchRouteDecision(preset.origin, preset.destination, vehicle);
  };

  const handleVehicleChange = (newVehicle: VehicleType) => {
    setVehicle(newVehicle);
    if (decision) {
      fetchRouteDecision(origin, destination, newVehicle);
    }
  };

  const isHi = language === "hi";

  // Score colors
  const getScoreBadge = (score: number) => {
    if (score >= 7) {
      return {
        bg: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
        label: isHi ? "सुरक्षित (SAFE)" : "SAFE",
        desc: isHi ? "यात्रा हेतु अनुकूल मौसम" : "Favourable travelling conditions",
      };
    }
    if (score >= 5) {
      return {
        bg: "bg-amber-500/10 text-amber-600 border-amber-500/20",
        label: isHi ? "सावधानी (CAUTION)" : "CAUTION",
        desc: isHi ? "मार्ग में वर्षा व फिसलन की संभावना" : "Moderate road risks detected",
      };
    }
    return {
      bg: "bg-red-500/10 text-red-600 border-red-500/20",
      label: isHi ? "टालें (AVOID / DELAY)" : "AVOID / DELAY",
      desc: isHi ? "भारी बारिश या घाट खतरा" : "Severe weather hazards",
    };
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Header & Breadcrumbs */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 text-slate-600 dark:text-slate-400 hover:text-blue-600 transition"
              title="Return to Home"
            >
              <Navigation className="w-5 h-5 rotate-45" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                  CHANGE_006
                </span>
                <span className="text-xs text-slate-500 font-medium">NHAI & IMD Corridors</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {isHi ? "मार्ग मौसम सुरक्षा एवं यात्रा निर्णय प्रणाली" : "Travel Route Weather Safety Intelligence"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setLanguage(isHi ? "en" : "hi")}
              className="px-3.5 py-1.5 text-sm font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {isHi ? "English" : "हिंदी"}
            </button>
            <Link
              href="/"
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              {isHi ? "मुख्य डैशबोर्ड" : "Main Dashboard"} &rarr;
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Route Selector & Preset Catalog */}
        <div className="lg:col-span-4 space-y-6">
          {/* Search Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
              <Route className="w-5 h-5 text-blue-500" />
              {isHi ? "यात्रा मार्ग चुनें" : "Select Travel Corridor"}
            </h2>

            <form onSubmit={handleInspect} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  {isHi ? "प्रारंभिक शहर (Origin)" : "Origin City"}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-emerald-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder={isHi ? "उदा. Bhopal, Indore, Delhi..." : "e.g. Bhopal, Indore, Delhi..."}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  {isHi ? "गंतव्य शहर (Destination)" : "Destination City"}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-rose-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder={isHi ? "उदा. Sagar, Jabalpur, Mumbai..." : "e.g. Sagar, Jabalpur, Mumbai..."}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Vehicle Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  {isHi ? "वाहन का प्रकार (Vehicle Type)" : "Mode of Transport"}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: "Bike", label: isHi ? "बाइक" : "Bike", icon: Bike },
                    { id: "Car", label: isHi ? "कार" : "Car", icon: Car },
                    { id: "Truck", label: isHi ? "ट्रक" : "Truck", icon: Truck },
                    { id: "Bus", label: isHi ? "बस" : "Bus", icon: Bus },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = vehicle === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleVehicleChange(item.id as VehicleType)}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition ${
                          isSelected
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <Icon className="w-5 h-5 mb-1" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {isHi ? "विश्लेषण हो रहा है..." : "Evaluating Corridor..."}
                  </span>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    {isHi ? "मार्ग सुरक्षा जांचें" : "Inspect Route Safety"}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Popular Predefined Highways */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-between">
              <span>{isHi ? "प्रमुख भारतीय हाईवे मार्ग" : "Popular Highway Corridors"}</span>
              <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono">
                {PREDEFINED_ROUTES.length} Routes
              </span>
            </h3>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {PREDEFINED_ROUTES.map((p, idx) => {
                const isSelected = origin === p.origin && destination === p.destination;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className={`w-full text-left p-3 rounded-xl border text-sm transition flex items-center justify-between group ${
                      isSelected
                        ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500/50 text-blue-900 dark:text-blue-100"
                        : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                        <span>{p.origin} &rarr; {p.destination}</span>
                        <span>•</span>
                        <span>{p.distance} km</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Route Decision & Waypoints Telemetry */}
        <div className="lg:col-span-8 space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <div className="text-sm font-medium">{error}</div>
            </div>
          )}

          {decision && (
            <>
              {/* Main Safety Header Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                  <div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {decision.route_name}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black mt-2 text-slate-900 dark:text-white">
                      {decision.origin} &rarr; {decision.destination}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                      <span><strong>{decision.distance_km}</strong> km distance</span>
                      <span>•</span>
                      <span>~<strong>{decision.estimated_time_hours}</strong> hours travel time</span>
                      <span>•</span>
                      <span className="capitalize font-semibold text-blue-600 dark:text-blue-400">{decision.vehicle_type} Mode</span>
                    </div>
                  </div>

                  {/* Safety Score Radial Badge */}
                  <div className={`p-4 rounded-2xl border text-center ${getScoreBadge(decision.overall_safety_score).bg}`}>
                    <div className="text-xs font-bold uppercase tracking-wider">
                      {isHi ? "सुरक्षा स्कोर" : "Safety Score"}
                    </div>
                    <div className="text-4xl font-extrabold my-0.5">
                      {decision.overall_safety_score}
                      <span className="text-lg font-normal text-slate-400">/10</span>
                    </div>
                    <div className="text-xs font-semibold px-2 py-0.5 rounded-full inline-block bg-white/60 dark:bg-slate-900/60 mt-1">
                      {getScoreBadge(decision.overall_safety_score).label}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-sm">
                  <strong>{isHi ? "निर्णय सारांश: " : "Verdict: "}</strong>
                  <span className="text-slate-700 dark:text-slate-300">
                    {isHi ? decision.safety_verdict_hi : decision.safety_verdict}
                  </span>
                </div>
              </div>

              {/* Critical Alert Cards Grid: Worst Zone & Departure Slot */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Worst Weather Zone */}
                <div className="bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-2xl p-5">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-sm mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    {isHi ? "सबसे संवेदनशील मौसमी क्षेत्र (Hazard Zone)" : "Worst Weather Zone"}
                  </div>
                  <div className="text-base font-bold text-slate-900 dark:text-white">
                    {decision.worst_weather_zone.location}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    {isHi ? decision.worst_weather_zone.weather_summary_hi : decision.worst_weather_zone.weather_summary}
                  </div>
                  <div className="mt-3 pt-3 border-t border-red-500/10 text-xs text-red-700 dark:text-red-300 flex items-center justify-between">
                    <span><strong>{isHi ? "जोखिम:" : "Hazard:"}</strong> {decision.worst_weather_zone.risk_factor}</span>
                  </div>
                </div>

                {/* Best Departure Window */}
                <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm mb-2">
                    <Clock className="w-4 h-4" />
                    {isHi ? "सर्वश्रेष्ठ प्रस्थान समय (Best Travel Window)" : "Best Departure Window"}
                  </div>
                  <div className="text-base font-bold text-slate-900 dark:text-white">
                    {decision.best_travel_time}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    {isHi
                      ? "न्यूनतम आंधी/वर्षा जोखिम, शांत हवा और साफ विजिबिलिटी।"
                      : "Minimum convective rain risk, calm crosswinds and optimal visibility."}
                  </div>
                  <div className="mt-3 pt-3 border-t border-emerald-500/10 text-xs text-amber-600 dark:text-amber-400 flex items-center justify-between">
                    <span><strong>{isHi ? "टालने योग्य समय:" : "Avoid Window:"}</strong> {decision.worst_travel_time}</span>
                  </div>
                </div>
              </div>

              {/* Departure Windows Comparison */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-base font-bold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  {isHi ? "दिन के समय अनुसार यात्रा सुरक्षा स्तर" : "Departure Time Window Analysis"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {decision.time_recommendations.map((slot, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border text-xs flex flex-col justify-between ${
                        slot.is_best
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200"
                          : slot.is_worst
                          ? "bg-red-500/10 border-red-500/30 text-red-950 dark:text-red-200"
                          : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold">{isHi ? slot.time_slot_hi : slot.time_slot}</span>
                          {slot.is_best && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white">
                              BEST
                            </span>
                          )}
                          {slot.is_worst && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white">
                              AVOID
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          {isHi ? slot.verdict_hi : slot.verdict}
                        </div>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center font-bold">
                        <span>{isHi ? "सुरक्षा" : "Score"}:</span>
                        <span>{slot.safety_score}/10</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vehicle-Specific Tailored Guidance */}
              {decision.vehicle_specific_risks && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-indigo-500" />
                      {isHi ? `वाहन विशिष्ट सुरक्षा सलाह: ${decision.vehicle_specific_risks.vehicle}` : `Vehicle Mode Advisory: ${decision.vehicle_specific_risks.vehicle}`}
                    </h3>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                      decision.vehicle_specific_risks.risk_level === "HIGH"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                    }`}>
                      {decision.vehicle_specific_risks.risk_level} RISK
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-4 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    {isHi ? decision.vehicle_specific_risks.reason_hi : decision.vehicle_specific_risks.reason}
                  </p>

                  <div className="space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      {isHi ? "महत्वपूर्ण सुरक्षा निर्देश:" : "Safety Action Checklist:"}
                    </div>
                    <ul className="space-y-1.5 text-xs sm:text-sm">
                      {(isHi ? decision.vehicle_specific_risks.precautions_hi : decision.vehicle_specific_risks.precautions).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Intermediate Waypoints Visualizer */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold flex items-center gap-2">
                    <Compass className="w-5 h-5 text-blue-500" />
                    {isHi ? "मार्ग के मध्यवर्ती बिंदु व मौसम (Waypoints)" : "Route Intermediate Waypoints & Weather"}
                  </h3>
                  <span className="text-xs text-slate-500">
                    {decision.waypoints.length} {isHi ? "बिंदु ट्रैक किए गए" : "points tracked"}
                  </span>
                </div>

                <div className="relative border-l-2 border-blue-500/30 ml-4 pl-6 space-y-4">
                  {decision.waypoints.map((pt, idx) => {
                    const isHazard = pt.safety_rating === "HAZARD";
                    const isCaution = pt.safety_rating === "CAUTION";
                    return (
                      <div key={idx} className="relative group">
                        {/* Dot */}
                        <div
                          className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 shadow ${
                            isHazard ? "bg-red-500" : isCaution ? "bg-amber-500" : "bg-emerald-500"
                          }`}
                        />
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-blue-400 transition">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <div className="font-bold text-sm text-slate-900 dark:text-white">
                                {pt.city_name}{" "}
                                <span className="text-xs font-normal text-slate-500">
                                  (km {pt.km_from_origin})
                                </span>
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                {pt.weather_characteristic}
                              </div>
                            </div>

                            <div className="flex items-center gap-3 text-xs">
                              {pt.temperature !== undefined && (
                                <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                                  <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                                  {pt.temperature}°C
                                </span>
                              )}
                              {pt.rain_probability !== undefined && (
                                <span className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400">
                                  <CloudRain className="w-3.5 h-3.5" />
                                  {pt.rain_probability}%
                                </span>
                              )}
                              {pt.wind_speed !== undefined && (
                                <span className="flex items-center gap-1 text-slate-500">
                                  <Wind className="w-3.5 h-3.5" />
                                  {pt.wind_speed} km/h
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                            <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span>{pt.risk_factor}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Alternative Route & Emergency Numbers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Alternative Routes */}
                {decision.alternative_routes && decision.alternative_routes.length > 0 && (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-sm font-bold flex items-center gap-2 mb-3">
                      <Route className="w-4 h-4 text-emerald-500" />
                      {isHi ? "वैकल्पिक सुरक्षित मार्ग (Alternative Route)" : "Alternative Safer Route"}
                    </h3>
                    {decision.alternative_routes.map((alt, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                        <div className="font-bold text-slate-900 dark:text-white">{alt.route}</div>
                        <div className="text-slate-500 mt-1">
                          {alt.distance_km} km • ~{alt.time_hours} hrs
                        </div>
                        <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-emerald-700 dark:text-emerald-300 font-medium">
                          {isHi ? alt.safety_advantage_hi : alt.safety_advantage}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Emergency Helplines */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h3 className="text-sm font-bold flex items-center gap-2 mb-3">
                    <PhoneCall className="w-4 h-4 text-rose-500" />
                    {isHi ? "हाईवे आपातकालीन हेल्पलाइन नंबर" : "Emergency Highway Helplines"}
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <div className="text-slate-500">{isHi ? "NHAI हाईवे पेट्रोल" : "NHAI Highway Patrol"}</div>
                      <div className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                        {decision.emergency_contacts.traffic_highway_patrol}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <div className="text-slate-500">{isHi ? "पुलिस / आपातकाल" : "National Emergency"}</div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                        {decision.emergency_contacts.police}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <div className="text-slate-500">{isHi ? "एम्बुलेंस सेवा" : "Ambulance"}</div>
                      <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {decision.emergency_contacts.ambulance}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <div className="text-slate-500">{isHi ? "राज्य आपदा प्रबंधन" : "Disaster Control"}</div>
                      <div className="text-sm font-bold text-purple-600 dark:text-purple-400 mt-0.5">
                        {decision.emergency_contacts.disaster_ndrf}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapPin,
  RefreshCw,
  LocateFixed,
  AlertTriangle,
  ShieldCheck,
  Info,
  Droplets,
  Wind,
  Thermometer,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { fetchAllCitiesRisk, CityRiskPoint, MapTierLevel } from "@/lib/weather/mapRiskService";
import { City } from "@/lib/types";

interface WeatherRiskMapProps {
  focusedPoint?: CityRiskPoint | null;
  onPointsLoaded?: (points: CityRiskPoint[]) => void;
}

export const WeatherRiskMap: React.FC<WeatherRiskMapProps> = ({
  focusedPoint,
  onPointsLoaded,
}) => {
  const { language, city, setCity } = useApp();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [points, setPoints] = useState<CityRiskPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPoint, setSelectedPoint] = useState<CityRiskPoint | null>(null);
  const [activeTierFilter, setActiveTierFilter] = useState<MapTierLevel | "ALL">("ALL");

  // Sync external focused point
  useEffect(() => {
    if (focusedPoint) {
      setSelectedPoint(focusedPoint);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([focusedPoint.city.lat, focusedPoint.city.lon], 7, {
          animate: true,
        });
      }
    }
  }, [focusedPoint]);

  // Load telemetry for all 10 cities
  const loadData = async (force: boolean = false) => {
    setLoading(true);
    try {
      const data = await fetchAllCitiesRisk(force);
      setPoints(data);
      if (onPointsLoaded) {
        onPointsLoaded(data);
      }
    } catch (err) {
      console.error("Failed to load map risks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on selected city or default coordinates (India center)
    const initialLat = city?.lat || 20.5937;
    const initialLon = city?.lon || 78.9629;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLon],
      zoom: 5,
      zoomControl: false,
      attributionControl: false,
    });

    // High performance Voyager tiles from CartoDB
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      maxZoom: 18,
      subdomains: "abcd",
    }).addTo(map);

    L.control.zoom({ position: "topright" }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

  // Recenter if selected city changes from outside
  useEffect(() => {
    if (mapInstanceRef.current && city && !focusedPoint) {
      mapInstanceRef.current.setView([city.lat, city.lon], 6, {
        animate: true,
      });
    }
  }, [city]);

  // Handle tier filter selection
  const handleTierClick = (tier: MapTierLevel) => {
    if (activeTierFilter === tier) {
      // Toggle off
      setActiveTierFilter("ALL");
      setSelectedPoint(null);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([city.lat, city.lon], 5, { animate: true });
      }
      return;
    }

    setActiveTierFilter(tier);
    const matching = points.filter((p) => p.tierLevel === tier);
    if (matching.length > 0) {
      setSelectedPoint(matching[0]);
      if (mapInstanceRef.current) {
        if (matching.length === 1) {
          mapInstanceRef.current.setView([matching[0].city.lat, matching[0].city.lon], 7, { animate: true });
        } else {
          const bounds = L.latLngBounds(matching.map((p) => [p.city.lat, p.city.lon]));
          mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 8, animate: true });
        }
      }
    } else {
      setSelectedPoint(null);
    }
  };

  const handleResetFilter = () => {
    setActiveTierFilter("ALL");
    setSelectedPoint(null);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([city.lat, city.lon], 5, { animate: true });
    }
  };

  // Render markers and circles whenever points, activeTierFilter, or language changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer || points.length === 0) return;

    layer.clearLayers();

    const displayPoints = activeTierFilter === "ALL" 
      ? points 
      : points.filter((p) => p.tierLevel === activeTierFilter);

    displayPoints.forEach((pt) => {
      const isCurrent = pt.city.id === city.id;
      const isFocused = selectedPoint?.city.id === pt.city.id;
      const cityName = language === "hi" ? pt.city.nameHi : pt.city.nameEn;

      // Circular translucent risk zone (radius 35km)
      const circle = L.circle([pt.city.lat, pt.city.lon], {
        radius: isFocused ? 45000 : 35000,
        color: pt.riskColor,
        fillColor: pt.riskColor,
        fillOpacity: isFocused ? 0.45 : isCurrent ? 0.35 : 0.22,
        weight: isFocused ? 3 : isCurrent ? 2.5 : 1.5,
        dashArray: isCurrent ? "4, 4" : undefined,
      });

      // Custom HTML Marker Pin
      const iconHtml = `
        <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -50%); cursor: pointer;">
          <div style="
            position: relative;
            background-color: ${pt.riskColor};
            width: ${isFocused ? "22px" : isCurrent ? "18px" : "14px"};
            height: ${isFocused ? "22px" : isCurrent ? "18px" : "14px"};
            border-radius: 50%;
            border: ${isFocused ? "3px solid #ffffff" : "2px solid #ffffff"};
            box-shadow: 0 0 14px ${pt.riskColor};
          ">
            ${
              isFocused || isCurrent
                ? `<div style="position: absolute; inset: -5px; border-radius: 50%; border: 2px solid ${pt.riskColor}; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; opacity: 0.85;"></div>`
                : ""
            }
          </div>
          <span style="
            font-size: ${isFocused ? "11.5px" : "10.5px"};
            font-weight: 700;
            color: #ffffff;
            background: ${isFocused ? "rgba(15, 23, 42, 0.98)" : "rgba(15, 23, 42, 0.9)"};
            padding: ${isFocused ? "2px 8px" : "1.5px 6px"};
            border-radius: 6px;
            margin-top: 3px;
            white-space: nowrap;
            border: 1px solid ${isFocused ? pt.riskColor : "rgba(255, 255, 255, 0.2)"};
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
          ">${cityName}</span>
        </div>
      `;

      const markerIcon = L.divIcon({
        className: "custom-risk-marker",
        html: iconHtml,
        iconSize: [0, 0],
      });

      const marker = L.marker([pt.city.lat, pt.city.lon], { icon: markerIcon });

      const handleSelect = () => {
        setSelectedPoint(pt);
      };

      marker.on("click", handleSelect);
      circle.on("click", handleSelect);

      layer.addLayer(circle);
      layer.addLayer(marker);
    });
  }, [points, city, language, activeTierFilter, selectedPoint]);

  const recenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([city.lat, city.lon], 6, {
        animate: true,
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Map Header & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <MapPin className="h-5 w-5 text-sky-500" />
            <span>
              {language === "hi"
                ? "अखिल भारतीय मौसम जोखिम मानचित्र (10 शहर)"
                : "Pan-India Weather Risk Map (10 Cities)"}
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {language === "hi"
              ? "ओपन-मेटियो पूर्वानुमान आधार पर निर्धारित क्षेत्रीय जोखिम स्तर"
              : "Numerical forecast-derived risk zones evaluated across monitored centers"}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={recenter}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080E14] px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#0B1219] transition-colors shadow-2xs"
            title={language === "hi" ? "वर्तमान शहर पर केंद्रित करें" : `Recenter on ${city.nameEn}`}
          >
            <LocateFixed className="h-3.5 w-3.5 text-sky-600 dark:text-sky-500" />
            <span>{language === "hi" ? "पुनः केंद्रित करें" : "Recenter"}</span>
          </button>

          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080E14] px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#0B1219] transition-colors shadow-2xs disabled:opacity-50"
            title="Refresh All Cities Telemetry"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-sky-600 dark:text-sky-500 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">
              {loading ? (language === "hi" ? "अद्यतन..." : "Updating...") : (language === "hi" ? "ताज़ा करें" : "Refresh")}
            </span>
          </button>
        </div>
      </div>

      {/* Map Viewport Container */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800/80 bg-slate-100 dark:bg-[#060C12] shadow-xs h-[460px] sm:h-[520px]">
        {/* The Leaflet Map Canvas */}
        <div ref={mapContainerRef} className="h-full w-full z-0" />

        {/* Legend Overlay (Top Left) */}
        <div className="absolute top-3 left-3 z-10 rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white/95 dark:bg-[#080E14]/95 backdrop-blur-md p-3 shadow-md text-xs space-y-2 max-w-[200px]">
          <div className="flex items-center justify-between gap-1">
            <span className="font-bold text-[11px] text-slate-800 dark:text-[#F8FAFC] block">
              {language === "hi" ? "जोखिम स्तर फ़िल्टर" : "Zone Risk Filter"}
            </span>
            {activeTierFilter !== "ALL" && (
              <button
                type="button"
                onClick={handleResetFilter}
                className="text-[10px] text-sky-600 dark:text-sky-400 hover:underline font-semibold"
              >
                {language === "hi" ? "सभी दिखाएं" : "Reset"}
              </button>
            )}
          </div>

          <div className="space-y-1">
            <button
              type="button"
              onClick={() => handleTierClick("HIGH")}
              className={`w-full flex items-center justify-between gap-2 px-2 py-1 rounded-lg text-left transition-all ${
                activeTierFilter === "HIGH"
                  ? "bg-rose-500/20 border border-rose-500/50 font-bold"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500 shrink-0" />
                <span className="text-[10.5px] text-slate-700 dark:text-[#CBD5E1]">
                  {language === "hi" ? "उच्च जोखिम" : "High (Red)"}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                ({points.filter((p) => p.tierLevel === "HIGH").length})
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTierClick("SIGNIFICANT")}
              className={`w-full flex items-center justify-between gap-2 px-2 py-1 rounded-lg text-left transition-all ${
                activeTierFilter === "SIGNIFICANT"
                  ? "bg-orange-500/20 border border-orange-500/50 font-bold"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-orange-500 shrink-0" />
                <span className="text-[10.5px] text-slate-700 dark:text-[#CBD5E1]">
                  {language === "hi" ? "महत्वपूर्ण" : "Orange"}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                ({points.filter((p) => p.tierLevel === "SIGNIFICANT").length})
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTierClick("MODERATE")}
              className={`w-full flex items-center justify-between gap-2 px-2 py-1 rounded-lg text-left transition-all ${
                activeTierFilter === "MODERATE"
                  ? "bg-amber-500/20 border border-amber-500/50 font-bold"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shrink-0" />
                <span className="text-[10.5px] text-slate-700 dark:text-[#CBD5E1]">
                  {language === "hi" ? "सावधानी / पीला" : "Caution (Yellow)"}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                ({points.filter((p) => p.tierLevel === "MODERATE").length})
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTierClick("LOW")}
              className={`w-full flex items-center justify-between gap-2 px-2 py-1 rounded-lg text-left transition-all ${
                activeTierFilter === "LOW"
                  ? "bg-emerald-500/20 border border-emerald-500/50 font-bold"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-[10.5px] text-slate-700 dark:text-[#CBD5E1]">
                  {language === "hi" ? "सामान्य / हरा" : "Normal (Green)"}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                ({points.filter((p) => p.tierLevel === "LOW").length})
              </span>
            </button>
          </div>

          <div className="pt-1 text-[9.5px] text-slate-400 italic text-center">
            {language === "hi" ? "स्थान पर ज़ूम हेतु स्तर चुनें" : "Tap tier to filter & zoom"}
          </div>
        </div>

        {/* Selected City Detail Card (Bottom Left or Modal Drawer) */}
        {selectedPoint && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-sm z-10 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#080E14]/95 p-4 shadow-xl text-xs space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-[#F8FAFC]">
                  {language === "hi" ? selectedPoint.city.nameHi : selectedPoint.city.nameEn}
                  <span className="text-[11px] text-slate-500 dark:text-[#7F91A3] ml-1.5 font-normal">
                    ({language === "hi" ? selectedPoint.city.stateHi : selectedPoint.city.stateEn})
                  </span>
                </h3>
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold mt-1"
                  style={{
                    backgroundColor: `${selectedPoint.riskColor}20`,
                    color: selectedPoint.riskColor,
                    border: `1px solid ${selectedPoint.riskColor}40`,
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: selectedPoint.riskColor }}
                  />
                  <span>
                    {selectedPoint.tierLevel === "HIGH"
                      ? language === "hi"
                        ? "उच्च जोखिम"
                        : "HIGH RISK"
                      : selectedPoint.tierLevel === "SIGNIFICANT"
                      ? language === "hi"
                        ? "महत्वपूर्ण जोखिम"
                        : "SIGNIFICANT RISK"
                      : selectedPoint.tierLevel === "MODERATE"
                      ? language === "hi"
                        ? "सावधानी / मध्यम"
                        : "CAUTION"
                      : language === "hi"
                      ? "सामान्य स्थिति"
                      : "LOW / NORMAL"}
                  </span>
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPoint(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-sm p-1"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Why This Colour Box */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800/60 bg-[#F8FAFC] dark:bg-[#060C12] p-2.5 space-y-1 text-[11px]">
              <div className="font-semibold text-slate-800 dark:text-[#F8FAFC] flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: selectedPoint.riskColor }} />
                <span>
                  {language === "hi" ? "यह रंग क्यों है?" : "Why this colour?"}:{" "}
                  {language === "hi" ? selectedPoint.primaryReasonHi : selectedPoint.primaryReasonEn}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-[#7F91A3] font-mono">
                {language === "hi" ? selectedPoint.forecastMetricHi : selectedPoint.forecastMetricEn}
              </div>
            </div>

            {/* Telemetry Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-slate-100 dark:border-slate-800/60">
              <div className="rounded-xl bg-[#F8FAFC] dark:bg-[#0B1219] p-2">
                <div className="flex items-center justify-center gap-1 text-sky-600 dark:text-sky-500 mb-0.5">
                  <Thermometer className="h-3 w-3" />
                  <span className="text-[10px] text-slate-500 dark:text-[#7F91A3]">Temp</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-[#F8FAFC] text-xs">
                  {selectedPoint.temp}°C
                </span>
              </div>

              <div className="rounded-xl bg-[#F8FAFC] dark:bg-[#0B1219] p-2">
                <div className="flex items-center justify-center gap-1 text-sky-600 dark:text-sky-500 mb-0.5">
                  <Droplets className="h-3 w-3" />
                  <span className="text-[10px] text-slate-500 dark:text-[#7F91A3]">Rain</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-[#F8FAFC] text-xs">
                  {selectedPoint.rainProb}%
                </span>
              </div>

              <div className="rounded-xl bg-[#F8FAFC] dark:bg-[#0B1219] p-2">
                <div className="flex items-center justify-center gap-1 text-sky-600 dark:text-sky-500 mb-0.5">
                  <Wind className="h-3 w-3" />
                  <span className="text-[10px] text-slate-500 dark:text-[#7F91A3]">Wind</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-[#F8FAFC] text-xs">
                  {selectedPoint.windSpeed} km/h
                </span>
              </div>
            </div>

            {/* Set as Active App City Button */}
            {selectedPoint.city.id !== city.id ? (
              <button
                type="button"
                onClick={() => {
                  setCity(selectedPoint.city);
                  setSelectedPoint(null);
                }}
                className="w-full rounded-xl bg-sky-600 hover:bg-sky-700 text-white dark:bg-sky-500 dark:hover:bg-sky-400 dark:text-slate-950 font-semibold py-2 text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <LocateFixed className="h-3.5 w-3.5" />
                <span>
                  {language === "hi"
                    ? `${selectedPoint.city.nameHi} को सक्रिय शहर चुनें`
                    : `Set as Active City`}
                </span>
              </button>
            ) : (
              <div className="text-center text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold py-1">
                ✓ {language === "hi" ? "वर्तमान में सक्रिय शहर" : "Currently Active City"}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Mandatory Non-Official Map Truthfulness Disclaimer */}
      <div className="flex items-center gap-2 px-2 text-[11px] text-slate-500 dark:text-slate-400">
        <Info className="h-3.5 w-3.5 text-sky-500 shrink-0" />
        <span>
          {language === "hi"
            ? "मानचित्र पर प्रदर्शित जोखिम संकेतक ओपन-मेटियो संख्यात्मक पूर्वानुमान पर आधारित हैं। यह भारतीय मौसम विभाग (IMD) का आधिकारिक चेतावनी बुलेटिन नहीं है।"
            : "Map-rendered zones reflect mathematical Open-Meteo forecast indicators. Not an official IMD warning or color-coded alert bulletin."}
        </span>
      </div>
    </div>
  );
};
export default WeatherRiskMap;

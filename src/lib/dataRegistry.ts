/**
 * Centralized Data Source Registry for GaganDrishti
 * Adheres strictly to SIH 2026 transparency, factual provenance, and non-official attribution rules.
 * Budget: ₹0 (Free & Open APIs only).
 */

export type DataSourceId =
  | "open_meteo_forecast"
  | "open_meteo_models"
  | "open_meteo_historical"
  | "open_meteo_geocoding"
  | "imd_official_bulletins"
  | "openstreetmap_tiles"
  | "browser_web_apis"
  | "gemini_explanation_layer";

export type DataCategory =
  | "live_forecast"
  | "numerical_weather_prediction"
  | "historical_reanalysis"
  | "geocoding_location"
  | "official_government_alerts"
  | "cartography"
  | "client_hardware"
  | "ai_explanation";

export interface DataSourceMeta {
  id: DataSourceId;
  name: string;
  officialAuthority: boolean;
  category: DataCategory;
  primaryEndpoint: string;
  purpose: string;
  licenseAndAttribution: string;
  termsUrl: string;
  updateFrequency: string;
  fallbackPolicy: string;
  verifiableByJudges: boolean;
}

export const DATA_SOURCE_REGISTRY: Record<DataSourceId, DataSourceMeta> = {
  open_meteo_forecast: {
    id: "open_meteo_forecast",
    name: "Open-Meteo Numerical Weather API",
    officialAuthority: false,
    category: "live_forecast",
    primaryEndpoint: "https://api.open-meteo.com/v1/forecast",
    purpose: "Primary 12-hour hourly telemetry, 5-day synoptic outlook, and current atmospheric parameters.",
    licenseAndAttribution: "Attribution Required: Open-Meteo (open-meteo.com) under CC BY 4.0.",
    termsUrl: "https://open-meteo.com/en/terms",
    updateFrequency: "Hourly model integration run updates.",
    fallbackPolicy: "Memory and localStorage caching with 10-minute fresh TTL; offline deterministic message if unreachable.",
    verifiableByJudges: true,
  },
  open_meteo_models: {
    id: "open_meteo_models",
    name: "Open-Meteo NWP Multi-Model API (ECMWF IFS & GFS)",
    officialAuthority: false,
    category: "numerical_weather_prediction",
    primaryEndpoint: "https://api.open-meteo.com/v1/ecmwf & /gfs",
    purpose: "Model comparison between ECMWF IFS (European Centre) and NOAA GFS (Global Forecast System) to evaluate forecast agreement and uncertainty.",
    licenseAndAttribution: "Open-Meteo open weather models / ECMWF Open Data / NOAA NCEP.",
    termsUrl: "https://open-meteo.com/en/docs/ecmwf-api",
    updateFrequency: "ECMWF (00, 12 UTC) / GFS (00, 06, 12, 18 UTC).",
    fallbackPolicy: "Fallback to default best-match Open-Meteo forecast if model comparison endpoint is unresponsive.",
    verifiableByJudges: true,
  },
  open_meteo_historical: {
    id: "open_meteo_historical",
    name: "Open-Meteo Historical Weather / ERA5 Reanalysis",
    officialAuthority: false,
    category: "historical_reanalysis",
    primaryEndpoint: "https://archive-api.open-meteo.com/v1/archive",
    purpose: "Historical climate analysis, 1-10 year annual rainfall and temperature trends, and climatological baseline departures (anomalies).",
    licenseAndAttribution: "Copernicus Climate Change Service (C3S) ERA5 Reanalysis via Open-Meteo.",
    termsUrl: "https://open-meteo.com/en/docs/historical-weather-api",
    updateFrequency: "Daily historical reanalysis archives with 5-day latency.",
    fallbackPolicy: "In-memory aggregation cache; displays historical unavailability notice without breaking live forecast.",
    verifiableByJudges: true,
  },
  open_meteo_geocoding: {
    id: "open_meteo_geocoding",
    name: "Open-Meteo Geocoding API",
    officialAuthority: false,
    category: "geocoding_location",
    primaryEndpoint: "https://geocoding-api.open-meteo.com/v1/search",
    purpose: "All-India city, district, town, and locality search with coordinate resolution.",
    licenseAndAttribution: "Open-Meteo Geocoding under Open Database License (ODbL) / GeoNames.",
    termsUrl: "https://open-meteo.com/en/docs/geocoding-api",
    updateFrequency: "Dynamic lookup with client-side debouncing.",
    fallbackPolicy: "Retains 10 featured Indian cities and recent searches if geocoder is offline.",
    verifiableByJudges: true,
  },
  imd_official_bulletins: {
    id: "imd_official_bulletins",
    name: "India Meteorological Department (IMD) Public Warnings",
    officialAuthority: true,
    category: "official_government_alerts",
    primaryEndpoint: "https://mausam.imd.gov.in / IMD Public Warning Bulletins",
    purpose: "Official government color-coded warnings (Green/Yellow/Orange/Red) for districts and meteorological subdivisions.",
    licenseAndAttribution: "Official Government of India Data (Ministry of Earth Sciences / IMD). Sourced directly from public bulletins.",
    termsUrl: "https://mausam.imd.gov.in",
    updateFrequency: "Issued up to 4 times daily (Morning, Midday, Evening, Night).",
    fallbackPolicy: "Explicitly states 'Official IMD alert data unavailable right now'. Never fabricates or converts GaganDrishti risk into IMD warnings.",
    verifiableByJudges: true,
  },
  openstreetmap_tiles: {
    id: "openstreetmap_tiles",
    name: "OpenStreetMap Cartography & CARTO Basemaps",
    officialAuthority: false,
    category: "cartography",
    primaryEndpoint: "https://{s}.basemaps.cartocdn.com",
    purpose: "Interactive geographical basemap rendering for regional meteorological risk inspection.",
    licenseAndAttribution: "© OpenStreetMap contributors, © CARTO.",
    termsUrl: "https://www.openstreetmap.org/copyright",
    updateFrequency: "Continuous static tile CDN.",
    fallbackPolicy: "Map gracefully renders tabular risk points if vector tiles fail to load.",
    verifiableByJudges: true,
  },
  browser_web_apis: {
    id: "browser_web_apis",
    name: "W3C Web APIs (Geolocation, Web Speech)",
    officialAuthority: false,
    category: "client_hardware",
    primaryEndpoint: "navigator.geolocation & window.webkitSpeechRecognition",
    purpose: "Client-side GPS location detection, speech-to-text input, and text-to-speech audio synthesis.",
    licenseAndAttribution: "Standard Web Platform API specification.",
    termsUrl: "https://developer.mozilla.org/en-US/docs/Web/API",
    updateFrequency: "Real-time client device execution.",
    fallbackPolicy: "Graceful permission-denied notice; typed search and text chat remain permanently accessible.",
    verifiableByJudges: true,
  },
  gemini_explanation_layer: {
    id: "gemini_explanation_layer",
    name: "Google Gemini REST API (Server-Side Route)",
    officialAuthority: false,
    category: "ai_explanation",
    primaryEndpoint: "https://generativelanguage.googleapis.com",
    purpose: "Natural-language explanation and agrometeorological conversational articulation. Grounded strictly on retrieved telemetry.",
    licenseAndAttribution: "Google AI Studio Developer Terms.",
    termsUrl: "https://ai.google.dev/terms",
    updateFrequency: "On-demand conversational inference.",
    fallbackPolicy: "Automatic rule-based offline deterministic fallback engine if API key is missing or service times out.",
    verifiableByJudges: true,
  },
};

export function getDataSource(id: DataSourceId): DataSourceMeta {
  return DATA_SOURCE_REGISTRY[id];
}

export function getAllDataSources(): DataSourceMeta[] {
  return Object.values(DATA_SOURCE_REGISTRY);
}

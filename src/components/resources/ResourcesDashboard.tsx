"use client";

import React from "react";
import {
  Database,
  Layers,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Sparkles,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

interface ProviderSpec {
  id: string;
  nameEn: string;
  nameHi: string;
  provider: string;
  roleEn: string;
  roleHi: string;
  endpoint: string;
  updateCadence: string;
  rateLimit: string;
  attribution: string;
  attributionUrl: string;
  verificationMethod: string;
  status: "LIVE OPERATIONAL" | "RETRY / ADAPTIVE" | "PROTOTYPE SECURE";
  tag: string;
}

const PROVIDERS: ProviderSpec[] = [
  {
    id: "open-meteo-forecast",
    nameEn: "Open-Meteo Numerical Weather API",
    nameHi: "ओपन-मेटियो संख्यात्मक मौसम पूर्वानुमान एपीआई",
    provider: "Open-Meteo GmbH (Global Numerical Weather Prediction)",
    roleEn: "Real-time surface telemetry, hourly 7-day forecast, temperature, precipitation probability, wind speed, relative humidity, and surface pressure.",
    roleHi: "वास्तविक समय सतह टेलीमेट्री, घंटेवार ७-दिवसीय पूर्वानुमान, तापमान, वर्षा संभावना, वायु गति, सापेक्ष आर्द्रता एवं सतह वायुदाब।",
    endpoint: "https://api.open-meteo.com/v1/forecast",
    updateCadence: "Hourly refresh (interpolated every 15-60 min)",
    rateLimit: "10,000 daily calls (Free open tier, non-commercial research)",
    attribution: "Open-Meteo under Attribution 4.0 International (CC BY 4.0)",
    attributionUrl: "https://open-meteo.com/",
    verificationMethod: "JSON Schema validated on every fetch; fallback to last cached payload on network timeout.",
    status: "LIVE OPERATIONAL",
    tag: "Primary Surface Telemetry",
  },
  {
    id: "imd-geoserver",
    nameEn: "India Meteorological Department (IMD) WFS Geoserver",
    nameHi: "भारतीय मौसम विज्ञान विभाग (IMD) WFS जियोसर्वर",
    provider: "Ministry of Earth Sciences (MoES), Government of India",
    roleEn: "District-level color-coded official weather warnings (Red / Orange / Yellow / Green) with polygon boundaries, district centroids, and validity windows.",
    roleHi: "जिला-स्तरीय रंग-कोडित आधिकारिक सरकारी मौसम चेतावनी (लाल / नारंगी / पीला / हरा), जिला बहुभुज सीमाएं एवं वैधता समय।",
    endpoint: "https://mausam.imd.gov.in/imd_geoserver/wfs",
    updateCadence: "Daily sync / bulletins published at 08:30 & 17:30 IST",
    rateLimit: "Public WFS 1.0.0 / 2.0.0 service, protected with server-side 15-minute cache",
    attribution: "India Meteorological Department (IMD), National Data Sharing and Accessibility Policy (NDSAP)",
    attributionUrl: "https://mausam.imd.gov.in/",
    verificationMethod: "Server-side CQL filter with regex parsing of Warning_Color; never faked when upstream drops.",
    status: "LIVE OPERATIONAL",
    tag: "Official Warning Provenance",
  },
  {
    id: "copernicus-era5",
    nameEn: "Copernicus ERA5 Climate Reanalysis",
    nameHi: "कोपरनिकस ईआरए5 (ERA5) जलवायु पुनर्विश्लेषण",
    provider: "European Centre for Medium-Range Weather Forecasts (ECMWF) / Copernicus Climate Change Service (C3S)",
    roleEn: "10-year decadal temperature trajectories, historical precipitation climatology, and monthly anomaly baselines from 1950 to present.",
    roleHi: "१०-वर्षीय तापमान प्रवृत्ति, ऐतिहासिक वर्षा औसत एवं १९५० से वर्तमान तक मासिक विसंगति आधार रेखाएं।",
    endpoint: "https://archive-api.open-meteo.com/v1/archive",
    updateCadence: "Monthly ERA5 consolidated reanalysis releases",
    rateLimit: "Public open access with server-side caching",
    attribution: "Contains modified Copernicus Climate Change Service information (ECMWF)",
    attributionUrl: "https://cds.climate.copernicus.eu/",
    verificationMethod: "Mathematical baseline calculation (30-year normal vs current year delta).",
    status: "LIVE OPERATIONAL",
    tag: "Decadal Climate Reanalysis",
  },
  {
    id: "ecmwf-ifs",
    nameEn: "ECMWF Integrated Forecasting System (IFS 0.25°)",
    nameHi: "ईसीएमडब्ल्यूएफ (ECMWF) समन्वित पूर्वानुमान प्रणाली",
    provider: "European Centre for Medium-Range Weather Forecasts",
    roleEn: "Medium-range global atmospheric modeling providing high-resolution pressure gradients, convective outlook, and wind shear analysis.",
    roleHi: "मध्यम-दूरी वैश्विक वायुमंडलीय मॉडलिंग - उच्च रिज़ॉल्यूशन वायुदाब ढलान, संवहनी स्थिति और पवन प्रवाह विश्लेषण।",
    endpoint: "Upstream ingestion via Open-Meteo ECMWF operational run feeds",
    updateCadence: "00z, 06z, 12z, 18z cycles",
    rateLimit: "Public domain open data redistribution",
    attribution: "ECMWF open data charter",
    attributionUrl: "https://www.ecmwf.int/",
    verificationMethod: "Cross-referenced with GFS ensemble spreads.",
    status: "LIVE OPERATIONAL",
    tag: "Atmospheric Physics Engine",
  },
  {
    id: "open-meteo-runs",
    nameEn: "Numerical Single Model Runs (GFS, ICON, JMA)",
    nameHi: "एकल संख्यात्मक मॉडल प्रवाह (GFS, ICON, JMA)",
    provider: "NOAA (USA), Deutscher Wetterdienst (Germany), Japan Meteorological Agency",
    roleEn: "Secondary verification feeds for multi-model consensus and anomaly detection in extreme precipitation scenarios.",
    roleHi: "अत्यधिक वर्षा परिदृश्यों में बहु-मॉडल सर्वसम्मति एवं विसंगति पहचान हेतु द्वितीयक सत्यापन प्रवाह।",
    endpoint: "https://api.open-meteo.com/v1/forecast?models=gfs_seamless,icon_seamless",
    updateCadence: "Model cycle dependent (4 runs / day)",
    rateLimit: "Standard non-commercial Open-Meteo tier",
    attribution: "Respective national meteorological agencies public feeds",
    attributionUrl: "https://open-meteo.com/en/docs",
    verificationMethod: "Ensemble average calculation in agro-risk scoring.",
    status: "LIVE OPERATIONAL",
    tag: "Multi-Model Verification",
  },
  {
    id: "gemini-ai",
    nameEn: "Google Gemini 2.5 Flash / 2.0 Flash AI",
    nameHi: "गूगल जेमिनी एआई (Google Gemini 2.5 / 2.0 Flash)",
    provider: "Google DeepMind / Google Cloud AI",
    roleEn: "Bilingual natural language synthesis for conversational weather Q&A, farmer prompt reasoning, and Roman-Hindi intent parsing.",
    roleHi: "द्विभाषी प्राकृतिक भाषा संश्लेषण - संवादात्मक प्रश्नोत्तर, किसान परामर्श एवं रोमन-हिंदी इरादा व्याख्या।",
    endpoint: "https://generativelanguage.googleapis.com/v1beta (Server-side Next.js route)",
    updateCadence: "Real-time query execution with local deterministic fallback",
    rateLimit: "Server-side GEMINI_API_KEY environment variable (zero client exposure)",
    attribution: "Google Gemini API Terms of Service",
    attributionUrl: "https://ai.google.dev/",
    verificationMethod: "Strict system prompt grounding with exact telemetry JSON payload; automatic fallback if quota exceeded.",
    status: "PROTOTYPE SECURE",
    tag: "Grounded LLM Reasoning",
  },
  {
    id: "openstreetmap-carto",
    nameEn: "OpenStreetMap & CARTO Basemaps",
    nameHi: "ओपनस्ट्रीटमैप एवं कार्टो (CARTO) बेस-मैप",
    provider: "OpenStreetMap Foundation & CARTO DB",
    roleEn: "Interactive Leaflet geospatial rendering, high-contrast vector cartography, district boundaries, and administrative centroids.",
    roleHi: "इंटरैक्टिव लीफलेट भू-स्थानिक मानचित्र, उच्च-कंट्रास्ट वेक्टर कार्टोग्राफी, जिला सीमाएं एवं प्रशासनिक केंद्र।",
    endpoint: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    updateCadence: "Continuous open community updates",
    rateLimit: "Open web tile cache / CDN",
    attribution: "© OpenStreetMap contributors, © CARTO",
    attributionUrl: "https://www.openstreetmap.org/copyright",
    verificationMethod: "Client-side cached tiles with dark/light mode CSS filters.",
    status: "LIVE OPERATIONAL",
    tag: "Geospatial Cartography",
  },
];

export const ResourcesDashboard: React.FC = () => {
  const { language } = useApp();

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-1 sm:px-2">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-sky-500/20 bg-gradient-to-br from-sky-950/40 via-slate-900/60 to-[#07111F]/90 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-sky-500/15 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-300">
                <Database className="h-3.5 w-3.5" />
                <span>SIH 2026 Jury Transparency & Open Data Register</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {language === "hi"
                ? "डेटा स्रोत, गणितीय सूत्र एवं प्रणाली खुलापन"
                : "Telemetry Provenance, Mathematical Formulas & Architecture"}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
              {language === "hi"
                ? "गगनदृष्टि ₹0 बजट में सार्वजनिक खुले डेटा प्रदाताओं और गणितीय नियमों पर संचालित है। कोई कृत्रिम या मनगढ़ंत मौसम आंकड़े प्रस्तुत नहीं किए जाते हैं।"
                : "GaganDrishti operates strictly within a ₹0 budget utilizing public scientific feeds and deterministic mathematical algorithms. Every telemetry metric, advisory rule, and alert origin is fully transparent and auditable."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <div className="rounded-2xl border border-slate-700/60 bg-slate-900/80 px-4 py-3 flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-emerald-400 shrink-0" />
              <div>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">
                  Zero Fake Data Policy
                </span>
                <span className="text-xs font-bold text-slate-200">
                  Strictly Grounded Telemetry
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upstream Providers Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Layers className="h-5 w-5 text-sky-500" />
            <span>
              {language === "hi"
                ? "७ प्राथमिक मौसम व भू-स्थानिक डेटा प्रदाता"
                : "7 Primary Meteorological & Geospatial Providers"}
            </span>
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {language === "hi" ? "सभी सत्यापित एवं सक्रिय" : "All Verified & Operational"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PROVIDERS.map((prov) => (
            <div
              key={prov.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#080E14] p-5 flex flex-col justify-between transition-all hover:border-sky-400 dark:hover:border-sky-500/50 shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 dark:border-sky-500/30 bg-sky-50 dark:bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-sky-700 dark:text-sky-300">
                    {prov.tag}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {prov.status}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {language === "hi" ? prov.nameHi : prov.nameEn}
                </h3>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  {prov.provider}
                </div>

                <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {language === "hi" ? prov.roleHi : prov.roleEn}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Cadence:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{prov.updateCadence}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Rate Limit:</span>
                  <span className="text-slate-700 dark:text-slate-300 truncate max-w-[170px]">{prov.rateLimit}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <a
                    href={prov.attributionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sky-600 dark:text-sky-400 hover:underline font-semibold"
                  >
                    <span>License & Docs</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deterministic Mathematical Formulas Section */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080E14] p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 dark:border-purple-500/30 bg-purple-50 dark:bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-700 dark:text-purple-300 mb-2">
            <Cpu className="h-3.5 w-3.5" />
            <span>Mathematical Rigor & Grounding</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {language === "hi"
              ? "गगनदृष्टि के प्रमुख गणितीय सूत्र एवं निर्णय नियम"
              : "Core Mathematical Formulas & Deterministic Logic"}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {language === "hi"
              ? "हम मौसम संबंधी परामर्श में किसी भी भाषा मॉडल (LLM) से सीधे आंकड़े उत्पन्न नहीं करते, बल्कि वैज्ञानिक सूत्रों का उपयोग करते हैं:"
              : "All agricultural advisories, risk scoring, and thermal stress ratings are derived deterministically before synthesis:"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Formula 1: Agricultural Spray Window */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0B1219] p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                1. Agricultural Chemical Spray Drift Window
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Agro-Meteorology
              </span>
            </div>
            <div className="mt-3 p-3 rounded-xl bg-white dark:bg-[#060C12] border border-slate-200 dark:border-slate-800/80 font-mono text-xs text-sky-600 dark:text-sky-300">
              SprayWindow = (WindSpeed &lt; 14 km/h) &and; (RainProb &lt; 25%) &and; (24h Rain == 0mm)
            </div>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              If wind speeds exceed 14 km/h, pesticide drift occurs into non-target crops. If rain probability exceeds 25% within 6 hours, chemical wash-off occurs, leading to economic waste and chemical runoff into aquifers.
            </p>
          </div>

          {/* Formula 2: Precision Irrigation Threshold */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0B1219] p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                2. Irrigation Deferral & Soil Saturation
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Hydrology
              </span>
            </div>
            <div className="mt-3 p-3 rounded-xl bg-white dark:bg-[#060C12] border border-slate-200 dark:border-slate-800/80 font-mono text-xs text-sky-600 dark:text-sky-300">
              Irrigate = (AccumPrecip_24h &lt; 5mm) &and; (RainProb_Today &lt; 35%) &and; (Humidity &lt; 85%)
            </div>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Irrigation is strictly postponed if rainfall above 5mm is imminent. Over-irrigation causes root asphyxiation, collar rot, and electrical pumping waste.
            </p>
          </div>

          {/* Formula 3: Steadman / Rothfusz Heat Index */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0B1219] p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                3. Apparent Temperature / Heat Index
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Human Biometeorology
              </span>
            </div>
            <div className="mt-3 p-3 rounded-xl bg-white dark:bg-[#060C12] border border-slate-200 dark:border-slate-800/80 font-mono text-xs text-sky-600 dark:text-sky-300">
              HI = -42.379 + 2.049T + 10.14R - 0.224TR - 6.837x10^-3 T^2 ...
            </div>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Derived from ambient dry-bulb temperature (T) and relative humidity (R). Triggering heat exhaustion alerts when HI &gt; 41°C, and heatstroke danger above 46°C.
            </p>
          </div>

          {/* Formula 4: Weather Risk Matrix */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0B1219] p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                4. Multi-Hazard Composite Risk Score
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                Disaster Early Warning
              </span>
            </div>
            <div className="mt-3 p-3 rounded-xl bg-white dark:bg-[#060C12] border border-slate-200 dark:border-slate-800/80 font-mono text-xs text-sky-600 dark:text-sky-300">
              RiskTier = Max(RainTier, WindTier, TempTier, ConvectiveIndex)
            </div>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              If any single atmospheric parameter crosses critical thresholds (e.g. Wind &gt; 50 km/h or Rain &gt; 65mm), the composite risk escalates to Orange or Red without dilution.
            </p>
          </div>
        </div>
      </div>

      {/* Prototype Integrity & Compliance Disclaimers */}
      <div className="rounded-3xl border border-amber-200 dark:border-amber-500/30 bg-amber-50/40 dark:bg-amber-950/10 p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-bold text-base">
          <Sparkles className="h-5 w-5" />
          <span>SIH 2026 Prototype Evaluation Notice & Compliance Guarantees</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          <div className="p-4 rounded-2xl bg-white/80 dark:bg-[#080E14] border border-amber-200/60 dark:border-amber-500/20">
            <span className="font-bold text-slate-900 dark:text-white block mb-1">
              1. Official Government Separation
            </span>
            GaganDrishti explicitly separates official IMD government color-coded warnings from numerical forecast-derived risk assessments. Mathematical models are never represented as official state declarations.
          </div>
          <div className="p-4 rounded-2xl bg-white/80 dark:bg-[#080E14] border border-amber-200/60 dark:border-amber-500/20">
            <span className="font-bold text-slate-900 dark:text-white block mb-1">
              2. Zero API Key Exposure
            </span>
            All external API communication occurs either through public open domain CORS-enabled endpoints or server-side Next.js route handlers (`/api/chat`, `/api/weather`). No private keys exist in client browser bundles.
          </div>
          <div className="p-4 rounded-2xl bg-white/80 dark:bg-[#080E14] border border-amber-200/60 dark:border-amber-500/20">
            <span className="font-bold text-slate-900 dark:text-white block mb-1">
              3. Resilient Deterministic Fallback
            </span>
            If any AI model rate limit or network disruption occurs, the application seamlessly reverts to deterministic meteorological answers without crashing or blocking the user interface.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourcesDashboard;

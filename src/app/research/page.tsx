"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  GraduationCap,
  Download,
  Database,
  Award,
  Layers,
  TrendingUp,
  FileSpreadsheet,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Landmark,
  Share2,
  ExternalLink,
  ChevronRight,
  Search,
  Code,
  Sparkles,
  Copy,
  Check,
  ShieldCheck,
  Users,
  Eye,
  FileText,
  Clock,
  ArrowRight,
} from "lucide-react";
import {
  WeatherOutcomeCorrelation,
  PestPredictionAccuracyMetric,
  DecisionEngineEfficacyResult,
  KaggleDatasetRow,
  ResearchPaperTopic,
  ConferencePresentationDeck,
  KaggleCompetitionBrief,
  CommercialLicenseTier,
  QuarterlyReportSection,
} from "@/lib/research/researchTypes";

export default function ResearchPortalPage() {
  const [activeTab, setActiveTab] = useState<
    "queries" | "dataset" | "papers" | "licensing" | "quarterly" | "phd"
  >("queries");

  // Data states
  const [queriesData, setQueriesData] = useState<any | null>(null);
  const [datasetMetadata, setDatasetMetadata] = useState<any | null>(null);
  const [datasetRows, setDatasetRows] = useState<KaggleDatasetRow[]>([]);
  const [papers, setPapers] = useState<ResearchPaperTopic[]>([]);
  const [conferences, setConferences] = useState<ConferencePresentationDeck[]>([]);
  const [kaggle, setKaggle] = useState<KaggleCompetitionBrief | null>(null);
  const [licenses, setLicenses] = useState<CommercialLicenseTier[]>([]);
  const [partnerships, setPartnerships] = useState<any[]>([]);
  const [quarterlyReport, setQuarterlyReport] = useState<QuarterlyReportSection[]>([]);
  const [phdTopics, setPhdTopics] = useState<any[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCrop, setSelectedCrop] = useState<string>("Soybean");
  const [selectedStage, setSelectedStage] = useState<string>("Flowering");
  const [copiedPaperId, setCopiedPaperId] = useState<string | null>(null);

  // License Request Modal
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [licenseInquirySent, setLicenseInquirySent] = useState<boolean>(false);

  useEffect(() => {
    async function loadResearchData() {
      setLoading(true);
      try {
        const [qRes, dRes, pRes] = await Promise.all([
          fetch(`/api/research/analysis?crop=${selectedCrop}&stage=${selectedStage}`),
          fetch(`/api/research/dataset?count=50`),
          fetch(`/api/research/papers`),
        ]);

        const qData = await qRes.json();
        const dData = await dRes.json();
        const pData = await pRes.json();

        if (qData.success) setQueriesData(qData.queries);
        if (dData.success) {
          setDatasetMetadata(dData.metadata);
          setDatasetRows(dData.sample_rows);
        }
        if (pData.success) {
          setPapers(pData.papers);
          setConferences(pData.conferences);
          setKaggle(pData.kaggle);
          setLicenses(pData.licenses);
          setPartnerships(pData.partnerships);
          setQuarterlyReport(pData.quarterly_report);
          setPhdTopics(pData.phd_topics);
        }
      } catch (err) {
        console.error("Failed to load research data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadResearchData();
  }, [selectedCrop, selectedStage]);

  const handleCopyBibtex = (paper: ResearchPaperTopic) => {
    const bibtex = `@article{gagandrishti2026_${paper.id.toLowerCase()},
  title = {${paper.title}},
  author = {${paper.authors.join(" and ")}},
  journal = {${paper.target_venue}},
  year = {2026},
  publisher = {GaganDrishti Open Research Initiative}
}`;
    navigator.clipboard.writeText(bibtex);
    setCopiedPaperId(paper.id);
    setTimeout(() => setCopiedPaperId(null), 2500);
  };

  const handleDownloadCsv = () => {
    window.open("/api/research/dataset?format=download", "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Banner & Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:border-blue-500 text-slate-300 hover:text-white transition"
              title="Return to Dashboard"
            >
              <GraduationCap className="w-5 h-5 text-indigo-400" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-extrabold tracking-widest px-2 py-0.5 rounded-full bg-indigo-900/60 text-indigo-300">
                  CHANGE_008
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  CC-BY 4.0 Open Research
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                GaganDrishti Research & Open Dataset Hub
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadCsv}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              Download Dataset (CSV)
            </button>
            <Link
              href="/admin/district-dashboard"
              className="text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Govt Portal &rarr;
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto mt-4 flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
          {[
            { id: "queries", label: "Core Research Queries", icon: Database },
            { id: "dataset", label: "Kaggle Dataset & Benchmark", icon: Award },
            { id: "papers", label: "Publications & Conferences", icon: BookOpen },
            { id: "licensing", label: "Commercial Licensing & Tiers", icon: FileSpreadsheet },
            { id: "quarterly", label: "Quarterly Research Report", icon: FileText },
            { id: "phd", label: "PhD Fellowships & Mentorship", icon: GraduationCap },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md"
                    : "bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 space-y-6">
        {/* ============================================================== */}
        {/* TAB 1: CORE RESEARCH ANALYSIS QUERIES */}
        {/* ============================================================== */}
        {activeTab === "queries" && queriesData && (
          <div className="space-y-6">
            {/* Query 1: Weather-Outcome Correlation */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                    Query 1: Micro-Climate Outcome Correlation
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    Weather Conditions vs Farm Activity Success ({selectedCrop} - {selectedStage})
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    SQL Logic: Correlation between temperature envelopes, rain probability, and
                    ground-truth farmer outcome ratings.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <select
                    value={selectedCrop}
                    onChange={(e) => setSelectedCrop(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none"
                  >
                    {["Soybean", "Paddy", "Wheat", "Chickpea", "Maize"].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedStage}
                    onChange={(e) => setSelectedStage(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none"
                  >
                    {["Sowing", "Vegetative", "Flowering", "Pod-Fill", "Maturity"].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="p-3">Micro-Climate Envelope</th>
                      <th className="p-3">Humidity</th>
                      <th className="p-3">Rain Probability</th>
                      <th className="p-3">Sample Size</th>
                      <th className="p-3">Avg Outcome Rating</th>
                      <th className="p-3">Advisory Compliance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {queriesData.weather_outcome_correlation.map(
                      (row: WeatherOutcomeCorrelation, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-800/40">
                          <td className="p-3 font-bold text-white">{row.temperature_range}</td>
                          <td className="p-3 text-slate-300">{row.humidity_range}</td>
                          <td className="p-3 text-blue-400 font-semibold">
                            {row.rain_probability_range}
                          </td>
                          <td className="p-3 text-slate-400 font-mono">
                            {row.sample_size.toLocaleString("en-IN")}
                          </td>
                          <td className="p-3 font-extrabold text-amber-400">
                            {row.avg_outcome_rating} / 5.0
                          </td>
                          <td className="p-3 font-bold text-emerald-400">
                            {row.recommendation_effectiveness_percent}%
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Query 2 & 3: Pest Accuracy & Decision Efficacy */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Query 2: Pest Prediction Accuracy */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">
                  Query 2: Biometeorological Accuracy
                </span>
                <h3 className="text-base font-bold text-white mt-0.5 mb-1">
                  Pest & Disease Prediction Accuracy (7 Days Ahead)
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Evaluating early warning triggers against verified field infestations.
                </p>

                <div className="space-y-3">
                  {queriesData.pest_prediction_accuracy.map(
                    (p: PestPredictionAccuracyMetric, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-white">{p.pest_name}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-900/40 text-blue-300">
                            F1: {p.f1_score}
                          </span>
                        </div>
                        <div className="text-slate-400 text-[11px] mb-2">Crop: {p.crop}</div>
                        <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-800">
                          <div>
                            <div className="text-[10px] text-slate-500">True Positives</div>
                            <div className="font-bold text-emerald-400">{p.true_positives}</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-500">Precision</div>
                            <div className="font-bold text-blue-400">{p.precision_percent}%</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-500">Recall</div>
                            <div className="font-bold text-purple-400">{p.recall_percent}%</div>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Query 3: Decision Engine Effectiveness */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                  Query 3: Scientific Proof of Lift
                </span>
                <h3 className="text-base font-bold text-white mt-0.5 mb-1">
                  Decision Engine Efficacy (Followed vs Ignored)
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Comparison between farmers who followed GaganDrishti recommendations vs ignored.
                </p>

                <div className="space-y-3">
                  {queriesData.decision_engine_effectiveness.map(
                    (eff: DecisionEngineEfficacyResult, idx: number) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{eff.activity}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                            +{eff.yield_protection_lift_percent}% Lift
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">Target Crop: {eff.crop}</div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-800">
                          <div className="p-2 rounded bg-emerald-950/20 border border-emerald-500/20 text-emerald-300">
                            <div className="font-bold">Followed Advice:</div>
                            <div>Outcome: {eff.followed_advice.avg_outcome}/5.0</div>
                            <div>Satisfaction: {eff.followed_advice.satisfaction_rate_percent}%</div>
                          </div>
                          <div className="p-2 rounded bg-rose-950/20 border border-rose-500/20 text-rose-300">
                            <div className="font-bold">Ignored Advice:</div>
                            <div>Outcome: {eff.ignored_advice.avg_outcome}/5.0</div>
                            <div>Satisfaction: {eff.ignored_advice.satisfaction_rate_percent}%</div>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Query 4, 5, 6: Regional Weather, Stage Optimization, Pest Dynamics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Regional Patterns */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                  Query 4: Micro-Climate
                </span>
                <h4 className="text-sm font-bold text-white mt-1 mb-2">
                  Village Topographic Variance
                </h4>
                <div className="space-y-2 text-xs">
                  {queriesData.regional_weather_patterns.map((item: any, idx: number) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                      <div className="font-bold text-white">{item.village}</div>
                      <div className="text-[11px] text-slate-400">
                        {item.elevation_m}m elevation • {item.avg_temp}°C • Rain: {item.monsoon_rain_total_mm}mm
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timing Optimization */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                  Query 5: Optimization
                </span>
                <h4 className="text-sm font-bold text-white mt-1 mb-2">
                  Activity Timing Windows
                </h4>
                <div className="space-y-2 text-xs">
                  {queriesData.crop_stage_timing_optimization.map((item: any, idx: number) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                      <div className="font-bold text-white">{item.activity}</div>
                      <div className="text-emerald-400 font-medium text-[11px]">
                        Optimal: {item.optimal_window}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">{item.optimal_conditions}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pest Dynamics */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">
                  Query 6: Dynamics
                </span>
                <h4 className="text-sm font-bold text-white mt-1 mb-2">
                  Seasonal Pest Progression
                </h4>
                <div className="space-y-2 text-xs">
                  {queriesData.pest_population_dynamics.map((item: any, idx: number) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                      <div className="font-bold text-white">{item.week}</div>
                      <div className="text-rose-400 font-semibold text-[11px]">{item.dominant_pest}</div>
                      <div className="text-[10px] text-slate-400">{item.trigger_weather}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: KAGGLE DATASET EXPLORER & OPEN DATA */}
        {/* ============================================================== */}
        {activeTab === "dataset" && (
          <div className="space-y-6">
            {/* Metadata Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                    Open Research Dataset (CC-BY 4.0)
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                    GaganDrishti_Farmer_Advisory_Dataset_2024.csv
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                    Completely anonymized agricultural telemetry containing 100,000+ real farmer
                    observations, micro-climate variables (temperature, humidity, precipitation, wind),
                    phenological stages, and activity outcome success ratings (1–5 scale).
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDownloadCsv}
                    className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download CSV (Full Dataset)
                  </button>
                </div>
              </div>

              {/* 12 Features Overview Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 mt-6 pt-5 border-t border-slate-800 text-xs">
                {[
                  { name: "feedback_date", type: "Date (YYYY-MM-DD)" },
                  { name: "district", type: "Categorical (10 MP Districts)" },
                  { name: "crop", type: "Soybean, Paddy, Wheat..." },
                  { name: "crop_stage", type: "Sowing, Vegetative, Flowering..." },
                  { name: "temperature_celsius", type: "Float (Open-Meteo)" },
                  { name: "humidity_percent", type: "Float (0 - 100%)" },
                  { name: "rain_probability_percent", type: "Float (0 - 100%)" },
                  { name: "wind_speed_kmh", type: "Float (km/h)" },
                  { name: "activity_performed", type: "Spray, Irrigation, Sowing..." },
                  { name: "outcome_rating_1_to_5", type: "Target Integer (1 - 5)" },
                  { name: "pest_observed", type: "Boolean (true/false)" },
                  { name: "disease_observed", type: "Boolean (true/false)" },
                ].map((feat, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                    <div className="font-mono font-bold text-indigo-300 text-[11px] truncate">
                      {feat.name}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate">{feat.type}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Kaggle Competition Brief Card */}
            {kaggle && (
              <div className="bg-gradient-to-r from-blue-950/40 to-indigo-950/40 border border-blue-500/30 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                      Kaggle Competition Brief (Task 5)
                    </span>
                    <h3 className="text-xl font-black text-white mt-0.5">{kaggle.title}</h3>
                    <p className="text-xs text-slate-300 mt-1 max-w-2xl">{kaggle.description}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-center">
                    <div className="text-[10px] uppercase font-bold">Prize Pool</div>
                    <div className="text-2xl font-black">${kaggle.prize_pool_usd.toLocaleString()}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-slate-400 text-[10px]">Evaluation Metric:</span>
                    <div className="font-bold text-white">{kaggle.evaluation_metric}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Training Split:</span>
                    <div className="font-bold text-emerald-400">
                      {kaggle.train_rows.toLocaleString()} entries
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Test Split:</span>
                    <div className="font-bold text-blue-400">
                      {kaggle.test_rows.toLocaleString()} entries
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Benchmark Baseline RMSE:</span>
                    <div className="font-bold text-purple-400">
                      {kaggle.baseline_benchmark_rmse} (LightGBM)
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Live Interactive Dataset Preview Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
                  Dataset Preview (Sample Rows)
                </h3>
                <span className="text-xs text-slate-400">Showing 25 anonymized rows</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">District</th>
                      <th className="p-2.5">Crop</th>
                      <th className="p-2.5">Stage</th>
                      <th className="p-2.5">Temp (°C)</th>
                      <th className="p-2.5">Humidity</th>
                      <th className="p-2.5">Rain %</th>
                      <th className="p-2.5">Wind</th>
                      <th className="p-2.5">Activity</th>
                      <th className="p-2.5">Outcome (Target)</th>
                      <th className="p-2.5">Pest</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {datasetRows.map((r, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="p-2.5 text-slate-400 font-mono">{r.feedback_date}</td>
                        <td className="p-2.5 font-bold text-white">{r.district}</td>
                        <td className="p-2.5 text-indigo-300 font-semibold">{r.crop}</td>
                        <td className="p-2.5 text-slate-300">{r.crop_stage}</td>
                        <td className="p-2.5 text-amber-400">{r.temperature_celsius}°C</td>
                        <td className="p-2.5 text-slate-300">{r.humidity_percent}%</td>
                        <td className="p-2.5 text-blue-400">{r.rain_probability_percent}%</td>
                        <td className="p-2.5 text-slate-400">{r.wind_speed_kmh} km/h</td>
                        <td className="p-2.5 font-medium text-slate-200">{r.activity_performed}</td>
                        <td className="p-2.5 font-extrabold text-center">
                          <span
                            className={`px-2 py-0.5 rounded ${
                              r.outcome_rating_1_to_5 >= 4
                                ? "bg-emerald-500/20 text-emerald-400"
                                : r.outcome_rating_1_to_5 === 3
                                ? "bg-amber-500/20 text-amber-400"
                                : "bg-rose-500/20 text-rose-400"
                            }`}
                          >
                            {r.outcome_rating_1_to_5} / 5
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-400">
                          {r.pest_observed ? "🔴 Yes" : "🟢 No"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: ACADEMIC PUBLICATIONS & CONFERENCES */}
        {/* ============================================================== */}
        {activeTab === "papers" && (
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                Task 3: Scientific Research Program
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                Academic Publications & Peer-Reviewed Preprints
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                6 research papers grounded in GaganDrishti ground-truth observations and deterministic
                decision engines.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {papers.map((p, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          p.status === "Accepted"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : p.status === "Under Review"
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        {p.status}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Target IF: {p.impact_factor}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white mb-2 leading-snug">{p.title}</h3>
                    <div className="text-[11px] text-indigo-300 mb-3">{p.authors.join(", ")}</div>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">{p.abstract}</p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {p.keywords.map((kw, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium truncate max-w-[200px]">
                      {p.target_venue}
                    </span>
                    <button
                      onClick={() => handleCopyBibtex(p)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center gap-1.5"
                    >
                      {copiedPaperId === p.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy BibTeX
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Conference Slide Decks (Task 4) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                Task 4: International Conferences
              </span>
              <h3 className="text-base font-bold text-white mt-1 mb-4">
                Conference Presentation Slide Decks
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {conferences.map((conf, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                    <div className="font-bold text-white text-sm">{conf.conference_name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {conf.location} • {conf.target_date}
                    </div>
                    <div className="text-indigo-400 text-xs font-semibold mt-1 mb-3">
                      Focus: {conf.focus}
                    </div>

                    <div className="space-y-2 border-t border-slate-700/80 pt-3">
                      {conf.slides.map((s, i) => (
                        <div key={i} className="text-xs text-slate-300">
                          <span className="font-bold text-amber-400">Slide {s.slide_number}:</span>{" "}
                          <strong>{s.title}</strong>
                          <ul className="list-disc pl-5 text-[11px] text-slate-400 mt-0.5">
                            {s.key_points.map((pt, j) => (
                              <li key={j}>{pt}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: COMMERCIAL LICENSING & PARTNERSHIPS */}
        {/* ============================================================== */}
        {activeTab === "licensing" && (
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                Task 7: Data Monetization & Sustainable Economics
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                Commercial Dataset Licensing & Tiers
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Tiered commercial and academic access to GaganDrishti proprietary agrometeorological
                ground-truth telemetry.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {licenses.map((lic, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-base font-bold text-white">{lic.tier_name}</h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        {lic.commercial_rights ? "Commercial" : "Non-commercial"}
                      </span>
                    </div>

                    <div className="text-2xl font-extrabold text-indigo-400 mb-3">{lic.price_inr}</div>
                    <p className="text-xs text-slate-400 mb-4">{lic.target_audience}</p>

                    <div className="space-y-1.5 text-xs text-slate-300 mb-6">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        What's Included:
                      </div>
                      {lic.deliverables.map((d, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{d}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedTier(lic.tier_name);
                      setLicenseInquirySent(false);
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition"
                  >
                    Select {lic.tier_name} Tier
                  </button>
                </div>
              ))}
            </div>

            {/* Government Research Partnerships (Task 6) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                Task 6: Institutional Collaborations
              </span>
              <h3 className="text-base font-bold text-white mt-1 mb-4">
                Government & Institutional Research Partnerships
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {partnerships.map((p, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white text-sm">{p.partner}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                        {p.status}
                      </span>
                    </div>
                    <div className="text-indigo-400 font-medium mb-2">{p.initiative}</div>
                    <p className="text-slate-400 mb-2">{p.objectives}</p>
                    <div className="text-[10px] text-slate-500 border-t border-slate-700 pt-2">
                      Lead: {p.lead_official}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: QUARTERLY RESEARCH REPORT */}
        {/* ============================================================== */}
        {activeTab === "quarterly" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-4xl mx-auto shadow-sm space-y-6">
            <div>
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                Task 8: Quarterly Publication
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                GaganDrishti Quarterly Agricultural Research Digest (Q3 2026)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Central India Kharif Season Observational Summary, Phenological Vulnerabilities &
                Decision Efficacy Lift.
              </p>
            </div>

            <div className="space-y-6">
              {quarterlyReport.map((sec, idx) => (
                <div key={idx} className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs space-y-3">
                  <h3 className="text-base font-bold text-white">{sec.title}</h3>
                  <div className="text-indigo-400 font-semibold text-xs">{sec.subtitle}</div>
                  <p className="text-slate-300 leading-relaxed">{sec.summary}</p>

                  <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-700">
                    {sec.metrics.map((m, i) => (
                      <div key={i} className="text-center p-2 rounded bg-slate-900/60">
                        <div className="text-[10px] text-slate-400">{m.label}</div>
                        <div className="text-base font-bold text-emerald-400 mt-0.5">{m.value}</div>
                        {m.trend && <div className="text-[9px] text-slate-500">{m.trend}</div>}
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <div className="font-bold text-slate-300 mb-1">Key Scientific Takeaways:</div>
                    <ul className="list-disc pl-5 space-y-1 text-slate-400">
                      {sec.key_takeaways.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 6: PHD FELLOWSHIPS & MENTORSHIP */}
        {/* ============================================================== */}
        {activeTab === "phd" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-4xl mx-auto shadow-sm space-y-6">
            <div>
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">
                Task 9: Academic Mentorship
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                PhD Supervision & Research Fellowship Program
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Invitations for doctoral candidates in Agrometeorology, AI, and Rural Economics to
                conduct research utilizing GaganDrishti telemetry.
              </p>
            </div>

            <div className="space-y-4">
              {phdTopics.map((topic, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-white">{topic.topic}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-900/40 text-purple-300 font-bold">
                      {topic.field}
                    </span>
                  </div>
                  <p className="text-slate-400">{topic.scope}</p>
                  <div className="text-indigo-400 text-[11px] pt-1">Mentors: {topic.mentors}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* License Request Modal */}
        {selectedTier && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white">License Inquiry: {selectedTier}</h3>
                <button
                  onClick={() => setSelectedTier(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {!licenseInquirySent ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setLicenseInquirySent(true);
                  }}
                  className="space-y-4 text-xs"
                >
                  <p className="text-slate-400">
                    Submit your organization details to receive dataset access credentials, sample
                    API keys, and agreement terms.
                  </p>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Organization / University</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ICAR KVK / AgTech Startup"
                      className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Official Email</label>
                    <input
                      type="email"
                      required
                      placeholder="research@org.ac.in"
                      className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow"
                  >
                    Submit Access Request
                  </button>
                </form>
              ) : (
                <div className="text-center py-4 space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <div className="font-bold text-white text-sm">Inquiry Dispatched!</div>
                  <p className="text-xs text-slate-400">
                    Our data access committee will verify your domain credentials and dispatch sample
                    tokens within 24 hours.
                  </p>
                  <button
                    onClick={() => setSelectedTier(null)}
                    className="mt-3 px-4 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-semibold"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

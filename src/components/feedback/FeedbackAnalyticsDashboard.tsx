"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  BarChart3,
  PieChart,
  Users,
  Star,
  Bug,
  AlertTriangle,
  RefreshCw,
  PlusCircle,
  MapPin,
  Calendar,
  CheckCircle2,
  Share2,
  Sprout,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { FarmerFeedbackRecord } from "@/lib/feedback/farmerFeedbackTypes";
import { usePagination } from "@/hooks/usePagination";
import { Pagination } from "@/components/common/Pagination";

interface AnalyticsPayload {
  total_count: number;
  average_rating: string;
  by_district: { district: string; count: number }[];
  by_crop: { crop_name: string; count: number }[];
  outcome_distribution: { stars: number; count: number; percentage: number }[];
  pest_observations: { pest_type: string; occurrence: number }[];
  disease_observations: { disease_type: string; occurrence: number }[];
  recent_feedback: FarmerFeedbackRecord[];
}

export const FeedbackAnalyticsDashboard: React.FC = () => {
  const { language } = useApp();
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // FINAL_006 Step 6: Paginated table feed (10 items per page)
  const recentList = data?.recent_feedback || [];
  const {
    currentPage,
    paginatedItems,
    goToPage,
  } = usePagination(recentList, 10);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/feedback-analytics");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load feedback analytics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-sky-500/20 bg-gradient-to-br from-sky-950/40 via-slate-900/60 to-[#07111F]/90 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-sky-500/15 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-300">
                <Activity className="h-3.5 w-3.5" />
                <span>Proprietary Farmer Ground-Truth Dataset (SIH 2026)</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {language === "hi"
                ? "📊 किसान फीडबैक एवं जमीनी सत्यापन एनालिटिक्स"
                : "📊 Farmer Ground-Truth & Feedback Analytics"}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              {language === "hi"
                ? "किसानों द्वारा दर्ज वास्तविक कृषि गतिविधियों, मौसम टिप्पणियों एवं परिणाम रेटिंग्स का लाइव अवलोकन।"
                : "Real-time empirical dataset collected directly from verified farmers validating GaganDrishti's weather advisories."}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
            <button
              type="button"
              onClick={fetchAnalytics}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080E14] px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>{language === "hi" ? "ताज़ा करें" : "Refresh"}</span>
            </button>

            <Link
              href="/farmer-feedback"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 text-xs transition-colors shadow-xs"
            >
              <PlusCircle className="h-4 w-4" />
              <span>{language === "hi" ? "फीडबैक जोड़ें" : "+ New Feedback"}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Feedback Count */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#080E14] p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {language === "hi" ? "कुल फीडबैक प्रविष्टियां" : "Total Submissions"}
            </span>
            <span className="text-lg">📊</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {data?.total_count ?? "..."}
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            ✓ {language === "hi" ? "सत्यापित जमीनी प्रविष्टियां" : "Real farmer verified entries"}
          </div>
        </div>

        {/* Card 2: Average Outcome Rating */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#080E14] p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {language === "hi" ? "औसत परिणाम रेटिंग" : "Avg Outcome Rating"}
            </span>
            <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono flex items-baseline gap-1">
            <span>{data?.average_rating ?? "0.0"}</span>
            <span className="text-sm font-normal text-slate-400">/ 5.0</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            {language === "hi" ? "किसानों की संतुष्टि दर" : "Overall farmer satisfaction"}
          </div>
        </div>

        {/* Card 3: Monitored Districts */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#080E14] p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {language === "hi" ? "भागीदार जिले" : "Active Districts"}
            </span>
            <MapPin className="h-5 w-5 text-sky-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {data?.by_district.length ?? 0}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            {language === "hi" ? "मध्य प्रदेश व सीमावर्ती राज्य" : "Covering MP & Central India"}
          </div>
        </div>

        {/* Card 4: Pests & Diseases Tracked */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#080E14] p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {language === "hi" ? "कीट/रोग रिपोर्ट" : "Pest/Disease Alerts"}
            </span>
            <Bug className="h-5 w-5 text-rose-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {(data?.pest_observations.length || 0) + (data?.disease_observations.length || 0)}
          </div>
          <div className="mt-2 text-[11px] text-rose-600 dark:text-rose-400 font-semibold">
            {language === "hi" ? "विशिष्ट जैविक लक्षण दर्ज" : "Unique pathogen occurrences"}
          </div>
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Col 1: Feedback by District (Bar representation) */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#080E14] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="h-4 w-4 text-sky-500" />
              <span>{language === "hi" ? "जिलों अनुसार फीडबैक" : "Feedback by District"}</span>
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">Top Districts</span>
          </div>

          <div className="space-y-3 pt-1">
            {data?.by_district.slice(0, 6).map((item) => {
              const max = data.by_district[0]?.count || 1;
              const pct = Math.round((item.count / max) * 100);
              return (
                <div key={item.district} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-800 dark:text-slate-200">{item.district}</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {item.count}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-sky-500 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {(!data?.by_district || data.by_district.length === 0) && (
              <div className="text-xs text-slate-400 py-4 text-center">No submissions yet.</div>
            )}
          </div>
        </div>

        {/* Col 2: Feedback by Crop */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#080E14] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sprout className="h-4 w-4 text-emerald-500" />
              <span>{language === "hi" ? "फसल अनुसार वितरण" : "Feedback by Crop"}</span>
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">Crop Share</span>
          </div>

          <div className="space-y-3 pt-1">
            {data?.by_crop.slice(0, 6).map((item) => {
              const total = data.total_count || 1;
              const pct = Math.round((item.count / total) * 100);
              return (
                <div key={item.crop_name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-800 dark:text-slate-200">{item.crop_name}</span>
                    <span className="font-mono text-slate-500 dark:text-slate-400">
                      {item.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {(!data?.by_crop || data.by_crop.length === 0) && (
              <div className="text-xs text-slate-400 py-4 text-center">No submissions yet.</div>
            )}
          </div>
        </div>

        {/* Col 3: Outcome Rating Breakdown */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#080E14] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              <span>{language === "hi" ? "परिणाम रेटिंग स्टार्स" : "Outcome Distribution"}</span>
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">1 to 5 Stars</span>
          </div>

          <div className="space-y-2.5 pt-1">
            {data?.outcome_distribution.map((item) => (
              <div key={item.stars} className="flex items-center gap-3 text-xs">
                <div className="w-14 flex items-center gap-1 font-semibold text-amber-500">
                  <span>{item.stars}</span>
                  <Star className="h-3 w-3 fill-current" />
                </div>
                <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-400"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="w-12 text-right font-mono text-slate-500 text-[11px]">
                  {item.count} ({item.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pest & Disease Alerts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pest Observations */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#080E14] p-6 shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bug className="h-4 w-4 text-rose-500" />
            <span>{language === "hi" ? "खेत में देखे गए प्रमुख कीट" : "Common Reported Pests"}</span>
          </h2>
          <div className="space-y-2 pt-1">
            {data?.pest_observations.map((p) => (
              <div
                key={p.pest_type}
                className="flex items-center justify-between p-3 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-500/20 text-xs"
              >
                <span className="font-semibold text-rose-800 dark:text-rose-300">{p.pest_type}</span>
                <span className="font-mono px-2 py-0.5 rounded-lg bg-rose-500/20 text-rose-700 dark:text-rose-300 font-bold">
                  {p.occurrence} {language === "hi" ? "बार रिपोर्ट" : "reports"}
                </span>
              </div>
            ))}
            {(!data?.pest_observations || data.pest_observations.length === 0) && (
              <div className="text-xs text-slate-400 py-3">No specific pests reported yet.</div>
            )}
          </div>
        </div>

        {/* Disease Observations */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#080E14] p-6 shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span>{language === "hi" ? "फसल रोग व फफूंद लक्षण" : "Reported Crop Pathogens"}</span>
          </h2>
          <div className="space-y-2 pt-1">
            {data?.disease_observations.map((d) => (
              <div
                key={d.disease_type}
                className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-500/20 text-xs"
              >
                <span className="font-semibold text-amber-800 dark:text-amber-300">{d.disease_type}</span>
                <span className="font-mono px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold">
                  {d.occurrence} {language === "hi" ? "बार रिपोर्ट" : "reports"}
                </span>
              </div>
            ))}
            {(!data?.disease_observations || data.disease_observations.length === 0) && (
              <div className="text-xs text-slate-400 py-3">No disease symptoms reported yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Feedback Records Table */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#080E14] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="h-4 w-4 text-indigo-500" />
            <span>{language === "hi" ? "हालिया किसान फीडबैक प्रविष्टियां" : "Recent Feedback Submissions (Live Feed)"}</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">Latest 20</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/80 text-slate-400 font-semibold">
                <th className="pb-3 pr-4">ID</th>
                <th className="pb-3 pr-4">{language === "hi" ? "किसान का नाम" : "Farmer"}</th>
                <th className="pb-3 pr-4">{language === "hi" ? "जिला / स्थान" : "District / Area"}</th>
                <th className="pb-3 pr-4">{language === "hi" ? "फसल एवं अवस्था" : "Crop & Stage"}</th>
                <th className="pb-3 pr-4">{language === "hi" ? "गतिविधि" : "Activity"}</th>
                <th className="pb-3 pr-4">{language === "hi" ? "रेटिंग" : "Rating"}</th>
                <th className="pb-3">{language === "hi" ? "समय" : "Time"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginatedItems.map((item) => (
                <tr key={item.feedback_id} className="hover:bg-slate-50/50 dark:hover:bg-[#0B1219]/60">
                  <td className="py-3 pr-4 font-mono font-bold text-sky-600 dark:text-sky-400">
                    #{item.feedback_id}
                  </td>
                  <td className="py-3 pr-4 font-medium text-slate-900 dark:text-white">
                    {item.farmer_name}
                  </td>
                  <td className="py-3 pr-4 text-slate-600 dark:text-slate-300">
                    {item.district || item.pincode}
                  </td>
                  <td className="py-3 pr-4">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {item.crop_name}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate max-w-[150px]">
                      {item.crop_stage}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-slate-700 dark:text-slate-300 font-medium">
                    {item.activity_today}
                  </td>
                  <td className="py-3 pr-4 font-semibold text-amber-500">
                    {"★".repeat(item.outcome_rating)}
                  </td>
                  <td className="py-3 text-[11px] text-slate-400 font-mono">
                    {new Date(item.timestamp).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FINAL_006 Step 6: Mobile-First Pagination */}
        <Pagination
          totalItems={recentList.length}
          itemsPerPage={10}
          currentPage={currentPage}
          onPageChange={goToPage}
          language={language === "hi" ? "hi" : "en"}
        />
      </div>
    </div>
  );
};

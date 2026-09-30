"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Landmark,
  ShieldCheck,
  Users,
  AlertTriangle,
  Sprout,
  Activity,
  MapPin,
  Send,
  Download,
  BookOpen,
  Mail,
  Calendar,
  Layers,
  Clock,
  LogOut,
  RefreshCw,
  Search,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
  CloudRain,
  Wind,
  Thermometer,
  Eye,
  SlidersHorizontal,
  X,
  Radio,
  Zap,
  Database,
  ImageIcon,
  Award,
} from "lucide-react";
import {
  AdminSession,
  DistrictQuickStats,
  DistrictRiskZone,
  BroadcastAlertRecord,
  ReportType,
  AlertType,
  AlertSeverity,
} from "@/lib/admin/adminTypes";

const DISTRICT_OPTIONS = [
  "Raisen",
  "Sehore",
  "Vidisha",
  "Bhopal",
  "Sagar",
  "Hoshangabad",
  "Jabalpur",
  "Dewas",
  "Ujjain",
  "Indore",
];

export default function DistrictDashboardPage() {
  const router = useRouter();

  // Session state
  const [session, setSession] = useState<AdminSession | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("Raisen");
  const [activeTab, setActiveTab] = useState<
    "overview" | "broadcast" | "analytics" | "reports" | "handbook" | "email"
  >("overview");

  // Dashboard Telemetry state
  const [stats, setStats] = useState<DistrictQuickStats | null>(null);
  const [riskZones, setRiskZones] = useState<DistrictRiskZone[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<BroadcastAlertRecord[]>([]);
  const [cropStages, setCropStages] = useState<any[]>([]);
  const [pestAlerts, setPestAlerts] = useState<any[]>([]);
  const [recentFeedback, setRecentFeedback] = useState<any[]>([]);
  const [analyticsTrends, setAnalyticsTrends] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Selected Risk Zone drilldown modal
  const [selectedZone, setSelectedZone] = useState<DistrictRiskZone | null>(null);

  // Broadcast Alert Form state
  const [broadcastType, setBroadcastType] = useState<AlertType>("Heavy Rain");
  const [broadcastDistricts, setBroadcastDistricts] = useState<string[]>(["Raisen"]);
  const [broadcastSeverity, setBroadcastSeverity] = useState<AlertSeverity>("High");
  const [broadcastMessage, setBroadcastMessage] = useState<string>(
    "Heavy rainfall warning (40-60mm) expected in Betwa river basin. Waterlogging likely in low-lying crop fields."
  );
  const [broadcastAction, setBroadcastAction] = useState<string>(
    "Clear field drainage channels immediately. Postpone all chemical spray and fertilizer application for 48 hours."
  );
  const [broadcastChannels, setBroadcastChannels] = useState<string[]>([
    "SMS",
    "In-app Notification",
  ]);
  const [broadcastSending, setBroadcastSending] = useState<boolean>(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState<string | null>(null);

  // Email Digest simulation state
  const [emailScheduleId, setEmailScheduleId] = useState<string>("SCHED_DAILY_7AM");
  const [emailDigestPreview, setEmailDigestPreview] = useState<any | null>(null);
  const [emailSending, setEmailSending] = useState<boolean>(false);

  // Load session from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("gagandrishti_gov_token");
    const sessionStr = localStorage.getItem("gagandrishti_gov_session");

    if (sessionStr) {
      try {
        const parsed: AdminSession = JSON.parse(sessionStr);
        setSession(parsed);
        if (parsed.district) {
          setSelectedDistrict(parsed.district);
        }
      } catch {
        // fallback
      }
    }
  }, []);

  // Fetch telemetry for selected district
  const fetchDistrictTelemetry = async (district: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("gagandrishti_gov_token") || "";
      const res = await fetch(
        `/api/admin/district-data?district=${encodeURIComponent(district)}&token=${encodeURIComponent(token)}`
      );
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setRiskZones(data.risk_zones);
        setActiveAlerts(data.active_alerts);
        setCropStages(data.crop_stages);
        setPestAlerts(data.pest_alerts);
        setRecentFeedback(data.recent_feedback);
        setAnalyticsTrends(data.analytics_trends);
      } else {
        setError(data.error || "Failed to load telemetry");
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDistrictTelemetry(selectedDistrict);
  }, [selectedDistrict]);

  const handleLogout = async () => {
    const token = localStorage.getItem("gagandrishti_gov_token");
    if (token) {
      try {
        await fetch("/api/admin/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "logout", token }),
        });
      } catch {}
    }
    localStorage.removeItem("gagandrishti_gov_token");
    localStorage.removeItem("gagandrishti_gov_session");
    router.push("/admin/login");
  };

  // Handle Emergency Alert Broadcast submission
  const handleBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBroadcastSending(true);
    setBroadcastSuccess(null);
    try {
      const token = localStorage.getItem("gagandrishti_gov_token") || "";
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          alert_type: broadcastType,
          affected_districts: broadcastDistricts,
          severity: broadcastSeverity,
          alert_message: broadcastMessage,
          recommended_action: broadcastAction,
          channels: broadcastChannels,
        }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        setBroadcastSuccess(data.result.message);
        // Refresh telemetry to show new alert
        fetchDistrictTelemetry(selectedDistrict);
      } else {
        alert(data.error || "Failed to broadcast alert");
      }
    } catch (err: any) {
      alert(err.message || "Failed to contact broadcast service");
    } finally {
      setBroadcastSending(false);
    }
  };

  // Trigger Email Digest preview / simulation
  const handleSimulateEmail = async (scheduleId: string) => {
    setEmailSending(true);
    try {
      const res = await fetch(
        `/api/admin/email-digest?schedule_id=${scheduleId}&district=${encodeURIComponent(
          selectedDistrict
        )}`
      );
      const data = await res.json();
      if (data.success && data.digest) {
        setEmailDigestPreview(data.digest);
      }
    } catch (err: any) {
      alert("Failed to generate email preview");
    } finally {
      setEmailSending(false);
    }
  };

  // Download Report CSV
  const handleDownloadReport = (reportType: ReportType) => {
    const url = `/api/admin/reports?type=${encodeURIComponent(
      reportType
    )}&district=${encodeURIComponent(selectedDistrict)}&format=download`;
    window.open(url, "_blank");
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "HIGH":
        return "bg-rose-500/10 text-rose-500 border-rose-500/30";
      case "SIGNIFICANT":
        return "bg-amber-500/10 text-amber-500 border-amber-500/30";
      case "CAUTION":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/30";
      default:
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Government Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40 px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Brand & Emblem */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400">
                  Government of Madhya Pradesh
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 font-bold">
                  CHANGE_007
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-black text-white">
                GaganDrishti District Command Center
              </h1>
            </div>
          </div>

          {/* District Selector & Officer Profile */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* District Selector */}
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-slate-400 font-medium">District:</span>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                disabled={session?.role === "District Admin"}
                className="bg-transparent text-sm font-bold text-white focus:outline-none cursor-pointer disabled:opacity-80"
              >
                {DISTRICT_OPTIONS.map((dist) => (
                  <option key={dist} value={dist} className="bg-slate-900 text-white">
                    {dist}
                  </option>
                ))}
              </select>
            </div>

            {/* Officer Identity Card */}
            <div className="hidden md:flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <div>
                <span className="font-bold text-white">{session?.name || "Raj Kumar Singh"}</span>
                <span className="text-slate-400 ml-1.5">({session?.role || "District Admin"})</span>
              </div>
            </div>

            {/* Cache Speed & Optimization Link */}
            <a
              href="/admin/cache-statistics"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition"
              title="Cache Speed & API Quota Telemetry"
            >
              <Zap className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">API Cache</span>
            </a>

            {/* Database Indexes Link */}
            <a
              href="/admin/database-indexes"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold transition"
              title="Database Indexing & Query Benchmarks"
            >
              <Database className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">DB Indexes</span>
            </a>

            {/* Image Optimization Link */}
            <a
              href="/admin/image-optimization"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition"
              title="Image Optimization & Lazy Loading"
            >
              <ImageIcon className="w-4 h-4 text-rose-400" />
              <span className="hidden sm:inline">Images</span>
            </a>

            {/* Error Monitoring & Resilience Link */}
            <a
              href="/admin/errors"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold transition"
              title="Error Monitoring & Resilience Dashboard"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Errors</span>
            </a>

            {/* System Monitoring & Analytics Link (FINAL_007) */}
            <a
              href="/admin/monitoring"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold transition"
              title="Comprehensive System Monitoring & Analytics"
            >
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Monitoring</span>
            </a>

            {/* Pre-Launch Verification & Sign-Off (FINAL_008) */}
            <a
              href="/admin/pre-launch"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition"
              title="Pre-Launch Checklist & Sign-Off"
            >
              <Award className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Pre-Launch</span>
            </a>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto mt-3 flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
          {[
            { id: "overview", label: "District Risk Map & Overview", icon: Layers },
            { id: "broadcast", label: "Emergency Broadcast Tool", icon: Send },
            { id: "analytics", label: "Analytics & Trends", icon: TrendingUp },
            { id: "reports", label: "Report Export Center", icon: FileSpreadsheet },
            { id: "handbook", label: "District Officer's Handbook", icon: BookOpen },
            { id: "email", label: "Email Integration & Schedule", icon: Mail },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md"
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

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 space-y-6">
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 1: DISTRICT OVERVIEW & INTERACTIVE RISK MAP */}
        {/* ============================================================== */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Section 1: Quick Stats Top Cards */}
            {stats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Active Farmers */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                    <span>Active Monitored Farmers</span>
                    <Users className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-3xl font-extrabold text-white">
                    {stats.active_farmers.toLocaleString("en-IN")}
                  </div>
                  <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+{stats.farmers_growth_monthly} newly enrolled this month</span>
                  </div>
                </div>

                {/* Active Alerts */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                    <span>Active Weather Alerts</span>
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-3xl font-extrabold text-white">{stats.active_alerts_count}</div>
                  <div className="text-xs text-slate-400 mt-2 flex items-center gap-2">
                    <span className="text-rose-400 font-bold">
                      🔴 High: {stats.alert_severity_breakdown.high}
                    </span>
                    <span>•</span>
                    <span className="text-amber-400 font-bold">
                      🟠 Med: {stats.alert_severity_breakdown.medium}
                    </span>
                  </div>
                </div>

                {/* Crop Coverage */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                    <span>Dominant Crop Coverage</span>
                    <Sprout className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-lg font-bold text-white truncate">
                    {stats.crop_coverage.map((c) => `${c.crop} ${c.percentage}%`).join(", ")}
                  </div>
                  <div className="text-xs text-slate-400 mt-2">Monsoon Kharif crops dominant</div>
                </div>

                {/* Avg Farm Health */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                    <span>Average Farm Health</span>
                    <Activity className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-3xl font-extrabold text-emerald-400">
                    {stats.avg_farm_health}
                    <span className="text-sm font-normal text-slate-500"> / 10</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-2">
                    Based on {stats.feedback_entries_count} farmer field reports
                  </div>
                </div>
              </div>
            )}

            {/* Section 2: Interactive District Risk Map */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-rose-500" />
                    District Micro-Climate Risk Map ({selectedDistrict})
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live meteorological risk ranking across taluks, PIN codes, and soil types. Click
                    any card for drilldown.
                  </p>
                </div>

                {/* Color Legend */}
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Low Risk
                  </span>
                  <span className="flex items-center gap-1.5 text-yellow-400 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" /> Caution
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-500 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Significant
                  </span>
                  <span className="flex items-center gap-1.5 text-rose-500 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> High Risk
                  </span>
                </div>
              </div>

              {/* Grid of Risk Zones */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {riskZones.map((zone, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedZone(zone)}
                    className={`p-4 rounded-xl border cursor-pointer hover:scale-[1.02] transition shadow-sm ${getRiskColor(
                      zone.risk_level
                    )}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-extrabold text-sm text-white">
                        {zone.village_or_tehsil}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900/60 font-bold">
                        {zone.pincode}
                      </span>
                    </div>

                    <div className="text-xs font-semibold mb-2">
                      Risk Level: <span className="underline">{zone.risk_level}</span>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 mb-3">{zone.risk_reason}</p>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{zone.farmer_count} Farmers</span>
                      <span className="flex items-center gap-1">
                        <CloudRain className="w-3.5 h-3.5 text-blue-400" />
                        {zone.rain_probability}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3 & 4: Active Alerts Feed & Crop Stages */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Active Alerts Feed */}
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  Active Administrative Alerts ({activeAlerts.length})
                </h3>

                <div className="space-y-3">
                  {activeAlerts.map((alert, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/80 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded font-bold ${
                              alert.severity === "High"
                                ? "bg-rose-500/20 text-rose-400"
                                : "bg-amber-500/20 text-amber-400"
                            }`}
                          >
                            {alert.severity}
                          </span>
                          <span className="font-bold text-sm text-white">{alert.alert_type}</span>
                        </div>
                        <span className="text-slate-400 text-[10px]">
                          {new Date(alert.created_at).toLocaleDateString("en-IN")}
                        </span>
                      </div>

                      <div className="text-slate-300">{alert.alert_message}</div>

                      <div className="text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                        <strong>Action Taken / Advisory:</strong> {alert.recommended_action}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span>Areas: {alert.affected_districts.join(", ")}</span>
                        <span className="text-emerald-400 font-semibold">
                          ✓ {alert.farmers_reached.toLocaleString("en-IN")} Farmers Notified (
                          {alert.channels.join(", ")})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Crop Stage Distribution */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <Sprout className="w-5 h-5 text-emerald-400" />
                  Crop Stage Vulnerability Breakdown
                </h3>

                <div className="space-y-3">
                  {cropStages.map((stage, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-white">{stage.stage}</span>
                        <span className="text-slate-400">
                          {stage.farmer_count} farmers ({stage.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full ${
                            stage.risk_rating === "HIGH"
                              ? "bg-rose-500"
                              : stage.risk_rating === "MEDIUM"
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                          style={{ width: `${stage.percentage * 2}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-500 flex justify-between">
                        <span>{stage.stage_hi}</span>
                        <span
                          className={
                            stage.risk_rating === "HIGH" ? "text-rose-400" : "text-slate-400"
                          }
                        >
                          Risk: {stage.risk_rating}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 5 & 6: Recent Feedback & Pest Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Recent Farmer Feedback */}
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-white mb-4 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-sky-400" />
                    Ground-Truth Farmer Feedback Feed
                  </span>
                  <span className="text-xs text-slate-400">Last 20 entries</span>
                </h3>

                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {recentFeedback.slice(0, 8).map((f, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="font-bold text-white">
                          {f.farmer_name}{" "}
                          <span className="text-slate-400 font-normal">({f.village})</span>
                        </div>
                        <div className="text-slate-400 mt-0.5">
                          {f.crop_name} • {f.crop_stage}
                        </div>
                        {f.pest_disease_observed && (
                          <div className="text-amber-400 text-[11px] mt-1">
                            Pest: {f.pest_disease_observed}
                          </div>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="px-2 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-400 text-xs">
                          {f.farm_health_rating}/10 Health
                        </span>
                        <div className="text-[10px] text-slate-500 mt-1">
                          {f.created_at?.split("T")[0]}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pest/Disease Radar */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                  Pest & Disease Outbreak Radar
                </h3>

                <div className="space-y-2.5">
                  {pestAlerts.map((pest, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white">{pest.pest_name}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400">
                          {pest.risk_level}
                        </span>
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        Target Crop: <strong>{pest.crop}</strong> • {pest.reported_cases_last_7_days}{" "}
                        field reports this week
                      </div>
                      <div className="text-emerald-400 text-[11px] mt-1">
                        Remedy: {pest.remedy_hindi}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: EMERGENCY ALERT BROADCAST TOOL */}
        {/* ============================================================== */}
        {activeTab === "broadcast" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-4xl mx-auto shadow-sm">
            <div className="mb-6">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                Task 4: High-Priority Emergency Communication
              </span>
              <h2 className="text-2xl font-black text-white mt-1">
                Emergency Alert Broadcasting Tool
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Instantly broadcast critical meteorological warnings, flood advisories, or pest
                alerts to all registered farmers via SMS and In-app notification.
              </p>
            </div>

            {broadcastSuccess && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>{broadcastSuccess}</span>
              </div>
            )}

            <form onSubmit={handleBroadcastSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Alert Type
                  </label>
                  <select
                    value={broadcastType}
                    onChange={(e) => setBroadcastType(e.target.value as AlertType)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[
                      "Heavy Rain",
                      "Flood Warning",
                      "Strong Wind",
                      "Hail Storm",
                      "Heat Wave",
                      "Frost Alert",
                      "Cyclone Warning",
                      "Pest Outbreak",
                      "Other",
                    ].map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Target District
                  </label>
                  <select
                    value={broadcastDistricts[0]}
                    onChange={(e) => setBroadcastDistricts([e.target.value])}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {["All", ...DISTRICT_OPTIONS].map((dist) => (
                      <option key={dist} value={dist}>
                        {dist === "All" ? "Statewide (All Districts)" : dist}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Severity Level
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["Caution", "Significant", "High", "Extreme"] as AlertSeverity[]).map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setBroadcastSeverity(sev)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                        broadcastSeverity === sev
                          ? sev === "Extreme"
                            ? "bg-purple-600 border-purple-500 text-white"
                            : sev === "High"
                            ? "bg-rose-600 border-rose-500 text-white"
                            : sev === "Significant"
                            ? "bg-amber-600 border-amber-500 text-white"
                            : "bg-yellow-600 border-yellow-500 text-white"
                          : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Alert Message (Max 500 characters)
                </label>
                <textarea
                  rows={3}
                  maxLength={500}
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <div className="text-right text-[10px] text-slate-500 mt-1">
                  {broadcastMessage.length} / 500 characters
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Recommended Action (Actionable Farmer Checklist)
                </label>
                <textarea
                  rows={2}
                  maxLength={500}
                  value={broadcastAction}
                  onChange={(e) => setBroadcastAction(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Broadcast Channels
                </label>
                <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-300">
                  {["SMS", "In-app Notification", "Email", "Broadcast"].map((ch) => (
                    <label key={ch} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={broadcastChannels.includes(ch)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setBroadcastChannels([...broadcastChannels, ch]);
                          } else {
                            setBroadcastChannels(broadcastChannels.filter((c) => c !== ch));
                          }
                        }}
                        className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{ch}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={broadcastSending}
                  className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {broadcastSending ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Broadcasting Alert Across Networks...
                    </span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Immediately to All Registered Farmers in District
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: ANALYTICS & TRENDS */}
        {/* ============================================================== */}
        {activeTab === "analytics" && analyticsTrends && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Farmer Growth Over Time */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  Farmer Registration Growth (90 Days)
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Growth in registered agricultural landholders receiving weather intelligence.
                </p>

                <div className="space-y-3">
                  {analyticsTrends.farmer_growth.map((item: any, idx: number) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-300">{item.date}</span>
                        <span className="text-white font-bold">
                          {item.farmers.toLocaleString("en-IN")} Farmers
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(item.farmers / 3000) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alert Effectiveness */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Alert Action Effectiveness
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Comparison between alerts issued and farmer actions verified via feedback.
                </p>

                <div className="space-y-3">
                  {analyticsTrends.alert_effectiveness.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-white">{item.alert_type} Alerts</div>
                        <div className="text-slate-400 text-[11px]">
                          {item.issued} issued • {item.acted_upon} verified acted upon
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded-md font-bold bg-emerald-500/20 text-emerald-400">
                        {item.effectiveness_rate} compliance
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Monthly Weather Heat Patterns */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <CloudRain className="w-5 h-5 text-sky-400" />
                Monthly Weather Pattern & Risk History ({selectedDistrict})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="p-3">Month</th>
                      <th className="p-3">Avg Rainfall (mm)</th>
                      <th className="p-3">Peak Temp (°C)</th>
                      <th className="p-3">High Risk Days</th>
                      <th className="p-3">Key Hazard Concern</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {analyticsTrends.weather_patterns.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-white">{row.month}</td>
                        <td className="p-3 text-blue-400 font-semibold">{row.avg_rain_mm} mm</td>
                        <td className="p-3 text-amber-400 font-semibold">{row.max_temp}°C</td>
                        <td className="p-3 font-bold text-rose-400">{row.risk_days} Days</td>
                        <td className="p-3 text-slate-300">
                          {row.avg_rain_mm > 200
                            ? "Heavy waterlogging & fungal blight"
                            : "Early moisture stress & whitefly vectors"}
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
        {/* TAB 4: REPORT EXPORT CENTER */}
        {/* ============================================================== */}
        {activeTab === "reports" && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                Task 5: Official Documentation & Export
              </span>
              <h2 className="text-2xl font-black text-white mt-1">Report Export Center</h2>
              <p className="text-xs text-slate-400 mt-1">
                Download verified government summaries, farmer feedback logs, and risk assessments
                in CSV format for official use and state reporting.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  title: "Weekly Summary Report",
                  desc: "Comprehensive weekly synthesis of registered farmers, crop coverage %, active weather warnings, farm health ratings, and top pest reports.",
                  type: "Weekly Summary Report",
                },
                {
                  title: "Farmer Feedback Report",
                  desc: "Row-level archive of all ground-truth farmer feedback entries, crop stages, farm health ratings, and pest observations.",
                  type: "Farmer Feedback Report",
                },
                {
                  title: "Alert Response Report",
                  desc: "Official audit log of emergency broadcasts dispatched, channels used, number of farmers reached, and acknowledgement rates.",
                  type: "Alert Response Report",
                },
                {
                  title: "District Risk Assessment",
                  desc: "Spatial matrix of all pincodes/villages with elevation profiles, soil classifications, live risk scoring, and disaster mitigation checklists.",
                  type: "District Risk Assessment",
                },
              ].map((rep, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-base font-bold text-white">{rep.title}</h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 font-bold">
                        CSV / Spreadsheet
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">{rep.desc}</p>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-slate-800">
                    <button
                      onClick={() => handleDownloadReport(rep.type as ReportType)}
                      className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download CSV ({selectedDistrict})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: DISTRICT OFFICER'S HANDBOOK */}
        {/* ============================================================== */}
        {activeTab === "handbook" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-4xl mx-auto shadow-sm space-y-6">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                Task 7: Standard Operating Procedures
              </span>
              <h2 className="text-2xl font-black text-white mt-1">
                District Officer's Operating Handbook
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Reference manual for District Collectors, Agriculture Officers, and Disaster
                Management Teams.
              </p>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-slate-300">
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                    1
                  </span>
                  Login & Navigation
                </h3>
                <p>
                  Access the Command Center using your official government email address (
                  <code>@mp.gov.in</code>). Upon entering password credentials, a 6-digit OTP is
                  sent to your registered mobile phone. Sessions automatically time out after 30
                  minutes of inactivity for security.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                    2
                  </span>
                  Reading the Risk Map
                </h3>
                <p>
                  The interactive Risk Map aggregates live Open-Meteo telemetry with soil drainage
                  characteristics and elevation.
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>
                    <strong className="text-emerald-400">Green (Low Risk):</strong> Normal
                    conditions; farming activities proceed as scheduled.
                  </li>
                  <li>
                    <strong className="text-yellow-400">Yellow (Caution):</strong> Passing showers
                    or gusty winds; chemical spraying should be delayed.
                  </li>
                  <li>
                    <strong className="text-amber-400">Orange (Significant):</strong> Persistent high
                    humidity causing foliar fungal blight or whitefly surge.
                  </li>
                  <li>
                    <strong className="text-rose-400">Red (High Risk):</strong> Heavy rainfall &gt;
                    40mm on vertisol black soil resulting in imminent waterlogging.
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                    3
                  </span>
                  Broadcasting Emergency Alerts
                </h3>
                <p>
                  Navigate to the <strong>Emergency Broadcast Tool</strong> tab. Select the alert
                  category, specify affected taluks/districts, select severity, and input clear
                  actionable instructions. Alerts are automatically dispatched over SMS to feature
                  phone farmers and in-app notifications.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                    4
                  </span>
                  Disaster Response & Evacuation Protocols
                </h3>
                <p>
                  In the event of severe flood warnings in the Narmada or Betwa basins, coordinate
                  with the State Disaster Management Authority (SDMA, 1070) and National Highway
                  Patrol (1033). Evacuate cattle and machinery to high-elevation alluvial knolls
                  identified on the map.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 6: GOVERNMENT EMAIL INTEGRATION */}
        {/* ============================================================== */}
        {activeTab === "email" && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                Task 8: Automated Decision Briefings
              </span>
              <h2 className="text-2xl font-black text-white mt-1">
                Government Email Integration & Schedules
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Automated administrative digests delivered to District Collectors, SDMA, and
                Agriculture Directors.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  id: "SCHED_DAILY_7AM",
                  title: "Daily Morning Briefing (7 AM)",
                  recipients: "All District Admins",
                  desc: "Morning digest of weather warnings, high-risk micro-climate zones, and top pest alerts.",
                },
                {
                  id: "SCHED_WEEKLY_FRI",
                  title: "Weekly Summary (Friday Evening)",
                  recipients: "District & State Admins",
                  desc: "Comprehensive weekly telemetry review, farmer compliance stats, and crop health distributions.",
                },
                {
                  id: "SCHED_REALTIME_DISASTER",
                  title: "Real-time Alert Dispatch",
                  recipients: "Disaster Management Officers",
                  desc: "Instant urgent notifications when extreme rainfall or convective hazards exceed danger thresholds.",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                      ACTIVE SCHEDULE
                    </span>
                    <h3 className="text-sm font-bold text-white mt-2 mb-1">{item.title}</h3>
                    <div className="text-[11px] text-blue-400 mb-2">Recipients: {item.recipients}</div>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">{item.desc}</p>
                  </div>

                  <button
                    onClick={() => handleSimulateEmail(item.id)}
                    disabled={emailSending}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition flex items-center justify-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5 text-blue-400" />
                    Preview / Dispatch Email
                  </button>
                </div>
              ))}
            </div>

            {/* Email Preview Modal / Box */}
            {emailDigestPreview && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-xs font-bold text-emerald-400 uppercase">
                      Email Preview Generated
                    </span>
                    <h3 className="text-base font-bold text-white">{emailDigestPreview.subject}</h3>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Recipients: {emailDigestPreview.recipients.join(", ")}
                    </div>
                  </div>
                  <button
                    onClick={() => setEmailDigestPreview(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-white text-slate-900 p-4 rounded-xl text-xs overflow-x-auto">
                  <div dangerouslySetInnerHTML={{ __html: emailDigestPreview.html_preview }} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Drilldown Modal for Selected Risk Zone */}
        {selectedZone && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative">
              <button
                onClick={() => setSelectedZone(null)}
                className="absolute right-4 top-4 p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${getRiskColor(
                    selectedZone.risk_level
                  )}`}
                >
                  {selectedZone.risk_level} RISK
                </span>
                <span className="text-xs font-mono text-slate-400">PIN: {selectedZone.pincode}</span>
              </div>

              <h2 className="text-xl font-black text-white">{selectedZone.village_or_tehsil}</h2>
              <div className="text-xs text-slate-400 mt-1 mb-4">
                District: {selectedZone.district}, MP • Elevation: {selectedZone.elevation_m}m • Soil:{" "}
                {selectedZone.soil_type}
              </div>

              <div className="space-y-3 text-xs bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 mb-4">
                <div>
                  <strong className="text-slate-200">Risk Assessment:</strong>
                  <p className="text-slate-300 mt-0.5">{selectedZone.risk_reason}</p>
                </div>
                <div>
                  <strong className="text-slate-200">Recommended Action:</strong>
                  <p className="text-emerald-400 mt-0.5">{selectedZone.recommended_action}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-700/60 text-center">
                  <div>
                    <div className="text-[10px] text-slate-400">Rain Prob</div>
                    <div className="font-bold text-blue-400 text-sm">
                      {selectedZone.rain_probability}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Temperature</div>
                    <div className="font-bold text-amber-400 text-sm">
                      {selectedZone.current_temp}°C
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Farmers</div>
                    <div className="font-bold text-white text-sm">{selectedZone.farmer_count}</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedZone(null)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                >
                  Close Drilldown
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

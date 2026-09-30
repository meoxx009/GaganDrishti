"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock,
  Database,
  Download,
  ExternalLink,
  Flame,
  Globe,
  HardDrive,
  Info,
  Mail,
  PieChart,
  Play,
  RefreshCw,
  Send,
  Server,
  ShieldAlert,
  Smartphone,
  Sparkles,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Users,
  Wifi,
  XCircle,
} from "lucide-react";
import {
  MonitoringDashboardData,
  DailyHealthReport,
  WeeklyAnalyticsReport,
  ApiCallLogEntry,
  FormSubmissionLogEntry,
  SmsLogEntry,
  ErrorLogEntry,
  UserSessionLogEntry,
  PerformanceLogEntry,
  DatabaseQueryLogEntry,
} from "@/lib/monitoring/monitoringTypes";

export default function AdminMonitoringPage() {
  const [data, setData] = useState<MonitoringDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "api_logs" | "form_logs" | "sms_logs" | "errors" | "sessions" | "perf" | "db" | "reports"
  >("overview");
  const [tableLogs, setTableLogs] = useState<any[]>([]);
  const [selectedError, setSelectedError] = useState<ErrorLogEntry | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [dailyReport, setDailyReport] = useState<DailyHealthReport | null>(null);
  const [weeklyReport, setWeeklyReport] = useState<WeeklyAnalyticsReport | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);

  // Fetch monitoring dashboard data
  const fetchDashboard = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/monitoring");
      const json = await res.json();
      if (json.success) {
        setData(json.dashboard);
      }
    } catch (err) {
      console.error("Failed to load monitoring dashboard:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch specific table logs
  const fetchTable = async (tableKey: string) => {
    try {
      const res = await fetch(`/api/admin/monitoring?table=${tableKey}`);
      const json = await res.json();
      if (json.success) {
        setTableLogs(json.data);
      }
    } catch (err) {
      console.error(`Failed to load ${tableKey}:`, err);
    }
  };

  // Fetch Daily Report
  const fetchDailyReport = async () => {
    try {
      const res = await fetch("/api/admin/monitoring/daily-report");
      const json = await res.json();
      if (json.success) setDailyReport(json.report);
    } catch {}
  };

  // Fetch Weekly Report
  const fetchWeeklyReport = async () => {
    try {
      const res = await fetch("/api/admin/monitoring/weekly-report");
      const json = await res.json();
      if (json.success) setWeeklyReport(json.report);
    } catch {}
  };

  useEffect(() => {
    fetchDashboard();
    fetchDailyReport();
    fetchWeeklyReport();
  }, []);

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    if (tab === "api_logs") fetchTable("api_calls");
    else if (tab === "form_logs") fetchTable("form_submissions");
    else if (tab === "sms_logs") fetchTable("sms");
    else if (tab === "errors") fetchTable("errors");
    else if (tab === "sessions") fetchTable("sessions");
    else if (tab === "perf") fetchTable("performance");
    else if (tab === "db") fetchTable("db_queries");
  };

  // Simulate an incident to trigger alerts (Step 2)
  const handleSimulateIncident = async (incident_type: string) => {
    setSimulating(true);
    try {
      const res = await fetch("/api/admin/monitoring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "simulate_incident", incident_type }),
      });
      const json = await res.json();
      if (json.success) {
        setActionNotice(`✓ Incident '${incident_type}' simulated! Automatic alert triggered.`);
        fetchDashboard();
        setTimeout(() => setActionNotice(null), 5000);
      }
    } catch {
      setActionNotice("❌ Failed to simulate incident");
    } finally {
      setSimulating(false);
    }
  };

  // Resolve alert
  const handleResolveAlert = async (event_id: string) => {
    try {
      const res = await fetch("/api/admin/monitoring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resolve_alert", event_id }),
      });
      const json = await res.json();
      if (json.success) {
        setActionNotice("✓ Alert marked as resolved.");
        fetchDashboard();
        setTimeout(() => setActionNotice(null), 4000);
      }
    } catch {}
  };

  // Dispatch daily email simulation
  const handleSendDailyEmail = async () => {
    setSendingEmail(true);
    try {
      const res = await fetch("/api/admin/monitoring/daily-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient: "admin@gagandrishti.gov.in" }),
      });
      const json = await res.json();
      if (json.success) {
        setActionNotice("📧 Morning 7 AM Health Report dispatched to admin@gagandrishti.gov.in");
        setTimeout(() => setActionNotice(null), 5000);
      }
    } catch {
      setActionNotice("Failed to dispatch email");
    } finally {
      setSendingEmail(false);
    }
  };

  if (isLoading && !data) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#030609] text-slate-900 dark:text-white p-6 sm:p-10 flex flex-col items-center justify-center gap-4">
        <RefreshCw className="h-8 w-8 text-cyan-500 animate-spin" />
        <p className="text-sm text-slate-500">Loading comprehensive monitoring telemetry...</p>
      </div>
    );
  }

  const overallColor =
    data?.overall_status === "HEALTHY"
      ? "text-emerald-500 border-emerald-500/30 bg-emerald-500/10"
      : data?.overall_status === "DEGRADED"
      ? "text-amber-500 border-amber-500/30 bg-amber-500/10"
      : "text-rose-500 border-rose-500/30 bg-rose-500/10";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030609] text-slate-900 dark:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-[#05090D]/95 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                GaganDrishti Monitoring &amp; Analytics
              </h1>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${overallColor}`}>
                ● {data?.overall_status}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real-time telemetry, 6 core audit logs &amp; proactive alert rules (FINAL_007)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboard}
            type="button"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080E14] px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#0B1219] transition"
          >
            <RefreshCw className="h-3.5 w-3.5 text-cyan-500" />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <Link
            href="/admin/district-dashboard"
            className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition"
          >
            <span>District Dashboard</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      {/* Action Notice Banner */}
      {actionNotice && (
        <div className="bg-cyan-500/15 border-b border-cyan-500/30 px-6 py-2.5 text-center text-xs font-semibold text-cyan-300">
          {actionNotice}
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800/80 text-xs font-semibold scrollbar-none">
          <button
            onClick={() => handleTabChange("overview")}
            className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap min-h-[40px] ${
              activeTab === "overview"
                ? "bg-cyan-500 text-slate-950 font-bold shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-white"
            }`}
          >
            📊 System Health &amp; Trends
          </button>
          <button
            onClick={() => handleTabChange("api_logs")}
            className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap min-h-[40px] ${
              activeTab === "api_logs"
                ? "bg-cyan-500 text-slate-950 font-bold shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-white"
            }`}
          >
            API Logs ({data?.log_counts.api_calls ?? 0})
          </button>
          <button
            onClick={() => handleTabChange("form_logs")}
            className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap min-h-[40px] ${
              activeTab === "form_logs"
                ? "bg-cyan-500 text-slate-950 font-bold shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-white"
            }`}
          >
            Form Logs ({data?.log_counts.form_submissions ?? 0})
          </button>
          <button
            onClick={() => handleTabChange("sms_logs")}
            className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap min-h-[40px] ${
              activeTab === "sms_logs"
                ? "bg-cyan-500 text-slate-950 font-bold shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-white"
            }`}
          >
            SMS Logs ({data?.log_counts.sms ?? 0})
          </button>
          <button
            onClick={() => handleTabChange("errors")}
            className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap min-h-[40px] ${
              activeTab === "errors"
                ? "bg-cyan-500 text-slate-950 font-bold shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-white"
            }`}
          >
            Error Logs ({data?.log_counts.errors ?? 0})
          </button>
          <button
            onClick={() => handleTabChange("sessions")}
            className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap min-h-[40px] ${
              activeTab === "sessions"
                ? "bg-cyan-500 text-slate-950 font-bold shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-white"
            }`}
          >
            User Sessions ({data?.log_counts.sessions ?? 0})
          </button>
          <button
            onClick={() => handleTabChange("perf")}
            className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap min-h-[40px] ${
              activeTab === "perf"
                ? "bg-cyan-500 text-slate-950 font-bold shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-white"
            }`}
          >
            Performance ({data?.log_counts.performance ?? 0})
          </button>
          <button
            onClick={() => handleTabChange("db")}
            className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap min-h-[40px] ${
              activeTab === "db"
                ? "bg-cyan-500 text-slate-950 font-bold shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-white"
            }`}
          >
            DB Queries ({data?.log_counts.db_queries ?? 0})
          </button>
          <button
            onClick={() => handleTabChange("reports")}
            className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap min-h-[40px] ${
              activeTab === "reports"
                ? "bg-cyan-500 text-slate-950 font-bold shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-white"
            }`}
          >
            📧 Daily &amp; Weekly Reports
          </button>
        </div>

        {/* ── Active Alerts Banner (Step 2) ───────────────────────────── */}
        {data && data.active_alerts.length > 0 && (
          <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <ShieldAlert className="h-5 w-5 animate-pulse" />
                <span>
                  {data.active_alerts.length} Active System Alert{data.active_alerts.length > 1 ? "s" : ""} Triggered
                </span>
              </div>
              <span className="text-[11px] text-rose-300 font-medium">Auto-dispatched to admin email</span>
            </div>

            <div className="space-y-2">
              {data.active_alerts.map((alt) => (
                <div
                  key={alt.event_id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/60 border border-rose-500/20 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-rose-500/20 text-rose-300">
                        {alt.severity}
                      </span>
                      <span className="font-bold text-white">{alt.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ({new Date(alt.timestamp).toLocaleTimeString("en-IN")})
                      </span>
                    </div>
                    <p className="text-slate-300">{alt.message}</p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Metric: <strong className="text-white">{alt.metric_value}</strong> (Threshold: {alt.threshold})
                    </p>
                  </div>
                  <button
                    onClick={() => handleResolveAlert(alt.event_id)}
                    type="button"
                    className="self-start sm:self-center px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-bold border border-emerald-500/40 transition shrink-0"
                  >
                    Mark Resolved
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 1: OVERVIEW & HEALTH STATUS (Step 3) ───────────────── */}
        {activeTab === "overview" && data && (
          <div className="space-y-6">
            {/* Section 1: Overall Health Status Cards */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                🟢 Overall Health Status (Step 3)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. API Health */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080E14] p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {data.health_cards.api_health.title}
                    </span>
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        data.health_cards.api_health.status === "green"
                          ? "bg-emerald-500"
                          : data.health_cards.api_health.status === "yellow"
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      }`}
                    />
                  </div>
                  <div className="text-3xl font-black font-mono text-slate-900 dark:text-white">
                    {data.health_cards.api_health.current_percentage}%
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    {data.health_cards.api_health.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400 font-mono border-t border-slate-100 dark:border-slate-800/80 pt-2">
                    <span>Target: &gt; {data.health_cards.api_health.target_percentage}%</span>
                    <span className="text-emerald-500 font-semibold">Sub-3s P95</span>
                  </div>
                </div>

                {/* 2. Form Health */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080E14] p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {data.health_cards.form_health.title}
                    </span>
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        data.health_cards.form_health.status === "green"
                          ? "bg-emerald-500"
                          : data.health_cards.form_health.status === "yellow"
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      }`}
                    />
                  </div>
                  <div className="text-3xl font-black font-mono text-slate-900 dark:text-white">
                    {data.health_cards.form_health.current_percentage}%
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    {data.health_cards.form_health.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400 font-mono border-t border-slate-100 dark:border-slate-800/80 pt-2">
                    <span>Target: &gt; {data.health_cards.form_health.target_percentage}%</span>
                    <span className="text-emerald-500 font-semibold">Validated</span>
                  </div>
                </div>

                {/* 3. SMS Health */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080E14] p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {data.health_cards.sms_health.title}
                    </span>
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        data.health_cards.sms_health.status === "green"
                          ? "bg-emerald-500"
                          : data.health_cards.sms_health.status === "yellow"
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      }`}
                    />
                  </div>
                  <div className="text-3xl font-black font-mono text-slate-900 dark:text-white">
                    {data.health_cards.sms_health.current_percentage}%
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    {data.health_cards.sms_health.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400 font-mono border-t border-slate-100 dark:border-slate-800/80 pt-2">
                    <span>Target: &gt; {data.health_cards.sms_health.target_percentage}%</span>
                    <span className="text-sky-400 font-semibold">Twilio Rural</span>
                  </div>
                </div>

                {/* 4. Database Health */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080E14] p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {data.health_cards.database_health.title}
                    </span>
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        data.health_cards.database_health.status === "green"
                          ? "bg-emerald-500"
                          : data.health_cards.database_health.status === "yellow"
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      }`}
                    />
                  </div>
                  <div className="text-3xl font-black font-mono text-slate-900 dark:text-white">
                    {data.health_cards.database_health.current_percentage}%
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    {data.health_cards.database_health.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400 font-mono border-t border-slate-100 dark:border-slate-800/80 pt-2">
                    <span>Target: &gt; {data.health_cards.database_health.target_percentage}%</span>
                    <span className="text-cyan-400 font-semibold">15 Indexes</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Performance Metrics (Last 24 Hours) */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080E14] p-6 shadow-xs">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
                📊 Performance Metrics (Last 24 Hours)
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B1219] border border-slate-200/60 dark:border-slate-800/40">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Avg Page Load</span>
                  <p className="font-mono text-xl font-bold text-slate-900 dark:text-white mt-1">
                    {data.performance_24h.average_page_load_ms} <span className="text-xs font-normal">ms</span>
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B1219] border border-slate-200/60 dark:border-slate-800/40">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">95th Percentile</span>
                  <p className="font-mono text-xl font-bold text-slate-900 dark:text-white mt-1">
                    {data.performance_24h.p95_page_load_ms} <span className="text-xs font-normal">ms</span>
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B1219] border border-slate-200/60 dark:border-slate-800/40">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Peak Traffic</span>
                  <p className="font-mono text-sm font-bold text-slate-900 dark:text-white mt-1 truncate">
                    {data.performance_24h.peak_traffic_time}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B1219] border border-slate-200/60 dark:border-slate-800/40">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Total API Calls</span>
                  <p className="font-mono text-xl font-bold text-cyan-400 mt-1">
                    {data.performance_24h.total_api_calls.toLocaleString()}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B1219] border border-slate-200/60 dark:border-slate-800/40">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Total SMS Sent</span>
                  <p className="font-mono text-xl font-bold text-emerald-400 mt-1">
                    {data.performance_24h.total_sms_sent.toLocaleString()}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B1219] border border-slate-200/60 dark:border-slate-800/40">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Form Submissions</span>
                  <p className="font-mono text-xl font-bold text-indigo-400 mt-1">
                    {data.performance_24h.total_form_submissions.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3: 7-Day Trends */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080E14] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  📈 7-Day Telemetry Trends (Step 3)
                </h2>
                <span className="text-xs text-slate-400 font-mono">Last 7 Days</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Trend 1: API Latency */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B1219] border border-slate-200/60 dark:border-slate-800/40 space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">API Response Time</span>
                  <div className="h-16 flex items-end gap-1.5 pt-2">
                    {data.seven_day_trends.map((t, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full bg-cyan-500/80 rounded-t"
                          style={{ height: `${Math.max(15, (t.api_response_time_ms / 250) * 45)}px` }}
                          title={`${t.day_label}: ${t.api_response_time_ms}ms`}
                        />
                        <span className="text-[9px] text-slate-400 font-mono">{t.day_label.slice(0, 1)}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Today: 148ms (-18ms vs Mon)</p>
                </div>

                {/* Trend 2: Form Submissions */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B1219] border border-slate-200/60 dark:border-slate-800/40 space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Form Submissions</span>
                  <div className="h-16 flex items-end gap-1.5 pt-2">
                    {data.seven_day_trends.map((t, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full bg-emerald-500/80 rounded-t"
                          style={{ height: `${Math.max(15, (t.form_submissions / 350) * 45)}px` }}
                          title={`${t.day_label}: ${t.form_submissions}`}
                        />
                        <span className="text-[9px] text-slate-400 font-mono">{t.day_label.slice(0, 1)}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Today: 280 submissions (+35)</p>
                </div>

                {/* Trend 3: Error Rate */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B1219] border border-slate-200/60 dark:border-slate-800/40 space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Error Rate (%)</span>
                  <div className="h-16 flex items-end gap-1.5 pt-2">
                    {data.seven_day_trends.map((t, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full bg-rose-500/80 rounded-t"
                          style={{ height: `${Math.max(10, (t.error_rate_pct / 3) * 45)}px` }}
                          title={`${t.day_label}: ${t.error_rate_pct}%`}
                        />
                        <span className="text-[9px] text-slate-400 font-mono">{t.day_label.slice(0, 1)}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Today: 0.8% (Target &lt; 2%)</p>
                </div>

                {/* Trend 4: Active Users */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B1219] border border-slate-200/60 dark:border-slate-800/40 space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Active Farmer Users</span>
                  <div className="h-16 flex items-end gap-1.5 pt-2">
                    {data.seven_day_trends.map((t, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full bg-indigo-500/80 rounded-t"
                          style={{ height: `${Math.max(15, (t.active_users / 3800) * 45)}px` }}
                          title={`${t.day_label}: ${t.active_users}`}
                        />
                        <span className="text-[9px] text-slate-400 font-mono">{t.day_label.slice(0, 1)}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Peak: 3,450 farmers</p>
                </div>
              </div>
            </div>

            {/* Section 4: Incident Simulation Playground (Step 2 Testing) */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080E14] p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    ⚡ Incident Simulation Playground (Step 2 Verification)
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Test automated alert dispatch rules by injecting synthetic failures into the monitoring pipeline.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5 pt-1">
                <button
                  onClick={() => handleSimulateIncident("api_timeout")}
                  disabled={simulating}
                  type="button"
                  className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-semibold border border-amber-500/30 text-xs transition"
                >
                  ⚡ Simulate API Timeout (&gt; 5s)
                </button>
                <button
                  onClick={() => handleSimulateIncident("sms_failure")}
                  disabled={simulating}
                  type="button"
                  className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold border border-rose-500/30 text-xs transition"
                >
                  ⚡ Simulate SMS Carrier Failure
                </button>
                <button
                  onClick={() => handleSimulateIncident("repeated_error")}
                  disabled={simulating}
                  type="button"
                  className="px-3.5 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-semibold border border-indigo-500/30 text-xs transition"
                >
                  ⚡ Simulate Repeated Error Spike (22x)
                </button>
              </div>
            </div>

            {/* Section 5: Recent Errors (Last 50) */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080E14] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  ⚠️ Recent Errors (Last 50)
                </h2>
                <span className="text-xs text-slate-400 font-mono">Sorted by latest occurrence</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800/80 text-slate-400 font-semibold">
                      <th className="pb-3 pr-4">Time</th>
                      <th className="pb-3 pr-4">Type</th>
                      <th className="pb-3 pr-4">Message</th>
                      <th className="pb-3 pr-4">Page</th>
                      <th className="pb-3 pr-4">Count</th>
                      <th className="pb-3 pr-4">Severity</th>
                      <th className="pb-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {data.recent_errors.map((err) => (
                      <tr key={err.log_id} className="hover:bg-slate-50/50 dark:hover:bg-[#0B1219]/60">
                        <td className="py-3 pr-4 font-mono text-slate-400">
                          {new Date(err.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="py-3 pr-4 font-semibold text-rose-400 font-mono">{err.error_type}</td>
                        <td className="py-3 pr-4 text-slate-300 max-w-xs truncate" title={err.error_message}>
                          {err.error_message}
                        </td>
                        <td className="py-3 pr-4 text-slate-400 font-mono">{err.page_url}</td>
                        <td className="py-3 pr-4">
                          <span className="px-2 py-0.5 rounded-full font-bold bg-slate-800 text-white font-mono">
                            {err.occurrences}x
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              err.severity === "critical"
                                ? "bg-rose-500/20 text-rose-300"
                                : err.severity === "error"
                                ? "bg-amber-500/20 text-amber-300"
                                : "bg-slate-700 text-slate-300"
                            }`}
                          >
                            {err.severity.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3">
                          <button
                            onClick={() => setSelectedError(err)}
                            className="text-cyan-400 hover:underline font-semibold"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: API CALL LOGS (Step 1) ──────────────────────────── */}
        {activeTab === "api_logs" && (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080E14] p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Server className="h-4 w-4 text-cyan-400" />
              <span>API_CALL_LOGS (Open-Meteo, NOAA, IMD, Twilio)</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800/80 text-slate-400 font-semibold">
                    <th className="pb-3 pr-4">Log ID</th>
                    <th className="pb-3 pr-4">Timestamp</th>
                    <th className="pb-3 pr-4">API Name</th>
                    <th className="pb-3 pr-4">Endpoint</th>
                    <th className="pb-3 pr-4">Latency</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3">Cache Hit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                  {tableLogs.map((log: ApiCallLogEntry) => (
                    <tr key={log.log_id} className="hover:bg-slate-50/50 dark:hover:bg-[#0B1219]/60">
                      <td className="py-3 pr-4 font-bold text-sky-400">#{log.log_id}</td>
                      <td className="py-3 pr-4 text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString("en-IN")}
                      </td>
                      <td className="py-3 pr-4 font-sans font-semibold text-white">{log.api_name}</td>
                      <td className="py-3 pr-4 text-slate-300 max-w-sm truncate" title={log.endpoint}>
                        {log.endpoint}
                      </td>
                      <td className="py-3 pr-4 text-slate-300">{log.response_time_ms} ms</td>
                      <td className="py-3 pr-4 font-sans">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.status === "success"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-rose-500/20 text-rose-400"
                          }`}
                        >
                          {log.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 font-sans">
                        {log.cache_hit ? (
                          <span className="text-emerald-400 font-bold">✓ Yes</span>
                        ) : (
                          <span className="text-slate-400">No</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 3: FORM SUBMISSION LOGS (Step 1) ───────────────────── */}
        {activeTab === "form_logs" && (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080E14] p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>FORM_SUBMISSION_LOGS (Farmer Feedback, Crop Reports)</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800/80 text-slate-400 font-semibold">
                    <th className="pb-3 pr-4">Log ID</th>
                    <th className="pb-3 pr-4">Time</th>
                    <th className="pb-3 pr-4">Form</th>
                    <th className="pb-3 pr-4">Farmer</th>
                    <th className="pb-3 pr-4">PIN</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                  {tableLogs.map((log: FormSubmissionLogEntry) => (
                    <tr key={log.log_id} className="hover:bg-slate-50/50 dark:hover:bg-[#0B1219]/60">
                      <td className="py-3 pr-4 font-bold text-sky-400">#{log.log_id}</td>
                      <td className="py-3 pr-4 text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString("en-IN")}
                      </td>
                      <td className="py-3 pr-4 font-sans font-semibold text-white">{log.form_name}</td>
                      <td className="py-3 pr-4 font-sans text-slate-300">{log.farmer_name || "Anonymous"}</td>
                      <td className="py-3 pr-4 text-slate-300">{log.pincode || "-"}</td>
                      <td className="py-3 pr-4 font-sans">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.status === "success"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-rose-500/20 text-rose-400"
                          }`}
                        >
                          {log.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 text-slate-300">{log.submission_time_ms} ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 4: SMS LOGS (Step 1) ───────────────────────────────── */}
        {activeTab === "sms_logs" && (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080E14] p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Mail className="h-4 w-4 text-sky-400" />
              <span>SMS_LOGS (Twilio Rural SMS Gateway)</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800/80 text-slate-400 font-semibold">
                    <th className="pb-3 pr-4">Log ID</th>
                    <th className="pb-3 pr-4">Time</th>
                    <th className="pb-3 pr-4">Phone</th>
                    <th className="pb-3 pr-4">Direction</th>
                    <th className="pb-3 pr-4">Message</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3">Twilio SID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                  {tableLogs.map((log: SmsLogEntry) => (
                    <tr key={log.log_id} className="hover:bg-slate-50/50 dark:hover:bg-[#0B1219]/60">
                      <td className="py-3 pr-4 font-bold text-sky-400">#{log.log_id}</td>
                      <td className="py-3 pr-4 text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString("en-IN")}
                      </td>
                      <td className="py-3 pr-4 text-slate-300">{log.phone_number}</td>
                      <td className="py-3 pr-4 font-sans">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.direction === "incoming"
                              ? "bg-cyan-500/20 text-cyan-300"
                              : "bg-indigo-500/20 text-indigo-300"
                          }`}
                        >
                          {log.direction.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 pr-4 font-sans text-slate-300 max-w-sm truncate" title={log.message_text}>
                        {log.message_text}
                      </td>
                      <td className="py-3 pr-4 font-sans">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.status === "delivered" || log.status === "received"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-rose-500/20 text-rose-400"
                          }`}
                        >
                          {log.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 text-[10px] text-slate-400">{log.twilio_sid}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 5: USER SESSION LOGS (Step 1) ──────────────────────── */}
        {activeTab === "sessions" && (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080E14] p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-indigo-400" />
              <span>USER_SESSION_LOGS (Farmer User Journeys &amp; Actions)</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800/80 text-slate-400 font-semibold">
                    <th className="pb-3 pr-4">Session ID</th>
                    <th className="pb-3 pr-4">Duration</th>
                    <th className="pb-3 pr-4">Device</th>
                    <th className="pb-3 pr-4">Browser</th>
                    <th className="pb-3 pr-4">Pages Visited</th>
                    <th className="pb-3">Actions Taken</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                  {tableLogs.map((log: UserSessionLogEntry) => (
                    <tr key={log.session_id} className="hover:bg-slate-50/50 dark:hover:bg-[#0B1219]/60">
                      <td className="py-3 pr-4 font-bold text-sky-400">#{log.session_id}</td>
                      <td className="py-3 pr-4 text-slate-300">{log.duration_seconds}s</td>
                      <td className="py-3 pr-4 font-sans font-semibold text-white">{log.device_type}</td>
                      <td className="py-3 pr-4 font-sans text-slate-300">{log.browser}</td>
                      <td className="py-3 pr-4 font-sans text-cyan-400">{log.pages_visited.join(", ")}</td>
                      <td className="py-3 font-sans text-emerald-400">{log.actions_taken.join(", ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 6: PERFORMANCE LOGS (Step 1 & Step 7) ──────────────── */}
        {activeTab === "perf" && (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080E14] p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-400" />
              <span>PERFORMANCE_LOGS (Page Load, TTFB, DNS, Rendering Times)</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800/80 text-slate-400 font-semibold">
                    <th className="pb-3 pr-4">Log ID</th>
                    <th className="pb-3 pr-4">Page</th>
                    <th className="pb-3 pr-4">Load Time</th>
                    <th className="pb-3 pr-4">Network</th>
                    <th className="pb-3 pr-4">Rendering</th>
                    <th className="pb-3 pr-4">Device</th>
                    <th className="pb-3">Network Speed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                  {tableLogs.map((log: PerformanceLogEntry) => (
                    <tr key={log.log_id} className="hover:bg-slate-50/50 dark:hover:bg-[#0B1219]/60">
                      <td className="py-3 pr-4 font-bold text-sky-400">#{log.log_id}</td>
                      <td className="py-3 pr-4 font-sans font-semibold text-white">{log.page_name}</td>
                      <td className="py-3 pr-4 font-bold text-amber-400">{log.load_time_ms} ms</td>
                      <td className="py-3 pr-4 text-slate-300">{log.network_time_ms} ms</td>
                      <td className="py-3 pr-4 text-slate-300">{log.rendering_time_ms} ms</td>
                      <td className="py-3 pr-4 font-sans text-slate-300">{log.device_type}</td>
                      <td className="py-3 font-sans">
                        <span className="px-2 py-0.5 rounded font-bold bg-slate-800 text-cyan-300">
                          {log.network_speed}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 7: DATABASE QUERY LOGS (Step 8) ─────────────────────── */}
        {activeTab === "db" && (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080E14] p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="h-4 w-4 text-cyan-400" />
              <span>DATABASE_QUERY_LOGS (Execution Times, Index Utilization, Slow Queries)</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800/80 text-slate-400 font-semibold">
                    <th className="pb-3 pr-4">Query ID</th>
                    <th className="pb-3 pr-4">Table</th>
                    <th className="pb-3 pr-4">Query Text</th>
                    <th className="pb-3 pr-4">Execution Time</th>
                    <th className="pb-3 pr-4">Rows</th>
                    <th className="pb-3">Indexes Used</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                  {tableLogs.map((log: DatabaseQueryLogEntry) => (
                    <tr key={log.query_id} className="hover:bg-slate-50/50 dark:hover:bg-[#0B1219]/60">
                      <td className="py-3 pr-4 font-bold text-sky-400">#{log.query_id}</td>
                      <td className="py-3 pr-4 font-sans font-semibold text-white">{log.table_name}</td>
                      <td className="py-3 pr-4 text-slate-300 max-w-sm truncate" title={log.query_text}>
                        {log.query_text}
                      </td>
                      <td className="py-3 pr-4 font-bold text-emerald-400">{log.execution_time_ms} ms</td>
                      <td className="py-3 pr-4 text-slate-300">{log.row_count}</td>
                      <td className="py-3 font-sans text-cyan-400">{log.indexes_used.join(", ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 8: DAILY & WEEKLY REPORTS (Step 5 & Step 9) ─────────── */}
        {activeTab === "reports" && (
          <div className="space-y-6">
            {/* Daily Report Card (Step 5) */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080E14] p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-cyan-400" />
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Daily Health Report Email (7 AM Scheduled)
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Automated morning briefing sent to district and state administrators.
                  </p>
                </div>

                <button
                  onClick={handleSendDailyEmail}
                  disabled={sendingEmail}
                  type="button"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition self-start sm:self-auto"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{sendingEmail ? "Dispatching..." : "Send Email Now"}</span>
                </button>
              </div>

              {dailyReport && (
                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B1219] border border-slate-200/60 dark:border-slate-800/40 space-y-2">
                    <p className="font-semibold text-slate-400">Subject: <strong className="text-white">{dailyReport.email_subject}</strong></p>
                    <p className="text-slate-400">Recipient: <span className="font-mono text-cyan-300">{dailyReport.recipient}</span></p>
                    <p className="text-slate-400">Date: {dailyReport.report_date}</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B1219] border border-slate-200/40 dark:border-slate-800/40">
                      <span className="text-[11px] text-slate-400">Farmers Submitted</span>
                      <p className="text-xl font-bold font-mono text-emerald-400 mt-1">
                        {dailyReport.summary.farmers_submitted_feedback}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B1219] border border-slate-200/40 dark:border-slate-800/40">
                      <span className="text-[11px] text-slate-400">SMS Commands</span>
                      <p className="text-xl font-bold font-mono text-sky-400 mt-1">
                        {dailyReport.summary.sms_commands_processed}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B1219] border border-slate-200/40 dark:border-slate-800/40">
                      <span className="text-[11px] text-slate-400">API Calls Made</span>
                      <p className="text-xl font-bold font-mono text-cyan-400 mt-1">
                        {dailyReport.summary.api_calls_made.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B1219] border border-slate-200/40 dark:border-slate-800/40">
                      <span className="text-[11px] text-slate-400">Total Errors</span>
                      <p className="text-xl font-bold font-mono text-rose-400 mt-1">
                        {dailyReport.summary.total_errors}
                      </p>
                    </div>
                  </div>

                  {/* Top Insights & Recommended Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B1219] border border-slate-200/60 dark:border-slate-800/40 space-y-2">
                      <h3 className="font-bold text-slate-900 dark:text-white">🎯 Top Insights</h3>
                      <ul className="space-y-1 text-slate-300">
                        <li>• Most Used Command: <strong className="text-white">{dailyReport.top_insights.most_used_command}</strong></li>
                        <li>• Top Error: <strong className="text-white">{dailyReport.top_insights.top_error}</strong></li>
                        <li>• Slowest Route: <strong className="text-white">{dailyReport.top_insights.slowest_page}</strong></li>
                        <li>• Fastest Component: <strong className="text-white">{dailyReport.top_insights.fastest_api}</strong></li>
                      </ul>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B1219] border border-slate-200/60 dark:border-slate-800/40 space-y-2">
                      <h3 className="font-bold text-slate-900 dark:text-white">🔧 Recommended Actions</h3>
                      <ul className="space-y-1.5 text-slate-300">
                        {dailyReport.recommended_actions.map((act, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-emerald-400 font-bold">✓</span>
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Weekly Analytics Report Card (Step 9) */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080E14] p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-emerald-400" />
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Weekly Analytics Report (Sunday Digest - Step 9)
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Longer-term demographic, crop, and performance trends across Central India.
                </p>
              </div>

              {weeklyReport && (
                <div className="space-y-5 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B1219] border border-slate-200/40 dark:border-slate-800/40">
                      <span className="text-[11px] text-slate-400">Total Farmers Active</span>
                      <p className="text-xl font-bold font-mono text-emerald-400 mt-1">
                        {weeklyReport.total_farmers_active.toLocaleString()}
                      </p>
                      <span className="text-[10px] text-emerald-500 font-semibold">
                        ↑ {weeklyReport.farmer_growth_pct}% vs last week
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B1219] border border-slate-200/40 dark:border-slate-800/40">
                      <span className="text-[11px] text-slate-400">Total Feedback Submissions</span>
                      <p className="text-xl font-bold font-mono text-cyan-400 mt-1">
                        {weeklyReport.total_feedback_submissions.toLocaleString()}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B1219] border border-slate-200/40 dark:border-slate-800/40">
                      <span className="text-[11px] text-slate-400">Form Success Rate</span>
                      <p className="text-xl font-bold font-mono text-indigo-400 mt-1">
                        {weeklyReport.form_success_rate_pct}%
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B1219] border border-slate-200/40 dark:border-slate-800/40">
                      <span className="text-[11px] text-slate-400">Avg Page Load Time</span>
                      <p className="text-xl font-bold font-mono text-amber-400 mt-1">
                        {weeklyReport.avg_page_load_ms} ms
                      </p>
                    </div>
                  </div>

                  {/* Geographic & Crop Distribution */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Geographic */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B1219] border border-slate-200/60 dark:border-slate-800/40 space-y-3">
                      <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Globe className="h-4 w-4 text-cyan-400" />
                        <span>🌍 Geographic Distribution</span>
                      </h3>
                      <div className="space-y-2">
                        {weeklyReport.geographic_distribution.map((dist) => (
                          <div key={dist.district} className="space-y-1">
                            <div className="flex justify-between text-[11px]">
                              <span className="font-semibold text-slate-300">{dist.district}</span>
                              <span className="text-slate-400 font-mono">
                                {dist.farmers_count} farmers ({dist.pct}%)
                              </span>
                            </div>
                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${dist.pct * 3}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Crop Distribution */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B1219] border border-slate-200/60 dark:border-slate-800/40 space-y-3">
                      <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <PieChart className="h-4 w-4 text-emerald-400" />
                        <span>🌾 Crop Distribution</span>
                      </h3>
                      <div className="space-y-2">
                        {weeklyReport.crop_distribution.map((c) => (
                          <div key={c.crop} className="space-y-1">
                            <div className="flex justify-between text-[11px]">
                              <span className="font-semibold text-slate-300">{c.crop}</span>
                              <span className="text-slate-400 font-mono">
                                {c.count} ({c.pct}%)
                              </span>
                            </div>
                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${c.pct * 2}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Error Details Modal ────────────────────────────────────── */}
        {selectedError && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-[#080E14] p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-rose-400" />
                  <h3 className="text-base font-bold text-white">Error Trace: #{selectedError.log_id}</h3>
                </div>
                <button
                  onClick={() => setSelectedError(null)}
                  className="rounded-lg p-1 text-slate-400 hover:text-white transition"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400">Type &amp; Severity:</span>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="font-bold text-rose-400 font-mono">{selectedError.error_type}</span>
                    <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-rose-500/20 text-rose-300 uppercase">
                      {selectedError.severity}
                    </span>
                    <span className="text-slate-400 font-mono">({selectedError.occurrences} total occurrences)</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400">Error Message:</span>
                  <p className="mt-1 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-mono">
                    {selectedError.error_message}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400">Stack Trace:</span>
                  <pre className="mt-1 p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-300 font-mono whitespace-pre-wrap overflow-x-auto">
                    {selectedError.error_stack_trace}
                  </pre>
                </div>

                <div className="grid grid-cols-2 gap-3 text-slate-400 font-mono text-[11px]">
                  <div>Page: <span className="text-white">{selectedError.page_url}</span></div>
                  <div>User Agent: <span className="text-white truncate block">{selectedError.user_agent}</span></div>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-800">
                <button
                  onClick={() => setSelectedError(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

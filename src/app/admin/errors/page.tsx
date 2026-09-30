"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  Activity,
  Server,
  Database,
  Send,
  WifiOff,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  Play,
  Check,
  FileText,
  AlertCircle,
  HelpCircle,
  Trash2,
  PhoneCall,
  Terminal,
} from "lucide-react";
import {
  ErrorDashboardMetrics,
  ValidationErrorLogEntry,
  PendingSmsRecord,
  ApiHealthStatus,
} from "@/lib/validation/formValidationTypes";

export default function AdminErrorDashboardPage() {
  const [metrics, setMetrics] = useState<ErrorDashboardMetrics | null>(null);
  const [logs, setLogs] = useState<ValidationErrorLogEntry[]>([]);
  const [pendingQueue, setPendingQueue] = useState<PendingSmsRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [actionStatus, setActionStatus] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const url = filterType !== "ALL"
        ? `/api/admin/errors?filter=${filterType}`
        : `/api/admin/errors`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setMetrics(data.metrics);
        setLogs(data.logs);
        setPendingQueue(data.pending_sms_queue);
      }
    } catch (err: any) {
      console.error("Failed to load error dashboard data:", err);
      setActionStatus({ text: "डैशबोर्ड डेटा लोड करने में त्रुटि आई।", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [filterType]);

  const handleRetrySms = async (queueId: string) => {
    try {
      setActionLoading(true);
      const res = await fetch("/api/admin/errors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "retry_sms", queue_id: queueId }),
      });
      const data = await res.json();
      if (data.success) {
        setActionStatus({ text: data.message, type: "success" });
        await fetchDashboardData();
      } else {
        setActionStatus({ text: data.message || "Retry failed", type: "error" });
      }
    } catch (err: any) {
      setActionStatus({ text: "SMS पुनः प्रयास असफल रहा।", type: "error" });
    } finally {
      setActionLoading(false);
      setTimeout(() => setActionStatus(null), 4000);
    }
  };

  const handleToggleSimulation = async (service: string, currentlySimulated: boolean) => {
    try {
      setActionLoading(true);
      const res = await fetch("/api/admin/errors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "simulate_failure",
          service,
          simulateDown: !currentlySimulated,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionStatus({ text: data.message, type: "success" });
        await fetchDashboardData();
      }
    } catch (err: any) {
      setActionStatus({ text: "Simulate action failed", type: "error" });
    } finally {
      setActionLoading(false);
      setTimeout(() => setActionStatus(null), 4000);
    }
  };

  const handleClearLogs = async () => {
    if (!window.confirm("क्या आप सभी त्रुटि लॉग साफ़ करना चाहते हैं? (Clear all logs?)")) return;
    try {
      setActionLoading(true);
      const res = await fetch("/api/admin/errors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear_logs" }),
      });
      const data = await res.json();
      if (data.success) {
        setActionStatus({ text: data.message, type: "success" });
        await fetchDashboardData();
      }
    } catch (err: any) {
      setActionStatus({ text: "Clear logs failed", type: "error" });
    } finally {
      setActionLoading(false);
      setTimeout(() => setActionStatus(null), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070C12] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/district-dashboard"
              className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              title="Back to District Dashboard"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 font-bold text-xs">
                  FINAL_005
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Error Monitoring & Resilience Dashboard
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                त्रुटि निगरानी, फ़ील्ड सत्यापन दर, API फॉलबैक स्थिति और स्वचालित SMS कतार
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              disabled={loading || actionLoading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-xs cursor-pointer transition disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 text-emerald-600 ${loading ? "animate-spin" : ""}`} />
              ताज़ा करें (Refresh)
            </button>
            <Link
              href="/feedback"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition"
            >
              फ़ॉर्म खोलें (Test Form)
            </Link>
          </div>
        </div>

        {/* Action Status Toast */}
        {actionStatus && (
          <div
            className={`mt-4 p-3 rounded-2xl flex items-center gap-2 text-xs font-medium ${
              actionStatus.type === "success"
                ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400"
            }`}
          >
            {actionStatus.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{actionStatus.text}</span>
          </div>
        )}

        {/* Alert Banner if high error rate */}
        {metrics?.is_high_error_alert && (
          <div className="mt-4 p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-900 dark:text-amber-200 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs sm:text-sm font-bold">
                ⚠️ चेतावनी: पिछले 24 घंटों में प्रति घंटा त्रुटि दर 100 से अधिक हो गई है ({metrics.errors_per_hour_rate}/hr)!
              </p>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                कृपया नीचे दिए गए शीर्ष त्रुटि प्रकार और API फॉलबैक स्थिति की समीक्षा करें।
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* SECTION 1: 4 Key Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Errors */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#0B1219] border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                कुल त्रुटियां (24h)
              </span>
              <span className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
                <AlertCircle className="h-4 w-4" />
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {metrics ? metrics.total_errors_24h : "..."}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              पिछले 24 घंटों में लॉग की गई कुल त्रुटियां
            </p>
          </div>

          {/* Card 2: Error Rate / Hour */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#0B1219] border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                त्रुटि दर / घंटा
              </span>
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <Clock className="h-4 w-4" />
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {metrics ? `${metrics.errors_per_hour_rate}/hr` : "..."}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              थ्रेशोल्ड: &lt; 100/hr (वर्तमान में {metrics?.is_high_error_alert ? "असामान्य" : "सामान्य"})
            </p>
          </div>

          {/* Card 3: Failed Submissions Rate */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#0B1219] border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                फ़ॉर्म विफलता दर
              </span>
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                <ShieldAlert className="h-4 w-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {metrics ? `${metrics.failed_submission_rate_pct}%` : "..."}
              </span>
              <span className="text-xs font-semibold text-emerald-500">
                लक्ष्य &lt; 5% ✓
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {metrics ? `${metrics.failed_form_submissions_count} असफल सबमिशन दर्ज` : "..."}
            </p>
          </div>

          {/* Card 4: Pending SMS Queue */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#0B1219] border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                लंबित SMS कतार
              </span>
              <span className="p-2 rounded-xl bg-sky-500/10 text-sky-500">
                <Send className="h-4 w-4" />
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-sky-600 dark:text-sky-400">
              {metrics ? metrics.pending_sms_queue_count : "..."}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              स्वचालित पुनः प्रयास (Auto-retry 5 प्रयास तक)
            </p>
          </div>
        </div>

        {/* SECTION 2: API Health & Resilience Fallback Status */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0B1219] border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Server className="h-5 w-5 text-emerald-500" />
                API Health & Graceful Fallback Matrix
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                सेवा आउटेज में भी किसान अनुभव बाधित नहीं होता — कैशिंग और कतार प्रणाली स्वतः सक्रिय
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
              Auto-probe: 60s
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics?.api_health_statuses.map((svc) => (
              <div
                key={svc.service_key}
                className={`p-4 rounded-2xl border transition-all ${
                  svc.status === "healthy"
                    ? "bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800"
                    : svc.status === "degraded"
                    ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800"
                    : "bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">
                    {svc.service_name}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      svc.status === "healthy"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : svc.status === "degraded"
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {svc.status === "healthy" ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <XCircle className="h-3 w-3" />
                    )}
                    {svc.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>विलंबता (Latency):</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {svc.response_time_ms} ms
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>सफलता दर:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {svc.success_rate_pct}%
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mb-0.5">
                      फ़ॉलबैक रणनीति (Fallback Action):
                    </p>
                    <p className="text-[10.5px] text-slate-700 dark:text-slate-300 leading-tight">
                      {svc.fallback_action}
                    </p>
                  </div>
                </div>

                {/* Simulation button */}
                <div className="mt-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleToggleSimulation(svc.service_key, !!svc.is_simulated_down)}
                    className={`w-full py-1.5 px-2 rounded-xl text-[10px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      svc.is_simulated_down
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {svc.is_simulated_down ? (
                      <>
                        <RefreshCw className="h-3 w-3" /> सेवा बहाल करें (Restore)
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3" /> विफलता सिम्युलेट करें (Simulate Outage)
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3: Top 10 Common Errors & Offline Sync Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top 10 Common Errors */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-[#0B1219] border border-slate-200 dark:border-slate-800 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-500" />
              शीर्ष सामान्य त्रुटि प्रकार (Top 10 Common Errors)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              किसानों द्वारा सर्वाधिक होने वाली फ़ील्ड त्रुटियां व समाधान
            </p>

            <div className="space-y-3">
              {metrics?.top_common_errors.map((item, idx) => (
                <div key={item.error_type} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      {item.label_hi}
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({item.label_en})
                      </span>
                    </span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                      {item.count} बार ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${
                        idx === 0
                          ? "bg-rose-500"
                          : idx === 1
                          ? "bg-amber-500"
                          : idx === 2
                          ? "bg-sky-500"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.max(item.percentage, 5)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Offline Sync & Resilient Local Storage Info */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0B1219] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm mb-2">
                <WifiOff className="h-5 w-5" />
                ऑफ़लाइन फ़ॉर्म रेजिलिएंस (Offline Resilience)
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                जब किसान का 2G/3G कनेक्शन टूट जाता है, फ़ॉर्म डेटा नष्ट नहीं होता।
              </p>

              <div className="mt-4 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-300">
                  <Check className="h-4 w-4" />
                  स्थानीय संचयन (LocalStorage Cache)
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  <code className="text-emerald-600 font-mono">gagandrishti_offline_submissions</code> में ड्राफ्ट सुरक्षित रखा जाता है।
                </p>
                <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-300 pt-1">
                  <RefreshCw className="h-4 w-4" />
                  ऑटो-सिंक (Auto-Sync on Reconnect)
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  इंटरनेट चालू होते ही फ़ॉर्म स्वचालित रूप से सर्वर पर सिंक हो जाता है।
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                परीक्षण हेतु ब्राउज़र DevTools में 'Offline' मोड चुनकर फ़ॉर्म सबमिट करें।
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: Pending SMS Retry Queue */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0B1219] border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Send className="h-5 w-5 text-sky-500" />
                लंबित SMS कतार (Pending SMS Auto-Retry Queue)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                जब Twilio नेटवर्क डाउन होता है, SMS यहां 5 बार पुनः प्रयास हेतु कतारबद्ध होते हैं
              </p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold">
              {pendingQueue.length} संदेश कतारबद्ध
            </span>
          </div>

          {pendingQueue.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              कतार में कोई लंबित SMS नहीं है। सभी संदेश सफलतापूर्वक वितरित किए गए हैं।
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                    <th className="py-2.5 px-3">Queue ID</th>
                    <th className="py-2.5 px-3">किसान फ़ोन</th>
                    <th className="py-2.5 px-3">आगमन SMS</th>
                    <th className="py-2.5 px-3">प्रयास (Attempts)</th>
                    <th className="py-2.5 px-3">स्थिति</th>
                    <th className="py-2.5 px-3">त्रुटि कारण</th>
                    <th className="py-2.5 px-3 text-right">कार्य (Action)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {pendingQueue.map((item) => (
                    <tr key={item.queue_id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                        {item.queue_id}
                      </td>
                      <td className="py-3 px-3 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        {item.phone_number}
                      </td>
                      <td className="py-3 px-3 text-slate-800 dark:text-slate-200 font-mono">
                        "{item.incoming_sms}"
                      </td>
                      <td className="py-3 px-3 font-mono">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                          {item.attempt_count} / {item.max_attempts}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === "DELIVERED"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : item.status === "FAILED"
                              ? "bg-rose-500/10 text-rose-500"
                              : "bg-amber-500/10 text-amber-500"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500 dark:text-slate-400 text-[11px]">
                        {item.error_reason}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleRetrySms(item.queue_id)}
                          disabled={actionLoading || item.status === "DELIVERED"}
                          className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-40 text-white text-[11px] font-semibold cursor-pointer transition"
                        >
                          पुनः भेजें (Retry)
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* SECTION 5: Live Error Log Stream */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0B1219] border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Terminal className="h-5 w-5 text-rose-500" />
                लाइव त्रुटि लॉग स्ट्रीम (Live Validation Error Log Stream)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                फ़ॉर्म और SMS द्वारा अस्वीकृत अनुरोधों का ऑडिट ट्रेल
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070C12] text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
              >
                <option value="ALL">सभी प्रकार (All Types)</option>
                <option value="invalid_phone">Phone Number Error</option>
                <option value="invalid_pincode">Pincode Error</option>
                <option value="missing_field">Missing Field</option>
                <option value="api_timeout">API Timeout</option>
                <option value="oversized_photo">Oversized Photo</option>
              </select>

              <button
                type="button"
                onClick={handleClearLogs}
                disabled={actionLoading || logs.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 bg-rose-500/10 hover:bg-rose-500/20 transition cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                लॉग साफ़ करें (Clear)
              </button>
            </div>
          </div>

          {logs.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400">
              कोई त्रुटि रिकॉर्ड नहीं मिली।
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {logs.map((log) => (
                <div
                  key={log.error_id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-slate-400">
                        #{log.error_id}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 font-mono font-bold text-[10px] uppercase">
                        {log.error_type}
                      </span>
                      {log.field_name && (
                        <span className="px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 font-mono text-[10px] text-slate-700 dark:text-slate-300">
                          {log.field_name}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>

                    <p className="font-medium text-slate-900 dark:text-white">
                      {log.user_message_hi}
                    </p>
                    {log.raw_technical_error && (
                      <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        Details: {log.raw_technical_error}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 text-right">
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      ✓ Handled Gracefully
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

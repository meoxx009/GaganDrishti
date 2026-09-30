"use client";

import React, { useState, useEffect } from "react";
import {
  Image as ImageIcon,
  ArrowLeft,
  RefreshCw,
  Zap,
  HardDrive,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  Smartphone,
  Tablet,
  Monitor,
  Trash2,
  Filter,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  FileCheck,
} from "lucide-react";
import {
  ImagePerformanceMetrics,
  ImageOptimizationLog,
  PaginatedGalleryResponse,
} from "@/lib/images/imageOptimizationTypes";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

export default function ImageOptimizationPage() {
  const [metrics, setMetrics] = useState<ImagePerformanceMetrics | null>(null);
  const [logs, setLogs] = useState<ImageOptimizationLog[]>([]);
  const [gallery, setGallery] = useState<PaginatedGalleryResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDistrict, setSelectedDistrict] = useState("ALL");
  const [selectedCrop, setSelectedCrop] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [previewDevice, setPreviewDevice] = useState<"mobile" | "tablet" | "desktop">("desktop");
  const [testValidationResult, setTestValidationResult] = useState<string | null>(null);

  const fetchData = async (page = 1, district = selectedDistrict, crop = selectedCrop) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: "20",
        ...(district !== "ALL" ? { district } : {}),
        ...(crop !== "ALL" ? { crop } : {}),
      });

      const res = await fetch(`/api/admin/image-optimization?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setMetrics(data.metrics);
        setLogs(data.logs);
        setGallery(data.gallery);
        setCurrentPage(data.gallery.current_page);
      }
    } catch (err) {
      console.error("Failed to load image optimization data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1, selectedDistrict, selectedCrop);
  }, [selectedDistrict, selectedCrop]);

  const handleAction = async (action: "optimize" | "cleanup") => {
    try {
      setActionLoading(true);
      setStatusMessage(null);
      const res = await fetch("/api/admin/image-optimization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({ text: data.message, type: "success" });
        if (data.metrics) setMetrics(data.metrics);
        if (data.logs) setLogs(data.logs);
        if (data.gallery) setGallery(data.gallery);
      } else {
        setStatusMessage({ text: data.error || "Action failed", type: "error" });
      }
    } catch (err: any) {
      setStatusMessage({ text: err.message || "Failed to execute action", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleTestValidator = async () => {
    try {
      setActionLoading(true);
      // Test with simulated 2.5MB BMP file
      const res = await fetch("/api/admin/image-optimization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "validate",
          file: { name: "farm_photo.bmp", size: 2500000, type: "image/bmp" },
        }),
      });
      const data = await res.json();
      if (data.success && !data.validation.is_valid) {
        setTestValidationResult(
          `✓ Validator correctly rejected 2.5MB BMP: "${data.validation.error_message_hi}"`
        );
      }
    } catch (err: any) {
      console.error("Validator test error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070D14] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <a
              href="/admin/district-dashboard"
              className="p-2 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              title="Back to District Dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
            </a>
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <ImageIcon className="h-5 w-5" />
                </span>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Image Optimization & Lazy Loading
                </h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  &lt; 500 KB Target
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Client-side canvas auto-compression, responsive picture elements, 20-item pagination, and 90-day storage lifecycle.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchData(currentPage)}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Stats</span>
            </button>
            <a
              href="/farmer-feedback"
              className="px-3 py-2 text-xs font-medium rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition shadow-xs"
            >
              Farmer Feedback Form
            </a>
          </div>
        </div>

        {/* Status Message Banner */}
        {statusMessage && (
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between text-xs sm:text-sm ${
              statusMessage.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-500/30 dark:text-emerald-300"
                : "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/30 dark:border-rose-500/30 dark:text-rose-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>{statusMessage.text}</span>
            </div>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              ×
            </button>
          </div>
        )}

        {/* Active Performance Alerts */}
        {metrics?.active_alerts && metrics.active_alerts.length > 0 && (
          <div className="space-y-2">
            {metrics.active_alerts.map((alt, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                  alt.severity === "critical"
                    ? "bg-rose-50 border-rose-300 text-rose-900 dark:bg-rose-950/30 dark:border-rose-500/30 dark:text-rose-200"
                    : alt.severity === "warning"
                    ? "bg-amber-50 border-amber-300 text-amber-900 dark:bg-amber-950/30 dark:border-amber-500/30 dark:text-amber-200"
                    : "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-500/30 dark:text-emerald-200"
                }`}
              >
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs sm:text-sm font-semibold">{alt.title}</h4>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-white/40 dark:bg-black/20">
                      {alt.severity}
                    </span>
                  </div>
                  <p className="text-xs mt-0.5 opacity-90">{alt.message}</p>
                  <p className="text-[11px] font-medium mt-1 underline opacity-80">
                    Recommended: {alt.action_required}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 4 Top KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Average Photo Size */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0D1520] border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Avg Photo File Size
              </span>
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <FileCheck className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {metrics?.average_file_size_kb ?? 395} KB
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                &lt; 500 KB Target
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full"
                style={{ width: `${Math.min(100, ((metrics?.average_file_size_kb ?? 395) / 800) * 100)}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              Compressed via canvas before cloud storage.
            </p>
          </div>

          {/* Card 2: Total Photo Storage */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0D1520] border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Photo Storage Used
              </span>
              <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <HardDrive className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {metrics?.total_photo_storage_mb ?? 12.8} MB
              </span>
              <span className="text-xs text-slate-400">/ 1,000 MB</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-indigo-500 h-1.5 rounded-full"
                style={{ width: `${Math.min(100, ((metrics?.total_photo_storage_mb ?? 12.8) / 1000) * 100)}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              Safely within 1 GB free-tier threshold.
            </p>
          </div>

          {/* Card 3: Bandwidth Reduction */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0D1520] border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Bandwidth Reduction
              </span>
              <span className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                <Zap className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                {metrics?.bandwidth_saved_pct ?? 71.4}%
              </span>
              <span className="text-xs text-slate-400 font-medium">Savings</span>
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              40KB mobile WebP vs 2.5MB uncompressed photos.
            </p>
          </div>

          {/* Card 4: Page Load Time with Photos */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0D1520] border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Page Load Time
              </span>
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Clock className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {metrics?.average_load_time_seconds ?? 1.4}s
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                &lt; 3.0s Target
              </span>
            </div>
            <p className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400">
              ⚡ Lazy-loading prevents concurrent browser freeze.
            </p>
          </div>
        </div>

        {/* Operational Workflows & Restrictions Validator */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Operations Panel */}
          <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-[#0D1520] border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Image Optimization & Storage Lifecycle Controls
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Trigger scheduled batch compression routines or purge stale photos older than 90 days.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => handleAction("optimize")}
                disabled={actionLoading}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition"
              >
                <Zap className="h-4 w-4 text-emerald-500" />
                <span>Run Optimize (4 AM)</span>
              </button>

              <button
                onClick={() => handleAction("cleanup")}
                disabled={actionLoading}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-xs font-semibold text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/20 transition"
              >
                <Trash2 className="h-4 w-4 text-rose-500" />
                <span>Purge &gt; 90 Days</span>
              </button>

              <button
                onClick={handleTestValidator}
                disabled={actionLoading}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-sky-50 dark:bg-sky-950/20 hover:bg-sky-100 dark:hover:bg-sky-900/30 text-xs font-semibold text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-500/20 transition"
              >
                <FileCheck className="h-4 w-4 text-sky-500" />
                <span>Test 1MB Validator</span>
              </button>
            </div>

            {testValidationResult && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs font-mono text-emerald-600 dark:text-emerald-400">
                {testValidationResult}
              </div>
            )}
          </div>

          {/* Responsive Picture Screen Simulation (Step 5) */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0D1520] border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-sky-500" />
                <span>Responsive Delivery Preview</span>
              </h3>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Serve appropriate payload size based on farmer screen width:
            </p>

            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
              <button
                onClick={() => setPreviewDevice("mobile")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition ${
                  previewDevice === "mobile"
                    ? "bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span>Mobile (40KB)</span>
              </button>
              <button
                onClick={() => setPreviewDevice("tablet")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition ${
                  previewDevice === "tablet"
                    ? "bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                <Tablet className="h-3.5 w-3.5" />
                <span>Tablet (80KB)</span>
              </button>
              <button
                onClick={() => setPreviewDevice("desktop")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition ${
                  previewDevice === "desktop"
                    ? "bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                <Monitor className="h-3.5 w-3.5" />
                <span>Desktop (150KB)</span>
              </button>
            </div>

            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
              <OptimizedImage
                src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80"
                alt="Responsive Crop Sample"
                aspectRatio="16/9"
                useResponsive={true}
              />
            </div>
          </div>
        </div>

        {/* Paginated Feedback Image Gallery (Step 6) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0D1520] border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="h-4 w-4 text-emerald-500" />
                <span>Paginated Feedback Photo Gallery (20 Photos / Page)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Photos load progressively via native lazy loading as user scrolls.
              </p>
            </div>

            {/* District & Crop Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded-xl text-xs">
                <Filter className="h-3.5 w-3.5 text-slate-400" />
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="bg-transparent font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
                >
                  <option value="ALL">All Districts</option>
                  <option value="Sehore">Sehore</option>
                  <option value="Raisen">Raisen</option>
                  <option value="Vidisha">Vidisha</option>
                  <option value="Bhopal">Bhopal</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded-xl text-xs">
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="bg-transparent font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
                >
                  <option value="ALL">All Crops</option>
                  <option value="Soybean">Soybean</option>
                  <option value="Paddy">Paddy</option>
                  <option value="Wheat">Wheat</option>
                  <option value="Chickpea">Chickpea</option>
                </select>
              </div>
            </div>
          </div>

          {/* Photo Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(gallery?.photos || []).map((item) => (
              <div
                key={item.feedback_id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-[#070D14] flex flex-col justify-between shadow-2xs hover:shadow-md transition"
              >
                <div>
                  <div className="relative">
                    <OptimizedImage
                      src={item.photo_url}
                      alt={item.crop_name}
                      aspectRatio="16/9"
                      useResponsive={true}
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-xs">
                      {item.crop_name} • {item.crop_stage}
                    </span>
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/80 text-white backdrop-blur-xs">
                      {item.file_size_formatted}
                    </span>
                  </div>

                  <div className="p-3">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {item.farmer_name}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      📍 {item.village_name}, {item.district}
                    </p>
                  </div>
                </div>

                <div className="px-3 pb-3 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{new Date(item.timestamp).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
                  <span className="text-emerald-500 font-semibold">✓ Lazy Loaded</span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {gallery && gallery.total_pages > 1 && (
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Showing Page {gallery.current_page} of {gallery.total_pages} ({gallery.total_photos} Photos Total)
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchData(gallery.current_page - 1)}
                  disabled={!gallery.has_prev || loading}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800">
                  {gallery.current_page}
                </span>
                <button
                  onClick={() => fetchData(gallery.current_page + 1)}
                  disabled={!gallery.has_next || loading}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Maintenance & Optimization Logs Table */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0D1520] border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-500" />
            <span>Image Optimization & Storage Maintenance History</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 uppercase font-semibold border-y border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Date / Time</th>
                  <th className="py-2.5 px-3">Job Name</th>
                  <th className="py-2.5 px-3 text-right">Processed</th>
                  <th className="py-2.5 px-3 text-right">Storage Freed</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {logs.map((lg) => (
                  <tr key={lg.log_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                      {new Date(lg.timestamp).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {lg.job_name}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold">
                      {lg.photos_processed}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {lg.storage_freed_kb} KB
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        {lg.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px] max-w-xs truncate">
                      {lg.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

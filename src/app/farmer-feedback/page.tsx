"use client";

/**
 * FINAL_006 Step 7 — Farmer Feedback Page
 * Default: shows MultiStepFormShell (4-step mobile wizard).
 * Toggle button at top-right switches to full FarmerFeedbackForm (admin/desktop).
 * Page is a Client Component to support useState toggle.
 */

import React, { useState } from "react";
import { FarmerFeedbackForm } from "@/components/feedback/FarmerFeedbackForm";
import { MultiStepFormShell } from "@/components/feedback/MultiStepFormShell";
import { ShellHeaderMinimal } from "@/components/feedback/ShellHeaderMinimal";
import { LayoutList, Layers } from "lucide-react";

export default function FarmerFeedbackPage() {
  /** true → show full FarmerFeedbackForm; false (default) → show MultiStepFormShell */
  const [showFullForm, setShowFullForm] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#030609] text-slate-900 dark:text-[#F8FAFC]">
      <ShellHeaderMinimal />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* ── Toggle button ──────────────────────────────────────────────────── */}
        <div className="flex justify-end mb-6">
          <button
            type="button"
            onClick={() => setShowFullForm((v) => !v)}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#080E14] px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#0B1219] transition-colors shadow-xs"
            aria-label={showFullForm ? "Switch to Quick 4-step form" : "Switch to Full form"}
          >
            {showFullForm ? (
              <>
                <Layers className="h-4 w-4 text-cyan-500" />
                <span>Quick form (4 steps)</span>
              </>
            ) : (
              <>
                <LayoutList className="h-4 w-4 text-emerald-500" />
                <span>Full form देखें →</span>
              </>
            )}
          </button>
        </div>

        {/* ── Main content area ───────────────────────────────────────────────── */}
        {showFullForm ? <FarmerFeedbackForm /> : <MultiStepFormShell />}
      </main>
    </div>
  );
}

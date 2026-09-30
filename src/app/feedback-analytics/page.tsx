import React from "react";
import { Metadata } from "next";
import { FeedbackAnalyticsDashboard } from "@/components/feedback/FeedbackAnalyticsDashboard";
import { ShellHeaderMinimal } from "@/components/feedback/ShellHeaderMinimal";

export const metadata: Metadata = {
  title: "Farmer Ground-Truth Feedback Analytics | GaganDrishti",
  description: "Auditable empirical dataset collected from real farmers to validate weather advisories and decision support.",
};

export default function FeedbackAnalyticsPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#030609] text-slate-900 dark:text-[#F8FAFC]">
      <ShellHeaderMinimal />
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <FeedbackAnalyticsDashboard />
      </main>
    </div>
  );
}

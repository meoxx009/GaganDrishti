"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { getLowBandwidthMode } from "@/lib/lowBandwidth";

/**
 * LowBandwidthBanner (FINAL_006 Step 8)
 * Renders a sticky top amber banner when low-bandwidth mode is enabled.
 * Dismissible via the X button; reappears on next page load.
 */
export const LowBandwidthBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);

  // Read from localStorage only after mount to avoid SSR mismatch
  useEffect(() => {
    setVisible(getLowBandwidthMode());
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="sticky top-0 z-[60] w-full bg-amber-400 dark:bg-amber-500 text-amber-900 dark:text-amber-950 flex items-center justify-between px-3 py-1.5 text-xs font-medium"
    >
      <span>
        📶 कम डेटा मोड चालू है &mdash; Maps, Charts सरल रूप में हैं
      </span>
      <button
        type="button"
        onClick={() => setVisible(false)}
        aria-label="Dismiss low bandwidth banner"
        className="ml-2 rounded p-0.5 hover:bg-amber-500/30 dark:hover:bg-amber-600/30 transition-colors min-h-[28px] min-w-[28px] flex items-center justify-center"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

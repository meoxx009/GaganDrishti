"use client";

// FINAL_006 Step 3: Client component that reads localStorage theme preferences
// and applies them as classes to the document root/body on mount and on storage change.

import { useEffect } from "react";

export const ThemeApplier: React.FC = () => {
  useEffect(() => {
    /**
     * Reads `gagandrishti_high_contrast` and `gagandrishti_low_bandwidth`
     * from localStorage and applies the corresponding CSS classes.
     */
    const applyTheme = () => {
      const highContrast =
        localStorage.getItem("gagandrishti_high_contrast") === "true";
      const lowBandwidth =
        localStorage.getItem("gagandrishti_low_bandwidth") === "true";

      // High contrast → add/remove class on <html>
      document.documentElement.classList.toggle("high-contrast", highContrast);

      // Low bandwidth mode → add/remove class on <body>
      document.body.classList.toggle("lbm-active", lowBandwidth);
    };

    // Apply on first mount
    applyTheme();

    // Re-apply whenever another tab/component writes to localStorage
    window.addEventListener("storage", applyTheme);
    return () => window.removeEventListener("storage", applyTheme);
  }, []);

  // Renders nothing — side-effect only
  return null;
};

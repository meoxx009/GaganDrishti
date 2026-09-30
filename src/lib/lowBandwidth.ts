// Low-Bandwidth Mode utility (FINAL_006 Step 4)
// Reads/writes localStorage key 'gagandrishti_low_bandwidth' (boolean)

import { useState, useEffect } from "react";

const STORAGE_KEY = "gagandrishti_low_bandwidth";

/** Returns the current low-bandwidth mode setting (defaults to false). */
export function getLowBandwidthMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

/** Persists the low-bandwidth mode setting to localStorage. */
export function setLowBandwidthMode(val: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, String(val));
  } catch {
    // ignore quota / security errors
  }
}

/**
 * React hook — returns [lowBandwidthMode, setLowBandwidthMode].
 * Reads initial value from localStorage; persists changes automatically.
 */
export function useLowBandwidthMode(): [boolean, (v: boolean) => void] {
  const [enabled, setEnabled] = useState<boolean>(false);

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    setEnabled(getLowBandwidthMode());
  }, []);

  const toggle = (v: boolean) => {
    setLowBandwidthMode(v);
    setEnabled(v);
  };

  return [enabled, toggle];
}

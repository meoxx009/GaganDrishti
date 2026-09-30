"use client";

/**
 * FINAL_007 Step 7: Automated Client-Side Performance Monitoring Script
 * Measures navigation timing metrics (DNS, TCP, TTFB, DOM parsing, Total load)
 * and transmits performance telemetry to /api/admin/monitoring/performance.
 */

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export const PerformanceReporter: React.FC = () => {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Run after window load event so full timing metrics are populated
    const measureAndReport = () => {
      try {
        const perf = window.performance;
        if (!perf) return;

        let loadTime = 0;
        let dnsTime = 0;
        let tcpTime = 0;
        let ttfb = 0;
        let renderingTime = 0;
        let networkTime = 0;

        // Try modern PerformanceNavigationTiming first
        const navEntries = perf.getEntriesByType("navigation") as PerformanceNavigationTiming[];
        if (navEntries && navEntries.length > 0) {
          const entry = navEntries[0];
          loadTime = entry.loadEventEnd > 0 ? entry.loadEventEnd - entry.startTime : entry.duration;
          dnsTime = entry.domainLookupEnd - entry.domainLookupStart;
          tcpTime = entry.connectEnd - entry.connectStart;
          ttfb = entry.responseStart - entry.requestStart;
          renderingTime = entry.domComplete - entry.domInteractive;
          networkTime = entry.responseEnd - entry.fetchStart;
        } else if (perf.timing) {
          // Fallback to legacy timing API
          const t = perf.timing;
          loadTime = t.loadEventEnd > 0 ? t.loadEventEnd - t.navigationStart : Date.now() - t.navigationStart;
          dnsTime = t.domainLookupEnd - t.domainLookupStart;
          tcpTime = t.connectEnd - t.connectStart;
          ttfb = t.responseStart - t.requestStart;
          renderingTime = t.domComplete - t.domInteractive;
          networkTime = t.responseEnd - t.fetchStart;
        }

        // Clamp non-sensical or negative values
        loadTime = Math.max(100, Math.min(loadTime, 30000));
        dnsTime = Math.max(0, dnsTime);
        tcpTime = Math.max(0, tcpTime);
        ttfb = Math.max(10, ttfb);

        // Detect device type
        const width = window.innerWidth;
        const deviceType = width < 768 ? "mobile" : width < 1024 ? "tablet" : "desktop";

        // Detect network speed if available
        const connection = (navigator as unknown as { connection?: { effectiveType?: string } }).connection;
        const networkSpeed = connection?.effectiveType
          ? connection.effectiveType === "4g"
            ? "4G"
            : connection.effectiveType === "3g"
            ? "3G"
            : connection.effectiveType === "2g"
            ? "2G"
            : "WiFi"
          : "4G";

        const payload = JSON.stringify({
          page_name: pathname || "/",
          load_time_ms: Math.round(loadTime),
          network_time_ms: Math.round(networkTime),
          rendering_time_ms: Math.round(renderingTime),
          dns_time_ms: Math.round(dnsTime),
          tcp_time_ms: Math.round(tcpTime),
          ttfb_ms: Math.round(ttfb),
          device_type: deviceType,
          network_speed: networkSpeed,
        });

        // Use sendBeacon if supported, otherwise asynchronous fetch
        if (navigator.sendBeacon) {
          navigator.sendBeacon("/api/admin/monitoring/performance", payload);
        } else {
          fetch("/api/admin/monitoring/performance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: payload,
            keepalive: true,
          }).catch(() => {});
        }
      } catch {
        // Suppress any reporting error to never disturb user experience
      }
    };

    if (document.readyState === "complete") {
      // Delay slightly to ensure loadEventEnd is populated
      const timer = setTimeout(measureAndReport, 1500);
      return () => clearTimeout(timer);
    } else {
      window.addEventListener("load", () => {
        setTimeout(measureAndReport, 1500);
      });
    }
  }, [pathname]);

  return null;
};

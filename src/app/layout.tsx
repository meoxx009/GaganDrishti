import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { WeatherProvider } from "@/context/WeatherContext";
import { PwaRegistrar } from "@/components/pwa/PwaRegistrar";
import { PwaInstallPrompt } from "@/components/pwa/PwaInstallPrompt";
import { LowBandwidthBanner } from "@/components/LowBandwidthBanner";
// FINAL_006 Step 3: Client component that applies high-contrast / low-bandwidth classes
import { ThemeApplier } from "@/components/ThemeApplier";
// FINAL_007 Step 7: Automated Performance & Telemetry Reporter
import { PerformanceReporter } from "@/components/monitoring/PerformanceReporter";

export const metadata: Metadata = {
  title: "GaganDrishti - Kheti Ka Manchitra | AI Weather Intelligence",
  description:
    "Weather intelligence aur agricultural advisory for Indian farmers. Real-time weather + crop-specific decisions + pest forecasting.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GaganDrishti",
  },
  icons: {
    icon: "/images/icon-192x192.png",
    apple: "/images/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#166534",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/images/icon-192x192.png" />
        <meta name="theme-color" content="#166534" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="GaganDrishti" />
      </head>
      <body className="min-h-screen antialiased selection:bg-cyan-500 selection:text-white">
        {/* FINAL_006 Step 4: Low-bandwidth sticky banner */}
        <LowBandwidthBanner />
        {/* FINAL_006 Step 3: Applies high-contrast / low-bandwidth classes from localStorage */}
        <ThemeApplier />
        {/* FINAL_007 Step 7: Telemetry & load time monitoring */}
        <PerformanceReporter />
        <AppProvider>
          <WeatherProvider>
            <PwaRegistrar />
            <PwaInstallPrompt />
            {children}
          </WeatherProvider>
        </AppProvider>
      </body>
    </html>
  );
}

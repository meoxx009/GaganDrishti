import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { WeatherProvider } from "@/context/WeatherContext";

export const metadata: Metadata = {
  title: "GaganDrishti | SIH 2026 Prototype",
  description:
    "SIH 2026 bilingual weather intelligence prototype for citizens and farmers",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#07111F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen antialiased selection:bg-cyan-500 selection:text-white">
        <AppProvider>
          <WeatherProvider>{children}</WeatherProvider>
        </AppProvider>
      </body>
    </html>
  );
}

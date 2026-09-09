import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GaganDrishti | SIH 2026 Prototype",
  description:
    "SIH 2026 bilingual weather intelligence prototype for citizens and farmers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}

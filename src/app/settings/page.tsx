import type { Metadata } from "next";
import React from "react";
import { SettingsPageClient } from "./SettingsPageClient";

export const metadata: Metadata = {
  title: "Settings | GaganDrishti",
};

/** Settings page — server component wrapper for metadata */
export default function SettingsPage() {
  return <SettingsPageClient />;
}

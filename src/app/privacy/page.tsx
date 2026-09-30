import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Lock, UserCheck, EyeOff, Database, ArrowLeft, Mail, Phone, CheckCircle2 } from "lucide-react";
import { ShellHeaderMinimal } from "@/components/feedback/ShellHeaderMinimal";

export const metadata: Metadata = {
  title: "Privacy Policy & Farmer Data Protection | GaganDrishti",
  description:
    "GaganDrishti is committed to safeguarding farmer privacy, anonymizing telemetry logs, and complying with the Digital Personal Data Protection Act (DPDPA 2023).",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#030609] text-slate-900 dark:text-[#F8FAFC]">
      <ShellHeaderMinimal />

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Back Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-cyan-500 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>वापस मुख्य पृष्ठ पर जाएं (Back to Home)</span>
          </Link>
        </div>

        {/* Title Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-500">
            <ShieldCheck className="h-4 w-4" />
            <span>Digital Personal Data Protection Act (DPDPA 2023) Compliant</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            गोपनीयता नीति एवं किसान डेटा संरक्षण (Privacy Policy)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            अंतिम नवीनीकरण: 30 सितम्बर 2026 | Last Updated: September 30, 2026
          </p>
        </div>

        {/* Core Principles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#080E14] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="h-9 w-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <EyeOff className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Zero Data Selling</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              किसानों का व्यक्तिगत डेटा किसी भी निजी कंपनी या विज्ञापनदाता को कभी नहीं बेचा जाता।
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#080E14] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">PII Masked in Logs</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              फ़ोन नंबर और व्यक्तिगत पहचान सर्वर लॉग में स्वतः मास्क (<code className="font-mono">+9198****2345</code>) कर दी जाती है।
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#080E14] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="h-9 w-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Database className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Local Server Storage</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              समस्त डेटा भारत में स्थित सुरक्षित सर्वर पर ही प्रोसेस और स्टोर किया जाता है।
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-[#080E14] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>1. कौन सी जानकारी एकत्र की जाती है? (Information Collected)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              GaganDrishti केवल वही जानकारी लेता है जो सटीक मौसम और कृषि सलाह देने हेतु आवश्यक है:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 dark:text-slate-300 pl-2">
              <li><strong>पिनकोड / स्थान (Pincode &amp; Location)</strong>: गांव व तहसील स्तर पर वर्षा व तापमान गणना हेतु।</li>
              <li><strong>मोबाइल नंबर (Phone Number)</strong>: केवल SMS मौसम अलर्ट व आपातकालीन चेतावनी भेजने के लिए।</li>
              <li><strong>फसल विवरण (Crop &amp; Stage)</strong>: कीटनाशक छिड़काव व सिंचाई अनुशंसाओं को व्यक्तिगत बनाने हेतु।</li>
              <li><strong>ग्राउंड-ट्रुथ फीडबैक (Field Observations)</strong>: कीट व रोग चेतावनी मॉडल को प्रशिक्षित करने हेतु।</li>
            </ul>
          </section>

          <section className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>2. डेटा की सुरक्षा व गोपनीयता (Security &amp; Encryption)</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              सभी वेब संचार 256-बिट HTTPS एन्क्रिप्शन से सुरक्षित हैं। कोई भी अनधिकृत व्यक्ति या तीसरा पक्ष आपके नेटवर्क
              पैकेट्स को नहीं देख सकता। हमारे प्रशासनिक डैशबोर्ड 2-फैक्टर प्रमाणीकरण (2FA OTP) से सुरक्षित हैं।
            </p>
          </section>

          <section className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>3. किसान के अधिकार (Your Rights)</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              प्रत्येक किसान को अपनी प्रविष्टि देखने, SMS सदस्यता रद्द करने (STOP लिखकर भेजें), और अपने फ़ोन नंबर को डेटाबेस
              से पूर्णतः हटाने (Right to be Forgotten) का पूर्ण अधिकार है।
            </p>
          </section>

          <section className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>4. डेटा संरक्षण अधिकारी संपर्क (Data Protection Officer)</span>
            </h2>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B1219] border border-slate-200/60 dark:border-slate-800/40 text-xs space-y-1 font-mono">
              <p className="text-slate-900 dark:text-white font-bold font-sans">State Agricultural Informatics &amp; IT Cell</p>
              <p className="text-slate-400">Email: privacy@gagandrishti.gov.in</p>
              <p className="text-slate-400">Toll-Free Helpline: 1800-180-1551 (Kisan Call Centre)</p>
              <p className="text-slate-400">Address: Krishi Bhawan, Arera Hills, Bhopal, Madhya Pradesh 462004</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

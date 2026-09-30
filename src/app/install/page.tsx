"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Download,
  Smartphone,
  Zap,
  HardDrive,
  Bell,
  CheckCircle2,
  Share,
  ArrowRight,
  ShieldCheck,
  Radio,
  CloudRain,
  Bug,
  Sparkles,
  Info,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PwaInstallPage() {
  const [activeTab, setActiveTab] = useState<"android" | "ios" | "feature_phone">("android");
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installStatus, setInstallStatus] = useState<string | null>(null);

  // Push Notification state (Step 10)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");
  const [notificationTestStatus, setNotificationTestStatus] = useState<string | null>(null);

  useEffect(() => {
    // Check standalone mode
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
    }

    // Capture install prompt
    const handleBeforePrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforePrompt);

    // Check notification permission if supported
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforePrompt);
    };
  }, []);

  const handleTriggerInstall = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setInstallStatus("बधाई! GaganDrishti सफलतापूर्वक आपके फ़ोन में इंस्टॉल हो गया है।");
          setIsInstalled(true);
        } else {
          setInstallStatus("इंस्टॉलेशन रद्द किया गया। आप कभी भी फिर से इंस्टॉल कर सकते हैं।");
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error(err);
      }
    } else {
      if (activeTab === "ios") {
        setInstallStatus("iPhone पर: नीचे 'Share' बटन दबाएं, फिर 'Add to Home Screen' चुनें।");
      } else {
        setInstallStatus("Chrome मेन्यू (ऊपर दाईं ओर ⋮) दबाएं और 'Install App' या 'Add to Home screen' चुनें।");
      }
    }
  };

  const handleRequestNotification = async () => {
    if (!("Notification" in window)) {
      setNotificationTestStatus("यह ब्राउज़र वेब नोटिफिकेशन्स सपोर्ट नहीं करता है।");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === "granted") {
        setNotificationTestStatus("नोटिफिकेशन की अनुमति मिल गई है! अब आप अलर्ट प्राप्त कर सकेंगे।");
        triggerTestNotification("GaganDrishti अलर्ट सक्रिय", "आपके जिले के मौसम व कीट अलर्ट अब सीधे प्राप्त होंगे।", "weather");
      } else {
        setNotificationTestStatus("नोटिफिकेशन अनुमति अस्वीकृत की गई। आप ब्राउज़र सेटिंग्स से इसे सक्षम कर सकते हैं।");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const triggerTestNotification = async (
    title: string,
    body: string,
    type: "weather" | "pest" | "spray"
  ) => {
    if (!("Notification" in window) || Notification.permission !== "granted") {
      setNotificationTestStatus("पहले ऊपर दिए गए बटन से नोटिफिकेशन की अनुमति दें।");
      return;
    }

    const iconsMap = {
      weather: "/images/icon-weather-96.png",
      pest: "/images/icon-pest-96.png",
      spray: "/images/icon-advice-96.png",
    };

    try {
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.ready;
        registration.showNotification(title, {
          body,
          icon: "/images/icon-192x192.png",
          badge: iconsMap[type],
          vibrate: [200, 100, 200],
          data: { url: "/?utm_source=pwa_test_alert" },
        } as any);
        setNotificationTestStatus(`सफलतापूर्वक भेजा गया: "${title}"`);
      } else {
        new Notification(title, { body, icon: "/images/icon-192x192.png" });
        setNotificationTestStatus(`सफलतापूर्वक भेजा गया: "${title}"`);
      }
    } catch (err) {
      console.error(err);
      new Notification(title, { body, icon: "/images/icon-192x192.png" });
      setNotificationTestStatus(`सफलतापूर्वक भेजा गया: "${title}"`);
    }
  };

  return (
    <div className="min-h-screen bg-[#070d14] text-slate-100 pb-20 selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-[#0b131e]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 text-decoration-none">
            <div className="w-9 h-9 rounded-xl bg-[#166534] flex items-center justify-center text-lg font-bold shadow-md">
              🌱
            </div>
            <div>
              <span className="font-bold text-base text-white tracking-tight">GaganDrishti</span>
              <span className="block text-[10px] text-emerald-400 font-medium">PWA Mobile App</span>
            </div>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <span>मुख्य पृष्ठ</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-8">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-4">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Progressive Web App (PWA) 2.0</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            📲 GaganDrishti को अपने Phone में जोड़ें
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Play Store या App Store के बिना सीधे 1-टैप में इंस्टॉल करें। इंटरनेट धीमा होने पर भी ऑफ़लाइन काम करता है।
          </p>

          {/* Quick Install CTA */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleTriggerInstall}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#166534] hover:bg-[#15803d] text-white font-bold text-sm shadow-xl shadow-emerald-950/50 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isInstalled ? "✓ ऐप पहले से इंस्टॉल है (Open App)" : "📲 अभी जोड़ें (Install Now)"}</span>
            </button>

            <Link
              href="/"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-slate-700 transition"
            >
              <span>ब्राउज़र में जारी रखें</span>
            </Link>
          </div>

          {installStatus && (
            <div className="mt-4 p-3 bg-emerald-900/30 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 max-w-md mx-auto">
              {installStatus}
            </div>
          )}
        </div>

        {/* Benefits Grid (Step 9) */}
        <div className="mb-12">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span>PWA ऐप के मुख्य लाभ (Key Benefits)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#111c2a] border border-slate-800/80 rounded-2xl p-4 flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">⚡ तेज़ व ऑफ़लाइन (Works Offline)</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  खेत में नेटवर्क न होने पर भी पुराना मौसम पूर्वानुमान, स्प्रे सलाह और कीट गाइड तुरंत खुलती है।
                </p>
              </div>
            </div>

            <div className="bg-[#111c2a] border border-slate-800/80 rounded-2xl p-4 flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">💾 कम डेटा खर्च (Low Cellular Data)</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  केवल 2–3 MB में तैयार। 2G/3G नेटवर्क पर भी बार-बार भारी डेटा डाउनलोड नहीं करता।
                </p>
              </div>
            </div>

            <div className="bg-[#111c2a] border border-slate-800/80 rounded-2xl p-4 flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">🔔 समय पर अलर्ट (Push Notifications)</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  भारी बारिश, आंधी, या कीट प्रकोप की पूर्व सूचना सीधे आपके फ़ोन की स्क्रीन पर मिलेगी।
                </p>
              </div>
            </div>

            <div className="bg-[#111c2a] border border-slate-800/80 rounded-2xl p-4 flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">📱 1-टैप होम स्क्रीन (Fullscreen App)</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  ब्राउज़र बार हट जाता है और असली ऐप जैसा फुल-स्क्रीन अनुभव मिलता है।
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Device-Specific Installation Instructions Tabs */}
        <div className="mb-12 bg-[#111c2a] border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-6 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                स्थापना निर्देश (Installation Steps)
              </h2>
              <p className="text-xs text-slate-400">अपने डिवाइस के अनुसार आसान चरण देखें</p>
            </div>

            <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab("android")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === "android"
                    ? "bg-[#166534] text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Android (Chrome)
              </button>
              <button
                onClick={() => setActiveTab("ios")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === "ios"
                    ? "bg-[#166534] text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                iPhone (Safari)
              </button>
              <button
                onClick={() => setActiveTab("feature_phone")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === "feature_phone"
                    ? "bg-[#166534] text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                फीचर फोन (SMS)
              </button>
            </div>
          </div>

          {/* Android Steps */}
          {activeTab === "android" && (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-xl bg-[#166534] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  1
                </span>
                <div>
                  <h4 className="text-sm font-bold text-white">Chrome ब्राउज़र में लिंक खोलें</h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    अपने Android फोन में Google Chrome ब्राउज़र खोलें और GaganDrishti पर आएं।
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-xl bg-[#166534] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  2
                </span>
                <div>
                  <h4 className="text-sm font-bold text-white">स्क्रीन पर आए बैनर या मेन्यू को छुएं</h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    नीचे दिखाई देने वाले <strong className="text-emerald-400">&apos;Home Screen पर जोड़ें&apos;</strong> बटन पर टैप करें, या ऊपर दाईं ओर तीन बिंदुओं (⋮) को दबाएं।
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-xl bg-[#166534] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  3
                </span>
                <div>
                  <h4 className="text-sm font-bold text-white">&apos;Install app&apos; या &apos;Add to Home screen&apos; चुनें</h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    कुछ ही सेकंड में GaganDrishti का लोगो आपकी होम स्क्रीन पर सामान्य ऐप की तरह जुड़ जाएगा।
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Play Store लॉगिन की आवश्यकता नहीं है! ऐप स्वतः अपडेट होता रहेगा।</span>
              </div>
            </div>
          )}

          {/* iOS Steps */}
          {activeTab === "ios" && (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-xl bg-[#166534] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  1
                </span>
                <div>
                  <h4 className="text-sm font-bold text-white">Apple Safari ब्राउज़र में खोलें</h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    iPhone पर PWA इंस्टॉल करने के लिए केवल Safari ब्राउज़र का उपयोग करें।
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-xl bg-[#166534] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  2
                </span>
                <div>
                  <h4 className="text-sm font-bold text-white">नीचे Share (शेयर) आइकन दबाएं</h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    स्क्रीन के सबसे नीचे बीच में तीर वाले चौकोर बॉक्स <Share className="w-3.5 h-3.5 inline mx-0.5 text-blue-400" /> पर टैप करें।
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-xl bg-[#166534] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  3
                </span>
                <div>
                  <h4 className="text-sm font-bold text-white">&apos;Add to Home Screen&apos; चुनें और &apos;Add&apos; दबाएं</h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    सूची में नीचे स्क्रॉल करके &apos;Add to Home Screen&apos; दबाएं। ऊपर दाईं ओर &apos;Add&apos; पर टैप करते ही ऐप आपकी होम स्क्रीन पर आ जाएगा।
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Feature Phone Steps */}
          {activeTab === "feature_phone" && (
            <div className="space-y-4">
              <div className="p-4 bg-purple-950/20 border border-purple-500/20 rounded-2xl">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Radio className="w-4 h-4 text-purple-400" />
                  <span>बिना स्मार्टफ़ोन वाले किसानों के लिए निःशुल्क SMS सेवा</span>
                </h4>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  यदि आपके पास कीपैड वाला सामान्य फ़ोन है, तो भी आप GaganDrishti की सभी मौसम चेतावनियां और स्प्रे सलाह SMS के माध्यम से पा सकते हैं।
                </p>

                <div className="mt-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs font-mono text-purple-300">
                  SMS भेजें: <strong>WEATHER &lt;आपका 6-अंक पिनकोड&gt;</strong> से <strong>9876543210</strong>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <Link
                    href="/sms-feature-phone"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-400 hover:text-purple-300 underline"
                  >
                    <span>SMS सेवा पोर्टल देखें</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Step 10: Push Notification Tester / Simulator */}
        <div className="bg-[#111c2a] border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-4 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-400" />
                <span>पुश नोटिफिकेशन सिमुलेटर (Weather & Pest Push Alerts)</span>
              </h2>
              <p className="text-xs text-slate-400">
                परीक्षण करें कि मौसम एवं कीट चेतावनियां आपके फ़ोन पर कैसे प्राप्त होंगी
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">अनुमति स्थिति:</span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                  notificationPermission === "granted"
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    : notificationPermission === "denied"
                    ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                    : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                }`}
              >
                {notificationPermission === "granted"
                  ? "✓ सक्षम (Granted)"
                  : notificationPermission === "denied"
                  ? "✗ अस्वीकृत (Denied)"
                  : "आवश्यक (Prompt)"}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
            <button
              onClick={handleRequestNotification}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span>🔔 नोटिफिकेशन अनुमति चालू करें (Enable Alerts)</span>
            </button>
            <span className="text-xs text-slate-400">
              ब्राउज़र आपसे सूचनाएं दिखाने की अनुमति मांगेगा।
            </span>
          </div>

          {notificationTestStatus && (
            <div className="mb-4 p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200">
              {notificationTestStatus}
            </div>
          )}

          {/* Test Notification Triggers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Test 1: Heavy Rain Warning */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-blue-400 mb-2">
                  <CloudRain className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">Weather Alert</span>
                </div>
                <h4 className="text-xs font-bold text-white">🌧️ Heavy Rain Warning</h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  रायसेन जिले में 40-60mm बारिश का पूर्वानुमान। जलभराव से बचाव करें।
                </p>
              </div>
              <button
                onClick={() =>
                  triggerTestNotification(
                    "🌧️ Heavy Rain Warning (रायसेन)",
                    "40-60mm भारी बारिश की संभावना। खेतों में जल निकासी तैयार रखें।",
                    "weather"
                  )
                }
                className="mt-3 w-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl py-1.5 text-xs font-semibold transition cursor-pointer"
              >
                टेस्ट अलर्ट भेजें
              </button>
            </div>

            {/* Test 2: Pest Warning */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-rose-400 mb-2">
                  <Bug className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">Pest Forecast</span>
                </div>
                <h4 className="text-xs font-bold text-white">🐛 गुलाबी सुंडी खतरा</h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  नमी 85% होने के कारण अगले 3 दिनों में पिंक बॉलवर्म का प्रकोप संभव।
                </p>
              </div>
              <button
                onClick={() =>
                  triggerTestNotification(
                    "🐛 Pest Warning: गुलाबी सुंडी (Pink Bollworm)",
                    "उच्च आर्द्रता से प्रकोप की आशंका। 24 घंटे में नीम का तेल (1500 ppm) छिड़कें।",
                    "pest"
                  )
                }
                className="mt-3 w-full bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-xl py-1.5 text-xs font-semibold transition cursor-pointer"
              >
                टेस्ट अलर्ट भेजें
              </button>
            </div>

            {/* Test 3: Spray Window */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-emerald-400 mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">Action Window</span>
                </div>
                <h4 className="text-xs font-bold text-white">✅ सुरक्षित स्प्रे समय</h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  हवा शांत (&lt; 8 km/h)। सुबह 7:00 से 9:00 बजे तक स्प्रे के लिए उपयुक्त मौसम।
                </p>
              </div>
              <button
                onClick={() =>
                  triggerTestNotification(
                    "✅ Spray Window Open: आज सुबह 7-9 AM",
                    "हवा की गति 6 km/h, बारिश 0%। कीटनाशक छिड़काव के लिए सर्वोत्तम समय।",
                    "spray"
                  )
                }
                className="mt-3 w-full bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl py-1.5 text-xs font-semibold transition cursor-pointer"
              >
                टेस्ट अलर्ट भेजें
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

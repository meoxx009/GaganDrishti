"use client";

import React, { useState, useEffect } from "react";
import { Download, X, Smartphone, CheckCircle2, ChevronRight, Share } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    // Check if already installed / standalone
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    // Check if previously dismissed in this session
    const dismissedTime = localStorage.getItem("gagandrishti_pwa_dismissed");
    if (dismissedTime && Date.now() - parseInt(dismissedTime, 10) < 24 * 3600 * 1000) {
      setIsDismissed(true);
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Listen for beforeinstallprompt event (Android, Chrome, Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Listen for successful installation
    const handleAppInstalled = () => {
      setInstallSuccess(true);
      setDeferredPrompt(null);
      setTimeout(() => {
        setIsStandalone(true);
      }, 3000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        console.log("[PWA] User accepted the GaganDrishti install prompt");
        setInstallSuccess(true);
      } else {
        console.log("[PWA] User dismissed the install prompt");
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      // Direct user to full install instructions page
      window.location.href = "/install";
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem("gagandrishti_pwa_dismissed", Date.now().toString());
  };

  // Do not show if already in standalone app mode or dismissed
  if (isStandalone || isDismissed) {
    return null;
  }

  // If installed successfully, show brief celebratory badge
  if (installSuccess) {
    return (
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 animate-bounce">
        <div className="bg-emerald-900/90 backdrop-blur-md border border-emerald-500/50 rounded-2xl p-4 shadow-2xl flex items-center gap-3 text-white">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <h4 className="text-sm font-bold">ऐप सफलतापूर्वक इंस्टॉल हुआ!</h4>
            <p className="text-xs text-emerald-200">GaganDrishti अब आपकी Home Screen पर उपलब्ध है।</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Floating Bottom Install Banner */}
      <aside 
        aria-label="App Install Notification"
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 animate-fade-in"
      >
        <div className="bg-[#111c2a]/95 backdrop-blur-md border border-emerald-600/40 rounded-2xl p-4 shadow-2xl text-white">
          <div className="flex items-start justify-between gap-3">
            {/* App Icon */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-700 to-green-900 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-md">
              <span className="text-xl">🌱</span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  PWA Mobile App
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mt-1 leading-tight">
                GaganDrishti अपने फ़ोन में जोड़ें
              </h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-snug">
                बिना Play Store, ऑफ़लाइन मौसम व कृषि सलाह सीधे Home Screen पर।
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center gap-2">
            <button
              onClick={handleInstallClick}
              className="flex-1 flex items-center justify-center gap-2 bg-[#166534] hover:bg-[#15803d] text-white text-xs font-bold py-2 px-3 rounded-xl transition shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>📲 Home Screen पर जोड़ें</span>
            </button>

            <a
              href="/install"
              className="flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold py-2 px-2.5 rounded-xl border border-slate-700 transition"
            >
              <span>विधि</span>
              <ChevronRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </aside>

      {/* iOS Manual Install Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-[#111c2a] border border-slate-700 rounded-3xl p-6 max-w-sm w-full text-white shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#166534] flex items-center justify-center text-sm font-bold">
                  🌱
                </div>
                <h3 className="font-bold text-sm">iPhone पर इंस्टॉल करें</h3>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ol className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center font-bold shrink-0">1</span>
                <span>Safari ब्राउज़र के नीचे स्थित <strong className="text-white">Share (शेयर) बटन <Share className="w-3.5 h-3.5 inline mx-0.5" /></strong> को दबाएं।</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center font-bold shrink-0">2</span>
                <span>मेन्यू में नीचे स्क्रॉल करके <strong className="text-white">&apos;Add to Home Screen&apos; (होम स्क्रीन में जोड़ें)</strong> चुनें।</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center font-bold shrink-0">3</span>
                <span>ऊपर दाईं ओर <strong className="text-white">&apos;Add&apos;</strong> पर टैप करें। GaganDrishti आपके होम स्क्रीन पर आ जाएगी!</span>
              </li>
            </ol>

            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-5 w-full bg-[#166534] hover:bg-[#15803d] text-white font-bold py-2.5 rounded-xl text-xs transition"
            >
              समझ गया (Got it)
            </button>
          </div>
        </div>
      )}
    </>
  );
};

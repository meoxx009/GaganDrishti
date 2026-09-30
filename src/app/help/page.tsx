"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  BookOpen,
  Phone,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Smartphone,
  ShieldCheck,
  Send,
  CloudSun,
  Sprout,
  Search,
  ExternalLink,
} from "lucide-react";
import { ShellHeaderMinimal } from "@/components/feedback/ShellHeaderMinimal";

export default function HelpFaqPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    {
      qHi: "गगनदृष्टि ऐप का उपयोग कैसे करें?",
      qEn: "How do I use GaganDrishti app?",
      aHi: "आप अपने गांव का 6-अंकों का पिनकोड दर्ज करके वर्तमान तापमान, वर्षा की सटीक संभावना (प्रतिशत में), हवा की गति और अगले 7 दिनों का पूर्वानुमान देख सकते हैं। 'किसान' टैब में जाकर अपनी फसल और अवस्था चुनकर आज स्प्रे करना चाहिए या नहीं, यह जान सकते हैं।",
      aEn: "Enter your 6-digit PIN code to view real-time temperature, rain probability, wind speed, and 7-day forecast. Go to the Farmer tab to check crop-specific decisions for spraying and irrigation.",
    },
    {
      qHi: "बिना इंटरनेट के SMS द्वारा मौसम कैसे जानें?",
      qEn: "How to check weather without internet via SMS?",
      aHi: "अपने साधारण कीपैड फ़ोन से +91-9826012345 पर 'WEATHER <पिनकोड>' लिखकर SMS भेजें (उदा. 'WEATHER 462001')। आपको तुरंत 3 सेकंड में मौसम और कृषि सलाह का SMS प्राप्त होगा।",
      aEn: "From any feature phone, send SMS 'WEATHER <pincode>' (e.g. 'WEATHER 462001') to +91-9826012345. You will receive real-time weather metrics and farming advice in seconds.",
    },
    {
      qHi: "कम डेटा मोड (Low Bandwidth Mode) क्या है?",
      qEn: "What is Low Bandwidth Mode?",
      aHi: "धीमे 3G या 2G नेटवर्क पर डेटा और बैटरी बचाने के लिए सेटिंग्स में 'कम डेटा मोड' चालू करें। इससे भारी मैप्स और ग्राफिक्स सरल टेक्स्ट में बदल जाते हैं और 80% डेटा की बचत होती है।",
      aEn: "Enable Low Bandwidth Mode in Settings to save data and battery on 2G/3G networks. It turns complex maps and charts into lightweight text, saving ~80% data.",
    },
    {
      qHi: "कीट और रोग का पूर्वानुमान कैसे काम करता है?",
      qEn: "How does pest & disease forecasting work?",
      aHi: "जब आर्द्रता 80% से अधिक और तापमान 25-30°C के बीच लगातार 48 घंटे रहता है, तो सफेद मक्खी (Whitefly) और तना छेदक (Stem Borer) का जोखिम स्वतः सक्रिय हो जाता है और आपको चेतावनी दी जाती है।",
      aEn: "When humidity exceeds 80% with temperatures between 25-30°C for 48 hours, the system triggers automated pest alerts for whitefly, stem borer, and blight.",
    },
    {
      qHi: "मेरा पिनकोड नहीं मिल रहा है, क्या करें?",
      qEn: "What to do if my pincode is not found?",
      aHi: "अपनी तहसील या निकटतम कस्बे का पिनकोड दर्ज करें। मध्य प्रदेश के 52 जिलों के 500,000+ पिनकोड डेटाबेस में शामिल हैं। यदि समस्या बनी रहे तो 1800-180-1551 पर कॉल करें।",
      aEn: "Enter the PIN code of your nearest tehsil or town. All 52 districts of MP are indexed. If issue persists, call toll-free helpline 1800-180-1551.",
    },
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.qHi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.qEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.aHi.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 text-xs font-bold text-cyan-400">
            <BookOpen className="h-4 w-4" />
            <span>User Manual &amp; Help Desk (उपयोगकर्ता सहायता)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            मदद एवं अक्सर पूछे जाने वाले प्रश्न (Help &amp; FAQ)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            गगनदृष्टि ऐप के उपयोग, ऑफलाइन SMS सुविधाओं और कृषि सलाह के सरल निर्देश
          </p>
        </div>

        {/* ── Emergency & Support Contacts Grid (Section 7) ───────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#080E14] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Phone className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">किसान कॉल सेंटर (Kisan Helpline)</h3>
            <p className="font-mono text-base font-bold text-emerald-500">1800-180-1551</p>
            <p className="text-[11px] text-slate-400">निःशुल्क टोल-फ्री (सुबह 6:00 से रात 10:00 तक)</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#080E14] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="h-9 w-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <MessageSquare className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">WhatsApp कृषि सहायता</h3>
            <p className="font-mono text-base font-bold text-cyan-400">+91 94251 78901</p>
            <p className="text-[11px] text-slate-400">24x7 AI स्वचालित मौसम व कीट सलाह</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#080E14] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="h-9 w-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Smartphone className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">SMS फीचर फोन गेटवे</h3>
            <p className="font-mono text-base font-bold text-indigo-400">WEATHER &lt;PIN&gt;</p>
            <p className="text-[11px] text-slate-400">भेजें +91 98260 12345 पर</p>
          </div>
        </div>

        {/* ── Farmer Quickstart Guide (Hindi) ─────────────────────────── */}
        <div className="bg-white dark:bg-[#080E14] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sprout className="h-5 w-5 text-emerald-500" />
            <span>किसान उपयोगकर्ता गाइड (Step-by-Step Farmer Guide)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B1219] border border-slate-200/60 dark:border-slate-800/40 space-y-1.5">
              <span className="font-bold text-cyan-400">चरण 1: मौसम देखना</span>
              <p className="text-slate-600 dark:text-slate-300">
                ऐप खोलें या अपना 6-अंकों का पिनकोड चुनें। आपको बड़ा तापमान (°C), वर्षा की संभावना और अगले 7 दिनों का पूर्वानुमान दिखेगा।
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B1219] border border-slate-200/60 dark:border-slate-800/40 space-y-1.5">
              <span className="font-bold text-emerald-400">चरण 2: स्प्रे व सिंचाई सलाह</span>
              <p className="text-slate-600 dark:text-slate-300">
                'किसान' सेक्शन में जाएं। अपनी फसल (जैसे सोयाबीन) और अवस्था (जैसे फूल आना) चुनें। हवा और बारिश देखकर सिस्टम बताएगा कि आज छिड़काव सुरक्षित है या नहीं।
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B1219] border border-slate-200/60 dark:border-slate-800/40 space-y-1.5">
              <span className="font-bold text-amber-400">चरण 3: जमीनी अनुभव साझा करना</span>
              <p className="text-slate-600 dark:text-slate-300">
                'फीडबैक' फॉर्म पर जाएं। 4 आसान चरणों में आज आपने क्या काम किया, मौसम कैसा रहा, और कीट दिखे या नहीं, यह दर्ज करें।
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B1219] border border-slate-200/60 dark:border-slate-800/40 space-y-1.5">
              <span className="font-bold text-indigo-400">चरण 4: यात्रा मौसम सुरक्षा</span>
              <p className="text-slate-600 dark:text-slate-300">
                मंडी या दूसरे शहर जाने से पहले 'मार्ग सुरक्षा' देखें (जैसे भोपाल से इंदौर)। रास्ते में भारी बारिश या आंधी के समय की चेतावनी मिलती है।
              </p>
            </div>
          </div>
        </div>

        {/* ── Searchable FAQ Section ──────────────────────────────────── */}
        <div className="bg-white dark:bg-[#080E14] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-cyan-500" />
              <span>अक्सर पूछे जाने वाले सवाल (Frequently Asked Questions)</span>
            </h2>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="प्रश्न खोजें (Search FAQ)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B1219] pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            {filteredFaqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#0B1219]/60 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left text-xs sm:text-sm font-semibold text-slate-900 dark:text-white min-h-[48px]"
                >
                  <div className="space-y-0.5">
                    <p>{faq.qHi}</p>
                    <p className="text-[11px] text-slate-400 font-normal">{faq.qEn}</p>
                  </div>
                  {activeFaq === idx ? (
                    <ChevronUp className="h-4 w-4 text-slate-400 shrink-0 ml-2" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400 shrink-0 ml-2" />
                  )}
                </button>

                {activeFaq === idx && (
                  <div className="p-4 pt-0 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800/40 space-y-1.5 leading-relaxed">
                    <p>{faq.aHi}</p>
                    <p className="text-slate-400 font-sans">{faq.aEn}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

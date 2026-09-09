"use client";

import React from "react";
import { ShieldAlert, Building2, MapPin, AlertCircle, PhoneCall, Info } from "lucide-react";
import { useApp } from "@/context/AppContext";

export const ReliefCentresNotice: React.FC = () => {
  const { language, city } = useApp();
  const cityName = language === "hi" ? city.nameHi : city.nameEn;
  const stateName = language === "hi" ? city.stateHi : city.stateEn;

  return (
    <div className="rounded-3xl border border-amber-500/40 bg-gradient-to-br from-[#0D1B2A]/90 via-[#07111F]/95 to-slate-950 p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
      {/* 1. Header with Warning & Authority Priority */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {language === "hi"
                  ? "नागरिक राहत एवं आश्रय केंद्र प्रोटोकॉल"
                  : "Designated Relief & Evacuation Shelters"}
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-300">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{language === "hi" ? "आधिकारिक प्रोटोकॉल" : "Official Protocol"}</span>
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-300">
              {language === "hi"
                ? `${cityName} (${stateName}) एवं निकटवर्ती क्षेत्रों हेतु आपदा आश्रय व्यवस्था`
                : `Disaster shelter framework for ${cityName} (${stateName}) and adjacent regions`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-slate-900/80 border border-slate-700/80 px-3.5 py-2 text-xs text-slate-300 shrink-0">
          <MapPin className="h-4 w-4 text-cyan-400 shrink-0" />
          <span className="font-semibold text-slate-200">{cityName}, {stateName}</span>
        </div>
      </div>

      {/* 2. Authority Priority Policy Statement */}
      <div className="rounded-2xl border border-rose-500/40 bg-rose-950/25 p-4 sm:p-5 flex flex-col sm:flex-row items-start gap-3.5 text-rose-200">
        <ShieldAlert className="h-6 w-6 text-rose-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-rose-300">
            {language === "hi"
              ? "सर्वोच्च प्राथमिकता: सक्षम स्थानीय प्राधिकरण के निर्देश"
              : "Supreme Authority: Official Local Directives Take Absolute Precedence"}
          </h3>
          <p className="text-xs leading-relaxed text-rose-200/90">
            {language === "hi"
              ? "जिला प्रशासन, राज्य आपदा प्रबंधन प्राधिकरण (SDMA) अथवा राष्ट्रीय आपदा प्रबंधन प्राधिकरण (NDMA) द्वारा जारी कोई भी आधिकारिक आदेश, सायरन अथवा निकासी निर्देश इस ऐप के किसी भी पूर्वानुमान से सर्वोच्च और अंतिम माने जाएंगे। किसी भी आपातकाल में तुरंत स्थानीय प्रशासन के निर्देशों का अक्षरशः पालन करें।"
              : "All official evacuation orders, sirens, and advisories issued by District Magistrates, State Disaster Management Authorities (SDMA), or NDMA take absolute precedence over any automated forecast indicator. Always comply immediately with on-ground administrative directives."}
          </p>
        </div>
      </div>

      {/* 3. Factual Relief Centres Designation Framework (No Fabrication) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-2.5">
          <div className="flex items-center gap-2 text-cyan-400">
            <Info className="h-4 w-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              {language === "hi"
                ? "राहत शिविरों का आवंटन कैसे होता है?"
                : "How Relief Shelters Are Activated"}
            </h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {language === "hi"
              ? "बाढ़, चक्रवात या गंभीर आपदा के दौरान जिला कलेक्टर एवं नगर निगम/तहसील प्रशासन द्वारा सरकारी स्कूलों, सामुदायिक भवनों और पक्के स्टेडियमों को तुरंत सक्रिय राहत शिविरों में परिवर्तित किया जाता है। आपदा की तीव्रता और जलभराव के वास्तविक स्तर के आधार पर स्थान तय होते हैं।"
              : "During active floods, cyclones, or calamities, District Disaster Management Authorities (DDMA) convert designated government schools, community halls, and cyclone shelters into active relief camps based on real-time water levels."}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-2.5">
          <div className="flex items-center gap-2 text-emerald-400">
            <PhoneCall className="h-4 w-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              {language === "hi"
                ? "सक्रिय राहत शिविर की जानकारी कैसे पाएं?"
                : "How to Locate Your Nearest Active Camp"}
            </h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {language === "hi"
              ? "सक्रिय शिविर की सटीक लोकेशन जानने हेतु टोल-फ्री जिला आपदा नियंत्रण कक्ष 1077 या राज्य नियंत्रण कक्ष 1070 पर कॉल करें। स्थानीय पुलिस (112) या ग्राम पंचायत/वार्ड सचिव से भी तत्काल सुरक्षित निकासी मार्ग की पुष्टि की जा सकती है।"
              : "To find your currently designated active shelter, dial toll-free District Control Room 1077 or State Helpline 1070. Local emergency responders (112) and municipal ward offices coordinate immediate evacuation transport."}
          </p>
        </div>
      </div>
    </div>
  );
};

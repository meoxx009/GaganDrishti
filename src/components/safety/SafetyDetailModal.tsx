"use client";

import React, { useEffect } from "react";
import {
  X,
  ShieldAlert,
  CloudRain,
  Zap,
  Wind,
  Sun,
  AlertTriangle,
  Info,
  CheckCircle2,
  Thermometer,
  Droplets,
  Radio,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useWeather } from "@/context/WeatherContext";

export interface SafetyTopicData {
  id: string;
  titleEn: string;
  titleHi: string;
  iconName: "Zap" | "CloudRain" | "Wind" | "Sun";
  timeframeEn: string;
  timeframeHi: string;
  impactEn: string;
  impactHi: string;
  precautionsEn: string[];
  precautionsHi: string[];
}

export const SAFETY_TOPIC_DETAILS: Record<string, SafetyTopicData> = {
  card1: {
    id: "lightning",
    titleEn: "Thunderstorm, Lightning & Heatwave Watch",
    titleHi: "तड़ित झंझा (वज्रपात) एवं लू निगरानी",
    iconName: "Zap",
    timeframeEn: "Next 12–24 Hours",
    timeframeHi: "अगले 12–24 घंटे",
    impactEn:
      "Rapid convective cloud development may generate intense electrical activity, sudden lightning strikes, or severe afternoon temperature spikes.",
    impactHi:
      "तीव्र संवहनीय बादलों के कारण बिजली गिरने की आशंका अथवा दोपहर के समय तापमान में अत्यधिक वृद्धि की स्थिति बन सकती है।",
    precautionsEn: [
      "Stay indoors during thunder; immediately seek shelter in a concrete building or enclosed vehicle.",
      "Stay away from tall isolated trees, metal fences, open water, and telephone/power lines.",
      "Unplug non-essential electronic appliances to protect against sudden voltage surges.",
      "During peak afternoon heat, maintain steady hydration and avoid strenuous outdoor activity.",
    ],
    precautionsHi: [
      "गर्जन सुनाई देने पर तुरंत किसी पक्के मकान या बंद चारपहिया वाहन में शरण लें।",
      "ऊंचे अकेले पेड़, धातु की बाड़, खुले जलाशय और बिजली के खंभों से पर्याप्त दूरी बनाए रखें।",
      "बिजली के सर्ज से उपकरणों को बचाने के लिए गैर-जरूरी इलेक्ट्रॉनिक प्लग निकाल दें।",
      "दोपहर की तेज धूप में पर्याप्त पानी पिएं और अनावश्यक रूप से बाहर निकलने से बचें।",
    ],
  },
  card2: {
    id: "flood",
    titleEn: "Flash Flood, Inundation & Cloudburst Analysis",
    titleHi: "अतिवृष्टि, जलभराव एवं अचानक बाढ़ विश्लेषण",
    iconName: "CloudRain",
    timeframeEn: "Next 24–48 Hours",
    timeframeHi: "अगले 24–48 घंटे",
    impactEn:
      "High-intensity rainfall in short intervals can overwhelm drainage networks, leading to rapid water accumulation in underpasses and low-lying agricultural basins.",
    impactHi:
      "कम समय में तेज बारिश से नालों और जल निकासी तंत्र पर दबाव बढ़ सकता है, जिससे अंडरपास तथा निचले खेतों में जलभराव की स्थिति बन सकती है।",
    precautionsEn: [
      "Never attempt to drive or walk through waterlogged roads or flooded bridges.",
      "Store emergency food, drinking water, first-aid kits, and essential documents at an elevated dry location.",
      "Farmers should keep drainage channels cleared to prevent water stagnation in seedling fields.",
      "Heed all localized civic advisories regarding temporary traffic diversions.",
    ],
    precautionsHi: [
      "जलमग्न सड़कों, पुलियों या तेज बहाव वाले रास्तों पर वाहन चलाने या पैदल चलने का प्रयास कदापि न करें।",
      "पीने का पानी, आवश्यक दवाइयां और महत्वपूर्ण कागजात घर के ऊंचे और सूखे स्थान पर रखें।",
      "किसान भाई खेतों में जल निकासी की व्यवस्था चुस्त रखें ताकि फसलों की जड़ें न गलें।",
      "नगर निगम या यातायात पुलिस द्वारा जारी डायवर्जन निर्देशों का अनुपालन करें।",
    ],
  },
  card3: {
    id: "storm",
    titleEn: "Cyclone, Gale & High Wind Advisories",
    titleHi: "चक्रवात, तेज आंधी एवं चक्रवाती हवा सतर्कता",
    iconName: "Wind",
    timeframeEn: "Next 24–36 Hours",
    timeframeHi: "अगले 24–36 घंटे",
    impactEn:
      "Sustained strong winds and heavy gusts can dislodge corrugated roofing, topple unstable hoardings, and damage standing tall crops like maize and banana.",
    impactHi:
      "तेज हवाओं और झोंकों से टीन-शेड, कमजोर होर्डिंग्स गिर सकते हैं तथा मक्का, केला व गन्ने जैसी फसलों को नुकसान हो सकता है।",
    precautionsEn: [
      "Secure loose roofing sheets, solar panels, water tanks, and outdoor furniture.",
      "Do not park vehicles under old, heavy-branched trees or fragile hoardings.",
      "Suspend overhead pesticide/fertilizer spraying during high wind velocity (>18 km/h).",
      "Keep flashlights and battery-powered radios charged in anticipation of possible power outages.",
    ],
    precautionsHi: [
      "छत पर रखे टीन-शेड, सोलर पैनल और ढीली वस्तुओं को रस्सी से अच्छी तरह बांधकर सुरक्षित करें।",
      "वाहनों को पुराने पेड़ों या भारी विज्ञापनी होर्डिंग्स के नीचे खड़ा न करें।",
      "तेज हवा (>18 किमी/घंटा) के दौरान कीटनाशक छिड़काव तुरंत स्थगित रखें।",
      "बिजली आपूर्ति बाधित होने की संभावना के मद्देनजर टॉर्च और मोबाइल चार्ज रखें।",
    ],
  },
};

interface SafetyDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardKey: "card1" | "card2" | "card3" | null;
}

export const SafetyDetailModal: React.FC<SafetyDetailModalProps> = ({
  isOpen,
  onClose,
  cardKey,
}) => {
  const { language, city } = useApp();
  const { weather } = useWeather();

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !cardKey) return null;

  const data = SAFETY_TOPIC_DETAILS[cardKey];
  if (!data) return null;

  const cityName = language === "hi" ? city.nameHi : city.nameEn;
  const stateName = language === "hi" ? city.stateHi : city.stateEn;
  const current = weather?.current;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#080E14] shadow-2xl p-6 sm:p-7 space-y-5 text-slate-900 dark:text-[#F8FAFC]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400">
              {data.iconName === "Zap" && <Zap className="h-5 w-5" />}
              {data.iconName === "CloudRain" && <CloudRain className="h-5 w-5" />}
              {data.iconName === "Wind" && <Wind className="h-5 w-5" />}
              {data.iconName === "Sun" && <Sun className="h-5 w-5" />}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                {language === "hi" ? data.titleHi : data.titleEn}
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#7F91A3] mt-0.5">
                {cityName}, {stateName} • {language === "hi" ? data.timeframeHi : data.timeframeEn}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#0B1219] transition-colors"
            title="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Live Selected City Telemetry Bar */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#060C12] p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
              <Radio className="h-3.5 w-3.5" />
              <span>
                {language === "hi"
                  ? `${cityName} लाइव पूर्वानुमान मेट्रिक्स`
                  : `Live Forecast Telemetry for ${cityName}`}
              </span>
            </span>
            <span className="text-[10px] text-slate-500 dark:text-[#7F91A3] font-mono">Open-Meteo</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="rounded-xl bg-white dark:bg-[#0B1219] p-2 border border-slate-100 dark:border-slate-800/80">
              <span className="text-[10px] text-slate-400 dark:text-[#7F91A3] block">Temperature</span>
              <span className="font-bold text-sm text-slate-900 dark:text-[#F8FAFC]">
                {current ? Math.round(current.temperature) : "--"}°C
              </span>
            </div>
            <div className="rounded-xl bg-white dark:bg-[#0B1219] p-2 border border-slate-100 dark:border-slate-800/80">
              <span className="text-[10px] text-slate-400 dark:text-[#7F91A3] block">Wind / Gusts</span>
              <span className="font-bold text-sm text-slate-900 dark:text-[#F8FAFC]">
                {current ? Math.round(current.windSpeed) : "--"} km/h
              </span>
            </div>
            <div className="rounded-xl bg-white dark:bg-[#0B1219] p-2 border border-slate-100 dark:border-slate-800/80">
              <span className="text-[10px] text-slate-400 dark:text-[#7F91A3] block">Precipitation</span>
              <span className="font-bold text-sm text-slate-900 dark:text-[#F8FAFC]">
                {current ? Math.round((current.precipitation || 0) * 10) / 10 : 0} mm
              </span>
            </div>
            <div className="rounded-xl bg-white dark:bg-[#0B1219] p-2 border border-slate-100 dark:border-slate-800/80">
              <span className="text-[10px] text-slate-400 dark:text-[#7F91A3] block">Humidity</span>
              <span className="font-bold text-sm text-slate-900 dark:text-[#F8FAFC]">
                {current ? Math.round(current.relativeHumidity) : "--"}%
              </span>
            </div>
          </div>
        </div>

        {/* What could happen */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#7F91A3]">
            {language === "hi" ? "संभावित प्रभाव (What could happen?)" : "Potential Impact"}
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-[#CBD5E1] leading-relaxed rounded-xl bg-slate-50 dark:bg-[#0B1219] p-3 border border-slate-200/60 dark:border-slate-800/80">
            {language === "hi" ? data.impactHi : data.impactEn}
          </p>
        </div>

        {/* What should I do (Precautions) */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            {language === "hi" ? "सावधानियां एवं निर्देश (What should I do?)" : "Recommended Safety Actions"}
          </h3>
          <ul className="space-y-2">
            {(language === "hi" ? data.precautionsHi : data.precautionsEn).map(
              (p: string, idx: number) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-[#CBD5E1] leading-relaxed"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{p}</span>
                </li>
              )
            )}
          </ul>
        </div>

        {/* Truthfulness & IMD Verification Disclaimer */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 flex items-start gap-2.5 text-amber-800 dark:text-amber-300 text-xs">
          <Info className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
          <p className="leading-relaxed text-[11px]">
            {language === "hi"
              ? "यह गगनदृष्टि पूर्वानुमान-आधारित सुरक्षा परामर्श है, आईएमडी (IMD) का आधिकारिक चेतावनी बुलेटिन नहीं। आपदा स्थिति में स्थानीय प्रशासन (DDMA/NDMA) के निर्देश सर्वोपरि हैं।"
              : "GaganDrishti forecast-derived informational advisory; not an official IMD alert. In emergencies, official directives from local disaster management authorities (DDMA/NDMA) take precedence."}
          </p>
        </div>

        {/* Close button */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0B1219] dark:hover:bg-[#0E1821] text-xs font-semibold text-slate-700 dark:text-[#F8FAFC] border border-transparent dark:border-slate-800 transition-colors"
          >
            {language === "hi" ? "बंद करें" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};

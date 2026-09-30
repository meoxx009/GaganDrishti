"use client";

import React, { useEffect } from "react";
import {
  X,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Info,
  Cloud,
  Sun,
  Shield,
  Clock,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useWeather } from "@/context/WeatherContext";

export type CitizenCardKey = "local_forecast" | "heat_uv" | "air_quality";

interface CitizenFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardKey: CitizenCardKey | null;
}

export const CitizenFeatureModal: React.FC<CitizenFeatureModalProps> = ({
  isOpen,
  onClose,
  cardKey,
}) => {
  const { language, city } = useApp();
  const { weather } = useWeather();

  // Handle ESC key and scroll lock
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

  const cityName = language === "hi" ? city.nameHi : city.nameEn;
  const stateName = language === "hi" ? city.stateHi : city.stateEn;
  const current = weather?.current;
  const hourly = weather?.hourly || [];
  const daily = weather?.daily || [];

  const next12h = hourly.slice(0, 12);
  const sumPrecip12h = Math.round(next12h.reduce((acc, h) => acc + (h.precipitation || 0), 0) * 10) / 10;
  const maxRainProb12h = next12h.reduce((max, h) => Math.max(max, h.precipitationProbability || 0), 0);
  const maxWindSpeed12h = next12h.reduce((max, h) => Math.max(max, h.windSpeed || 0), 0);

  const todayHigh = daily[0]?.tempMax ?? current?.temperature ?? "--";
  const todayLow = daily[0]?.tempMin ?? current?.temperature ?? "--";

  let modalTitle = "";
  let modalSubtitle = "";
  let statusBadgeText = "";
  let statusBadgeColor = "text-sky-700 bg-sky-50 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20";
  let explanationText = "";
  let actionPoints: string[] = [];
  let avoidPoints: string[] = [];
  let disclaimerText = "";
  let icon = <Cloud className="h-5 w-5" />;

  if (cardKey === "local_forecast") {
    icon = <Clock className="h-5 w-5" />;
    modalTitle = language === "hi" ? "स्थानीय मौसम पूर्वानुमान" : "Local Weather Forecast & Horizon";
    modalSubtitle = `${cityName}, ${stateName} • ${language === "hi" ? "अगले 12-24 घंटे" : "Next 12–24 Hours"}`;

    const hasRain = maxRainProb12h >= 40 || sumPrecip12h >= 2;
    const isWindy = maxWindSpeed12h >= 24;

    if (hasRain) {
      statusBadgeText = language === "hi" ? "वर्षा संभव: छाता साथ रखें" : "Rain Expected: Umbrella Advised";
      statusBadgeColor = "text-sky-700 bg-sky-50 border-sky-300 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/30";
      explanationText =
        language === "hi"
          ? `${cityName} में अगले 12 घंटों के दौरान वर्षा की अधिकतम संभावना ${maxRainProb12h}% है (कुल अनुमानित वर्षा ~${sumPrecip12h} मिमी)। दिन का तापमान ${todayLow}°C से ${todayHigh}°C के मध्य रहेगा।`
          : `Next 12 hours in ${cityName} indicate up to ${maxRainProb12h}% rain probability with ~${sumPrecip12h} mm cumulative precipitation. Day temperature ranges between ${todayLow}°C and ${todayHigh}°C.`;
      actionPoints =
        language === "hi"
          ? [
              "दैनिक आवागमन अथवा स्कूल/कार्यालय जाते समय वाटरप्रूफ रेनकोट या छाता साथ रखें।",
              "सड़कों पर जलभराव वाले निचले स्थानों पर वाहन धीमी गति से चलाएं।",
            ]
          : [
              "Carry an umbrella or rain gear for office and school transit.",
              "Expect wet road surfaces and allow additional commute time.",
            ];
      avoidPoints =
        language === "hi"
          ? ["तेज बारिश के दौरान दोपहिया तेज गति से न चलाएं।"]
          : ["Avoid rapid acceleration or harsh braking on slippery roads."];
    } else if (isWindy) {
      statusBadgeText = language === "hi" ? "हवा की गति तेज" : "Breezy to Gusty Horizon";
      statusBadgeColor = "text-amber-700 bg-amber-50 border-amber-300 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30";
      explanationText =
        language === "hi"
          ? `${cityName} में हवा की गति ${maxWindSpeed12h} km/h तक रहने का अनुमान है। मौसम मुख्य रूप से ${current?.conditionHi || "साफ"} रहेगा परंतु तेज हवाएं अनुभव होंगी।`
          : `Sustained winds may reach ${maxWindSpeed12h} km/h with generally ${current?.conditionEn || "clear"} atmospheric conditions.`;
      actionPoints =
        language === "hi"
          ? ["छत या बालकनी में रखी हल्की वस्तुओं को सुरक्षित बांधकर रखें।"]
          : ["Secure loose balcony items and lightweight outdoor furniture."];
      avoidPoints =
        language === "hi"
          ? ["पुराने कमजोर पेड़ों या होर्डिंग्स के नीचे वाहन पार्क न करें।"]
          : ["Do not park vehicles directly under fragile overhead hoardings or dry tree branches."];
    } else {
      statusBadgeText = language === "hi" ? "मौसम सुखद एवं साफ" : "Pleasant & Clear Conditions";
      statusBadgeColor = "text-emerald-700 bg-emerald-50 border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30";
      explanationText =
        language === "hi"
          ? `${cityName} में आज का मौसम मुख्य रूप से ${current?.conditionHi || "साफ"} बना रहेगा। तापमान ${todayLow}°C से ${todayHigh}°C के बीच रहेगा तथा वर्षा की संभावना मात्र ${maxRainProb12h}% है।`
          : `Stable and pleasant weather across ${cityName}. Daytime temperatures between ${todayLow}°C and ${todayHigh}°C with minimal rain probability (${maxRainProb12h}%).`;
      actionPoints =
        language === "hi"
          ? ["दैनिक बाहरी गतिविधियों, खेलकूद और यात्रा के लिए दिन अनुकूल है।"]
          : ["Conditions are favorable for outdoor walks, errands, and open-air events."];
      avoidPoints =
        language === "hi"
          ? ["दोपहर के समय सीधी तेज धूप से सामान्य बचाव रखें।"]
          : ["Take standard hydration breaks if exposed to sun for extended hours."];
    }

    disclaimerText =
      language === "hi"
        ? "ओपन-मेटियो पूर्वानुमान मॉडल पर आधारित स्थानीय अनुमान। आधिकारिक आपदा चेतावनी के लिए आईएमडी बुलेटिन देखें।"
        : "Derived from Open-Meteo numerical forecast models for local awareness; verify official emergency alerts with IMD.";
  } else if (cardKey === "heat_uv") {
    icon = <Sun className="h-5 w-5" />;
    modalTitle = language === "hi" ? "लू एवं धूप सुरक्षा परामर्श" : "Heat & Sun Safety Guidance";
    modalSubtitle = `${cityName} • ${language === "hi" ? "थर्मल तनाव एवं धूप सुरक्षा" : "Thermal Stress & Sun Protection"}`;

    const temp = current?.temperature || 28;
    const apparentTemp = current?.apparentTemperature || temp;
    const isExtremeHeat = temp >= 40 || apparentTemp >= 42;
    const isModerateHeat = temp >= 34 || apparentTemp >= 36;

    if (isExtremeHeat) {
      statusBadgeText = language === "hi" ? "गंभीर चेतावनी: तीव्र गर्मी / लू" : "Severe Warning: High Heat Stress";
      statusBadgeColor = "text-rose-700 bg-rose-50 border-rose-300 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30";
      explanationText =
        language === "hi"
          ? `वर्तमान तापमान ${temp}°C है और अनुभूत तापमान (Feels Like) लगभग ${apparentTemp}°C तक पहुंच रहा है। दोपहर के समय तीव्र लू (Heatwave) का खतरा अधिक है।`
          : `Current ambient temperature is ${temp}°C with heat index feeling like ${apparentTemp}°C. Elevated risk of heat exhaustion and severe thermal fatigue.`;
      actionPoints =
        language === "hi"
          ? [
              "दिन भर में बार-बार पर्याप्त पानी, ओआरएस (ORS) या नींबू पानी का सेवन करें।",
              "हल्के रंग के, ढीले सूती कपड़े पहनें और सिर को गमछे, टोपी या छाते से ढकें।",
              "बुजुर्गों और छोटे बच्चों को दोपहर में वातानुकूलित या छायादार स्थान पर रखें।",
            ]
          : [
              "Drink plenty of water, electrolyte fluids, and lemon water at regular intervals.",
              "Wear loose-fitting, light-colored cotton clothing and cover your head with a hat or scarf.",
              "Keep children and elderly family members in cool, shaded indoor areas.",
            ];
      avoidPoints =
        language === "hi"
          ? [
              "दोपहर 12:00 बजे से 4:00 बजे के बीच अनावश्यक रूप से धूप में न निकलें।",
              "चाय, कॉफी या अत्यधिक मीठे पेय पदार्थों के अधिक सेवन से बचें क्योंकि इनसे निर्जलीकरण बढ़ता है।",
            ]
          : [
              "Avoid strenuous outdoor work or athletic activity between 12:00 PM and 4:00 PM.",
              "Avoid excessive caffeine and high-sugar drinks that increase dehydration.",
            ];
    } else if (isModerateHeat) {
      statusBadgeText = language === "hi" ? "मध्यम गर्मी: सावधानी रखें" : "Moderate Heat: Hydration Caution";
      statusBadgeColor = "text-amber-700 bg-amber-50 border-amber-300 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30";
      explanationText =
        language === "hi"
          ? `अधिकतम तापमान ${todayHigh}°C और अनुभूत तापमान ${apparentTemp}°C रहने का अनुमान है। दोपहर की धूप में लंबे समय तक रहने से सिरदर्द या थकान हो सकती है।`
          : `Daytime maximum temp is ~${todayHigh}°C (feels like ${apparentTemp}°C). Prolonged sun exposure can cause mild fatigue and dehydration.`;
      actionPoints =
        language === "hi"
          ? [
              "घर से बाहर निकलते समय पानी की बोतल साथ रखें।",
              "आंखों की सुरक्षा के लिए धूप का चश्मा (सनग्लासेस) पहनें।",
            ]
          : [
              "Keep a refillable water bottle handy during outdoor travel.",
              "Use sunglasses and UV protection umbrellas during afternoon hours.",
            ];
      avoidPoints =
        language === "hi"
          ? ["लगातार कई घंटे बिना पानी पिए धूप में न रहें।"]
          : ["Avoid continuous outdoor exertion without scheduled rest breaks."];
    } else {
      statusBadgeText = language === "hi" ? "थर्मल स्थिति सामान्य एवं सुरक्षित" : "Comfortable Thermal Range";
      statusBadgeColor = "text-emerald-700 bg-emerald-50 border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30";
      explanationText =
        language === "hi"
          ? `वर्तमान तापमान ${temp}°C (अनुभूत ${apparentTemp}°C) सामान्य सुखद सीमा में है। अत्यधिक लू का कोई मौसम संकेत नहीं है।`
          : `Current temperature of ${temp}°C (feels like ${apparentTemp}°C) is within comfortable limits. No heatwave or extreme thermal stress detected.`;
      actionPoints =
        language === "hi"
          ? ["सामान्य दिनचर्या और नियमित जल सेवन बनाए रखें।"]
          : ["Maintain standard hydration and daily outdoor routine."];
      avoidPoints =
        language === "hi"
          ? ["विशेष गर्मी प्रतिबंध की आवश्यकता नहीं है।"]
          : ["No special heat-related restrictions required today."];
    }

    disclaimerText =
      language === "hi"
        ? "मौसम तापमान और अनुभूत आर्द्रता सूचकांक पर आधारित सामान्य सुरक्षा सलाह। प्रत्यक्ष यूवी सूचकांक सेंसर उपलब्ध न होने के कारण यह एक व्यावहारिक मार्गदर्शन है, चिकित्सीय निदान नहीं।"
        : "General thermal guidance based on forecast temperature and apparent humidity index; not a medical prescription.";
  } else if (cardKey === "air_quality") {
    icon = <Shield className="h-5 w-5" />;
    modalTitle = language === "hi" ? "वायु गुणवत्ता एवं श्वसन सुरक्षा" : "Air Quality & Breathing Safety Guidance";
    modalSubtitle = `${cityName} • ${language === "hi" ? "मौसम संदर्भ आधारित स्वास्थ्य परामर्श" : "Atmospheric Health Guidance"}`;

    const humidity = current?.relativeHumidity || 50;
    const wind = current?.windSpeed || 10;
    const isDryDusty = humidity < 25 && wind >= 18;
    const isStagnant = wind < 5 && humidity > 75;

    if (isDryDusty) {
      statusBadgeText = language === "hi" ? "शुष्क मौसम व धूल उड़ने की संभावना" : "Dry & Dusty Atmospheric Conditions";
      statusBadgeColor = "text-amber-700 bg-amber-50 border-amber-300 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30";
      explanationText =
        language === "hi"
          ? `कम आर्द्रता (${humidity}%) और तेज हवा (${wind} km/h) के कारण सड़कों और खुले मैदानों से धूल उड़ने की संभावना अधिक है। सांस के संवेदनशील व्यक्तियों को असुविधा हो सकती है।`
          : `Low relative humidity (${humidity}%) combined with gusty winds (${wind} km/h) can generate localized road and topsoil dust suspension.`;
      actionPoints =
        language === "hi"
          ? [
              "धूल से बचाव के लिए दोपहिया चालन या पैदल चलते समय मास्क अथवा रूमाल लगाएं।",
              "अस्थमा या एलर्जी के मरीज इनहेलर या नियमित दवाइयां साथ रखें।",
            ]
          : [
              "Wear a protective mask or scarf in traffic and windy dusty corridors.",
              "Individuals with asthma or dust sensitivity should keep prescribed inhalers accessible.",
            ];
      avoidPoints =
        language === "hi"
          ? ["मुख्य व्यस्त सड़कों के किनारे सुबह की तेज दौड़ लगाने से बचें।"]
          : ["Avoid vigorous outdoor cardio workouts right next to unpaved or heavy-traffic roads."];
    } else if (isStagnant) {
      statusBadgeText = language === "hi" ? "हवा की गति मंद: धुआं ठहरने की संभावना" : "Stagnant Air / Trapped Moisture";
      statusBadgeColor = "text-sky-700 bg-sky-50 border-sky-300 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/30";
      explanationText =
        language === "hi"
          ? `हवा की गति बहुत कम (${wind} km/h) और उच्च आर्द्रता (${humidity}%) है। शांत हवा में स्थानीय धुआं और कोहरा देर तक ठहर सकता है।`
          : `Low wind ventilation (${wind} km/h) with elevated humidity (${humidity}%) can cause localized mist, fog, and suspended smoke to linger.`;
      actionPoints =
        language === "hi"
          ? [
              "सुबह के समय कोहरा या स्मॉग होने पर धूप खिलने के बाद ही टहलने निकलें।",
              "कमरों में वेंटिलेशन बनाए रखें।",
            ]
          : [
              "Prefer morning walks after sunrise when ground inversions dissipate.",
              "Ensure adequate cross-ventilation in indoor living spaces.",
            ];
      avoidPoints =
        language === "hi"
          ? ["कचरा या पत्तियां खुली जगह में न जलाएं।"]
          : ["Do not burn biomass, leaves, or plastic in open neighborhood spaces."];
    } else {
      statusBadgeText = language === "hi" ? "पर्याप्त वायु वेंटिलेशन" : "Normal Atmospheric Dispersion";
      statusBadgeColor = "text-emerald-700 bg-emerald-50 border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30";
      explanationText =
        language === "hi"
          ? `मध्यम हवा (${wind} km/h) और संतुलित वातावरण के कारण मौसम वायु फैलाव के लिए सामान्य है। सामान्य सांस संबंधी कोई अतिरिक्त मौसम दबाव नहीं है।`
          : `Breezy conditions (~${wind} km/h) support atmospheric circulation and dispersion. Standard outdoor breathing environment.`;
      actionPoints =
        language === "hi"
          ? ["सामान्य दिनचर्या और योग/व्यायाम बिना रुकावट कर सकते हैं।"]
          : ["Outdoor exercises and normal physical activities can proceed as planned."];
      avoidPoints =
        language === "hi"
          ? ["धूम्रपान और बंद जगहों में जहरीले धुएं से हमेशा बचें।"]
          : ["Maintain standard avoidance of tobacco smoke and unventilated fumes."];
    }

    disclaimerText =
      language === "hi"
        ? "सत्यता नियम: वर्तमान में कोई आधिकारिक सीपीसीबी (CPCB) वायु गुणवत्ता (AQI) सेंसर डेटा सीधे जुड़ा नहीं है; अतः कोई बनावटी PM2.5/AQI संख्या प्रदर्शित नहीं की गई है। यह परामर्श हवा और मौसम चरों पर आधारित सामान्य श्वसन मार्गदर्शन है।"
        : "Integrity Rule: Live CPCB particulate pollution monitors (PM2.5/AQI) are not directly connected; no synthetic AQI numbers are fabricated. Guidance is derived strictly from atmospheric dispersion variables.";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#080E14] shadow-2xl p-6 sm:p-7 space-y-5 text-slate-900 dark:text-[#F8FAFC]"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400">
              {icon}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                {modalTitle}
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#7F91A3] mt-0.5">
                {modalSubtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#0B1219] transition-colors"
            title="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Live Citizen Telemetry Pill */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#060C12] p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
              <Radio className="h-3.5 w-3.5" />
              <span>
                {language === "hi" ? `${cityName} लाइव नागरिक मेट्रिक्स` : `Live Citizen Telemetry for ${cityName}`}
              </span>
            </span>
            <span className="text-[10px] text-slate-500 dark:text-[#7F91A3] font-mono">Open-Meteo</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="rounded-xl bg-white dark:bg-[#0B1219] p-2 border border-slate-100 dark:border-slate-800/80">
              <span className="text-[10px] text-slate-400 dark:text-[#7F91A3] block">Temperature</span>
              <span className="font-bold text-sm text-slate-900 dark:text-[#F8FAFC]">
                {current ? Math.round(current.temperature) : "--"}°C ({todayHigh}° / {todayLow}°)
              </span>
            </div>
            <div className="rounded-xl bg-white dark:bg-[#0B1219] p-2 border border-slate-100 dark:border-slate-800/80">
              <span className="text-[10px] text-slate-400 dark:text-[#7F91A3] block">Feels Like</span>
              <span className="font-bold text-sm text-slate-900 dark:text-[#F8FAFC]">
                {current ? Math.round(current.apparentTemperature) : "--"}°C
              </span>
            </div>
            <div className="rounded-xl bg-white dark:bg-[#0B1219] p-2 border border-slate-100 dark:border-slate-800/80">
              <span className="text-[10px] text-slate-400 dark:text-[#7F91A3] block">Wind / Gusts</span>
              <span className="font-bold text-sm text-slate-900 dark:text-[#F8FAFC]">
                {current ? Math.round(current.windSpeed) : "--"} km/h
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

        {/* Current Assessment Status */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${statusBadgeColor}`}>
              {statusBadgeText}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-[#CBD5E1] leading-relaxed rounded-xl bg-slate-50 dark:bg-[#0B1219] p-3.5 border border-slate-200/70 dark:border-slate-800/80">
            {explanationText}
          </p>
        </div>

        {/* Recommended Actions */}
        {actionPoints.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
              {language === "hi" ? "नागरिक सुरक्षा कदम (What to do)" : "Recommended Citizen Actions"}
            </h3>
            <ul className="space-y-2">
              {actionPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-[#CBD5E1] leading-relaxed">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* What to Avoid */}
        {avoidPoints.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              {language === "hi" ? "सावधानी / क्या न करें (What to avoid)" : "Precautions to Observe"}
            </h3>
            <ul className="space-y-2">
              {avoidPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-[#CBD5E1] leading-relaxed">
                  <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Truthful Disclaimer */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 flex items-start gap-2.5 text-amber-900 dark:text-amber-300 text-xs">
          <Info className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
          <p className="leading-relaxed text-[11px]">{disclaimerText}</p>
        </div>

        {/* Close button */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0B1219] dark:hover:bg-[#0E1821] text-xs font-semibold text-slate-700 dark:text-[#F8FAFC] border border-slate-200 dark:border-slate-800 transition-colors"
          >
            {language === "hi" ? "बंद करें" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};

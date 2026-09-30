"use client";

import React, { useEffect } from "react";
import {
  X,
  Sprout,
  Droplets,
  CloudSnow,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useWeather } from "@/context/WeatherContext";
import { CropId, StageId, CROPS, STAGES } from "@/lib/weather/farmerTypes";
import { findCropById } from "@/lib/crops";

export type FarmerCardKey = "sowing_harvesting" | "soil_moisture" | "hail_frost";

interface FarmerFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardKey: FarmerCardKey | null;
  cropId?: CropId;
  stageId?: StageId;
}

export const FarmerFeatureModal: React.FC<FarmerFeatureModalProps> = ({
  isOpen,
  onClose,
  cardKey,
  cropId = "wheat",
  stageId = "growing",
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

  const next24h = hourly.slice(0, 24);
  const sumPrecip24h = Math.round(next24h.reduce((acc, h) => acc + (h.precipitation || 0), 0) * 10) / 10;
  const maxRainProb24h = next24h.reduce((max, h) => Math.max(max, h.precipitationProbability || 0), 0);
  const maxWindSpeed24h = next24h.reduce((max, h) => Math.max(max, h.windSpeed || 0), 0);
  const minTempNext48h = daily.slice(0, 2).reduce((min, d) => Math.min(min, d.tempMin), 99);

  const crop = findCropById(cropId) || CROPS.find((c) => c.id === cropId) || CROPS[0];
  const stage = STAGES.find((s) => s.id === stageId) || STAGES[1];
  const cropName = language === "hi" ? crop.nameHi : crop.nameEn;
  const stageName = language === "hi" ? stage.nameHi : stage.nameEn;

  // Build card-specific data
  let modalTitle = "";
  let modalSubtitle = "";
  let statusBadgeText = "";
  let statusBadgeColor = "text-sky-700 bg-sky-50 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20";
  let explanationText = "";
  let actionPoints: string[] = [];
  let avoidPoints: string[] = [];
  let disclaimerText = "";
  let icon = <Sprout className="h-5 w-5" />;

  if (cardKey === "sowing_harvesting") {
    icon = <Layers className="h-5 w-5" />;
    modalTitle = language === "hi" ? "बुवाई एवं कटाई कृषि सलाह" : "Sowing & Harvesting Weather Advisory";
    modalSubtitle = `${cropName} (${stageName}) • ${cityName}`;

    const isRainHigh = sumPrecip24h >= 4 || maxRainProb24h >= 45;
    const isWindHigh = maxWindSpeed24h >= 22;

    if (isRainHigh) {
      statusBadgeText = language === "hi" ? "सावधानी: वर्षा की संभावना" : "Caution: Rain Expected";
      statusBadgeColor = "text-amber-700 bg-amber-50 border-amber-300 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30";
      explanationText =
        language === "hi"
          ? `अगले 24 घंटों में ${sumPrecip24h} मिमी वर्षा तथा ${maxRainProb24h}% तक वर्षा की संभावना है। गीले मौसम में कटी फसल को नुकसान और बीज विस्थापन का जोखिम हो सकता है।`
          : `Next 24 hours indicate ${sumPrecip24h} mm total rainfall with up to ${maxRainProb24h}% probability. Wet fields reduce operational feasibility for cutting and direct sowing.`;
      actionPoints =
        language === "hi"
          ? [
              "काटी गई फसल और दानों को तुरंत तिरपाल से सुरक्षित स्थान पर ढकें।",
              "खेत की मेड़ और जल निकासी नालियों को साफ रखें ताकि पानी जमा न हो।",
              "खेत सूखने तक नई बुवाई के लिए बीज बिखेरना स्थगित करें।",
            ]
          : [
              "Move cut crop and harvested bags to covered, elevated storage immediately.",
              "Ensure field drainage channels are clear to prevent waterlogging.",
              "Postpone open-field seed sowing until topsoil moisture stabilizes.",
            ];
      avoidPoints =
        language === "hi"
          ? ["गीले खेत में कटाई कार्य न करें।", "नमी वाले अनाज को बिना सुखाए बोरियों में न बांधें।"]
          : ["Avoid harvesting standing crops during active rain showers.", "Do not bag damp grain without proper sun drying."];
    } else if (isWindHigh) {
      statusBadgeText = language === "hi" ? "हवा की गति अधिक" : "Elevated Wind Speeds";
      statusBadgeColor = "text-amber-700 bg-amber-50 border-amber-300 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30";
      explanationText =
        language === "hi"
          ? `हवा की गति ${maxWindSpeed24h} km/h तक पहुंचने का अनुमान है। तेज हवा से खुले खलिहान में थ्रेशिंग और संवेदनशील फसलों में बीज बिखेरना प्रभावित हो सकता है।`
          : `Wind speeds may reach ${maxWindSpeed24h} km/h. High winds disrupt open-air threshing and uniform seed dispersal.`;
      actionPoints =
        language === "hi"
          ? ["थ्रेशिंग का कार्य हवा की दिशा देखकर सुरक्षित आड़ में करें।", "खेत में खड़ी लंबी फसलों को सहारा दें।"]
          : ["Perform threshing under sheltered wind-breaks.", "Inspect standing crops for lodging risk."];
      avoidPoints =
        language === "hi"
          ? ["तेज हवा में खुला अनाज न छोड़ें।"]
          : ["Avoid open field winnowing during peak wind gusts."];
    } else {
      statusBadgeText = language === "hi" ? "मौसम सामान्यतः अनुकूल" : "Favourable Weather Window";
      statusBadgeColor = "text-emerald-700 bg-emerald-50 border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30";
      explanationText =
        language === "hi"
          ? `अगले 24 घंटों में शुष्क और नियंत्रित मौसम (वर्षा संभावना मात्र ${maxRainProb24h}%, हवा ${current?.windSpeed || 0} km/h) रहने का अनुमान है।`
          : `Dry, stable atmospheric conditions (rain probability ${maxRainProb24h}%, wind ${current?.windSpeed || 0} km/h) are forecast over the next 24 hours.`;
      actionPoints =
        language === "hi"
          ? [
              "फसल कटाई, सुखाने और गहाई के लिए मौसम उपयुक्त है।",
              "मिट्टी में पर्याप्त गहराई पर नमी जांचकर बुवाई योजना आगे बढ़ाएं।",
            ]
          : [
              "Atmospheric window is suitable for harvesting, field curing, and threshing.",
              "Verify seedbed moisture depth before proceeding with regular sowing.",
            ];
      avoidPoints =
        language === "hi"
          ? ["अत्यधिक धूप में लंबे समय तक बीज को खुली धूप में न छोड़ें।"]
          : ["Avoid leaving unprotected seed bags under direct midday sun."];
    }

    disclaimerText =
      language === "hi"
        ? "मौसम-आधारित कृषि निर्णय सहायता; बीज अंकुरण एवं कटाई की पुष्टि खेत की वास्तविक मिट्टी और स्थानीय कृषि विज्ञान केंद्र (KVK) परामर्श पर निर्भर है।"
        : "Weather-based decision support; actual sowing depth and harvest moisture should be verified in-field.";
  } else if (cardKey === "soil_moisture") {
    icon = <Droplets className="h-5 w-5" />;
    modalTitle = language === "hi" ? "मिट्टी नमी एवं वाष्पोत्सर्जन" : "Soil Moisture & Water Loss Pressure";
    modalSubtitle = `${cropName} • ${cityName} (${stateName})`;

    const isDryWindyHot = (current?.temperature || 25) >= 33 && (current?.relativeHumidity || 50) <= 35;
    const isRecentRain = sumPrecip24h >= 2 || (current?.precipitation || 0) > 0;

    if (isRecentRain) {
      statusBadgeText = language === "hi" ? "प्राकृतिक वर्षा से नमी आपूर्ति" : "Natural Rain Replenishment";
      statusBadgeColor = "text-emerald-700 bg-emerald-50 border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30";
      explanationText =
        language === "hi"
          ? `हाल की वर्षा (${sumPrecip24h} मिमी) और ${current?.relativeHumidity || 0}% आर्द्रता के कारण सतही मिट्टी में नमी बनी रहने की संभावना है। तत्काल कृत्रिम सिंचाई की आवश्यकता कम है।`
          : `Recent rainfall (${sumPrecip24h} mm) and ${current?.relativeHumidity || 0}% humidity suggest adequate surface moisture. Supplemental irrigation urgency is low.`;
      actionPoints =
        language === "hi"
          ? [
              "सिंचाई स्थगित कर पानी व बिजली की बचत करें।",
              "खेत में पानी ठहरने न दें, जल निकासी नाली खुली रखें।",
            ]
          : [
              "Withhold unnecessary tube-well irrigation to conserve water and power.",
              "Ensure surface run-off paths remain unobstructed.",
            ];
      avoidPoints =
        language === "hi"
          ? ["गीली मिट्टी में भारी ट्रैक्टर चलाने से बचें ताकि जमीन सख्त न हो।"]
          : ["Avoid driving heavy machinery on wet fields to prevent soil compaction."];
    } else if (isDryWindyHot) {
      statusBadgeText = language === "hi" ? "तीव्र वाष्पीकरण दबाव" : "High Atmospheric Water Loss";
      statusBadgeColor = "text-amber-700 bg-amber-50 border-amber-300 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30";
      explanationText =
        language === "hi"
          ? `उच्च तापमान (${current?.temperature}°C), शुष्क हवा (${current?.relativeHumidity}% नमी) और हवा की गति (${current?.windSpeed} km/h) के कारण पत्तियों और मिट्टी से पानी तेजी से उड़ रहा है।`
          : `High temperature (${current?.temperature}°C), low humidity (${current?.relativeHumidity}%), and wind (${current?.windSpeed} km/h) create elevated evapotranspiration stress.`;
      actionPoints =
        language === "hi"
          ? [
              "यदि सिंचाई आवश्यक हो तो सुबह 9 बजे से पहले अथवा शाम को करें।",
              "मिट्टी की नमी जांचने के लिए 4-6 इंच गहराई पर मिट्टी की मुट्ठी बनाकर देखें।",
            ]
          : [
              "Schedule necessary irrigation strictly during early morning or evening.",
              "Check root-zone moisture at 4–6 inch depth before applying water.",
            ];
      avoidPoints =
        language === "hi"
          ? ["दोपहर 12 से 3 बजे के बीच तेज धूप में फव्वारा या सतही सिंचाई न करें।"]
          : ["Avoid midday overhead sprinkling to minimize evaporation waste."];
    } else {
      statusBadgeText = language === "hi" ? "संतुलित नमी दर" : "Moderate Moisture Dynamics";
      statusBadgeColor = "text-sky-700 bg-sky-50 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20";
      explanationText =
        language === "hi"
          ? `वर्तमान मौसम में तापमान ${current?.temperature || 0}°C और आर्द्रता ${current?.relativeHumidity || 0}% है। सामान्य रोस्टर के अनुसार आवश्यकतानुसार सिंचाई का प्रबंधन करें।`
          : `Current ambient metrics (${current?.temperature || 0}°C, ${current?.relativeHumidity || 0}% RH) reflect standard atmospheric water loss rates for ${cropName}.`;
      actionPoints =
        language === "hi"
          ? ["फसल की विकास अवस्था के अनुसार नियमित सिंचाई जारी रखें।"]
          : ["Follow normal crop-growth water schedule for your soil type."];
      avoidPoints =
        language === "hi"
          ? ["अनावश्यक अत्यधिक पानी देने से बचें।"]
          : ["Avoid over-irrigation that causes root water saturation."];
    }

    disclaimerText =
      language === "hi"
        ? "यह वायुमंडलीय मौसम चरों पर आधारित नमी व वाष्पोत्सर्जन संकेतक है, जमीन में लगे सेंसर का प्रत्यक्ष माप नहीं। वास्तविक सिंचाई का निर्णय खेत की मिट्टी देखकर लें।"
        : "Weather-derived atmospheric moisture pressure indicator, not a direct in-ground sensor measurement. Inspect physical soil before watering.";
  } else if (cardKey === "hail_frost") {
    icon = <CloudSnow className="h-5 w-5" />;
    modalTitle = language === "hi" ? "ओलावृष्टि एवं पाला पूर्व चेतावनी" : "Hail & Frost Weather Risk Check";
    modalSubtitle = `${cropName} • ${cityName}`;

    const isFrostRisk = minTempNext48h <= 4.5;
    const isThunderstormRisk = (current?.weatherCode || 0) >= 95 || hourly.slice(0, 24).some((h) => h.weatherCode >= 95);

    if (isFrostRisk) {
      statusBadgeText = language === "hi" ? "सतर्कता: पाला (शीतलहर) जोखिम" : "Caution: Frost Hazard Window";
      statusBadgeColor = "text-sky-700 bg-sky-100 border-sky-300 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-500/40";
      explanationText =
        language === "hi"
          ? `आगामी 48 घंटों में न्यूनतम तापमान लगभग ${minTempNext48h}°C तक गिरने का अनुमान है। 4°C से कम तापमान पर पाला पड़ने से संवेदनशील फसलों की पत्तियों को नुकसान हो सकता है।`
          : `Minimum forecast temperatures may dip near ${minTempNext48h}°C over the next 48 hours. Temperatures near or below 4°C increase ground frost hazard for sensitive crops.`;
      actionPoints =
        language === "hi"
          ? [
              "शाम के समय हल्की सिंचाई करें, जिससे खेत का तापमान 1-2°C बढ़ जाता है और पाले से सुरक्षा मिलती है।",
              "खेत की उत्तर-पश्चिम दिशा में शाम को धुआं करके तापमान स्थिर रखने का प्रयास करें।",
            ]
          : [
              "Apply light evening irrigation to maintain higher soil thermal inertia against frost.",
              "Create localized smoke along field borders facing cold wind drift during night.",
            ];
      avoidPoints =
        language === "hi"
          ? ["पाला पड़ने की आशंका के दौरान नाइट्रोजन खाद का अधिक छिड़काव न करें।"]
          : ["Avoid heavy nitrogen fertilizers during acute cold spells."];
    } else if (isThunderstormRisk) {
      statusBadgeText = language === "hi" ? "सतर्कता: आंधी-तूफान संकेत" : "Caution: Convective Storm Activity";
      statusBadgeColor = "text-amber-700 bg-amber-50 border-amber-300 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30";
      explanationText =
        language === "hi"
          ? `पूर्वानुमान में गरज-चमक युक्त संवहनीय बादलों (WMO कोड 95-99) का संकेत है। हालांकि सीधे ओले की भविष्यवाणी सीमित होती है, परंतु तेज हवा और आंधी से फसलों को नुकसान हो सकता है।`
          : `Convective thunderstorm conditions (WMO codes 95-99) detected in telemetry. While direct hail cannot be guaranteed by forecast models, strong downdrafts and squalls are possible.`;
      actionPoints =
        language === "hi"
          ? [
              "सब्जियों और नाजुक फसलों के मचान को तार या रस्सी से मजबूत करें।",
              "खेत में जल निकास नालियां खुली रखें।",
            ]
          : [
              "Secure horticultural stakes, trellises, and protective net tunnels.",
              "Keep drainage avenues clear for sudden cloudburst runoff.",
            ];
      avoidPoints =
        language === "hi"
          ? ["आंधी के दौरान कीटनाशक या उर्वरक छिड़काव बिल्कुल न करें।"]
          : ["Avoid all foliar spraying during convective wind spikes."];
    } else {
      statusBadgeText = language === "hi" ? "पाला / ओलावृष्टि का कोई संकेत नहीं" : "No Severe Frost / Hail Signals";
      statusBadgeColor = "text-emerald-700 bg-emerald-50 border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30";
      explanationText =
        language === "hi"
          ? `आगामी 48 घंटों में न्यूनतम तापमान लगभग ${minTempNext48h}°C रहेगा और गंभीर संवहनीय तूफान की संभावना नहीं है। पाला या ओले का कोई पूर्वानुमान संकेत नहीं मिला है।`
          : `Forecast minimum temperatures remain safe near ${minTempNext48h}°C with no convective storm codes detected. No meteorological signals of frost or hail.`;
      actionPoints =
        language === "hi"
          ? ["सामान्य कृषि कार्य और नियमित देखभाल बिना रुकावट जारी रखें।"]
          : ["Routine agricultural operations may proceed as scheduled."];
      avoidPoints =
        language === "hi"
          ? ["किसी आपातकालीन सुरक्षा उपाय की आवश्यकता नहीं है।"]
          : ["No emergency frost mitigation necessary under current forecast."];
    }

    disclaimerText =
      language === "hi"
        ? "ओलावृष्टि स्थानीयकृत घटना होती है जिसकी निश्चित पूर्व-सूचना संभव नहीं है। यह विश्लेषण ओपन-मेटियो के तापमान व संवहनीय मौसम कोड पर आधारित है, आधिकारिक आईएमडी चेतावनी नहीं।"
        : "Hail is a localized convective event with limited predictive lead time. This advisory is derived from Open-Meteo convective codes and temperatures, not an official IMD bulletin.";
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
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
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

        {/* Live Agricultural Telemetry Pill */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#060C12] p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <Radio className="h-3.5 w-3.5" />
              <span>
                {language === "hi" ? `${cityName} लाइव कृषि मेट्रिक्स` : `Live Farm Telemetry for ${cityName}`}
              </span>
            </span>
            <span className="text-[10px] text-slate-500 dark:text-[#7F91A3] font-mono">Open-Meteo</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="rounded-xl bg-white dark:bg-[#0B1219] p-2 border border-slate-100 dark:border-slate-800/80">
              <span className="text-[10px] text-slate-400 dark:text-[#7F91A3] block">Temp / Feels</span>
              <span className="font-bold text-sm text-slate-900 dark:text-[#F8FAFC]">
                {current ? Math.round(current.temperature) : "--"}°C / {current ? Math.round(current.apparentTemperature) : "--"}°C
              </span>
            </div>
            <div className="rounded-xl bg-white dark:bg-[#0B1219] p-2 border border-slate-100 dark:border-slate-800/80">
              <span className="text-[10px] text-slate-400 dark:text-[#7F91A3] block">24h Rain Prob</span>
              <span className="font-bold text-sm text-slate-900 dark:text-[#F8FAFC]">
                {maxRainProb24h}% ({sumPrecip24h} mm)
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
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              {language === "hi" ? "व्यावहारिक किसान परामर्श (What to do)" : "Recommended Field Actions"}
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
              {language === "hi" ? "सावधानी / क्या न करें (What to avoid)" : "Practices to Avoid"}
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

        {/* Truthful Agrometeorological Disclaimer */}
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
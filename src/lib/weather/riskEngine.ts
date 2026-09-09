import { NormalizedWeatherData } from "./types";
import {
  RiskAssessmentResult,
  WeatherRiskItem,
  RiskLevel,
} from "./riskTypes";

/**
 * Deterministic weather risk assessment engine.
 * Converts live normalized forecast parameters into objective, non-official risk indicators.
 * Strictly non-official: Never uses IMD warning tiers, panic language, or fabricated hazards.
 */
export function evaluateWeatherRisks(
  weather: NormalizedWeatherData | null
): RiskAssessmentResult {
  if (!weather || !weather.current) {
    return {
      overallLevel: "LOW",
      risks: [],
      hasSignificantRisk: false,
      evaluatedAt: new Date().toISOString(),
    };
  }

  const { current, hourly, daily } = weather;
  const next24h = hourly.slice(0, 24);
  const risks: WeatherRiskItem[] = [];

  // --- 1. HEAVY PRECIPITATION EVALUATION ---
  const sumPrecip24h = next24h.reduce(
    (sum, h) => sum + (h.precipitation || 0),
    0
  );
  const maxRainProb24h = next24h.reduce(
    (max, h) => Math.max(max, h.precipitationProbability || 0),
    0
  );
  const currentPrecip = current.precipitation || current.rain || 0;

  if (sumPrecip24h >= 15 || maxRainProb24h >= 70 || currentPrecip >= 4) {
    risks.push({
      id: "precip-high",
      category: "precipitation",
      level: "HIGH",
      titleEn: "Heavy Precipitation Indicator",
      titleHi: "भारी वर्षा संकेतक",
      timeframeEn: "Next 12–24 Hours",
      timeframeHi: "अगले 12–24 घंटे",
      underlyingValueEn: `Forecast: ${Math.round(sumPrecip24h * 10) / 10} mm rain sum (${maxRainProb24h}% max probability)`,
      underlyingValueHi: `पूर्वानुमान: ${Math.round(sumPrecip24h * 10) / 10} मिमी कुल वर्षा (${maxRainProb24h}% अधिकतम संभावना)`,
      impactEn: "Localized water accumulation on roads, slower traffic movement, and temporary waterlogging in low-elevation points.",
      impactHi: "सड़कों पर जलभराव, धीमा यातायात एवं निचले इलाकों में पानी जमा होने की संभावना।",
      actionEn: "Allow additional travel time, avoid waterlogged underpasses, and ensure household drains remain unobstructed.",
      actionHi: "यात्रा में अतिरिक्त समय लेकर चलें, जलभराव वाले रास्तों से बचें एवं घर के आसपास नालियों की निकासी सुनिश्चित करें।",
      iconName: "CloudRain",
    });
  } else if (sumPrecip24h >= 5 || maxRainProb24h >= 40 || currentPrecip >= 1) {
    risks.push({
      id: "precip-mod",
      category: "precipitation",
      level: "MODERATE",
      titleEn: "Moderate Precipitation Indicator",
      titleHi: "मध्यम वर्षा संकेतक",
      timeframeEn: "Upcoming 24 Hours",
      timeframeHi: "आगामी 24 घंटे",
      underlyingValueEn: `Forecast: ${Math.round(sumPrecip24h * 10) / 10} mm rain (${maxRainProb24h}% probability)`,
      underlyingValueHi: `पूर्वानुमान: ${Math.round(sumPrecip24h * 10) / 10} मिमी वर्षा (${maxRainProb24h}% संभावना)`,
      impactEn: "Wet driving conditions and occasional passing showers during commute hours.",
      impactHi: "सड़कों पर फिसलन एवं आवागमन के दौरान रुक-रुक कर बौछारें पड़ने की संभावना।",
      actionEn: "Keep an umbrella on hand and maintain safe braking distances on slick road surfaces.",
      actionHi: "छाता साथ रखें एवं दोपहिया व चारपहिया वाहन चलाते समय उचित दूरी बनाए रखें।",
      iconName: "CloudDrizzle",
    });
  }

  // --- 2. VERY HIGH TEMPERATURE EVALUATION ---
  const currentTemp = current.temperature;
  const apparentTemp = current.apparentTemperature;
  const todayMax = daily[0]?.tempMax ?? currentTemp;

  if (currentTemp >= 38 || apparentTemp >= 41 || todayMax >= 40) {
    risks.push({
      id: "heat-high",
      category: "heat",
      level: "HIGH",
      titleEn: "Elevated Heat Stress Indicator",
      titleHi: "उच्च तापमान तनाव संकेतक",
      timeframeEn: "Midday & Afternoon Hours (12:00 PM – 4:00 PM)",
      timeframeHi: "दोपहर के समय (12:00 बजे से 4:00 बजे तक)",
      underlyingValueEn: `Forecast: ${todayMax}°C expected peak (Current feels like ${apparentTemp}°C)`,
      underlyingValueHi: `पूर्वानुमान: ${todayMax}°C अधिकतम अनुमानित (अनुभूत तापमान ${apparentTemp}°C)`,
      impactEn: "High thermal strain, risk of dehydration, and increased heat fatigue during outdoor physical exertion.",
      impactHi: "तीव्र गर्मी, निर्जलीकरण (डिहाइड्रेशन) एवं अधिक देर धूप में रहने से थकान का जोखिम।",
      actionEn: "Avoid unnecessary direct sun exposure between 12:00 PM and 3:30 PM, hydrate regularly with water, and wear breathable cotton clothing.",
      actionHi: "दोपहर 12:00 से 3:30 बजे के बीच सीधी धूप से बचें, पर्याप्त जल सेवन करें एवं हल्के सूती वस्त्र पहनें।",
      iconName: "Sun",
    });
  } else if (currentTemp >= 35 || apparentTemp >= 38 || todayMax >= 36) {
    risks.push({
      id: "heat-mod",
      category: "heat",
      level: "MODERATE",
      titleEn: "Moderate Thermal Index Indicator",
      titleHi: "मध्यम तापमान संकेतक",
      timeframeEn: "Afternoon Hours",
      timeframeHi: "दोपहर के समय",
      underlyingValueEn: `Forecast: ${todayMax}°C peak (Feels like ${apparentTemp}°C)`,
      underlyingValueHi: `पूर्वानुमान: ${todayMax}°C अधिकतम (अनुभूत ${apparentTemp}°C)`,
      impactEn: "Warm conditions causing elevated sweating and discomfort during sustained outdoor movement.",
      impactHi: "गर्म मौसम के कारण पसीना आना एवं बाहरी आवागमन में असहजता।",
      actionEn: "Carry water when traveling, seek shaded transit corridors, and check on elderly family members.",
      actionHi: "यात्रा के दौरान पीने का पानी साथ रखें एवं छायादार मार्गों का उपयोग करें।",
      iconName: "SunMedium",
    });
  }

  // --- 3. STRONG WIND / GUSTS EVALUATION ---
  const currentWind = current.windSpeed;
  const currentGusts = current.windGusts;
  const maxWind24h = next24h.reduce(
    (max, h) => Math.max(max, h.windSpeed || 0),
    0
  );
  const maxGusts24h = next24h.reduce(
    (max, h) => Math.max(max, h.windGusts || 0),
    0
  );

  if (currentWind >= 35 || currentGusts >= 50 || maxWind24h >= 35) {
    risks.push({
      id: "wind-high",
      category: "wind",
      level: "HIGH",
      titleEn: "Strong Wind & Gusts Indicator",
      titleHi: "तीव्र पवन एवं झोंके संकेतक",
      timeframeEn: "Current & Next 12 Hours",
      timeframeHi: "वर्तमान एवं अगले 12 घंटे",
      underlyingValueEn: `Forecast: ${currentWind} km/h wind (Gusts up to ${currentGusts} km/h)`,
      underlyingValueHi: `पूर्वानुमान: ${currentWind} km/h हवा (झोंके ${currentGusts} km/h तक)`,
      impactEn: "Displacement of unsecured lightweight objects, difficulty handling two-wheelers on open flyovers, and minor branch shedding.",
      impactHi: "खुले में रखी हल्की वस्तुओं का उड़ना, फ्लाईओवरों पर दोपहिया वाहनों का डगमगाना एवं पेड़ों की छोटी शाखाएं गिरना।",
      actionEn: "Secure outdoor balcony furniture and flower pots, reduce two-wheeler speeds on open bridges, and park away from unstable hoardings.",
      actionHi: "बालकनी में रखी हल्की वस्तुएं बांधकर रखें, पुलों पर वाहन की गति नियंत्रित रखें एवं होर्डिंग्स के नीचे वाहन न खड़ा करें।",
      iconName: "Wind",
    });
  } else if (currentWind >= 22 || currentGusts >= 35 || maxWind24h >= 22) {
    risks.push({
      id: "wind-mod",
      category: "wind",
      level: "MODERATE",
      titleEn: "Breezy / Moderate Wind Indicator",
      titleHi: "मध्यम तेज हवा संकेतक",
      timeframeEn: "Next 12–24 Hours",
      timeframeHi: "अगले 12–24 घंटे",
      underlyingValueEn: `Forecast: ${currentWind} km/h (Peak gusts ${currentGusts} km/h)`,
      underlyingValueHi: `पूर्वानुमान: ${currentWind} km/h (झोंके ${currentGusts} km/h)`,
      impactEn: "Noticeable breeze that may affect tall banners and outdoor drying clothes.",
      impactHi: "तेज हवा का झोंका जो सुखाए गए कपड़ों और बैनरों को प्रभावित कर सकता है।",
      actionEn: "Ensure clotheslines are clamped and outdoor lightweight items are kept orderly.",
      actionHi: "सुखाए गए कपड़ों पर चिमटी लगाएं एवं बाहरी सामान व्यवस्थित रखें।",
      iconName: "Wind",
    });
  }

  // --- 4. THUNDERSTORM EVALUATION (STRICT TO WMO 95, 96, 99 ONLY) ---
  const currentIsThunder = [95, 96, 99].includes(current.weatherCode);
  const hourlyThunderMatch = next24h.find((h) =>
    [95, 96, 99].includes(h.weatherCode)
  );
  const thunderCode = currentIsThunder
    ? current.weatherCode
    : hourlyThunderMatch?.weatherCode;

  if (thunderCode) {
    const isSevereHail = thunderCode === 96 || thunderCode === 99;
    risks.push({
      id: "thunder-active",
      category: "thunderstorm",
      level: isSevereHail ? "HIGH" : "MODERATE",
      titleEn: isSevereHail
        ? "Thunderstorm with Hail Indicator"
        : "Convective Thunderstorm Indicator",
      titleHi: isSevereHail
        ? "ओलावृष्टि युक्त आंधी संकेतक"
        : "गरज-चमक युक्त आंधी संकेतक",
      timeframeEn: currentIsThunder ? "Immediate & Near-term" : "Expected in Upcoming Hours",
      timeframeHi: currentIsThunder ? "वर्तमान एवं निकटतम समय" : "आगामी घंटों में अनुमानित",
      underlyingValueEn: `Detected WMO Weather Code #${thunderCode} (${isSevereHail ? "Hail possible" : "Lightning & thunder"})`,
      underlyingValueHi: `सत्यापित WMO कोड #${thunderCode} (${isSevereHail ? "ओलावृष्टि संभावित" : "गरज-चमक की संभावना"})`,
      impactEn: "Brief intense showers, localized lightning discharges, and sudden short-lived wind gusts.",
      impactHi: "अल्पकालिक तेज बौछारें, आकाशीय बिजली एवं अचानक तेज हवा के झोंके।",
      actionEn: "Seek substantial indoor shelter during lightning activity, avoid standing under isolated trees, and unplug sensitive electrical devices.",
      actionHi: "गरज-चमक के समय पक्के मकान में शरण लें, अकेले पेड़ों के नीचे न खड़े हों एवं संवेदनशील विद्युत उपकरण अनप्लग करें।",
      iconName: "CloudLightning",
    });
  }

  // Determine overall severity
  const hasHigh = risks.some((r) => r.level === "HIGH");
  const hasModerate = risks.some((r) => r.level === "MODERATE");
  const overallLevel: RiskLevel = hasHigh ? "HIGH" : hasModerate ? "MODERATE" : "LOW";
  const hasSignificantRisk = risks.length > 0;

  return {
    overallLevel,
    risks,
    hasSignificantRisk,
    evaluatedAt: new Date().toISOString(),
  };
}

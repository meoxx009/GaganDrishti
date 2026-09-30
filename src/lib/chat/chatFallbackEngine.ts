import { Language, City } from "@/lib/types";
import { NormalizedWeatherData } from "@/lib/weather/types";
import { CropId, StageId, CROPS } from "@/lib/weather/farmerTypes";
import { evaluateFarmerWeatherAdvisory } from "@/lib/weather/farmerDecisionEngine";
import { interpretWMOCode } from "@/lib/weather/wmo";
import { detectQueryLanguage } from "./languageDetector";
import { extractCropFromQuery } from "@/lib/crops";
import { parseWeatherIntentAndSlots } from "./intentParser";
import { computeDeterministicWeatherAnswer } from "./weatherAnswerEngine";
import { ChatHistoryItem } from "./types";

export function getDeterministicFallbackReply(
  query: string,
  language: Language,
  city: City,
  weather: NormalizedWeatherData | null,
  cropId?: CropId,
  stageId?: StageId,
  history?: ChatHistoryItem[]
): string {
  const q = query.toLowerCase().trim();
  const detected = detectQueryLanguage(query);

  // Parse semantic intent and slots
  const parsedIntent = parseWeatherIntentAndSlots(query, history);

  // Handle specialized temporal/timing queries deterministically
  if (
    weather &&
    (parsedIntent.intent === "rain_timing" ||
      parsedIntent.intent === "temperature_timing" ||
      parsedIntent.intent === "multi_day_summary" ||
      (parsedIntent.timeSlot.dayOffset > 0 && detected === "hinglish") ||
      (parsedIntent.intent === "general_summary" && detected === "hinglish"))
  ) {
    const computed = computeDeterministicWeatherAnswer(
      parsedIntent,
      city,
      weather,
      detected,
      cropId
    );
    return computed.reply;
  }

  const isMarathi = detected === "mr" || language === "mr";
  const isHindi = !isMarathi && (detected === "hi" || detected === "hinglish" || language === "hi");
  const cityName = isMarathi ? (city.nameMr || city.nameHi) : isHindi ? city.nameHi : city.nameEn;

  // Check if weather data exists
  if (!weather || !weather.current) {
    if (isMarathi) {
      return `${cityName} साठी थेट हवामान डेटा सध्या उपलब्ध नाही. कृपया नेटवर्क कनेक्शन तपासा किंवा काही वेळाने पुन्हा प्रयत्न करा.`;
    }
    if (isHindi) {
      return `${cityName} के लिए वर्तमान मौसम डेटा उपलब्ध नहीं है। कृपया नेटवर्क कनेक्शन की जांच करें या थोड़ी देर बाद पुनः प्रयास करें।`;
    }
    return `Reliable live weather data is currently unavailable for ${cityName}. Please check your connection or refresh the telemetry.`;
  }

  const { current, hourly, daily } = weather;
  const next24h = hourly.slice(0, 24);
  const sumPrecip24h = Math.round(next24h.reduce((s, h) => s + (h.precipitation || 0), 0) * 10) / 10;
  const maxRainProb24h = next24h.reduce((m, h) => Math.max(m, h.precipitationProbability || 0), 0);
  const tomorrowDaily = daily[1];
  const hasThunderstormNow = [95, 96, 99].includes(current.weatherCode);

  // Crop entity extraction from query or fallback
  const identifiedCrop = extractCropFromQuery(query);
  const effectiveCropId: CropId = (identifiedCrop?.id as CropId) || cropId || "wheat";
  const effectiveCropNameHi = identifiedCrop ? identifiedCrop.nameHi : (cropId ? CROPS.find(c => c.id === cropId)?.nameHi || "फसल" : "फसल");
  const effectiveCropNameEn = identifiedCrop ? identifiedCrop.nameEn : (cropId ? CROPS.find(c => c.id === cropId)?.nameEn || "Crops" : "Crops");

  // Near-term 4-5 hours progression
  const next5h = hourly.slice(0, 5);
  const maxRainProb5h = next5h.reduce((m, h) => Math.max(m, h.precipitationProbability || 0), 0);
  const minRainProb5h = next5h.reduce((m, h) => Math.min(m, h.precipitationProbability || 0), 100);
  const sumPrecip5h = Math.round(next5h.reduce((s, h) => s + (h.precipitation || 0), 0) * 10) / 10;
  const maxWind5h = next5h.reduce((m, h) => Math.max(m, h.windSpeed || 0), 0);

  // Multi-day 5-day precipitation telemetry
  const next5Days = daily.slice(0, 5);
  const sumPrecip5d = Math.round(next5Days.reduce((s, d) => s + (d.precipitationSum || 0), 0) * 10) / 10;
  const peakRainDay = next5Days.reduce((prev, curr) => ((curr.precipitationSum || 0) > (prev.precipitationSum || 0) ? curr : prev), next5Days[0]);
  const peakRainAmount = peakRainDay ? Math.round((peakRainDay.precipitationSum || 0) * 10) / 10 : 0;
  const peakRainProb = peakRainDay ? (peakRainDay.precipitationProbabilityMax || 0) : 0;
  const peakRainDate = peakRainDay?.date ? new Date(peakRainDay.date).toLocaleDateString(isHindi ? "hi-IN" : "en-US", { weekday: "short", day: "numeric", month: "short" }) : "आगामी दिन";

  // 0A. App Intelligence & Feature Knowledge Base
  if (
    q.includes("gagandrishti") ||
    q.includes("गगनदृष्टि") ||
    q.includes("app kya hai") ||
    q.includes("ऐप क्या है") ||
    q.includes("what is this app") ||
    q.includes("features") ||
    q.includes("feature") ||
    q.includes("मदद") ||
    q.includes("help") ||
    q.includes("kya kar sakte") ||
    q.includes("क्या कर सकते")
  ) {
    if (isHindi) {
      return `🛰️ **गगनदृष्टि (GaganDrishti) मौसम आसूचना प्रणाली:**
गगनदृष्टि नागरिकों एवं किसानों के लिए एक उन्नत द्विभाषी मौसम प्लेटफ़ॉर्म है।
• **नागरिक डैशबोर्ड (Citizen):** 12 घंटे का प्रति घंटा पूर्वानुमान, 5 दिवसीय आउटलुक, धूप, ठंड, गर्मी व यातायात परामर्श।
• **किसान परामर्श (Farmer):** फसल-वार (गेहूँ, धान, कपास आदि) सिंचाई, कीटनाशक स्प्रे, बुवाई व कटाई मौसम खिड़की।
• **मौसम जोखिम मानचित्र (Risk Map):** मध्य प्रदेश व प्रमुख शहरों के लिए लाइव रंग-कोडित जोखिम (लाल/नारंगी/पीला/हरा) स्तर।
• **यात्रा मौसम (Travel Weather):** दो शहरों के बीच वास्तविक समय मौसम और वाहन (बाइक/कार) अनुकूलता जाँच।`;
    }
    return `🛰️ **GaganDrishti Weather Intelligence Platform:**
GaganDrishti is an advanced bilingual weather intelligence system for citizens and farmers.
• **Citizen Dashboard:** 12-hour hourly telemetry, 5-day outlook, sunshine, thermal stress, and commute guidance.
• **Farmer Advisory:** Crop-stage specific guidance for irrigation windows, chemical spraying, sowing, and harvest.
• **Weather Risk Map:** Live color-coded meteorological risk tiers (Red/Orange/Yellow/Green) across cities.
• **Point-to-Point Travel:** Route weather evaluation and vehicle (bike vs car) suitability analysis.`;
  }

  // 0B. General Weather / Today's Weather / "आज मौसम कैसा है?" / "मौसम बताओ"
  const isGeneralWeatherQuery =
    (q.includes("मौसम") && (q.includes("कैसा") || q.includes("बताओ") || q.includes("जानकारी") || q.includes("अपडेट") || q.includes("kaisa") || q.includes("batao") || q.includes("aaj"))) ||
    (q.includes("weather") && (q.includes("how") || q.includes("today") || q.includes("tell") || q.includes("what") || q.includes("forecast") || q.includes("current") || q.includes("status"))) ||
    q.includes("aaj ka mausam") ||
    q.includes("aaj mausam") ||
    q.includes("आज का मौसम") ||
    q.includes("आज मौसम") ||
    q.includes("कैसा मौसम");

  if (isGeneralWeatherQuery && !q.includes("कल") && !q.includes("tomorrow") && !q.includes("रात") && !q.includes("tonight")) {
    const maxT = daily[0]?.tempMax ?? current.temperature;
    const minT = daily[0]?.tempMin ?? current.temperature;
    const condHi = current.conditionHi || "सामान्य";
    const condEn = current.conditionEn || "Fair";

    if (isHindi) {
      return `🌤️ **आज ${cityName} में मौसम का हाल:**
• **वर्तमान स्थिति:** ${condHi}, तापमान **${current.temperature}°C** (अनुभूत ${current.apparentTemperature}°C)
• **आज का तापमान:** अधिकतम **${maxT}°C** | न्यूनतम **${minT}°C**
• **वर्षा की संभावना:** **${maxRainProb24h}%** ${sumPrecip24h > 0 ? `(अनुमानित वर्षा ${sumPrecip24h} मिमी)` : "(भारी वर्षा की संभावना कम)"}
• **हवा:** **${current.windSpeed} km/h** (झोंके ${current.windGusts} km/h तक), नमी **${current.relativeHumidity}%**
दिन की गतिविधियों के लिए मौसम सामान्यतः ${maxRainProb24h >= 50 ? "नमीयुक्त/वर्षा प्रभावित" : "अनुकूल"} है।`;
    }
    return `🌤️ **Today's Weather Outlook for ${cityName}:**
• **Current Condition:** ${condEn}, Temperature **${current.temperature}°C** (feels like ${current.apparentTemperature}°C)
• **Today's Range:** High **${maxT}°C** | Low **${minT}°C**
• **Rain Probability:** **${maxRainProb24h}%** ${sumPrecip24h > 0 ? `(${sumPrecip24h} mm expected)` : "(low rain risk)"}
• **Wind & Humidity:** **${current.windSpeed} km/h** winds (gusts up to ${current.windGusts} km/h), Humidity **${current.relativeHumidity}%**
Conditions are generally ${maxRainProb24h >= 50 ? "unsettled with rain potential" : "favourable for regular activities"}.`;
  }

  // 1. Transport Mode & Commute Suitability (Bike / Scooter vs Car)
  if (
    q.includes("bike") ||
    q.includes("scooter") ||
    q.includes("motorcycle") ||
    q.includes("two wheeler") ||
    q.includes("car se") ||
    q.includes("गाड़ी") ||
    q.includes("सड़क") ||
    q.includes("drive")
  ) {
    if (hasThunderstormNow || current.windGusts >= 42 || current.precipitation >= 5 || maxRainProb24h >= 75) {
      if (isHindi) {
        return `🛵 **सवारी/यातायात परामर्श (${cityName}):**
वर्तमान में मौसम प्रतिकूल है (वर्षा संभावना ${maxRainProb24h}%, हवा के झोंके ${current.windGusts} km/h${hasThunderstormNow ? ", गर्जन/आंधी" : ""})।
• **दुपहिया (Bike/Scooter):** असुरक्षित — खुले मार्ग पर आंधी/फिसलन का जोखिम है, यात्रा टालना बेहतर है।
• **चौपहिया (Car/Bus):** यदि आवश्यक हो तो हेडलाइट व वाइपर चालू रखकर धीमी गति से चलें।`;
      }
      return `🛵 **Commute Weather Guidance (${cityName}):**
Current atmospheric conditions are adverse (${maxRainProb24h}% rain chance, gusts ${current.windGusts} km/h${hasThunderstormNow ? ", thunderstorm" : ""}).
• **Two-Wheeler:** Not recommended due to wind destabilization and slippery roads.
• **Car/Bus:** Proceed with caution; maintain defogger and extra stopping distance.`;
    } else if (maxRainProb24h >= 35 || current.precipitation > 0) {
      if (isHindi) {
        return `🛵 **सवारी/यातायात परामर्श (${cityName}):**
${cityName} में हल्की से मध्यम वर्षा की संभावना (${maxRainProb24h}%) है।
• **दुपहिया:** सावधानी आवश्यक — वाटरप्रूफ रेनकोट व वाइज़र वाला हेलमेट पहनें और गति धीमी रखें।
• **कार/बस:** अनुकूल, सामान्य सावधानी के साथ यात्रा कर सकते हैं।`;
      }
      return `🛵 **Commute Weather Guidance (${cityName}):**
Passing rain is possible in ${cityName} (${maxRainProb24h}% probability).
• **Two-Wheeler:** Caution advised; wear rain gear, clear visor helmet, and avoid sudden braking.
• **Car/Bus:** Favourable for commuting with normal caution.`;
    } else {
      if (isHindi) {
        return `🛵 **सवारी/यातायात परामर्श (${cityName}):**
वर्तमान में मौसम शांत एवं अनुकूल है (तापमान ${current.temperature}°C, हवा ${current.windSpeed} km/h, वर्षा जोखिम नगण्य)।
दुपहिया एवं कार दोनों के लिए मार्ग सामान्य रूप से अनुकूल है। हेलमेट पहनें और यातायात नियमों का पालन करें।`;
      }
      return `🛵 **Commute Weather Guidance (${cityName}):**
Weather is calm and clear (${current.temperature}°C, wind ${current.windSpeed} km/h, negligible rain risk).
Both two-wheeler and four-wheeler travel are favourable.`;
    }
  }

  // 2. Tonight / Evening Weather
  if (
    q.includes("tonight") ||
    q.includes("आज रात") ||
    q.includes("रात में") ||
    q.includes("रात को") ||
    q.includes("aaj raat") ||
    q.includes("raat ka mausam")
  ) {
    const eveningHours = hourly.slice(0, 12);
    const nightRainMax = eveningHours.reduce((m, h) => Math.max(m, h.precipitationProbability || 0), 0);
    const minNightTemp = daily[0]?.tempMin ?? Math.round(current.temperature - 4);
    if (isHindi) {
      return `🌙 **आज रात का मौसम (${cityName}):**
रात में न्यूनतम तापमान लगभग ${minNightTemp}°C तक रहने की संभावना है। वर्षा की संभावना ${nightRainMax}% है। ${
        nightRainMax >= 40
          ? "रात में बूंदाबांदी या हल्की वर्षा संभव है।"
          : "रात में मौसम सामान्यतः शांत रहने का अनुमान है।"
      }`;
    }
    return `🌙 **Tonight's Weather (${cityName}):**
Expected overnight low is around ${minNightTemp}°C with a ${nightRainMax}% rain probability. Conditions are expected to remain ${
      nightRainMax >= 40 ? "damp with passing showers" : "generally calm"
    }.`;
  }

  // 3. Sunshine / Sunny / Dhoop / Clear Skies
  if (
    q.includes("धूप") ||
    q.includes("dhoop") ||
    q.includes("sunshine") ||
    q.includes("sunny") ||
    q.includes("clear sky") ||
    q.includes("khula") ||
    q.includes("आसमान")
  ) {
    const cloud = current.cloudCover;
    if (cloud <= 25) {
      if (isHindi) {
        return `☀️ **धूप की स्थिति (${cityName}):**
वर्तमान में आसमान मुख्य रूप से साफ है (बादल आवरण मात्र ${cloud}%)। दिन में अच्छी धूप खिली रहने की संभावना है। दोपहर में तापमान ${daily[0]?.tempMax ?? current.temperature}°C तक जा सकता है।`;
      }
      return `☀️ **Sunshine Forecast (${cityName}):**
Skies are predominantly clear (${cloud}% cloud cover). Expect abundant sunshine through the day with highs around ${daily[0]?.tempMax ?? current.temperature}°C.`;
    } else if (cloud <= 70) {
      if (isHindi) {
        return `⛅ **धूप की स्थिति (${cityName}):**
वर्तमान में आंशिक बादल छाए हुए हैं (बादल आवरण ${cloud}%)। दिन में बीच-बीच में धूप और बादलों की आवाजाही बनी रहेगी।`;
      }
      return `⛅ **Sunshine Forecast (${cityName}):**
Partly cloudy skies (${cloud}% cloud cover). Expect intermittent sunshine with passing cloud patches.`;
    } else {
      if (isHindi) {
        return `☁️ **धूप की स्थिति (${cityName}):**
घने बादल छाए हुए हैं (बादल आवरण ${cloud}%)। धूप निकलने की संभावना कम है और मौसम बादलयुक्त बना रहेगा।`;
      }
      return `☁️ **Sunshine Forecast (${cityName}):**
Overcast skies (${cloud}% cloud cover). Direct sunshine will be limited today.`;
    }
  }

  // 4. Cold / Thand / Sardi
  if (
    q.includes("ठंड") ||
    q.includes("thand") ||
    q.includes("sardi") ||
    q.includes("cold") ||
    q.includes("chilly") ||
    q.includes("winter")
  ) {
    const isCold = current.temperature <= 16;
    const isMild = current.temperature > 16 && current.temperature <= 22;
    if (isHindi) {
      return `❄️ **ठंड की स्थिति (${cityName}):**
वर्तमान तापमान ${current.temperature}°C है (अनुभूत ${current.apparentTemperature}°C) और आज का न्यूनतम तापमान ${daily[0]?.tempMin ?? "N/A"}°C रहने का अनुमान है। ${
        isCold
          ? "मौसम काफी ठंडा है; सुबह-शाम गर्म कपड़े अवश्य पहनें।"
          : isMild
          ? "हल्की ठंडक महसूस हो सकती है, विशेषकर रात और तड़के।"
          : "वर्तमान में ठंड का प्रभाव नहीं है, तापमान सामान्य से गर्म है।"
      }`;
    }
    return `❄️ **Cold / Thermal Profile (${cityName}):**
Current temperature is ${current.temperature}°C (feels like ${current.apparentTemperature}°C) with an expected low of ${daily[0]?.tempMin ?? "N/A"}°C. ${
      isCold ? "Conditions are noticeably chilly; wear warm layers." : "No significant cold stress currently."
    }`;
  }

  // 5. Heat / Garmi / Loo / Heatwave
  if (
    q.includes("गर्मी") ||
    q.includes("garmi") ||
    q.includes("hot") ||
    q.includes("heat") ||
    q.includes("loo") ||
    q.includes("लू") ||
    q.includes("heatwave")
  ) {
    const isHot = current.temperature >= 36;
    if (isHindi) {
      return `🔥 **गर्मी का स्तर (${cityName}):**
वर्तमान तापमान ${current.temperature}°C (अनुभूत ${current.apparentTemperature}°C) है। आज का अधिकतम तापमान ${daily[0]?.tempMax ?? current.temperature}°C तक पहुंचने का अनुमान है। ${
        isHot
          ? "गर्मी का प्रभाव तेज है; दोपहर 12 से 3 बजे तक सीधी धूप से बचें और पर्याप्त पानी पिएं।"
          : "वर्तमान में अत्यधिक लू की स्थिति नहीं है।"
      }`;
    }
    return `🔥 **Thermal / Heatwave Assessment (${cityName}):**
Current temperature is ${current.temperature}°C (feels like ${current.apparentTemperature}°C) with a projected peak of ${daily[0]?.tempMax ?? current.temperature}°C. ${
      isHot ? "Elevated heat stress; remain hydrated and avoid mid-day sun." : "Thermal levels are within seasonal bounds."
    }`;
  }

  // 6. Umbrella / Chaata
  if (
    q.includes("छाता") ||
    q.includes("chata") ||
    q.includes("chaata") ||
    q.includes("umbrella") ||
    q.includes("रेनकोट") ||
    q.includes("raincoat")
  ) {
    const rainHigh = maxRainProb24h >= 35 || current.precipitation > 0;
    if (isHindi) {
      return `☂️ **छाता साथ रखने की सलाह (${cityName}):**
अगले 24 घंटों में वर्षा की अधिकतम संभावना ${maxRainProb24h}% है। ${
        rainHigh
          ? "हाँ, बाहर निकलते समय छाता या रेनकोट साथ रखना सुरक्षित और समझदारी भरा रहेगा।"
          : "वर्तमान में भारी बारिश की आशंका नहीं है, छाता अनिवार्य नहीं है।"
      }`;
    }
    return `☂️ **Umbrella Guidance (${cityName}):**
Maximum rain probability over the next 24 hours is ${maxRainProb24h}%. ${
      rainHigh
        ? "Yes, carrying an umbrella or light rain gear is recommended."
        : "Rain risk is currently low; an umbrella is not strictly necessary."
    }`;
  }

  // 7. Outdoor / Can I go outside?
  if (
    q.includes("बाहर जाना") ||
    q.includes("bahar jana") ||
    q.includes("outdoor") ||
    q.includes("go outside") ||
    q.includes("nikalna")
  ) {
    const safeToGo = !hasThunderstormNow && maxRainProb24h < 60 && current.windSpeed < 30;
    if (isHindi) {
      return `🚶 **बाहर निकलने की स्थिति (${cityName}):**
वर्तमान तापमान ${current.temperature}°C, हवा ${current.windSpeed} km/h, वर्षा संभावना ${maxRainProb24h}% है। ${
        safeToGo
          ? "बाहरी गतिविधियों और सामान्य आवागमन के लिए मौसम अनुकूल है।"
          : "मौसम में नमी/वर्षा का रुख है; सावधानी बरतें और मौसम अपडेट देखते रहें।"
      }`;
    }
    return `🚶 **Outdoor Suitability (${cityName}):**
Temperature is ${current.temperature}°C with ${current.windSpeed} km/h winds and ${maxRainProb24h}% rain chance. ${
      safeToGo ? "Atmospheric conditions are favourable for outdoor movement." : "Weather caution is recommended due to precipitation or wind signals."
    }`;
  }

  // 8. Farmer: Sowing & Harvesting (बुवाई व कटाई)
  if (
    q.includes("बुवाई") ||
    q.includes("कटाई") ||
    q.includes("buwai") ||
    q.includes("katai") ||
    q.includes("sowing") ||
    q.includes("harvest") ||
    q.includes("harvesting")
  ) {
    const twoDayRain = (daily[0]?.precipitationSum || 0) + (daily[1]?.precipitationSum || 0);
    const rainRisk = twoDayRain >= 8 || maxRainProb24h >= 50;
    if (isHindi) {
      return `🌾 **फसल बुवाई व कटाई परामर्श (${cityName}):**
अगले 48 घंटों में कुल अनुमानित वर्षा ${twoDayRain} मिमी (अधिकतम संभावना ${maxRainProb24h}%) है।
• **कटाई (Harvesting):** ${
        rainRisk
          ? "वर्षा जोखिम के कारण परिपक्व कटी फसल को भीगने से बचाने के लिए सुरक्षित स्थान पर ढकें।"
          : "मौसम अनुकूल है, कटाई का कार्य सामान्य रूप से आगे बढ़ा सकते हैं।"
      }
• **बुवाई (Sowing):** मिट्टी में पर्याप्त नमी देखकर ही बुवाई करें; भारी वर्षा से बीज बहने का ध्यान रखें।`;
    }
    return `🌾 **Sowing & Harvesting Guidance (${cityName}):**
Upcoming 48-hour precipitation is estimated at ${twoDayRain} mm (max probability ${maxRainProb24h}%).
• **Harvesting:** ${rainRisk ? "Rain risk detected; ensure harvested produce is protected under tarpaulins." : "Favourable dry window for harvest."}
• **Sowing:** Ensure optimal seedbed moisture before drill sowing.`;
  }

  // 9. Farmer: Frost & Hail (पाला व ओलावृष्टि)
  if (
    q.includes("पाला") ||
    q.includes("ओला") ||
    q.includes("ओलावृष्टि") ||
    q.includes("pala") ||
    q.includes("paala") ||
    q.includes("hail") ||
    q.includes("frost")
  ) {
    const minTemp = daily[0]?.tempMin ?? current.temperature;
    const hailCodes = [96, 99];
    const hailRisk = hailCodes.includes(current.weatherCode) || hailCodes.includes(daily[0]?.weatherCode ?? 0);
    const frostRisk = minTemp <= 4;
    if (isHindi) {
      return `⚠️ **पाला व ओलावृष्टि चेतावनी स्थिति (${cityName}):**
• **पाला (Frost):** न्यूनतम तापमान ${minTemp}°C है। पाला जोखिम: ${frostRisk ? "सक्रिय (हल्की सिंचाई से तापमान संतुलित रखें)" : "न्यूनतम/शून्य"}।
• **ओलावृष्टि (Hailstorm):** तीव्र संवहनीय ओला जोखिम: ${hailRisk ? "चेतावनी — रक्षक जाल या सुरक्षा उपाय अपनाएं" : "कोई सक्रिय संकेत नहीं"}।`;
    }
    return `⚠️ **Frost & Hail Assessment (${cityName}):**
• **Frost:** Projected minimum temperature is ${minTemp}°C. Risk tier: ${frostRisk ? "Active" : "Low / Nil"}.
• **Hail:** Severe convective hail signature: ${hailRisk ? "Warning signal" : "No active radar/forecast signal"}.`;
  }

  // 9A. Farmer: Spray Weather Suitability (रासायनिक/कीटनाशक छिड़काव)
  const isSprayQuery =
    q.includes("छिड़काव") ||
    q.includes("chhidkav") ||
    q.includes("chhidkaav") ||
    q.includes("chidkav") ||
    q.includes("spray") ||
    q.includes("स्प्रे") ||
    q.includes("कीटनाशक") ||
    q.includes("kitnashak") ||
    q.includes("dawa") ||
    q.includes("dawai") ||
    q.includes("dawaai") ||
    q.includes("fungicide") ||
    q.includes("weedicide") ||
    q.includes("pesticide");

  if (isSprayQuery) {
    const selectedStage = stageId || "growing";
    const decision = evaluateFarmerWeatherAdvisory(weather, effectiveCropId, selectedStage);
    const status = decision.sprayStatus;

    if (isHindi) {
      let statusBadge = "✅ छिड़काव के लिए अनुकूल मौसम (Favourable Window)";
      let statusSummary = `${effectiveCropNameHi} में रासायनिक छिड़काव के लिए वर्तमान मौसम सामान्यतः अनुकूल है।`;
      if (status === "AVOID DUE TO WEATHER") {
        statusBadge = "🛑 छिड़काव टालें (Avoid Spraying Today)";
        statusSummary = `वर्षा या प्रतिकूल मौसम परिस्थितियों के कारण आज ${effectiveCropNameHi} में छिड़काव टालना श्रेयस्कर है।`;
      } else if (status === "CAUTION") {
        statusBadge = "⚠️ सावधानी के साथ सीमित छिड़काव (Caution / Limited Window)";
        statusSummary = `हवा या वर्षा की सीमित आशंका को देखते हुए ${effectiveCropNameHi} में विशेष सावधानी बरतें।`;
      }

      return `🌿 **${effectiveCropNameHi} स्प्रे मौसम परामर्श (${cityName}):**

• **स्थिति:** ${statusBadge}
${statusSummary}

• **मौसम साक्ष्य (Weather Telemetry):**
- वर्षा की संभावना: **${maxRainProb24h}%** (वर्तमान वर्षा: ${current.precipitation} मिमी, 24 घंटे कुल: ${sumPrecip24h} मिमी)
- हवा की गति: **${current.windSpeed} km/h** (झोंके: **${current.windGusts} km/h**) — *आदर्श स्प्रे गति 5 से 15 km/h होती है; >15 km/h में दवा उड़ने का जोखिम रहता है।*
- सापेक्ष आर्द्रता: **${current.relativeHumidity}%** | तापमान: **${current.temperature}°C**

• **अगले 4–5 घंटों का रुख:**
अगले 4-5 घंटों में वर्षा की संभावना **${minRainProb5h}% से ${maxRainProb5h}%** के बीच रहने और हवा की अधिकतम गति **${maxWind5h} km/h** तक रहने का अनुमान है।

• **क्या करें (Recommendations):**
${
  status === "AVOID DUE TO WEATHER"
    ? "- मौसम साफ होने और पत्तियों से पानी सूखने की प्रतीक्षा करें।\n- खेत में जलभराव की स्थिति जांचें और जल निकासी नाली साफ रखें।"
    : "- हवा शांत रहने पर (प्रातःकाल अथवा देर दोपहर) ही स्प्रे करें।\n- यदि हल्की नमी की संभावना हो तो स्टिकर/स्प्रेडर का उपयोग कर सकते हैं।"
}

• **क्या न करें (Avoid):**
- वर्षा होने से 2-3 घंटे पहले या गीली पत्तियों पर छिड़काव न करें (दवा धुलने का जोखिम)।
- तेज हवा (>15 km/h) के समय स्प्रे न करें, इससे रसायन ड्रिफ्ट होकर फसल और पर्यावरण को नुकसान पहुँचाता है।
- किसी भी अप्रमाणित ब्रांड या अत्यधिक सांद्रता का प्रयोग न करें; स्थानीय कृषि विज्ञान केंद्र (KVK) की सलाह लें।`;
    }

    let statusBadge = "✅ Favourable Spray Window";
    let statusSummary = `Current meteorological conditions are generally favourable for field application on ${effectiveCropNameEn}.`;
    if (status === "AVOID DUE TO WEATHER") {
      statusBadge = "🛑 Avoid Spraying Today";
      statusSummary = `Chemical application on ${effectiveCropNameEn} should be deferred due to adverse precipitation or wind risks.`;
    } else if (status === "CAUTION") {
      statusBadge = "⚠️ Caution / Limited Spray Window";
      statusSummary = `Conditional window detected for ${effectiveCropNameEn}; observe localized wind drift closely.`;
    }

    return `🌿 **${effectiveCropNameEn} Spray Weather Advisory (${cityName}):**

• **Status:** ${statusBadge}
${statusSummary}

• **Weather Telemetry Evidence:**
- Rain Probability: **${maxRainProb24h}%** (Current: ${current.precipitation} mm, 24h sum: ${sumPrecip24h} mm)
- Wind Velocity: **${current.windSpeed} km/h** (Gusts: **${current.windGusts} km/h**) — *Optimal window: 5–15 km/h; >15 km/h increases drift risk.*
- Relative Humidity: **${current.relativeHumidity}%** | Temperature: **${current.temperature}°C**

• **Next 4–5 Hours Progression:**
Precipitation probability fluctuates between **${minRainProb5h}% and ${maxRainProb5h}%**, with maximum sustained wind speeds around **${maxWind5h} km/h**.

• **What to do:**
${
  status === "AVOID DUE TO WEATHER"
    ? "- Wait for stable dry conditions and dried canopy leaves before application.\n- Inspect field ditches to maintain proper drainage."
    : "- Schedule application during calm morning or late-afternoon hours.\n- Maintain calibrated nozzle pressure to reduce droplet drift."
}

• **What to avoid:**
- Never spray within 2–3 hours of expected rain or when leaves are soaked (wash-off risk).
- Avoid spraying when sustained winds exceed 15 km/h.
- Do not use unauthorized chemical mixtures; consult local KVK experts.`;
  }

  // 9B. Farmer: Irrigation Suitability (सिंचाई)
  const isIrrigationQuery =
    q.includes("सिंचाई") ||
    q.includes("sinchai") ||
    q.includes("irrigation") ||
    q.includes("पानी देना") ||
    q.includes("pani dena") ||
    q.includes("water crop") ||
    q.includes("water the crop");

  if (isIrrigationQuery) {
    const selectedStage = stageId || "growing";
    const decision = evaluateFarmerWeatherAdvisory(weather, effectiveCropId, selectedStage);
    const status = decision.irrigationStatus;

    if (isHindi) {
      let statusBadge = "✅ सिंचाई के लिए सामान्य खिड़की (Good Window)";
      let statusSummary = `${effectiveCropNameHi} में निर्धारित आवश्यकतानुसार सामान्य सिंचाई की जा सकती है।`;
      if (status === "AVOID DUE TO WEATHER") {
        statusBadge = "🛑 सिंचाई टालें (Avoid Irrigation)";
        statusSummary = `आगामी 24-48 घंटों में पर्याप्त वर्षा की संभावना है। कृत्रिम सिंचाई टालें ताकि खेत में जलभराव न हो।`;
      } else if (status === "CAUTION") {
        statusBadge = "⚠️ सीमित/हल्की सिंचाई (Caution / Controlled Window)";
        statusSummary = `मौसम में नमी और तापमान को देखते हुए केवल आवश्यकतानुसार हल्की सिंचाई करें।`;
      }

      return `💧 **${effectiveCropNameHi} सिंचाई मौसम परामर्श (${cityName}):**

• **स्थिति:** ${statusBadge}
${statusSummary}

• **मौसम साक्ष्य (Weather Telemetry):**
- वर्षा की संभावना: **${maxRainProb24h}%** (24 घंटे कुल: ${sumPrecip24h} मिमी, 48 घंटे वर्षा: ${Math.round(((daily[0]?.precipitationSum || 0) + (daily[1]?.precipitationSum || 0)) * 10) / 10} मिमी)
- वर्तमान तापमान: **${current.temperature}°C** (अधिकतम अनुमान: ${daily[0]?.tempMax ?? current.temperature}°C)
- सापेक्ष आर्द्रता: **${current.relativeHumidity}%**

• **अगले 24–48 घंटों का रुख:**
अगले 24 घंटों में अधिकतम वर्षा संभावना ${maxRainProb24h}% है। मिट्टी की ऊपरी सतह की नमी जांचकर ही ड्रिप अथवा स्प्रिंकलर चलाएं।

• **क्या करें (Recommendations):**
${
  status === "AVOID DUE TO WEATHER"
    ? "- सिंचाई पूर्णतः स्थगित रखें और खेत के निकास नालों को साफ रखें ताकि वर्षा जल जमा न हो।"
    : "- यदि मिट्टी में नमी कम हो तो शाम के समय हल्की सिंचाई करें जिससे वाष्पीकरण कम हो।"
}

• **क्या न करें (Avoid):**
- तेज धूप या दोपहर के समय भारी फ्लड इरिगेशन से बचें।
- भारी वर्षा के पूर्वानुमान के समय खेत में पानी का अतिरिक्त जमाव न होने दें।`;
    }

    let statusBadge = "✅ Favourable Irrigation Window";
    let statusSummary = `Routine scheduled irrigation may proceed for ${effectiveCropNameEn} based on low near-term rain signals.`;
    if (status === "AVOID DUE TO WEATHER") {
      statusBadge = "🛑 Avoid Irrigation";
      statusSummary = `Precipitation anticipated over next 24–48h. Suspend artificial watering to prevent waterlogging.`;
    } else if (status === "CAUTION") {
      statusBadge = "⚠️ Caution / Controlled Irrigation";
      statusSummary = `Manage irrigation carefully according to observed soil moisture levels.`;
    }

    return `💧 **${effectiveCropNameEn} Irrigation Advisory (${cityName}):**

• **Status:** ${statusBadge}
${statusSummary}

• **Weather Telemetry Evidence:**
- Rain Probability: **${maxRainProb24h}%** (24h sum: ${sumPrecip24h} mm, 48h rain: ${Math.round(((daily[0]?.precipitationSum || 0) + (daily[1]?.precipitationSum || 0)) * 10) / 10} mm)
- Temperature: **${current.temperature}°C** (Peak: ${daily[0]?.tempMax ?? current.temperature}°C)
- Relative Humidity: **${current.relativeHumidity}%**

• **What to do:**
${
  status === "AVOID DUE TO WEATHER"
    ? "- Postpone irrigation runs and inspect field drainage channels."
    : "- Apply light evening or drip irrigation if soil moisture probe indicates deficit."
}

• **What to avoid:**
- Avoid flood irrigation during midday thermal peaks.
- Avoid over-saturating fields when upcoming rain probability exceeds 50%.`;
  }

  // 9C. Flood, Inundation & Multi-Day Rainfall Risk (बाढ़, जलभराव एवं 4-5 दिनों की वर्षा)
  const isFloodOrMultiDayQuery =
    q.includes("बाढ़") ||
    q.includes("badh") ||
    q.includes("baadh") ||
    q.includes("flood") ||
    q.includes("flooding") ||
    q.includes("जलभराव") ||
    q.includes("jalbharav") ||
    q.includes("waterlogging") ||
    q.includes("डूबा") ||
    q.includes("duba") ||
    q.includes("submerge") ||
    ((q.includes("चार") || q.includes("पाँच") || q.includes("पांच") || q.includes("char") || q.includes("panch") || q.includes("4") || q.includes("5") || q.includes("कई") || q.includes("kai")) &&
      (q.includes("दिन") || q.includes("din") || q.includes("day")) &&
      (q.includes("बारिश") || q.includes("वर्षा") || q.includes("rain") || q.includes("पानी")));

  if (isFloodOrMultiDayQuery) {
    if (isHindi) {
      return `🌊 **${cityName} में वर्षा एवं बाढ़/जलभराव जोखिम विश्लेषण:**

• **मुख्य निष्कर्ष:** ${
        sumPrecip5d >= 40 || maxRainProb24h >= 75 || current.precipitation >= 5
          ? `आगामी 4–5 दिनों में मध्यम से भारी वर्षा (5 दिनों में कुल ~${sumPrecip5d} मिमी) का अनुमान है, जिससे निचले क्षेत्रों में जलभराव (waterlogging) का जोखिम उत्पन्न हो सकता है।`
          : `ओपन-मेटियो वायुमंडलीय पूर्वानुमान के अनुसार आगामी 4–5 दिनों में गंभीर बाढ़ का कोई सक्रिय मौसम संकेतक नहीं है (5 दिनों की कुल अनुमानित वर्षा मात्र ${sumPrecip5d} मिमी है)।`
      }

• **आगामी 4–5 दिनों का वर्षा पूर्वानुमान:**
- 5 दिनों की कुल अनुमानित वर्षा: **${sumPrecip5d} मिमी**
- अधिकतम वर्षा दिवस: **${peakRainDate}** (लगभग ${peakRainAmount} मिमी, संभावना ${peakRainProb}%)
- अगले 24 घंटों की वर्षा संभावना: **${maxRainProb24h}%** (कुल ${sumPrecip24h} मिमी)

• **महत्वपूर्ण स्पष्टीकरण एवं सीमाएँ:**
गगनदृष्टि ओपन-मेटियो वायुमंडलीय वर्षा मॉडल पर आधारित है। यह स्थानीय नदियों के जलस्तर, बांधों से जल निकासी (dam release) या शहरी नालों के अवरोध को सीधे ट्रैक नहीं करता। आधिकारिक बाढ़ चेतावनी हेतु केंद्रीय जल आयोग (CWC) व स्थानीय आपदा प्रबंधन बुलेटिन का संदर्भ लें।

• **सुझावित सावधानियाँ:**
निचले व जलभराव संभावित मार्गों/अंडरपास पर आवागमन से बचें, खेत व घर के आसपास जल निकासी मार्ग अवरोधमुक्त रखें।`;
    }

    return `🌊 **Precipitation & Inundation / Flood Assessment for ${cityName}:**

• **Core Finding:** ${
      sumPrecip5d >= 40 || maxRainProb24h >= 75 || current.precipitation >= 5
        ? `Moderate-to-heavy rainfall accumulation (~${sumPrecip5d} mm over 5 days) is projected, indicating localized waterlogging risk in low-lying sectors.`
        : `According to Open-Meteo atmospheric forecast models, there are currently no severe precipitation triggers for flooding over the next 4–5 days (cumulative 5-day rain is only ${sumPrecip5d} mm).`
    }

• **4–5 Day Precipitation Telemetry:**
- 5-Day Cumulative Rainfall: **${sumPrecip5d} mm**
- Peak Rainfall Day: **${peakRainDate}** (~${peakRainAmount} mm, probability ${peakRainProb}%)
- Next 24-Hour Max Rain Probability: **${maxRainProb24h}%** (${sumPrecip24h} mm total)

• **Hydrological Context & Scope Limitation:**
GaganDrishti models atmospheric precipitation using Open-Meteo telemetry. It does not monitor upstream dam discharge, localized drainage blockages, or river gauge levels. For official flood warnings, always consult Central Water Commission (CWC) or State Disaster Management bulletins.

• **Recommended Precautions:**
Keep drainage channels clear around fields and structures, and exercise caution around submerged underpasses.`;
  }

  // 10. Tomorrow's Rain / Weather
  if (
    (q.includes("कल") && (q.includes("बारिश") || q.includes("वर्षा") || q.includes("पानी") || q.includes("मौसम"))) ||
    (q.includes("tomorrow") && (q.includes("rain") || q.includes("precip") || q.includes("weather") || q.includes("forecast")))
  ) {
    if (!tomorrowDaily) {
      if (isHindi) return `कल के लिए विस्तृत दैनिक मौसम डेटा अभी संकलित किया जा रहा है।`;
      return `Tomorrow's detailed forecast telemetry is currently compiling.`;
    }
    const rainChance = tomorrowDaily.precipitationProbabilityMax ?? 0;
    const rainMm = tomorrowDaily.precipitationSum ?? 0;
    const wmo = interpretWMOCode(tomorrowDaily.weatherCode ?? 1);
    const condHi = tomorrowDaily.conditionHi || wmo.conditionHi;
    const condEn = tomorrowDaily.conditionEn || wmo.conditionEn;

    if (isHindi) {
      return `कल ${cityName} में अधिकतम तापमान लगभग ${tomorrowDaily.tempMax ?? "N/A"}°C और वर्षा की संभावना ${rainChance}% (${rainMm} मिमी) है। मौसम मुख्य रूप से ${condHi} रहने का अनुमान है।`;
    }
    return `Tomorrow in ${cityName}, expect highs around ${tomorrowDaily.tempMax ?? "N/A"}°C with a ${rainChance}% rain chance (${rainMm} mm precipitation). Dominant condition: ${condEn}.`;
  }

  // 11. Today's Rain
  if (
    q.includes("बारिश") ||
    q.includes("वर्षा") ||
    q.includes("पानी") ||
    q.includes("rain") ||
    q.includes("precipitation") ||
    q.includes("baarish") ||
    q.includes("barish")
  ) {
    const rainNow = current.precipitation > 0 || current.rain > 0;
    if (isHindi) {
      return `${cityName} में अगले 24 घंटों में वर्षा की अधिकतम संभावना ${maxRainProb24h}% है (अनुमानित कुल वर्षा ${sumPrecip24h} मिमी)। ${
        rainNow
          ? `वर्तमान में हल्की वर्षा (${current.precipitation} मिमी) दर्ज की जा रही है।`
          : maxRainProb24h >= 40
          ? "अगले कुछ घंटों में वर्षा संभव है, बाहर निकलते समय छाता साथ रखें।"
          : "वर्तमान में भारी वर्षा का कोई निकटतम जोखिम नहीं है।"
      }`;
    }
    return `In ${cityName}, the maximum probability of rain over the next 24 hours is ${maxRainProb24h}% (estimated total: ${sumPrecip24h} mm). ${
      rainNow
        ? `Currently precipitation of ${current.precipitation} mm is recorded.`
        : maxRainProb24h >= 40
        ? "Rain is likely in upcoming hours; carrying an umbrella is recommended."
        : "No significant immediate rainfall expected under current telemetry."
    }`;
  }

  // 12. General Temperature
  if (
    q.includes("तापमान") ||
    q.includes("temperature") ||
    q.includes("temp") ||
    q.includes("taapman")
  ) {
    if (isHindi) {
      return `${cityName} में वर्तमान तापमान ${current.temperature}°C है (अनुभूत तापमान ${current.apparentTemperature}°C)। आज का अधिकतम तापमान ${daily[0]?.tempMax ?? current.temperature}°C एवं न्यूनतम तापमान ${daily[0]?.tempMin ?? current.temperature}°C रहने का अनुमान है।`;
    }
    return `The current temperature in ${cityName} is ${current.temperature}°C (feels like ${current.apparentTemperature}°C). Today's expected high is ${daily[0]?.tempMax ?? current.temperature}°C and low is ${daily[0]?.tempMin ?? current.temperature}°C.`;
  }

  // 13. Humidity
  if (q.includes("नमी") || q.includes("आर्द्रता") || q.includes("humidity") || q.includes("moisture")) {
    if (isHindi) {
      return `${cityName} में वर्तमान सापेक्ष आर्द्रता ${current.relativeHumidity}% है और बादल आवरण लगभग ${current.cloudCover}% है।`;
    }
    return `The current relative humidity in ${cityName} is ${current.relativeHumidity}% with approximately ${current.cloudCover}% cloud cover.`;
  }

  // 14. Wind
  if (q.includes("हवा") || q.includes("पवन") || q.includes("wind") || q.includes("hawa") || q.includes("gust") || q.includes("storm")) {
    if (isHindi) {
      return `${cityName} में वर्तमान हवा की गति ${current.windSpeed} km/h है और झोंके ${current.windGusts} km/h तक दर्ज किए गए हैं। ${
        current.windSpeed >= 25 ? "हवाएं तेज हैं, बाहरी वस्तुओं को संभालकर रखें।" : "हवा की गति सामान्य और नियंत्रित है।"
      }`;
    }
    return `Current sustained wind speed in ${cityName} is ${current.windSpeed} km/h with peak gusts reaching ${current.windGusts} km/h.`;
  }

  // 15. General crop inquiry
  if (
    q.includes("फसल") ||
    q.includes("crop") ||
    q.includes("खेती") ||
    q.includes("farm") ||
    q.includes("गेहूँ") ||
    q.includes("धान") ||
    q.includes("सोयाबीन") ||
    Boolean(identifiedCrop)
  ) {
    if (isHindi) {
      return `🌾 **${effectiveCropNameHi} मौसम स्थिति (${cityName}):**
वर्तमान मौसम (तापमान ${current.temperature}°C, वर्षा संभावना ${maxRainProb24h}%, हवा ${current.windSpeed} km/h) के अनुसार खेत में जल निकासी व्यवस्था की जांच रखें। किसी भी रासायनिक छिड़काव या सिंचाई से पहले हवा की गति और वर्षा की संभावना अवश्य देखें।`;
    }
    return `🌾 **${effectiveCropNameEn} Agrometeorological Status (${cityName}):**
Under current telemetry (Temp ${current.temperature}°C, Rain Prob ${maxRainProb24h}%, Wind ${current.windSpeed} km/h): Maintain unobstructed drainage ditches and evaluate wind drift before chemical application or irrigation.`;
  }

  // 18. Out-of-Scope Fallback (Politely decline non-weather questions)
  if (isHindi) {
    return `नमस्ते! मैं गगनदृष्टि हूँ, जो नागरिकों और किसानों के लिए मौसम आसूचना सहायक है। मैं मौसम, तापमान, वर्षा, हवा, धूप, ठंड/गर्मी, यात्रा-मौसम एवं कृषि-मौसम संबंधी प्रश्नों के उत्तर देने के लिए अधिकृत हूँ। कृपया मौसम से संबंधित प्रश्न पूछें।`;
  }
  return `Hello! I am GaganDrishti, a weather intelligence assistant for citizens and farmers. I specialize in atmospheric conditions, rainfall, temperature, wind, sunshine, travel weather, and agrometeorological decision support for your city. Please ask a weather-related question.`;
}

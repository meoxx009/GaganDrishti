import { Language, City } from "@/lib/types";
import { NormalizedWeatherData } from "@/lib/weather/types";
import { CropId, StageId, CROPS, STAGES } from "@/lib/weather/farmerTypes";
import { evaluateFarmerWeatherAdvisory } from "@/lib/weather/farmerDecisionEngine";
import { interpretWMOCode } from "@/lib/weather/wmo";

export function getDeterministicFallbackReply(
  query: string,
  language: Language,
  city: City,
  weather: NormalizedWeatherData | null,
  cropId?: CropId,
  stageId?: StageId
): string {
  const q = query.toLowerCase().trim();
  const cityName = language === "hi" ? city.nameHi : city.nameEn;
  const isHindi = language === "hi";

  // Check if weather data exists
  if (!weather || !weather.current) {
    if (isHindi) {
      return `${cityName} के लिए वर्तमान मौसम डेटा उपलब्ध नहीं है। कृपया नेटवर्क कनेक्शन की जांच करें या थोड़ी देर बाद पुनः प्रयास करें।`;
    }
    return `Reliable live weather data is currently unavailable for ${cityName}. Please check your connection or refresh the telemetry.`;
  }

  const { current, hourly, daily } = weather;
  const next24h = hourly.slice(0, 24);
  const sumPrecip24h = Math.round(next24h.reduce((s, h) => s + (h.precipitation || 0), 0) * 10) / 10;
  const maxRainProb24h = next24h.reduce((m, h) => Math.max(m, h.precipitationProbability || 0), 0);

  // Tomorrow's data (index 1 of daily array if available)
  const tomorrowDaily = daily[1];

  // 1. Current Temperature
  if (
    q.includes("तापमान") ||
    q.includes("temperature") ||
    q.includes("temp") ||
    q.includes("गर्मी") ||
    q.includes("how hot") ||
    q.includes("how cold")
  ) {
    if (isHindi) {
      return `${cityName} में वर्तमान तापमान ${current.temperature}°C है (अनुभूत तापमान ${current.apparentTemperature}°C)। आज का अधिकतम तापमान ${daily[0]?.tempMax ?? current.temperature}°C एवं न्यूनतम तापमान ${daily[0]?.tempMin ?? current.temperature}°C रहने का अनुमान है।`;
    }
    return `The current temperature in ${cityName} is ${current.temperature}°C (feels like ${current.apparentTemperature}°C). Today's expected high is ${daily[0]?.tempMax ?? current.temperature}°C and low is ${daily[0]?.tempMin ?? current.temperature}°C.`;
  }

  // 2. Tomorrow's Rain
  if (
    (q.includes("कल") && (q.includes("बारिश") || q.includes("वर्षा") || q.includes("पानी"))) ||
    (q.includes("tomorrow") && (q.includes("rain") || q.includes("precip") || q.includes("shower")))
  ) {
    if (!tomorrowDaily) {
      if (isHindi) return `कल के लिए विस्तृत दैनिक वर्षा डेटा अभी संकलित किया जा रहा है।`;
      return `Tomorrow's detailed precipitation telemetry is currently compiling.`;
    }
    const rainChance = tomorrowDaily.precipitationProbabilityMax ?? 0;
    const rainMm = tomorrowDaily.precipitationSum ?? 0;
    const dateObj = tomorrowDaily.date ? new Date(tomorrowDaily.date + "T00:00:00+05:30") : null;
    const dayNameHi = tomorrowDaily.dayNameHi || (dateObj ? ` (${dateObj.toLocaleDateString("hi-IN", { weekday: "short" })})` : "");
    const dayNameEn = tomorrowDaily.dayNameEn || (dateObj ? ` (${dateObj.toLocaleDateString("en-IN", { weekday: "short" })})` : "");
    const wmo = interpretWMOCode(tomorrowDaily.weatherCode ?? 1);
    const condHi = tomorrowDaily.conditionHi || wmo.conditionHi;
    const condEn = tomorrowDaily.conditionEn || wmo.conditionEn;

    if (isHindi) {
      return `कल${dayNameHi ? ` ${dayNameHi}` : ""} ${cityName} में वर्षा की अधिकतम संभावना ${rainChance}% है और लगभग ${rainMm} मिमी वर्षा का अनुमान है। मौसम मुख्य रूप से ${condHi} रहेगा।`;
    }
    return `Tomorrow${dayNameEn ? ` ${dayNameEn}` : ""} in ${cityName}, there is a ${rainChance}% maximum probability of rain with an estimated ${rainMm} mm precipitation. Expect ${condEn.toLowerCase()} conditions.`;
  }

  // 3. Today's Rain
  if (
    q.includes("बारिश") ||
    q.includes("वर्षा") ||
    q.includes("rain") ||
    q.includes("precipitation") ||
    q.includes("छाता") ||
    q.includes("umbrella")
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

  // 4. Humidity
  if (q.includes("नमी") || q.includes("आर्द्रता") || q.includes("humidity") || q.includes("moisture")) {
    if (isHindi) {
      return `${cityName} में वर्तमान सापेक्ष आर्द्रता (Relative Humidity) ${current.relativeHumidity}% है। वातावरण में बादल आवरण लगभग ${current.cloudCover}% है।`;
    }
    return `The current relative humidity in ${cityName} is ${current.relativeHumidity}% with approximately ${current.cloudCover}% cloud cover.`;
  }

  // 5. Wind
  if (q.includes("हवा") || q.includes("पवन") || q.includes("wind") || q.includes("gust") || q.includes("storm")) {
    if (isHindi) {
      return `${cityName} में वर्तमान हवा की गति ${current.windSpeed} km/h है और झोंके ${current.windGusts} km/h तक दर्ज किए गए हैं। ${
        current.windSpeed >= 25
          ? "हवाएं तेज हैं, बाहरी वस्तुओं को संभालकर रखें।"
          : "हवा की गति सामान्य और नियंत्रित है।"
      }`;
    }
    return `Current sustained wind speed in ${cityName} is ${current.windSpeed} km/h with peak gusts reaching ${current.windGusts} km/h. ${
      current.windSpeed >= 25
        ? "Breezy to strong winds detected; secure loose items."
        : "Wind conditions are calm to moderate."
    }`;
  }

  // 6. Irrigation Suitability
  if (q.includes("सिंचाई") || q.includes("irrigation") || q.includes("पानी देना") || q.includes("water crop")) {
    const selectedCrop = cropId || "wheat";
    const selectedStage = stageId || "growing";
    const decision = evaluateFarmerWeatherAdvisory(weather, selectedCrop, selectedStage);
    if (isHindi) {
      return `सिंचाई मौसम जाँच (${cityName}): स्थिति - ${decision.irrigationStatus}। ${decision.irrigationReasonHi}`;
    }
    return `Irrigation Weather Check (${cityName}): Status — ${decision.irrigationStatus}. ${decision.irrigationReasonEn}`;
  }

  // 7. Spray Weather Suitability
  if (q.includes("स्प्रे") || q.includes("spray") || q.includes("छिड़काव") || q.includes("कीटनाशक") || q.includes("fungicide")) {
    const selectedCrop = cropId || "wheat";
    const selectedStage = stageId || "growing";
    const decision = evaluateFarmerWeatherAdvisory(weather, selectedCrop, selectedStage);
    if (isHindi) {
      return `स्प्रे मौसम विंडो (${cityName}): स्थिति - ${decision.sprayStatus}। ${decision.sprayReasonHi}`;
    }
    return `Spray Weather Window (${cityName}): Status — ${decision.sprayStatus}. ${decision.sprayReasonEn}`;
  }

  // 8. General crop inquiry
  if (q.includes("फसल") || q.includes("crop") || q.includes("खेती") || q.includes("farm") || q.includes("गेहूँ") || q.includes("धान") || q.includes("सोयाबीन")) {
    const cropName = cropId ? CROPS.find((c) => c.id === cropId)?.nameEn : "Crops";
    const cropNameHi = cropId ? CROPS.find((c) => c.id === cropId)?.nameHi : "फसलें";
    if (isHindi) {
      return `${cityName} में वर्तमान मौसम (${current.temperature}°C, वर्षा संभावना ${maxRainProb24h}%, हवा ${current.windSpeed} km/h) के अनुसार ${cropNameHi} के लिए खेत में जल निकासी व्यवस्था की जांच रखें। किसी भी रासायनिक छिड़काव से पहले हवा की गति और मौसम विंडो अवश्य देखें।`;
    }
    return `For ${cropName} in ${cityName} under current telemetry (${current.temperature}°C, ${maxRainProb24h}% rain prob, ${current.windSpeed} km/h wind): Ensure drainage ditches are clear and verify spray wind windows before any field operations.`;
  }

  // 9. Out-of-Scope Fallback (Politely decline non-weather questions)
  if (isHindi) {
    return `नमस्ते! मैं गगनदृष्टि हूँ, जो नागरिकों और किसानों के लिए मौसम आसूचना सहायक है। मैं केवल मौसम, तापमान, वर्षा, हवा, आर्द्रता एवं कृषि-मौसम संबंधी प्रश्नों के उत्तर देने के लिए अधिकृत हूँ। कृपया मौसम से संबंधित प्रश्न पूछें।`;
  }
  return `Hello! I am GaganDrishti, a weather intelligence assistant for citizens and farmers. I specialize strictly in atmospheric conditions, rainfall, temperature, wind, and agrometeorological decision support for your city. Please ask a weather-related question.`;
}

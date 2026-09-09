import { NormalizedWeatherData } from "./types";
import { Language } from "@/lib/types";

export interface CitizenSmartSummary {
  type: "rain" | "wind" | "heat" | "rain_wind" | "normal";
  severity: "info" | "warning" | "caution" | "success";
  title: string;
  badge: string;
  advisory: string;
  tips: string[];
  iconType: "Umbrella" | "Wind" | "Sun" | "CloudRain" | "CheckCircle";
}

export function generateCitizenSmartSummary(
  weather: NormalizedWeatherData,
  language: Language
): CitizenSmartSummary {
  const currentRain = weather.current.precipitation > 0 || weather.current.rain > 0;
  const next12hHours = weather.hourly.slice(0, 12);
  const maxRainProb12h = next12hHours.reduce(
    (max, h) => Math.max(max, h.precipitationProbability || 0),
    0
  );
  const maxPrecip12h = next12hHours.reduce(
    (max, h) => Math.max(max, h.precipitation || 0),
    0
  );

  const rainExpected =
    currentRain || maxRainProb12h >= 40 || maxPrecip12h >= 0.5;

  const currentWind = weather.current.windSpeed;
  const currentGusts = weather.current.windGusts;
  const maxWind12h = next12hHours.reduce(
    (max, h) => Math.max(max, h.windSpeed || 0),
    0
  );
  const strongWindExpected =
    currentWind >= 25 || currentGusts >= 40 || maxWind12h >= 25;

  const currentTemp = weather.current.temperature;
  const currentApparent = weather.current.apparentTemperature;
  const dailyMax = weather.daily[0]?.tempMax ?? currentTemp;
  const highHeatExpected =
    currentTemp >= 35 || currentApparent >= 38 || dailyMax >= 36;

  // Case 1: Both Rain & Strong Wind
  if (rainExpected && strongWindExpected) {
    if (language === "hi") {
      return {
        type: "rain_wind",
        severity: "warning",
        title: "वर्षा एवं तेज हवाओं की चेतावनी",
        badge: "मौसम सतर्कता",
        advisory:
          "अगले 12 घंटों में वर्षा और तेज हवाओं की संभावना है। आवागमन में छाता और रेनकोट साथ रखें, और खुले में रखे सामान को सुरक्षित स्थान पर रखें।",
        tips: [
          `अधिकतम वर्षा संभावना: ${maxRainProb12h}%`,
          `हवा की गति: ${currentWind} km/h (झोंके: ${currentGusts} km/h)`,
          "वाहन चलाते समय फिसलन और दृश्यता का विशेष ध्यान रखें",
        ],
        iconType: "CloudRain",
      };
    }
    return {
      type: "rain_wind",
      severity: "warning",
      title: "Rain & Elevated Wind Advisory",
      badge: "Active Alert",
      advisory:
        "Rain and elevated wind speeds are expected over the next 12 hours. Carry an umbrella or waterproofs, and secure loose outdoor belongings.",
      tips: [
        `Peak rain probability: ${maxRainProb12h}%`,
        `Wind speed: ${currentWind} km/h (Gusts up to ${currentGusts} km/h)`,
        "Exercise caution on slick roads and around tall structures",
      ],
      iconType: "CloudRain",
    };
  }

  // Case 2: Rain Expected
  if (rainExpected) {
    if (language === "hi") {
      return {
        type: "rain",
        severity: "warning",
        title: "वर्षा की संभावना — छाता साथ रखें",
        badge: "वर्षा परामर्श",
        advisory:
          "अगले कुछ घंटों में वर्षा अथवा बौछारें पड़ने की संभावना है। दैनिक आवागमन एवं स्कूल/दफ्तर जाते समय रेन गियर तैयार रखें।",
        tips: [
          `वर्षा की संभावना: ${maxRainProb12h}%`,
          `अनुमानित वर्षा: ${maxPrecip12h} mm`,
          "निचले इलाकों और जलभराव वाले मार्गों से गुजरते समय सतर्क रहें",
        ],
        iconType: "Umbrella",
      };
    }
    return {
      type: "rain",
      severity: "warning",
      title: "Rain Expected — Umbrella Recommended",
      badge: "Precipitation Alert",
      advisory:
        "Precipitation or rain showers are expected during the next 12 hours. Carry an umbrella and plan extra time for transit.",
      tips: [
        `Rain probability: ${maxRainProb12h}%`,
        `Expected rainfall: ${maxPrecip12h} mm`,
        "Watch for slick roads and water accumulation in low-lying corridors",
      ],
      iconType: "Umbrella",
    };
  }

  // Case 3: Strong Wind
  if (strongWindExpected) {
    if (language === "hi") {
      return {
        type: "wind",
        severity: "caution",
        title: "तेज हवाओं की चेतावनी",
        badge: "पवन सतर्कता",
        advisory:
          "हवा की गति सामान्य से अधिक है। बालकनी एवं खुले में रखे हल्के सामान को बांधकर सुरक्षित करें।",
        tips: [
          `हवा की गति: ${currentWind} km/h`,
          `तेज झोंके: ${currentGusts} km/h`,
          "दोपहिया वाहन चालक खुले पुलों और चौराहों पर गति नियंत्रित रखें",
        ],
        iconType: "Wind",
      };
    }
    return {
      type: "wind",
      severity: "caution",
      title: "Strong Winds Detected",
      badge: "Wind Alert",
      advisory:
        "Gusty winds are observed in the area. Secure loose outdoor items, plants, and balcony fixtures.",
      tips: [
        `Current wind speed: ${currentWind} km/h`,
        `Peak gusts: ${currentGusts} km/h`,
        "High-profile and two-wheeler drivers should exercise caution",
      ],
      iconType: "Wind",
    };
  }

  // Case 4: High Heat
  if (highHeatExpected) {
    if (language === "hi") {
      return {
        type: "heat",
        severity: "caution",
        title: "तीव्र तापमान — दोपहर में धूप से बचें",
        badge: "तापमान परामर्श",
        advisory:
          "तापमान उच्च स्तर पर है। दोपहर 12 बजे से 3 बजे के बीच सीधे धूप में लंबे समय तक रहने से बचें और पर्याप्त पानी पिएं।",
        tips: [
          `वर्तमान तापमान: ${currentTemp}°C (अनुभूत: ${currentApparent}°C)`,
          `दिन का अधिकतम: ${dailyMax}°C`,
          "हल्के सूती वस्त्र पहनें और हाइड्रेटेड रहें",
        ],
        iconType: "Sun",
      };
    }
    return {
      type: "heat",
      severity: "caution",
      title: "High Thermal Index — Reduce Afternoon Exposure",
      badge: "Heat Advisory",
      advisory:
        "Elevated temperatures observed. Minimize prolonged direct sun exposure during peak afternoon hours and stay hydrated.",
      tips: [
        `Current temp: ${currentTemp}°C (Feels like ${currentApparent}°C)`,
        `Today's high: ${dailyMax}°C`,
        "Drink plenty of water and seek shade during midday hours",
      ],
      iconType: "Sun",
    };
  }

  // Case 5: Normal / Favorable Weather
  if (language === "hi") {
    return {
      type: "normal",
      severity: "success",
      title: "मौसम अनुकूल एवं सामान्य है",
      badge: "अनुकूल मौसम",
      advisory:
        "वर्तमान वायुमंडलीय परिस्थितियां शांत और संतुलित हैं। नियमित आवागमन, बाहरी खेलकूद एवं दैनिक गतिविधियों के लिए उत्तम समय।",
      tips: [
        `तापमान: ${currentTemp}°C • आर्द्रता: ${weather.current.relativeHumidity}%`,
        `हवा: ${currentWind} km/h • बादल: ${weather.current.cloudCover}%`,
        "सामान्य आवागमन एवं बाहरी गतिविधियों के लिए किसी विशेष सावधानी की आवश्यकता नहीं है",
      ],
      iconType: "CheckCircle",
    };
  }

  return {
    type: "normal",
    severity: "success",
    title: "Calm & Favorable Weather Conditions",
    badge: "Favorable",
    advisory:
      "Atmospheric conditions are stable with comfortable parameters. Excellent conditions for regular commuting, outdoor transit, and schooling.",
    tips: [
      `Temperature: ${currentTemp}°C • Humidity: ${weather.current.relativeHumidity}%`,
      `Wind: ${currentWind} km/h • Cloud cover: ${weather.current.cloudCover}%`,
      "No meteorological disruption expected for standard travel and routines",
    ],
    iconType: "CheckCircle",
  };
}

export interface WMOInterpretation {
  conditionEn: string;
  conditionHi: string;
  iconName: string;
}

const WMO_MAP: Record<number, WMOInterpretation> = {
  0: { conditionEn: "Clear sky", conditionHi: "साफ आसमान", iconName: "Sun" },
  1: { conditionEn: "Mainly clear", conditionHi: "अधिकांशतः साफ", iconName: "CloudSun" },
  2: { conditionEn: "Partly cloudy", conditionHi: "आंशिक रूप से बादल", iconName: "CloudSun" },
  3: { conditionEn: "Overcast", conditionHi: "बादल छाए रहेंगे", iconName: "Cloud" },
  45: { conditionEn: "Fog", conditionHi: "कोहरा", iconName: "CloudFog" },
  48: { conditionEn: "Depositing rime fog", conditionHi: "घना पाला कोहरा", iconName: "CloudFog" },
  51: { conditionEn: "Light drizzle", conditionHi: "हल्की बूंदाबांदी", iconName: "CloudDrizzle" },
  53: { conditionEn: "Moderate drizzle", conditionHi: "मध्यम बूंदाबांदी", iconName: "CloudDrizzle" },
  55: { conditionEn: "Dense drizzle", conditionHi: "घनी बूंदाबांदी", iconName: "CloudDrizzle" },
  56: { conditionEn: "Light freezing drizzle", conditionHi: "हल्की शीतल बूंदाबांदी", iconName: "CloudSnow" },
  57: { conditionEn: "Dense freezing drizzle", conditionHi: "घनी शीतल बूंदाबांदी", iconName: "CloudSnow" },
  61: { conditionEn: "Slight rain", conditionHi: "हल्की वर्षा", iconName: "CloudRain" },
  63: { conditionEn: "Moderate rain", conditionHi: "मध्यम वर्षा", iconName: "CloudRain" },
  65: { conditionEn: "Heavy rain", conditionHi: "भारी वर्षा", iconName: "CloudRain" },
  66: { conditionEn: "Light freezing rain", conditionHi: "हल्की शीतल वर्षा", iconName: "CloudSnow" },
  67: { conditionEn: "Heavy freezing rain", conditionHi: "भारी शीतल वर्षा", iconName: "CloudSnow" },
  71: { conditionEn: "Slight snow fall", conditionHi: "हल्का हिमपात", iconName: "CloudSnow" },
  73: { conditionEn: "Moderate snow fall", conditionHi: "मध्यम हिमपात", iconName: "CloudSnow" },
  75: { conditionEn: "Heavy snow fall", conditionHi: "भारी हिमपात", iconName: "CloudSnow" },
  77: { conditionEn: "Snow grains", conditionHi: "बर्फ के दाने", iconName: "CloudSnow" },
  80: { conditionEn: "Slight rain showers", conditionHi: "हल्की बौछारें", iconName: "CloudRain" },
  81: { conditionEn: "Moderate rain showers", conditionHi: "मध्यम बौछारें", iconName: "CloudRain" },
  82: { conditionEn: "Violent rain showers", conditionHi: "तीव्र मूसलाधार बौछारें", iconName: "CloudRain" },
  85: { conditionEn: "Slight snow showers", conditionHi: "हल्की बर्फीली बौछारें", iconName: "CloudSnow" },
  86: { conditionEn: "Heavy snow showers", conditionHi: "भारी बर्फीली बौछारें", iconName: "CloudSnow" },
  95: { conditionEn: "Thunderstorm", conditionHi: "गरज के साथ आंधी", iconName: "CloudLightning" },
  96: { conditionEn: "Thunderstorm with slight hail", conditionHi: "ओलावृष्टि युक्त आंधी", iconName: "CloudLightning" },
  99: { conditionEn: "Thunderstorm with heavy hail", conditionHi: "भारी ओलावृष्टि युक्त आंधी", iconName: "CloudLightning" },
};

export function interpretWMOCode(code: number): WMOInterpretation {
  if (WMO_MAP[code]) {
    return WMO_MAP[code];
  }
  return {
    conditionEn: "Variable Weather",
    conditionHi: "परिवर्तनशील मौसम",
    iconName: "CloudSun",
  };
}

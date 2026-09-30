import {
  TravelDecisionInput,
  TravelDecisionOutput,
  VehicleType,
  TimeSlotRecommendation,
  VehicleSafetyAdvice,
  WorstWeatherZone,
} from "./travelRouteTypes";
import {
  getRouteByCities,
  getIntermediatePointsByRouteId,
  TRAVEL_ROUTES,
} from "./travelRoutesDatabase";
import {
  resolveIndianLocation,
  calculateTravelTimeWindow,
  fetchLocationWindowForecast,
  KNOWN_LOCATIONS,
} from "./travelWeather";

/**
 * Normalizes vehicle input string
 */
export function normalizeVehicleType(raw?: string): VehicleType {
  const v = (raw || "").toLowerCase();
  if (v.includes("bike") || v.includes("motorcycle") || v.includes("scooter") || v.includes("दोपहिया")) {
    return "Bike";
  }
  if (v.includes("truck") || v.includes("lorry") || v.includes("ट्रक") || v.includes("heavy")) {
    return "Truck";
  }
  if (v.includes("bus") || v.includes("बस")) {
    return "Bus";
  }
  return "Car";
}

/**
 * Extracts vehicle type mentioned in user natural language query
 */
export function extractVehicleFromText(text: string): VehicleType | undefined {
  const lower = text.toLowerCase();
  if (lower.includes("bike") || lower.includes("motorcycle") || lower.includes("scooter") || lower.includes("बाइक")) {
    return "Bike";
  }
  if (lower.includes("truck") || lower.includes("lorry") || lower.includes("ट्रक")) {
    return "Truck";
  }
  if (lower.includes("bus") || lower.includes("बस")) {
    return "Bus";
  }
  if (lower.includes("car") || lower.includes("गाड़ी") || lower.includes("कार")) {
    return "Car";
  }
  return undefined;
}

/**
 * Evaluates route weather and generates safety recommendations
 */
export async function getTravelDecision(
  input: TravelDecisionInput
): Promise<TravelDecisionOutput> {
  const originName = input.origin_city.trim();
  const destName = input.destination_city.trim();
  const vehicle = input.vehicle_type ? normalizeVehicleType(input.vehicle_type) : "Car";
  const travelDate = input.travel_date || new Date().toISOString().split("T")[0];

  // 1. Find Route
  let route = getRouteByCities(originName, destName);
  let distanceKm = route ? route.distance_km : 180;
  let travelHours = route ? route.avg_travel_time_hours : 3.5;
  let accidentRating = route ? route.accident_history_rating : 3;
  let routeName = route ? route.route_name : `${originName} to ${destName} Highway`;

  // 2. Resolve intermediate points
  let rawWaypoints = route ? getIntermediatePointsByRouteId(route.route_id) : [];

  // If no predefined route, create synthetic waypoints along vector
  if (rawWaypoints.length === 0) {
    const originLoc = await resolveIndianLocation(originName) || KNOWN_LOCATIONS[0];
    const destLoc = await resolveIndianLocation(destName) || KNOWN_LOCATIONS[1];

    const wpCount = 6;
    for (let i = 1; i <= wpCount; i++) {
      const frac = (i - 1) / (wpCount - 1);
      rawWaypoints.push({
        point_id: 1000 + i,
        route_id: route?.route_id || 999,
        sequence: i,
        city_name: i === 1 ? originName : i === wpCount ? destName : `${originName}-${destName} Waypoint ${i}`,
        pincode: "462001",
        latitude: originLoc.lat + frac * (destLoc.lat - originLoc.lat),
        longitude: originLoc.lon + frac * (destLoc.lon - originLoc.lon),
        km_from_origin: Math.round(frac * distanceKm),
        weather_characteristic: "Intercity Highway Corridor",
        risk_factor: i === 3 ? "Potential crosswinds & showers" : "Normal road",
      });
    }
  }

  // 3. Evaluate weather along waypoints
  // Fetch origin & destination live weather
  let maxRainProb = 15;
  let maxWindSpeed = 12;
  let maxTemp = 31;
  let minTemp = 22;

  try {
    const originLoc = await resolveIndianLocation(originName);
    if (originLoc) {
      const window = calculateTravelTimeWindow("today");
      const originForecast = await fetchLocationWindowForecast(originLoc, window);
      if (originForecast) {
        maxRainProb = Math.max(maxRainProb, originForecast.maxRainProb);
        maxWindSpeed = Math.max(maxWindSpeed, originForecast.maxWindSpeed);
        maxTemp = Math.max(maxTemp, originForecast.avgTemp);
        minTemp = Math.min(minTemp, originForecast.avgTemp);
      }
    }
  } catch {
    // fallback
  }

  // Waypoints with weather metrics
  const evaluatedWaypoints = rawWaypoints.map((pt, idx) => {
    // Add micro-climate deviations based on risk_factor
    let rain = maxRainProb;
    let wind = maxWindSpeed;
    let temp = maxTemp;
    let rating: "GOOD" | "CAUTION" | "HAZARD" = "GOOD";

    if (pt.risk_factor.toLowerCase().includes("high") || pt.risk_factor.toLowerCase().includes("heavy rain") || pt.risk_factor.toLowerCase().includes("flood")) {
      rain = Math.min(95, maxRainProb + 40);
      wind = Math.min(45, maxWindSpeed + 15);
      rating = "HAZARD";
    } else if (pt.risk_factor.toLowerCase().includes("crosswind") || pt.risk_factor.toLowerCase().includes("fog") || pt.risk_factor.toLowerCase().includes("ghat")) {
      wind = Math.min(35, maxWindSpeed + 10);
      rating = "CAUTION";
    }

    return {
      ...pt,
      temperature: temp,
      rain_probability: rain,
      precipitation_mm: rain > 50 ? 12.5 : 0,
      wind_speed: wind,
      safety_rating: rating,
    };
  });

  // 4. Identify Worst Weather Zone
  const worstPoint = [...evaluatedWaypoints].sort((a, b) => (b.rain_probability || 0) - (a.rain_probability || 0))[0] || evaluatedWaypoints[0];

  const worstWeatherZone: WorstWeatherZone = {
    location: `${worstPoint.city_name} (km ${worstPoint.km_from_origin})`,
    km_from_origin: worstPoint.km_from_origin,
    weather_summary: `${worstPoint.weather_characteristic} - Rain probability ${worstPoint.rain_probability}%, wind ${worstPoint.wind_speed} km/h`,
    weather_summary_hi: `${worstPoint.weather_characteristic} - वर्षा संभावना ${worstPoint.rain_probability}%, हवा ${worstPoint.wind_speed} km/h`,
    critical_time_window: "2:00 PM - 6:00 PM (Afternoon peak showers)",
    risk_factor: worstPoint.risk_factor,
  };

  // 5. Calculate Overall Safety Score (0-10)
  // Formula: 100 - (rain% + wind/2 + accidentRating * 8)
  const penalty = Math.round(
    ((worstPoint.rain_probability || 0) * 0.4) +
    ((worstPoint.wind_speed || 0) * 0.5) +
    accidentRating * 6 +
    (route?.flood_prone ? 12 : 0) +
    (route?.landslide_prone ? 15 : 0)
  );

  const rawScore = Math.max(2, Math.min(10, Math.round((100 - penalty) / 10)));
  const overallSafetyScore = rawScore;

  let safetyVerdict = "SAFE - Good travelling conditions";
  let safetyVerdictHi = "सुरक्षित - यात्रा हेतु अनुकूल मौसम";

  if (overallSafetyScore <= 4) {
    safetyVerdict = "AVOID OR DELAY - High weather hazards (Rain / Floods / Ghat)";
    safetyVerdictHi = "यात्रा टालें - भारी वर्षा व खतरनाक मौसमी स्थितियां";
  } else if (overallSafetyScore <= 6) {
    safetyVerdict = "CAUTION - Possible rain showers & slippery roads";
    safetyVerdictHi = "सावधानी बरतें - मार्ग में वर्षा व फिसलन की संभावना";
  }

  // 6. Time Slot Recommendations
  const timeRecommendations: TimeSlotRecommendation[] = [
    {
      time_slot: "5:00 AM - 8:00 AM (Early Morning)",
      time_slot_hi: "सुबह 5 से 8 बजे (अलसुबह)",
      safety_score: Math.min(10, overallSafetyScore + 2),
      verdict: "BEST WINDOW - Clear roads, calm winds, minimum convective rain",
      verdict_hi: "सर्वश्रेष्ठ समय - साफ मौसम, शांत हवा, कम ट्रैफिक",
      is_best: true,
      is_worst: false,
    },
    {
      time_slot: "8:00 AM - 12:00 PM (Morning)",
      time_slot_hi: "सुबह 8 से दोपहर 12 बजे",
      safety_score: overallSafetyScore,
      verdict: "MODERATE - Normal daylight driving, rain may build up by noon",
      verdict_hi: "मध्यम - सामान्य दिन की यात्रा, दोपहर में बादल संभव",
      is_best: false,
      is_worst: false,
    },
    {
      time_slot: "2:00 PM - 6:00 PM (Afternoon)",
      time_slot_hi: "दोपहर 2 से शाम 6 बजे",
      safety_score: Math.max(2, overallSafetyScore - 3),
      verdict: "AVOID IF POSSIBLE - Peak rain and thunderstorm activity in ghat/pass zones",
      verdict_hi: "टालें - घाट और निचले क्षेत्रों में तेज बारिश व आंधी की आशंका",
      is_best: false,
      is_worst: true,
    },
    {
      time_slot: "6:00 PM - 9:00 PM (Evening)",
      time_slot_hi: "शाम 6 से रात 9 बजे",
      safety_score: Math.min(9, overallSafetyScore),
      verdict: "ACCEPTABLE - Rain clears up, maintain headlights on wet road",
      verdict_hi: "स्वीकार्य - बारिश कम होगी, गीली सड़क पर हेडलाइट चालू रखें",
      is_best: false,
      is_worst: false,
    },
  ];

  // 7. Vehicle-Specific Risks & Precautions
  const allVehicleGuidance: Record<VehicleType, VehicleSafetyAdvice> = {
    Bike: {
      vehicle: "Bike",
      risk_level: worstPoint.rain_probability && worstPoint.rain_probability > 40 ? "HIGH" : "MEDIUM",
      reason: "Two-wheelers are highly vulnerable to crosswind drift, tire skidding on white lane paint, and water splash blindness.",
      reason_hi: "दोपहिया वाहन क्रॉसविंड हवा, पेंट स्ट्रिप्स पर फिसलने और भारी छींटों से सबसे ज्यादा प्रभावित होते हैं।",
      precautions: [
        "Wear ISI certified full-face helmet & waterproof riding gear.",
        "Restrict highway cruising speed to 40-50 km/h in wet zones.",
        "Keep low-beam headlight ON throughout the journey.",
        "Never brake aggressively on painted road markings or metal bridge joints.",
      ],
      precautions_hi: [
        "ISI प्रमाणित हेलमेट और रेन गियर पहनें।",
        "गीले मार्ग पर गति 40-50 किमी/घंटा से अधिक न रखें।",
        "दिन में भी हेडलाइट चालू रखें ताकि सामने वाले वाहन देख सकें।",
        "सड़क की सफेद पट्टियों या लोहे के जोड़ों पर अचानक ब्रेक न लगाएं।",
      ],
    },
    Car: {
      vehicle: "Car",
      risk_level: overallSafetyScore <= 4 ? "HIGH" : overallSafetyScore <= 6 ? "MEDIUM" : "LOW",
      reason: "Enclosed cabin provides weather protection, but hydroplaning at speeds > 70 km/h in standing water is dangerous.",
      reason_hi: "कार मौसम से सुरक्षा देती है, परंतु 70 किमी/घंटे से अधिक गति पर पानी में तैरने (हाइड्रोप्लेनिंग) का खतरा रहता है।",
      precautions: [
        "Inspect windshield wiper blades and washer fluid before departure.",
        "Maintain a minimum 4-second following distance behind large commercial trucks.",
        "Avoid sudden steering maneuvers when crossing water pools.",
        "Use low beams or fog lamps; hazard flashers should only be used when stationary.",
      ],
      precautions_hi: [
        "यात्रा से पहले वाइपर ब्लेड और वॉशर फ्लूइड अवश्य जांचें।",
        "आगे चल रहे भारी ट्रकों से कम से कम 4 सेकंड की सुरक्षित दूरी रखें।",
        "जलभराव वाले गड्ढों पर अचानक स्टीयरिंग न मोड़ें।",
        "चलती गाड़ी में हैजार्ड लाइट न जलाएं, लो-बीम हेडलाइट का उपयोग करें।",
      ],
    },
    Truck: {
      vehicle: "Truck",
      risk_level: route?.landslide_prone || ((route?.altitude_change_meters ?? 0) > 200) ? "HIGH" : "MEDIUM-HIGH",
      reason: "Heavy vehicles face brake heating on steep ghat descents and tipping hazards during open corridor crosswinds.",
      reason_hi: "घाट ढलानों पर ब्रेक गर्म होने और खुले हाईवे पर तेज हवा से अनियंत्रित होने का खतरा रहता है।",
      precautions: [
        "Use engine braking (second/third gear) on ghat descents; do not ride foot brakes.",
        "Ensure waterproof tarpaulin is securely tied over moisture-sensitive cargo.",
        "If wind gusts exceed 40 km/h on river bridges, reduce speed and hold left lane.",
        "Check tire cold pressures and air brake tanks before start.",
      ],
      precautions_hi: [
        "घाट ढलान पर इंजन ब्रेक (लो गियर) का उपयोग करें, लगातार ब्रेक न दबाएं।",
        "माल को तिरपाल से अच्छी तरह बांधें ताकि बारिश से नुकसान न हो।",
        "पुलों पर 40 किमी/घंटा से अधिक हवा होने पर गति कम रखें।",
        "यात्रा शुरू करने से पहले एयर ब्रेक व टायर प्रेशर चेक करें।",
      ],
    },
    Bus: {
      vehicle: "Bus",
      risk_level: "MEDIUM",
      reason: "Passenger safety requires conservative cruising speeds during reduced road adhesion.",
      reason_hi: "यात्री सुरक्षा हेतु गीली सड़क पर धीमी गति और अचानक झटके से बचना आवश्यक है।",
      precautions: [
        "Limit highway cruising speed to 55 km/h during heavy rainfall.",
        "Ensure emergency exits and defrosters are operational.",
        "Announce passenger safety briefings before entering hilly ghat sections.",
      ],
      precautions_hi: [
        "भारी बारिश में गति 55 किमी/घंटे से कम रखें।",
        "इमरजेंसी एग्जिट व डिफॉगर जांचें।",
        "घाट क्षेत्र में यात्रियों को सावधान रहने का निर्देश दें।",
      ],
    },
  };

  const selectedVehicleAdvice = allVehicleGuidance[vehicle] || allVehicleGuidance.Car;

  // 8. Route-Specific Alerts
  const routeSpecificAlerts = [
    `${worstPoint.city_name} (km ${worstPoint.km_from_origin}): ${worstPoint.risk_factor}`,
    route?.flood_prone ? "Known seasonal river causeway surge section during monsoon." : "Watch for highway construction and speed cameras.",
  ];
  const routeSpecificAlertsHi = [
    `${worstPoint.city_name} (किमी ${worstPoint.km_from_origin}): ${worstPoint.risk_factor}`,
    route?.flood_prone ? "मानसून में नदी-नालों के उफान की संभावना।" : "सड़क निर्माण व स्पीड कैमरों पर ध्यान दें।",
  ];

  // 9. Alternative routes
  const alternativeRoutes = route?.alternative_routes?.map((alt) => ({
    route: alt.route_name,
    distance_km: alt.distance_km,
    time_hours: alt.avg_travel_time_hours,
    safety_advantage: alt.safety_advantage,
    safety_advantage_hi: alt.safety_advantage_hi,
  })) || [
    {
      route: `${originName} to ${destName} via National Bypass`,
      distance_km: Math.round(distanceKm * 1.15),
      time_hours: Math.round(travelHours * 1.2 * 10) / 10,
      safety_advantage: "Divided 4-lane expressway with broader toll service bays.",
      safety_advantage_hi: "विभाजित 4-लेन एक्सप्रेसवे, बेहतर जल निकासी व सुविधाएं।",
    },
  ];

  return {
    route_id: route?.route_id,
    route_name: routeName,
    origin: originName,
    destination: destName,
    distance_km: distanceKm,
    estimated_time_hours: travelHours,
    travel_date: travelDate,
    vehicle_type: vehicle,
    overall_safety_score: overallSafetyScore,
    safety_verdict: safetyVerdict,
    safety_verdict_hi: safetyVerdictHi,
    worst_weather_zone: worstWeatherZone,
    best_travel_time: "5:00 AM - 8:00 AM (Early Morning)",
    worst_travel_time: "2:00 PM - 6:00 PM (Afternoon)",
    time_recommendations: timeRecommendations,
    vehicle_specific_risks: selectedVehicleAdvice,
    all_vehicle_guidance: allVehicleGuidance,
    route_specific_alerts: routeSpecificAlerts,
    route_specific_alerts_hi: routeSpecificAlertsHi,
    emergency_contacts: {
      police: "100 / 112",
      ambulance: "108 / 102",
      traffic_highway_patrol: "1033 (National Highway Authority)",
      disaster_ndrf: "1070 (State Emergency Center)",
    },
    alternative_routes: alternativeRoutes,
    waypoints: evaluatedWaypoints,
  };
}

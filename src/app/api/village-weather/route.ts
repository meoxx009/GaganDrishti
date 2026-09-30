import { NextRequest, NextResponse } from "next/server";
import {
  searchVillagesAndPincodes,
  resolveAnyIndianPincode,
  getNearbyVillages,
  HIGH_DENSITY_VILLAGES,
} from "@/lib/weather/pincodeVillageDatabase";
import { findClimateZoneByCoordinates, getClimateZoneById } from "@/lib/weather/climateZonesDatabase";
import {
  computeMicroClimateAdjustments,
  evaluateVillageFarmSuitability,
} from "@/lib/weather/microClimateEngine";
import { interpretWMOCode } from "@/lib/weather/wmo";
import {
  NearbyVillageForecast,
  HyperlocalVillageWeatherResponse,
} from "@/lib/weather/villageLocationTypes";
import { getWeatherWithCache } from "@/lib/weather/weatherCacheDatabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 1. Autocomplete Search Query
    const search = searchParams.get("search");
    if (search !== null) {
      const results = searchVillagesAndPincodes(search, 10);
      return NextResponse.json({ success: true, count: results.length, results });
    }

    // 2. Resolve Target Village / Pincode
    const pincode = searchParams.get("pincode");
    const villageParam = searchParams.get("village");
    const latParam = searchParams.get("lat");
    const lonParam = searchParams.get("lon");

    let village = HIGH_DENSITY_VILLAGES[0]; // Default: Kotri Village, Sehore

    if (pincode) {
      village = resolveAnyIndianPincode(pincode);
    } else if (villageParam) {
      const found = HIGH_DENSITY_VILLAGES.find(
        (v) =>
          v.village_name.toLowerCase().includes(villageParam.toLowerCase()) ||
          v.village_name_hi.includes(villageParam)
      );
      if (found) village = found;
    } else if (latParam && lonParam) {
      const lat = parseFloat(latParam);
      const lon = parseFloat(lonParam);
      if (!isNaN(lat) && !isNaN(lon)) {
        // Find closest known village or construct location
        const nearby = getNearbyVillages(
          {
            pincode: "000000",
            village_name: "Local Village Point",
            village_name_hi: "स्थानीय ग्रामीण बिंदु",
            district: "Local",
            district_hi: "स्थानीय",
            state: "India",
            state_hi: "भारत",
            latitude: lat,
            longitude: lon,
            elevation_m: 480,
            soil_type: "Medium Black Soil",
            soil_type_hi: "मध्यम काली मिट्टी",
            climate_zone_id: 1,
            climate_zone_name: "Central India",
          },
          1
        );
        if (nearby.length > 0) {
          village = nearby[0];
        }
      }
    }

    // 3. Climate Zone linkage
    const climateZone =
      getClimateZoneById(village.climate_zone_id) ||
      findClimateZoneByCoordinates(village.latitude, village.longitude);

    // 4. Fetch Live Weather via 2-Hour Caching Engine (FINAL_001)
    const forceRefresh = searchParams.get("force_refresh") === "true";
    const cachedWeather = await getWeatherWithCache({
      pincode: village.pincode,
      latitude: village.latitude,
      longitude: village.longitude,
      city_name: `${village.village_name}, ${village.district}`,
      force_refresh: forceRefresh,
    });

    const currentTemp = cachedWeather.temperature;
    const apparentTemp = cachedWeather.temperature + 0.5;
    const humidity = cachedWeather.humidity;
    const windSpeed = cachedWeather.wind_speed;
    const windGusts = Math.round(cachedWeather.wind_speed * 1.5 * 10) / 10;
    const precipitation = cachedWeather.rain_probability > 50 ? 2.5 : 0;
    const weatherCode = cachedWeather.weather_code;
    const rainProbToday = cachedWeather.rain_probability;
    const rainSumToday = cachedWeather.forecast_7day?.[0]?.precipitation_sum_mm ?? 0;

    const wmo = interpretWMOCode(weatherCode);

    // 5. Compute Micro-Climate Adjustments (Lapse rate, Soil retention, Slope)
    const baseNormalizedData = {
      cityName: village.district,
      current: {
        temperature: currentTemp,
        apparentTemperature: apparentTemp,
        relativeHumidity: humidity,
        windSpeed,
        windGusts,
        precipitation,
        weatherCode,
      },
      daily: [
        {
          precipitationProbabilityMax: rainProbToday,
          precipitationSum: rainSumToday,
        },
      ],
    } as any;

    const adjustments = computeMicroClimateAdjustments(
      village,
      baseNormalizedData,
      climateZone
    );

    // 6. Evaluate Farm Suitability
    const suitability = evaluateVillageFarmSuitability(
      adjustments.adjusted_temperature,
      humidity,
      windSpeed,
      adjustments.adjusted_rain_probability,
      village.soil_type
    );

    // 7. Compute Nearby Village Mini-Forecasts
    const nearbyRaw = getNearbyVillages(village, 8);
    const nearbyVillages: NearbyVillageForecast[] = nearbyRaw.map((nb, idx) => {
      // Differential micro-forecast using distance and elevation difference
      const elevDiff = nb.elevation_m - village.elevation_m;
      const nbTempAdj = Math.round((-0.65 * (elevDiff / 100)) * 10) / 10;
      const nbTemp = Math.round((currentTemp + nbTempAdj) * 10) / 10;
      const nbRainProb = Math.min(100, Math.max(0, rainProbToday + (idx % 3 === 0 ? 5 : idx % 2 === 0 ? -5 : 0)));
      const nbWind = Math.round((windSpeed + ((idx % 3) - 1) * 1.5) * 10) / 10;

      let sprayStatus: NearbyVillageForecast["spray_suitability"] = "FAVOURABLE";
      if (nbWind >= 18 || nbRainProb >= 50) sprayStatus = "AVOID";
      else if (nbWind >= 12 || nbRainProb >= 30) sprayStatus = "CAUTION";

      let suitScore = 88 - (sprayStatus === "AVOID" ? 30 : sprayStatus === "CAUTION" ? 12 : 0);

      return {
        pincode: nb.pincode,
        village_name: nb.village_name,
        village_name_hi: nb.village_name_hi,
        district: nb.district,
        district_hi: nb.district_hi,
        latitude: nb.latitude,
        longitude: nb.longitude,
        distance_km: nb.distanceKm,
        elevation_m: nb.elevation_m,
        soil_type: nb.soil_type,
        temperature: nbTemp,
        rain_probability: nbRainProb,
        wind_speed: nbWind,
        weather_condition: wmo.conditionEn,
        weather_condition_hi: wmo.conditionHi,
        spray_suitability: sprayStatus,
        farming_suitability_score: suitScore,
      };
    });

    const responseData: HyperlocalVillageWeatherResponse = {
      village,
      climate_zone: climateZone,
      current_weather: {
        temperature: currentTemp,
        apparent_temperature: apparentTemp,
        relative_humidity: humidity,
        wind_speed: windSpeed,
        wind_gusts: windGusts,
        precipitation,
        rain_probability_today: rainProbToday,
        precipitation_sum_today: rainSumToday,
        weather_code: weatherCode,
        condition_en: wmo.conditionEn,
        condition_hi: wmo.conditionHi,
      },
      adjustments,
      farm_suitability: suitability,
      nearby_villages: nearbyVillages,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to compute hyperlocal village weather",
      },
      { status: 500 }
    );
  }
}

import { City } from "@/lib/types";
import { CITIES } from "@/lib/cities";

const GEOCODING_API_URL = "https://geocoding-api.open-meteo.com/v1/search";

export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  feature_code?: string;
  country_code?: string;
  country?: string;
  admin1?: string; // State
  admin2?: string; // District
  admin3?: string; // Tehsil/Subdistrict
  timezone?: string;
}

export interface GeolocationState {
  isSupported: boolean;
  isLocating: boolean;
  error: string | null;
}

/**
 * Search any Indian city, district, town, or recognized locality
 * Using free Open-Meteo Geocoding API (₹0 budget, no API key required).
 */
export async function searchLocations(query: string): Promise<City[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  // Check if query is explicit latitude, longitude numbers (e.g. "23.25, 77.41")
  const coordMatch = trimmed.match(/^([-+]?\d{1,2}(?:\.\d+)?)[,\s]+([-+]?\d{1,3}(?:\.\d+)?)$/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lon = parseFloat(coordMatch[2]);
    if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      return [
        {
          id: `coord_${lat.toFixed(3)}_${lon.toFixed(3)}`,
          nameEn: `Custom Location (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
          nameHi: `कस्टम स्थान (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
          nameMr: `सानुकूल स्थान (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
          stateEn: "User Coordinates",
          stateHi: "उपयोगकर्ता निर्देशांक",
          stateMr: "वापरकर्ता निर्देशांक",
          lat,
          lon,
          isCustom: true,
        },
      ];
    }
  }

  try {
    const params = new URLSearchParams({
      name: trimmed,
      count: "10",
      language: "en",
      format: "json",
    });

    const res = await fetch(`${GEOCODING_API_URL}?${params.toString()}`);
    if (!res.ok) {
      return fallbackLocalSearch(trimmed);
    }

    const data: { results?: GeocodingResult[] } = await res.json();
    if (!data.results || data.results.length === 0) {
      return fallbackLocalSearch(trimmed);
    }

    // Filter to India results first, fallback to all if none in India
    const indiaResults = data.results.filter(
      (r) => r.country_code === "IN" || r.country?.toLowerCase() === "india"
    );
    const resultsToUse = indiaResults.length > 0 ? indiaResults : data.results;

    return resultsToUse.map((item) => {
      const stateName = item.admin1 || item.country || "India";
      const districtName = item.admin2;

      return {
        id: `geo_${item.id || `${item.latitude}_${item.longitude}`}`,
        nameEn: item.name,
        nameHi: item.name, // Keep recognized name clean
        nameMr: item.name,
        stateEn: districtName ? `${districtName}, ${stateName}` : stateName,
        stateHi: districtName ? `${districtName}, ${stateName}` : stateName,
        stateMr: districtName ? `${districtName}, ${stateName}` : stateName,
        district: districtName,
        country: item.country || "India",
        lat: Math.round(item.latitude * 10000) / 10000,
        lon: Math.round(item.longitude * 10000) / 10000,
        isCustom: true,
      };
    });
  } catch {
    return fallbackLocalSearch(trimmed);
  }
}

/**
 * Fallback search against known local locations when offline
 */
function fallbackLocalSearch(query: string): City[] {
  const q = query.toLowerCase();
  return CITIES.filter(
    (c) =>
      c.nameEn.toLowerCase().includes(q) ||
      c.nameHi.includes(q) ||
      c.stateEn.toLowerCase().includes(q)
  );
}

/**
 * Browser GPS Geolocation helper with permission handling
 */
export function requestBrowserLocation(): Promise<City> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      return reject(new Error("Geolocation is not supported by your browser."));
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = Math.round(position.coords.latitude * 10000) / 10000;
        const lon = Math.round(position.coords.longitude * 10000) / 10000;

        // Try to reverse geocode coordinate with Open-Meteo or create clean GPS City object
        try {
          const params = new URLSearchParams({
            latitude: lat.toString(),
            longitude: lon.toString(),
            count: "1",
            language: "en",
            format: "json",
          });
          const res = await fetch(`${GEOCODING_API_URL}?${params.toString()}`);
          if (res.ok) {
            const data = await res.json();
            if (data.results && data.results[0]) {
              const r = data.results[0];
              const resolvedCity: City = {
                id: `gps_${lat}_${lon}`,
                nameEn: r.name || "Current Location",
                nameHi: r.name || "वर्तमान स्थान",
                nameMr: r.name || "सध्याचे स्थान",
                stateEn: r.admin1 ? `${r.admin1} (GPS)` : "GPS Location",
                stateHi: r.admin1 ? `${r.admin1} (जीपीएस)` : "जीपीएस स्थान",
                stateMr: r.admin1 ? `${r.admin1} (जीपीएस)` : "जीपीएस स्थान",
                lat,
                lon,
                isCustom: true,
              };
              return resolve(resolvedCity);
            }
          }
        } catch {
          // Fallback to direct GPS object
        }

        const gpsCity: City = {
          id: `gps_${lat}_${lon}`,
          nameEn: `Current Location (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
          nameHi: `वर्तमान स्थान (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
          nameMr: `सध्याचे स्थान (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
          stateEn: "Device Geolocation",
          stateHi: "डिवाइस जीपीएस",
          stateMr: "डिव्हाइस जीपीएस",
          lat,
          lon,
          isCustom: true,
        };
        resolve(gpsCity);
      },
      (error) => {
        let msg = "Unable to retrieve location.";
        if (error.code === error.PERMISSION_DENIED) {
          msg = "Location permission was denied. You can search any city manually.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = "Location information is unavailable.";
        } else if (error.code === error.TIMEOUT) {
          msg = "Location request timed out.";
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}

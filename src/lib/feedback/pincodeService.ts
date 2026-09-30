import { PincodeLookupResult } from "./farmerFeedbackTypes";

// Standard India Pincode Directory for top agricultural centers and monitored districts
export const INDIA_PINCODES: Record<
  string,
  { village_name: string; district: string; state: string }
> = {
  // Bhopal & surrounding agricultural blocks
  "462001": { village_name: "Bhopal City / Kolar", district: "Bhopal", state: "Madhya Pradesh" },
  "462002": { village_name: "Shahjahanabad", district: "Bhopal", state: "Madhya Pradesh" },
  "462003": { village_name: "Berasia Road / Nishatpura", district: "Bhopal", state: "Madhya Pradesh" },
  "462010": { village_name: "Govindpura Agro Hub", district: "Bhopal", state: "Madhya Pradesh" },
  "462038": { village_name: "Berasia Rural Block", district: "Bhopal", state: "Madhya Pradesh" },
  "463106": { village_name: "Phanda / Sehore Border", district: "Bhopal", state: "Madhya Pradesh" },

  // Sehore (Major Soybean & Wheat belt)
  "466001": { village_name: "Sehore Town", district: "Sehore", state: "Madhya Pradesh" },
  "466113": { village_name: "Ashta Mandi", district: "Sehore", state: "Madhya Pradesh" },
  "466115": { village_name: "Jawar Krishi Kendra", district: "Sehore", state: "Madhya Pradesh" },
  "466114": { village_name: "Kotri Village", district: "Sehore", state: "Madhya Pradesh" },
  "466445": { village_name: "Budhni Narmada Valley", district: "Sehore", state: "Madhya Pradesh" },

  // Vidisha (Grain & Pulse belt)
  "464001": { village_name: "Vidisha Central", district: "Vidisha", state: "Madhya Pradesh" },
  "464221": { village_name: "Ganj Basoda Mandi", district: "Vidisha", state: "Madhya Pradesh" },
  "464226": { village_name: "Sironj Rural", district: "Vidisha", state: "Madhya Pradesh" },
  "464111": { village_name: "Shamshabad Farm Block", district: "Vidisha", state: "Madhya Pradesh" },

  // Raisen
  "464551": { village_name: "Raisen Town", district: "Raisen", state: "Madhya Pradesh" },
  "464990": { village_name: "Bareli Agri Plains", district: "Raisen", state: "Madhya Pradesh" },
  "464993": { village_name: "Gairatganj", district: "Raisen", state: "Madhya Pradesh" },

  // Indore & Malwa Belt
  "452001": { village_name: "Indore Central", district: "Indore", state: "Madhya Pradesh" },
  "453111": { village_name: "Depalpur Farm Belt", district: "Indore", state: "Madhya Pradesh" },
  "453441": { village_name: "Mhow / Dr. Ambedkar Nagar", district: "Indore", state: "Madhya Pradesh" },
  "453551": { village_name: "Sanwer Soybean Mandi", district: "Indore", state: "Madhya Pradesh" },

  // Ujjain
  "456001": { village_name: "Ujjain City", district: "Ujjain", state: "Madhya Pradesh" },
  "456335": { village_name: "Nagda Agriculture Belt", district: "Ujjain", state: "Madhya Pradesh" },
  "456443": { village_name: "Mahidpur Grain Market", district: "Ujjain", state: "Madhya Pradesh" },

  // Jabalpur & Narmada Basin
  "482001": { village_name: "Jabalpur City", district: "Jabalpur", state: "Madhya Pradesh" },
  "483053": { village_name: "Sihora Paddy Belt", district: "Jabalpur", state: "Madhya Pradesh" },
  "483119": { village_name: "Patan Farm Basin", district: "Jabalpur", state: "Madhya Pradesh" },

  // Hoshangabad / Narmadapuram (Major Wheat Basket)
  "461001": { village_name: "Narmadapuram", district: "Hoshangabad", state: "Madhya Pradesh" },
  "461111": { village_name: "Itarsi Mandi", district: "Hoshangabad", state: "Madhya Pradesh" },
  "461228": { village_name: "Pipariya Grain Basin", district: "Hoshangabad", state: "Madhya Pradesh" },

  // Maharashtra Agricultural Zones
  "411001": { village_name: "Pune City", district: "Pune", state: "Maharashtra" },
  "412201": { village_name: "Baramati Sugarcane & Farm Belt", district: "Pune", state: "Maharashtra" },
  "422001": { village_name: "Nashik Central", district: "Nashik", state: "Maharashtra" },
  "422303": { village_name: "Niphad Onion Mandi", district: "Nashik", state: "Maharashtra" },
  "431001": { village_name: "Chhatrapati Sambhajinagar", district: "Aurangabad", state: "Maharashtra" },
  "444001": { village_name: "Akola Cotton Belt", district: "Akola", state: "Maharashtra" },
  "444601": { village_name: "Amravati Soybean Hub", district: "Amravati", state: "Maharashtra" },

  // Rajasthan Zones
  "302001": { village_name: "Jaipur Central", district: "Jaipur", state: "Rajasthan" },
  "303303": { village_name: "Dausa Mustard Belt", district: "Dausa", state: "Rajasthan" },
  "324001": { village_name: "Kota Chambal Basin", district: "Kota", state: "Rajasthan" },
  "325201": { village_name: "Baran Soybean & Spice Mandi", district: "Baran", state: "Rajasthan" },

  // Delhi NCR & Haryana
  "110001": { village_name: "New Delhi", district: "Central Delhi", state: "Delhi" },
  "110036": { village_name: "Alipur Agri Plains", district: "North Delhi", state: "Delhi" },
  "122001": { village_name: "Gurugram", district: "Gurugram", state: "Haryana" },
  "125001": { village_name: "Hisar Cotton & Wheat Belt", district: "Hisar", state: "Haryana" },
  "132001": { village_name: "Karnal Basmati Basin", district: "Karnal", state: "Haryana" },

  // Punjab (Wheat & Paddy)
  "141001": { village_name: "Ludhiana PAU Agriculture Zone", district: "Ludhiana", state: "Punjab" },
  "147001": { village_name: "Patiala Plains", district: "Patiala", state: "Punjab" },

  // Uttar Pradesh
  "226001": { village_name: "Lucknow Central", district: "Lucknow", state: "Uttar Pradesh" },
  "282001": { village_name: "Agra Potato Belt", district: "Agra", state: "Uttar Pradesh" },
  "208001": { village_name: "Kanpur Pulse & Grain Hub", district: "Kanpur", state: "Uttar Pradesh" },

  // South & East Regions
  "560001": { village_name: "Bengaluru Central", district: "Bengaluru Urban", state: "Karnataka" },
  "500001": { village_name: "Hyderabad Central", district: "Hyderabad", state: "Telangana" },
  "600001": { village_name: "Chennai Central", district: "Chennai", state: "Tamil Nadu" },
  "700001": { village_name: "Kolkata Central", district: "Kolkata", state: "West Bengal" },
};

/**
 * Lookup Indian Pincode with instant local cache first, followed by live India Post API
 */
export async function lookupPincode(pincode: string): Promise<PincodeLookupResult> {
  const cleanPin = pincode.trim();
  if (!/^\d{6}$/.test(cleanPin)) {
    return {
      pincode: cleanPin,
      village_name: "",
      district: "",
      state: "",
      is_valid: false,
    };
  }

  // 1. Check local high-speed database
  if (INDIA_PINCODES[cleanPin]) {
    const entry = INDIA_PINCODES[cleanPin];
    return {
      pincode: cleanPin,
      village_name: entry.village_name,
      district: entry.district,
      state: entry.state,
      is_valid: true,
    };
  }

  // 2. Fallback to official India Post public API
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500); // 3.5s timeout

    const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
        const po = data[0].PostOffice[0];
        return {
          pincode: cleanPin,
          village_name: po.Name || cleanPin,
          district: po.District || "",
          state: po.State || "",
          is_valid: true,
        };
      }
    }
  } catch {
    // network timeout or unavailable - allow manual entry
  }

  return {
    pincode: cleanPin,
    village_name: "",
    district: "",
    state: "",
    is_valid: false,
  };
}

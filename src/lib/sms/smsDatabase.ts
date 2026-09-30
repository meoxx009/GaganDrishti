import fs from "fs";
import path from "path";
import {
  SmsRegisteredFarmerRecord,
  SmsLogRecord,
  SmsAnalyticsSummary,
} from "./smsTypes";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const FARMERS_FILE = path.join(DATA_DIR, "sms_registered_farmers.json");
const LOGS_FILE = path.join(DATA_DIR, "sms_logs.json");

// In-memory cache
let cachedFarmers: SmsRegisteredFarmerRecord[] | null = null;
let cachedLogs: SmsLogRecord[] | null = null;

// Initial 25+ realistic rural farmer seed entries for testing and immediate demonstration
const SEED_FARMERS: SmsRegisteredFarmerRecord[] = [
  {
    farmer_id: 1,
    phone_number: "9826011111",
    name: "रामेश्वर पाटीदार (Rameshwar Patidar)",
    pincode: "466001",
    village_name: "Kotri Village",
    district: "Sehore",
    state: "Madhya Pradesh",
    primary_crop: "Soybean",
    language_preference: "Hindi",
    registration_date: "2026-09-01T08:30:00.000Z",
    last_sms_date: "2026-09-29T10:15:00.000Z",
    sms_count: 14,
    alerts_enabled: true,
    sms_daily_limit: 5,
    sms_sent_today: 0,
    last_active_date: "2026-09-29",
  },
  {
    farmer_id: 2,
    phone_number: "9425122222",
    name: "दिनेश यादव (Dinesh Yadav)",
    pincode: "464001",
    village_name: "Ganj Basoda Mandi",
    district: "Vidisha",
    state: "Madhya Pradesh",
    primary_crop: "Paddy",
    language_preference: "Hindi",
    registration_date: "2026-09-02T09:00:00.000Z",
    last_sms_date: "2026-09-29T11:45:00.000Z",
    sms_count: 9,
    alerts_enabled: true,
    sms_daily_limit: 5,
    sms_sent_today: 0,
    last_active_date: "2026-09-29",
  },
  {
    farmer_id: 3,
    phone_number: "9893033333",
    name: "सुरेश वर्मा (Suresh Verma)",
    pincode: "464551",
    village_name: "Sanchi Heritage Village",
    district: "Raisen",
    state: "Madhya Pradesh",
    primary_crop: "Wheat",
    language_preference: "Hindi",
    registration_date: "2026-09-03T10:15:00.000Z",
    last_sms_date: "2026-09-28T14:20:00.000Z",
    sms_count: 18,
    alerts_enabled: true,
    sms_daily_limit: 5,
    sms_sent_today: 0,
    last_active_date: "2026-09-28",
  },
  {
    farmer_id: 4,
    phone_number: "9755044444",
    name: "कमलेश मीना (Kamlesh Meena)",
    pincode: "461775",
    village_name: "Pipariya Grain Mandi",
    district: "Narmadapuram",
    state: "Madhya Pradesh",
    primary_crop: "Chickpea",
    language_preference: "Hindi",
    registration_date: "2026-09-04T11:30:00.000Z",
    last_sms_date: "2026-09-29T08:00:00.000Z",
    sms_count: 11,
    alerts_enabled: true,
    sms_daily_limit: 5,
    sms_sent_today: 0,
    last_active_date: "2026-09-29",
  },
  {
    farmer_id: 5,
    phone_number: "9977055555",
    name: "बलराम जाट (Balram Jat)",
    pincode: "453551",
    village_name: "Sanwer Malwa Farmlands",
    district: "Indore",
    state: "Madhya Pradesh",
    primary_crop: "Soybean",
    language_preference: "Hinglish",
    registration_date: "2026-09-05T07:45:00.000Z",
    last_sms_date: "2026-09-30T06:10:00.000Z",
    sms_count: 22,
    alerts_enabled: true,
    sms_daily_limit: 5,
    sms_sent_today: 1,
    last_active_date: "2026-09-30",
  },
  {
    farmer_id: 6,
    phone_number: "9425066666",
    name: "कैलाश चौधरी (Kailash Choudhary)",
    pincode: "456006",
    village_name: "Nagziri Agro Belt",
    district: "Ujjain",
    state: "Madhya Pradesh",
    primary_crop: "Wheat",
    language_preference: "Hindi",
    registration_date: "2026-09-06T09:20:00.000Z",
    last_sms_date: "2026-09-27T16:00:00.000Z",
    sms_count: 7,
    alerts_enabled: true,
    sms_daily_limit: 5,
    sms_sent_today: 0,
    last_active_date: "2026-09-27",
  },
  {
    farmer_id: 7,
    phone_number: "9826077777",
    name: "भगवान सिंह (Bhagwan Singh)",
    pincode: "455001",
    village_name: "Tonk Khurd Village",
    district: "Dewas",
    state: "Madhya Pradesh",
    primary_crop: "Soybean",
    language_preference: "Hindi",
    registration_date: "2026-09-07T12:00:00.000Z",
    last_sms_date: "2026-09-29T15:30:00.000Z",
    sms_count: 15,
    alerts_enabled: true,
    sms_daily_limit: 5,
    sms_sent_today: 0,
    last_active_date: "2026-09-29",
  },
  {
    farmer_id: 8,
    phone_number: "9822088888",
    name: "पांडुरंग पाटिल (Pandurang Patil)",
    pincode: "422003",
    village_name: "Panchavati Onion Belt",
    district: "Nashik",
    state: "Maharashtra",
    primary_crop: "Cotton",
    language_preference: "Hindi",
    registration_date: "2026-09-08T08:10:00.000Z",
    last_sms_date: "2026-09-29T12:15:00.000Z",
    sms_count: 13,
    alerts_enabled: true,
    sms_daily_limit: 5,
    sms_sent_today: 0,
    last_active_date: "2026-09-29",
  },
  {
    farmer_id: 9,
    phone_number: "9822099999",
    name: "विठ्ठल देशमुख (Vitthal Deshmukh)",
    pincode: "413512",
    village_name: "Ausa Pulses Cluster",
    district: "Latur",
    state: "Maharashtra",
    primary_crop: "Soybean",
    language_preference: "Hindi",
    registration_date: "2026-09-09T14:40:00.000Z",
    last_sms_date: "2026-09-28T09:50:00.000Z",
    sms_count: 19,
    alerts_enabled: true,
    sms_daily_limit: 5,
    sms_sent_today: 0,
    last_active_date: "2026-09-28",
  },
  {
    farmer_id: 10,
    phone_number: "9823010101",
    name: "ज्ञानेश्वर शिंदे (Dnyaneshwar Shinde)",
    pincode: "413002",
    village_name: "Pandharpur Farmlands",
    district: "Solapur",
    state: "Maharashtra",
    primary_crop: "Chickpea",
    language_preference: "Hindi",
    registration_date: "2026-09-10T10:05:00.000Z",
    last_sms_date: "2026-09-29T17:10:00.000Z",
    sms_count: 8,
    alerts_enabled: true,
    sms_daily_limit: 5,
    sms_sent_today: 0,
    last_active_date: "2026-09-29",
  },
  {
    farmer_id: 11,
    phone_number: "9814012121",
    name: "गुरप्रीत सिंह (Gurpreet Singh)",
    pincode: "141004",
    village_name: "PAU Agronomy Farm",
    district: "Ludhiana",
    state: "Punjab",
    primary_crop: "Wheat",
    language_preference: "English",
    registration_date: "2026-09-11T09:30:00.000Z",
    last_sms_date: "2026-09-29T14:00:00.000Z",
    sms_count: 25,
    alerts_enabled: true,
    sms_daily_limit: 5,
    sms_sent_today: 0,
    last_active_date: "2026-09-29",
  },
  {
    farmer_id: 12,
    phone_number: "9814013131",
    name: "हरमिंदर ढिल्लों (Harminder Dhillon)",
    pincode: "147001",
    village_name: "Nabha Grain Basin",
    district: "Patiala",
    state: "Punjab",
    primary_crop: "Paddy",
    language_preference: "English",
    registration_date: "2026-09-12T11:15:00.000Z",
    last_sms_date: "2026-09-28T18:40:00.000Z",
    sms_count: 16,
    alerts_enabled: true,
    sms_daily_limit: 5,
    sms_sent_today: 0,
    last_active_date: "2026-09-28",
  },
  {
    farmer_id: 13,
    phone_number: "9414014141",
    name: "हनुमान राम बिश्नोई (Hanuman Ram Bishnoi)",
    pincode: "324001",
    village_name: "Ladpura Soybean Mandi",
    district: "Kota",
    state: "Rajasthan",
    primary_crop: "Soybean",
    language_preference: "Hindi",
    registration_date: "2026-09-13T07:50:00.000Z",
    last_sms_date: "2026-09-29T09:10:00.000Z",
    sms_count: 12,
    alerts_enabled: true,
    sms_daily_limit: 5,
    sms_sent_today: 0,
    last_active_date: "2026-09-29",
  },
  {
    farmer_id: 14,
    phone_number: "9414015151",
    name: "गोपाल लाल सैनी (Gopal Lal Saini)",
    pincode: "302012",
    village_name: "Chomu Vegetable Hub",
    district: "Jaipur",
    state: "Rajasthan",
    primary_crop: "Wheat",
    language_preference: "Hindi",
    registration_date: "2026-09-14T13:25:00.000Z",
    last_sms_date: "2026-09-29T16:20:00.000Z",
    sms_count: 10,
    alerts_enabled: true,
    sms_daily_limit: 5,
    sms_sent_today: 0,
    last_active_date: "2026-09-29",
  },
  {
    farmer_id: 15,
    phone_number: "9450016161",
    name: "राधेश्याम मौर्य (Radheshyam Maurya)",
    pincode: "226010",
    village_name: "Bakshi Ka Talab",
    district: "Lucknow",
    state: "Uttar Pradesh",
    primary_crop: "Paddy",
    language_preference: "Hindi",
    registration_date: "2026-09-15T08:40:00.000Z",
    last_sms_date: "2026-09-28T11:00:00.000Z",
    sms_count: 17,
    alerts_enabled: true,
    sms_daily_limit: 5,
    sms_sent_today: 0,
    last_active_date: "2026-09-28",
  },
  {
    farmer_id: 16,
    phone_number: "9450017171",
    name: "शिवपूजन सिंह (Shivpujan Singh)",
    pincode: "221005",
    village_name: "Rohania Vegetable Belt",
    district: "Varanasi",
    state: "Uttar Pradesh",
    primary_crop: "Wheat",
    language_preference: "Hindi",
    registration_date: "2026-09-16T10:10:00.000Z",
    last_sms_date: "2026-09-29T13:45:00.000Z",
    sms_count: 14,
    alerts_enabled: true,
    sms_daily_limit: 5,
    sms_sent_today: 0,
    last_active_date: "2026-09-29",
  },
  {
    farmer_id: 17,
    phone_number: "9879018181",
    name: "मनसुखभाई पटेल (Mansukhbhai Patel)",
    pincode: "382481",
    village_name: "Dholka Cotton & Rice Belt",
    district: "Ahmedabad",
    state: "Gujarat",
    primary_crop: "Cotton",
    language_preference: "Hindi",
    registration_date: "2026-09-17T09:00:00.000Z",
    last_sms_date: "2026-09-29T10:30:00.000Z",
    sms_count: 21,
    alerts_enabled: true,
    sms_daily_limit: 5,
    sms_sent_today: 0,
    last_active_date: "2026-09-29",
  },
  {
    farmer_id: 18,
    phone_number: "9879019191",
    name: "किरीटभाई पटेल (Kiritbhai Patel)",
    pincode: "388001",
    village_name: "Anand Dairy & Fodder Belt",
    district: "Anand",
    state: "Gujarat",
    primary_crop: "Maize",
    language_preference: "English",
    registration_date: "2026-09-18T12:30:00.000Z",
    last_sms_date: "2026-09-28T15:20:00.000Z",
    sms_count: 8,
    alerts_enabled: true,
    sms_daily_limit: 5,
    sms_sent_today: 0,
    last_active_date: "2026-09-28",
  },
  {
    farmer_id: 19,
    phone_number: "9812020202",
    name: "धर्मपाल मलिक (Dharampal Malik)",
    pincode: "132001",
    village_name: "NDRI Agri Ring",
    district: "Karnal",
    state: "Haryana",
    primary_crop: "Paddy",
    language_preference: "Hindi",
    registration_date: "2026-09-19T14:15:00.000Z",
    last_sms_date: "2026-09-29T08:45:00.000Z",
    sms_count: 15,
    alerts_enabled: true,
    sms_daily_limit: 5,
    sms_sent_today: 0,
    last_active_date: "2026-09-29",
  },
  {
    farmer_id: 20,
    phone_number: "9425021212",
    name: "मुकेश धाकड़ (Mukesh Dhakad)",
    pincode: "466115",
    village_name: "Bilkisganj Village",
    district: "Sehore",
    state: "Madhya Pradesh",
    primary_crop: "Soybean",
    language_preference: "Hindi",
    registration_date: "2026-09-20T08:00:00.000Z",
    last_sms_date: "2026-09-30T07:15:00.000Z",
    sms_count: 27,
    alerts_enabled: true,
    sms_daily_limit: 5,
    sms_sent_today: 1,
    last_active_date: "2026-09-30",
  },
  {
    farmer_id: 21,
    phone_number: "9425022223",
    name: "सत्यनारायण मालवीय (Satyanarayan Malviya)",
    pincode: "456664",
    village_name: "Mahidpur Farmlands",
    district: "Ujjain",
    state: "Madhya Pradesh",
    primary_crop: "Chickpea",
    language_preference: "Hindi",
    registration_date: "2026-09-21T10:45:00.000Z",
    last_sms_date: "2026-09-28T16:10:00.000Z",
    sms_count: 9,
    alerts_enabled: true,
    sms_daily_limit: 5,
    sms_sent_today: 0,
    last_active_date: "2026-09-28",
  },
  {
    farmer_id: 22,
    phone_number: "9826023232",
    name: "अनिल नागर (Anil Nagar)",
    pincode: "465683",
    village_name: "Sarangpur Mandi Area",
    district: "Rajgarh",
    state: "Madhya Pradesh",
    primary_crop: "Maize",
    language_preference: "Hindi",
    registration_date: "2026-09-22T11:20:00.000Z",
    last_sms_date: "2026-09-29T14:30:00.000Z",
    sms_count: 12,
    alerts_enabled: true,
    sms_daily_limit: 5,
    sms_sent_today: 0,
    last_active_date: "2026-09-29",
  },
  {
    farmer_id: 23,
    phone_number: "9826024242",
    name: "हेमंत रघुवंशी (Hemant Raghuvanshi)",
    pincode: "464221",
    village_name: "Ganj Basoda Rural",
    district: "Vidisha",
    state: "Madhya Pradesh",
    primary_crop: "Soybean",
    language_preference: "Hindi",
    registration_date: "2026-09-23T09:10:00.000Z",
    last_sms_date: "2026-09-30T08:20:00.000Z",
    sms_count: 19,
    alerts_enabled: true,
    sms_daily_limit: 5,
    sms_sent_today: 1,
    last_active_date: "2026-09-30",
  },
  {
    farmer_id: 24,
    phone_number: "9826025252",
    name: "विष्णु कुशवाहा (Vishnu Kushwaha)",
    pincode: "462001",
    village_name: "Bhopal Rural Farmlands",
    district: "Bhopal",
    state: "Madhya Pradesh",
    primary_crop: "Wheat",
    language_preference: "Hindi",
    registration_date: "2026-09-24T15:00:00.000Z",
    last_sms_date: "2026-09-29T18:00:00.000Z",
    sms_count: 14,
    alerts_enabled: true,
    sms_daily_limit: 5,
    sms_sent_today: 0,
    last_active_date: "2026-09-29",
  },
  {
    farmer_id: 25,
    phone_number: "9826026262",
    name: "प्रहलाद दांगी (Prahlad Dangi)",
    pincode: "466651",
    village_name: "Shyampur Kalan",
    district: "Sehore",
    state: "Madhya Pradesh",
    primary_crop: "Soybean",
    language_preference: "Hindi",
    registration_date: "2026-09-25T13:30:00.000Z",
    last_sms_date: "2026-09-30T09:00:00.000Z",
    sms_count: 23,
    alerts_enabled: true,
    sms_daily_limit: 5,
    sms_sent_today: 1,
    last_active_date: "2026-09-30",
  },
];

// Seed SMS Logs
const SEED_LOGS: SmsLogRecord[] = [
  {
    log_id: 1,
    timestamp: "2026-09-30T06:10:00.000Z",
    phone_number: "9977055555",
    incoming_sms: "WEATHER",
    command_parsed: "WEATHER",
    parameters: "pincode=453551",
    outgoing_sms: "Sanwer Malwa Farmlands (453551): 27°C, 25% बारिश (0.0mm), हवा 12km/h। मौसम सामान्य है।",
    status: "Success",
    response_time_ms: 120,
    channel: "Twilio",
  },
  {
    log_id: 2,
    timestamp: "2026-09-30T07:15:00.000Z",
    phone_number: "9425021212",
    incoming_sms: "CROP soybean STAGE flowering",
    command_parsed: "CROP",
    parameters: "crop=soybean, stage=flowering",
    outgoing_sms: "सोयाबीन (Flowering): CAUTION SPRAY! दोपहर 2-5 बजे शांत हवा में करें। Wash-off rain: 20%।",
    status: "Success",
    response_time_ms: 165,
    channel: "Twilio",
  },
  {
    log_id: 3,
    timestamp: "2026-09-30T08:20:00.000Z",
    phone_number: "9826024242",
    incoming_sms: "PEST",
    command_parsed: "PEST",
    parameters: "crop=soybean",
    outgoing_sms: "MEDIUM RISK: तना छेदक (Stem Borer)। निगरानी करें। Chemical: Chlorantraniliprole 18.5% SC।",
    status: "Success",
    response_time_ms: 140,
    channel: "Twilio",
  },
  {
    log_id: 4,
    timestamp: "2026-09-30T09:00:00.000Z",
    phone_number: "9826026262",
    incoming_sms: "ALERT",
    command_parsed: "ALERT",
    parameters: "district=Sehore",
    outgoing_sms: "Sehore: कोई गंभीर मौसमी चेतावनी नहीं। सामान्य खेत कार्य जारी रखें।",
    status: "Success",
    response_time_ms: 110,
    channel: "Twilio",
  },
];

/**
 * Initialize storage files
 */
function ensureStorage() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(FARMERS_FILE)) {
      fs.writeFileSync(FARMERS_FILE, JSON.stringify(SEED_FARMERS, null, 2), "utf8");
      cachedFarmers = [...SEED_FARMERS];
    }
    if (!fs.existsSync(LOGS_FILE)) {
      fs.writeFileSync(LOGS_FILE, JSON.stringify(SEED_LOGS, null, 2), "utf8");
      cachedLogs = [...SEED_LOGS];
    }
  } catch (err) {
    console.error("Error initializing SMS database storage:", err);
  }
}

/**
 * Normalize phone number: strip +91, 0, whitespace, hyphens
 */
export function normalizePhoneNumber(rawPhone: string): string {
  let cleaned = (rawPhone || "").trim().replace(/[^0-9]/g, "");
  if (cleaned.startsWith("91") && cleaned.length === 12) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.startsWith("0") && cleaned.length === 11) {
    cleaned = cleaned.substring(1);
  }
  return cleaned;
}

/**
 * Load farmers list
 */
export function getAllRegisteredFarmers(): SmsRegisteredFarmerRecord[] {
  if (cachedFarmers) return cachedFarmers;
  ensureStorage();
  try {
    if (fs.existsSync(FARMERS_FILE)) {
      const data = fs.readFileSync(FARMERS_FILE, "utf8");
      cachedFarmers = JSON.parse(data);
      return cachedFarmers || [];
    }
  } catch (err) {
    console.error("Error reading registered farmers:", err);
  }
  cachedFarmers = [...SEED_FARMERS];
  return cachedFarmers;
}

/**
 * Save farmers list
 */
function saveFarmers(farmers: SmsRegisteredFarmerRecord[]) {
  cachedFarmers = farmers;
  try {
    ensureStorage();
    fs.writeFileSync(FARMERS_FILE, JSON.stringify(farmers, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing registered farmers:", err);
  }
}

/**
 * Find farmer by 10-digit phone
 */
export function getFarmerByPhone(phone: string): SmsRegisteredFarmerRecord | null {
  const normPhone = normalizePhoneNumber(phone);
  const farmers = getAllRegisteredFarmers();
  return farmers.find((f) => normalizePhoneNumber(f.phone_number) === normPhone) || null;
}

/**
 * Register or update farmer
 */
export function registerOrUpdateFarmer(
  phone: string,
  updates: Partial<SmsRegisteredFarmerRecord>
): SmsRegisteredFarmerRecord {
  const normPhone = normalizePhoneNumber(phone);
  const farmers = getAllRegisteredFarmers();
  const index = farmers.findIndex((f) => normalizePhoneNumber(f.phone_number) === normPhone);

  const todayStr = new Date().toISOString().split("T")[0];

  if (index >= 0) {
    const existing = farmers[index];
    const isNewDay = existing.last_active_date !== todayStr;
    const updated: SmsRegisteredFarmerRecord = {
      ...existing,
      ...updates,
      phone_number: normPhone,
      sms_sent_today: isNewDay ? (updates.sms_sent_today ?? 0) : (updates.sms_sent_today ?? existing.sms_sent_today),
      last_active_date: todayStr,
      last_sms_date: new Date().toISOString(),
    };
    farmers[index] = updated;
    saveFarmers(farmers);
    return updated;
  } else {
    // Create new farmer registration
    const newId = farmers.length > 0 ? Math.max(...farmers.map((f) => f.farmer_id)) + 1 : 1;
    const newFarmer: SmsRegisteredFarmerRecord = {
      farmer_id: newId,
      phone_number: normPhone,
      name: updates.name || "Kisan User",
      pincode: updates.pincode || "462001",
      village_name: updates.village_name || "Bhopal Region",
      district: updates.district || "Bhopal",
      state: updates.state || "Madhya Pradesh",
      primary_crop: updates.primary_crop || "Soybean",
      language_preference: updates.language_preference || "Hindi",
      registration_date: new Date().toISOString(),
      last_sms_date: new Date().toISOString(),
      sms_count: 1,
      alerts_enabled: updates.alerts_enabled ?? true,
      sms_daily_limit: updates.sms_daily_limit ?? 5,
      sms_sent_today: updates.sms_sent_today ?? 1,
      last_active_date: todayStr,
    };
    farmers.push(newFarmer);
    saveFarmers(farmers);
    return newFarmer;
  }
}

/**
 * Increment farmer SMS count and rate limit tracker
 */
export function trackFarmerSmsUsage(phone: string): { allowed: boolean; remaining: number } {
  const normPhone = normalizePhoneNumber(phone);
  const farmers = getAllRegisteredFarmers();
  const index = farmers.findIndex((f) => normalizePhoneNumber(f.phone_number) === normPhone);

  const todayStr = new Date().toISOString().split("T")[0];

  if (index >= 0) {
    const farmer = farmers[index];
    let sentToday = farmer.sms_sent_today || 0;
    if (farmer.last_active_date !== todayStr) {
      sentToday = 0;
    }

    if (sentToday >= farmer.sms_daily_limit) {
      return { allowed: false, remaining: 0 };
    }

    farmer.sms_sent_today = sentToday + 1;
    farmer.sms_count = (farmer.sms_count || 0) + 1;
    farmer.last_active_date = todayStr;
    farmer.last_sms_date = new Date().toISOString();
    farmers[index] = farmer;
    saveFarmers(farmers);
    return { allowed: true, remaining: farmer.sms_daily_limit - farmer.sms_sent_today };
  }

  return { allowed: true, remaining: 4 };
}

/**
 * Load SMS logs
 */
export function getAllSmsLogs(limit: number = 100): SmsLogRecord[] {
  if (cachedLogs) return cachedLogs.slice(-limit).reverse();
  ensureStorage();
  try {
    if (fs.existsSync(LOGS_FILE)) {
      const data = fs.readFileSync(LOGS_FILE, "utf8");
      cachedLogs = JSON.parse(data);
      return (cachedLogs || []).slice(-limit).reverse();
    }
  } catch (err) {
    console.error("Error reading SMS logs:", err);
  }
  cachedLogs = [...SEED_LOGS];
  return cachedLogs.slice(-limit).reverse();
}

/**
 * Append an SMS log transaction
 */
export function logSmsTransaction(
  logData: Omit<SmsLogRecord, "log_id" | "timestamp">
): SmsLogRecord {
  ensureStorage();
  let logs: SmsLogRecord[] = [];
  try {
    if (fs.existsSync(LOGS_FILE)) {
      const data = fs.readFileSync(LOGS_FILE, "utf8");
      logs = JSON.parse(data);
    }
  } catch {
    logs = [...SEED_LOGS];
  }

  const newId = logs.length > 0 ? Math.max(...logs.map((l) => l.log_id)) + 1 : 1;
  const newLog: SmsLogRecord = {
    ...logData,
    log_id: newId,
    timestamp: new Date().toISOString(),
  };

  logs.push(newLog);
  cachedLogs = logs;

  try {
    fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing SMS log:", err);
  }

  return newLog;
}

/**
 * Computes high-level analytics for the dashboard
 */
export function getSmsAnalytics(): SmsAnalyticsSummary {
  const farmers = getAllRegisteredFarmers();
  const logs = getAllSmsLogs(1000);

  const todayStr = new Date().toISOString().split("T")[0];
  let todayCount = 0;
  const commandMap: Record<string, number> = {};
  const districtSet = new Set<string>();
  let totalTime = 0;
  let successfulLogs = 0;

  logs.forEach((log) => {
    if (log.timestamp.startsWith(todayStr)) {
      todayCount++;
    }
    const cmd = log.command_parsed || "UNKNOWN";
    commandMap[cmd] = (commandMap[cmd] || 0) + 1;
    totalTime += log.response_time_ms || 100;
    if (log.status === "Success") {
      successfulLogs++;
    }
  });

  farmers.forEach((f) => {
    if (f.district) districtSet.add(f.district);
  });

  const totalLogs = logs.length;
  const avgTime = totalLogs > 0 ? Math.round(totalTime / totalLogs) : 120;
  const successRate = totalLogs > 0 ? Math.round((successfulLogs / totalLogs) * 100) : 100;

  return {
    totalFarmers: farmers.length,
    totalSmsProcessed: totalLogs,
    todaySmsCount: todayCount,
    commandBreakdown: commandMap,
    activeDistricts: Array.from(districtSet),
    averageResponseTimeMs: avgTime,
    successRatePct: successRate,
  };
}

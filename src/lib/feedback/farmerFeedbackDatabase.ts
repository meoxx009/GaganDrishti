import fs from "fs";
import path from "path";
import { FarmerFeedbackRecord } from "./farmerFeedbackTypes";

const DEFAULT_FEEDBACK_SEED: any[] = [
  {
    feedback_id: 1001,
    created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    farmer_name: "Rameshwar Patidar",
    phone_number: "9826012345",
    village: "Kotri Village",
    village_name: "Kotri Village",
    pincode: "466001",
    district: "Sehore",
    state: "Madhya Pradesh",
    crop_name: "Soybean",
    crop_stage: "Flowering",
    farm_health_rating: 8,
    outcome_rating: 4,
    pest_observed: false,
    pest_disease_observed: "None",
    activity_today: "Irrigation",
    additional_notes: "Soil moisture adequate after morning irrigation.",
  },
  {
    feedback_id: 1002,
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    farmer_name: "Dinesh Yadav",
    phone_number: "9425178901",
    village: "Bilkisganj",
    village_name: "Bilkisganj",
    pincode: "466115",
    district: "Sehore",
    state: "Madhya Pradesh",
    crop_name: "Soybean",
    crop_stage: "Vegetative",
    farm_health_rating: 7,
    outcome_rating: 4,
    pest_observed: true,
    pest_disease_observed: "Whitefly (सफेद मक्खी)",
    activity_today: "Spraying Pesticide",
    additional_notes: "Applied neem oil spray as advised by app.",
  },
  {
    feedback_id: 1003,
    created_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    farmer_name: "Suresh Meena",
    phone_number: "9827033445",
    village: "Sanchi Dehat",
    village_name: "Sanchi Dehat",
    pincode: "464551",
    district: "Raisen",
    state: "Madhya Pradesh",
    crop_name: "Paddy",
    crop_stage: "Vegetative",
    farm_health_rating: 9,
    outcome_rating: 5,
    pest_observed: false,
    pest_disease_observed: "None",
    activity_today: "Fertilizer Application",
    additional_notes: "Canal water release timely; crop condition excellent.",
  },
  {
    feedback_id: 1004,
    created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    farmer_name: "Babulal Kushwaha",
    phone_number: "9981044556",
    village: "Ganj Basoda",
    village_name: "Ganj Basoda",
    pincode: "464221",
    district: "Vidisha",
    state: "Madhya Pradesh",
    crop_name: "Wheat",
    crop_stage: "Sowing",
    farm_health_rating: 8,
    outcome_rating: 4,
    pest_observed: false,
    pest_disease_observed: "None",
    activity_today: "Sowing",
    additional_notes: "Sowing completed under optimal soil temperature.",
  },
  {
    feedback_id: 1005,
    created_at: new Date(Date.now() - 60 * 3600 * 1000).toISOString(),
    timestamp: new Date(Date.now() - 60 * 3600 * 1000).toISOString(),
    farmer_name: "Kamal Singh Dhakad",
    phone_number: "9755011223",
    village: "Badi Tehsil",
    village_name: "Badi Tehsil",
    pincode: "464665",
    district: "Raisen",
    state: "Madhya Pradesh",
    crop_name: "Soybean",
    crop_stage: "Pod Fill",
    farm_health_rating: 6,
    outcome_rating: 3,
    pest_observed: true,
    pest_disease_observed: "Yellow Mosaic Virus",
    activity_today: "Inspection",
    additional_notes: "Early YMV patches noticed near field perimeter.",
  },
  {
    feedback_id: 1006,
    created_at: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    timestamp: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    farmer_name: "Mukesh Rajput",
    phone_number: "9826077889",
    village: "Silwani Forest Border",
    village_name: "Silwani Forest Border",
    pincode: "464886",
    district: "Raisen",
    state: "Madhya Pradesh",
    crop_name: "Soybean",
    crop_stage: "Flowering",
    farm_health_rating: 7,
    outcome_rating: 4,
    pest_observed: false,
    pest_disease_observed: "None",
    activity_today: "Drainage Clearing",
    additional_notes: "Dug trenches before heavy afternoon rain.",
  },
];

// Helper to get all feedback records
export function loadAllFarmerFeedback(): any[] {
  try {
    const filePath = path.join(process.cwd(), "src", "data", "farmer_feedback.json");
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item) => ({
          ...item,
          village: item.village_name || item.village || "Unknown Village",
          farm_health_rating: item.farm_health_rating || (item.outcome_rating ? item.outcome_rating * 2 : 7),
          pest_disease_observed: item.pest_type || item.pest_disease_observed || (item.pest_observed ? "Pest Observed" : "None"),
          created_at: item.created_at || item.timestamp || new Date().toISOString(),
        }));
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_FEEDBACK_SEED;
}

export const getAllFarmerFeedback = loadAllFarmerFeedback;

export const FARMER_FEEDBACK: any[] = loadAllFarmerFeedback();

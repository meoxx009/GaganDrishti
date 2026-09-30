import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { FarmerFeedbackRecord } from "@/lib/feedback/farmerFeedbackTypes";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const FEEDBACK_FILE = path.join(DATA_DIR, "farmer_feedback.json");

// Ensure data directory and file exist
function getFeedbackStorage(): FarmerFeedbackRecord[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(FEEDBACK_FILE)) {
      // Seed with initial realistic baseline records for demonstration & immediate analytics
      const initialSeed: FarmerFeedbackRecord[] = [
        {
          feedback_id: 1001,
          timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
          farmer_name: "रामेश्वर पाटीदार",
          phone_number: "9826012345",
          whatsapp_number: "9826012345",
          pincode: "466001",
          village_name: "Kotri Village",
          district: "Sehore",
          state: "Madhya Pradesh",
          crop_name: "Soybean",
          crop_stage: "Pod Fill/Grain Dev (50-80 days)",
          activity_today: "Spraying Fungicide",
          weather_today: "धूप खिली थी, तापमान 29°C, हवा शांत थी, बारिश नहीं हुई",
          action_taken: "अनुशंसा अनुसार शाम 4 बजे 4 एकड़ सोयाबीन पर कवकनाशी का छिड़काव किया।",
          outcome_rating: 5,
          outcome_notes: "फसल बिल्कुल स्वस्थ है और फली भराव अच्छा हो रहा है।",
          pest_observed: false,
          disease_observed: false,
          follow_up_needed: false,
          submission_source: "Web Form",
        },
        {
          feedback_id: 1002,
          timestamp: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
          farmer_name: "दिनेश यादव",
          phone_number: "9425178901",
          whatsapp_number: "9425178901",
          pincode: "464001",
          village_name: "Ganj Basoda Mandi",
          district: "Vidisha",
          state: "Madhya Pradesh",
          crop_name: "Paddy",
          crop_stage: "Vegetative (10-35 days)",
          activity_today: "Irrigation",
          weather_today: "आसमान में हल्के बादल, 27°C, रात में हल्की बूंदाबांदी का अंदेशा था",
          action_taken: "मौसम अलर्ट देखकर आज भारी सिंचाई टाल दी, केवल हल्की क्यारी में पानी दिया।",
          outcome_rating: 4,
          outcome_notes: "पानी की बचत हुई और जलजमाव नहीं हुआ।",
          pest_observed: true,
          pest_type: "तना छेदक (Stem Borer)",
          disease_observed: false,
          follow_up_needed: true,
          submission_source: "Web Form",
        },
        {
          feedback_id: 1003,
          timestamp: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
          farmer_name: "सुरेश चंद मीना",
          phone_number: "9753209876",
          pincode: "462038",
          village_name: "Berasia Rural Block",
          district: "Bhopal",
          state: "Madhya Pradesh",
          crop_name: "Soybean",
          crop_stage: "Flowering (35-50 days)",
          activity_today: "Spraying Pesticide",
          weather_today: "तेज धूप, दोपहर 31°C, 10 किमी/घंटे की सामान्य हवा",
          action_taken: "सुबह 7 बजे 5 एकड़ में सुंडी नियंत्रण के लिए दवा का छिड़काव किया।",
          outcome_rating: 5,
          outcome_notes: "कीट नियंत्रण में त्वरित सुधार दिखा।",
          pest_observed: true,
          pest_type: "गुलाबी सुंडी / तंबाकू इल्ली",
          disease_observed: false,
          follow_up_needed: false,
          submission_source: "Web Form",
        },
        {
          feedback_id: 1004,
          timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
          farmer_name: "कमल धाकड़",
          phone_number: "9179043210",
          whatsapp_number: "9179043210",
          pincode: "453551",
          village_name: "Sanwer Soybean Mandi",
          district: "Indore",
          state: "Madhya Pradesh",
          crop_name: "Wheat",
          crop_stage: "Sowing (0-10 days)",
          activity_today: "Fertilizer Application",
          weather_today: "मौसम सुहावना, 26°C, हवा हल्की",
          action_taken: "खेत की तैयारी के साथ अनुशंसित DAP व पोटाश का आधार खुराक दिया।",
          outcome_rating: 4,
          pest_observed: false,
          disease_observed: false,
          follow_up_needed: false,
          submission_source: "Web Form",
        },
      ];
      fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(initialSeed, null, 2), "utf8");
      return initialSeed;
    }
    const content = fs.readFileSync(FEEDBACK_FILE, "utf8");
    return JSON.parse(content) as FarmerFeedbackRecord[];
  } catch (err) {
    console.error("Error reading feedback file:", err);
    return [];
  }
}

function saveFeedbackStorage(records: FarmerFeedbackRecord[]): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(records, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("Error saving feedback file:", err);
    return false;
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const district = searchParams.get("district");
    const crop = searchParams.get("crop");

    let records = getFeedbackStorage();

    if (district) {
      records = records.filter(
        (r) => r.district?.toLowerCase() === district.toLowerCase()
      );
    }
    if (crop) {
      records = records.filter(
        (r) => r.crop_name?.toLowerCase() === crop.toLowerCase()
      );
    }

    // Sort newest first
    records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({
      success: true,
      total_count: records.length,
      records: records.slice(0, limit),
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Failed to retrieve feedback records" },
      { status: 500 }
    );
  }
}

import {
  validateEntireFarmerFeedbackForm,
  logValidationError,
} from "@/lib/validation/formValidationEngine";
import { logFormSubmission } from "@/lib/monitoring/monitoringEngine";

export async function POST(req: Request) {
  const startTime = Date.now();
  try {
    const body = await req.json();

    // Comprehensive Field & Form Validation (FINAL_005)
    const validation = await validateEntireFarmerFeedbackForm({
      farmer_name: body.farmer_name,
      phone_number: body.phone_number,
      pincode: body.pincode,
      crop_name: body.crop_name,
      crop_stage: body.crop_stage,
      activity_today: body.activity_today,
      weather_today: body.weather_today,
      action_taken: body.action_taken,
      outcome_rating: body.outcome_rating,
    });

    if (!validation.is_valid) {
      // Log the first validation failure
      const firstField = Object.keys(validation.field_errors)[0];
      const errorMsg = validation.field_errors[firstField];
      logValidationError({
        error_type: firstField.includes("phone")
          ? "invalid_phone"
          : firstField.includes("pin")
          ? "invalid_pincode"
          : "missing_field",
        field_name: firstField,
        user_message_hi: errorMsg,
        user_message_en: validation.form_error_en || "Validation error",
        raw_technical_error: `Failed validation on ${firstField}: ${errorMsg}`,
      });

      // FINAL_007: Log failed submission
      logFormSubmission({
        form_name: "farmer_feedback",
        pincode: body.pincode,
        farmer_name: body.farmer_name,
        status: "validation_error",
        error_details: validation.form_error_en || "Validation error",
        submission_time_ms: Date.now() - startTime,
      });

      return NextResponse.json(
        {
          success: false,
          error: validation.form_error_hi || "कृपया सभी जरूरी फ़ील्ड सही तरीके से भरें।",
          field_errors: validation.field_errors,
        },
        { status: 400 }
      );
    }

    const cleanPhone = (body.phone_number || "").toString().replace(/\D/g, "");
    const cleanPin = (body.pincode || "").toString().trim();
    const rating = parseInt(body.outcome_rating, 10);

    // Load existing records
    const existing = getFeedbackStorage();
    const maxId = existing.reduce((max, r) => (r.feedback_id > max ? r.feedback_id : max), 1000);
    const newFeedbackId = maxId + 1;

    const newRecord: FarmerFeedbackRecord = {
      feedback_id: newFeedbackId,
      timestamp: new Date().toISOString(),
      farmer_name: body.farmer_name.trim().slice(0, 100),
      phone_number: cleanPhone,
      whatsapp_number: body.whatsapp_number ? body.whatsapp_number.toString().replace(/\D/g, "").slice(0, 10) : undefined,
      pincode: cleanPin,
      village_name: body.village_name?.trim().slice(0, 100) || undefined,
      district: body.district?.trim().slice(0, 100) || undefined,
      state: body.state?.trim().slice(0, 100) || undefined,
      crop_name: body.crop_name,
      crop_stage: body.crop_stage,
      activity_today: body.activity_today,
      weather_today: body.weather_today.trim().slice(0, 500),
      action_taken: body.action_taken.trim().slice(0, 500),
      outcome_rating: rating,
      outcome_notes: body.outcome_notes?.trim().slice(0, 500) || undefined,
      photo_url: body.photo_url || undefined,
      pest_observed: Boolean(body.pest_observed),
      pest_type: body.pest_observed ? body.pest_type?.trim().slice(0, 100) : undefined,
      disease_observed: Boolean(body.disease_observed),
      disease_type: body.disease_observed ? body.disease_type?.trim().slice(0, 100) : undefined,
      follow_up_needed: Boolean(body.follow_up_needed),
      submission_source: body.submission_source || "Web Form",
    };

    existing.unshift(newRecord);
    const saved = saveFeedbackStorage(existing);

    if (!saved) {
      return NextResponse.json({ success: false, error: "Failed to persist feedback record" }, { status: 500 });
    }

    // FINAL_007: Log successful submission
    logFormSubmission({
      form_name: "farmer_feedback",
      pincode: cleanPin,
      farmer_name: newRecord.farmer_name,
      status: "success",
      submission_time_ms: Date.now() - startTime,
    });

    return NextResponse.json({
      success: true,
      feedback_id: newRecord.feedback_id,
      message: "Feedback submitted and recorded successfully",
      record: newRecord,
    });
  } catch (err) {
    console.error("Error creating feedback:", err);
    return NextResponse.json({ success: false, error: "Internal server error submitting feedback" }, { status: 500 });
  }
}

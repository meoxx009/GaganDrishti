import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { FarmerFeedbackRecord } from "@/lib/feedback/farmerFeedbackTypes";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const FEEDBACK_FILE = path.join(DATA_DIR, "farmer_feedback.json");

function getFeedbackStorage(): FarmerFeedbackRecord[] {
  try {
    if (!fs.existsSync(FEEDBACK_FILE)) {
      return [];
    }
    const content = fs.readFileSync(FEEDBACK_FILE, "utf8");
    return JSON.parse(content) as FarmerFeedbackRecord[];
  } catch (err) {
    console.error("Error reading feedback file for analytics:", err);
    return [];
  }
}

export async function GET() {
  try {
    const records = getFeedbackStorage();
    const total_count = records.length;

    // 1. By District
    const districtMap: Record<string, number> = {};
    records.forEach((r) => {
      const dist = r.district || "Other / Unspecified";
      districtMap[dist] = (districtMap[dist] || 0) + 1;
    });
    const by_district = Object.entries(districtMap)
      .map(([district, count]) => ({ district, count }))
      .sort((a, b) => b.count - a.count);

    // 2. By Crop
    const cropMap: Record<string, number> = {};
    records.forEach((r) => {
      const crop = r.crop_name || "Unknown";
      cropMap[crop] = (cropMap[crop] || 0) + 1;
    });
    const by_crop = Object.entries(cropMap)
      .map(([crop_name, count]) => ({ crop_name, count }))
      .sort((a, b) => b.count - a.count);

    // 3. Outcome Rating Distribution (1 to 5 stars)
    const ratingMap: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let ratingSum = 0;
    records.forEach((r) => {
      const rating = Number(r.outcome_rating) || 3;
      ratingMap[rating] = (ratingMap[rating] || 0) + 1;
      ratingSum += rating;
    });
    const average_rating = total_count > 0 ? (ratingSum / total_count).toFixed(2) : "0.00";

    const outcome_distribution = [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      count: ratingMap[stars] || 0,
      percentage: total_count > 0 ? Math.round(((ratingMap[stars] || 0) / total_count) * 100) : 0,
    }));

    // 4. Pest Observations
    const pestMap: Record<string, number> = {};
    records.forEach((r) => {
      if (r.pest_observed && r.pest_type) {
        const pest = r.pest_type.trim();
        pestMap[pest] = (pestMap[pest] || 0) + 1;
      }
    });
    const pest_observations = Object.entries(pestMap)
      .map(([pest_type, occurrence]) => ({ pest_type, occurrence }))
      .sort((a, b) => b.occurrence - a.occurrence);

    // 5. Disease Observations
    const diseaseMap: Record<string, number> = {};
    records.forEach((r) => {
      if (r.disease_observed && r.disease_type) {
        const disease = r.disease_type.trim();
        diseaseMap[disease] = (diseaseMap[disease] || 0) + 1;
      }
    });
    const disease_observations = Object.entries(diseaseMap)
      .map(([disease_type, occurrence]) => ({ disease_type, occurrence }))
      .sort((a, b) => b.occurrence - a.occurrence);

    // 6. Recent Feedback list
    const recent_feedback = [...records]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20);

    return NextResponse.json({
      success: true,
      total_count,
      average_rating,
      by_district,
      by_crop,
      outcome_distribution,
      pest_observations,
      disease_observations,
      recent_feedback,
    });
  } catch (err) {
    console.error("Error generating feedback analytics:", err);
    return NextResponse.json(
      { success: false, error: "Failed to generate analytics" },
      { status: 500 }
    );
  }
}

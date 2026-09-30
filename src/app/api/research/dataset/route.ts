import { NextRequest, NextResponse } from "next/server";
import { generateKaggleDataset, convertKaggleDatasetToCsv } from "@/lib/research/kaggleDatasetGenerator";
import { KAGGLE_COMPETITION } from "@/lib/research/academicPapersDatabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "json";
    const count = parseInt(searchParams.get("count") || "500", 10);

    const rows = generateKaggleDataset(Math.min(count, 5000));

    if (format === "download" || format === "csv") {
      const csv = convertKaggleDatasetToCsv(rows);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="GaganDrishti_Farmer_Advisory_Dataset_2024.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      metadata: {
        dataset_name: "GaganDrishti_Farmer_Advisory_Dataset_2024",
        license: "CC-BY 4.0 (Open Data Commons)",
        privacy: "Fully Anonymized (No farmer names, no mobile numbers, aggregated district geography)",
        total_rows_sampled: rows.length,
        features_count: 12,
        target_variable: "outcome_rating_1_to_5",
        kaggle_competition: KAGGLE_COMPETITION,
      },
      sample_rows: rows.slice(0, 25),
    });
  } catch (error: any) {
    console.error("Dataset API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate dataset" },
      { status: 500 }
    );
  }
}

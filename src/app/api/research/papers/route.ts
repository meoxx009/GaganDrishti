import { NextRequest, NextResponse } from "next/server";
import {
  RESEARCH_PAPERS,
  CONFERENCE_DECKS,
  KAGGLE_COMPETITION,
  GOVERNMENT_PARTNERSHIPS,
  COMMERCIAL_LICENSES,
  QUARTERLY_REPORT_SECTIONS,
  PHD_TOPICS,
} from "@/lib/research/academicPapersDatabase";

export async function GET(req: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      papers: RESEARCH_PAPERS,
      conferences: CONFERENCE_DECKS,
      kaggle: KAGGLE_COMPETITION,
      partnerships: GOVERNMENT_PARTNERSHIPS,
      licenses: COMMERCIAL_LICENSES,
      quarterly_report: QUARTERLY_REPORT_SECTIONS,
      phd_topics: PHD_TOPICS,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

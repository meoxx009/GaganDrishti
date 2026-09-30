import { KaggleDatasetRow } from "./researchTypes";

const DISTRICTS = ["Raisen", "Sehore", "Vidisha", "Bhopal", "Sagar", "Hoshangabad", "Dewas", "Ujjain", "Indore", "Jabalpur"];
const CROPS = ["Soybean", "Paddy", "Wheat", "Chickpea", "Maize"];
const STAGES = ["Sowing", "Vegetative", "Flowering", "Pod-Fill", "Maturity"];
const ACTIVITIES = ["Spray", "Irrigation", "Fertilizer", "Sowing", "Harvesting"];

/**
 * Deterministically generates an anonymized research dataset row
 */
export function generateAnonymizedRow(index: number): KaggleDatasetRow {
  const dist = DISTRICTS[index % DISTRICTS.length];
  const crop = CROPS[(index * 3) % CROPS.length];
  const stage = STAGES[(index * 7) % STAGES.length];
  const activity = ACTIVITIES[(index * 2) % ACTIVITIES.length];

  // Base day offset
  const dayOffset = (index * 13) % 90;
  const dateObj = new Date(Date.now() - dayOffset * 24 * 3600 * 1000);
  const feedback_date = dateObj.toISOString().split("T")[0];

  // Weather parameters
  const temp = Math.round((24 + ((index * 17) % 13) + Math.sin(index) * 2) * 10) / 10;
  const humidity = 50 + ((index * 23) % 45);
  const rainProb = (index * 19) % 100;
  const wind = Math.round((8 + ((index * 11) % 25)) * 10) / 10;

  // Pest & disease observations
  const pest_observed = humidity > 75 && temp > 28 && (index % 3 === 0);
  const disease_observed = humidity > 82 && (index % 4 === 0);

  // Outcome rating (Target variable: 1 to 5)
  // Higher if good weather, lower if adverse weather occurred during activity
  let outcome = 4;
  if (activity === "Spray" && rainProb > 65) {
    outcome = 2; // Rain washed away spray
  } else if (activity === "Harvesting" && rainProb > 50) {
    outcome = 1; // Rain damaged harvested crop
  } else if (pest_observed && !disease_observed) {
    outcome = 3;
  } else if (disease_observed) {
    outcome = 2;
  } else if (temp >= 24 && temp <= 30 && humidity < 75) {
    outcome = 5; // Perfect conditions
  }

  return {
    feedback_date,
    district: dist,
    crop,
    crop_stage: stage,
    temperature_celsius: temp,
    humidity_percent: humidity,
    rain_probability_percent: rainProb,
    wind_speed_kmh: wind,
    activity_performed: activity,
    outcome_rating_1_to_5: outcome,
    pest_observed,
    disease_observed,
  };
}

/**
 * Generates an array of Kaggle dataset rows
 */
export function generateKaggleDataset(count: number = 250): KaggleDatasetRow[] {
  const rows: KaggleDatasetRow[] = [];
  for (let i = 0; i < count; i++) {
    rows.push(generateAnonymizedRow(i + 1));
  }
  return rows;
}

/**
 * Converts dataset rows to CSV format
 */
export function convertKaggleDatasetToCsv(rows: KaggleDatasetRow[]): string {
  const headers = [
    "feedback_date",
    "district",
    "crop",
    "crop_stage",
    "temperature_celsius",
    "humidity_percent",
    "rain_probability_percent",
    "wind_speed_kmh",
    "activity_performed",
    "outcome_rating_1_to_5",
    "pest_observed",
    "disease_observed",
  ];

  const lines = [headers.join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.feedback_date,
        `"${r.district}"`,
        `"${r.crop}"`,
        `"${r.crop_stage}"`,
        r.temperature_celsius,
        r.humidity_percent,
        r.rain_probability_percent,
        r.wind_speed_kmh,
        `"${r.activity_performed}"`,
        r.outcome_rating_1_to_5,
        r.pest_observed,
        r.disease_observed,
      ].join(",")
    );
  }

  return lines.join("\n");
}

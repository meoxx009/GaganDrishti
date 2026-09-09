export type CropId = "wheat" | "paddy" | "soybean" | "maize" | "mustard";

export type StageId = "sowing" | "growing" | "flowering" | "harvesting";

export type WeatherWindowStatus =
  | "GOOD WEATHER WINDOW"
  | "CAUTION"
  | "AVOID DUE TO WEATHER"
  | "INSUFFICIENT DATA";

export interface CropOption {
  id: CropId;
  nameEn: string;
  nameHi: string;
  iconName: string;
}

export interface StageOption {
  id: StageId;
  nameEn: string;
  nameHi: string;
  descriptionEn: string;
  descriptionHi: string;
}

export interface FarmerDecisionResult {
  irrigationStatus: WeatherWindowStatus;
  irrigationReasonEn: string;
  irrigationReasonHi: string;
  sprayStatus: WeatherWindowStatus;
  sprayReasonEn: string;
  sprayReasonHi: string;
  considerTodayEn: string[];
  considerTodayHi: string[];
  avoidTodayEn: string[];
  avoidTodayHi: string[];
  fieldHeatNoticeEn?: string;
  fieldHeatNoticeHi?: string;
  drainageNoticeEn?: string;
  drainageNoticeHi?: string;
}

export const CROPS: CropOption[] = [
  { id: "wheat", nameEn: "Wheat", nameHi: "गेहूँ", iconName: "Wheat" },
  { id: "paddy", nameEn: "Paddy", nameHi: "धान", iconName: "Sprout" },
  { id: "soybean", nameEn: "Soybean", nameHi: "सोयाबीन", iconName: "Leaf" },
  { id: "maize", nameEn: "Maize", nameHi: "मक्का", iconName: "Tractor" },
  { id: "mustard", nameEn: "Mustard", nameHi: "सरसों", iconName: "Flower" },
];

export const STAGES: StageOption[] = [
  {
    id: "sowing",
    nameEn: "Sowing",
    nameHi: "बुवाई",
    descriptionEn: "Seedbed preparation & emergence",
    descriptionHi: "बीज रोपण एवं अंकुरण अवस्था",
  },
  {
    id: "growing",
    nameEn: "Growing",
    nameHi: "वृद्धि",
    descriptionEn: "Vegetative growth & tillering",
    descriptionHi: "वानस्पतिक विकास अवस्था",
  },
  {
    id: "flowering",
    nameEn: "Flowering",
    nameHi: "फूल अवस्था",
    descriptionEn: "Anthesis & grain filling",
    descriptionHi: "पुष्पीकरण एवं दाना भराव",
  },
  {
    id: "harvesting",
    nameEn: "Harvesting",
    nameHi: "कटाई",
    descriptionEn: "Maturity & harvesting",
    descriptionHi: "फसल परिपक्वता एवं कटाई",
  },
];

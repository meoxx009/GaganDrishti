import { City, Language } from "@/lib/types";
import { NormalizedWeatherData } from "@/lib/weather/types";
import { CropId, StageId } from "@/lib/weather/farmerTypes";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isFallback?: boolean;
  evidence?: ChatEvidencePackage;
}

export interface ChatHistoryItem {
  role: "user" | "assistant";
  content: string;
}

export interface ChatEvidencePackage {
  intent: string;
  resolvedLocation: string;
  targetWindow: string;
  weatherVariable: string;
  keyMetrics: Record<string, string | number | boolean>;
  source: string;
  timestamp: string;
}

export interface ChatApiRequest {
  message: string;
  language: Language;
  city: City;
  weather: NormalizedWeatherData | null;
  selectedCrop?: CropId;
  selectedStage?: StageId;
  history?: ChatHistoryItem[];
}

export interface ChatApiResponse {
  reply: string;
  isFallback: boolean;
  modelUsed?: string;
  evidence?: ChatEvidencePackage;
}

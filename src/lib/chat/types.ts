import { City, Language } from "@/lib/types";
import { NormalizedWeatherData } from "@/lib/weather/types";
import { CropId, StageId } from "@/lib/weather/farmerTypes";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isFallback?: boolean;
}

export interface ChatApiRequest {
  message: string;
  language: Language;
  city: City;
  weather: NormalizedWeatherData | null;
  selectedCrop?: CropId;
  selectedStage?: StageId;
}

export interface ChatApiResponse {
  reply: string;
  isFallback: boolean;
  modelUsed?: string;
}

export type SpeechLanguage = "en" | "hi";

export interface SpeechRecognitionResultState {
  isSupported: boolean;
  isListening: boolean;
  interimTranscript: string;
  finalTranscript: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  clearError: () => void;
  clearTranscript: () => void;
}

export interface SpeechSynthesisState {
  isSupported: boolean;
  currentlySpeakingId: string | null;
  speak: (messageId: string, text: string, lang: SpeechLanguage) => void;
  stop: () => void;
}

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { SpeechLanguage } from "./types";

interface UseSpeechRecognitionProps {
  language: SpeechLanguage;
  onFinalTranscript: (transcript: string) => void;
}

export const SPEECH_MESSAGES = {
  listening_en: "Listening…",
  listening_hi: "सुन रहा हूँ…",
  listening_mr: "ऐकत आहे…",
  permission_en:
    "Microphone access is blocked. Allow microphone permission in your browser and try again.",
  permission_hi:
    "माइक्रोफ़ोन की अनुमति बंद है। ब्राउज़र में माइक्रोफ़ोन अनुमति चालू करके फिर प्रयास करें।",
  permission_mr:
    "मायक्रोफोन परवानगी अवरोधित आहे. ब्राउझरमध्ये परवानगी चालू करा आणि पुन्हा प्रयत्न करा.",
  no_speech_en: "No speech detected. Please try again or type your question.",
  no_speech_hi: "आवाज़ पहचान में नहीं आई। फिर प्रयास करें या अपना प्रश्न टाइप करें।",
  no_speech_mr: "आवाज ओळखता आला नाही. पुन्हा प्रयत्न करा किंवा प्रश्न टाईप करा.",
  unsupported_en:
    "Voice input is not supported on this browser. You can continue by typing.",
  unsupported_hi:
    "इस ब्राउज़र में वॉइस इनपुट उपलब्ध नहीं है। आप प्रश्न टाइप करके जारी रख सकते हैं।",
  unsupported_mr:
    "या ब्राउझरमध्ये व्हॉईस इनपुट उपलब्ध नाही. आपण टाईप करून पुढे जाऊ शकता.",
  network_en:
    "The browser voice-recognition service is temporarily unavailable. Please try again or type your question.",
  network_hi:
    "ब्राउज़र की वॉइस पहचान सेवा फिलहाल उपलब्ध नहीं है। फिर प्रयास करें या प्रश्न टाइप करें।",
  network_mr:
    "व्हॉईस ओळख सेवा सध्या अनुपलब्ध आहे. कृपया पुन्हा प्रयत्न करा किंवा टाईप करा.",
  audio_capture_en:
    "No microphone detected. Check your audio input or type your question.",
  audio_capture_hi:
    "माइक्रोफ़ोन नहीं मिला। कृपया ऑडियो इनपुट की जाँच करें या टाइप करें।",
  audio_capture_mr:
    "मायक्रोफोन सापडला नाही. कृपया ऑडिओ इनपुट तपासा किंवा टाईप करा.",
};

export function useSpeechRecognition({
  language,
  onFinalTranscript,
}: UseSpeechRecognitionProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const activeRecognitionRef = useRef<any>(null);
  const isManuallyStoppedRef = useRef(false);
  const onFinalRef = useRef(onFinalTranscript);
  onFinalRef.current = onFinalTranscript;
  const languageRef = useRef(language);
  languageRef.current = language;

  // Check browser support on client mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    setIsSupported(Boolean(SpeechRecognition));

    return () => {
      if (activeRecognitionRef.current) {
        try {
          isManuallyStoppedRef.current = true;
          activeRecognitionRef.current.abort();
        } catch {
          // ignore
        }
        activeRecognitionRef.current = null;
      }
    };
  }, []);

  const stopListening = useCallback(() => {
    isManuallyStoppedRef.current = true;
    if (activeRecognitionRef.current) {
      try {
        activeRecognitionRef.current.stop();
      } catch {
        try {
          activeRecognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
      activeRecognitionRef.current = null;
    }
    setIsListening(false);
    setInterimTranscript("");
  }, []);

  const startListening = useCallback(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    const currentLang = languageRef.current;

    if (!SpeechRecognition) {
      setError(
        currentLang === "hi"
          ? SPEECH_MESSAGES.unsupported_hi
          : currentLang === "mr"
          ? SPEECH_MESSAGES.unsupported_mr
          : SPEECH_MESSAGES.unsupported_en
      );
      setIsSupported(false);
      return;
    }

    // Stop any existing session before starting fresh
    if (activeRecognitionRef.current) {
      try {
        isManuallyStoppedRef.current = true;
        activeRecognitionRef.current.abort();
      } catch {
        // ignore
      }
      activeRecognitionRef.current = null;
    }

    setError(null);
    setInterimTranscript("");
    isManuallyStoppedRef.current = false;

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = currentLang === "hi" ? "hi-IN" : currentLang === "mr" ? "mr-IN" : "en-IN";

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        let interim = "";
        let final = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          const transcript = result[0]?.transcript || "";
          if (result.isFinal) {
            final += transcript;
          } else {
            interim += transcript;
          }
        }

        if (interim) {
          setInterimTranscript(interim);
        }

        if (final) {
          const cleanedFinal = final.trim();
          if (cleanedFinal) {
            onFinalRef.current(cleanedFinal);
          }
          setInterimTranscript("");
        }
      };

      recognition.onerror = (event: any) => {
        // If aborted by user manual stop, don't show error
        if (isManuallyStoppedRef.current) {
          setIsListening(false);
          setInterimTranscript("");
          return;
        }

        const errType = event.error;
        const lang = languageRef.current;

        switch (errType) {
          case "not-allowed":
          case "service-not-allowed":
            setError(
              lang === "hi"
                ? SPEECH_MESSAGES.permission_hi
                : lang === "mr"
                ? SPEECH_MESSAGES.permission_mr
                : SPEECH_MESSAGES.permission_en
            );
            break;
          case "no-speech":
            setError(
              lang === "hi"
                ? SPEECH_MESSAGES.no_speech_hi
                : lang === "mr"
                ? SPEECH_MESSAGES.no_speech_mr
                : SPEECH_MESSAGES.no_speech_en
            );
            break;
          case "audio-capture":
            setError(
              lang === "hi"
                ? SPEECH_MESSAGES.audio_capture_hi
                : lang === "mr"
                ? SPEECH_MESSAGES.audio_capture_mr
                : SPEECH_MESSAGES.audio_capture_en
            );
            break;
          case "network":
            setError(
              lang === "hi"
                ? SPEECH_MESSAGES.network_hi
                : lang === "mr"
                ? SPEECH_MESSAGES.network_mr
                : SPEECH_MESSAGES.network_en
            );
            break;
          case "aborted":
            // user cancellation, no error needed
            break;
          default:
            setError(
              lang === "hi"
                ? SPEECH_MESSAGES.no_speech_hi
                : lang === "mr"
                ? SPEECH_MESSAGES.no_speech_mr
                : SPEECH_MESSAGES.no_speech_en
            );
            break;
        }

        setIsListening(false);
        setInterimTranscript("");
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript("");
        activeRecognitionRef.current = null;
      };

      activeRecognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error("Failed to start speech recognition session:", e);
      setIsListening(false);
      setInterimTranscript("");
      setError(
        currentLang === "hi"
          ? SPEECH_MESSAGES.network_hi
          : SPEECH_MESSAGES.network_en
      );
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    isSupported,
    isListening,
    interimTranscript,
    error,
    startListening,
    stopListening,
    clearError,
  };
}

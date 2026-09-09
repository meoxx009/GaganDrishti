"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { SpeechLanguage } from "./types";

interface UseSpeechRecognitionProps {
  language: SpeechLanguage;
  onFinalTranscript: (transcript: string) => void;
}

export function useSpeechRecognition({
  language,
  onFinalTranscript,
}: UseSpeechRecognitionProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const onFinalRef = useRef(onFinalTranscript);
  onFinalRef.current = onFinalTranscript;
  const languageRef = useRef(language);
  languageRef.current = language;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        setInterimTranscript("");
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
        const errType = event.error;
        const currentLang = languageRef.current;

        if (errType === "not-allowed") {
          setError(
            currentLang === "hi"
              ? "माइक्रोफ़ोन अनुमति अस्वीकृत। कृपया अपनी ब्राउज़र सेटिंग्स में माइक्रोफ़ोन की अनुमति दें।"
              : "Microphone permission was denied. Please allow microphone access in your browser settings."
          );
        } else if (errType === "no-speech") {
          setError(
            currentLang === "hi"
              ? "कोई आवाज़ नहीं पहचानी गई। कृपया माइक के पास बोलकर पुनः प्रयास करें।"
              : "No speech detected. Please speak clearly into your microphone."
          );
        } else if (errType === "audio-capture") {
          setError(
            currentLang === "hi"
              ? "माइक्रोफ़ोन नहीं मिला। कृपया अपने ऑडियो इनपुट डिवाइस की जाँच करें।"
              : "No microphone was found. Please ensure an audio capture device is connected."
          );
        } else if (errType === "network") {
          setError(
            currentLang === "hi"
              ? "वॉइस नेटवर्क समस्या। कृपया इंटरनेट कनेक्शन जांचें।"
              : "Speech recognition network error. Please check your internet connection."
          );
        } else if (errType !== "aborted") {
          setError(
            currentLang === "hi"
              ? "वॉइस पहचान में त्रुटि हुई। कृपया पुनः प्रयास करें या लिखकर पूछें।"
              : "Speech recognition error occurred. Please try again or type your question."
          );
        }

        setIsListening(false);
        setInterimTranscript("");
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript("");
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.error("Failed to initialize SpeechRecognition:", e);
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    setError(null);
    setInterimTranscript("");

    // Set correct BCP 47 language tag: en-IN or hi-IN
    recognitionRef.current.lang = language === "hi" ? "hi-IN" : "en-IN";

    try {
      recognitionRef.current.start();
    } catch {
      // If already started or transitioning, restart cleanly
      try {
        recognitionRef.current.stop();
        setTimeout(() => {
          try {
            recognitionRef.current.start();
          } catch {
            // ignore
          }
        }, 150);
      } catch {
        // ignore
      }
    }
  }, [language]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch {
      // ignore
    }
    setIsListening(false);
    setInterimTranscript("");
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

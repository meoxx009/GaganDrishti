"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { SpeechLanguage } from "./types";

export function cleanTextForSpeech(text: string): string {
  return text
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, "")
    // Remove inline code
    .replace(/`([^`]+)`/g, "$1")
    // Remove markdown links [text](url) -> text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // Remove bold and italics
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    // Remove heading hashes
    .replace(/#{1,6}\s+/g, "")
    // Replace bullet points with pause
    .replace(/^\s*[-*+]\s+/gm, ". ")
    // Clean up parenthesis enclosing sources if desired, or leave readable
    .replace(/\(Source:[^)]+\)/gi, "")
    // Remove multiple newlines and normalize spaces
    .replace(/\n+/g, ". ")
    .replace(/\s+/g, " ")
    .trim();
}

export function useSpeechSynthesis() {
  const [isSupported, setIsSupported] = useState(false);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const speakingIdRef = useRef<string | null>(null);
  speakingIdRef.current = currentlySpeakingId;

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    const updateVoices = () => {
      try {
        const available = window.speechSynthesis.getVoices();
        if (available && available.length > 0) {
          setVoices(available);
        }
      } catch {
        // ignore
      }
    };

    updateVoices();

    if ("onvoiceschanged" in window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const selectVoice = useCallback(
    (lang: SpeechLanguage): SpeechSynthesisVoice | null => {
      if (voices.length === 0) return null;

      const targetLocale = lang === "hi" ? "hi-in" : lang === "mr" ? "mr-in" : "en-in";
      const targetPrefix = lang === "hi" ? "hi" : lang === "mr" ? "mr" : "en";

      // 1. Exact locale match: en-IN or hi-IN
      const exactMatch = voices.find(
        (v) => v.lang.replace("_", "-").toLowerCase() === targetLocale
      );
      if (exactMatch) return exactMatch;

      // 2. Language prefix match: e.g. hi or en
      const prefixMatch = voices.find(
        (v) => v.lang.toLowerCase().startsWith(targetPrefix)
      );
      if (prefixMatch) return prefixMatch;

      // 3. Fallback to default voice or first available
      return voices.find((v) => v.default) || voices[0] || null;
    },
    [voices]
  );

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
    setCurrentlySpeakingId(null);
  }, []);

  const speak = useCallback(
    (messageId: string, text: string, lang: SpeechLanguage) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        return;
      }

      // If already speaking this message, toggle stop
      if (speakingIdRef.current === messageId) {
        stop();
        return;
      }

      // Stop any other speech first
      stop();

      const cleanedText = cleanTextForSpeech(text);
      if (!cleanedText) return;

      try {
        const utterance = new SpeechSynthesisUtterance(cleanedText);
        utterance.lang = lang === "hi" ? "hi-IN" : "en-IN";
        utterance.rate = 0.95; // Clear, natural pace
        utterance.pitch = 1.0;

        const voice = selectVoice(lang);
        if (voice) {
          utterance.voice = voice;
        }

        utterance.onstart = () => {
          setCurrentlySpeakingId(messageId);
        };

        utterance.onend = () => {
          if (speakingIdRef.current === messageId) {
            setCurrentlySpeakingId(null);
          }
        };

        utterance.onerror = () => {
          if (speakingIdRef.current === messageId) {
            setCurrentlySpeakingId(null);
          }
        };

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.error("Speech synthesis failed:", err);
        setCurrentlySpeakingId(null);
      }
    },
    [selectVoice, stop]
  );

  return {
    isSupported,
    currentlySpeakingId,
    speak,
    stop,
  };
}

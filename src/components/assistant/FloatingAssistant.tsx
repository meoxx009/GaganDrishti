"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  X,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  MapPin,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useWeather } from "@/context/WeatherContext";
import { ChatMessage } from "@/lib/chat/types";
import { useSpeechRecognition } from "@/lib/speech/useSpeechRecognition";

const SUGGESTIONS_HI = [
  "भोपाल से विदिशा रात में जाना मौसम के हिसाब से कैसा रहेगा?",
  "क्या आज भोपाल में बारिश होगी?",
  "आज रात बाहर जाना कैसा रहेगा?",
  "कल खेत के काम के लिए मौसम कैसा है?",
];

const SUGGESTIONS_MR = [
  "पुणे ते मुंबई रात्रीचा प्रवास हवामानानुसार कसा राहील?",
  "आज पाऊस पडेल का?",
  "आज रात्रीचे हवामान कसे राहील?",
  "उद्या शेतीच्या कामांसाठी हवामान कसे आहे?",
];

const SUGGESTIONS_EN = [
  "Is the weather suitable for travelling from Bhopal to Vidisha tonight?",
  "Will it rain today?",
  "How is the weather tonight?",
  "How is tomorrow's weather for field work?",
];

export const FloatingAssistant: React.FC = () => {
  const { language, city } = useApp();
  const { weather } = useWeather();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  // Speech Recognition hook
  const {
    isSupported: isSpeechSupported,
    isListening,
    interimTranscript,
    error: speechErrorMessage,
    startListening,
    stopListening,
    clearError: clearSpeechError,
  } = useSpeechRecognition({
    language,
    onFinalTranscript: (finalText) => {
      setInputQuery((prev) => {
        const trimmed = prev.trim();
        return trimmed ? `${trimmed} ${finalText}` : finalText;
      });
    },
  });

  // Safe internal scrolling
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Small timeout to allow panel render
      setTimeout(scrollToBottom, 50);
    }
  }, [isOpen, messages, isLoading]);

  // Handle Text-To-Speech
  const handleSpeak = (msgId: string, text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Clean markdown symbols for cleaner TTS
    const cleanText = text.replace(/[*#_`•-]/g, "").trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language === "hi" ? "hi-IN" : language === "mr" ? "mr-IN" : "en-IN";

    const voices = window.speechSynthesis.getVoices();
    const targetPrefix = language === "hi" ? "hi" : language === "mr" ? "mr" : "en";
    const matchedVoice = voices.find((v) => v.lang.toLowerCase().startsWith(targetPrefix));
    if (matchedVoice) utterance.voice = matchedVoice;

    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    setSpeakingMessageId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Handle Copy
  const handleCopy = (msgId: string, text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(msgId);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Clear conversation
  const handleClear = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMessageId(null);
    setMessages([]);
  };

  // Send message handler
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend !== undefined ? textToSend : inputQuery).trim();
    if (!query || isLoading) return;

    if (isListening) stopListening();

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          language,
          city,
          weather,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content: data.reply || (language === "hi" ? "कोई उत्तर नहीं मिला।" : "No reply generated."),
        timestamp: new Date().toISOString(),
        isFallback: data.isFallback,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("Floating assistant error:", err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content:
          language === "hi"
            ? "संजाल या सेवा त्रुटि के कारण उत्तर प्राप्त नहीं हो सका। कृपया पुनः प्रयास करें।"
            : "Could not retrieve a reply due to a connection or service issue. Please try again.",
        timestamp: new Date().toISOString(),
        isFallback: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const cityName =
    language === "hi"
      ? city.nameHi
      : language === "mr" && city.nameMr
      ? city.nameMr
      : city.nameEn;
  const suggestions =
    language === "hi"
      ? SUGGESTIONS_HI
      : language === "mr"
      ? SUGGESTIONS_MR
      : SUGGESTIONS_EN;

  return (
    <>
      {/* 1. Global Floating Trigger Button */}
      <div className="fixed bottom-[calc(76px+env(safe-area-inset-bottom,0px))] right-4 lg:bottom-6 lg:right-6 z-40">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`relative flex h-14 w-14 items-center justify-center rounded-2xl shadow-xl transition-all duration-200 active:scale-95 ${
            isOpen
              ? "bg-slate-800 text-slate-200 border border-slate-700 rotate-90"
              : "bg-sky-600 hover:bg-sky-700 text-white dark:bg-sky-500 dark:hover:bg-sky-400 dark:text-slate-950 shadow-lg shadow-sky-600/20 dark:shadow-sky-500/25 hover:scale-105 font-bold"
          }`}
          title={
            isOpen
              ? language === "hi"
                ? "बंद करें"
                : "Close Assistant"
              : language === "hi"
              ? "GaganDrishti से पूछें"
              : "Ask GaganDrishti"
          }
          aria-label="Toggle GaganDrishti Assistant"
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Bot className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* 2. Global Floating Assistant Panel */}
      {isOpen && (
        <div
          className="fixed inset-x-3 bottom-[calc(80px+env(safe-area-inset-bottom,0px))] sm:inset-x-auto sm:right-6 sm:bottom-24 sm:w-[410px] h-[580px] max-h-[78vh] sm:max-h-[82vh] z-50 flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#05090D] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#080E14]">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600 text-white dark:bg-sky-500 dark:text-slate-950 font-bold shadow-xs">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
                    {language === "hi" ? "गगनदृष्टि सहायक" : "GaganDrishti AI"}
                  </h3>
                  <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 dark:border-transparent dark:bg-sky-500/15 dark:text-sky-300">
                    <MapPin className="h-2.5 w-2.5" />
                    <span>{cityName}</span>
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block leading-tight">
                  {language === "hi"
                    ? "मौसम एवं यात्रा आसूचना"
                    : "Live Weather & Travel Intelligence"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
                  title={language === "hi" ? "संवाद साफ़ करें" : "Clear conversation"}
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Internal Scrollable Message Container */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs sm:text-[13px] leading-relaxed select-text"
          >
            {/* Welcome Greeting */}
            <div className="rounded-2xl border border-sky-200 dark:border-sky-500/20 bg-sky-50/60 dark:bg-[#080E14] p-3.5 space-y-1.5 text-slate-800 dark:text-[#CBD5E1]">
              <div className="flex items-center gap-1.5 font-bold text-sky-800 dark:text-sky-300 text-xs">
                <Sparkles className="h-3.5 w-3.5 text-sky-600 dark:text-sky-500" />
                <span>{language === "hi" ? "स्वागत है!" : "Welcome!"}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-[#7F91A3]">
                {language === "hi"
                  ? "नमस्ते! मौसम, यात्रा के मौसम (जैसे 'भोपाल से विदिशा आज रात जाना है'), सुरक्षा या कृषि निर्णयों के बारे में पूछें।"
                  : language === "mr"
                  ? "नमस्कार! हवामान, प्रवास हवामान (उदा. 'पुणे ते मुंबई आज रात्री जायचे आहे'), सुरक्षितता किंवा शेतीविषयक हवामानाबद्दल विचारा."
                  : "Hi! Ask me about weather, travel weather (e.g. 'travel from Bhopal to Vidisha tonight'), safety, or farm decisions."}
              </p>
            </div>

            {/* Render Messages */}
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              const isSpeaking = speakingMessageId === msg.id;
              const isCopied = copiedId === msg.id;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 whitespace-pre-wrap break-words ${
                      isUser
                        ? "bg-sky-600 text-white font-medium shadow-2xs rounded-br-xs dark:bg-[#0A1C2E] dark:text-[#F8FAFC] dark:border dark:border-sky-500/30"
                        : "bg-[#F8FAFC] dark:bg-[#0B1219] border border-slate-200 dark:border-slate-800/50 text-slate-800 dark:text-[#CBD5E1] rounded-bl-xs"
                    }`}
                  >
                    {msg.content}
                  </div>

                  {/* Assistant Message Actions (TTS + Copy) */}
                  {!isUser && (
                    <div className="mt-1 flex items-center gap-2 px-1 text-[10px] text-slate-500 dark:text-slate-400">
                      <button
                        type="button"
                        onClick={() => handleSpeak(msg.id, msg.content)}
                        className={`flex items-center gap-1 hover:text-sky-600 dark:hover:text-sky-400 transition-colors ${
                          isSpeaking ? "text-sky-600 dark:text-sky-500 font-bold" : ""
                        }`}
                        title={isSpeaking ? "Stop Speaking" : "Listen (Text-to-Speech)"}
                      >
                        {isSpeaking ? (
                          <>
                            <VolumeX className="h-3 w-3 animate-pulse" />
                            <span>{language === "hi" ? "रोकें" : "Stop"}</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="h-3 w-3" />
                            <span>{language === "hi" ? "सुनें" : "Listen"}</span>
                          </>
                        )}
                      </button>

                      <span>•</span>

                      <button
                        type="button"
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors flex items-center gap-1"
                        title="Copy text"
                      >
                        {isCopied ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-600" />
                            <span className="text-emerald-600">
                              {language === "hi" ? "कॉपी हुआ" : "Copied"}
                            </span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>{language === "hi" ? "कॉपी" : "Copy"}</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && (() => {
              const lastUserMsg = messages.slice().reverse().find(m => m.role === "user")?.content.toLowerCase() || "";
              const isTravel = lastUserMsg.includes("jana") || lastUserMsg.includes("se ") || lastUserMsg.includes("travel") || lastUserMsg.includes("route") || lastUserMsg.includes("bike") || lastUserMsg.includes("car");
              const isFarmer = lastUserMsg.includes("spray") || lastUserMsg.includes("छिड़काव") || lastUserMsg.includes("chhidkav") || lastUserMsg.includes("dawa") || lastUserMsg.includes("सिंचाई") || lastUserMsg.includes("sinchai") || lastUserMsg.includes("irrigation") || lastUserMsg.includes("फसल") || lastUserMsg.includes("crop");
              const isFlood = lastUserMsg.includes("badh") || lastUserMsg.includes("बाढ़") || lastUserMsg.includes("flood") || lastUserMsg.includes("जलभराव") || lastUserMsg.includes("waterlog") || lastUserMsg.includes("4-5 din") || lastUserMsg.includes("char panch");

              const loadingText = isTravel
                ? (language === "hi" ? "यात्रा मार्ग व दोनों शहरों का मौसम विश्लेषित हो रहा है..." : "Analyzing route weather & commute conditions...")
                : isFarmer
                ? (language === "hi" ? "फसल स्प्रे विंडो व मौसम साक्ष्यों की पुष्टि हो रही है..." : "Checking crop spray window & wind telemetry...")
                : isFlood
                ? (language === "hi" ? "आगामी 5 दिनों के वर्षा मॉडल का आकलन जारी है..." : "Evaluating 5-day precipitation telemetry & flood risk...")
                : (language === "hi" ? "मौसम डेटा संसाधित हो रहा है..." : "Analyzing weather telemetry...");

              return (
                <div className="flex items-center gap-2 rounded-2xl bg-[#F8FAFC] dark:bg-[#0B1219] border border-slate-200 dark:border-slate-800/50 px-3.5 py-2.5 text-xs text-slate-600 dark:text-[#7F91A3] w-fit animate-pulse">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-600 dark:text-sky-500" />
                  <span>{loadingText}</span>
                </div>
              );
            })()}
          </div>

          {/* Suggestions Bar */}
          <div className="px-3.5 py-2 border-t border-slate-200 dark:border-slate-800/60 bg-[#F8FAFC] dark:bg-[#080E14]/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-bold text-sky-700 dark:text-sky-400 shrink-0">
              {language === "hi" ? "सुझाव:" : "Ideas:"}
            </span>
            {suggestions.map((sug, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(sug)}
                className="rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1219] hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-[#0E1821] px-2.5 py-0.5 text-[10px] text-slate-700 dark:text-slate-300 whitespace-nowrap transition-colors shrink-0 shadow-2xs"
              >
                {sug}
              </button>
            ))}
          </div>

          {/* Active Listening / Speech Error Banner */}
          {isListening && (
            <div className="px-3.5 py-1.5 bg-rose-500/10 border-t border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 animate-pulse">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
              <span className="font-bold shrink-0">
                {language === "hi" ? "सुन रहे हैं:" : "Listening:"}
              </span>
              <span className="italic truncate text-[11px]">
                {interimTranscript || (language === "hi" ? "कृपया बोलें..." : "Speak now...")}
              </span>
              <button
                type="button"
                onClick={stopListening}
                className="ml-auto rounded-md bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold"
              >
                {language === "hi" ? "पूर्ण करें" : "Done"}
              </button>
            </div>
          )}

          {speechErrorMessage && (
            <div className="px-3.5 py-1.5 bg-amber-500/10 border-t border-amber-500/20 text-amber-800 dark:text-amber-300 text-[11px] flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span>{speechErrorMessage}</span>
              </div>
              <button
                type="button"
                onClick={clearSpeechError}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                ✕
              </button>
            </div>
          )}

          {/* Composer Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 border-t border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#080E14] flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={
                isListening
                  ? language === "hi"
                    ? "बोलें..."
                    : "Listening..."
                  : language === "hi"
                  ? "मौसम या यात्रा प्रश्न पूछें..."
                  : "Ask about weather or travel..."
              }
              disabled={isLoading}
              className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-[#060C12] px-3.5 py-2.5 text-xs text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-[#7F91A3] focus:outline-hidden focus:border-sky-500 shadow-2xs"
            />

            {/* Mic button */}
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              disabled={!isSpeechSupported || isLoading}
              className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all shrink-0 ${
                isListening
                  ? "border-rose-500 bg-rose-500/20 text-rose-600 animate-pulse"
                  : !isSpeechSupported
                  ? "border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#060C12] text-sky-600 dark:text-sky-400 hover:bg-slate-50 dark:hover:bg-[#0B1219]"
              }`}
              title={
                !isSpeechSupported
                  ? "Mic unsupported"
                  : isListening
                  ? "Stop"
                  : language === "hi"
                  ? "बोलें (hi-IN)"
                  : "Speak (en-IN)"
              }
            >
              {isListening ? (
                <Mic className="h-4 w-4 text-rose-500 animate-bounce" />
              ) : !isSpeechSupported ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </button>

            {/* Send button */}
            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600 hover:bg-sky-700 text-white dark:bg-sky-500 dark:hover:bg-sky-400 dark:text-slate-950 font-semibold disabled:opacity-40 transition-all shrink-0 shadow-2xs"
              title="Send Message"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </form>
        </div>
      )}
    </>
  );
};
export default FloatingAssistant;

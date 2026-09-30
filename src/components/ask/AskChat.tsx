"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Trash2,
  Sparkles,
  MapPin,
  Compass,
  AlertCircle,
  Database,
  HelpCircle,
  Loader2,
  Info,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Square,
  Radio,
  ShieldCheck,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useWeather } from "@/context/WeatherContext";
import { ChatMessage, ChatApiResponse } from "@/lib/chat/types";
import { useSpeechRecognition } from "@/lib/speech/useSpeechRecognition";
import { useSpeechSynthesis } from "@/lib/speech/useSpeechSynthesis";
import { EvidenceProvenanceDrawer, EvidenceDetails } from "@/components/common/EvidenceProvenanceDrawer";

const SUGGESTED_QUESTIONS_EN = [
  "Will it rain today?",
  "What is the current temperature and humidity?",
  "What is tomorrow's weather forecast?",
  "Is the weather suitable for irrigation today?",
  "Is it safe to spray my crops today?",
];

const SUGGESTED_QUESTIONS_HI = [
  "क्या आज बारिश होगी?",
  "वर्तमान तापमान और आर्द्रता क्या है?",
  "कल का मौसम कैसा रहेगा?",
  "क्या आज खेत में सिंचाई करना सही रहेगा?",
  "क्या आज फसल पर स्प्रे करने के लिए मौसम उपयुक्त है?",
];

const SUGGESTED_QUESTIONS_MR = [
  "आज पाऊस पडेल का?",
  "सध्याचे तापमान आणि आर्द्रता किती आहे?",
  "उद्याचे हवामान कसे राहील?",
  "आज शेतात पाणी देणे योग्य ठरेल का?",
  "आज पिकांवर फवारणी करणे सुरक्षित आहे का?",
];

export const AskChat: React.FC = () => {
  const { language, city } = useApp();
  const { weather } = useWeather();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [showEvidence, setShowEvidence] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceDetails | null>(null);

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const cityName =
    language === "hi"
      ? city.nameHi
      : language === "mr" && city.nameMr
      ? city.nameMr
      : city.nameEn;
  const stateName =
    language === "hi"
      ? city.stateHi
      : language === "mr" && city.stateMr
      ? city.stateMr
      : city.stateEn;

  // Speech Recognition (STT - en-IN / hi-IN / mr-IN)
  const {
    isSupported: isSpeechSupported,
    isListening,
    interimTranscript,
    error: speechError,
    startListening,
    stopListening,
    clearError: clearSpeechError,
  } = useSpeechRecognition({
    language,
    onFinalTranscript: (transcript) => {
      setInputQuery((prev) => {
        const trimmed = prev.trim();
        return trimmed ? `${trimmed} ${transcript}` : transcript;
      });
    },
  });

  // Speech Synthesis (TTS - en-IN / hi-IN / mr-IN)
  const {
    isSupported: isSynthSupported,
    currentlySpeakingId,
    speak,
    stop: stopSpeech,
  } = useSpeechSynthesis();

  const handleMicToggle = () => {
    if (!isSpeechSupported) return;
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Initialize initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      const initialGreeting: ChatMessage = {
        id: "initial-greeting",
        role: "assistant",
        content:
          language === "hi"
            ? `नमस्ते! मैं गगनदृष्टि एआई मौसम सहायक हूँ। मैं ${cityName} के लाइव मौसम, तापमान, वर्षा एवं खेती संबंधी मौसम निर्णय में आपकी सहायता के लिए तैयार हूँ। आप मुझसे क्या पूछना चाहते हैं?`
            : language === "mr"
            ? `नमस्कार! मी गगनदृष्टी एआय हवामान सहाय्यक आहे. मी ${cityName} मधील थेट हवामान, तापमान, पाऊस आणि शेतीविषयक निर्णयात मदत करण्यासाठी तयार आहे. मी तुम्हाला कशी मदत करू शकतो?`
            : `Hello! I am GaganDrishti AI, your bilingual weather intelligence assistant for ${cityName}. I can help you with real-time conditions, precipitation, temperature, and agrometeorological suitability. How can I help you today?`,
        timestamp: new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      };
      setMessages([initialGreeting]);
    }
  }, [language, cityName]);

  // Internal container auto-scroll (does not scroll window/document)
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isLoading) return;

    setInputQuery("");
    setErrorNotice(null);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    const historyPayload = messages.slice(-6).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const controller = new AbortController();
    const watchdogTimeout = setTimeout(() => {
      controller.abort();
    }, 7500);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          message: query,
          language,
          city,
          weather,
          history: historyPayload,
        }),
      });

      clearTimeout(watchdogTimeout);

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data: ChatApiResponse = await response.json();

      const botMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        isFallback: data.isFallback,
        evidence: data.evidence,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: unknown) {
      clearTimeout(watchdogTimeout);
      const isAbort = (err as Error)?.name === "AbortError";

      // Always resolve to a final assistant message so conversation never stalls
      const fallbackReply =
        weather && weather.current
          ? language === "hi"
            ? `${cityName} में वर्तमान तापमान ${weather.current.temperature}°C (अनुभूत ${weather.current.apparentTemperature}°C) है। हवा ${weather.current.windSpeed} km/h और वर्षा की संभावना ${weather.daily[0]?.precipitationProbabilityMax ?? 0}% है।`
            : `Current weather in ${cityName}: Temperature is ${weather.current.temperature}°C (feels like ${weather.current.apparentTemperature}°C) with ${weather.current.windSpeed} km/h winds and ${weather.daily[0]?.precipitationProbabilityMax ?? 0}% rain probability.`
          : language === "hi"
          ? `${cityName} के लिए मौसम डेटा अभी संकलित किया जा रहा है। कृपया कुछ क्षणों बाद पुनः पूछें।`
          : `Weather data is currently compiling for ${cityName}. Please try asking again in a few moments.`;

      const botMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: fallbackReply,
        timestamp: new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        isFallback: true,
      };

      setMessages((prev) => [...prev, botMsg]);

      if (isAbort) {
        setErrorNotice(
          language === "hi"
            ? "प्रतिक्रिया समय सीमा समाप्त। सत्यापित बैकअप डेटा प्रदर्शित किया गया है।"
            : "Request timed out; verified backup weather telemetry provided."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    const freshGreeting: ChatMessage = {
      id: `greeting-${Date.now()}`,
      role: "assistant",
      content:
        language === "hi"
          ? `संवाद साफ़ कर दिया गया। ${cityName} के मौसम के बारे में कोई भी प्रश्न पूछें।`
          : language === "mr"
          ? `संभाषण साफ केले गेले. ${cityName} च्या हवामानाबद्दल कोणताही प्रश्न विचारा.`
          : `Conversation cleared. Ask any weather or farming question for ${cityName}.`,
      timestamp: new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
    setMessages([freshGreeting]);
  };

  const suggestedQuestions =
    language === "hi"
      ? SUGGESTED_QUESTIONS_HI
      : language === "mr"
      ? SUGGESTED_QUESTIONS_MR
      : SUGGESTED_QUESTIONS_EN;

  return (
    <div className="flex flex-col h-[600px] max-h-[78vh] rounded-3xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#080E14] shadow-xs overflow-hidden transition-colors">
      {/* 1. Chat Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#060C12] p-3.5 sm:px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600 text-white dark:bg-sky-500 dark:text-slate-950 font-bold shadow-xs">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-[#F8FAFC]">
                {language === "hi" ? "गगनदृष्टि से पूछें" : "Ask GaganDrishti"}
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 dark:border-sky-500/30 bg-sky-50 dark:bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold text-sky-800 dark:text-sky-300">
                <Sparkles className="h-2.5 w-2.5" />
                <span>AI Weather Assistant</span>
              </span>
            </div>

            {/* City & Telemetry Attached pill */}
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-[#7F91A3] mt-0.5">
              <MapPin className="h-3 w-3 text-sky-600 dark:text-sky-400 shrink-0" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {cityName}, {stateName}
              </span>
              <span className="text-slate-400">•</span>
              <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
                Open-Meteo Grounded
              </span>
            </div>
          </div>
        </div>

        {/* Action: Clear chat */}
        <button
          onClick={handleClearChat}
          type="button"
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1219] px-2.5 py-1 text-xs text-slate-600 dark:text-[#7F91A3] hover:text-rose-600 hover:border-rose-300 dark:hover:border-rose-500/40 transition-all shadow-2xs"
          title="Clear Conversation"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">
            {language === "hi" ? "संवाद साफ़ करें" : "Clear"}
          </span>
        </button>
      </div>

      {/* 2. Messages Stream */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5"
      >
        {messages.map((msg) => {
          const isUser = msg.role === "user";

          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${
                isUser ? "justify-end" : "justify-start"
              }`}
            >
              {!isUser && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-50 dark:bg-[#0B1219] border border-sky-200 dark:border-sky-500/30 text-sky-600 dark:text-sky-400 mt-1">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  isUser
                    ? "bg-sky-600 text-white font-medium rounded-tr-xs shadow-2xs dark:bg-[#0A1C2E] dark:text-[#F8FAFC] dark:border dark:border-sky-500/30"
                    : "bg-[#F8FAFC] dark:bg-[#0B1219] border border-slate-200 dark:border-slate-800/50 text-slate-800 dark:text-[#CBD5E1] rounded-tl-xs"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Footer of message */}
                <div
                  className={`mt-2 flex items-center justify-between gap-3 text-[10px] ${
                    isUser ? "text-sky-900/70 dark:text-sky-200/70" : "text-slate-500 dark:text-[#7F91A3]"
                  }`}
                >
                  {/* Speaker Button on Assistant Replies */}
                  {!isUser && isSynthSupported && (
                    <button
                      type="button"
                      onClick={() => {
                        if (currentlySpeakingId === msg.id) {
                          stopSpeech();
                        } else {
                          speak(msg.id, msg.content, language);
                        }
                      }}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 text-[10px] font-medium transition-all ${
                        currentlySpeakingId === msg.id
                          ? "border border-sky-400/50 bg-sky-500/20 text-sky-300 shadow-sm shadow-sky-500/30 animate-pulse"
                          : "border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#060C12] text-slate-500 dark:text-[#7F91A3] hover:border-slate-400 dark:hover:border-slate-700 hover:text-sky-600 dark:hover:text-sky-300"
                      }`}
                      title={
                        currentlySpeakingId === msg.id
                          ? (language === "hi" ? "आवाज़ रोकें (Stop)" : "Stop audio")
                          : (language === "hi" ? "उत्तर सुनें (Listen in Hindi)" : "Listen to reply (English)")
                      }
                    >
                      {currentlySpeakingId === msg.id ? (
                        <>
                          <Square className="h-2.5 w-2.5 fill-current text-sky-400" />
                          <span className="font-semibold text-sky-400">
                            {language === "hi" ? "रोकें" : "Stop"}
                          </span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="h-3 w-3" />
                          <span>{language === "hi" ? "सुनें" : "Listen"}</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Subtle Fallback Indicator */}
                  {!isUser && msg.isFallback && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700/50">
                      <Info className="h-2.5 w-2.5" />
                      <span>
                        {language === "hi"
                          ? "बेसिक सहायक (नियम-आधारित)"
                          : "Basic Assistant (Fallback)"}
                      </span>
                    </span>
                  )}

                  {!isUser && !msg.isFallback && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-sky-600 dark:text-sky-400">
                      <Sparkles className="h-2.5 w-2.5" />
                      <span>{language === "hi" ? "एआई उत्तर" : "AI Response"}</span>
                    </span>
                  )}

                  {!isUser && (
                    <button
                      type="button"
                      onClick={() => {
                        const ev = msg.evidence;
                        const metricsList = ev?.keyMetrics
                          ? Object.entries(ev.keyMetrics).map(
                              ([k, v]) => `${k}: ${v}`
                            )
                          : [
                              `Spatial Grounding: ${cityName}, ${stateName} (${city.lat.toFixed(2)}°N, ${city.lon.toFixed(2)}°E)`,
                              `Execution Pathway: ${msg.isFallback ? "Deterministic Weather Answer Engine" : "Grounded Gemini Assistant"}`,
                            ];

                        setSelectedEvidence({
                          title: `AI Reasoning & Weather Grounding (${cityName})`,
                          sourceName: ev?.source || (msg.isFallback ? "Deterministic Weather Answer Engine" : "Google Gemini Flash + Open-Meteo Telemetry"),
                          locationName: ev?.resolvedLocation || `${cityName}, ${stateName}`,
                          coordinates: `${city.lat.toFixed(4)}°N, ${city.lon.toFixed(4)}°E`,
                          fetchedAt: ev?.timestamp || (weather ? new Date(weather.fetchedAt).toISOString() : new Date().toISOString()),
                          rulesTriggered: [
                            `Intent: ${ev?.intent || "weather_query"}`,
                            `Target Window: ${ev?.targetWindow || "Current / Forecast"}`,
                            `Weather Variable: ${ev?.weatherVariable || "General Forecast"}`,
                            ...metricsList,
                          ],
                          thresholds: [
                            "Integrity rule: strictly real coordinates and verified Open-Meteo telemetry",
                          ],
                          modelsUsed: [msg.isFallback ? "Deterministic Weather Engine" : "Google Gemini Flash", "Open-Meteo Ingest"],
                        });
                        setShowEvidence(true);
                      }}
                      className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 hover:text-sky-600 dark:text-[#7F91A3] dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-[#0B1219] transition-colors cursor-pointer"
                    >
                      <ShieldCheck className="h-3 w-3 text-emerald-500" />
                      <span>{language === "hi" ? "तर्क व प्रमाण" : language === "mr" ? "तर्क व पुरावा" : "Why this answer?"}</span>
                    </button>
                  )}

                  <span className="font-mono ml-auto">{msg.timestamp}</span>
                </div>
              </div>

              {isUser && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-[#0B1219] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 mt-1">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Bubble */}
        {isLoading && (() => {
          const lastUserMsg = messages.slice().reverse().find(m => m.role === "user")?.content.toLowerCase() || "";
          const isTravel = lastUserMsg.includes("jana") || lastUserMsg.includes("se ") || lastUserMsg.includes("travel") || lastUserMsg.includes("route") || lastUserMsg.includes("bike") || lastUserMsg.includes("car");
          const isFarmer = lastUserMsg.includes("spray") || lastUserMsg.includes("छिड़काव") || lastUserMsg.includes("chhidkav") || lastUserMsg.includes("dawa") || lastUserMsg.includes("सिंचाई") || lastUserMsg.includes("sinchai") || lastUserMsg.includes("irrigation") || lastUserMsg.includes("फसल") || lastUserMsg.includes("crop");
          const isFlood = lastUserMsg.includes("badh") || lastUserMsg.includes("बाढ़") || lastUserMsg.includes("flood") || lastUserMsg.includes("जलभराव") || lastUserMsg.includes("waterlog") || lastUserMsg.includes("4-5 din") || lastUserMsg.includes("char panch");
          const isRainTiming = (lastUserMsg.includes("barish") || lastUserMsg.includes("rain") || lastUserMsg.includes("baarish")) && (lastUserMsg.includes("kab") || lastUserMsg.includes("time") || lastUserMsg.includes("samay") || lastUserMsg.includes("baje") || lastUserMsg.includes("when"));

          const loadingText = isTravel
            ? (language === "hi" ? "यात्रा मार्ग एवं दोनों शहरों का मौसम विश्लेषित किया जा रहा है..." : "Analyzing route weather and commute suitability...")
            : isFarmer
            ? (language === "hi" ? "फसल स्प्रे विंडो एवं मौसम साक्ष्यों की पुष्टि की जा रही है..." : "Checking crop spray window and wind telemetry...")
            : isFlood
            ? (language === "hi" ? "आगामी 5 दिनों के वर्षा मॉडल एवं जलभराव जोखिम का आकलन जारी है..." : "Evaluating 5-day precipitation telemetry and waterlogging risk...")
            : isRainTiming
            ? (language === "hi" ? "प्रति घंटा वर्षा समय एवं संभावना का विश्लेषण जारी है..." : "Checking hourly rain timing and precipitation models...")
            : (language === "hi" ? `${cityName} के मौसम का विश्लेषण किया जा रहा है...` : `Analyzing weather intelligence for ${cityName}...`);

          return (
            <div className="flex gap-3 justify-start items-center">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-50 dark:bg-[#0B1219] border border-sky-500/30 text-sky-500">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl bg-slate-100 dark:bg-[#0B1219] border border-slate-200 dark:border-slate-800 p-3.5 text-xs text-slate-600 dark:text-[#7F91A3] flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-sky-500" />
                <span>{loadingText}</span>
              </div>
            </div>
          );
        })()}

        {/* Error Notice */}
        {errorNotice && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-50 dark:bg-rose-950/20 p-3 text-xs text-rose-600 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorNotice}</span>
          </div>
        )}
      </div>

      {/* 3. Suggested Question Chips */}
      <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-800/80 bg-[#F8FAFC] dark:bg-[#060C12]">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
            {language === "hi" ? "सुझाव:" : "Suggestions:"}
          </span>
          {suggestedQuestions.map((sug, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(sug)}
              type="button"
              className="rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1219] hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-[#0E1821] px-2.5 py-0.5 text-[11px] text-slate-700 dark:text-slate-300 whitespace-nowrap transition-all shadow-2xs"
            >
              {sug}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Chat Input Bar */}
      <div className="p-3.5 sm:p-4 border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 space-y-3">
        {/* Active Speech Recognition Banner */}
        {isListening && (
          <div className="flex items-center gap-2 rounded-2xl border border-rose-500/40 bg-rose-500/10 dark:bg-rose-950/40 px-3.5 py-2 text-xs text-rose-700 dark:text-rose-300 shadow-sm animate-pulse">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
            </span>
            <span className="font-semibold shrink-0">
              {language === "hi" ? "सुन रहे हैं (hi-IN):" : "Listening (en-IN):"}
            </span>
            <span className="italic text-slate-700 dark:text-slate-200 truncate">
              {interimTranscript || (language === "hi" ? "कृपया बोलें..." : "Speak now...")}
            </span>
            <button
              type="button"
              onClick={stopListening}
              className="ml-auto rounded-lg bg-rose-500/20 border border-rose-500/30 px-2 py-0.5 text-[11px] font-bold text-rose-700 dark:text-rose-200 hover:bg-rose-500/30 transition-colors shrink-0"
            >
              {language === "hi" ? "पूर्ण करें" : "Done"}
            </button>
          </div>
        )}

        {/* Speech Error Banner */}
        {speechError && (
          <div className="flex items-center justify-between gap-2 rounded-2xl border border-amber-500/40 bg-amber-500/10 dark:bg-amber-950/30 px-3.5 py-2 text-xs text-amber-800 dark:text-amber-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>{speechError}</span>
            </div>
            <button
              type="button"
              onClick={clearSpeechError}
              className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-xs px-2 py-0.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              title="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={
              isListening
                ? language === "hi"
                  ? "सुन रहे हैं... बोलें"
                  : "Listening... speak now"
                : language === "hi"
                ? `${cityName} के मौसम या खेती पर प्रश्न पूछें...`
                : `Ask about weather, rain, or farming in ${cityName}...`
            }
            disabled={isLoading}
            className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-[#F8FAFC] dark:bg-[#060C12] px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-[#7F91A3] focus:outline-hidden focus:border-sky-500 focus:ring-1 focus:ring-sky-500/40 disabled:opacity-50 shadow-2xs"
          />

          {/* Microphone (Speech-to-Text) Button */}
          <button
            type="button"
            onClick={handleMicToggle}
            disabled={!isSpeechSupported || isLoading}
            className={`relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl border transition-all shrink-0 shadow-2xs ${
              isListening
                ? "border-rose-500 bg-rose-500/20 text-rose-600 dark:text-rose-300 shadow-lg shadow-rose-500/30 animate-pulse"
                : !isSpeechSupported
                ? "border-slate-200 dark:border-slate-800/80 bg-slate-100 dark:bg-[#060C12] text-slate-400 dark:text-slate-600 cursor-not-allowed"
                : "border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0B1219] text-sky-600 dark:text-sky-400 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-[#0E1821]"
            }`}
            title={
              !isSpeechSupported
                ? language === "hi"
                  ? "इस ब्राउज़र में वॉइस इनपुट समर्थित नहीं है"
                  : "Voice input not supported in this browser"
                : isListening
                ? language === "hi"
                  ? "सुनना रोकें"
                  : "Stop listening"
                : language === "hi"
                ? "बोलकर पूछें (Hindi - hi-IN)"
                : "Speak your query (English - en-IN)"
            }
          >
            {isListening ? (
              <>
                <Mic className="h-5 w-5 text-rose-500 animate-bounce" />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
                </span>
              </>
            ) : !isSpeechSupported ? (
              <MicOff className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-semibold disabled:opacity-40 transition-all shadow-2xs shrink-0 dark:bg-sky-500 dark:hover:bg-sky-400 dark:text-slate-950"
            title="Send Message"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </form>
      </div>

      {/* 5. Device Support Notice */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-[#060C12] px-4 py-2 text-[10px] text-slate-500 dark:text-[#7F91A3]">
        <div className="flex items-center gap-1.5">
          <Radio className="h-3 w-3 text-sky-500 dark:text-cyan-400 shrink-0" />
          <span>
            {language === "hi"
              ? "वॉइस पहचान (hi-IN) एवं वाक् आउटपुट ब्राउज़र/डिवाइस समर्थन (Chrome, Edge, Safari) पर निर्भर करता है।"
              : "Voice recognition (en-IN) & speech output depend on browser/device support (Chrome, Edge, Safari)."}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 ${
              isSpeechSupported ? "text-emerald-400" : "text-amber-400"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {isSpeechSupported
              ? language === "hi"
                ? "माइक उपलब्ध"
                : "Mic Ready"
              : language === "hi"
              ? "माइक असमर्थित"
              : "Mic Unsupported"}
          </span>
          <span className="text-slate-700">•</span>
          <span
            className={`inline-flex items-center gap-1 ${
              isSynthSupported ? "text-emerald-400" : "text-amber-400"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {isSynthSupported
              ? language === "hi"
                ? "स्पीकर उपलब्ध"
                : "Speaker Ready"
              : language === "hi"
              ? "स्पीकर असमर्थित"
              : "Speaker Unsupported"}
          </span>
        </div>
      </div>

      <EvidenceProvenanceDrawer
        isOpen={showEvidence}
        onClose={() => setShowEvidence(false)}
        evidence={selectedEvidence}
      />
    </div>
  );
};

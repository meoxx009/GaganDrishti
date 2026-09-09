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
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useWeather } from "@/context/WeatherContext";
import { ChatMessage, ChatApiResponse } from "@/lib/chat/types";

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

export const AskChat: React.FC = () => {
  const { language, city } = useApp();
  const { weather } = useWeather();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const cityName = language === "hi" ? city.nameHi : city.nameEn;
  const stateName = language === "hi" ? city.stateHi : city.stateEn;

  // Initialize initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      const initialGreeting: ChatMessage = {
        id: "initial-greeting",
        role: "assistant",
        content:
          language === "hi"
            ? `नमस्ते! मैं गगनदृष्टि एआई मौसम सहायक हूँ। मैं ${cityName} के लाइव मौसम, तापमान, वर्षा एवं खेती संबंधी मौसम निर्णय में आपकी सहायता के लिए तैयार हूँ। आप मुझसे क्या पूछना चाहते हैं?`
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

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          language,
          city,
          weather,
        }),
      });

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
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setErrorNotice(
        language === "hi"
          ? "सर्वर से संवाद स्थापित नहीं हो सका। कृपया पुनः प्रयास करें।"
          : "Unable to connect to the assistant server. Please try again."
      );
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
    language === "hi" ? SUGGESTED_QUESTIONS_HI : SUGGESTED_QUESTIONS_EN;

  return (
    <div className="flex flex-col h-[750px] max-h-[85vh] rounded-3xl border border-slate-700/60 bg-gradient-to-br from-[#0D1B2A]/95 via-[#07111F]/95 to-slate-950 shadow-2xl backdrop-blur-xl overflow-hidden">
      {/* 1. Chat Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 bg-slate-900/60 p-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white">
                {language === "hi" ? "गगनदृष्टि से पूछें" : "Ask GaganDrishti"}
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
                <Sparkles className="h-2.5 w-2.5" />
                <span>AI Weather Assistant</span>
              </span>
            </div>

            {/* City & Telemetry Attached pill */}
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <MapPin className="h-3 w-3 text-cyan-400 shrink-0" />
              <span className="font-semibold text-slate-300">
                {cityName}, {stateName}
              </span>
              <span className="text-slate-600">•</span>
              <span className="font-mono text-[10px] text-emerald-400">
                Live Open-Meteo Attached
              </span>
            </div>
          </div>
        </div>

        {/* Action: Clear chat */}
        <button
          onClick={handleClearChat}
          type="button"
          className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-400 hover:text-rose-300 hover:border-rose-500/40 transition-all"
          title="Clear Conversation"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">
            {language === "hi" ? "संवाद साफ़ करें" : "Clear"}
          </span>
        </button>
      </div>

      {/* 2. Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
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
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 mt-1">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-md ${
                  isUser
                    ? "bg-gradient-to-br from-cyan-600 to-blue-600 text-white rounded-tr-xs"
                    : "bg-slate-900/80 border border-slate-800 text-slate-200 rounded-tl-xs"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Footer of message */}
                <div
                  className={`mt-2 flex items-center justify-between gap-3 text-[10px] ${
                    isUser ? "text-cyan-100/70" : "text-slate-500"
                  }`}
                >
                  {/* Subtle Fallback Indicator */}
                  {!isUser && msg.isFallback && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-cyan-400/90 bg-cyan-950/40 px-2 py-0.5 rounded-md border border-cyan-500/20">
                      <Info className="h-3 w-3" />
                      <span>
                        {language === "hi"
                          ? "बेसिक मौसम सहायक (नियम-आधारित)"
                          : "Basic Weather Assistant (Deterministic Fallback)"}
                      </span>
                    </span>
                  )}

                  {!isUser && !msg.isFallback && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400/90">
                      <Sparkles className="h-3 w-3" />
                      <span>Gemini Powered</span>
                    </span>
                  )}

                  <span className="font-mono ml-auto">{msg.timestamp}</span>
                </div>
              </div>

              {isUser && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-slate-300 mt-1">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 text-xs text-slate-400 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
              <span>
                {language === "hi"
                  ? `${cityName} के मौसम का विश्लेषण किया जा रहा है...`
                  : `Analyzing weather intelligence for ${cityName}...`}
              </span>
            </div>
          </div>
        )}

        {/* Error Notice */}
        {errorNotice && (
          <div className="rounded-2xl border border-rose-500/40 bg-rose-950/20 p-3 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorNotice}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Suggested Question Chips */}
      <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
            {language === "hi" ? "सुझाव:" : "Suggestions:"}
          </span>
          {suggestedQuestions.map((sug, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(sug)}
              type="button"
              className="rounded-full border border-slate-800 bg-slate-900/80 hover:border-cyan-500/50 hover:bg-slate-800 px-3 py-1 text-xs text-slate-300 whitespace-nowrap transition-all shadow-xs"
            >
              {sug}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Chat Input Bar */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/60">
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
              language === "hi"
                ? `${cityName} के मौसम या खेती पर प्रश्न पूछें...`
                : `Ask about weather, rain, or farming in ${cityName}...`
            }
            disabled={isLoading}
            className="flex-1 rounded-2xl border border-slate-700/80 bg-slate-950 px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 transition-all shadow-lg shadow-cyan-500/20 shrink-0"
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
    </div>
  );
};

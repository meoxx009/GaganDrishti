"use client";

import React, { useState } from "react";
import {
  Sprout,
  Send,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Star,
  Camera,
  Bug,
  Activity,
  Phone,
  MessageSquare,
  HelpCircle,
  ArrowRight,
  Share2,
  Calendar,
  CloudSun,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import {
  FeedbackCropName,
  FeedbackCropStage,
  FeedbackActivity,
} from "@/lib/feedback/farmerFeedbackTypes";
import { validateImageUpload } from "@/lib/images/imageOptimizationEngine";
import {
  validateFarmerName,
  validatePhoneNumber,
  validatePincode,
  validateWeatherToday,
  validateActionTaken,
  validateEntireFarmerFeedbackForm,
  normalizeTechnicalErrorMessage,
  logValidationError,
} from "@/lib/validation/formValidationEngine";
import { WifiOff, RefreshCw, Check } from "lucide-react";

const CROPS: { value: FeedbackCropName; labelEn: string; labelHi: string }[] = [
  { value: "Soybean", labelEn: "Soybean", labelHi: "सोयाबीन" },
  { value: "Paddy", labelEn: "Paddy / Rice", labelHi: "धान / चावल" },
  { value: "Wheat", labelEn: "Wheat", labelHi: "गेहूँ" },
  { value: "Chickpea", labelEn: "Chickpea / Chana", labelHi: "चना" },
  { value: "Maize", labelEn: "Maize / Corn", labelHi: "मक्का" },
  { value: "Cotton", labelEn: "Cotton", labelHi: "कपास" },
  { value: "Groundnut", labelEn: "Groundnut", labelHi: "मूंगफली" },
  { value: "Mustard", labelEn: "Mustard", labelHi: "सरसों" },
  { value: "Arhar", labelEn: "Arhar / Tur", labelHi: "अरहर (तुअर)" },
  { value: "Moong", labelEn: "Moong", labelHi: "मूंग" },
  { value: "Urad", labelEn: "Urad", labelHi: "उड़द" },
  { value: "Jowar", labelEn: "Jowar / Sorghum", labelHi: "ज्वार" },
  { value: "Bajra", labelEn: "Bajra / Pearl Millet", labelHi: "बाजरा" },
];

const STAGES: { value: FeedbackCropStage; labelEn: string; labelHi: string }[] = [
  { value: "Sowing (0-10 days)", labelEn: "Sowing / Germination (0-10 days)", labelHi: "बुआई / अंकुरण (0-10 दिन)" },
  { value: "Vegetative (10-35 days)", labelEn: "Vegetative Growth (10-35 days)", labelHi: "पत्ती व कल्ले वृद्धि (10-35 दिन)" },
  { value: "Flowering (35-50 days)", labelEn: "Flowering (35-50 days)", labelHi: "फूल आना (35-50 दिन)" },
  { value: "Pod Fill/Grain Dev (50-80 days)", labelEn: "Pod Fill / Grain Fill (50-80 days)", labelHi: "फली / दाना भरना (50-80 दिन)" },
  { value: "Maturity (80-120 days)", labelEn: "Maturity & Ripening (80-120 days)", labelHi: "फसल पकना (80-120 दिन)" },
];

const ACTIVITIES: { value: FeedbackActivity; labelEn: string; labelHi: string }[] = [
  { value: "Spraying Pesticide", labelEn: "Spraying Pesticide", labelHi: "कीटनाशक छिड़काव (Pesticide Spray)" },
  { value: "Spraying Fungicide", labelEn: "Spraying Fungicide", labelHi: "कवकनाशक छिड़काव (Fungicide Spray)" },
  { value: "Irrigation", labelEn: "Irrigation", labelHi: "खेत में सिंचाई (Irrigation)" },
  { value: "Fertilizer Application", labelEn: "Fertilizer Application", labelHi: "खाद / उर्वरक डालना (Fertilizer)" },
  { value: "Sowing", labelEn: "Sowing", labelHi: "बीज बुआई (Sowing)" },
  { value: "Harvesting", labelEn: "Harvesting", labelHi: "फसल कटाई (Harvesting)" },
  { value: "Weeding", labelEn: "Weeding", labelHi: "निराई / गुड़ाई (Weeding)" },
  { value: "No Activity", labelEn: "No Activity Today", labelHi: "आज कोई बड़ा काम नहीं किया" },
  { value: "Other", labelEn: "Other Farm Work", labelHi: "अन्य कृषि कार्य" },
];

export const FarmerFeedbackForm: React.FC = () => {
  const { language } = useApp();

  // Form State
  const [farmerName, setFarmerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [pincode, setPincode] = useState("");
  const [villageName, setVillageName] = useState("");
  const [district, setDistrict] = useState("");
  const [stateName, setStateName] = useState("");

  const [cropName, setCropName] = useState<FeedbackCropName>("Soybean");
  const [cropStage, setCropStage] = useState<FeedbackCropStage>("Vegetative (10-35 days)");
  const [activityToday, setActivityToday] = useState<FeedbackActivity>("Spraying Pesticide");

  const [weatherToday, setWeatherToday] = useState("");
  const [actionTaken, setActionTaken] = useState("");

  const [outcomeRating, setOutcomeRating] = useState<number>(5);
  const [outcomeNotes, setOutcomeNotes] = useState("");

  const [pestObserved, setPestObserved] = useState(false);
  const [pestType, setPestType] = useState("");

  const [diseaseObserved, setDiseaseObserved] = useState(false);
  const [diseaseType, setDiseaseType] = useState("");

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoCompressionInfo, setPhotoCompressionInfo] = useState<string | null>(null);
  const [followUpNeeded, setFollowUpNeeded] = useState(false);

  // Status & Validation State (FINAL_005)
  const [pincodeSearching, setPincodeSearching] = useState(false);
  const [pincodeStatus, setPincodeStatus] = useState<"idle" | "found" | "not_found">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedFeedbackId, setSubmittedFeedbackId] = useState<number | null>(null);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  // Offline Submission Queue State (Step 7)
  const [offlineQueueCount, setOfflineQueueCount] = useState<number>(0);
  const [offlineNotice, setOfflineNotice] = useState<string | null>(null);
  const [isSyncingOffline, setIsSyncingOffline] = useState(false);

  // Load offline queue on mount and register online listener
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("gagandrishti_offline_submissions");
      if (stored) {
        try {
          const list = JSON.parse(stored);
          if (Array.isArray(list)) setOfflineQueueCount(list.length);
        } catch {}
      }

      const handleOnline = () => {
        setOfflineNotice("🌐 इंटरनेट कनेक्शन वापस आ गया है! ऑफ़लाइन फ़ॉर्म सिंक हो रहे हैं...");
        syncOfflineDrafts();
      };

      window.addEventListener("online", handleOnline);
      return () => window.removeEventListener("online", handleOnline);
    }
  }, []);

  // Sync offline drafts with server
  const syncOfflineDrafts = async () => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("gagandrishti_offline_submissions");
    if (!stored) return;

    try {
      const list = JSON.parse(stored);
      if (!Array.isArray(list) || list.length === 0) return;

      setIsSyncingOffline(true);
      let successCount = 0;
      const remaining = [];

      for (const item of list) {
        try {
          const res = await fetch("/api/farmer-feedback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item.form_data),
          });
          const resData = await res.json();
          if (resData.success) {
            successCount++;
          } else {
            remaining.push(item);
          }
        } catch {
          remaining.push(item);
        }
      }

      localStorage.setItem("gagandrishti_offline_submissions", JSON.stringify(remaining));
      setOfflineQueueCount(remaining.length);
      setIsSyncingOffline(false);

      if (successCount > 0) {
        setOfflineNotice(`✓ ${successCount} ऑफ़लाइन फ़ॉर्म सफलतापूर्वक सर्वर पर सिंक हो गए!`);
        setTimeout(() => setOfflineNotice(null), 6000);
      }
    } catch {
      setIsSyncingOffline(false);
    }
  };

  // Real-time phone number change validator
  const handlePhoneChange = (val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 10);
    setPhoneNumber(clean);
    setTouchedFields((prev) => ({ ...prev, phone_number: true }));

    const res = validatePhoneNumber(clean);
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (!res.is_valid) {
        next.phone_number = language === "hi" ? res.error_message_hi! : res.error_message_en!;
      } else {
        delete next.phone_number;
      }
      return next;
    });
  };

  // Farmer name on-blur validator
  const handleNameBlur = () => {
    setTouchedFields((prev) => ({ ...prev, farmer_name: true }));
    const res = validateFarmerName(farmerName);
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (!res.is_valid) {
        next.farmer_name = language === "hi" ? res.error_message_hi! : res.error_message_en!;
      } else {
        delete next.farmer_name;
      }
      return next;
    });
  };

  // Pincode auto-lookup and validation on blur
  const handlePincodeBlur = async () => {
    setTouchedFields((prev) => ({ ...prev, pincode: true }));
    const clean = pincode.trim();

    if (!clean) {
      setFieldErrors((prev) => ({ ...prev, pincode: language === "hi" ? "Pincode required है" : "Pincode is required" }));
      setPincodeStatus("idle");
      return;
    }
    if (clean.length !== 6) {
      setFieldErrors((prev) => ({ ...prev, pincode: language === "hi" ? "Pincode 6 अंकों का होना चाहिए" : "Pincode must be 6 digits" }));
      setPincodeStatus("not_found");
      return;
    }

    setPincodeSearching(true);
    setPincodeStatus("idle");
    const pinRes = await validatePincode(clean);
    setPincodeSearching(false);

    if (pinRes.is_valid && pinRes.locationDetails) {
      setVillageName(pinRes.locationDetails.village_name || "");
      setDistrict(pinRes.locationDetails.district || "");
      setStateName(pinRes.locationDetails.state || "");
      setPincodeStatus("found");
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.pincode;
        return next;
      });
    } else {
      setPincodeStatus("not_found");
      setFieldErrors((prev) => ({
        ...prev,
        pincode: language === "hi" ? pinRes.error_message_hi! : pinRes.error_message_en!,
      }));
    }
  };

  // Weather description change handler
  const handleWeatherChange = (val: string) => {
    setWeatherToday(val);
    if (touchedFields.weather_today || val.length > 0) {
      const res = validateWeatherToday(val);
      setFieldErrors((prev) => {
        const next = { ...prev };
        if (!res.is_valid) {
          next.weather_today = language === "hi" ? res.error_message_hi! : res.error_message_en!;
        } else {
          delete next.weather_today;
        }
        return next;
      });
    }
  };

  // Action taken change handler
  const handleActionChange = (val: string) => {
    setActionTaken(val);
    if (touchedFields.action_taken || val.length > 0) {
      const res = validateActionTaken(val);
      setFieldErrors((prev) => {
        const next = { ...prev };
        if (!res.is_valid) {
          next.action_taken = language === "hi" ? res.error_message_hi! : res.error_message_en!;
        } else {
          delete next.action_taken;
        }
        return next;
      });
    }
  };

  // Photo upload validation & HTML5 Canvas Auto-Compression (FINAL_003)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const valResult = validateImageUpload({
      name: file.name,
      size: file.size,
      type: file.type,
    });

    if (!valResult.is_valid) {
      alert(language === "hi" ? valResult.error_message_hi : valResult.error_message);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDimension = 2048;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/webp", 0.8) || canvas.toDataURL("image/jpeg", 0.8);
          const originalKb = Math.round(file.size / 1024);
          const compressedKb = Math.round((compressedDataUrl.length * 0.75) / 1024);
          const savingsPct = Math.max(0, Math.round(((originalKb - compressedKb) / originalKb) * 100));

          setPhotoPreview(compressedDataUrl);
          setPhotoCompressionInfo(`${compressedKb} KB (${savingsPct}% compressed from ${originalKb} KB)`);
        } else {
          setPhotoPreview(event.target?.result as string);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setFarmerName("");
    setPhoneNumber("");
    setWhatsappNumber("");
    setPincode("");
    setVillageName("");
    setDistrict("");
    setStateName("");
    setWeatherToday("");
    setActionTaken("");
    setOutcomeRating(5);
    setOutcomeNotes("");
    setPestObserved(false);
    setPestType("");
    setDiseaseObserved(false);
    setDiseaseType("");
    setPhotoPreview(null);
    setPhotoCompressionInfo(null);
    setFollowUpNeeded(false);
    setErrorMessage(null);
    setPincodeStatus("idle");
    setFieldErrors({});
    setTouchedFields({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Mark all required fields as touched
    setTouchedFields({
      farmer_name: true,
      phone_number: true,
      pincode: true,
      weather_today: true,
      action_taken: true,
      crop_name: true,
      crop_stage: true,
      activity_today: true,
      outcome_rating: true,
    });

    // Run Full Form Validation
    const validation = await validateEntireFarmerFeedbackForm({
      farmer_name: farmerName,
      phone_number: phoneNumber,
      pincode: pincode,
      crop_name: cropName,
      crop_stage: cropStage,
      activity_today: activityToday,
      weather_today: weatherToday,
      action_taken: actionTaken,
      outcome_rating: outcomeRating,
    });

    if (!validation.is_valid) {
      setFieldErrors(validation.field_errors);
      setErrorMessage(
        language === "hi" ? validation.form_error_hi! : validation.form_error_en!
      );
      // Log validation error
      logValidationError({
        error_type: "missing_field",
        field_name: Object.keys(validation.field_errors)[0] || "form",
        user_message_hi: validation.form_error_hi!,
        user_message_en: validation.form_error_en!,
        raw_technical_error: JSON.stringify(validation.field_errors),
      });
      return;
    }

    const payload = {
      farmer_name: farmerName,
      phone_number: phoneNumber,
      whatsapp_number: whatsappNumber,
      pincode: pincode.trim(),
      village_name: villageName,
      district: district,
      state: stateName,
      crop_name: cropName,
      crop_stage: cropStage,
      activity_today: activityToday,
      weather_today: weatherToday,
      action_taken: actionTaken,
      outcome_rating: outcomeRating,
      outcome_notes: outcomeNotes,
      photo_url: photoPreview,
      pest_observed: pestObserved,
      pest_type: pestType,
      disease_observed: diseaseObserved,
      disease_type: diseaseType,
      follow_up_needed: followUpNeeded,
      submission_source: "Web Form",
    };

    // Step 7: Check if user is offline
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
    if (!isOnline) {
      try {
        const stored = localStorage.getItem("gagandrishti_offline_submissions");
        const list = stored ? JSON.parse(stored) : [];
        list.push({
          draft_id: `draft_${Date.now()}`,
          timestamp: new Date().toISOString(),
          form_data: payload,
          retry_count: 0,
          status: "pending",
        });
        localStorage.setItem("gagandrishti_offline_submissions", JSON.stringify(list));
        setOfflineQueueCount(list.length);
        setOfflineNotice("Internet connection नहीं है। Form को offline save कर दिया गया है। जब internet ठीक होगा, डेटा अपने आप सबमिट हो जाएगा।");
        handleReset();
        return;
      } catch (err) {
        console.error("Local storage error:", err);
      }
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/farmer-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.feedback_id) {
        setSubmittedFeedbackId(data.feedback_id);
        handleReset();
      } else {
        setErrorMessage(data.error || "Submission failed. Please check fields.");
      }
    } catch (err: any) {
      // Step 4 & 5: Save locally on network exception
      try {
        const stored = localStorage.getItem("gagandrishti_offline_submissions");
        const list = stored ? JSON.parse(stored) : [];
        list.push({
          draft_id: `draft_${Date.now()}`,
          timestamp: new Date().toISOString(),
          form_data: payload,
          retry_count: 0,
          status: "pending",
        });
        localStorage.setItem("gagandrishti_offline_submissions", JSON.stringify(list));
        setOfflineQueueCount(list.length);
      } catch {}

      const friendlyMsg = normalizeTechnicalErrorMessage(err, language === "hi" ? "hi" : "en");
      setErrorMessage(friendlyMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // WhatsApp share link generator
  const getWhatsAppShareUrl = () => {
    const text = encodeURIComponent(
      `🌾 किसान भाइयों, मैंने गगनदृष्टि (GaganDrishti) पर आज का खेती अनुभव साझा किया है। आप भी अपना 2 मिनट का अनुभव साझा करें ताकि हम सब किसानों को मौसम की बेहतर सलाह मिल सके:\n${typeof window !== "undefined" ? window.location.href : ""}`
    );
    return `https://api.whatsapp.com/send?text=${text}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-slate-900/70 to-[#07111F]/90 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                <Sprout className="h-3.5 w-3.5" />
                <span>CHANGE_001 • Farmer Ground-Truth Feedback Loop</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {language === "hi"
                ? "🌾 आपकी खेती की जानकारी शेयर करें"
                : "🌾 Share Your Real Farming Experience"}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              {language === "hi"
                ? "आपका 2 मिनट का अनुभव गगनदृष्टि की मौसम और फसल सलाह को बेहतर बनाने में मदद करेगा। इस डेटा से किसानों के लिए वास्तविक जमीनी मॉडल तैयार होगा।"
                : "Help GaganDrishti improve by sharing today's farming experience (2 minutes). Your real data validates meteorological advisories for fellow farmers."}
            </p>
          </div>

          <a
            href="/feedback-analytics"
            className="inline-flex items-center gap-2 rounded-2xl bg-white dark:bg-[#0B1219] border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs shrink-0 self-start md:self-auto"
          >
            <Activity className="h-4 w-4" />
            <span>{language === "hi" ? "लाइव फीडबैक एनालिटिक्स देखें" : "View Feedback Analytics"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* Success Modal / Banner */}
      {submittedFeedbackId && (
        <div className="rounded-3xl border border-emerald-300 dark:border-emerald-500/40 bg-emerald-50/80 dark:bg-emerald-950/30 p-6 sm:p-8 space-y-4 shadow-lg animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-8 w-8 shrink-0" />
            <div>
              <h2 className="text-xl font-bold">
                {language === "hi" ? "धन्यवाद! आपकी जानकारी सफलतापूर्वक मिल गई 🙏" : "Thank you! Feedback Recorded Successfully 🙏"}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Feedback ID: <strong className="font-mono text-emerald-600 dark:text-emerald-400">#{submittedFeedbackId}</strong> •{" "}
                {language === "hi"
                  ? "आप गगनदृष्टि एआई मौसम मॉडल को और अधिक सटीक बनाने में सहयोग कर रहे हैं।"
                  : "Your real-world feedback directly empowers GaganDrishti's agricultural decision engine."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href={getWhatsAppShareUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 text-xs transition-colors shadow-xs"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>{language === "hi" ? "व्हाट्सएप पर अन्य किसानों से शेयर करें" : "Share on WhatsApp"}</span>
            </a>

            <button
              type="button"
              onClick={() => setSubmittedFeedbackId(null)}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#080E14] px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              {language === "hi" ? "नया फीडबैक भरें" : "Submit Another Entry"}
            </button>
          </div>
        </div>
      )}

      {/* Main Feedback Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Offline Queue Sync Banner (Step 7) */}
        {(offlineNotice || offlineQueueCount > 0) && (
          <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-xs text-amber-200 flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2.5">
              <WifiOff className="h-5 w-5 text-amber-400 shrink-0" />
              <div>
                <span className="font-bold block text-white">
                  {offlineNotice || `📡 ${offlineQueueCount} फ़ॉर्म ऑफ़लाइन सहेजे गए हैं (Offline Saved Forms)`}
                </span>
                <span className="text-[11px] text-amber-300">
                  इंटरनेट चालू होते ही यह अपने आप सर्वर पर सिंक हो जाएंगे।
                </span>
              </div>
            </div>
            {offlineQueueCount > 0 && (
              <button
                type="button"
                onClick={syncOfflineDrafts}
                disabled={isSyncingOffline}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 transition shrink-0 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingOffline ? "animate-spin" : ""}`} />
                <span>{isSyncingOffline ? "सिंक हो रहा..." : "🔄 अभी सिंक करें"}</span>
              </button>
            )}
          </div>
        )}

        {errorMessage && (
          <div className="rounded-2xl border border-rose-300 dark:border-rose-500/50 bg-rose-50 dark:bg-rose-950/20 p-4 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2.5">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* SECTION 1: Your Information / आपकी जानकारी */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#080E14] p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
              1
            </span>
            <h2 className="font-bold text-base text-slate-900 dark:text-white">
              {language === "hi" ? "आपकी जानकारी (Your Information)" : "Your Personal & Location Details"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Farmer Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                {language === "hi" ? "आपका नाम (Full Name) *" : "Your Full Name *"}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={farmerName}
                  onChange={(e) => {
                    setFarmerName(e.target.value);
                    if (touchedFields.farmer_name) {
                      const res = validateFarmerName(e.target.value);
                      setFieldErrors((prev) => {
                        const next = { ...prev };
                        if (!res.is_valid) next.farmer_name = language === "hi" ? res.error_message_hi! : res.error_message_en!;
                        else delete next.farmer_name;
                        return next;
                      });
                    }
                  }}
                  onBlur={handleNameBlur}
                  placeholder={language === "hi" ? "उदा. राज कुमार शर्मा" : "e.g., Raj Kumar Sharma"}
                  className={`w-full rounded-xl border bg-slate-50 dark:bg-[#0B1219] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                    fieldErrors.farmer_name
                      ? "border-rose-500 focus:ring-rose-500"
                      : touchedFields.farmer_name && farmerName.trim().length >= 3
                      ? "border-emerald-500 focus:ring-emerald-500"
                      : "border-slate-200 dark:border-slate-800 focus:ring-emerald-500"
                  }`}
                />
                {touchedFields.farmer_name && !fieldErrors.farmer_name && farmerName.trim().length >= 3 && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3 top-3 pointer-events-none" />
                )}
              </div>
              {fieldErrors.farmer_name && (
                <p className="text-[11px] text-rose-500 mt-1">{fieldErrors.farmer_name}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {language === "hi" ? "फोन नंबर (10-Digit Mobile) *" : "Phone Number (10 Digits) *"}
                </label>
                {touchedFields.phone_number && !fieldErrors.phone_number && phoneNumber.length === 10 && (
                  <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                    ✓ {language === "hi" ? "मान्य मोबाइल नंबर" : "Valid Phone"}
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs">
                  +91
                </div>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={phoneNumber}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="9826012345"
                  className={`w-full pl-10 pr-9 rounded-xl border bg-slate-50 dark:bg-[#0B1219] py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 font-mono ${
                    fieldErrors.phone_number
                      ? "border-rose-500 focus:ring-rose-500 text-rose-300"
                      : touchedFields.phone_number && phoneNumber.length === 10
                      ? "border-emerald-500 focus:ring-emerald-500"
                      : "border-slate-200 dark:border-slate-800 focus:ring-emerald-500"
                  }`}
                />
                {touchedFields.phone_number && !fieldErrors.phone_number && phoneNumber.length === 10 && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3 top-3 pointer-events-none" />
                )}
              </div>
              {fieldErrors.phone_number ? (
                <p className="text-[11px] text-rose-500 mt-1">{fieldErrors.phone_number}</p>
              ) : (
                <p className="text-[10px] text-slate-400 mt-1">6-9 से शुरू होने वाले 10 अंक दर्ज करें</p>
              )}
            </div>

            {/* WhatsApp Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                {language === "hi" ? "व्हाट्सएप नंबर (WhatsApp Number - यदि अलग हो)" : "WhatsApp Number (Optional)"}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs">
                  +91
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ""))}
                  placeholder={phoneNumber || "9826012345"}
                  className="w-full pl-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B1219] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>

            {/* Pincode */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {language === "hi" ? "पिन कोड (6-Digit Pincode) *" : "Pincode (6-Digit) *"}
                </label>
                {pincodeSearching && (
                  <span className="text-[10px] text-sky-500 animate-pulse">
                    {language === "hi" ? "पिन कोड खोज रहे हैं..." : "Searching district..."}
                  </span>
                )}
                {pincodeStatus === "found" && !fieldErrors.pincode && (
                  <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                    ✓ {language === "hi" ? "स्थान स्वतः प्राप्त" : "Auto-detected"}
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setPincode(clean);
                  }}
                  onBlur={handlePincodeBlur}
                  placeholder="उदा. 462001, 466001, 464001"
                  className={`w-full rounded-xl border bg-slate-50 dark:bg-[#0B1219] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 font-mono ${
                    fieldErrors.pincode
                      ? "border-rose-500 focus:ring-rose-500"
                      : pincodeStatus === "found"
                      ? "border-emerald-500 focus:ring-emerald-500"
                      : "border-slate-200 dark:border-slate-800 focus:ring-emerald-500"
                  }`}
                />
                <button
                  type="button"
                  onClick={handlePincodeBlur}
                  className="absolute right-2 top-2 rounded-lg bg-slate-200 dark:bg-slate-800 px-2 py-1 text-[10px] text-slate-600 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Verify
                </button>
              </div>
              {fieldErrors.pincode && (
                <p className="text-[11px] text-rose-500 mt-1">{fieldErrors.pincode}</p>
              )}
            </div>

            {/* Auto-filled or manually editable village/district/state */}
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                  {language === "hi" ? "गाँव / क्षेत्र (Village / Area)" : "Village / Area"}
                </label>
                <input
                  type="text"
                  value={villageName}
                  onChange={(e) => setVillageName(e.target.value)}
                  placeholder="Village name"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B1219] px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                  {language === "hi" ? "जिला (District)" : "District"}
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="District"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B1219] px-3 py-2 text-xs text-slate-800 dark:text-slate-200 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                  {language === "hi" ? "राज्य (State)" : "State"}
                </label>
                <input
                  type="text"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  placeholder="State"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B1219] px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Farm Information / खेत की जानकारी */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#080E14] p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
              2
            </span>
            <h2 className="font-bold text-base text-slate-900 dark:text-white">
              {language === "hi" ? "खेत की जानकारी (Crop & Growth Stage)" : "Crop & Stage Information"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                {language === "hi" ? "आप कौन-सी फसल उगा रहे हैं? (Crop Name) *" : "Which crop are you growing? *"}
              </label>
              <select
                value={cropName}
                onChange={(e) => setCropName(e.target.value as FeedbackCropName)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B1219] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {CROPS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {language === "hi" ? `${c.labelHi} (${c.labelEn})` : `${c.labelEn} (${c.labelHi})`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                {language === "hi" ? "फसल किस अवस्था/स्टेज में है? (Crop Stage) *" : "Current Crop Stage *"}
              </label>
              <select
                value={cropStage}
                onChange={(e) => setCropStage(e.target.value as FeedbackCropStage)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B1219] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {STAGES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {language === "hi" ? s.labelHi : s.labelEn}
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {language === "hi" ? "अवस्था समझ न आए तो अनुमानित दिन चुनें" : "Select nearest duration if uncertain"}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 3: Today's Activity / आज की गतिविधि */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#080E14] p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
              3
            </span>
            <h2 className="font-bold text-base text-slate-900 dark:text-white">
              {language === "hi" ? "आज की गतिविधि (Today's Farm Action)" : "Today's Farm Activity"}
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                {language === "hi" ? "आज आपने खेत में क्या काम किया? (Activity) *" : "What activity was done today? *"}
              </label>
              <select
                value={activityToday}
                onChange={(e) => setActivityToday(e.target.value as FeedbackActivity)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B1219] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {ACTIVITIES.map((act) => (
                  <option key={act.value} value={act.value}>
                    {language === "hi" ? act.labelHi : act.labelEn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {language === "hi" ? "आपने विस्तार से क्या किया? (Action Details) *" : "Detailed Action Taken *"}
                </label>
                <span
                  className={`text-[10px] font-mono ${
                    actionTaken.trim().length >= 20
                      ? "text-emerald-500 font-semibold"
                      : "text-slate-400"
                  }`}
                >
                  {actionTaken.trim().length} / 20+ {language === "hi" ? "अक्षर" : "chars"}
                </span>
              </div>
              <textarea
                required
                rows={3}
                value={actionTaken}
                onChange={(e) => {
                  setActionTaken(e.target.value);
                  if (touchedFields.action_taken) {
                    const res = validateActionTaken(e.target.value);
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      if (!res.is_valid && res.error_message_hi) next.action_taken = res.error_message_hi;
                      else delete next.action_taken;
                      return next;
                    });
                  }
                }}
                onBlur={() => {
                  setTouchedFields((prev) => ({ ...prev, action_taken: true }));
                  const res = validateActionTaken(actionTaken);
                  setFieldErrors((prev) => {
                    const next = { ...prev };
                    if (!res.is_valid && res.error_message_hi) next.action_taken = res.error_message_hi;
                    else delete next.action_taken;
                    return next;
                  });
                }}
                placeholder={
                  language === "hi"
                    ? "उदा. 'मैंने शाम 4 बजे सोयाबीन पर 5 एकड़ में Flubendiamide 2ml/L का स्प्रे किया' अथवा 'बारिश के अंदेशे से सिंचाई टाल दी'"
                    : "e.g., 'Applied fungicide on 5 acres at 4 PM' or 'Postponed irrigation due to cloud cover and rain warning'"
                }
                className={`w-full rounded-xl border bg-slate-50 dark:bg-[#0B1219] p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 leading-relaxed ${
                  fieldErrors.action_taken
                    ? "border-rose-500 focus:ring-rose-500"
                    : actionTaken.trim().length >= 20
                    ? "border-emerald-500 focus:ring-emerald-500"
                    : "border-slate-200 dark:border-slate-800 focus:ring-emerald-500"
                }`}
              />
              {fieldErrors.action_taken ? (
                <p className="text-[11px] text-rose-500 mt-1">{fieldErrors.action_taken}</p>
              ) : (
                <span className="text-[10.5px] text-slate-400 block mt-0.5">
                  {language === "hi"
                    ? "न्यूनतम 20 अक्षर। बताएं कि आपने क्या स्प्रे किया, पानी दिया या काम स्थगित किया।"
                    : "Minimum 20 characters. Mention time, area, or reasons."}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 4: Today's Weather / आज का मौसम */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#080E14] p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
              4
            </span>
            <h2 className="font-bold text-base text-slate-900 dark:text-white">
              {language === "hi" ? "आज का मौसम (Observed Weather)" : "Observed Local Weather"}
            </h2>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                {language === "hi" ? "आपके खेत पर आज मौसम कैसा रहा? (Weather Observation) *" : "What was the weather like on your farm? *"}
              </label>
              <span
                className={`text-[10px] font-mono ${
                  weatherToday.trim().length >= 20 && weatherToday.trim().length <= 500
                    ? "text-emerald-500 font-semibold"
                    : weatherToday.trim().length > 500
                    ? "text-rose-500 font-bold"
                    : "text-slate-400"
                }`}
              >
                {weatherToday.trim().length} / 500 {language === "hi" ? "अक्षर (कम से कम 20)" : "chars (min 20)"}
              </span>
            </div>
            <textarea
              required
              rows={2}
              maxLength={500}
              value={weatherToday}
              onChange={(e) => {
                setWeatherToday(e.target.value);
                if (touchedFields.weather_today) {
                  const res = validateWeatherToday(e.target.value);
                  setFieldErrors((prev) => {
                    const next = { ...prev };
                    if (!res.is_valid && res.error_message_hi) next.weather_today = res.error_message_hi;
                    else delete next.weather_today;
                    return next;
                  });
                }
              }}
              onBlur={() => {
                setTouchedFields((prev) => ({ ...prev, weather_today: true }));
                const res = validateWeatherToday(weatherToday);
                setFieldErrors((prev) => {
                  const next = { ...prev };
                  if (!res.is_valid && res.error_message_hi) next.weather_today = res.error_message_hi;
                  else delete next.weather_today;
                  return next;
                });
              }}
              placeholder={
                language === "hi"
                  ? "उदा. 'धूप थी, लगभग 29°C तापमान था, शांत हवा थी, कोई बारिश नहीं हुई' अथवा 'दोपहर में तेज बौछार और आंधी आई'"
                  : "e.g., 'Sunny, around 28°C, light breeze, no rain' OR 'Heavy rain for 1 hour at 3 PM with strong gusty winds'"
              }
              className={`w-full rounded-xl border bg-slate-50 dark:bg-[#0B1219] p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 leading-relaxed ${
                fieldErrors.weather_today
                  ? "border-rose-500 focus:ring-rose-500"
                  : weatherToday.trim().length >= 20
                  ? "border-emerald-500 focus:ring-emerald-500"
                  : "border-slate-200 dark:border-slate-800 focus:ring-emerald-500"
              }`}
            />
            {fieldErrors.weather_today && (
              <p className="text-[11px] text-rose-500 mt-1">{fieldErrors.weather_today}</p>
            )}
          </div>
        </div>

        {/* SECTION 5: Outcome & Rating / परिणाम */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#080E14] p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
              5
            </span>
            <h2 className="font-bold text-base text-slate-900 dark:text-white">
              {language === "hi" ? "परिणाम व संतुष्टि (Outcome Rating)" : "Activity Outcome & Satisfaction"}
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">
                {language === "hi" ? "आपके काम का परिणाम कैसा रहा? (Rating 1-5 Stars) *" : "How did the farm activity turn out? *"}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                {[
                  { stars: 1, labelHi: "⭐ 1 - बहुत बुरा (Very Bad)", labelEn: "⭐ 1 - Very Bad" },
                  { stars: 2, labelHi: "⭐⭐ 2 - असंतोषजनक (Bad)", labelEn: "⭐⭐ 2 - Bad" },
                  { stars: 3, labelHi: "⭐⭐⭐ 3 - ठीक-ठाक (Neutral)", labelEn: "⭐⭐⭐ 3 - Neutral" },
                  { stars: 4, labelHi: "⭐⭐⭐⭐ 4 - अच्छा (Good)", labelEn: "⭐⭐⭐⭐ 4 - Good" },
                  { stars: 5, labelHi: "⭐⭐⭐⭐⭐ 5 - बहुत अच्छा (Excellent)", labelEn: "⭐⭐⭐⭐⭐ 5 - Excellent" },
                ].map((item) => (
                  <button
                    key={item.stars}
                    type="button"
                    onClick={() => setOutcomeRating(item.stars)}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      outcomeRating === item.stars
                        ? "border-amber-400 bg-amber-50/70 dark:bg-amber-500/15 shadow-sm"
                        : "border-slate-200 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-[#0B1219]"
                    }`}
                  >
                    <div className="flex items-center gap-1 text-amber-500 mb-1">
                      {Array.from({ length: item.stars }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                      {language === "hi" ? item.labelHi : item.labelEn}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                {language === "hi" ? "अतिरिक्त टिप्पणी / परिणाम नोट्स (Optional)" : "Additional Outcome Notes (Optional)"}
              </label>
              <textarea
                rows={2}
                value={outcomeNotes}
                onChange={(e) => setOutcomeNotes(e.target.value)}
                placeholder={
                  language === "hi"
                    ? "उदा. 'पौधे स्वस्थ दिख रहे हैं' अथवा 'बारिश के कारण छिड़काव बह गया'"
                    : "e.g., 'Crops look healthy' or 'Chemical wash-off occurred due to unexpected rain'"
                }
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B1219] p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 6: Pest / Disease Observation / कीट व रोग */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#080E14] p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
              6
            </span>
            <h2 className="font-bold text-base text-slate-900 dark:text-white">
              {language === "hi" ? "कीट व रोग अवलोकन (Pest & Disease Detection)" : "Pest & Disease Field Monitoring"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pest Toggle & Input */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#0B1219] space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pestObserved}
                  onChange={(e) => setPestObserved(e.target.checked)}
                  className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {language === "hi" ? "क्या खेत में कोई कीट दिखा? (Pest Observed?)" : "Did you observe any pests?"}
                </span>
              </label>

              {pestObserved && (
                <div className="pt-2 animate-in fade-in duration-200">
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    {language === "hi" ? "कौन-सा कीट दिखा? (Pest Name)" : "Which pest was observed?"}
                  </label>
                  <input
                    type="text"
                    value={pestType}
                    onChange={(e) => setPestType(e.target.value)}
                    placeholder={language === "hi" ? "उदा. गुलाबी सुंडी, तना छेदक, इल्ली" : "e.g., Pink bollworm, Stem borer, Aphids"}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080E14] px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}
            </div>

            {/* Disease Toggle & Input */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#0B1219] space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={diseaseObserved}
                  onChange={(e) => setDiseaseObserved(e.target.checked)}
                  className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {language === "hi" ? "क्या रोग या फफूंद के लक्षण दिखे? (Disease?)" : "Did you see any disease symptoms?"}
                </span>
              </label>

              {diseaseObserved && (
                <div className="pt-2 animate-in fade-in duration-200">
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    {language === "hi" ? "कौन-सी बीमारी या लक्षण? (Disease Type)" : "Which disease symptoms?"}
                  </label>
                  <input
                    type="text"
                    value={diseaseType}
                    onChange={(e) => setDiseaseType(e.target.value)}
                    placeholder={language === "hi" ? "उदा. प्ररोह झुलसा, जड़ सड़न, पीला मोज़ेक" : "e.g., Collar rot, Yellow mosaic, Blight"}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080E14] px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 7: Photo & Follow-up / फोटो व फॉलो-अप */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#080E14] p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
              7
            </span>
            <h2 className="font-bold text-base text-slate-900 dark:text-white">
              {language === "hi" ? "खेत की फोटो एवं फॉलो-अप (Photo & Follow-up)" : "Field Photo & Follow-up Request"}
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {language === "hi"
                    ? "खेत या फसल की फोटो (Max 1MB, JPG/PNG/WEBP)"
                    : "Upload Farm / Crop Photo (Max 1MB, JPG/PNG/WEBP)"}
                </label>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Auto-Compressed (80% Quality)
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <label className="w-full sm:w-auto cursor-pointer rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1219] p-4 text-center hover:border-emerald-500 transition-colors flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <Camera className="h-4 w-4 text-emerald-500" />
                  <span>{language === "hi" ? "फ़ोटो चुनें या खींचें" : "Select or Capture Photo"}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>

                {photoPreview && (
                  <div className="flex items-center gap-3">
                    <div className="relative h-20 w-28 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photoPreview}
                        alt="Crop Preview"
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoPreview(null);
                          setPhotoCompressionInfo(null);
                        }}
                        className="absolute top-1 right-1 bg-black/70 text-white rounded-full h-5 w-5 flex items-center justify-center text-[10px]"
                      >
                        ✕
                      </button>
                    </div>
                    {photoCompressionInfo && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold block">✓ Optimized</span>
                        <span>{photoCompressionInfo}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={followUpNeeded}
                  onChange={(e) => setFollowUpNeeded(e.target.checked)}
                  className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {language === "hi"
                    ? "क्या आप किसी कृषि/मौसम प्रश्न के लिए गगनदृष्टि टीम से संपर्क या फॉलो-अप चाहते हैं?"
                    : "Do you request follow-up or advisory clarification from our agricultural desk?"}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#080E14] px-6 py-3 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#0B1219] transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>{language === "hi" ? "फॉर्म रीसेट करें" : "Reset Form"}</span>
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 text-xs sm:text-sm font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            <span>
              {isSubmitting
                ? language === "hi"
                  ? "जानकारी दर्ज हो रही है..."
                  : "Submitting Feedback..."
                : language === "hi"
                ? "अपनी जानकारी भेजें (Submit Feedback)"
                : "Submit Feedback Record"}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};

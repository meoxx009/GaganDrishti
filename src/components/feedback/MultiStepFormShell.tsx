"use client";

/**
 * FINAL_006 Step 7 — MultiStepFormShell
 * 4-step mobile-first wizard that wraps all 13 FarmerFeedback fields.
 * Default view on /farmer-feedback; FarmerFeedbackForm.tsx is kept untouched for admin/desktop.
 *
 * Steps:
 *  1. आपकी जानकारी   – farmer_name, phone_number, pincode, village_name
 *  2. खेत की जानकारी  – crop_name, crop_stage
 *  3. आज की गतिविधि  – activity_today, action_taken, pest/disease checkboxes
 *  4. मौसम और परिणाम – weather_today, outcome_rating (stars), outcome_notes, photo
 */

import React, { useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Send,
  Star,
  Camera,
  WifiOff,
  RefreshCw,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import {
  FeedbackCropName,
  FeedbackCropStage,
  FeedbackActivity,
} from "@/lib/feedback/farmerFeedbackTypes";
import {
  validateFarmerName,
  validatePhoneNumber,
  validatePincode,
  validateWeatherToday,
  validateActionTaken,
} from "@/lib/validation/formValidationEngine";
import { validateImageUpload } from "@/lib/images/imageOptimizationEngine";

// ─── Lookup data (copied from FarmerFeedbackForm.tsx lines 42-76) ────────────

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

// ─── Step metadata ────────────────────────────────────────────────────────────

const STEPS = [
  { titleHi: "आपकी जानकारी", titleEn: "Personal Info" },
  { titleHi: "खेत की जानकारी", titleEn: "Farm Info" },
  { titleHi: "आज की गतिविधि", titleEn: "Today's Activity" },
  { titleHi: "मौसम और परिणाम", titleEn: "Weather & Outcome" },
] as const;

// ─── Shared input/select className helpers ────────────────────────────────────

function inputCls(hasError: boolean, isValid?: boolean): string {
  return [
    "w-full rounded-xl border bg-slate-50 dark:bg-[#0B1219] px-4",
    "text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2",
    "transition-colors min-h-[44px]",
    hasError
      ? "border-rose-500 focus:ring-rose-500"
      : isValid
      ? "border-emerald-500 focus:ring-emerald-500"
      : "border-slate-200 dark:border-slate-700 focus:ring-cyan-500",
  ].join(" ");
}

function selectCls(): string {
  return [
    "w-full rounded-xl border border-slate-200 dark:border-slate-700",
    "bg-slate-50 dark:bg-[#0B1219] px-4 py-3",
    "text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500",
    "min-h-[44px]",
  ].join(" ");
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-[11px] text-rose-500 mt-1">{msg}</p>;
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function StepProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-6 select-none">
      {Array.from({ length: total }).map((_, i) => {
        const step = i + 1;
        const completed = step < current;
        const active = step === current;
        const label = STEPS[i];

        return (
          <React.Fragment key={step}>
            {/* Connector line before dot (except first) */}
            {i > 0 && (
              <div
                className={`flex-1 h-0.5 mx-1 rounded transition-colors ${
                  completed ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                }`}
              />
            )}

            <div className="flex flex-col items-center gap-1">
              {/* Dot */}
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold border-2 transition-all ${
                  completed
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : active
                    ? "bg-cyan-500 border-cyan-500 text-white scale-110 shadow-md shadow-cyan-500/30"
                    : "bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400"
                }`}
              >
                {completed ? "✓" : step}
              </div>
              {/* Label — hide on very small screens */}
              <span
                className={`hidden sm:block text-[10px] font-semibold text-center leading-tight max-w-[56px] ${
                  active
                    ? "text-cyan-500 dark:text-cyan-400"
                    : completed
                    ? "text-emerald-500 dark:text-emerald-400"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {label.titleHi}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export const MultiStepFormShell: React.FC = () => {
  const { language } = useApp();
  const hi = language === "hi";

  // ── Step state ──────────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // ── All 13 form fields lifted here ─────────────────────────────────────────
  const [farmerName, setFarmerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pincode, setPincode] = useState("");
  const [villageName, setVillageName] = useState("");

  const [cropName, setCropName] = useState<FeedbackCropName>("Soybean");
  const [cropStage, setCropStage] = useState<FeedbackCropStage>("Vegetative (10-35 days)");

  const [activityToday, setActivityToday] = useState<FeedbackActivity>("Spraying Pesticide");
  const [actionTaken, setActionTaken] = useState("");
  const [pestObserved, setPestObserved] = useState(false);
  const [pestType, setPestType] = useState("");
  const [diseaseObserved, setDiseaseObserved] = useState(false);
  const [diseaseType, setDiseaseType] = useState("");

  const [weatherToday, setWeatherToday] = useState("");
  const [outcomeRating, setOutcomeRating] = useState<number>(5);
  const [outcomeNotes, setOutcomeNotes] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoCompressionInfo, setPhotoCompressionInfo] = useState<string | null>(null);

  // ── Validation ──────────────────────────────────────────────────────────────
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  // ── Pincode lookup ──────────────────────────────────────────────────────────
  const [pincodeSearching, setPincodeSearching] = useState(false);
  const [pincodeStatus, setPincodeStatus] = useState<"idle" | "found" | "not_found">("idle");

  // ── Submit state ────────────────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedFeedbackId, setSubmittedFeedbackId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ── Offline queue ───────────────────────────────────────────────────────────
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);
  const [offlineNotice, setOfflineNotice] = useState<string | null>(null);
  const [isSyncingOffline, setIsSyncingOffline] = useState(false);

  // Load offline queue on mount + register online listener
  React.useEffect(() => {
    if (typeof window === "undefined") return;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Sync offline drafts ─────────────────────────────────────────────────────
  const syncOfflineDrafts = async () => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("gagandrishti_offline_submissions");
    if (!stored) return;
    try {
      const list = JSON.parse(stored);
      if (!Array.isArray(list) || list.length === 0) return;
      setIsSyncingOffline(true);
      let successCount = 0;
      const remaining: unknown[] = [];
      for (const item of list) {
        try {
          const res = await fetch("/api/farmer-feedback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item.form_data),
          });
          const d = await res.json();
          if (d.success) successCount++;
          else remaining.push(item);
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

  // ── Field-level validators (blur handlers) ──────────────────────────────────

  const setError = (field: string, msg: string | null) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (msg) next[field] = msg;
      else delete next[field];
      return next;
    });
  };

  const touch = (field: string) =>
    setTouchedFields((prev) => ({ ...prev, [field]: true }));

  const handleNameBlur = () => {
    touch("farmer_name");
    const r = validateFarmerName(farmerName);
    setError("farmer_name", r.is_valid ? null : (hi ? r.error_message_hi! : r.error_message_en!));
  };

  const handlePhoneChange = (val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 10);
    setPhoneNumber(clean);
    touch("phone_number");
    const r = validatePhoneNumber(clean);
    setError("phone_number", r.is_valid ? null : (hi ? r.error_message_hi! : r.error_message_en!));
  };

  const handlePincodeBlur = async () => {
    touch("pincode");
    const clean = pincode.trim();
    if (!clean) {
      setError("pincode", hi ? "Pincode required है" : "Pincode is required");
      setPincodeStatus("idle");
      return;
    }
    if (clean.length !== 6) {
      setError("pincode", hi ? "Pincode 6 अंकों का होना चाहिए" : "Pincode must be 6 digits");
      setPincodeStatus("not_found");
      return;
    }
    setPincodeSearching(true);
    setPincodeStatus("idle");
    const pinRes = await validatePincode(clean);
    setPincodeSearching(false);
    if (pinRes.is_valid && pinRes.locationDetails) {
      setVillageName(pinRes.locationDetails.village_name || "");
      setPincodeStatus("found");
      setError("pincode", null);
    } else {
      setPincodeStatus("not_found");
      setError("pincode", hi ? pinRes.error_message_hi! : pinRes.error_message_en!);
    }
  };

  const handleActionChange = (val: string) => {
    setActionTaken(val);
    if (touchedFields.action_taken || val.length > 0) {
      const r = validateActionTaken(val);
      setError("action_taken", r.is_valid ? null : (hi ? r.error_message_hi! : r.error_message_en!));
    }
  };

  const handleActionBlur = () => {
    touch("action_taken");
    const r = validateActionTaken(actionTaken);
    setError("action_taken", r.is_valid ? null : (hi ? r.error_message_hi! : r.error_message_en!));
  };

  const handleWeatherChange = (val: string) => {
    setWeatherToday(val);
    if (touchedFields.weather_today || val.length > 0) {
      const r = validateWeatherToday(val);
      setError("weather_today", r.is_valid ? null : (hi ? r.error_message_hi! : r.error_message_en!));
    }
  };

  const handleWeatherBlur = () => {
    touch("weather_today");
    const r = validateWeatherToday(weatherToday);
    setError("weather_today", r.is_valid ? null : (hi ? r.error_message_hi! : r.error_message_en!));
  };

  // ── Photo upload (Canvas compression, same as FarmerFeedbackForm) ───────────
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const valResult = validateImageUpload({ name: file.name, size: file.size, type: file.type });
    if (!valResult.is_valid) {
      alert(hi ? valResult.error_message_hi : valResult.error_message);
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width;
        let h = img.height;
        const max = 2048;
        if (w > max || h > max) {
          if (w > h) { h = Math.round((h * max) / w); w = max; }
          else { w = Math.round((w * max) / h); h = max; }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL("image/webp", 0.8) || canvas.toDataURL("image/jpeg", 0.8);
          const origKb = Math.round(file.size / 1024);
          const compKb = Math.round((dataUrl.length * 0.75) / 1024);
          const pct = Math.max(0, Math.round(((origKb - compKb) / origKb) * 100));
          setPhotoPreview(dataUrl);
          setPhotoCompressionInfo(`${compKb} KB (${pct}% compressed from ${origKb} KB)`);
        } else {
          setPhotoPreview(event.target?.result as string);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // ── Step validation gate ────────────────────────────────────────────────────
  const validateStep = async (step: number): Promise<boolean> => {
    const errors: Record<string, string> = { ...fieldErrors };
    let ok = true;

    if (step === 1) {
      const nr = validateFarmerName(farmerName);
      if (!nr.is_valid) { errors.farmer_name = hi ? nr.error_message_hi! : nr.error_message_en!; ok = false; }
      else delete errors.farmer_name;

      const pr = validatePhoneNumber(phoneNumber);
      if (!pr.is_valid) { errors.phone_number = hi ? pr.error_message_hi! : pr.error_message_en!; ok = false; }
      else delete errors.phone_number;

      touch("farmer_name"); touch("phone_number"); touch("pincode");

      if (!pincode || pincode.length !== 6) {
        errors.pincode = hi ? "Pincode 6 अंकों का होना चाहिए" : "Pincode must be 6 digits";
        ok = false;
      } else if (pincodeStatus !== "found") {
        // Try to validate pincode now
        setPincodeSearching(true);
        const pinRes = await validatePincode(pincode);
        setPincodeSearching(false);
        if (pinRes.is_valid && pinRes.locationDetails) {
          setVillageName(pinRes.locationDetails.village_name || "");
          setPincodeStatus("found");
          delete errors.pincode;
        } else {
          errors.pincode = hi ? pinRes.error_message_hi! : pinRes.error_message_en!;
          ok = false;
        }
      }
    }

    if (step === 3) {
      touch("action_taken");
      const ar = validateActionTaken(actionTaken);
      if (!ar.is_valid) { errors.action_taken = hi ? ar.error_message_hi! : ar.error_message_en!; ok = false; }
      else delete errors.action_taken;
    }

    if (step === 4) {
      touch("weather_today");
      const wr = validateWeatherToday(weatherToday);
      if (!wr.is_valid) { errors.weather_today = hi ? wr.error_message_hi! : wr.error_message_en!; ok = false; }
      else delete errors.weather_today;
    }

    setFieldErrors(errors);
    return ok;
  };

  const handleNext = async () => {
    const valid = await validateStep(currentStep);
    if (!valid) return;
    setCurrentStep((s) => Math.min(s + 1, 4) as 1 | 2 | 3 | 4);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrev = () => {
    setCurrentStep((s) => Math.max(s - 1, 1) as 1 | 2 | 3 | 4);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Final submit ────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const valid = await validateStep(4);
    if (!valid) return;

    const payload = {
      farmer_name: farmerName,
      phone_number: phoneNumber,
      pincode: pincode.trim(),
      village_name: villageName,
      crop_name: cropName,
      crop_stage: cropStage,
      activity_today: activityToday,
      action_taken: actionTaken,
      weather_today: weatherToday,
      outcome_rating: outcomeRating,
      outcome_notes: outcomeNotes,
      photo_url: photoPreview,
      pest_observed: pestObserved,
      pest_type: pestType,
      disease_observed: diseaseObserved,
      disease_type: diseaseType,
      submission_source: "Web Form",
    };

    // Offline path — save to localStorage
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
        setOfflineNotice(
          "Internet connection नहीं है। Form को offline save कर दिया गया है। जब internet ठीक होगा, डेटा अपने आप सबमिट हो जाएगा।"
        );
        // Reset to step 1 on success
        setCurrentStep(1);
        return;
      } catch (err) {
        console.error("LocalStorage error:", err);
      }
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/farmer-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success && data.feedback_id) {
        setSubmittedFeedbackId(data.feedback_id);
      } else {
        setErrorMessage(data.error || (hi ? "सबमिट नहीं हो सका। कृपया दोबारा कोशिश करें।" : "Submission failed. Please try again."));
      }
    } catch (err: unknown) {
      // Save to offline queue on network failure
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
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(hi ? `नेटवर्क त्रुटि: ${msg}. फ़ॉर्म ऑफ़लाइन सहेजा गया।` : `Network error: ${msg}. Form saved offline.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (submittedFeedbackId) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="rounded-3xl border border-emerald-300 dark:border-emerald-500/40 bg-emerald-50/80 dark:bg-emerald-950/30 p-8 space-y-4 shadow-lg text-center animate-in fade-in zoom-in-95 duration-300">
          <div className="flex justify-center">
            <CheckCircle2 className="h-16 w-16 text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
            {hi ? "धन्यवाद! जानकारी मिल गई 🙏" : "Thank you! Feedback Recorded 🙏"}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Feedback ID:{" "}
            <strong className="font-mono text-emerald-600 dark:text-emerald-400">
              #{submittedFeedbackId}
            </strong>
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {hi
              ? "आपकी जानकारी से गगनदृष्टि AI मौसम मॉडल बेहतर होगा।"
              : "Your real-world data directly empowers GaganDrishti's agricultural engine."}
          </p>
          <button
            type="button"
            onClick={() => {
              setSubmittedFeedbackId(null);
              setCurrentStep(1);
              setFarmerName(""); setPhoneNumber(""); setPincode(""); setVillageName("");
              setCropName("Soybean"); setCropStage("Vegetative (10-35 days)");
              setActivityToday("Spraying Pesticide"); setActionTaken("");
              setPestObserved(false); setPestType(""); setDiseaseObserved(false); setDiseaseType("");
              setWeatherToday(""); setOutcomeRating(5); setOutcomeNotes("");
              setPhotoPreview(null); setPhotoCompressionInfo(null);
              setFieldErrors({}); setTouchedFields({}); setPincodeStatus("idle");
            }}
            className="mt-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 text-sm transition-colors min-h-[48px]"
          >
            {hi ? "नया फीडबैक भरें" : "Submit Another Entry"}
          </button>
        </div>
      </div>
    );
  }

  // ── Shared nav button classes ────────────────────────────────────────────────
  const btnPrev =
    "inline-flex items-center gap-2 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#080E14] px-5 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#0B1219] transition-colors min-h-[48px]";
  const btnNext =
    "inline-flex items-center gap-2 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 text-sm font-bold transition-all shadow-md hover:shadow-lg min-h-[48px]";
  const btnSubmit =
    "inline-flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 text-sm font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 min-h-[48px]";

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
      {/* ── Offline banner ──────────────────────────────────────────────────── */}
      {(offlineNotice || offlineQueueCount > 0) && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-xs text-amber-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <WifiOff className="h-5 w-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold block text-white">
                {offlineNotice || `📡 ${offlineQueueCount} फ़ॉर्म ऑफ़लाइन सहेजे गए`}
              </span>
              <span className="text-[11px] text-amber-300">
                इंटरनेट चालू होते ही अपने आप सर्वर पर सिंक हो जाएंगे।
              </span>
            </div>
          </div>
          {offlineQueueCount > 0 && (
            <button
              type="button"
              onClick={syncOfflineDrafts}
              disabled={isSyncingOffline}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 transition shrink-0 cursor-pointer disabled:opacity-50 min-h-[44px]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingOffline ? "animate-spin" : ""}`} />
              <span>{isSyncingOffline ? "सिंक हो रहा..." : "🔄 अभी सिंक करें"}</span>
            </button>
          )}
        </div>
      )}

      {/* ── Error banner ──────────────────────────────────────────────────────── */}
      {errorMessage && (
        <div className="rounded-2xl border border-rose-500/50 bg-rose-950/20 p-4 text-xs text-rose-300">
          {errorMessage}
        </div>
      )}

      {/* ── Progress bar ──────────────────────────────────────────────────────── */}
      <StepProgressBar current={currentStep} total={4} />

      {/* ── Step title ────────────────────────────────────────────────────────── */}
      <div className="text-center mb-2">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
          {hi
            ? `${currentStep}. ${STEPS[currentStep - 1].titleHi}`
            : `${currentStep}. ${STEPS[currentStep - 1].titleEn}`}
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          {hi ? `चरण ${currentStep} / 4` : `Step ${currentStep} of 4`}
        </p>
      </div>

      {/* ── STEP 1 — आपकी जानकारी ─────────────────────────────────────────────── */}
      {currentStep === 1 && (
        <div className="space-y-4">
          {/* Farmer Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
              किसान का नाम (Farmer Name) *
            </label>
            <input
              type="text"
              required
              value={farmerName}
              onChange={(e) => {
                setFarmerName(e.target.value);
                if (touchedFields.farmer_name) {
                  const r = validateFarmerName(e.target.value);
                  setError("farmer_name", r.is_valid ? null : (hi ? r.error_message_hi! : r.error_message_en!));
                }
              }}
              onBlur={handleNameBlur}
              placeholder={hi ? "उदा. राज कुमार शर्मा" : "e.g., Raj Kumar Sharma"}
              className={`${inputCls(!!fieldErrors.farmer_name, touchedFields.farmer_name && !fieldErrors.farmer_name && farmerName.trim().length >= 3)} py-3`}
            />
            <FieldError msg={fieldErrors.farmer_name} />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
              फोन नंबर (Phone Number) *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 text-sm">
                +91
              </div>
              <input
                type="tel"
                required
                maxLength={10}
                value={phoneNumber}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="9826012345"
                className={`${inputCls(!!fieldErrors.phone_number, touchedFields.phone_number && !fieldErrors.phone_number && phoneNumber.length === 10)} pl-12 py-3 font-mono`}
              />
              {touchedFields.phone_number && !fieldErrors.phone_number && phoneNumber.length === 10 && (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              )}
            </div>
            <FieldError msg={fieldErrors.phone_number} />
            {!fieldErrors.phone_number && (
              <p className="text-[11px] text-slate-400 mt-1">6-9 से शुरू होने वाले 10 अंक दर्ज करें</p>
            )}
          </div>

          {/* Pincode */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                पिन कोड (Pincode) *
              </label>
              {pincodeSearching && (
                <span className="text-[11px] text-sky-500 animate-pulse">
                  {hi ? "खोज रहे हैं..." : "Searching..."}
                </span>
              )}
              {pincodeStatus === "found" && !fieldErrors.pincode && (
                <span className="text-[11px] text-emerald-500 font-semibold">✓ Auto-detected</span>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                required
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                onBlur={handlePincodeBlur}
                placeholder="उदा. 462001"
                className={`${inputCls(!!fieldErrors.pincode, pincodeStatus === "found")} py-3 font-mono pr-20`}
              />
              <button
                type="button"
                onClick={handlePincodeBlur}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-slate-200 dark:bg-slate-800 px-3 py-1 text-[11px] text-slate-600 dark:text-slate-300 font-semibold cursor-pointer min-h-[32px]"
              >
                Verify
              </button>
            </div>
            <FieldError msg={fieldErrors.pincode} />
          </div>

          {/* Village Name (auto-fill + editable) */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
              गाँव / क्षेत्र (Village / Area)
            </label>
            <input
              type="text"
              value={villageName}
              onChange={(e) => setVillageName(e.target.value)}
              placeholder={hi ? "गाँव का नाम" : "Village name"}
              className={`${inputCls(false)} py-3`}
            />
            <p className="text-[11px] text-slate-400 mt-1">
              {hi ? "Pincode verify होने पर अपने आप भर जाएगा" : "Auto-filled after pincode verification"}
            </p>
          </div>
        </div>
      )}

      {/* ── STEP 2 — खेत की जानकारी ───────────────────────────────────────────── */}
      {currentStep === 2 && (
        <div className="space-y-4">
          {/* Crop Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
              फसल का नाम (Crop Name) *
            </label>
            <select
              value={cropName}
              onChange={(e) => setCropName(e.target.value as FeedbackCropName)}
              className={selectCls()}
            >
              {CROPS.map((c) => (
                <option key={c.value} value={c.value}>
                  {hi ? `${c.labelHi} (${c.labelEn})` : `${c.labelEn} (${c.labelHi})`}
                </option>
              ))}
            </select>
          </div>

          {/* Crop Stage */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
              फसल की अवस्था (Crop Stage) *
            </label>
            <select
              value={cropStage}
              onChange={(e) => setCropStage(e.target.value as FeedbackCropStage)}
              className={selectCls()}
            >
              {STAGES.map((s) => (
                <option key={s.value} value={s.value}>
                  {hi ? s.labelHi : s.labelEn}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              {hi ? "अवस्था न पता हो तो अनुमानित दिन चुनें" : "Select nearest duration if uncertain"}
            </p>
          </div>
        </div>
      )}

      {/* ── STEP 3 — आज की गतिविधि ───────────────────────────────────────────── */}
      {currentStep === 3 && (
        <div className="space-y-4">
          {/* Activity dropdown */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
              आज की गतिविधि (Activity Today) *
            </label>
            <select
              value={activityToday}
              onChange={(e) => setActivityToday(e.target.value as FeedbackActivity)}
              className={selectCls()}
            >
              {ACTIVITIES.map((act) => (
                <option key={act.value} value={act.value}>
                  {hi ? act.labelHi : act.labelEn}
                </option>
              ))}
            </select>
          </div>

          {/* Action taken textarea */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                विस्तार से बताएं (Action Taken) *
              </label>
              <span
                className={`text-[11px] font-mono ${
                  actionTaken.trim().length >= 20 ? "text-emerald-500 font-semibold" : "text-slate-400"
                }`}
              >
                {actionTaken.trim().length} / 20+ {hi ? "अक्षर" : "chars"}
              </span>
            </div>
            <textarea
              required
              rows={4}
              value={actionTaken}
              onChange={(e) => handleActionChange(e.target.value)}
              onBlur={handleActionBlur}
              placeholder={
                hi
                  ? "उदा. 'मैंने शाम 4 बजे सोयाबीन पर 5 एकड़ में Flubendiamide 2ml/L का स्प्रे किया'"
                  : "e.g., 'Applied fungicide on 5 acres at 4 PM'"
              }
              className={`w-full rounded-xl border bg-slate-50 dark:bg-[#0B1219] p-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 leading-relaxed transition-colors min-h-[44px] ${
                fieldErrors.action_taken
                  ? "border-rose-500 focus:ring-rose-500"
                  : actionTaken.trim().length >= 20
                  ? "border-emerald-500 focus:ring-emerald-500"
                  : "border-slate-200 dark:border-slate-700 focus:ring-cyan-500"
              }`}
            />
            <FieldError msg={fieldErrors.action_taken} />
            {!fieldErrors.action_taken && (
              <p className="text-[11px] text-slate-400 mt-1">
                {hi ? "कम से कम 20 अक्षर — समय, क्षेत्र, या कारण बताएं।" : "Minimum 20 characters. Mention time, area, or reasons."}
              </p>
            )}
          </div>

          {/* Pest observed checkbox */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-[#0B1219] p-4 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={pestObserved}
                onChange={(e) => setPestObserved(e.target.checked)}
                className="h-5 w-5 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {hi ? "क्या खेत में कोई कीट दिखा? (Pest Observed?)" : "Did you observe any pests?"}
              </span>
            </label>
            {pestObserved && (
              <div className="animate-in fade-in duration-200">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  {hi ? "कौन-सा कीट? (Pest Name)" : "Which pest?"}
                </label>
                <input
                  type="text"
                  value={pestType}
                  onChange={(e) => setPestType(e.target.value)}
                  placeholder={hi ? "उदा. गुलाबी सुंडी, तना छेदक" : "e.g., Pink bollworm, Stem borer"}
                  className={`${inputCls(false)} py-2.5`}
                />
              </div>
            )}
          </div>

          {/* Disease observed checkbox */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-[#0B1219] p-4 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={diseaseObserved}
                onChange={(e) => setDiseaseObserved(e.target.checked)}
                className="h-5 w-5 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {hi ? "क्या रोग या फफूंद के लक्षण दिखे? (Disease?)" : "Did you see any disease symptoms?"}
              </span>
            </label>
            {diseaseObserved && (
              <div className="animate-in fade-in duration-200">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  {hi ? "कौन-सी बीमारी / लक्षण?" : "Which disease symptoms?"}
                </label>
                <input
                  type="text"
                  value={diseaseType}
                  onChange={(e) => setDiseaseType(e.target.value)}
                  placeholder={hi ? "उदा. प्ररोह झुलसा, पीला मोज़ेक" : "e.g., Yellow mosaic, Collar rot"}
                  className={`${inputCls(false)} py-2.5`}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── STEP 4 — मौसम और परिणाम ───────────────────────────────────────────── */}
      {currentStep === 4 && (
        <div className="space-y-4">
          {/* Weather textarea */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                आज का मौसम (Weather Today) *
              </label>
              <span
                className={`text-[11px] font-mono ${
                  weatherToday.trim().length >= 20 && weatherToday.trim().length <= 500
                    ? "text-emerald-500 font-semibold"
                    : weatherToday.trim().length > 500
                    ? "text-rose-500 font-bold"
                    : "text-slate-400"
                }`}
              >
                {weatherToday.trim().length} / 500 {hi ? "अक्षर (कम से कम 20)" : "chars (min 20)"}
              </span>
            </div>
            <textarea
              required
              rows={3}
              maxLength={500}
              value={weatherToday}
              onChange={(e) => handleWeatherChange(e.target.value)}
              onBlur={handleWeatherBlur}
              placeholder={
                hi
                  ? "उदा. 'धूप थी, लगभग 29°C, शांत हवा, कोई बारिश नहीं'"
                  : "e.g., 'Sunny, around 29°C, light breeze, no rain'"
              }
              className={`w-full rounded-xl border bg-slate-50 dark:bg-[#0B1219] p-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 leading-relaxed transition-colors min-h-[44px] ${
                fieldErrors.weather_today
                  ? "border-rose-500 focus:ring-rose-500"
                  : weatherToday.trim().length >= 20
                  ? "border-emerald-500 focus:ring-emerald-500"
                  : "border-slate-200 dark:border-slate-700 focus:ring-cyan-500"
              }`}
            />
            <FieldError msg={fieldErrors.weather_today} />
          </div>

          {/* Outcome Rating — 1-5 stars */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
              {hi ? "काम का परिणाम (Outcome Rating 1-5) *" : "Activity Outcome Rating (1-5 Stars) *"}
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setOutcomeRating(s)}
                  aria-label={`Rate ${s} stars`}
                  className={`flex-1 flex flex-col items-center gap-1 rounded-2xl border p-3 transition-all min-h-[48px] ${
                    outcomeRating === s
                      ? "border-amber-400 bg-amber-50/70 dark:bg-amber-500/15 shadow-sm"
                      : "border-slate-200 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-[#0B1219]"
                  }`}
                >
                  <Star
                    className={`h-5 w-5 ${
                      outcomeRating >= s ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-600"
                    }`}
                  />
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{s}</span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 text-center">
              {outcomeRating === 1 ? (hi ? "बहुत बुरा" : "Very Bad")
               : outcomeRating === 2 ? (hi ? "असंतोषजनक" : "Bad")
               : outcomeRating === 3 ? (hi ? "ठीक-ठाक" : "Neutral")
               : outcomeRating === 4 ? (hi ? "अच्छा" : "Good")
               : (hi ? "बहुत अच्छा" : "Excellent")}
            </p>
          </div>

          {/* Outcome notes (optional) */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
              {hi ? "अतिरिक्त टिप्पणी (Outcome Notes — वैकल्पिक)" : "Additional Outcome Notes (Optional)"}
            </label>
            <textarea
              rows={2}
              value={outcomeNotes}
              onChange={(e) => setOutcomeNotes(e.target.value)}
              placeholder={hi ? "उदा. 'पौधे स्वस्थ दिख रहे हैं'" : "e.g., 'Crops look healthy'"}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1219] p-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 min-h-[44px]"
            />
          </div>

          {/* Photo upload */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
              {hi ? "खेत की फोटो (वैकल्पिक, max 1 MB)" : "Farm Photo (Optional, max 1 MB)"}
            </label>
            <label className="flex items-center justify-center gap-3 cursor-pointer rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1219] p-4 hover:border-cyan-500 transition-colors min-h-[56px]">
              <Camera className="h-5 w-5 text-cyan-500" />
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                {hi ? "फ़ोटो चुनें या खींचें" : "Select or Capture Photo"}
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>

            {photoPreview && (
              <div className="mt-3 flex items-center gap-3">
                <div className="relative h-20 w-28 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xs shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photoPreview} alt="Crop Preview" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { setPhotoPreview(null); setPhotoCompressionInfo(null); }}
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
      )}

      {/* ── Navigation buttons ─────────────────────────────────────────────────── */}
      <div className={`flex gap-3 pt-2 ${currentStep === 1 ? "justify-end" : "justify-between"}`}>
        {currentStep > 1 && (
          <button type="button" onClick={handlePrev} className={btnPrev}>
            <ChevronLeft className="h-4 w-4" />
            {hi ? "← पिछला" : "← Prev"}
          </button>
        )}

        {currentStep < 4 ? (
          <button type="button" onClick={handleNext} className={btnNext}>
            {hi ? "अगला →" : "Next →"}
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={btnSubmit}
          >
            <Send className="h-4 w-4" />
            {isSubmitting
              ? (hi ? "जमा हो रहा है..." : "Submitting...")
              : (hi ? "✓ सबमिट करें" : "✓ Submit")}
          </button>
        )}
      </div>
    </div>
  );
};

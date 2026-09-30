"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Mail,
  Smartphone,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Landmark,
  UserCheck,
  KeyRound,
  Sparkles,
} from "lucide-react";

interface OfficerPreset {
  name: string;
  email: string;
  role: string;
  district?: string;
  state: string;
  department: string;
}

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState<string>("admin.raisen@mp.gov.in");
  const [password, setPassword] = useState<string>("Admin@2026!");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 2FA Step State
  const [step2FA, setStep2FA] = useState<boolean>(false);
  const [maskedPhone, setMaskedPhone] = useState<string>("98******01");
  const [otpCode, setOtpCode] = useState<string>("");
  const [demoCode, setDemoCode] = useState<string>("742918");

  // Preseeded officers list for 1-click evaluation
  const [officers, setOfficers] = useState<OfficerPreset[]>([
    {
      name: "Raj Kumar Singh",
      email: "admin.raisen@mp.gov.in",
      role: "District Admin",
      district: "Raisen",
      state: "Madhya Pradesh",
      department: "District Collectorate, Raisen",
    },
    {
      name: "Dr. Sunita Chouhan",
      email: "admin.sehore@mp.gov.in",
      role: "District Admin",
      district: "Sehore",
      state: "Madhya Pradesh",
      department: "Deputy Director Agriculture, Sehore",
    },
    {
      name: "Siddharth Rao, IAS",
      email: "state.admin@mp.gov.in",
      role: "State Admin",
      state: "Madhya Pradesh",
      department: "Dept of Agriculture, MP Vallabh Bhawan",
    },
    {
      name: "Col. Rajesh Nayak (Retd)",
      email: "disaster.officer@mp.gov.in",
      role: "Disaster Officer",
      state: "Madhya Pradesh",
      department: "State Disaster Management Authority (MP SDMA)",
    },
  ]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email: email.trim(), password }),
      });
      const data = await res.json();

      if (data.success && data.two_factor_required) {
        setMaskedPhone(data.phone_masked);
        setDemoCode(data.demo_code);
        setOtpCode(data.demo_code); // Pre-fill for reviewer convenience
        setStep2FA(true);
      } else {
        setError(data.error || "Login verification failed");
      }
    } catch (err: any) {
      setError(err.message || "Failed to contact authentication server");
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify_2fa", email: email.trim(), code: otpCode.trim() }),
      });
      const data = await res.json();

      if (data.success && data.session) {
        // Save session token in localStorage
        localStorage.setItem("gagandrishti_gov_token", data.session.token);
        localStorage.setItem("gagandrishti_gov_session", JSON.stringify(data.session));
        router.push("/admin/district-dashboard");
      } else {
        setError(data.error || "Invalid 2FA code");
      }
    } catch (err: any) {
      setError(err.message || "2FA verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOfficer = (officer: OfficerPreset) => {
    setEmail(officer.email);
    setPassword("Admin@2026!");
    setStep2FA(false);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Rings */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full mx-auto relative z-10">
        {/* Government Emblem & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-blue-500/20 border border-amber-500/30 text-amber-400 mb-3 shadow-lg">
            <Landmark className="w-8 h-8" />
          </div>
          <div className="text-xs uppercase font-bold tracking-widest text-amber-400">
            Government of Madhya Pradesh
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            GaganDrishti Command Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            District Administration & Disaster Management Integration Portal
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!step2FA ? (
            /* Step 1: Government Email & Password */
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Official Email Address (@mp.gov.in)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="officer@mp.gov.in"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-700 bg-slate-900/80 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-700 bg-slate-900/80 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Verifying Official Credentials...
                    </span>
                  ) : (
                    <>
                      Proceed to 2FA Verification
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Step 2: 2-Factor Authentication (SMS OTP) */
            <form onSubmit={handle2FASubmit} className="space-y-4">
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs">
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <Smartphone className="w-4 h-4" />
                  2-Factor SMS Authentication
                </div>
                <span>
                  A 6-digit verification code was dispatched to registered mobile number{" "}
                  <strong>+91-{maskedPhone}</strong>.
                </span>
                {demoCode && (
                  <div className="mt-2 pt-2 border-t border-blue-500/20 text-amber-300">
                    <strong>Demo Passcode:</strong> <span className="font-mono">{demoCode}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Enter 6-Digit OTP Code
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    required
                    placeholder="742918"
                    className="w-full pl-9 pr-3 py-2 text-center text-lg font-mono tracking-widest rounded-xl border border-slate-700 bg-slate-900/80 text-amber-400 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep2FA(false)}
                  className="w-1/3 py-2.5 px-3 rounded-xl border border-slate-700 hover:bg-slate-700/50 text-slate-300 text-xs font-semibold transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      Authenticating...
                    </span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Verify & Open Command Center
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Quick Demo Pre-seed Switcher */}
          <div className="mt-6 pt-5 border-t border-slate-700/60">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
              <span>Quick Demo Officer Login</span>
              <span className="text-amber-400 text-[10px]">1-Click Autofill</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {officers.map((officer, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOfficer(officer)}
                  className={`p-2 rounded-xl border text-left transition ${
                    email === officer.email
                      ? "bg-blue-600/20 border-blue-500 text-blue-200"
                      : "bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <div className="font-bold truncate">{officer.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {officer.role} ({officer.district || officer.state})
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link href="/" className="text-xs text-slate-400 hover:text-white transition">
            &larr; Return to Public Weather Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

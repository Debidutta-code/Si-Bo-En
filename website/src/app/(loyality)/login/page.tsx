"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { loginApi, loginWithEmail, verifyOtpApi, updatePasswordApi } from "./api";
import { loyaltyLoginSuccess } from "@/src/store/loyaltyUserSlice";

type LoginMode = "withPassword" | "withEmail";
type OtpStep = "email" | "otp" | "setPassword" | "done";

const perks = [
  { icon: "✦", title: "Exclusive Rewards",  desc: "Redeem points for stays, dining & spa vouchers" },
  { icon: "◈", title: "Member Tiers",       desc: "Silver, Gold & Platinum levels with unique perks" },
  { icon: "⬡", title: "Priority Access",    desc: "Early check-in, late check-out & room upgrades" },
  { icon: "◇", title: "Travel Perks",       desc: "Earn miles on every booking & partner stays" },
];

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconUser = () => (
  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5a5a6e" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconLock = () => (
  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5a5a6e" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconEyeOff = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const IconEye = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

// ─── Component ────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const router   = useRouter();
  const dispatch = useDispatch();

  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [mode,    setMode]    = useState<LoginMode>("withPassword");

  const [password,    setPassword]    = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [otpStep,          setOtpStep]          = useState<OtpStep>("email");
  const [otp,              setOtp]              = useState("");
  const [newPassword,      setNewPassword]      = useState("");
  const [confirmPassword,  setConfirmPassword]  = useState("");
  const [showNewPass,      setShowNewPass]      = useState(false);
  const [showConfirmPass,  setShowConfirmPass]  = useState(false);

  const switchMode = (next: LoginMode) => {
    setMode(next);
    setOtpStep("email");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
  };

  // ── Handlers (unchanged logic) ─────────────────────────────────────────────
  const handlePasswordLogin = async () => {
    if (!email.trim())    { toast.error("Email is required");    return; }
    if (!password.trim()) { toast.error("Password is required"); return; }
    setLoading(true);
    try {
      const res = await loginApi({ email: email.trim(), password });
      if (res?.success) {
        dispatch(loyaltyLoginSuccess({ id: res.data?.id ?? "", email: email.trim() }));
        toast.success("Logged in successfully!");
        router.push("/profile");
      } else {
        toast.error(res?.message ?? "Login failed");
      }
    } catch { toast.error("Something went wrong, please try again"); }
    finally  { setLoading(false); }
  };

  const handleSendOtp = async () => {
    if (!email.trim()) { toast.error("Email is required"); return; }
    setLoading(true);
    try {
      const res = await loginWithEmail(email.trim());
      if (res?.success) { toast.success("OTP sent! Check your inbox."); setOtpStep("otp"); }
      else               toast.error(res?.message ?? "Failed to send OTP");
    } catch { toast.error("Something went wrong, please try again"); }
    finally  { setLoading(false); }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) { toast.error("Please enter the OTP"); return; }
    setLoading(true);
    try {
      const res = await verifyOtpApi(email.trim(), otp.trim());
      if (res?.success) { toast.success("OTP verified!"); setOtpStep("setPassword"); }
      else               toast.error(res?.message ?? "Invalid or expired OTP");
    } catch { toast.error("Something went wrong, please try again"); }
    finally  { setLoading(false); }
  };

  const handleSetPassword = async () => {
    if (!newPassword.trim())            { toast.error("Password is required");                  return; }
    if (newPassword.length < 8)         { toast.error("Password must be at least 8 characters"); return; }
    if (newPassword !== confirmPassword){ toast.error("Passwords do not match");                return; }
    setLoading(true);
    try {
      const res = await updatePasswordApi(email.trim(), newPassword);
      if (res?.success) {
        toast.success("Password set! Logging you in…");
        setOtpStep("done");
        const loginRes = await loginApi({ email: email.trim(), password: newPassword });
        if (loginRes?.success) {
          dispatch(loyaltyLoginSuccess({ id: loginRes.data?.id ?? "", email: email.trim() }));
          router.push("/profile");
        } else {
          toast.error("Password set but auto-login failed. Please sign in manually.");
          switchMode("withPassword");
        }
      } else toast.error(res?.message ?? "Failed to update password");
    } catch { toast.error("Something went wrong, please try again"); }
    finally  { setLoading(false); }
  };

  // ── Derived UI ─────────────────────────────────────────────────────────────
  const primaryLabel = () => {
    if (loading) return "Please wait…";
    if (mode === "withPassword") return "Sign In";
    if (otpStep === "email")     return "Send One-Time Code";
    if (otpStep === "otp")       return "Verify Code";
    return "Set Password & Enter";
  };

  const primaryAction = () => {
    if (mode === "withPassword") return handlePasswordLogin();
    if (otpStep === "email")     return handleSendOtp();
    if (otpStep === "otp")       return handleVerifyOtp();
    return handleSetPassword();
  };

  const heading = () => {
    if (mode === "withPassword") return "Welcome back";
    if (otpStep === "email")     return "Email sign-in";
    if (otpStep === "otp")       return "Enter your code";
    return "Set your password";
  };

  const subtext = () => {
    if (mode === "withPassword")  return "Access your Revchill member account.";
    if (otpStep === "email")      return "We'll send a one-time code to your inbox.";
    if (otpStep === "otp")        return `Code sent to ${email}`;
    return "Choose a secure password for your account.";
  };

  // ── Input style helper ─────────────────────────────────────────────────────
  const inputCls = "w-full rounded-xl text-[13.5px] font-light outline-none transition-all duration-200 placeholder:text-[#3a3a52]";

  const s = {
    input: {
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.1)",
      color: "#e8e4f0",
      padding: "13px 13px 13px 42px",
    } as React.CSSProperties,
    inputFocus: {
      borderColor: "rgba(212,168,83,0.55)",
      background: "rgba(212,168,83,0.04)",
      boxShadow: "0 0 0 3px rgba(212,168,83,0.08)",
    },
    inputBlur: {
      borderColor: "rgba(255,255,255,0.1)",
      background: "rgba(255,255,255,0.04)",
      boxShadow: "none",
    },
  };

  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => Object.assign(e.currentTarget.style, s.inputFocus);
  const onBlur  = (e: React.FocusEvent<HTMLInputElement>) => Object.assign(e.currentTarget.style, s.inputBlur);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');

        .lumiere-root { font-family: 'Jost', sans-serif; }

        /* animated gold shimmer on logo text */
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .gold-shimmer {
          background: linear-gradient(90deg, #c49a2a 0%, #f0d080 40%, #d4a853 60%, #c49a2a 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }

        /* soft pulse on the decorative ring */
        @keyframes pulse-ring {
          0%, 100% { opacity: 0.18; transform: scale(1); }
          50%       { opacity: 0.32; transform: scale(1.04); }
        }
        .pulse-ring { animation: pulse-ring 6s ease-in-out infinite; }

        /* fade-in for right panel */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.55s cubic-bezier(.22,1,.36,1) both; }

        /* step-dot transition */
        .step-dot { transition: background 0.3s, box-shadow 0.3s; }

        /* CTA hover */
        .cta-btn:hover { filter: brightness(1.08); }
        .cta-btn:active { transform: scale(0.985); }

        /* eye-toggle hover */
        .eye-btn { color: #3a3a55; transition: color 0.2s; }
        .eye-btn:hover { color: #d4a853; }

        /* perk card hover */
        .perk-card:hover {
          border-color: rgba(212,168,83,0.35) !important;
          background: rgba(212,168,83,0.06) !important;
        }

        /* resend link */
        .resend-link { color: #d4a853; transition: opacity 0.2s; font-size: 12px; margin-top: 8px; display: inline-block; }
        .resend-link:hover { opacity: 0.65; }

        /* disabled input */
        .disabled-input { opacity: 0.4; cursor: not-allowed; pointer-events: none; }

        /* scrollbar dark */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(212,168,83,0.25); border-radius: 2px; }
      `}</style>

      <div
        className="lumiere-root flex min-h-screen overflow-hidden"
        style={{ background: "white" }}
      >

        {/* ═══════════════════════════════════════════════════════
            LEFT PANEL — dark atmospheric showcase
        ════════════════════════════════════════════════════════ */}
        <div
          className="hidden lg:flex w-[48%] flex-shrink-0 relative items-center justify-center overflow-hidden"
          style={{
            background: "white",
          }}
        >

          {/* Noise texture overlay */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`,
            backgroundSize: "256px 256px",
          }} />

          {/* Radial warm glow */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "radial-gradient(ellipse 60% 50% at 50% 35%, rgba(212,168,83,0.09) 0%, transparent 65%)",
          }} />

          {/* Decorative SVG composition */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 520 800" preserveAspectRatio="xMidYMid slice">
            {/* Concentric circles — top right */}
            <circle className="pulse-ring" cx="480" cy="90"  r="380" fill="none" stroke="rgba(212,168,83,0.12)" strokeWidth="0.8"/>
            <circle cx="480" cy="90"  r="260" fill="none" stroke="rgba(212,168,83,0.09)" strokeWidth="0.8"/>
            <circle cx="480" cy="90"  r="160" fill="none" stroke="rgba(212,168,83,0.07)" strokeWidth="0.8"/>
            <circle cx="480" cy="90"  r="80"  fill="none" stroke="rgba(212,168,83,0.06)" strokeWidth="0.8"/>

            {/* Bottom-left accent geometry */}
            <polygon points="40,740 90,780 20,790" fill="none" stroke="rgba(212,168,83,0.2)" strokeWidth="0.8"/>
            <line x1="0" y1="680" x2="140" y2="800" stroke="rgba(212,168,83,0.08)" strokeWidth="0.6"/>

            {/* Center diamond ornament */}
            <polygon points="260,340 274,360 260,380 246,360" fill="none" stroke="rgba(212,168,83,0.3)" strokeWidth="0.8"/>
            <polygon points="260,346 270,360 260,374 250,360" fill="rgba(212,168,83,0.06)"/>

            {/* Thin horizontal rule */}
            <line x1="60" y1="460" x2="460" y2="460" stroke="rgba(212,168,83,0.06)" strokeWidth="0.5"/>

            {/* Scattered dots */}
            <circle cx="100" cy="200" r="1.5" fill="rgba(212,168,83,0.3)"/>
            <circle cx="420" cy="600" r="1"   fill="rgba(212,168,83,0.25)"/>
            <circle cx="50"  cy="560" r="2"   fill="rgba(212,168,83,0.15)"/>
            <circle cx="390" cy="300" r="1.2" fill="rgba(212,168,83,0.2)"/>

            {/* Corner bracket — bottom right */}
            <path d="M500 770 L500 800 L470 800" fill="none" stroke="rgba(212,168,83,0.22)" strokeWidth="0.8"/>
            {/* Corner bracket — top left */}
            <path d="M20 30 L20 0 L50 0" fill="none" stroke="rgba(212,168,83,0.22)" strokeWidth="0.8"/>
          </svg>

          {/* Content */}
          <div className="relative z-10 px-14 py-12 max-w-[460px] w-full">

            {/* Brand mark */}
            <div className="flex items-center gap-3 mb-16">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, #c49a2a 0%, #e8c55a 50%, #b8881a 100%)",
                  boxShadow: "0 4px 24px rgba(212,168,83,0.3)",
                }}
              >
                <span
                  className="text-[#0b0b14] font-semibold text-xl"
                  style={{ fontFamily: "'Cormorant', serif", letterSpacing: "0.02em" }}
                >R</span>
              </div>
              <div>
                <p className="text-[19px] font-medium leading-none tracking-[0.06em] text-white" style={{ fontFamily: "'Cormorant', serif" }}>
                  Revchill
                </p>
                <p className="text-[9.5px] tracking-[0.22em] uppercase mt-0.5" style={{ color: "#d4a853" }}>
                  Guest Loyalty
                </p>
              </div>
            </div>

            {/* Hero headline */}
            <div className="mb-10">
              <h1
                className="font-light leading-[1.15] text-white mb-3"
                style={{
                  fontFamily: "'Cormorant', serif",
                  fontSize: "clamp(36px, 3.8vw, 52px)",
                  letterSpacing: "-0.01em",
                }}
              >
                Where every<br/>
                stay becomes<br/>
                <em className="gold-shimmer not-italic font-normal">unforgettable.</em>
              </h1>
              <p
                className="text-[13px] leading-[1.8] font-light"
                style={{ color: "rgba(255,255,255,0.38)", maxWidth: "320px" }}
              >
                Join a curated loyalty experience built for those who appreciate the finest details of travel.
              </p>
            </div>

            {/* Perks */}
            <div className="grid grid-cols-2 gap-2.5">
              {perks.map((perk) => (
                <div
                  key={perk.title}
                  className="perk-card rounded-2xl p-4 transition-all duration-300"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <p className="text-[#d4a853] text-[18px] mb-2 leading-none">{perk.icon}</p>
                  <p className="text-white text-[12px] font-medium mb-1 tracking-wide">{perk.title}</p>
                  <p className="text-[11px] font-light leading-[1.55]" style={{ color: "rgba(255,255,255,0.35)" }}>
                    {perk.desc}
                  </p>
                </div>
              ))}
            </div>

            
          </div>
        </div>
        <div
          className="hidden lg:block w-px flex-shrink-0"
          style={{ background: "linear-gradient(to bottom, transparent, rgba(212,168,83,0.15) 25%, rgba(212,168,83,0.15) 75%, transparent)" }}
        />

        <div
          className="flex-1 flex items-center justify-center p-8 lg:p-12"
          style={{ background: "#0d0d1a" }}
        >
          <div className="w-full max-w-[380px] fade-up">

            {/* Mobile brand */}
            <div className="flex lg:hidden items-center gap-2.5 mb-8">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #c49a2a, #e8c55a)" }}
              >
                <span className="text-[#0b0b14] font-semibold text-base" style={{ fontFamily: "'Cormorant', serif" }}>R</span>
              </div>
              <span className="text-white text-[16px] tracking-[0.06em]" style={{ fontFamily: "'Cormorant', serif" }}>Revchill</span>
            </div>

            {/* Status badge */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-7"
              style={{ background: "rgba(212,168,83,0.1)", border: "1px solid rgba(212,168,83,0.2)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#d4a853" }} />
              <span className="text-[10px] font-medium tracking-[0.1em] uppercase" style={{ color: "#d4a853" }}>
                Member Portal
              </span>
            </div>

            {/* Heading */}
            <div className="mb-7">
              <h2
                className="text-[32px] font-light leading-tight mb-2 text-white"
                style={{ fontFamily: "'Cormorant', serif", letterSpacing: "-0.01em" }}
              >
                {heading()}
              </h2>
              <p className="text-[13px] font-light" style={{ color: "rgba(255,255,255,0.38)" }}>
                {subtext()}
              </p>
            </div>

            {/* OTP step indicator */}
            {mode === "withEmail" && (
              <div className="flex items-center gap-2 mb-7">
                {(["email", "otp", "setPassword"] as OtpStep[]).map((step, i) => {
                  const steps: OtpStep[] = ["email", "otp", "setPassword"];
                  const current = steps.indexOf(otpStep);
                  const done    = i < current;
                  const active  = i === current;
                  return (
                    <div key={step} className="flex items-center gap-2">
                      <div
                        className="step-dot w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold"
                        style={{
                          background: done
                            ? "rgba(212,168,83,0.25)"
                            : active
                            ? "linear-gradient(135deg, #c49a2a, #e8c55a)"
                            : "rgba(255,255,255,0.06)",
                          color: done || active ? "#d4a853" : "rgba(255,255,255,0.3)",
                          boxShadow: active ? "0 0 12px rgba(212,168,83,0.35)" : "none",
                          border: done ? "1px solid rgba(212,168,83,0.4)" : "none",
                        }}
                      >
                        {done ? "✓" : i + 1}
                      </div>
                      {i < 2 && (
                        <div className="w-10 h-px transition-all duration-500" style={{
                          background: i < current ? "rgba(212,168,83,0.5)" : "rgba(255,255,255,0.08)"
                        }} />
                      )}
                    </div>
                  );
                })}
                <span className="ml-1 text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                  {otpStep === "email" ? "Enter email" : otpStep === "otp" ? "Verify code" : "Set password"}
                </span>
              </div>
            )}

            {/* ── Email field ───────────────────────────────── */}
            <div className="mb-4">
              <label
                className="block text-[10.5px] uppercase tracking-[0.12em] font-medium mb-2"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="you@email.com"
                  disabled={mode === "withEmail" && otpStep !== "email"}
                  className={`${inputCls} ${mode === "withEmail" && otpStep !== "email" ? "disabled-input" : ""}`}
                  style={s.input}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <IconUser />
              </div>
            </div>

            {/* ── Password (Flow 1) ─────────────────────────── */}
            {mode === "withPassword" && (
              <div className="mb-1">
                <label
                  className="block text-[10.5px] uppercase tracking-[0.12em] font-medium mb-2"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••"
                    className={inputCls}
                    style={{ ...s.input, padding: "13px 42px" }}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handlePasswordLogin()}
                  />
                  <IconLock />
                  <button type="button" className="eye-btn absolute right-3.5 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
                <div className="flex justify-end mt-3 mb-4">
                  <button
                    className="text-[12px] transition-opacity hover:opacity-60"
                    style={{ color: "#d4a853" }}
                    onClick={() => switchMode("withEmail")}
                  >
                    Forgot password?
                  </button>
                </div>
              </div>
            )}

            {/* ── OTP input (Flow 2 – Step 2) ───────────────── */}
            {mode === "withEmail" && otpStep === "otp" && (
              <div className="mb-4">
                <label
                  className="block text-[10.5px] uppercase tracking-[0.12em] font-medium mb-2"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  One-Time Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="6-digit code"
                    className={inputCls}
                    style={{ ...s.input, letterSpacing: "0.25em", fontSize: "16px" }}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
                  />
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5a5a6e" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                  </svg>
                </div>
                <button
                  className="resend-link"
                  onClick={() => { setOtp(""); handleSendOtp(); }}
                >
                  Resend code →
                </button>
              </div>
            )}

            {/* ── New password (Flow 2 – Step 3) ───────────── */}
            {mode === "withEmail" && otpStep === "setPassword" && (
              <>
                {[
                  { label: "New Password",     val: newPassword,     set: setNewPassword,     show: showNewPass,     toggle: () => setShowNewPass(!showNewPass),     placeholder: "Min. 8 characters" },
                  { label: "Confirm Password", val: confirmPassword, set: setConfirmPassword, show: showConfirmPass, toggle: () => setShowConfirmPass(!showConfirmPass), placeholder: "Repeat your password" },
                ].map(({ label, val, set, show, toggle, placeholder }) => (
                  <div key={label} className="mb-4">
                    <label
                      className="block text-[10.5px] uppercase tracking-[0.12em] font-medium mb-2"
                      style={{ color: "rgba(255,255,255,0.35)" }}
                    >
                      {label}
                    </label>
                    <div className="relative">
                      <input
                        type={show ? "text" : "password"}
                        placeholder={placeholder}
                        className={inputCls}
                        style={{ ...s.input, padding: "13px 42px" }}
                        onFocus={onFocus}
                        onBlur={onBlur}
                        value={val}
                        onChange={(e) => set(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSetPassword()}
                      />
                      <IconLock />
                      <button type="button" className="eye-btn absolute right-3.5 top-1/2 -translate-y-1/2" onClick={toggle}>
                        {show ? <IconEyeOff /> : <IconEye />}
                      </button>
                    </div>
                  </div>
                ))}
                {newPassword && confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-[11.5px] -mt-2 mb-3" style={{ color: "#e05555" }}>Passwords do not match</p>
                )}
              </>
            )}

            {/* ── Primary CTA ───────────────────────────────── */}
            <button
              disabled={loading}
              className="cta-btn w-full py-[14px] rounded-xl text-[13.5px] font-medium tracking-[0.06em] border-none cursor-pointer transition-all duration-200 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, #c49a2a 0%, #e8c55a 50%, #b8881a 100%)",
                color: "#0b0b14",
                boxShadow: "0 4px 24px rgba(212,168,83,0.3), inset 0 1px 0 rgba(255,255,255,0.25)",
              }}
              onClick={primaryAction}
            >
              <span className="relative flex items-center justify-center gap-2.5">
                {loading ? (
                  <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
                    <path d="M12 2a10 10 0 0 1 10 10"/>
                  </svg>
                ) : (
                  <span className="text-base leading-none">✦</span>
                )}
                {primaryLabel()}
              </span>
            </button>

            {/* ── Divider ───────────────────────────────────── */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
              <span className="text-[10px] uppercase tracking-[0.12em]" style={{ color: "rgba(255,255,255,0.2)" }}>or</span>
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
            </div>

            {/* ── Secondary toggle ──────────────────────────── */}
            <button
              className="w-full py-[13px] rounded-xl text-[13px] font-light flex items-center justify-center gap-2.5 cursor-pointer transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.09)",
                color: "rgba(255,255,255,0.65)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(212,168,83,0.3)";
                e.currentTarget.style.background = "rgba(212,168,83,0.05)";
                e.currentTarget.style.color = "#d4a853";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)";
                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                e.currentTarget.style.color = "rgba(255,255,255,0.65)";
              }}
              onClick={() => switchMode(mode === "withPassword" ? "withEmail" : "withPassword")}
            >
              {mode === "withPassword" ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                  Continue with Email OTP
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  Continue with Password
                </>
              )}
            </button>

            {/* ── Legal ─────────────────────────────────────── */}
            <p
              className="mt-6 text-center text-[11px] leading-relaxed"
              style={{ color: "rgba(255,255,255,0.18)" }}
            >
              By signing in you agree to our{" "}
              <a href="#" className="transition-opacity hover:opacity-60" style={{ color: "rgba(212,168,83,0.7)" }}>Terms of Service</a>
              {" "}&amp;{" "}
              <a href="#" className="transition-opacity hover:opacity-60" style={{ color: "rgba(212,168,83,0.7)" }}>Privacy Policy</a>.
            </p>

          </div>
        </div>
      </div>
    </>
  );
}
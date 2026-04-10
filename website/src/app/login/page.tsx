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
  { icon: "🎁", title: "Exclusive Rewards", desc: "Redeem points for stays, dining & spa vouchers" },
  { icon: "⭐", title: "Member Tiers",      desc: "Silver, Gold & Platinum levels with unique perks" },
  { icon: "🏨", title: "Priority Access",   desc: "Early check-in, late check-out & room upgrades" },
  { icon: "✈️", title: "Travel Perks",      desc: "Earn miles on every booking & partner stays" },
];

const inputBase =
  "w-full rounded-[9px] text-[13.5px] font-light outline-none transition-all duration-200 placeholder:text-[#c8c8c8]";
const inputStyle: React.CSSProperties = {
  padding: "11px 13px 11px 38px",
  background: "#fafafa",
  border: "1.5px solid #e0e0e0",
  color: "#1a1a1a",
};
const goldBtn: React.CSSProperties = {
  background: "linear-gradient(135deg, #c9a020 0%, #b8912a 100%)",
  boxShadow: "0 4px 16px rgba(184,145,42,0.25)",
};
const outlineBtn: React.CSSProperties = { border: "1.5px solid #e0e0e0" };

// ─── Small helpers ─────────────────────────────────────────────────────────────
const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.style.borderColor = "rgba(184,145,42,0.6)";
  e.currentTarget.style.background = "#fff";
  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(184,145,42,0.07)";
};
const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.style.borderColor = "#e0e0e0";
  e.currentTarget.style.background = "#fafafa";
  e.currentTarget.style.boxShadow = "none";
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconUser = () => (
  <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c0c0c0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconLock = () => (
  <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c0c0c0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconEyeOff = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const IconEye = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

// ─── Component ────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  // ── shared
  const [email, setEmail]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [mode, setMode]         = useState<LoginMode>("withPassword");

  // ── password login
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ── OTP flow
  const [otpStep, setOtpStep]               = useState<OtpStep>("email");
  const [otp, setOtp]                       = useState("");
  const [newPassword, setNewPassword]       = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPass, setShowNewPass]       = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // ── reset all OTP state when switching mode
  const switchMode = (next: LoginMode) => {
    setMode(next);
    setOtpStep("email");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────────────────────────

  /** Flow 1: email + password */
  const handlePasswordLogin = async () => {
    if (!email.trim()) { toast.error("Email is required"); return; }
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
    } catch {
      toast.error("Something went wrong, please try again");
    } finally {
      setLoading(false);
    }
  };

  /** Flow 2 – Step 1: send OTP */
  const handleSendOtp = async () => {
    if (!email.trim()) { toast.error("Email is required"); return; }
    setLoading(true);
    try {
      const res = await loginWithEmail(email.trim());
      if (res?.success) {
        toast.success("OTP sent! Check your inbox.");
        setOtpStep("otp");
      } else {
        toast.error(res?.message ?? "Failed to send OTP");
      }
    } catch {
      toast.error("Something went wrong, please try again");
    } finally {
      setLoading(false);
    }
  };

  /** Flow 2 – Step 2: verify OTP */
  const handleVerifyOtp = async () => {
    if (!otp.trim()) { toast.error("Please enter the OTP"); return; }
    setLoading(true);
    try {
      const res = await verifyOtpApi(email.trim(), otp.trim());
      if (res?.success) {
        toast.success("OTP verified!");
        setOtpStep("setPassword");
      } else {
        toast.error(res?.message ?? "Invalid or expired OTP");
      }
    } catch {
      toast.error("Something went wrong, please try again");
    } finally {
      setLoading(false);
    }
  };

  /** Flow 2 – Step 3: set new password */
  const handleSetPassword = async () => {
    if (!newPassword.trim()) { toast.error("Password is required"); return; }
    if (newPassword.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return; }
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
      } else {
        toast.error(res?.message ?? "Failed to update password");
      }
    } catch {
      toast.error("Something went wrong, please try again");
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Derived UI labels
  // ─────────────────────────────────────────────────────────────────────────────
  const primaryLabel = () => {
    if (loading) return "Please wait…";
    if (mode === "withPassword") return "Sign in to My Account";
    if (otpStep === "email")       return "Send OTP";
    if (otpStep === "otp")         return "Verify OTP";
    return "Set Password & Sign In";
  };

  const primaryAction = () => {
    if (mode === "withPassword") return handlePasswordLogin();
    if (otpStep === "email")     return handleSendOtp();
    if (otpStep === "otp")       return handleVerifyOtp();
    return handleSetPassword();
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-white overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ─── LEFT PANEL ──────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex w-[52%] relative items-center justify-center overflow-hidden" style={{ background: "#fdf8ee" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 70% 55% at 70% 15%, rgba(184,145,42,0.12) 0%, transparent 55%), radial-gradient(ellipse 55% 45% at 10% 85%, rgba(184,145,42,0.08) 0%, transparent 50%)` }} />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg viewBox="0 0 700 800" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
            <circle cx="620" cy="120" r="320" fill="none" stroke="rgba(184,145,42,0.08)" strokeWidth="1"/>
            <circle cx="620" cy="120" r="220" fill="none" stroke="rgba(184,145,42,0.06)" strokeWidth="1"/>
            <circle cx="620" cy="120" r="140" fill="none" stroke="rgba(184,145,42,0.05)" strokeWidth="1"/>
            <line x1="0" y1="750" x2="700" y2="350" stroke="rgba(184,145,42,0.05)" strokeWidth="1"/>
            <path d="M 640 640 L 680 640 L 680 643 L 643 643 L 643 680 L 640 680 Z" fill="rgba(184,145,42,0.2)"/>
            <circle cx="60" cy="400" r="1.5" fill="rgba(184,145,42,0.4)"/>
            <circle cx="70" cy="390" r="1" fill="rgba(184,145,42,0.3)"/>
          </svg>
        </div>

        <div className="relative z-10 px-16 py-12 max-w-[520px] w-full">
          {/* Brand */}
          <div className="flex items-center gap-2.5 mb-14">
            <div className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: "#b8912a" }}>
              <span className="text-white text-lg font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>L</span>
            </div>
            <div>
              <p className="text-[17px] font-semibold leading-tight text-[#1a1a1a] tracking-wide" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Lumière</p>
              <p className="text-[10px] font-normal tracking-[0.12em] uppercase" style={{ color: "#b8912a" }}>Guest Loyalty Program</p>
            </div>
          </div>

          <h1 className="font-light leading-[1.2] tracking-tight text-[#1a1a1a] mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(32px, 3.5vw, 44px)" }}>
            Your loyalty,<br/>
            <em className="italic" style={{ color: "#b8912a" }}>beautifully</em><br/>
            rewarded.
          </h1>

          <p className="text-[13.5px] leading-[1.75] font-light max-w-[340px] mb-10" style={{ color: "#7a7a7a" }}>
            Sign in to access exclusive member benefits, track your points, and unlock personalised rewards crafted just for you.
          </p>

          {/* Perks grid */}
          <div className="grid grid-cols-2 gap-3">
            {perks.map((perk) => (
              <div key={perk.title} className="bg-white rounded-xl p-4 transition-shadow duration-200 hover:shadow-md" style={{ border: "1px solid rgba(184,145,42,0.2)" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[15px] mb-2.5" style={{ background: "#fdf8ee" }}>{perk.icon}</div>
                <p className="text-[12.5px] font-medium text-[#1a1a1a] mb-1 tracking-tight">{perk.title}</p>
                <p className="text-[11px] font-light leading-[1.5]" style={{ color: "#7a7a7a" }}>{perk.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── DIVIDER ─────────────────────────────────────────────────────────── */}
      <div className="hidden lg:block w-px flex-shrink-0" style={{ background: "linear-gradient(to bottom, transparent, #e8e8e8 20%, #e8e8e8 80%, transparent)" }} />

      {/* ─── RIGHT PANEL ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12 bg-white">
        <div className="w-full max-w-[360px]">

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 mb-6" style={{ background: "#fdf8ee", border: "1px solid rgba(184,145,42,0.2)" }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#b8912a" }} />
            <span className="text-[11px] font-medium uppercase tracking-[0.06em]" style={{ color: "#b8912a" }}>Loyalty Member Portal</span>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h2 className="text-[26px] font-semibold text-[#1a1a1a] mb-1 tracking-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {mode === "withPassword" ? "Welcome back" : otpStep === "email" ? "Sign in with Email" : otpStep === "otp" ? "Enter your OTP" : "Set your Password"}
            </h2>
            <p className="text-[13px] font-light" style={{ color: "#7a7a7a" }}>
              {mode === "withPassword"
                ? "Enter your credentials to continue."
                : otpStep === "email"
                  ? "We'll send a one-time code to your inbox."
                  : otpStep === "otp"
                    ? `Code sent to ${email}. Check your inbox.`
                    : "Choose a secure password for your account."}
            </p>
          </div>

          {/* ── Step indicator (OTP flow) */}
          {mode === "withEmail" && (
            <div className="flex items-center gap-1.5 mb-6">
              {(["email", "otp", "setPassword"] as OtpStep[]).map((step, i) => {
                const steps: OtpStep[] = ["email", "otp", "setPassword"];
                const current = steps.indexOf(otpStep);
                const isActive = i <= current;
                return (
                  <div key={step} className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold transition-colors"
                      style={{ background: isActive ? "#b8912a" : "#e0e0e0", color: isActive ? "#fff" : "#999" }}>
                      {i + 1}
                    </div>
                    {i < 2 && <div className="w-8 h-px" style={{ background: isActive ? "#b8912a" : "#e0e0e0" }} />}
                  </div>
                );
              })}
              <span className="ml-1 text-[11px]" style={{ color: "#999" }}>
                {otpStep === "email" ? "Enter email" : otpStep === "otp" ? "Verify OTP" : "Set password"}
              </span>
            </div>
          )}

          {/* ── Email field (always shown) */}
          <div className="mb-3.5">
            <label className="block text-[11px] uppercase tracking-[0.08em] font-medium mb-1.5" style={{ color: "#999" }}>Email</label>
            <div className="relative">
              <input
                type="email"
                placeholder="you@email.com"
                disabled={mode === "withEmail" && otpStep !== "email"}
                className={`${inputBase} ${mode === "withEmail" && otpStep !== "email" ? "opacity-50 cursor-not-allowed" : ""}`}
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <IconUser />
            </div>
          </div>

          {/* ── Password (Flow 1) */}
          {mode === "withPassword" && (
            <div className="mb-1">
              <label className="block text-[11px] uppercase tracking-[0.08em] font-medium mb-1.5" style={{ color: "#999" }}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••"
                  className={inputBase}
                  style={{ ...inputStyle, padding: "11px 38px" }}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handlePasswordLogin()}
                />
                <IconLock />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "#c0c0c0" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#b8912a")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#c0c0c0")}
                >
                  {showPassword ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
              <div className="flex justify-end mt-3 mb-4">
                <button className="text-xs hover:opacity-70 transition-opacity" style={{ color: "#b8912a" }}
                  onClick={() => switchMode("withEmail")}>
                  Forgot password?
                </button>
              </div>
            </div>
          )}

          {/* ── OTP input (Flow 2 – Step 2) */}
          {mode === "withEmail" && otpStep === "otp" && (
            <div className="mb-3.5">
              <label className="block text-[11px] uppercase tracking-[0.08em] font-medium mb-1.5" style={{ color: "#999" }}>One-Time Code</label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="6-digit code"
                  className={inputBase}
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c0c0c0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
              </div>
              <button className="text-[11.5px] mt-2 hover:opacity-70 transition-opacity" style={{ color: "#b8912a" }}
                onClick={() => { setOtp(""); handleSendOtp(); }}>
                Resend code
              </button>
            </div>
          )}

          {/* ── New password fields (Flow 2 – Step 3) */}
          {mode === "withEmail" && otpStep === "setPassword" && (
            <>
              <div className="mb-3.5">
                <label className="block text-[11px] uppercase tracking-[0.08em] font-medium mb-1.5" style={{ color: "#999" }}>New Password</label>
                <div className="relative">
                  <input
                    type={showNewPass ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    className={inputBase}
                    style={{ ...inputStyle, padding: "11px 38px" }}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <IconLock />
                  <button type="button" onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: "#c0c0c0" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#b8912a")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#c0c0c0")}
                  >
                    {showNewPass ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
              </div>
              <div className="mb-3.5">
                <label className="block text-[11px] uppercase tracking-[0.08em] font-medium mb-1.5" style={{ color: "#999" }}>Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    placeholder="Repeat your password"
                    className={inputBase}
                    style={{ ...inputStyle, padding: "11px 38px" }}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSetPassword()}
                  />
                  <IconLock />
                  <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: "#c0c0c0" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#b8912a")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#c0c0c0")}
                  >
                    {showConfirmPass ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
                {/* Strength hint */}
                {newPassword && confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-[11px] mt-1.5" style={{ color: "#e05555" }}>Passwords do not match</p>
                )}
              </div>
            </>
          )}

          {/* ── Primary CTA */}
          <button
            disabled={loading}
            className="w-full py-3.5 rounded-[9px] text-white text-[13.5px] font-medium tracking-wide border-none cursor-pointer transition-all duration-200 active:scale-[0.99] relative overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
            style={goldBtn}
            onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.opacity = "0.92"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(184,145,42,0.35)"; } }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(184,145,42,0.25)"; }}
            onClick={primaryAction}
          >
            <span className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 100%)" }} />
            <span className="relative flex items-center justify-center gap-2">
              {loading && (
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor"/>
                </svg>
              )}
              {primaryLabel()}
            </span>
          </button>

          {/* ── Sep */}
          <div className="flex items-center gap-2.5 my-4">
            <div className="flex-1 h-px" style={{ background: "#efefef" }} />
            <span className="text-[10.5px] uppercase tracking-[0.08em]" style={{ color: "#c0c0c0" }}>or</span>
            <div className="flex-1 h-px" style={{ background: "#efefef" }} />
          </div>

          {/* ── Secondary toggle */}
          <button
            className="w-full py-3 rounded-[9px] text-[#1a1a1a] text-[13px] font-normal flex items-center justify-center gap-2.5 bg-white cursor-pointer transition-all duration-200"
            style={outlineBtn}
            onClick={() => switchMode(mode === "withPassword" ? "withEmail" : "withPassword")}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#d0c0a0"; e.currentTarget.style.background = "#fffdf7"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e0e0e0"; e.currentTarget.style.background = "#fff"; e.currentTarget.style.boxShadow = "none"; }}
          >
            {mode === "withPassword" ? (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                Continue with Email OTP
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Continue with Password
              </>
            )}
          </button>

          {/* ── Legal */}
          <p className="mt-5 text-center text-[11px] leading-relaxed" style={{ color: "#bbb" }}>
            By signing in, you agree to our{" "}
            <a href="#" className="hover:opacity-70 transition-opacity" style={{ color: "#c0a050" }}>Terms of Service</a>
            {" "}&{" "}
            <a href="#" className="hover:opacity-70 transition-opacity" style={{ color: "#c0a050" }}>Privacy Policy</a>.
          </p>

        </div>
      </div>
    </div>
  );
}

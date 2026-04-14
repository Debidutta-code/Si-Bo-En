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
  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7ab8be" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconLock = () => (
  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7ab8be" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
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
  const inputCls = "w-full rounded-xl text-[13.5px] font-light outline-none transition-all duration-200 placeholder:text-[#9bbfc3]";

  const s = {
    input: {
      background: "rgba(21,149,162,0.04)",
      border: "1px solid rgba(21,149,162,0.2)",
      color: "#0d4a52",
      padding: "13px 13px 13px 42px",
    } as React.CSSProperties,
    inputFocus: {
      borderColor: "rgba(21,149,162,0.6)",
      background: "rgba(21,149,162,0.07)",
      boxShadow: "0 0 0 3px rgba(21,149,162,0.1)",
    },
    inputBlur: {
      borderColor: "rgba(21,149,162,0.2)",
      background: "rgba(21,149,162,0.04)",
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

        /* teal shimmer on headline */
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .teal-shimmer {
          background: linear-gradient(90deg, #0d7a87 0%, #1fc8d8 40%, #1595A2 60%, #0d7a87 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }

        /* soft pulse on the decorative ring */
        @keyframes pulse-ring {
          0%, 100% { opacity: 0.14; transform: scale(1); }
          50%       { opacity: 0.28; transform: scale(1.04); }
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
        .eye-btn { color: #7ab8be; transition: color 0.2s; }
        .eye-btn:hover { color: #1595A2; }

        /* perk card hover */
        .perk-card:hover {
          border-color: rgba(21,149,162,0.4) !important;
          background: rgba(21,149,162,0.08) !important;
        }

        /* resend link */
        .resend-link { color: #1595A2; transition: opacity 0.2s; font-size: 12px; margin-top: 8px; display: inline-block; }
        .resend-link:hover { opacity: 0.65; }

        /* disabled input */
        .disabled-input { opacity: 0.4; cursor: not-allowed; pointer-events: none; }

        /* scrollbar */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(21,149,162,0.25); border-radius: 2px; }
      `}</style>

      <div
        className="lumiere-root flex min-h-screen overflow-hidden"
        style={{ background: "white" }}
      >

        {/* ── LEFT PANEL ──────────────────────────────────────────────────── */}
        <div
          className="hidden lg:flex w-[48%] flex-shrink-0 relative items-center justify-center overflow-hidden"
          style={{
            background: "linear-gradient(160deg, #0d8a97 0%, #1595A2 40%, #0f7882 100%)",
          }}
        >

          {/* Noise texture overlay */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
            backgroundSize: "256px 256px",
          }} />

          {/* Radial light glow */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "radial-gradient(ellipse 60% 50% at 50% 35%, rgba(255,255,255,0.12) 0%, transparent 65%)",
          }} />

          {/* Decorative SVG composition */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 520 800" preserveAspectRatio="xMidYMid slice">
            {/* Concentric circles — top right */}
            <circle className="pulse-ring" cx="480" cy="90"  r="380" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8"/>
            <circle cx="480" cy="90"  r="260" fill="none" stroke="rgba(255,255,255,0.1)"  strokeWidth="0.8"/>
            <circle cx="480" cy="90"  r="160" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8"/>
            <circle cx="480" cy="90"  r="80"  fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8"/>

            {/* Bottom-left accent geometry */}
            <polygon points="40,740 90,780 20,790" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="0.8"/>
            <line x1="0" y1="680" x2="140" y2="800" stroke="rgba(255,255,255,0.08)" strokeWidth="0.6"/>

            {/* Center diamond ornament */}
            <polygon points="260,340 274,360 260,380 246,360" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8"/>
            <polygon points="260,346 270,360 260,374 250,360" fill="rgba(255,255,255,0.08)"/>

            {/* Thin horizontal rule */}
            <line x1="60" y1="460" x2="460" y2="460" stroke="rgba(255,255,255,0.07)" strokeWidth="0.5"/>

            {/* Scattered dots */}
            <circle cx="100" cy="200" r="1.5" fill="rgba(255,255,255,0.35)"/>
            <circle cx="420" cy="600" r="1"   fill="rgba(255,255,255,0.25)"/>
            <circle cx="50"  cy="560" r="2"   fill="rgba(255,255,255,0.18)"/>
            <circle cx="390" cy="300" r="1.2" fill="rgba(255,255,255,0.22)"/>

            {/* Corner bracket — bottom right */}
            <path d="M500 770 L500 800 L470 800" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8"/>
            {/* Corner bracket — top left */}
            <path d="M20 30 L20 0 L50 0" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8"/>
          </svg>

          {/* Content */}
          <div className="relative z-10 max-w-[460px] w-full">

            {/* Brand mark */}
            <div className="flex items-center gap-3 mb-16">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-white"
                style={{
                  boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
                }}
              >
                {/* Inline SVG logo mark */}
                <svg width="24" height="24" viewBox="0 0 3508 3508" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#1595A2" d="M1247.16,715.18 C1259.13,695.08 1270.78,675.66 1282.26,656.14 C1285.08,651.34 1288.77,648.18 1293.99,646.01 C1373.29,613.01 1455.15,588.87 1539.71,573.68 C1622.37,558.83 1705.65,553.23 1789.48,556.27 C1913.57,560.78 2034.05,584.25 2150.55,627.42 C2314.68,688.26 2457.95,781.41 2580.61,906.20 C2647.74,974.50 2705.39,1050.13 2753.96,1132.69 C2757.12,1138.07 2758.67,1143.28 2758.26,1149.61 C2752.87,1232.72 2735.02,1313.02 2702.98,1389.91 C2619.64,1589.89 2477.20,1732.78 2281.81,1824.14 C2213.76,1855.95 2142.41,1876.91 2068.10,1887.55 C2009.85,1895.88 1951.30,1897.91 1892.61,1893.56 C1741.15,1882.34 1604.23,1830.66 1482.09,1741.42 C1319.29,1622.47 1215.68,1463.37 1168.70,1267.48 C1158.90,1226.63 1153.97,1184.95 1151.46,1142.95 C1149.20,1105.26 1149.47,1067.64 1152.44,1030.08 C1159.51,940.28 1181.22,854.14 1218.88,772.21 C1227.64,753.16 1237.46,734.60 1247.16,715.18 Z"/>
                  <path fill="#1595A2" d="M1244.86,1901.13 C1270.52,1931.16 1300.41,1955.85 1328.31,1982.57 C1397.88,2049.20 1467.68,2115.57 1537.38,2182.05 C1727.67,2363.55 1917.96,2545.05 2108.25,2726.55 C2131.16,2748.40 2154.06,2770.26 2177.05,2792.03 C2179.43,2794.28 2182.41,2795.91 2186.46,2798.79 C2181.16,2801.29 2178.59,2802.68 2175.89,2803.75 C2097.55,2834.60 2016.89,2856.94 1933.73,2870.40 C1867.13,2881.18 1800.12,2886.54 1732.69,2885.54 C1527.61,2882.49 1336.06,2830.08 1158.35,2727.36 C1152.07,2723.72 1149.84,2719.73 1149.84,2712.49 C1150.02,2401.85 1150.00,2091.22 1150.00,1780.58 C1150.00,1777.70 1150.00,1774.82 1150.00,1771.95 C1180.18,1816.15 1208.52,1861.11 1244.86,1901.13 Z"/>
                  <path fill="#1695A2" d="M2828.25,2158.27 C2773.80,2291.49 2697.75,2410.01 2600.12,2514.66 C2555.69,2562.28 2507.62,2605.92 2455.81,2645.42 C2453.71,2647.02 2451.51,2648.50 2448.72,2650.49 C2287.17,2496.85 2125.74,2343.31 1964.31,2189.77 C1964.45,2189.12 1964.59,2188.47 1964.73,2187.82 C2092.72,2187.05 2217.15,2166.60 2336.85,2120.90 C2456.42,2075.26 2565.79,2011.89 2664.43,1930.22 C2763.19,1848.45 2844.81,1752.18 2909.25,1640.86 C2917.70,1729.25 2912.76,1816.91 2899.10,1904.14 C2885.45,1991.32 2861.90,2075.82 2828.25,2158.27 Z"/>
                  <path fill="#1695A2" d="M725.19,1155.14 C764.92,1083.96 811.20,1018.34 865.67,955.69 C864.15,972.33 862.53,986.47 861.65,1000.66 C860.10,1025.92 858.88,1051.20 857.76,1076.49 C857.35,1085.81 857.59,1095.15 857.59,1104.49 C857.58,1557.11 857.58,2009.72 857.58,2462.34 C857.58,2465.86 857.58,2469.37 857.58,2474.03 C580.64,2164.05 462.60,1629.54 725.19,1155.14 Z"/>
                </svg>
              </div>
              <div>
                <p className="text-[19px] font-medium leading-none tracking-[0.06em] text-white" style={{ fontFamily: "'Cormorant', serif" }}>
                  Revchill
                </p>
                <p className="text-[9.5px] tracking-[0.22em] uppercase mt-0.5" style={{ color: "rgba(255,255,255,0.65)" }}>
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
                <em className="not-italic font-normal" style={{ color: "rgba(255,255,255,0.9)", textShadow: "0 0 40px rgba(255,255,255,0.3)" }}>unforgettable.</em>
              </h1>
              <p
                className="text-[13px] leading-[1.8] font-light"
                style={{ color: "rgba(255,255,255,0.55)", maxWidth: "320px" }}
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
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.14)",
                  }}
                >
                  <p className="text-white text-[18px] mb-2 leading-none opacity-80">{perk.icon}</p>
                  <p className="text-white text-[12px] font-medium mb-1 tracking-wide">{perk.title}</p>
                  <p className="text-[11px] font-light leading-[1.55]" style={{ color: "rgba(255,255,255,0.45)" }}>
                    {perk.desc}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </div>


        {/* ── RIGHT PANEL ─────────────────────────────────────────────────── */}
        <div
          className="flex-1 flex items-center justify-center p-8 lg:p-6"
          style={{ background: "#f4fafb" }}
        >
          <div className="w-full max-w-[380px] fade-up">

            {/* Mobile brand */}
            <div className="flex lg:hidden items-center gap-2.5 mb-8">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-white"
                style={{ boxShadow: "0 2px 12px rgba(21,149,162,0.2)" }}
              >
                <svg width="18" height="18" viewBox="0 0 3508 3508" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#1595A2" d="M1247.16,715.18 C1259.13,695.08 1270.78,675.66 1282.26,656.14 C1285.08,651.34 1288.77,648.18 1293.99,646.01 C1373.29,613.01 1455.15,588.87 1539.71,573.68 C1622.37,558.83 1705.65,553.23 1789.48,556.27 C1913.57,560.78 2034.05,584.25 2150.55,627.42 C2314.68,688.26 2457.95,781.41 2580.61,906.20 C2647.74,974.50 2705.39,1050.13 2753.96,1132.69 C2757.12,1138.07 2758.67,1143.28 2758.26,1149.61 C2752.87,1232.72 2735.02,1313.02 2702.98,1389.91 C2619.64,1589.89 2477.20,1732.78 2281.81,1824.14 C2213.76,1855.95 2142.41,1876.91 2068.10,1887.55 C2009.85,1895.88 1951.30,1897.91 1892.61,1893.56 C1741.15,1882.34 1604.23,1830.66 1482.09,1741.42 C1319.29,1622.47 1215.68,1463.37 1168.70,1267.48 C1158.90,1226.63 1153.97,1184.95 1151.46,1142.95 C1149.20,1105.26 1149.47,1067.64 1152.44,1030.08 C1159.51,940.28 1181.22,854.14 1218.88,772.21 C1227.64,753.16 1237.46,734.60 1247.16,715.18 Z"/>
                  <path fill="#1595A2" d="M1244.86,1901.13 C1270.52,1931.16 1300.41,1955.85 1328.31,1982.57 C1397.88,2049.20 1467.68,2115.57 1537.38,2182.05 C1727.67,2363.55 1917.96,2545.05 2108.25,2726.55 C2131.16,2748.40 2154.06,2770.26 2177.05,2792.03 C2179.43,2794.28 2182.41,2795.91 2186.46,2798.79 C2181.16,2801.29 2178.59,2802.68 2175.89,2803.75 C2097.55,2834.60 2016.89,2856.94 1933.73,2870.40 C1867.13,2881.18 1800.12,2886.54 1732.69,2885.54 C1527.61,2882.49 1336.06,2830.08 1158.35,2727.36 C1152.07,2723.72 1149.84,2719.73 1149.84,2712.49 C1150.02,2401.85 1150.00,2091.22 1150.00,1780.58 C1150.00,1777.70 1150.00,1774.82 1150.00,1771.95 C1180.18,1816.15 1208.52,1861.11 1244.86,1901.13 Z"/>
                </svg>
              </div>
              <span className="text-[16px] tracking-[0.06em]" style={{ color: "#0d4a52", fontFamily: "'Cormorant', serif" }}>Revchill</span>
            </div>

            {/* Status badge */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-7"
              style={{ background: "rgba(21,149,162,0.08)", border: "1px solid rgba(21,149,162,0.2)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#1595A2" }} />
              <span className="text-[10px] font-medium tracking-[0.1em] uppercase" style={{ color: "#1595A2" }}>
                Member Portal
              </span>
            </div>

            {/* Heading */}
            <div className="mb-7">
              <h2
                className="text-[32px] font-light leading-tight mb-2"
                style={{ fontFamily: "'Cormorant', serif", letterSpacing: "-0.01em", color: "#0a3a42" }}
              >
                {heading()}
              </h2>
              <p className="text-[13px] font-light" style={{ color: "#5a8a92" }}>
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
                            ? "rgba(21,149,162,0.15)"
                            : active
                            ? "linear-gradient(135deg, #1595A2, #1fc8d8)"
                            : "rgba(21,149,162,0.08)",
                          color: done || active ? "#1595A2" : "rgba(21,149,162,0.4)",
                          boxShadow: active ? "0 0 12px rgba(21,149,162,0.3)" : "none",
                          border: done ? "1px solid rgba(21,149,162,0.35)" : "none",
                        }}
                      >
                        {done ? "✓" : i + 1}
                      </div>
                      {i < 2 && (
                        <div className="w-10 h-px transition-all duration-500" style={{
                          background: i < current ? "rgba(21,149,162,0.5)" : "rgba(21,149,162,0.12)"
                        }} />
                      )}
                    </div>
                  );
                })}
                <span className="ml-1 text-[11px]" style={{ color: "#5a8a92" }}>
                  {otpStep === "email" ? "Enter email" : otpStep === "otp" ? "Verify code" : "Set password"}
                </span>
              </div>
            )}

            {/* ── Email field ───────────────────────────────── */}
            <div className="mb-4">
              <label
                className="block text-[10.5px] uppercase tracking-[0.12em] font-medium mb-2"
                style={{ color: "#5a8a92" }}
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
                  style={{ color: "#5a8a92" }}
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
                    style={{ color: "#1595A2" }}
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
                  style={{ color: "#5a8a92" }}
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
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7ab8be" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
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
                      style={{ color: "#5a8a92" }}
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
                background: "linear-gradient(135deg, #0d8a97 0%, #1595A2 50%, #0f7882 100%)",
                color: "#ffffff",
                boxShadow: "0 4px 24px rgba(21,149,162,0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
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
              <div className="flex-1 h-px" style={{ background: "rgba(21,149,162,0.12)" }} />
              <span className="text-[10px] uppercase tracking-[0.12em]" style={{ color: "rgba(21,149,162,0.4)" }}>or</span>
              <div className="flex-1 h-px" style={{ background: "rgba(21,149,162,0.12)" }} />
            </div>

            {/* ── Secondary toggle ──────────────────────────── */}
            <button
              className="w-full py-[13px] rounded-xl text-[13px] font-light flex items-center justify-center gap-2.5 cursor-pointer transition-all duration-200"
              style={{
                background: "rgba(21,149,162,0.04)",
                border: "1px solid rgba(21,149,162,0.15)",
                color: "#3a8a94",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(21,149,162,0.4)";
                e.currentTarget.style.background = "rgba(21,149,162,0.08)";
                e.currentTarget.style.color = "#1595A2";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(21,149,162,0.15)";
                e.currentTarget.style.background = "rgba(21,149,162,0.04)";
                e.currentTarget.style.color = "#3a8a94";
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
            {/* <p
              className="mt-6 text-center text-[11px] leading-relaxed"
              style={{ color: "rgba(21,149,162,0.45)" }}
            >
              By signing in you agree to our{" "}
              <a href="#" className="transition-opacity hover:opacity-60" style={{ color: "#1595A2" }}>Terms of Service</a>
              {" "}&amp;{" "}
              <a href="#" className="transition-opacity hover:opacity-60" style={{ color: "#1595A2" }}>Privacy Policy</a>.
            </p> */}

          </div>
        </div>
      </div>
    </>
  );
}
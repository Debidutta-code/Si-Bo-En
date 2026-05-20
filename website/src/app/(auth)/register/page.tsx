"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { customerRegisterApi } from "../login/api";
import toast from "react-hot-toast";

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconUser = () => (
  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7ab8be" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const IconMail = () => (
  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7ab8be" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);
const IconLock = () => (
  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7ab8be" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const IconEyeOff = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);
const IconEye = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);

// ─── Logo mark ────────────────────────────────────────────────────────────────
const LogoMark = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 3508 3508" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill="#1595A2" d="M1247.16,715.18 C1259.13,695.08 1270.78,675.66 1282.26,656.14 C1285.08,651.34 1288.77,648.18 1293.99,646.01 C1373.29,613.01 1455.15,588.87 1539.71,573.68 C1622.37,558.83 1705.65,553.23 1789.48,556.27 C1913.57,560.78 2034.05,584.25 2150.55,627.42 C2314.68,688.26 2457.95,781.41 2580.61,906.20 C2647.74,974.50 2705.39,1050.13 2753.96,1132.69 C2757.12,1138.07 2758.67,1143.28 2758.26,1149.61 C2752.87,1232.72 2735.02,1313.02 2702.98,1389.91 C2619.64,1589.89 2477.20,1732.78 2281.81,1824.14 C2213.76,1855.95 2142.41,1876.91 2068.10,1887.55 C2009.85,1895.88 1951.30,1897.91 1892.61,1893.56 C1741.15,1882.34 1604.23,1830.66 1482.09,1741.42 C1319.29,1622.47 1215.68,1463.37 1168.70,1267.48 C1158.90,1226.63 1153.97,1184.95 1151.46,1142.95 C1149.20,1105.26 1149.47,1067.64 1152.44,1030.08 C1159.51,940.28 1181.22,854.14 1218.88,772.21 C1227.64,753.16 1237.46,734.60 1247.16,715.18 Z" />
    <path fill="#1595A2" d="M1244.86,1901.13 C1270.52,1931.16 1300.41,1955.85 1328.31,1982.57 C1397.88,2049.20 1467.68,2115.57 1537.38,2182.05 C1727.67,2363.55 1917.96,2545.05 2108.25,2726.55 C2131.16,2748.40 2154.06,2770.26 2177.05,2792.03 C2179.43,2794.28 2182.41,2795.91 2186.46,2798.79 C2181.16,2801.29 2178.59,2802.68 2175.89,2803.75 C2097.55,2834.60 2016.89,2856.94 1933.73,2870.40 C1867.13,2881.18 1800.12,2886.54 1732.69,2885.54 C1527.61,2882.49 1336.06,2830.08 1158.35,2727.36 C1152.07,2723.72 1149.84,2719.73 1149.84,2712.49 C1150.02,2401.85 1150.00,2091.22 1150.00,1780.58 C1150.00,1777.70 1150.00,1774.82 1150.00,1771.95 C1180.18,1816.15 1208.52,1861.11 1244.86,1901.13 Z" />
    <path fill="#1695A2" d="M2828.25,2158.27 C2773.80,2291.49 2697.75,2410.01 2600.12,2514.66 C2555.69,2562.28 2507.62,2605.92 2455.81,2645.42 C2453.71,2647.02 2451.51,2648.50 2448.72,2650.49 C2287.17,2496.85 2125.74,2343.31 1964.31,2189.77 C1964.45,2189.12 1964.59,2188.47 1964.73,2187.82 C2092.72,2187.05 2217.15,2166.60 2336.85,2120.90 C2456.42,2075.26 2565.79,2011.89 2664.43,1930.22 C2763.19,1848.45 2844.81,1752.18 2909.25,1640.86 C2917.70,1729.25 2912.76,1816.91 2899.10,1904.14 C2885.45,1991.32 2861.90,2075.82 2828.25,2158.27 Z" />
    <path fill="#1695A2" d="M725.19,1155.14 C764.92,1083.96 811.20,1018.34 865.67,955.69 C864.15,972.33 862.53,986.47 861.65,1000.66 C860.10,1025.92 858.88,1051.20 857.76,1076.49 C857.35,1085.81 857.59,1095.15 857.59,1104.49 C857.58,1557.11 857.58,2009.72 857.58,2462.34 C857.58,2465.86 857.58,2469.37 857.58,2474.03 C580.64,2164.05 462.60,1629.54 725.19,1155.14 Z" />
  </svg>
);

// ─── Step indicator ───────────────────────────────────────────────────────────
type Step = 1 | 2;

// ─── Component ────────────────────────────────────────────────────────────────
export default function CustomerRegisterPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "", confirmPassword: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async () => {
    // Step 1 validation
    if (step === 1) {
      if (!form.firstName.trim()) { toast.error("First name is required"); return; }
      if (!form.lastName.trim()) { toast.error("Last name is required"); return; }
      if (!form.email.trim()) { toast.error("Email is required"); return; }
      setStep(2);
      return;
    }
    // Step 2 validation
    if (!form.password.trim()) { toast.error("Password is required"); return; }
    if (form.password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    if (form.password !== form.confirmPassword) { toast.error("Passwords do not match"); return; }

    setLoading(true);
    try {
      const res = await customerRegisterApi({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      });
      if (res.success) {
        toast.success("Account created! Please sign in.");
        router.push("/login");
      } else {
        toast.error(res.message ?? "Registration failed");
      }
    } catch {
      toast.error("Something went wrong, please try again");
    } finally {
      setLoading(false);
    }
  };

  // ── Shared styles ─────────────────────────────────────────────────────────
  const inputCls = "w-full rounded-xl text-[13.5px] font-light outline-none transition-all duration-200 placeholder:text-[#9bbfc3]";
  const inputStyle: React.CSSProperties = {
    background: "rgba(21,149,162,0.04)",
    border: "1px solid rgba(21,149,162,0.2)",
    color: "#0d4a52",
    padding: "13px 13px 13px 42px",
  };
  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "rgba(21,149,162,0.6)";
    e.currentTarget.style.background = "rgba(21,149,162,0.07)";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(21,149,162,0.1)";
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "rgba(21,149,162,0.2)";
    e.currentTarget.style.background = "rgba(21,149,162,0.04)";
    e.currentTarget.style.boxShadow = "none";
  };

  const ctaLabel = () => {
    if (loading) return "Creating account…";
    if (step === 1) return "Continue";
    return "Create Account";
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');

        .lumiere-root { font-family: 'Jost', sans-serif; }

        @keyframes pulse-ring {
          0%, 100% { opacity: 0.14; transform: scale(1); }
          50%       { opacity: 0.28; transform: scale(1.04); }
        }
        .pulse-ring { animation: pulse-ring 6s ease-in-out infinite; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.55s cubic-bezier(.22,1,.36,1) both; }

        @keyframes slideIn {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .slide-in { animation: slideIn 0.35s cubic-bezier(.22,1,.36,1) both; }

        .cta-btn:hover  { filter: brightness(1.08); }
        .cta-btn:active { transform: scale(0.985); }

        .eye-btn { color: #7ab8be; transition: color 0.2s; }
        .eye-btn:hover { color: #1595A2; }

        .feature-card:hover {
          border-color: rgba(255,255,255,0.35) !important;
          background: rgba(255,255,255,0.12) !important;
        }

        .step-dot { transition: background 0.3s, box-shadow 0.3s; }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(21,149,162,0.25); border-radius: 2px; }
      `}</style>

      <div className="lumiere-root flex min-h-screen overflow-hidden" style={{ background: "white" }}>

        {/* ── LEFT PANEL ──────────────────────────────────────────────────── */}
        <div
          className="hidden lg:flex w-[48%] flex-shrink-0 relative items-center justify-center overflow-hidden"
          style={{ background: "linear-gradient(160deg, #0d8a97 0%, #1595A2 40%, #0f7882 100%)" }}
        >
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
            backgroundSize: "256px 256px",
          }} />
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "radial-gradient(ellipse 60% 50% at 50% 35%, rgba(255,255,255,0.12) 0%, transparent 65%)",
          }} />
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 520 800" preserveAspectRatio="xMidYMid slice">
            <circle className="pulse-ring" cx="480" cy="90" r="380" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
            <circle cx="480" cy="90" r="260" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />
            <circle cx="480" cy="90" r="160" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
            <circle cx="480" cy="90" r="80" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />
            <polygon points="40,740 90,780 20,790" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="0.8" />
            <circle cx="100" cy="200" r="1.5" fill="rgba(255,255,255,0.35)" />
            <circle cx="420" cy="600" r="1" fill="rgba(255,255,255,0.25)" />
            <circle cx="390" cy="300" r="1.2" fill="rgba(255,255,255,0.22)" />
            <path d="M500 770 L500 800 L470 800" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
            <path d="M20 30 L20 0 L50 0" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
          </svg>

          <div className="relative z-10 max-w-[460px] w-full">
            <div className="flex items-center gap-3 mb-16">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-white"
                style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.15)" }}>
                <LogoMark size={24} />
              </div>
              <div>
                <p className="text-[19px] font-medium leading-none tracking-[0.06em] text-white"
                  style={{ fontFamily: "'Cormorant', serif" }}>Revchill</p>
                <p className="text-[9.5px] tracking-[0.22em] uppercase mt-0.5"
                  style={{ color: "rgba(255,255,255,0.65)" }}>Guest Account</p>
              </div>
            </div>

            <div className="mb-10">
              <h1 className="font-light leading-[1.15] text-white mb-3"
                style={{ fontFamily: "'Cormorant', serif", fontSize: "clamp(36px, 3.8vw, 52px)", letterSpacing: "-0.01em" }}>
                Start your<br />
                journey<br />
                <em className="not-italic font-normal" style={{ color: "rgba(255,255,255,0.9)", textShadow: "0 0 40px rgba(255,255,255,0.3)" }}>with us.</em>
              </h1>
              <p className="text-[13px] leading-[1.8] font-light"
                style={{ color: "rgba(255,255,255,0.55)", maxWidth: "320px" }}>
                Create your free account in under a minute and unlock seamless booking across all properties.
              </p>
            </div>

            {/* Steps visual */}
            <div className="space-y-4">
              {[
                { n: "01", label: "Personal details", desc: "Name & email address" },
                { n: "02", label: "Secure password", desc: "Set a password for your account" },
                { n: "03", label: "You're all set", desc: "Start booking instantly" },
              ].map(({ n, label, desc }) => (
                <div key={n} className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-medium"
                    style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.8)" }}>
                    {n}
                  </div>
                  <div>
                    <p className="text-white text-[12px] font-medium">{label}</p>
                    <p className="text-[11px] font-light" style={{ color: "rgba(255,255,255,0.45)" }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ─────────────────────────────────────────────────── */}
        <div className="flex-1 flex items-center justify-center p-8 lg:p-6"
          style={{ background: "#f4fafb" }}>
          <div className="w-full max-w-[380px] fade-up">

            {/* Mobile brand */}
            <div className="flex lg:hidden items-center gap-2.5 mb-8">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-white"
                style={{ boxShadow: "0 2px 12px rgba(21,149,162,0.2)" }}>
                <LogoMark size={18} />
              </div>
              <span className="text-[16px] tracking-[0.06em]"
                style={{ color: "#0d4a52", fontFamily: "'Cormorant', serif" }}>Revchill</span>
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-7"
              style={{ background: "rgba(21,149,162,0.08)", border: "1px solid rgba(21,149,162,0.2)" }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#1595A2" }} />
              <span className="text-[10px] font-medium tracking-[0.1em] uppercase" style={{ color: "#1595A2" }}>
                New Account
              </span>
            </div>

            {/* Heading */}
            <div className="mb-6">
              <h2 className="text-[32px] font-light leading-tight mb-2"
                style={{ fontFamily: "'Cormorant', serif", letterSpacing: "-0.01em", color: "#0a3a42" }}>
                {step === 1 ? "Create account" : "Set your password"}
              </h2>
              <p className="text-[13px] font-light" style={{ color: "#5a8a92" }}>
                {step === 1 ? "Step 1 of 2 — Your personal details." : "Step 2 of 2 — Choose a secure password."}
              </p>
            </div>

            {/* Step dots */}
            <div className="flex items-center gap-2 mb-7">
              {([1, 2] as Step[]).map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className="step-dot w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold"
                    style={{
                      background: s < step
                        ? "rgba(21,149,162,0.15)"
                        : s === step
                          ? "linear-gradient(135deg, #1595A2, #1fc8d8)"
                          : "rgba(21,149,162,0.08)",
                      color: s <= step ? "#1595A2" : "rgba(21,149,162,0.4)",
                      boxShadow: s === step ? "0 0 12px rgba(21,149,162,0.3)" : "none",
                      border: s < step ? "1px solid rgba(21,149,162,0.35)" : "none",
                    }}>
                    {s < step ? "✓" : s}
                  </div>
                  {s < 2 && (
                    <div className="w-10 h-px transition-all duration-500"
                      style={{ background: s < step ? "rgba(21,149,162,0.5)" : "rgba(21,149,162,0.12)" }} />
                  )}
                </div>
              ))}
            </div>

            {/* ── Step 1: Name + Email ─────────────────────── */}
            {step === 1 && (
              <div className="slide-in space-y-4">
                {/* First + Last side by side */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "First Name", key: "firstName", placeholder: "Jane" },
                    { label: "Last Name", key: "lastName", placeholder: "Smith" },
                  ].map(({ label, key, placeholder }) => (
                    <div key={key}>
                      <label className="block text-[10.5px] uppercase tracking-[0.12em] font-medium mb-2"
                        style={{ color: "#5a8a92" }}>{label}</label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder={placeholder}
                          className={inputCls}
                          style={inputStyle}
                          onFocus={onFocus}
                          onBlur={onBlur}
                          value={form[key as "firstName" | "lastName"]}
                          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        />
                        <IconUser />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[10.5px] uppercase tracking-[0.12em] font-medium mb-2"
                    style={{ color: "#5a8a92" }}>Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="you@email.com"
                      className={inputCls}
                      style={inputStyle}
                      onFocus={onFocus}
                      onBlur={onBlur}
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    />
                    <IconMail />
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 2: Password ─────────────────────────── */}
            {step === 2 && (
              <div className="slide-in space-y-4">
                {[
                  { label: "Password", key: "password", show: showPass, toggle: () => setShowPass(!showPass), placeholder: "Min. 8 characters" },
                  { label: "Confirm Password", key: "confirmPassword", show: showConfirm, toggle: () => setShowConfirm(!showConfirm), placeholder: "Repeat your password" },
                ].map(({ label, key, show, toggle, placeholder }) => (
                  <div key={key}>
                    <label className="block text-[10.5px] uppercase tracking-[0.12em] font-medium mb-2"
                      style={{ color: "#5a8a92" }}>{label}</label>
                    <div className="relative">
                      <input
                        type={show ? "text" : "password"}
                        placeholder={placeholder}
                        className={inputCls}
                        style={{ ...inputStyle, padding: "13px 42px" }}
                        onFocus={onFocus}
                        onBlur={onBlur}
                        value={form[key as "password" | "confirmPassword"]}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                      />
                      <IconLock />
                      <button type="button" className="eye-btn absolute right-3.5 top-1/2 -translate-y-1/2" onClick={toggle}>
                        {show ? <IconEyeOff /> : <IconEye />}
                      </button>
                    </div>
                  </div>
                ))}

                {form.password && form.confirmPassword && form.password !== form.confirmPassword && (
                  <p className="text-[11.5px]" style={{ color: "#e05555" }}>Passwords do not match</p>
                )}
              </div>
            )}

            {/* Back button (step 2 only) */}
            {step === 2 && (
              <button
                className="mt-4 text-[12px] transition-opacity hover:opacity-60 flex items-center gap-1.5"
                style={{ color: "#1595A2" }}
                onClick={() => setStep(1)}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back to details
              </button>
            )}

            {/* CTA */}
            <button
              disabled={loading}
              className="cta-btn w-full py-[14px] rounded-xl text-[13.5px] font-medium tracking-[0.06em] border-none cursor-pointer transition-all duration-200 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              style={{
                background: "linear-gradient(135deg, #0d8a97 0%, #1595A2 50%, #0f7882 100%)",
                color: "#ffffff",
                boxShadow: "0 4px 24px rgba(21,149,162,0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
              }}
              onClick={handleSubmit}
            >
              <span className="relative flex items-center justify-center gap-2.5">
                {loading ? (
                  <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" />
                  </svg>
                ) : (
                  <span className="text-base leading-none">{step === 1 ? "→" : "✦"}</span>
                )}
                {ctaLabel()}
              </span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px" style={{ background: "rgba(21,149,162,0.12)" }} />
              <span className="text-[10px] uppercase tracking-[0.12em]" style={{ color: "rgba(21,149,162,0.4)" }}>or</span>
              <div className="flex-1 h-px" style={{ background: "rgba(21,149,162,0.12)" }} />
            </div>

            {/* Sign in link */}
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
              onClick={() => router.push("/login")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              Already have an account? Sign in
            </button>

          </div>
        </div>

      </div>
    </>
  );
}
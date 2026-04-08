"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { RootState } from "@/src/store/store";
import { loyaltyLogout } from "@/src/store/loyaltyUserSlice";
import { getMyProfileApi } from "./api/profile.api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface LoyalityLevel {
  id: string;
  level: number;
  discountPercentage: number;
}
interface PropertyLoyaltyConfig {
  id: string;
  propertyId: string;
  propertyCode: string;
  propertyName: string;
  discountPercentage: number;
  loyalityConfigLogo: string | null;
  isActive: boolean;
}
interface CreationLoyaltyConfig {
  loyaltyDiscountType: string;
  discountValue: number;
  currencyCode: string | null;
  LoyalityLevels: LoyalityLevel[];
  PropertyLoyaltyConfig: PropertyLoyaltyConfig[];
}
interface Property {
  id: string;
  propertyName: string;
  propertyCode: string;
}
interface CreationGuest {
  id: string;
  propertyCode: string;
  propertyId: string;
  creationLoyaltyConfigId: string;
  guestLevel: number;
  metaData: any;
  Property: Property;
  CreationLoyaltyConfig: CreationLoyaltyConfig;
}
interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}
interface ProfileData {
  id: string;
  guestEmail: string;
  createdAt: string;
  guest: Guest | null;
  CreationGuest: CreationGuest[];
}

// ─── Level badge colour map ───────────────────────────────────────────────────
const levelColour = (level: number) => {
  if (level === 1) return { bg: "#f5f5f5", text: "#555", label: "Silver" };
  if (level === 2) return { bg: "#fff8e1", text: "#b8912a", label: "Gold" };
  return { bg: "#e8f5e9", text: "#2e7d32", label: "Platinum" };
};

// ─── Shared input style ───────────────────────────────────────────────────────
const gold = "#b8912a";

// ─── Component ────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const loyaltyUser = useSelector((state: RootState) => (state as any).loyaltyUser);

  const [tab, setTab] = useState<"profile" | "bookings">("profile");
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Booking lookup state
  const [bookingCode, setBookingCode] = useState("");
  const [bookingPropertyCode, setBookingPropertyCode] = useState("");
  const [bookingData, setBookingData] = useState<any | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    if (!loyaltyUser?.isLoggedIn) {
      router.replace("/login");
      return;
    }
    fetchProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loyaltyUser?.isLoggedIn]);

  const fetchProfile = async () => {
    setLoading(true);
    const res = await getMyProfileApi();
    if (res?.success) {
      setProfile(res.data);
    } else {
      toast.error(res?.message ?? "Could not load profile");
      if (res?.message?.toLowerCase().includes("token") || res?.message?.toLowerCase().includes("auth")) {
        dispatch(loyaltyLogout());
        router.replace("/login");
      }
    }
    setLoading(false);
  };

  const handleLogout = () => {
    dispatch(loyaltyLogout());
    router.push("/login");
  };

  const handleBookingSearch = async () => {
    if (!bookingPropertyCode.trim() || !bookingCode.trim()) {
      toast.error("Please enter both property code and booking code");
      return;
    }
    setBookingLoading(true);
    setBookingData(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/front-office/reservations/BOOK-${bookingCode.trim().toUpperCase()}?propertyCode=${bookingPropertyCode.trim().toUpperCase()}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Booking not found");
      setBookingData(data.data);
    } catch (err: any) {
      toast.error(err.message ?? "Error fetching booking");
    } finally {
      setBookingLoading(false);
    }
  };

  // ── Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ fontFamily: "'DM Sans', sans-serif", background: "#fafafa" }}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-4" style={{ borderColor: `#e0e0e0`, borderTopColor: gold }} />
          <p className="text-[13px]" style={{ color: "#999" }}>Loading your profile…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif", background: "#fafafa" }}>

      {/* ── Top bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#f0f0f0]" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* Nav tabs */}
          <div className="flex items-center gap-1 bg-[#f5f5f5] rounded-[10px] p-1">
            {(["profile", "bookings"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className="px-4 py-1.5 rounded-[8px] text-[13px] font-medium transition-all duration-150 capitalize"
                style={{
                  background: tab === t ? "#fff" : "transparent",
                  color: tab === t ? "#1a1a1a" : "#999",
                  boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                }}>
                {t === "profile" ? "My Profile" : "My Bookings"}
              </button>
            ))}
          </div>

          {/* Logout */}
          <button onClick={handleLogout}
            className="text-[12.5px] font-medium px-3 py-1.5 rounded-[8px] transition-all"
            style={{ color: "#999", border: "1px solid #e8e8e8" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#b8291a"; e.currentTarget.style.borderColor = "#f0c0b8"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#999"; e.currentTarget.style.borderColor = "#e8e8e8"; }}>
            Sign out
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {tab === "profile" && (
          <div className="space-y-6">

            {/* ── Member card */}
            <div className="rounded-2xl overflow-hidden" style={{ background: `linear-gradient(135deg, #c9a020 0%, #b8912a 100%)`, boxShadow: "0 8px 32px rgba(184,145,42,0.2)" }}>
              <div className="px-8 py-8 relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10" style={{ background: "#fff", transform: "translate(30%, -30%)" }} />
                <div className="absolute bottom-0 left-0 w-28 h-28 rounded-full opacity-10" style={{ background: "#fff", transform: "translate(-30%, 30%)" }} />

                <div className="relative z-10">
                  <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/70 mb-3">Loyalty Member</p>
                  <h2 className="text-[22px] font-semibold text-white mb-0.5" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    {profile?.guest ? `${profile.guest.firstName} ${profile.guest.lastName}` : profile?.guestEmail ?? "Member"}
                  </h2>
                  <p className="text-[13px] text-white/75">{profile?.guestEmail}</p>

                  <div className="flex items-center gap-4 mt-5">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.1em] text-white/60">Member since</p>
                      <p className="text-[13px] font-medium text-white">
                        {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—"}
                      </p>
                    </div>
                    <div className="w-px h-8 bg-white/20" />
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.1em] text-white/60">Properties</p>
                      <p className="text-[13px] font-medium text-white">{profile?.CreationGuest?.length ?? 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Account details */}
            <div className="bg-white rounded-2xl p-6" style={{ border: "1px solid #f0f0f0" }}>
              <h3 className="text-[14px] font-semibold text-[#1a1a1a] mb-4">Account Details</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2.5 border-b border-[#f8f8f8]">
                  <span className="text-[12px] uppercase tracking-[0.07em] font-medium" style={{ color: "#aaa" }}>Email</span>
                  <span className="text-[13.5px] text-[#1a1a1a]">{profile?.guestEmail}</span>
                </div>
                {profile?.guest && (
                  <div className="flex items-center justify-between py-2.5 border-b border-[#f8f8f8]">
                    <span className="text-[12px] uppercase tracking-[0.07em] font-medium" style={{ color: "#aaa" }}>Full Name</span>
                    <span className="text-[13.5px] text-[#1a1a1a]">{profile.guest.firstName} {profile.guest.lastName}</span>
                  </div>
                )}
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-[12px] uppercase tracking-[0.07em] font-medium" style={{ color: "#aaa" }}>Member ID</span>
                  <span className="text-[12px] font-mono text-[#888]">{profile?.id?.slice(0, 8).toUpperCase()}</span>
                </div>
              </div>
            </div>

            {/* ── Loyalty memberships — grouped by program */}
            {profile?.CreationGuest && profile.CreationGuest.length > 0 && (() => {
              // Group CreationGuest entries by creationLoyaltyConfigId
              const programMap = new Map<string, typeof profile.CreationGuest>();
              profile.CreationGuest.forEach((cg) => {
                const key = cg.creationLoyaltyConfigId;
                if (!programMap.has(key)) programMap.set(key, []);
                programMap.get(key)!.push(cg);
              });
              const programs = Array.from(programMap.entries());

              return (
                <div>
                  <h3 className="text-[14px] font-semibold text-[#1a1a1a] mb-3">
                    Loyalty Memberships
                    <span className="ml-2 text-[11px] font-normal px-2 py-0.5 rounded-full" style={{ background: "#fdf8ee", color: gold }}>
                      {programs.length} program{programs.length !== 1 ? "s" : ""}
                    </span>
                  </h3>

                  <div className="space-y-4">
                    {programs.map(([programId, guests]) => {
                      const config = guests[0].CreationLoyaltyConfig;
                      const totalLevels = config.LoyalityLevels.length;

                      // Properties the guest is NOT enrolled in (from the program's config)
                      const enrolledIds = new Set(guests.map(g => g.propertyId));
                      const otherProps = config.PropertyLoyaltyConfig?.filter(p => !enrolledIds.has(p.propertyId)) ?? [];

                      // Pick logo: first available from enrolled properties
                      const programLogo = guests
                        .map(g => config.PropertyLoyaltyConfig?.find(p => p.propertyId === g.propertyId)?.loyalityConfigLogo)
                        .find(Boolean) ?? null;

                      return (
                        <div key={programId} className="bg-white rounded-2xl overflow-hidden transition-shadow hover:shadow-md" style={{ border: "1px solid #f0f0f0" }}>

                          {/* Program header */}
                          <div className="px-5 pt-5 pb-3 flex items-center justify-between gap-3 border-b border-[#f8f8f8]">
                            <div className="flex items-center gap-3 min-w-0">
                              {programLogo ? (
                                <img src={programLogo} alt="Program logo" className="w-9 h-9 rounded-xl object-contain bg-[#fafafa] border border-[#f0f0f0] flex-shrink-0" />
                              ) : (
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base" style={{ background: "#fdf8ee" }}>🏆</div>
                              )}
                              <div className="min-w-0">
                                <p className="text-[13px] font-semibold text-[#1a1a1a]">
                                  {config.loyaltyDiscountType === "percentage" ? `Up to ${config.discountValue}% off` : `${config.currencyCode} ${config.discountValue} off`}
                                </p>
                                <p className="text-[10px] font-mono mt-0.5" style={{ color: "#bbb" }}>{programId.slice(0, 8).toUpperCase()}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {totalLevels > 0 && (
                                <span className="text-[10px] px-2 py-1 rounded-full" style={{ background: "#f5f5f5", color: "#888" }}>
                                  {totalLevels} tier{totalLevels !== 1 ? "s" : ""}
                                </span>
                              )}
                              <span className="text-[10px] px-2 py-1 rounded-full" style={{ background: "#fdf8ee", color: gold }}>
                                {guests.length} propert{guests.length !== 1 ? "ies" : "y"}
                              </span>
                            </div>
                          </div>

                          {/* Enrolled properties */}
                          <div className="divide-y divide-[#f8f8f8]">
                            {guests.map((cg) => {
                              const lc = levelColour(cg.guestLevel);
                              const myPropConfig = config.PropertyLoyaltyConfig?.find(p => p.propertyId === cg.propertyId);
                              const currentLevel = config.LoyalityLevels.find(l => l.level === cg.guestLevel);
                              const nextLevel = config.LoyalityLevels.find(l => l.level === cg.guestLevel + 1);
                              const effectiveDiscount = currentLevel
                                ? `${currentLevel.discountPercentage}%`
                                : myPropConfig
                                ? `${myPropConfig.discountPercentage}%`
                                : `${config.discountValue}${config.loyaltyDiscountType === "percentage" ? "%" : ` ${config.currencyCode ?? ""}`}`;

                              return (
                                <div key={cg.id} className="px-5 py-4">
                                  {/* Property row */}
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      {myPropConfig?.loyalityConfigLogo ? (
                                        <img src={myPropConfig.loyalityConfigLogo} alt={cg.Property.propertyName} className="w-8 h-8 rounded-lg object-contain bg-[#fafafa] border border-[#f0f0f0] flex-shrink-0" />
                                      ) : (
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm" style={{ background: "#fdf8ee" }}>🏨</div>
                                      )}
                                      <div className="min-w-0">
                                        <p className="text-[13px] font-semibold text-[#1a1a1a] truncate">{cg.Property.propertyName}</p>
                                        <p className="text-[10px] font-mono" style={{ color: "#bbb" }}>{cg.Property.propertyCode}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: lc.bg, color: lc.text }}>{lc.label}</span>
                                      {myPropConfig && (
                                        <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: myPropConfig.isActive ? "#e8f5e9" : "#fafafa", color: myPropConfig.isActive ? "#2e7d32" : "#aaa" }}>
                                          {myPropConfig.isActive ? "● Active" : "○ Inactive"}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Discount + level stats */}
                                  <div className="flex items-center gap-5 mb-3">
                                    <div>
                                      <p className="text-[10px] uppercase tracking-[0.07em] font-medium mb-0.5" style={{ color: "#aaa" }}>Discount</p>
                                      <p className="text-[14px] font-bold" style={{ color: gold }}>{effectiveDiscount} off</p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] uppercase tracking-[0.07em] font-medium mb-0.5" style={{ color: "#aaa" }}>Level</p>
                                      <p className="text-[14px] font-bold text-[#1a1a1a]">{cg.guestLevel}{totalLevels > 0 ? ` / ${totalLevels}` : ""}</p>
                                    </div>
                                  </div>

                                  {/* Level progress bar */}
                                  {nextLevel && totalLevels > 0 && (
                                    <div>
                                      <div className="flex justify-between mb-1">
                                        <span className="text-[10px]" style={{ color: "#bbb" }}>Level {cg.guestLevel}</span>
                                        <span className="text-[10px]" style={{ color: "#bbb" }}>Level {nextLevel.level} →</span>
                                      </div>
                                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#f0f0f0" }}>
                                        <div className="h-full rounded-full" style={{ width: `${Math.min((cg.guestLevel / totalLevels) * 100, 100)}%`, background: gold }} />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Non-enrolled properties in this program ("Also valid at") */}
                          {otherProps.length > 0 && (
                            <div className="px-5 pb-4 pt-3 border-t border-[#f8f8f8]">
                              <p className="text-[10px] uppercase tracking-[0.07em] font-medium mb-2" style={{ color: "#aaa" }}>Also valid at</p>
                              <div className="flex flex-wrap gap-2">
                                {otherProps.map((p) => (
                                  <div key={p.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: "#fafafa", border: "1px solid #f0f0f0" }}>
                                    {p.loyalityConfigLogo && (
                                      <img src={p.loyalityConfigLogo} alt={p.propertyName} className="w-4 h-4 rounded object-contain" />
                                    )}
                                    <span className="text-[11px] text-[#555]">{p.propertyName}</span>
                                    <span className="text-[10px] font-semibold" style={{ color: gold }}>{p.discountPercentage}% off</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {profile?.CreationGuest?.length === 0 && (
              <div className="bg-white rounded-2xl p-8 text-center" style={{ border: "1px solid #f0f0f0" }}>
                <p className="text-3xl mb-2">🏨</p>
                <p className="text-[14px] font-medium text-[#1a1a1a] mb-1">No memberships yet</p>
                <p className="text-[12.5px]" style={{ color: "#aaa" }}>You haven't been enrolled in any property loyalty programs yet.</p>
              </div>
            )}

          </div>
        )}
        {tab === "bookings" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6" style={{ border: "1px solid #f0f0f0" }}>
              <h3 className="text-[14px] font-semibold text-[#1a1a1a] mb-1">Look up a Booking</h3>
              <p className="text-[12.5px] mb-4" style={{ color: "#aaa" }}>Enter your property code and booking number to view reservation details.</p>

              {/* Property dropdown — built from loyalty memberships */}
              {(() => {
                const uniqueProps = Array.from(
                  new Map(
                    (profile?.CreationGuest ?? []).map((cg) => [cg.propertyId, cg.Property])
                  ).values()
                );

                return (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                      <select
                        value={bookingPropertyCode}
                        onChange={(e) => setBookingPropertyCode(e.target.value)}
                        className="w-full rounded-[9px] text-[13px] outline-none appearance-none transition-all cursor-pointer"
                        style={{
                          padding: "10px 36px 10px 14px",
                          background: "#fafafa",
                          border: "1.5px solid #e0e0e0",
                          color: bookingPropertyCode ? "#1a1a1a" : "#aaa",
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(184,145,42,0.5)"; e.currentTarget.style.background = "#fff"; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = "#e0e0e0"; e.currentTarget.style.background = "#fafafa"; }}
                      >
                        <option value="" disabled>Select a property</option>
                        {uniqueProps.map((p) => (
                          <option key={p.id} value={p.propertyCode}>
                            {p.propertyName} — {p.propertyCode}
                          </option>
                        ))}
                      </select>
                      {/* Chevron icon */}
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#bbb] text-[10px]">▼</span>
                    </div>
                    <input
                      type="text"
                      placeholder="Booking code (e.g. 12345)"
                      value={bookingCode}
                      onChange={(e) => setBookingCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === "Enter" && handleBookingSearch()}
                      className="flex-1 rounded-[9px] text-[13px] outline-none transition-all"
                      style={{ padding: "10px 14px", background: "#fafafa", border: "1.5px solid #e0e0e0", color: "#1a1a1a" }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(184,145,42,0.5)"; e.currentTarget.style.background = "#fff"; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "#e0e0e0"; e.currentTarget.style.background = "#fafafa"; }}
                    />
                    <button
                      onClick={handleBookingSearch}
                      disabled={bookingLoading}
                      className="px-5 py-2.5 rounded-[9px] text-white text-[13px] font-medium border-none cursor-pointer disabled:opacity-60 whitespace-nowrap"
                      style={{ background: `linear-gradient(135deg, #c9a020 0%, #b8912a 100%)`, boxShadow: "0 4px 12px rgba(184,145,42,0.25)" }}
                    >
                      {bookingLoading ? "Searching…" : "Find Booking"}
                    </button>
                  </div>
                );
              })()}
            </div>

            {/* ── Booking result card */}
            {bookingData && (
              <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #f0f0f0", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
                {/* Header */}
                <div className="px-6 py-4 flex items-center justify-between" style={{ background: `linear-gradient(135deg, #c9a020 0%, #b8912a 100%)` }}>
                  <div>
                    <p className="text-white font-semibold text-[15px]">🏨 {bookingData.hotelName}</p>
                    <p className="text-white/75 text-[12px] mt-0.5">BOOK-{bookingData.bookingCode?.split("-")[1]}</p>
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                    bookingData.bookingStatus === "cancelled" ? "bg-red-100 text-red-600" :
                    bookingData.bookingStatus === "modified" ? "bg-yellow-100 text-yellow-700" :
                    "bg-green-100 text-green-700"
                  }`}>
                    {bookingData.bookingStatus}
                  </span>
                </div>

                {/* Details grid */}
                <div className="p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
                    {[
                      { label: "Check-in",  val: bookingData.checkInDate  ? new Date(bookingData.checkInDate).toDateString()  : "—" },
                      { label: "Check-out", val: bookingData.checkOutDate ? new Date(bookingData.checkOutDate).toDateString() : "—" },
                      { label: "Room type", val: bookingData.roomTypeCode ?? "—" },
                      { label: "Rate plan",  val: bookingData.ratePlanCode ?? "—" },
                      { label: "Rooms",      val: bookingData.finalPrice?.requestedRooms ?? 1 },
                      { label: "Total",      val: `${bookingData.currencyCode} ${Number(bookingData.finalPrice?.totalAmount ?? bookingData.amount ?? 0).toLocaleString()}` },
                    ].map((row) => (
                      <div key={row.label}>
                        <p className="text-[11px] uppercase tracking-[0.07em] font-medium mb-0.5" style={{ color: "#aaa" }}>{row.label}</p>
                        <p className="text-[13px] text-[#1a1a1a]">{row.val}</p>
                      </div>
                    ))}
                  </div>

                  {/* Guest */}
                  {bookingData.guests?.[0] && (
                    <div className="pt-4 border-t border-[#f5f5f5]">
                      <p className="text-[11px] uppercase tracking-[0.07em] font-medium mb-1" style={{ color: "#aaa" }}>Primary Guest</p>
                      <p className="text-[13px] text-[#1a1a1a]">{bookingData.guests[0].firstName} {bookingData.guests[0].lastName}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!bookingData && !bookingLoading && (
              <div className="bg-white rounded-2xl p-8 text-center" style={{ border: "1px solid #f0f0f0" }}>
                <p className="text-3xl mb-2">🔍</p>
                <p className="text-[13px] font-medium text-[#1a1a1a] mb-1">No booking loaded yet</p>
                <p className="text-[12px]" style={{ color: "#aaa" }}>Enter your booking code above to view reservation details.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

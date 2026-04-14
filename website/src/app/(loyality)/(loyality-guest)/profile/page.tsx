"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { RootState } from "@/src/store/store";
import { loyaltyLogout, setLoyaltyProfile } from "@/src/store/loyaltyUserSlice";
import { ProfileData } from "@/src/store/loyaltyUserTypes";
import { getMyProfileApi } from "./api/profile.api";
import { useRouter } from "next/navigation";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const levelColour = (level: number) => {
  if (level === 1) return { bg: "#f5f5f5", text: "#555", label: "Silver" };
  if (level === 2) return { bg: "#fff8e1", text: "#b8912a", label: "Gold" };
  return { bg: "#e8f5e9", text: "#2e7d32", label: "Platinum" };
};

const gold = "#b8912a";

// ─── Component ────────────────────────────────────────────────────────────────
export default function ProfileHomePage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const loyaltyUser = useSelector((state: RootState) => (state as any).loyaltyUser);

  // Use cached profile from Redux if available, otherwise fetch
  const [profile, setProfile] = useState<ProfileData | null>(loyaltyUser?.profile ?? null);
  const [loading, setLoading] = useState(!loyaltyUser?.profile);

  useEffect(() => {
    if (!loyaltyUser?.profile) {
      fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    const res = await getMyProfileApi();
    if (res?.success) {
      dispatch(setLoyaltyProfile(res.data));
      setProfile(res.data);
    } else {
      toast.error(res?.message ?? "Could not load profile");
      if (
        res?.message?.toLowerCase().includes("token") ||
        res?.message?.toLowerCase().includes("auth")
      ) {
        dispatch(loyaltyLogout());
        router.replace("/login");
      }
    }
    setLoading(false);
  };

  // Derive all unique properties (for display stats)
  const allProperties = Array.from(
    new Map(
      (profile?.CreationGuest ?? []).flatMap((cg) =>
        cg.CreationLoyaltyConfig.PropertyLoyaltyConfig.map((p) => [p.propertyId, p])
      )
    ).values()
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div
            className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-4"
            style={{ borderColor: "#e0e0e0", borderTopColor: gold }}
          />
          <p className="text-[13px]" style={{ color: "#999" }}>
            Loading your profile…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Member card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: `linear-gradient(135deg, #c9a020 0%, #b8912a 100%)`,
          boxShadow: "0 8px 32px rgba(184,145,42,0.2)",
        }}
      >
        <div className="px-8 py-8 relative overflow-hidden">
          <div
            className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10"
            style={{ background: "#fff", transform: "translate(30%, -30%)" }}
          />
          <div
            className="absolute bottom-0 left-0 w-28 h-28 rounded-full opacity-10"
            style={{ background: "#fff", transform: "translate(-30%, 30%)" }}
          />
          <div className="relative z-10">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/70 mb-3">
              Loyalty Member
            </p>
            <h2
              className="text-[22px] font-semibold text-white mb-0.5"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {profile?.guest
                ? `${profile.guest.firstName} ${profile.guest.lastName}`
                : profile?.guestEmail ?? "Member"}
            </h2>
            <p className="text-[13px] text-white/75">{profile?.guestEmail}</p>
            <div className="flex items-center gap-4 mt-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.1em] text-white/60">
                  Member since
                </p>
                <p className="text-[13px] font-medium text-white">
                  {profile?.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })
                    : "—"}
                </p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div>
                <p className="text-[10px] uppercase tracking-[0.1em] text-white/60">Programs</p>
                <p className="text-[13px] font-medium text-white">
                  {profile?.CreationGuest?.length ?? 0}
                </p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div>
                <p className="text-[10px] uppercase tracking-[0.1em] text-white/60">Properties</p>
                <p className="text-[13px] font-medium text-white">{allProperties.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Loyalty programs */}
      {profile?.CreationGuest && profile.CreationGuest.length > 0 ? (
        <div>
          <h3 className="text-[14px] font-semibold text-[#1a1a1a] mb-3">
            Loyalty Programs
            <span
              className="ml-2 text-[11px] font-normal px-2 py-0.5 rounded-full"
              style={{ background: "#fdf8ee", color: gold }}
            >
              {profile.CreationGuest.length} program
              {profile.CreationGuest.length !== 1 ? "s" : ""}
            </span>
          </h3>

          <div className="space-y-4">
            {profile.CreationGuest.map((cg) => {
              const config = cg.CreationLoyaltyConfig;
              const totalLevels = config.LoyalityLevels.length;
              const currentLevel = config.LoyalityLevels.find((l) => l.level === cg.guestLevel);
              const nextLevel = config.LoyalityLevels.find((l) => l.level === cg.guestLevel + 1);
              const lc = levelColour(cg.guestLevel);
              const programLogo = config.BasicLoyaltyProgram?.logo?.[0] ?? null;
              const effectiveDiscount = currentLevel
                ? `${currentLevel.discountPercentage}%`
                : `${config.discountValue}${config.loyaltyDiscountType === "percentage" ? "%" : ` ${config.currencyCode ?? ""}`}`;

              return (
                <div
                  key={cg.id}
                  className="bg-white rounded-2xl overflow-hidden transition-shadow hover:shadow-md"
                  style={{ border: "1px solid #f0f0f0" }}
                >
                  {/* Program header */}
                  <div className="px-5 pt-5 pb-4 flex items-center justify-between gap-3 border-b border-[#f8f8f8]">
                    <div className="flex items-center gap-3 min-w-0">
                      {programLogo ? (
                        <img
                          src={programLogo}
                          alt="Program logo"
                          className="w-10 h-10 rounded-xl object-contain bg-[#fafafa] border border-[#f0f0f0] flex-shrink-0"
                        />
                      ) : (
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                          style={{ background: "#fdf8ee" }}
                        >
                          🏆
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-[#1a1a1a]">
                          {config.loyaltyDiscountType === "percentage"
                            ? `Up to ${config.discountValue}% off`
                            : `${config.currencyCode} ${config.discountValue} off`}
                        </p>
                        <p className="text-[10px] font-mono mt-0.5" style={{ color: "#bbb" }}>
                          {config.id.slice(0, 8).toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: lc.bg, color: lc.text }}
                      >
                        {lc.label}
                      </span>
                      <span
                        className="text-[10px] px-2 py-1 rounded-full"
                        style={{ background: "#f5f5f5", color: "#888" }}
                      >
                        {totalLevels} tier{totalLevels !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="px-5 py-4 flex items-center gap-6 border-b border-[#f8f8f8]">
                    <div>
                      <p
                        className="text-[10px] uppercase tracking-[0.07em] font-medium mb-0.5"
                        style={{ color: "#aaa" }}
                      >
                        Your Discount
                      </p>
                      <p className="text-[15px] font-bold" style={{ color: gold }}>
                        {effectiveDiscount} off
                      </p>
                    </div>
                    <div>
                      <p
                        className="text-[10px] uppercase tracking-[0.07em] font-medium mb-0.5"
                        style={{ color: "#aaa" }}
                      >
                        Level
                      </p>
                      <p className="text-[15px] font-bold text-[#1a1a1a]">
                        {cg.guestLevel} / {totalLevels}
                      </p>
                    </div>
                    <div>
                      <p
                        className="text-[10px] uppercase tracking-[0.07em] font-medium mb-0.5"
                        style={{ color: "#aaa" }}
                      >
                        Bookings
                      </p>
                      <p className="text-[15px] font-bold text-[#1a1a1a]">{cg.noOfBookings}</p>
                    </div>
                  </div>

                  {/* Level progress bar */}
                  {nextLevel && (
                    <div className="px-5 py-3 border-b border-[#f8f8f8]">
                      <div className="flex justify-between mb-1.5">
                        <span className="text-[10px]" style={{ color: "#bbb" }}>
                          Level {cg.guestLevel} — {currentLevel?.discountPercentage}% off
                        </span>
                        <span className="text-[10px]" style={{ color: "#bbb" }}>
                          Level {nextLevel.level} — {nextLevel.discountPercentage}% off →
                        </span>
                      </div>
                      <div
                        className="h-1.5 rounded-full overflow-hidden"
                        style={{ background: "#f0f0f0" }}
                      >
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min((cg.guestLevel / totalLevels) * 100, 100)}%`,
                            background: gold,
                          }}
                        />
                      </div>
                      <p className="text-[10px] mt-1.5" style={{ color: "#bbb" }}>
                        {nextLevel.noOfReservations} booking
                        {nextLevel.noOfReservations !== 1 ? "s" : ""} needed to reach Level{" "}
                        {nextLevel.level}
                      </p>
                    </div>
                  )}

                  {/* Properties list */}
                  <div className="px-5 py-3">
                    <p
                      className="text-[10px] uppercase tracking-[0.07em] font-medium mb-2"
                      style={{ color: "#aaa" }}
                    >
                      Valid at {config.PropertyLoyaltyConfig.length} propert
                      {config.PropertyLoyaltyConfig.length !== 1 ? "ies" : "y"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {config.PropertyLoyaltyConfig.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
                          style={{ background: "#fafafa", border: "1px solid #f0f0f0" }}
                        >
                          {p.loyalityConfigLogo && (
                            <img
                              src={p.loyalityConfigLogo}
                              alt={p.propertyName}
                              className="w-4 h-4 rounded object-contain"
                            />
                          )}
                          <span className="text-[11px] font-medium text-[#444]">
                            {p.propertyName}
                          </span>
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded-full"
                            style={{
                              background: p.isActive ? "#e8f5e9" : "#fafafa",
                              color: p.isActive ? "#2e7d32" : "#aaa",
                            }}
                          >
                            {p.isActive ? "●" : "○"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div
          className="bg-white rounded-2xl p-8 text-center"
          style={{ border: "1px solid #f0f0f0" }}
        >
          <p className="text-3xl mb-2">🏨</p>
          <p className="text-[14px] font-medium text-[#1a1a1a] mb-1">No memberships yet</p>
          <p className="text-[12.5px]" style={{ color: "#aaa" }}>
            You haven't been enrolled in any property loyalty programs yet.
          </p>
        </div>
      )}
    </div>
  );
}
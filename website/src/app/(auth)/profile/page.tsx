"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { RootState } from "@/src/store/store";
import { clearCustomer } from "@/src/store/customerSlice";
import { getMyProfileApi } from "./api/profile.api";
import { useRouter } from "next/navigation";

interface CustomerProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  PropertyLoyalityGuests: any[];
  CreationGuest: any[];
  WishList: any[];
}

export default function ProfileHomePage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const customerState = useSelector((state: RootState) => state.customer);

  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    setLoading(true);
    const res = await getMyProfileApi();
    if (res?.success) {
      setProfile(res.data);
    } else {
      toast.error(res?.message ?? "Could not load profile");
      if (
        res?.message?.toLowerCase().includes("token") ||
        res?.message?.toLowerCase().includes("auth") ||
        res?.message?.toLowerCase().includes("log in")
      ) {
        dispatch(clearCustomer());
        router.replace("/login");
      }
    }
    setLoading(false);
  };

  const name = profile
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : customerState.customer
      ? `${customerState.customer.firstName ?? ""} ${customerState.customer.lastName ?? ""}`.trim()
      : "Guest";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-4"
            style={{ borderColor: "#e0e0e0", borderTopColor: "#1595A2" }} />
          <p className="text-[13px]" style={{ color: "#999" }}>Loading your profile…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-[18px] font-bold text-[#1a1a1a]">My Profile</h2>
        <button
          onClick={() => {
            const storedPropertyCode = sessionStorage.getItem("lastPropertyCode");
            if (storedPropertyCode) {
              router.push(`/Rooms?code=${storedPropertyCode}`);
            } else {
              router.push("/");
            }
          }}
          className="inline-flex items-center rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-sm transition hover:bg-stone-50"
        >
          ← Homepage
        </button>
      </div>     {/* ── Member card */}
      <div className="rounded-2xl overflow-hidden" style={{
        boxShadow: "0 8px 32px rgba(21,149,162,0.2)",
        background: "linear-gradient(90deg, #0d7a87 0%, #1fc8d8 40%, #1595A2 60%, #0d7a87 100%)",
      }}>
        <div className="px-8 py-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10"
            style={{ background: "#fff", transform: "translate(30%, -30%)" }} />
          <div className="absolute bottom-0 left-0 w-28 h-28 rounded-full opacity-10"
            style={{ background: "#fff", transform: "translate(-30%, 30%)" }} />
          <div className="relative z-10">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/70 mb-3">
              Guest Account
            </p>
            <h2 className="text-[22px] font-semibold text-white mb-0.5"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {name || "Member"}
            </h2>
            <p className="text-[13px] text-white/75">{profile?.email}</p>
            <div className="flex items-center gap-4 mt-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.1em] text-white/60">Programs</p>
                <p className="text-[13px] font-medium text-white">{profile?.CreationGuest?.length ?? 0}</p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div>
                <p className="text-[10px] uppercase tracking-[0.1em] text-white/60">Properties</p>
                <p className="text-[13px] font-medium text-white">{profile?.PropertyLoyalityGuests?.length ?? 0}</p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div>
                <p className="text-[10px] uppercase tracking-[0.1em] text-white/60">Wishlist</p>
                <p className="text-[13px] font-medium text-white">{profile?.WishList?.length ?? 0}</p>
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
            <span className="ml-2 text-[11px] font-normal px-2 py-0.5 rounded-full"
              style={{ background: "#f0fafa", color: "#1595A2" }}>
              {profile.CreationGuest.length} program{profile.CreationGuest.length !== 1 ? "s" : ""}
            </span>
          </h3>
          <div className="space-y-4">
            {profile.CreationGuest.map((cg: any) => {
              const config = cg.CreationLoyaltyConfig;
              const levels = config?.LoyalityLevels ?? [];
              const totalLevels = levels.length;
              const currentLevel = levels.find((l: any) => l.level === cg.guestLevel);
              const nextLevel = levels.find((l: any) => l.level === cg.guestLevel + 1);
              const properties = config?.PropertyLoyaltyConfig ?? [];
              const programLogo = config?.BasicLoyaltyProgram?.logo?.[0] ?? null;
              const effectiveDiscount = currentLevel
                ? `${currentLevel.discountPercentage}%`
                : config
                  ? `${config.discountValue}${config.loyaltyDiscountType === "percentage" ? "%" : ` ${config.currencyCode ?? ""}`}`
                  : "—";

              return (
                <div key={cg.id} className="bg-white rounded-2xl overflow-hidden transition-shadow hover:shadow-md"
                  style={{ border: "1px solid #f0f0f0" }}>

                  {/* Header */}
                  <div className="px-5 pt-5 pb-4 flex items-center gap-3 border-b border-[#f8f8f8]">
                    {programLogo ? (
                      <img src={programLogo} alt="Program logo"
                        className="w-10 h-10 rounded-xl object-contain bg-[#fafafa] border border-[#f0f0f0] flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                        style={{ background: "#fdf8ee" }}>🏆</div>
                    )}
                    <p className="text-[13px] font-semibold text-black">
                      {config
                        ? config.loyaltyDiscountType === "percentage"
                          ? `Up to ${config.discountValue}% off`
                          : `${config.currencyCode} ${config.discountValue} off`
                        : "Loyalty Program"}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="px-5 py-4 flex items-center gap-6 border-b border-[#f8f8f8]">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.07em] font-medium mb-0.5">Your Discount</p>
                      <p className="text-[15px] font-bold text-cyan-500">{effectiveDiscount} off</p>
                    </div>
                    {totalLevels > 1 && (
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.07em] font-medium mb-0.5">Level</p>
                        <p className="text-[15px] font-bold text-[#1a1a1a]">{cg.guestLevel} / {totalLevels}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.07em] font-medium mb-0.5">Bookings</p>
                      <p className="text-[15px] font-bold text-[#1a1a1a]">{cg.noOfBookings}</p>
                    </div>
                  </div>

                  {/* Progress bar */}
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
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#f0f0f0" }}>
                        <div className="h-full rounded-full transition-all" style={{
                          width: `${Math.min((cg.guestLevel / totalLevels) * 100, 100)}%`,
                          background: "linear-gradient(90deg, #0d7a87 0%, #1fc8d8 40%, #1595A2 60%, #0d7a87 100%)",
                        }} />
                      </div>
                      <p className="text-[10px] mt-1.5" style={{ color: "#bbb" }}>
                        {nextLevel.noOfReservations} booking{nextLevel.noOfReservations !== 1 ? "s" : ""} needed to reach Level {nextLevel.level}
                      </p>
                    </div>
                  )}

                  {/* Properties */}
                  {properties.length > 0 && (
                    <div className="px-5 py-3">
                      <p className="text-[10px] tracking-[0.07em] font-medium mb-2 text-black">
                        Valid at {properties.length} propert{properties.length !== 1 ? "ies" : "y"}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {properties.map((p: any) => (
                          <div key={p.id} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
                            style={{ background: "#fafafa", border: "1px solid #f0f0f0" }}>
                            {p.loyalityConfigLogo && (
                              <img src={p.loyalityConfigLogo} alt={p.propertyName}
                                className="w-4 h-4 rounded object-contain" />
                            )}
                            <span className="text-[11px] font-medium text-[#444]">
                              {p.propertyName}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{
                              background: p.isActive ? "#e8f5e9" : "#fafafa",
                              color: p.isActive ? "#2e7d32" : "#aaa",
                            }}>
                              {p.isActive ? "●" : "○"}
                            </span>
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
      ) : (
        <div className="bg-white rounded-2xl p-8 text-center" style={{ border: "1px solid #f0f0f0" }}>
          <p className="text-3xl mb-2">🏨</p>
          <p className="text-[14px] font-medium text-[#1a1a1a] mb-1">No memberships yet</p>
          <p className="text-[12.5px]" style={{ color: "#aaa" }}>
            You haven't been enrolled in any property loyalty programs yet.
          </p>
        </div>
      )}

      {/* ── Wishlist */}
      {profile?.WishList && profile.WishList.length > 0 && (
        <div>
          <h3 className="text-[14px] font-semibold text-[#1a1a1a] mb-3">Wishlist</h3>
          <div className="grid grid-cols-2 gap-3">
            {profile.WishList.map((w: any) => (
              <div key={w.id} className="bg-white rounded-2xl p-4" style={{ border: "1px solid #f0f0f0" }}>
                <p className="text-[13px] font-medium text-[#1a1a1a]">{w.propertyName}</p>
                <p className="text-[11px] mt-0.5" style={{ color: "#aaa" }}>{w.propertyCode}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
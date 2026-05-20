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

  useEffect(() => {
    fetchProfile();
  }, []);

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
          <div
            className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-4"
            style={{ borderColor: "#e0e0e0", borderTopColor: "#1595A2" }}
          />
          <p className="text-[13px]" style={{ color: "#999" }}>Loading your profile…</p>
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
          boxShadow: "0 8px 32px rgba(21,149,162,0.2)",
          background: "linear-gradient(90deg, #0d7a87 0%, #1fc8d8 40%, #1595A2 60%, #0d7a87 100%)",
        }}
      >
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
                <p className="text-[10px] uppercase tracking-[0.1em] text-white/60">Loyalty Programs</p>
                <p className="text-[13px] font-medium text-white">
                  {profile?.CreationGuest?.length ?? 0}
                </p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div>
                <p className="text-[10px] uppercase tracking-[0.1em] text-white/60">Properties</p>
                <p className="text-[13px] font-medium text-white">
                  {profile?.PropertyLoyalityGuests?.length ?? 0}
                </p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div>
                <p className="text-[10px] uppercase tracking-[0.1em] text-white/60">Wishlist</p>
                <p className="text-[13px] font-medium text-white">
                  {profile?.WishList?.length ?? 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Loyalty memberships */}
      {profile?.CreationGuest && profile.CreationGuest.length > 0 ? (
        <div>
          <h3 className="text-[14px] font-semibold text-[#1a1a1a] mb-3">
            Loyalty Programs
            <span className="ml-2 text-[11px] font-normal px-2 py-0.5 rounded-full"
              style={{ background: "#f0fafa", color: "#1595A2" }}>
              {profile.CreationGuest.length} program{profile.CreationGuest.length !== 1 ? "s" : ""}
            </span>
          </h3>
          <div className="space-y-3">
            {profile.CreationGuest.map((cg: any) => (
              <div key={cg.id} className="bg-white rounded-2xl p-5"
                style={{ border: "1px solid #f0f0f0" }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-semibold text-[#1a1a1a]">
                      Level {cg.guestLevel}
                    </p>
                    <p className="text-[12px] mt-0.5" style={{ color: "#aaa" }}>
                      {cg.noOfBookings} booking{cg.noOfBookings !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                      style={{ background: "rgba(21,149,162,0.08)", color: "#1595A2" }}>
                      Active
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-8 text-center"
          style={{ border: "1px solid #f0f0f0" }}>
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
              <div key={w.id} className="bg-white rounded-2xl p-4"
                style={{ border: "1px solid #f0f0f0" }}>
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
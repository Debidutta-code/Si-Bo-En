"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { RootState } from "@/src/store/store";
import { setLoyaltyProfile } from "@/src/store/loyaltyUserSlice";
import { PropertyLoyaltyConfig } from "@/src/store/loyaltyUserTypes";
import { getMyProfileApi } from "../api/profile.api";

// ─── Component ────────────────────────────────────────────────────────────────
export default function MyBookingsPage() {
  const dispatch = useDispatch();
  const loyaltyUser = useSelector((state: RootState) => (state as any).loyaltyUser);

  const [allProperties, setAllProperties] = useState<PropertyLoyaltyConfig[]>([]);
  const [bookingCode, setBookingCode] = useState("");
  const [bookingPropertyCode, setBookingPropertyCode] = useState("");
  const [bookingData, setBookingData] = useState<any | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    if (loyaltyUser?.profile) {
      // Derive unique properties from Redux cache
      const props = Array.from(
        new Map(
          (loyaltyUser.profile.CreationGuest ?? []).flatMap((cg: any) =>
            cg.CreationLoyaltyConfig.PropertyLoyaltyConfig.map((p: PropertyLoyaltyConfig) => [
              p.propertyId,
              p,
            ])
          )
        ).values()
      ) as PropertyLoyaltyConfig[];
      setAllProperties(props);
    } else {
      // Fetch profile if not cached
      fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loyaltyUser?.profile]);

  const fetchProfile = async () => {
    const res = await getMyProfileApi();
    if (res?.success) {
      dispatch(setLoyaltyProfile(res.data));
    } else {
      toast.error(res?.message ?? "Could not load profile");
    }
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

  return (
    <div className="space-y-6">
      {/* ── Booking lookup */}
      <div className="bg-white rounded-2xl p-6" style={{ border: "1px solid #f0f0f0" }}>
        <h3 className="text-[14px] font-semibold text-[#1a1a1a] mb-1">Look up a Booking</h3>
        <p className="text-[12.5px] mb-4" style={{ color: "#aaa" }}>
          Enter your property code and booking number to view reservation details.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Property selector */}
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
                fontFamily: "'DM Sans', sans-serif",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(184,145,42,0.5)";
                e.currentTarget.style.background = "#fff";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#e0e0e0";
                e.currentTarget.style.background = "#fafafa";
              }}
            >
              <option value="" disabled>
                Select a property
              </option>
              {allProperties.map((p) => (
                <option key={p.propertyId} value={p.propertyCode}>
                  {p.propertyName}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#bbb] text-[10px]">
              ▼
            </span>
          </div>

          {/* Booking code input */}
          <input
            type="text"
            placeholder="Booking code (e.g. 12345)"
            value={bookingCode}
            onChange={(e) => setBookingCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleBookingSearch()}
            className="flex-1 rounded-[9px] text-[13px] outline-none transition-all"
            style={{
              padding: "10px 14px",
              background: "#fafafa",
              border: "1.5px solid #e0e0e0",
              color: "#1a1a1a",
              fontFamily: "'DM Sans', sans-serif",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "rgba(184,145,42,0.5)";
              e.currentTarget.style.background = "#fff";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#e0e0e0";
              e.currentTarget.style.background = "#fafafa";
            }}
          />

          {/* Search button */}
          <button
            onClick={handleBookingSearch}
            disabled={bookingLoading}
            className="px-5 py-2.5 rounded-[9px] text-white text-[13px] font-medium border-none cursor-pointer disabled:opacity-60 whitespace-nowrap"
            style={{
              background: `linear-gradient(135deg, #c9a020 0%, #b8912a 100%)`,
              boxShadow: "0 4px 12px rgba(184,145,42,0.25)",
            }}
          >
            {bookingLoading ? "Searching…" : "Find Booking"}
          </button>
        </div>
      </div>

      {/* ── Booking result */}
      {bookingData && (
        <div
          className="bg-white rounded-2xl overflow-hidden"
          style={{ border: "1px solid #f0f0f0", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}
        >
          <div
            className="px-6 py-4 flex items-center justify-between"
            style={{ background: `linear-gradient(135deg, #c9a020 0%, #b8912a 100%)` }}
          >
            <div>
              <p className="text-white font-semibold text-[15px]">🏨 {bookingData.hotelName}</p>
              <p className="text-white/75 text-[12px] mt-0.5">
                BOOK-{bookingData.bookingCode?.split("-")[1]}
              </p>
            </div>
            <span
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                bookingData.bookingStatus === "cancelled"
                  ? "bg-red-100 text-red-600"
                  : bookingData.bookingStatus === "modified"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {bookingData.bookingStatus}
            </span>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
              {[
                {
                  label: "Check-in",
                  val: bookingData.checkInDate
                    ? new Date(bookingData.checkInDate).toDateString()
                    : "—",
                },
                {
                  label: "Check-out",
                  val: bookingData.checkOutDate
                    ? new Date(bookingData.checkOutDate).toDateString()
                    : "—",
                },
                { label: "Room type", val: bookingData.roomTypeCode ?? "—" },
                { label: "Rate plan", val: bookingData.ratePlanCode ?? "—" },
                { label: "Rooms", val: bookingData.finalPrice?.requestedRooms ?? 1 },
                {
                  label: "Total",
                  val: `${bookingData.currencyCode} ${Number(
                    bookingData.finalPrice?.totalAmount ?? bookingData.amount ?? 0
                  ).toLocaleString()}`,
                },
              ].map((row) => (
                <div key={row.label}>
                  <p
                    className="text-[11px] uppercase tracking-[0.07em] font-medium mb-0.5"
                    style={{ color: "#aaa" }}
                  >
                    {row.label}
                  </p>
                  <p className="text-[13px] text-[#1a1a1a]">{row.val}</p>
                </div>
              ))}
            </div>

            {bookingData.guests?.[0] && (
              <div className="pt-4 border-t border-[#f5f5f5]">
                <p
                  className="text-[11px] uppercase tracking-[0.07em] font-medium mb-1"
                  style={{ color: "#aaa" }}
                >
                  Primary Guest
                </p>
                <p className="text-[13px] text-[#1a1a1a]">
                  {bookingData.guests[0].firstName} {bookingData.guests[0].lastName}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Empty state */}
      {!bookingData && !bookingLoading && (
        <div
          className="bg-white rounded-2xl p-8 text-center"
          style={{ border: "1px solid #f0f0f0" }}
        >
          <p className="text-3xl mb-2">🔍</p>
          <p className="text-[13px] font-medium text-[#1a1a1a] mb-1">No booking loaded yet</p>
          <p className="text-[12px]" style={{ color: "#aaa" }}>
            Enter your booking code above to view reservation details.
          </p>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { RootState } from "@/src/store/store";
import { setLoyaltyProfile } from "@/src/store/loyaltyUserSlice";
import { PropertyLoyaltyConfig } from "@/src/store/loyaltyUserTypes";
import { getMyProfileApi } from "../api/profile.api";

type userIdentityCardType = "PASSPORT" | "DRIVERS_LICENSE" | "NATIONAL_ID" | "OTHER";

interface IGuestCheckInDetails {
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  userIdentityCardType: userIdentityCardType;
  identityCardNumber: string;
  identityCardImage?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function MyBookingsPage() {
  const dispatch = useDispatch();
  const loyaltyUser = useSelector((state: RootState) => (state as any).loyaltyUser);

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const [allProperties, setAllProperties] = useState<PropertyLoyaltyConfig[]>([]);
  const [bookingCode, setBookingCode] = useState("");
  const [bookingPropertyCode, setBookingPropertyCode] = useState("");
  const [bookingData, setBookingData] = useState<any | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [isCheckinDialogOpen, setIsCheckinDialogOpen] = useState(false);
  const [checkinForm, setCheckinForm] = useState<IGuestCheckInDetails>({
    userIdentityCardType: "NATIONAL_ID",
    identityCardNumber: "",
    address: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
  });
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false);

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
      ) as unknown as PropertyLoyaltyConfig[];
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
    console.log("Searching for booking with code:", bookingCode, "and property code:", bookingPropertyCode);
    if (!bookingPropertyCode.trim() || !bookingCode.trim()) {
      toast.error("Select a Property then enter a Reservation Code");
      return;
    }
    setBookingLoading(true);
    setBookingData(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/reservations/BOOK-${bookingCode.trim().toUpperCase()}?propertyCode=${bookingPropertyCode.trim().toUpperCase()}`
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

  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingData?.bookingCode) return;

    setIsCheckingIn(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/reservations/check-in/${bookingData.bookingCode}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(checkinForm),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to check-in");

      toast.success("Successfully checked in!");
      setIsCheckinDialogOpen(false);
      setBookingData({ ...bookingData, bookingStatus: "checked_in" });
    } catch (error: any) {
      toast.error(error.message || "An error occurred during check-in");
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleCheckOutSubmit = async () => {
    if (!bookingData?.bookingCode) return;

    setIsCheckingOut(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/reservations/check-out/${bookingData.bookingCode}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to check-out");

      toast.success("Successfully checked out!");
      setIsCheckoutDialogOpen(false);
      setBookingData({ ...bookingData, bookingStatus: "checkedOut" });
    } catch (error: any) {
      toast.error(error.message || "An error occurred during check-out");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* ── Booking lookup */}
      <div className="bg-white rounded-2xl p-6" style={{ border: "1px solid #f0f0f0" }}>
        <h3 className="text-[18px] font-bold text-[#1a1a1a] mb-1">Look up a Booking</h3>
        <p className="text-[12.5px] mb-4 text-black">
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
                color: "black",
                fontFamily: "'DM Sans', sans-serif",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#e0e0e0";
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
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#e0e0e0";
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
              background: "linear-gradient(90deg, #0d7a87 0%,  #0d7a87 100%)",
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
            style={{ background: `linear-gradient(135deg, #1fc8d8 0%, #0d7a87 100%)` }}
          >
            <div>
              <p className="text-white font-semibold text-[15px]">🏨 {bookingData.hotelName}</p>
              <p className="text-white/75 text-[12px] mt-0.5">
                BOOK-{bookingData.bookingCode?.split("-")[1]}
              </p>
            </div>
            <span
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${bookingData.bookingStatus === "cancelled"
                ? "bg-red-100 text-red-600"
                : bookingData.bookingStatus === "modified"
                  ? "bg-yellow-100 text-yellow-700"
                  : bookingData.bookingStatus === "checkedIn"
                    ? "bg-blue-100 text-blue-700"
                    : bookingData.bookingStatus === "checkedOut"
                      ? "bg-gray-100 text-gray-700"
                      : "bg-green-100 text-green-700"
                }`}
            >
              {formatStatus(bookingData.bookingStatus)}
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
                    className="text-[14px] font-bold text-black mb-0.5"
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

            {bookingData.bookingStatus === "confirmed" && (
              <div className="pt-4 mt-4 border-t border-[#f5f5f5] flex justify-end">
                <button
                  onClick={() => setIsCheckinDialogOpen(true)}
                  className="px-6 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity"
                  style={{ background: "#0d7a87" }}
                >
                  Check In Now
                </button>
              </div>
            )}

            {bookingData.bookingStatus === "checked_in" && (
              <div className="pt-4 mt-4 border-t border-[#f5f5f5] flex justify-end">
                <button
                  onClick={() => setIsCheckoutDialogOpen(true)}
                  className="px-6 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity"
                  style={{ background: "#e53e3e" }}
                >
                  Check Out Now
                </button>
              </div>
            )}
          </div>
        </div>
      )}

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

      {isCheckinDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Online Check-In</h3>
              <button
                onClick={() => setIsCheckinDialogOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCheckInSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600">ID Type <span className="text-red-500">*</span></label>
                  <select
                    value={checkinForm.userIdentityCardType}
                    onChange={(e) => setCheckinForm({ ...checkinForm, userIdentityCardType: e.target.value as userIdentityCardType })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0d7a87]"
                    required
                  >
                    <option value="NATIONAL_ID">National ID</option>
                    <option value="PASSPORT">Passport</option>
                    <option value="DRIVERS_LICENSE">Driver's License</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600">ID Number <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={checkinForm.identityCardNumber}
                    onChange={(e) => setCheckinForm({ ...checkinForm, identityCardNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0d7a87]"
                    required
                    placeholder="Enter ID number"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600">Address</label>
                <input
                  type="text"
                  value={checkinForm.address}
                  onChange={(e) => setCheckinForm({ ...checkinForm, address: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0d7a87]"
                  placeholder="Street address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600">City</label>
                  <input
                    type="text"
                    value={checkinForm.city}
                    onChange={(e) => setCheckinForm({ ...checkinForm, city: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0d7a87]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600">State/Province</label>
                  <input
                    type="text"
                    value={checkinForm.state}
                    onChange={(e) => setCheckinForm({ ...checkinForm, state: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0d7a87]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600">Country</label>
                  <input
                    type="text"
                    value={checkinForm.country}
                    onChange={(e) => setCheckinForm({ ...checkinForm, country: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0d7a87]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600">Zip/Postal Code</label>
                  <input
                    type="text"
                    value={checkinForm.zipCode}
                    onChange={(e) => setCheckinForm({ ...checkinForm, zipCode: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0d7a87]"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsCheckinDialogOpen(false)}
                  className="px-5 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCheckingIn}
                  className="px-5 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  style={{ background: "#0d7a87" }}
                >
                  {isCheckingIn ? "Processing..." : "Complete Check-In"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCheckoutDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Confirm Check-Out</h3>
              <button
                onClick={() => setIsCheckoutDialogOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                disabled={isCheckingOut}
              >
                &times;
              </button>
            </div>
            <div className="p-6 space-y-6">
              <p className="text-sm text-gray-600">
                Are you sure you want to check out of this reservation? This action cannot be undone.
              </p>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsCheckoutDialogOpen(false)}
                  className="px-5 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                  disabled={isCheckingOut}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCheckOutSubmit}
                  disabled={isCheckingOut}
                  className="px-5 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  style={{ background: "#e53e3e" }}
                >
                  {isCheckingOut ? "Processing..." : "Confirm Check-Out"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

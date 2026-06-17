"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { RootState } from "@/src/store/store";
import { setLoyaltyProfile } from "@/src/store/loyaltyUserSlice";
import { PropertyLoyaltyConfig } from "@/src/store/loyaltyUserTypes";
import { getMyProfileApi } from "../api/profile.api";
import ImageUploadModal from "@/src/components/ImageUploadModal";
import { formatNumber, getLocale } from "../../../../utils/numLang";
import { currencies } from "@/src/components/currencyCode/cuurency";
import { Currency } from "@/src/components/currencyCode/currency-code.type";

type userIdentityCardType = "passport" | "drivers_license" | "national_id" | "others";

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

interface MyReservation {
  id: string;
  bookingCode: string;
  reservationStartDate: string;
  reservationEndDate: string;
  checkInDate: string | null;
  checkOutDate: string | null;
  bookingStatus: string;
  property?: { propertyName: string; propertyCode: string; image?: string[] };
  roomTypeCode?: string;
  ratePlanCode?: string;
  currencyCode?: string;
  amount?: number;
  finalPrice?: { totalAmount: number; currencyCode: string };
  PricingBrakeDown?: { totalAmount: number; currencyCode: string } | null;
  guests?: { firstName: string; lastName: string }[];
  reservationGuests?: { firstName: string; lastName: string }[];
}

export default function MyBookingsPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const loyaltyUser = useSelector((state: RootState) => (state as any).loyaltyUser);
  const customer = useSelector((state: RootState) => (state as any).customer);

  const formatStatus = (status: string) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const isSameDay = (dateStr?: string | null): boolean => {
    if (!dateStr) return false;
    return new Date(dateStr).toDateString() === new Date().toDateString();
  };

  const [allProperties, setAllProperties] = useState<PropertyLoyaltyConfig[]>([]);
  const [myReservations, setMyReservations] = useState<MyReservation[]>([]);
  const [myReservationsLoading, setMyReservationsLoading] = useState(false);
  const [reservationExpandedId, setReservationExpandedId] = useState<string | null>(null);

  const [isCheckinDialogOpen, setIsCheckinDialogOpen] = useState(false);
  const [activeReservationId, setActiveReservationId] = useState<string>("");
  const [checkinForm, setCheckinForm] = useState<any>({
    identityCardNumber: "",
    userIdentityCardType: "passport",
    city: "",
    state: "",
    country: "",
    address: "",
    identityImage: "",
  });
  const [isImageUploadModalOpen, setIsImageUploadModalOpen] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false);

  // ─── Fetch all reservations ──────────────────────────────────────────────────
  useEffect(() => {
    if (!customer.isAuthenticated) return;

    let cancelled = false;
    setMyReservationsLoading(true);
    setMyReservations([]);

    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/reservations`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message ?? t("MyBookingsPage.toast.loadFailed"));
        }
        return data.data as MyReservation[];
      })
      .then((list) => {
        if (!cancelled) {
          setMyReservations(Array.isArray(list) ? list : []);
          if (list.length === 0) {
            toast(t("MyBookingsPage.toast.noReservations"), { icon: "ℹ️" });
          }
        }
      })
      .catch((err: any) => {
        if (!cancelled) toast.error(err.message ?? t("MyBookingsPage.toast.loadError"));
      })
      .finally(() => {
        if (!cancelled) setMyReservationsLoading(false);
      });

    return () => { cancelled = true; };
  }, [customer.isAuthenticated]);

  // ─── Build property list from loyalty profile ────────────────────────────────
  useEffect(() => {
    if (loyaltyUser?.profile) {
      const props = Array.from(
        new Map(
          (loyaltyUser.profile.CreationGuest ?? [])
            .flatMap((cg: any) =>
              (cg.CreationLoyaltyConfig?.PropertyLoyaltyConfig ?? []).map(
                (p: PropertyLoyaltyConfig) => [p.propertyId, p] as [string, PropertyLoyaltyConfig]
              )
            )
        ).values()
      ) as PropertyLoyaltyConfig[];
      setAllProperties(props);
    } else {
      fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loyaltyUser?.profile]);

  const fetchProfile = async () => {
    const res = await getMyProfileApi();
    if (res?.success) {
      dispatch(setLoyaltyProfile(res.data));
    } else {
      toast.error(res?.message ?? t("MyBookingsPage.toast.profileLoadFailed"));
    }
  };

  // ─── Check-in ────────────────────────────────────────────────────────────────
  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReservationId) return;
    if (!checkinForm.identityImage) {
      toast.error(t("MyBookingsPage.toast.identityImageRequired"));
      return;
    }
    setIsCheckingIn(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/reservations/check-in/${activeReservationId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(checkinForm),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || t("MyBookingsPage.toast.checkinFailed"));
      toast.success(t("MyBookingsPage.toast.checkinSuccess"));
      setIsCheckinDialogOpen(false);
      setIsImageUploadModalOpen(false);
      setActiveReservationId("");
      setCheckinForm({
        identityCardNumber: "",
        userIdentityCardType: "passport",
        city: "",
        state: "",
        country: "",
        address: "",
        identityImage: "",
      });
    } catch (error: any) {
      toast.error(error.message || t("MyBookingsPage.toast.checkinError"));
    } finally {
      setIsCheckingIn(false);
    }
  };

  // ─── Check-out ───────────────────────────────────────────────────────────────
  const handleCheckOutSubmit = async () => {
    const bookingCode = activeReservationId;
    if (!bookingCode) return;
    setIsCheckingOut(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/reservations/check-out/${bookingCode}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || t("MyBookingsPage.toast.checkoutFailed"));
      toast.success(t("MyBookingsPage.toast.checkoutSuccess"));
      setIsCheckoutDialogOpen(false);
      setActiveReservationId("");
    } catch (error: any) {
      toast.error(error.message || t("MyBookingsPage.toast.checkoutError"));
    } finally {
      setIsCheckingOut(false);
    }
  };

  // ─── Detail rows built inside render so t() is in scope ─────────────────────
  const getDetailRows = (res: MyReservation) => [
    {
      label: t("MyBookingsPage.details.checkIn"),
      val: (res.checkInDate || res.reservationStartDate)
        ? new Intl.DateTimeFormat(getLocale(), { month: "short", day: "numeric", year: "numeric" }).format(new Date(res.checkInDate || res.reservationStartDate))
        : "—",
    },
    {
      label: t("MyBookingsPage.details.checkOut"),
      val: (res.checkOutDate || res.reservationEndDate)
        ? new Intl.DateTimeFormat(getLocale(), { month: "short", day: "numeric", year: "numeric" }).format(new Date(res.checkOutDate || res.reservationEndDate))
        : "—",
    },
    { label: t("MyBookingsPage.details.roomType"), val: res.roomTypeCode ?? "—" },
    { label: t("MyBookingsPage.details.ratePlan"), val: res.ratePlanCode ?? "—" },
    {
      label: t("MyBookingsPage.details.total"),
      val: (res.PricingBrakeDown?.totalAmount ?? res.amount ?? res.finalPrice?.totalAmount) != null
        ? `${(currencies.find((c: Currency) => c.code === (res.currencyCode || res.finalPrice?.currencyCode || ""))?.symbol || res.currencyCode || res.finalPrice?.currencyCode || "")} ${formatNumber(Number(res.PricingBrakeDown?.totalAmount ?? res.amount ?? res.finalPrice?.totalAmount ?? 0))}`
        : "—",
    },
    {
      label: t("MyBookingsPage.details.primaryGuest"),
      val: (res.guests?.[0]?.firstName && res.guests?.[0]?.lastName)
        ? `${res.guests[0].firstName} ${res.guests[0].lastName}`
        : (res.reservationGuests?.[0]?.firstName && res.reservationGuests?.[0]?.lastName)
          ? `${res.reservationGuests[0].firstName} ${res.reservationGuests[0].lastName}`
          : "—",
    },
  ];

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 relative pb-20 md:pb-6">
      <div className="space-y-4">
        <h3 className="text-[18px] font-bold text-[#1a1a1a]">{t("MyBookingsPage.heading")}</h3>
        <p className="text-[12.5px] text-gray-500">{t("MyBookingsPage.subtitle")}</p>

        {myReservationsLoading && (
          <div className="bg-white rounded-2xl p-10 text-center" style={{ border: "1px solid #f0f0f0" }}>
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600 mx-auto mb-4" />
            <p className="text-sm text-gray-500">{t("MyBookingsPage.loading")}</p>
          </div>
        )}

        {!myReservationsLoading && myReservations.length === 0 && (
          <div className="bg-white rounded-2xl p-10 text-center" style={{ border: "1px solid #f0f0f0" }}>
            <p className="text-3xl mb-2">🏖️</p>
            <p className="text-[14px] font-medium text-[#1a1a1a] mb-1">{t("MyBookingsPage.empty.title")}</p>
            <p className="text-[12px] text-gray-400">{t("MyBookingsPage.empty.description")}</p>
          </div>
        )}

        {!myReservationsLoading &&
          myReservations.map((res) => {
            const isOpen = reservationExpandedId === res.id;
            const statusCls =
              res.bookingStatus === "cancelled"
                ? "bg-red-100 text-red-600"
                : res.bookingStatus === "modified"
                  ? "bg-yellow-100 text-yellow-700"
                  : res.bookingStatus === "checked_in"
                    ? "bg-blue-100 text-blue-700"
                    : res.bookingStatus === "checked_out"
                      ? "bg-gray-100 text-gray-700"
                      : "bg-green-100 text-green-700";

            return (
              <div
                key={res.id}
                className="bg-white rounded-2xl overflow-hidden"
                style={{ border: "1px solid #f0f0f0", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}
              >
                {/* Card header — click to expand */}
                <button
                  onClick={() => setReservationExpandedId(isOpen ? null : res.id)}
                  className="w-full px-6 py-4 flex items-center justify-between cursor-pointer text-left"
                  style={{ background: "linear-gradient(135deg, #f4fdfb 0%, #e9f8f6 100%)" }}
                >
                  <div>
                    <p className="text-[15px] font-bold text-[#1a1a1a]">
                      🏨 {res.property?.propertyName ?? t("MyBookingsPage.card.propertyFallback")}
                    </p>
                    <p className="text-[11.5px] text-gray-400 mt-0.5">
                      {res.property?.propertyCode}
                      {"\u00A0\u00A0·\u00A0\u00A0"}
                      BOOK-{res.bookingCode?.split("-")[1] ?? res.bookingCode}
                      {"\u00A0\u00A0·\u00A0\u00A0"}
                      {res.roomTypeCode ?? "—"}
                      {res.ratePlanCode ? ` / ${res.ratePlanCode}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusCls}`}>
                      {formatStatus(res.bookingStatus)}
                    </span>
                    <svg
                      width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      className="transition-transform duration-200"
                      style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </button>

                {/* Expanded details */}
                {isOpen && (
                  <div className="p-6 border-t border-[#f0f0f0]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      {getDetailRows(res).map((row) => (
                        <div key={row.label}>
                          <p className="text-[13px] font-bold text-black mb-0.5">{row.label}</p>
                          <p className="text-[12px] text-[#1a1a1a]">{row.val}</p>
                        </div>
                      ))}
                    </div>

                    {/* Action buttons */}
                    {(res.bookingStatus === "confirmed" || res.bookingStatus === "modified") && (
                      <div className="pt-3 border-t border-[#f0f0f0] flex flex-col sm:flex-row justify-end gap-2">
                        <button
                          onClick={() => {
                            setActiveReservationId(res.bookingCode);
                            setIsCheckinDialogOpen(true);
                          }}
                          disabled={!isSameDay(res.reservationStartDate)}
                          className="w-full sm:w-auto px-6 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                          style={{
                            background: isSameDay(res.reservationStartDate) ? "#0d7a87" : "#e5e7eb",
                            color: isSameDay(res.reservationStartDate) ? "white" : "#9ca3af",
                          }}
                        >
                          {t("MyBookingsPage.actions.checkInNow")}
                        </button>
                      </div>
                    )}
                    {res.bookingStatus === "checked_in" && (
                      <div className="pt-3 border-t border-[#f0f0f0] flex flex-col sm:flex-row justify-end gap-2">
                        <button
                          onClick={() => {
                            setActiveReservationId(res.bookingCode);
                            setIsCheckoutDialogOpen(true);
                          }}
                          disabled={!isSameDay(res.reservationEndDate)}
                          className="w-full sm:w-auto px-6 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                          style={{
                            background: isSameDay(res.reservationEndDate) ? "#e53e3e" : "#e5e7eb",
                            color: isSameDay(res.reservationEndDate) ? "white" : "#9ca3af",
                          }}
                        >
                          {t("MyBookingsPage.actions.checkOutNow")}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* ── Check-in dialog ──────────────────────────────────────────────────── */}
      {isCheckinDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">{t("MyBookingsPage.checkinDialog.title")}</h3>
              <button onClick={() => setIsCheckinDialogOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
            </div>

            <form onSubmit={handleCheckInSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600">
                    {t("MyBookingsPage.checkinDialog.idTypeLabel")} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={checkinForm.userIdentityCardType}
                    onChange={(e) => setCheckinForm({ ...checkinForm, userIdentityCardType: e.target.value as userIdentityCardType })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0d7a87]"
                    required
                  >
                    <option value="national_id">{t("MyBookingsPage.checkinDialog.idTypes.nationalId")}</option>
                    <option value="passport">{t("MyBookingsPage.checkinDialog.idTypes.passport")}</option>
                    <option value="drivers_license">{t("MyBookingsPage.checkinDialog.idTypes.driversLicense")}</option>
                    <option value="others">{t("MyBookingsPage.checkinDialog.idTypes.others")}</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600">
                    {t("MyBookingsPage.checkinDialog.idNumberLabel")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={checkinForm.identityCardNumber}
                    onChange={(e) => setCheckinForm({ ...checkinForm, identityCardNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0d7a87]"
                    required
                    placeholder={t("MyBookingsPage.checkinDialog.idNumberPlaceholder")}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600">{t("MyBookingsPage.checkinDialog.addressLabel")}</label>
                <input
                  type="text"
                  value={checkinForm.address}
                  onChange={(e) => setCheckinForm({ ...checkinForm, address: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0d7a87]"
                  placeholder={t("MyBookingsPage.checkinDialog.addressPlaceholder")}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600">{t("MyBookingsPage.checkinDialog.cityLabel")}</label>
                  <input
                    type="text" value={checkinForm.city}
                    onChange={(e) => setCheckinForm({ ...checkinForm, city: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0d7a87]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600">{t("MyBookingsPage.checkinDialog.stateLabel")}</label>
                  <input
                    type="text" value={checkinForm.state}
                    onChange={(e) => setCheckinForm({ ...checkinForm, state: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0d7a87]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600">{t("MyBookingsPage.checkinDialog.countryLabel")}</label>
                  <input
                    type="text" value={checkinForm.country}
                    onChange={(e) => setCheckinForm({ ...checkinForm, country: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0d7a87]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600">{t("MyBookingsPage.checkinDialog.zipLabel")}</label>
                  <input
                    type="text" value={checkinForm.zipCode}
                    onChange={(e) => setCheckinForm({ ...checkinForm, zipCode: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0d7a87]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("MyBookingsPage.checkinDialog.identityImageLabel")}
                </label>
                <div className="flex gap-2 items-center">
                  {checkinForm.identityImage && (
                    <img
                      src={checkinForm.identityImage}
                      alt={t("MyBookingsPage.checkinDialog.identityImageAlt")}
                      className="w-12 h-12 object-cover rounded-md border"
                    />
                  )}
                  <button
                    onClick={() => setIsImageUploadModalOpen(true)}
                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                  >
                    {t("MyBookingsPage.checkinDialog.uploadButton")}
                  </button>
                </div>
              </div>

              <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 sticky bottom-0">
                <button
                  type="button"
                  onClick={() => setIsCheckinDialogOpen(false)}
                  className="px-5 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  {t("MyBookingsPage.checkinDialog.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isCheckingIn}
                  className="px-5 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  style={{ background: "#0d7a87" }}
                >
                  {isCheckingIn ? t("MyBookingsPage.checkinDialog.processing") : t("MyBookingsPage.checkinDialog.submit")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Check-out dialog ─────────────────────────────────────────────────── */}
      {isCheckoutDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">{t("MyBookingsPage.checkoutDialog.title")}</h3>
              <button
                onClick={() => setIsCheckoutDialogOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                disabled={isCheckingOut}
              >
                &times;
              </button>
            </div>
            <div className="p-6 space-y-6">
              <p className="text-sm text-gray-600">{t("MyBookingsPage.checkoutDialog.body")}</p>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsCheckoutDialogOpen(false)}
                  className="px-5 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                  disabled={isCheckingOut}
                >
                  {t("MyBookingsPage.checkoutDialog.cancel")}
                </button>
                <button
                  onClick={handleCheckOutSubmit}
                  disabled={isCheckingOut}
                  className="px-5 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  style={{ background: "#e53e3e" }}
                >
                  {isCheckingOut ? t("MyBookingsPage.checkoutDialog.processing") : t("MyBookingsPage.checkoutDialog.confirm")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isImageUploadModalOpen && (
        <ImageUploadModal
          isOpen={isImageUploadModalOpen}
          onClose={() => setIsImageUploadModalOpen(false)}
          onUploadSuccess={(urls: string[]) => setCheckinForm({ ...checkinForm, identityImage: urls[0] })}
        />
      )}
    </div>
  );
}
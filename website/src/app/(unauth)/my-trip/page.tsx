"use client";
import { useTranslation } from "react-i18next";
import CancelModal from "../../../components/BookingModals/CancelModal";
import ModifyBookingModal from "@/src/components/BookingModals/ModifyBookingmodal";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setBookingData as setBookingViewData } from "../../../store/bookingviewSlice";
import { useSearchParams } from "next/navigation";
import jsPDF from "jspdf";
import {
  FaUser,
  FaBed,
  FaCalendarAlt,
  FaPrint,
  FaCreditCard,
  FaEdit,
  FaSearch,
} from "react-icons/fa";
import { GiCancel } from "react-icons/gi";
import { HiOutlineViewGridAdd } from "react-icons/hi";
import { useBookingStorage } from "@/src/hooks/useBookingStorage"; // Add this import
import { getAvailableSpasApi } from "@/src/app/(loyality)/(loyality-guest)/profile/api/profile.api";
import SpaBookingDialog from "@/src/components/loyalty/SpaBookingDialog";

type userIdentityCardType = "passport" | "drivers_license" | "national_id" | "others";

export default function MyTripPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [bookingCode, setBookingCode] = useState("");
  const [bookingData, setBookingData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [isCheckinDialogOpen, setIsCheckinDialogOpen] = useState(false);
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isSpaDialogOpen, setIsSpaDialogOpen] = useState(false);
  const [availableSpas, setAvailableSpas] = useState<any[]>([]);
  const [spasLoading, setSpasLoading] = useState(false);
  const [checkinForm, setCheckinForm] = useState({
    userIdentityCardType: "national_id",
    identityCardNumber: "",
    address: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
  });
  const dispatch = useDispatch();
  const { t } = useTranslation();

  // Add the hook usage at the component level
  const { colors } = useBookingStorage({}); // You may need to pass actual bookingContext if available

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const searchParams = useSearchParams();
  const handleSearch = async () => {
    const propertyCode = searchParams.get("propertyCode");
    if (!propertyCode) {
      toast.error(t("MyTrip.missingPropertyCode"));
      return;
    }
    if (!bookingCode.trim()) {
      toast.error(t("MyTrip.missingBookingCode"));
      return;
    }
    setLoading(true);
    setBookingData(null);
    setAvailableSpas([]);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/reservations/BOOK-${bookingCode.trim().toUpperCase()}?propertyCode=${propertyCode}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Booking not found");
      setBookingData(data.data); // ✅ local state
      dispatch(setBookingViewData(data.data)); // ✅ global redux state
      // Fetch available spas for this booking
      await fetchAvailableSpas(bookingCode.trim());
      // toast.success("Booking found!");
    } catch (err: any) {
      toast.error(err.message || t("MyTrip.errorFetching"));
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (showModal) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    // Clean up on component unmount
    return () => document.body.classList.remove("overflow-hidden");
  }, [showModal]);

  useEffect(() => {
    const codeFromUrl = searchParams.get("code");
    const propertyCode = searchParams.get("propertyCode");
    if (!propertyCode) {
      toast.error(t("MyTrip.missingPropertyCode"));
      return;
    }

    if (!codeFromUrl) return;
    setBookingCode(codeFromUrl); // for input field
    const fetchFromUrl = async () => {
      setLoading(true);
      setBookingData(null);
      setAvailableSpas([]);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/reservations/BOOK-${codeFromUrl}?propertyCode=${propertyCode}`
        );
        const data = await res.json();
        // //console.log(data)
        if (!res.ok) throw new Error(data.message || "Booking not found");
        setBookingData(data.data);
        dispatch(setBookingViewData(data.data));
        // Fetch available spas for this booking
        await fetchAvailableSpas(codeFromUrl.trim());
        // toast.success("Booking found!");
      } catch (err: any) {
        toast.error(err.message || "Error fetching booking");
      } finally {
        setLoading(false);
      }
    };
    fetchFromUrl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

 const handleDownloadPDF = async () => {
  if (!bookingData) return;
  const toastId = toast.loading("Generating voucher...");
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/reports/booking-voucher/${bookingData.bookingCode}`,
      { method: "GET" }
    );
    if (!response.ok) throw new Error("Failed to download voucher");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `voucher-${bookingData.bookingCode}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    toast.dismiss(toastId);
  } catch (err: any) {
    toast.dismiss(toastId);
    toast.error(err.message || "Failed to download voucher");
  }
};

  useEffect(() => {
    const isAnyModalOpen = showModal || showCancelModal || showUpdateModal;
    if (isAnyModalOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [showModal, showCancelModal, showUpdateModal]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
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
      dispatch(setBookingViewData({ ...bookingData, bookingStatus: "checked_in" }));
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
      dispatch(setBookingViewData({ ...bookingData, bookingStatus: "checkedOut" }));
    } catch (error: any) {
      toast.error(error.message || "An error occurred during check-out");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const fetchAvailableSpas = async (code: string) => {
    setSpasLoading(true);
    try {
      const res = await getAvailableSpasApi(`BOOK-${code.trim().toUpperCase()}`);
      if (res?.success) {
        setAvailableSpas(res.data || []);
      } else {
        setAvailableSpas([]);
      }
    } catch (err) {
      setAvailableSpas([]);
    } finally {
      setSpasLoading(false);
    }
  };

  // //console.log("bookingdata", bookingData)

  return (
    <div className="min-h-screen bg-gray-100 px-4  py-12 flex flex-col items-center">
      {/* Search Bar Section - Always at the top */}
      <div className="w-full max-w-3xl mb-10">

        <h1 className="text-4xl font-bold text-center mb-8" style={{ color: colors.primaryColor }}>
          {t("MyTrip.title")}
        </h1>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <input
            ref={inputRef}
            type="text"
            value={bookingCode}
            onChange={(e) => setBookingCode(e.target.value.trim().toUpperCase())} onKeyDown={handleKeyPress}
            placeholder={t("MyTrip.placeholder")}

            className="w-full sm:w-96 px-5 py-4 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-600 transition-colors uppercase"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-8 py-4 rounded-xl font-semibold flex items-center gap-3 shadow-lg transition"
            style={{
              backgroundColor: colors.secondaryColor,
              color: colors.buttonTextColor
            }}
          >
            <FaSearch className="text-xl" />
            {loading ? t("MyTrip.searching") : t("MyTrip.search")}
          </button>
        </div>
        <p className="text-center text-gray-600 mt-4">
          {t("MyTrip.codeHint")}
        </p>

      </div>

      {bookingData && (
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl border border-gray-200 transition-all duration-300">
          <div className="relative flex items-center mb-4">
            <div
              className="w-full rounded-t-lg p-3 shadow-md"
              style={{
                background: `linear-gradient(to right, ${colors.primaryColor}, ${colors.tertiaryColor})`
              }}
            >
              <h2 className="text-2xl font-semibold gap-2 flex text-white">
                🏨 {bookingData?.hotelName || ""}
              </h2>
            </div>
            {/* Status Badge */}
            <div className="absolute sm:top-3 top-10 sm:right-4 right-2">
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full
        ${bookingData.bookingStatus === "cancelled"
                    ? "bg-red-100 text-red-600"
                    : bookingData.bookingStatus === "modified"
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-green-100 text-green-600"
                  }
      `}
              >
                {formatStatus(bookingData.bookingStatus)}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 px-6 gap-6 text-gray-700 text-sm pb-2">
            <div>
              <p className="text-gray-500 font-medium">{t("MyTrip.checkIn")}</p>
              <p className="text-green-700">
                {new Date(bookingData.reservationStartDate).toDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">{t("MyTrip.checkOut")}</p>
              <p className="text-green-700">
                {new Date(bookingData.reservationEndDate).toDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">{t("MyTrip.roomType")}</p>
              <p>
                <FaBed className="inline mr-1" /> {bookingData.roomName}
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">{t("MyTrip.paymentMethod")}</p>
              <p className="text-purple-700 capitalize">
                {bookingData.paymentMethod?.replace(/_/g, ' ') || t("MyTrip.payAtHotel")}
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">{t("MyTrip.primaryGuest")}</p>
              <p>
                <FaUser className="inline mr-1" />{" "}
                {`${bookingData.guests[0].firstName} ${bookingData.guests[0].lastName}`}
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">{t("MyTrip.rate")}</p>
              <p className="text-blue-700 font-semibold">
                {bookingData.currencyCode}{" "}
                {(
                  (bookingData.amount || 0) + (bookingData?.PricingBrakeDown?.totalSpa || 0)).toFixed(2)}            </p>
            </div>
          </div>

          {/* Available Spas Section */}
          {availableSpas.length > 0 && (
            <div className="px-6 pb-2">
              <button
                onClick={() => setIsSpaDialogOpen(true)}
                className="w-full px-4 py-2.5 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                style={{ background: "#0d7a87" }}
              >
                <span>🧖</span>
                View & Book Spa Services ({availableSpas.length} available)
              </button>
            </div>
          )}

          <div className="flex flex-col gap-4 p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* View Booking Details Button */}
              <button
                onClick={() => setShowModal(true)}
                className="text-white px-4 py-2 rounded-md font-medium shadow hover:opacity-90 flex-1"
                style={{
                  background: `linear-gradient(to right, ${colors.primaryColor}, ${colors.tertiaryColor})`,
                  color: colors.buttonTextColor
                }}
              >
                <HiOutlineViewGridAdd className="inline mr-2" /> {t("MyTrip.viewBooking")}
              </button>
              {bookingData.bookingStatus === "confirmed" && (
                <button
                  onClick={() => setIsCheckinDialogOpen(true)}
                  className="px-4 py-2 rounded-md text-white font-medium hover:opacity-90 flex-1"
                  style={{ background: colors.primaryColor }}
                >
                  Check In Now
                </button>
              )}
              {bookingData.bookingStatus === "checked_in" && (
                <button
                  onClick={() => setIsCheckoutDialogOpen(true)}
                  className="px-4 py-2 rounded-md text-white font-medium hover:opacity-90 flex-1"
                  style={{ background: "#e53e3e" }}
                >
                  Check Out Now
                </button>
              )}
            </div>
            {/* Modify & Cancel Buttons */}
            {(bookingData.bookingStatus === "confirmed" ||
              bookingData.bookingStatus === "modified") && (
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => setShowUpdateModal(true)}
                    className="border px-4 py-2 rounded-md font-medium border-blue-500 hover:bg-blue-50 w-full"
                    style={{
                      color: colors.primaryColor,
                      borderColor: colors.primaryColor
                    }}
                  >
                    <FaEdit className="inline mr-2 mb-1" /> {t("MyTrip.modify")}
                  </button>
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="border px-4 py-2 rounded-md font-medium text-red-600 border-red-500 hover:bg-red-50 w-full"
                  >
                    <GiCancel className="inline mr-2 mb-1" />
                    {t("MyTrip.cancel")}
                  </button>
                </div>
              )}
          </div>
        </div>
      )}

      {/* MODAL */}
      {showModal && bookingData && (
        <div className="fixed inset-0 py-8 bg-black bg-opacity-50 backdrop-blur-sm flex overflow-y-auto justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl relative animate-fadeIn max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-3xl z-10"
            >
              &times;
            </button>
            {/* Header with Glossy Badge */}
            <div className="flex items-center mb-6">
              <div
                className="w-full text-white rounded-t-lg p-4 shadow-md"
                style={{
                  background: `linear-gradient(to right, ${colors.primaryColor}, ${colors.tertiaryColor})`
                }}
              >
                <h3 className="text-2xl font-bold text-white">
                  🏨 {bookingData?.hotelName || "Hotel"}
                </h3>
                <p className="text-sm text-blue-100 mt-1">
                  {t("MyTrip.bookingCode")} {bookingData.bookingCode.split("-")[1]}
                </p>
              </div>
            </div>
            {/* Status Badge */}
            <div className="px-6 mb-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold
          ${bookingData.bookingStatus === "cancelled"
                  ? "bg-red-100 text-red-600"
                  : bookingData.bookingStatus === "confirmed"
                    ? "bg-green-100 text-green-600"
                    : "bg-yellow-100 text-yellow-600"
                }`}>
                {formatStatus(bookingData.bookingStatus)}
              </span>
            </div>
            {/* Details */}
            <div className="space-y-6 text-sm text-gray-700 px-6 sm:px-8 pb-6">
              {/* Stay Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold flex items-center gap-2 mb-3" style={{ color: colors.primaryColor }}>
                  <FaCalendarAlt style={{ color: colors.primaryColor }} /> {t("MyTrip.stayDetails")}
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">{t("MyTrip.checkInLabel")}</p>
                    <p className="text-green-600 font-semibold">
                      {new Date(bookingData.reservationStartDate).toLocaleDateString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm font-medium">{t("MyTrip.checkOutLabel")}</p>
                    <p className="text-red-600 font-semibold">
                      {new Date(bookingData.reservationEndDate).toLocaleDateString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">{t("MyTrip.roomType")}</p>
                    <span
                      className="inline-block px-3 py-1 rounded-sm text-xs font-semibold"
                      style={{
                        backgroundColor: colors.secondaryColor,
                        color: colors.buttonTextColor
                      }}
                    >
                      {bookingData.roomName}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm font-medium">{t("MyTrip.rooms")}</p>
                    <p className="text-gray-800 font-medium">
                      {bookingData.finalPrice?.requestedRooms || 1}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm font-medium">{t("MyTrip.ratePlan")}</p>
                    <p className="text-gray-800 font-medium">
                      {bookingData.ratePlanName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm font-medium">{t("MyTrip.nights")}</p>
                    <p className="text-gray-800 font-medium">
                      {bookingData.finalPrice?.numberOfNights || 1}
                    </p>
                  </div>
                </div>
              </div>
              {/* Guest Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold flex items-center gap-2 mb-3" style={{ color: colors.primaryColor }}>
                  <FaUser style={{ color: colors.primaryColor }} /> {t("MyTrip.guestDetails")}
                </h4>
                <div className="space-y-2">
                  {(() => {
                    const primary = bookingData.guests.find((g: any) => g.type === "adult");
                    if (!primary) return <p className="text-gray-500">{t("MyTrip.noGuestDetails")}</p>;
                    return (
                      <div className="grid grid-cols-2 gap-4 border-b pb-2">
                        <div>
                          <p className="text-gray-500 text-sm font-medium">{t("MyTrip.name")}</p>
                          <p className="text-gray-800 font-medium">
                            {primary.firstName} {primary.lastName}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-sm font-medium">{t("MyTrip.type")}</p>
                          <p className="text-gray-800 font-medium">
                            {primary.type.charAt(0).toUpperCase() + primary.type.slice(1)}
                          </p>
                        </div>
                        {primary.dateOfBirth && (
                          <div className="col-span-2">
                            <p className="text-gray-500 text-sm font-medium">{t("MyTrip.dateOfBirth")}</p>
                            <p className="text-gray-800">
                              {new Date(primary.dateOfBirth).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">{t("MyTrip.contactNumber")}</p>
                    <span className="font-medium text-gray-800">
                      {bookingData.bookingUserPhone}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm font-medium">{t("MyTrip.email")}</p>
                    <span className="font-medium text-gray-800">
                      {bookingData.bookingUserEmail}
                    </span>
                  </div>
                </div>
                {/* Primary Guest Details if available */}
                {bookingData.primaryGuest && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm font-semibold text-blue-800 mb-1">{t("MyTrip.primaryGuestLabel")}</p>
                    <p className="text-gray-700">
                      {bookingData.primaryGuest.firstName} {bookingData.primaryGuest.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t("MyTrip.phone")} {bookingData.primaryGuest.phoneNumber}
                    </p>
                  </div>
                )}
              </div>
              {/* Payment Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4
                  className="text-lg font-semibold flex items-center gap-2 mb-3"
                  style={{ color: colors.primaryColor }}
                >
                  <FaCreditCard style={{ color: colors.primaryColor }} />{" "}
                  {t("MyTrip.paymentDetails")}
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">
                      {t("MyTrip.paymentMethod")}
                    </p>
                    <p className="capitalize text-gray-800">
                      {bookingData.paymentMethod?.replace(/_/g, " ") ||
                        t("MyTrip.payAtHotel")}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-sm font-medium">
                      {t("MyTrip.bookingDate")}
                    </p>
                    <p className="text-gray-800">
                      {new Date(bookingData.bookedAt).toLocaleDateString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-sm font-medium">
                      {t("MyTrip.currency")}
                    </p>
                    <p className="text-gray-800">{bookingData.currencyCode}</p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-sm font-medium">
                      {t("MyTrip.bookingSource")}
                    </p>
                    <p className="text-gray-800 uppercase">
                      {bookingData.bookingSource}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm">

                  {/* 1. Base Amount (room only, no addons) */}
                  <div className="flex justify-between items-center">
                    <p className="text-gray-600">{t("MyTrip.baseAmount")}</p>
                    <p className="font-medium">
                      {bookingData.currencyCode}{" "}
                      {((bookingData.PricingBrakeDown?.amountBeforeTax || 0) -
                        (bookingData.PricingBrakeDown?.totalAddonAmount || 0) +
                        (bookingData.PricingBrakeDown?.totalPromotionAmount || 0)
                      ).toFixed(2)}
                    </p>
                  </div>

                  {/* 2. Addons */}
                  {(bookingData.PricingBrakeDown?.AddonBrakeDowns?.length > 0) && (() => {
                    const grouped = bookingData.PricingBrakeDown.AddonBrakeDowns.reduce((acc: any, addon: any) => {
                      if (!acc[addon.name]) acc[addon.name] = { ...addon, totalAmount: 0 };
                      acc[addon.name].totalAmount += addon.totalAmount;
                      return acc;
                    }, {});
                    return (
                      <div className="space-y-1">
                        {Object.values(grouped).map((addon: any, i: number) =>
                          addon.totalAmount > 0 && (
                            <div key={i} className="flex justify-between items-center">
                              <p className="text-gray-600">
                                🍽 {addon.name}
                                <span className="text-xs text-gray-400 ml-1">
                                  ({addon.type === "included" ? "Included" : "Selected"})
                                </span>
                              </p>
                              <p className="font-medium">+{bookingData.currencyCode} {addon.totalAmount?.toFixed(2)}</p>
                            </div>
                          )
                        )}
                      </div>
                    );
                  })()}

                  {/* 3. Discounts */}
                  {bookingData.PricingBrakeDown?.promotionBrakeDown?.filter((p: any) => p.restrictionType !== "payLater").length > 0 && (
                    <div className="space-y-1">
                      {bookingData.PricingBrakeDown.promotionBrakeDown
                        .filter((p: any) => p.restrictionType !== "payLater")
                        .map((promo: any, i: number) => (
                          <div key={i} className="flex justify-between items-center">
                            <p className="text-green-600 flex items-center gap-1">
                              🏷 {promo.name}
                              <span className="text-xs text-gray-400">
                                ({promo.discountType === "percentage" ? `-${promo.discountValue}%` : `-${promo.currencyCode || bookingData.currencyCode} ${promo.discountValue}`})
                              </span>
                            </p>
                            <p className="font-medium text-green-600">-{bookingData.currencyCode} {promo.discountAmount?.toFixed(2)}</p>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* 4. Amount Before Tax */}
                  <div className="flex justify-between items-center border-t pt-2">
                    <p className="text-gray-700 font-medium">Amount Before Tax</p>
                    <p className="font-medium">
                      {bookingData.currencyCode}{" "}
                      {bookingData.PricingBrakeDown?.amountBeforeTax?.toFixed(2) || "0.00"}
                    </p>
                  </div>

                  {/* 5. Tax Breakdown */}
                  {bookingData.PricingBrakeDown?.taxBrakeDown?.length > 0 && (
                    <div className="space-y-1">
                      {bookingData.PricingBrakeDown.taxBrakeDown.map((tax: any, i: number) => (
                        <div key={i} className="flex justify-between items-center">
                          <p className="text-gray-600">🧾 {tax.name}</p>
                          <p className="font-medium">+{tax.currencyCode} {tax.taxedAmount?.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 6. Amount After Tax */}
                  <div className="flex justify-between items-center border-t pt-2">
                    <p className="text-gray-700 font-medium">Amount After Tax</p>
                    <p className="font-medium">
                      {bookingData.currencyCode}{" "}
                      {((bookingData.PricingBrakeDown?.amountBeforeTax || 0) +
                        (bookingData.PricingBrakeDown?.taxedAmount || 0)
                      ).toFixed(2)}
                    </p>
                  </div>

                  {/* 7. Chargeable Amount + Pay Later + Grand Total */}
                  <div className="border-t pt-2 space-y-2">

                    {/* Pay Later (Tourist Tax) */}
                    {bookingData.PricingBrakeDown?.latterpayableAmount > 0 && (
                      <>
                        {bookingData.PricingBrakeDown.promotionBrakeDown
                          ?.filter((p: any) => p.restrictionType === "payLater")
                          .map((promo: any, i: number) => (
                            <div key={i} className="flex justify-between items-center">
                              <p className="text-orange-600 flex items-center gap-1">⏳ {promo.name}</p>
                              <p className="font-medium text-orange-600">+{bookingData.currencyCode} {promo.discountAmount?.toFixed(2)}</p>
                            </div>
                          ))}
                      </>
                    )}

                    {/* Spa Charges */}
                    {bookingData.PricingBrakeDown?.totalSpa > 0 && (
                      <div className="space-y-1 flex items-center justify-between">
                        <p className="text-purple-600  gap-1">{t("MyTrip.totalActivityCharges")}</p>
                        <p className="font-medium text-purple-600">+{bookingData.currencyCode} {bookingData.PricingBrakeDown.totalSpa}</p>
                      </div>
                    )}

                    {/* Amount to Pay at Hotel (chargeable + payLater + spa) */}
                    {bookingData.paymentMethod === "pay_at_hotel" ? (
                      <div className="flex justify-between items-center bg-orange-50 px-3 py-2 rounded-lg">
                        <p className="text-orange-700 font-semibold">{t("MyTrip.amountPayAtHotel")}</p>
                        <p className="text-orange-700 font-bold text-lg">
                          {bookingData.currencyCode}{" "}
                          {(
                            (bookingData.PricingBrakeDown?.currentChargeableAmount || 0) +
                            (bookingData.PricingBrakeDown?.latterpayableAmount || 0) +
                            (bookingData.PricingBrakeDown?.totalSpa || 0)
                          ).toFixed(2)}
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-center bg-green-50 px-3 py-2 rounded-lg">
                          <p className="text-green-700 font-semibold">{t("MyTrip.paidOnline")}</p>
                          <p className="text-green-700 font-bold text-lg">
                            {bookingData.currencyCode}{" "}
                            {bookingData.PricingBrakeDown?.currentChargeableAmount?.toFixed(2) || "0.00"}
                          </p>
                        </div>
                        {((bookingData.PricingBrakeDown?.latterpayableAmount || 0) + (bookingData.PricingBrakeDown?.totalSpa || 0)) > 0 && (
                          <div className="flex justify-between items-center bg-orange-50 px-3 py-2 rounded-lg">
                            <p className="text-orange-700 font-semibold">{t("MyTrip.amountPaidLater")}</p>
                            <p className="text-orange-700 font-bold text-lg">
                              {bookingData.currencyCode}{" "}
                              {(
                                (bookingData.PricingBrakeDown?.latterpayableAmount || 0) +
                                (bookingData.PricingBrakeDown?.totalSpa || 0)
                              ).toFixed(2)}
                            </p>
                          </div>
                        )}
                      </>
                    )}

                    {/* Grand Total */}
                    <div className="flex justify-between items-center border-t pt-2">
                      <p className="text-gray-800 font-semibold">{t("MyTrip.totalAmount")}</p>
                      <p className="text-blue-700 font-bold text-lg">
                        {bookingData.currencyCode}{" "}
                        {(
                          (bookingData.PricingBrakeDown?.totalAmount || 0) +
                          (bookingData.PricingBrakeDown?.totalSpa || 0)
                        ).toFixed(2)}
                      </p>
                    </div>

                    {/* Paid Amount */}
                    {bookingData.paidAmount > 0 && (
                      <div className="flex justify-between items-center">
                        <p className="text-gray-600">{t("MyTrip.paidAmount")}</p>
                        <p className="font-medium text-green-600">
                          {bookingData.currencyCode} {bookingData.paidAmount?.toFixed(2)}
                        </p>
                      </div>
                    )}

                    {/* Refund */}
                    {bookingData.refundAmount && bookingData.paidAmount > 0 && (
                      <div className="flex justify-between items-center">
                        <p className="text-gray-600">{t("MyTrip.refundableAmount")}</p>
                        <p className="font-medium text-green-600">
                          {bookingData.currencyCode}{" "}
                          {(
                            (bookingData.extraAmountToPay || 0) -
                            (bookingData.PricingBrakeDown?.latterpayableAmount || 0) -
                            (bookingData.refundAmount || 0) -
                            (bookingData.PricingBrakeDown?.totalSpa || 0)
                          ).toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* Buttons */}
            <div className="sticky bottom-0 bg-white border-t p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                {bookingData.bookingStatus === "confirmed" && (
                  <div className="w-full sm:w-auto flex-1">
                    <button
                      onClick={() => setIsCheckinDialogOpen(true)}
                      className="px-4 py-3 rounded-md text-white font-medium hover:opacity-90 w-full flex items-center justify-center gap-2"
                      style={{ background: colors.primaryColor }}
                    >
                      Check In Now
                    </button>
                  </div>
                )}
                {bookingData.bookingStatus === "checked_in" && (
                  <div className="w-full sm:w-auto flex-1">
                    <button
                      onClick={() => setIsCheckoutDialogOpen(true)}
                      className="px-4 py-3 rounded-md text-white font-medium hover:opacity-90 w-full flex items-center justify-center gap-2"
                      style={{ background: "#e53e3e" }}
                    >
                      Check Out Now
                    </button>
                  </div>
                )}
                {(bookingData.bookingStatus === "confirmed") && (
                  <>
                    <div className="w-full sm:w-auto flex-1">
                      <button
                        onClick={() => setShowUpdateModal(true)}
                        className="border px-4 py-3 rounded-md font-medium border-blue-500 hover:bg-blue-50 w-full flex items-center justify-center gap-2"
                        style={{
                          color: colors.primaryColor,
                          borderColor: colors.primaryColor
                        }}
                      >
                        <FaEdit /> {t("MyTrip.modify")}
                      </button>
                    </div>
                    <div className="w-full sm:w-auto flex-1">
                      <button
                        onClick={() => setShowCancelModal(true)}
                        className="border px-4 py-3 rounded-md font-medium text-red-600 border-red-500 hover:bg-red-50 w-full flex items-center justify-center gap-2"
                      >
                        <GiCancel />
                        {t("MyTrip.cancel")}
                      </button>
                    </div>
                  </>
                )}
                <div className="w-full sm:w-auto flex-1">
                  <button
                    onClick={handleDownloadPDF}
                    className="bg-gray-800 text-white px-4 py-3 rounded-md hover:bg-gray-900 w-full flex items-center justify-center gap-2 transition-colors"
                  >
                    <FaPrint /> {t("MyTrip.printItinerary")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCancelModal && bookingData && (
        <CancelModal
          bookingData={bookingData}
          onClose={() => setShowCancelModal(false)}
          onCancel={() => {
            // toast.success("Booking cancelled");
            setShowCancelModal(false);
            setBookingData((prevBookingData: any) => {
              if (!prevBookingData) return prevBookingData;
              return { ...prevBookingData, bookingStatus: "cancelled" };
            });
          }}
        />
      )}

      {showUpdateModal && bookingData && (
        <ModifyBookingModal
          bookingData={bookingData}
          onClose={() => setShowUpdateModal(false)}
          onUpdate={handleSearch}
        />
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
                    <option value="national_id">National ID</option>
                    <option value="passport">Passport</option>
                    <option value="drivers_license">Driver's License</option>
                    <option value="others">Other</option>
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
                  style={{ background: colors.primaryColor }}
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

      {isSpaDialogOpen && bookingData && (
        <SpaBookingDialog
          bookingCode={bookingData.bookingCode}
          reservationId={bookingData.id}
          guestName={bookingData.guests?.[0] ? `${bookingData.guests[0].firstName} ${bookingData.guests[0].lastName}` : ""}
          onClose={() => setIsSpaDialogOpen(false)}
        />
      )}
    </div>
  );
}
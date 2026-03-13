"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useBookingStorage } from "@/src/hooks/useBookingStorage";
import { currencies } from "@/src/components/currencyCode/cuurency";

const PaymentSuccessPage = () => {
  const bookingData = useSelector((state: RootState) => state.booking);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  // Get booking code from URL params (for Fikafi redirect)
  const urlBookingCode = searchParams?.get("bookingCode");

  // Add the hook usage at the component level
  const { colors } = useBookingStorage({});

  // ✅ Read booking confirmation from localStorage
  const [localConfirmation, setLocalConfirmation] = useState<any>(null);

  useEffect(() => {
    // Check localStorage for booking confirmation
    const stored = localStorage.getItem("bookingConfirmation");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Check if it's recent (within 24 hours)
        if (
          parsed.timestamp &&
          Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000
        ) {
          setLocalConfirmation(parsed);
        }
      } catch (e) {
        console.error("Error parsing booking confirmation:", e);
      }
    }
  }, []);
  const formatPaymentMethod = (paymentMethod: string): string => {
    return paymentMethod
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };
  // ✅ Clear cookie + block back navigation
  useEffect(() => {
    // Clear the access cookie
    document.cookie =
      "can_access_payment=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    // Prevent user from navigating back
    const handlePopState = () => {
      router.replace("/");
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);
  const {
    startDate: checkIn,
    endDate: checkOut,
    guestDetails: guests,
    email,
    finalPrice,
    guests: guestCounts,
    roomId,
    hotelName,
    bookingCode,
    bookingStatus,
  } = bookingData;

  // ✅ Show success if either Redux has confirmed status OR localStorage has confirmation OR URL has booking code
  const isConfirmed =
    bookingStatus === "confirmed" ||
    localConfirmation?.status === "confirmed" ||
    !!urlBookingCode;

  const totalAmount = finalPrice?.totalAmount || 0;
  const nights = finalPrice?.numberOfNights || 0;

  const rooms = bookingData.numberOfRooms || 1;
  const adults = (guests || []).filter((g: any) => g.type === "adult").length;
  const children = (guests || []).filter((g: any) => g.type === "child").length;
  const handleViewBookings = () => {
    setLoading(true);
    // Use URL booking code if available, otherwise use Redux booking code
    const code = urlBookingCode || bookingData.bookingCode;
    router.push(
      `/my-trip?propertyCode=${bookingData.PropertyCode}&code=${code}`,
    );
  };
  const currencyCode =
    finalPrice?.currencyCode ||
    finalPrice?.dailyBreakdown?.[0]?.currencyCode ||
    "USD";
  const currencySymbol =
    currencies.find((c) => c.code === currencyCode)?.symbol ?? currencyCode;
  return isConfirmed ? (
    <div className="min-h-screen bg-gray-100  py-8 px-4">
      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-2xl p-8 sm:p-10">
        {/* Success Banner */}
        <div
          className="border px-6 py-4 rounded-xl mb-8 text-center"
          style={{
            backgroundColor: `${colors.secondaryColor}10`,
            borderColor: colors.primaryColor,
            color: colors.primaryColor,
          }}
        >
          <h1 className="text-2xl font-bold mb-1">Booking Confirmed!</h1>
          <p>Your reservation has been successfully completed.</p>
        </div>

        {/* Two-Column Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-6">
          {/* Booking Summary */}
          <div>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: colors.primaryColor }}
            >
              Booking Summary
            </h2>
            <div className="space-y-2 text-sm text-gray-800">
              <p>
                <strong>Check-in:</strong> {checkIn}
              </p>
              <p>
                <strong>Check-out:</strong> {checkOut}
              </p>
              <p>
                <strong>Duration:</strong> {nights} night{nights > 1 ? "s" : ""}
              </p>
              <p>
                <strong>Guests:</strong> {rooms} Room{rooms !== 1 ? "s" : ""} ·{" "}
                {adults} Adult{adults !== 1 ? "s" : ""}
                {children > 0
                  ? ` · ${children} Child${children !== 1 ? "ren" : ""}`
                  : ""}
              </p>
            </div>
          </div>

          {/* Guest Info */}
          <div>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: colors.primaryColor }}
            >
              Guest Information
            </h2>
            <div className="space-y-2 text-sm text-gray-800">
              {guests && guests.length > 0 ? (
                guests.map((guest: any, index: number) => (
                  <div key={index}>
                    <p className="font-medium">
                      {guest.firstName} {guest.lastName}
                    </p>
                  </div>
                ))
              ) : (
                <p>No guest details provided.</p>
              )}
              <p>
                <strong>Email:</strong> {email}
              </p>

              <p>
                <strong>Payment Method:</strong>{" "}
                <span
                  className="font-semibold"
                  style={{ color: colors.primaryColor }}
                >
                  {formatPaymentMethod(
                    bookingData?.paymentMethod || "pay_at_hotel",
                  )}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Payment Details & Buttons */}
        <div className="flex border-t md:flex-row flex-col justify-start items-start pt-6">
          <div className="md:w-1/2">
            <h2
              className="text-lg font-semibold mb-2"
              style={{ color: colors.primaryColor }}
            >
              Payment Details
            </h2>
            <div
              className="font-bold text-2xl"
              style={{ color: colors.primaryColor }}
            >
              {currencySymbol}
              {totalAmount}
            </div>
            <p className="text-sm text-gray-500">
              {bookingData?.paymentMethod === "payment_gateway"
                ? "Payment completed online."
                : "Payment will be collected at the hotel."}
            </p>
          </div>

          <div className="mt-6 md:mt-0 flex flex-col sm:flex-row gap-4 md:w-1/2">
            <button
              onClick={handleViewBookings}
              disabled={loading}
              className="text-white px-6 py-2 rounded-lg shadow transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              style={{
                backgroundColor: colors.secondaryColor,
                color: colors.buttonTextColor,
                // '&:hover': { backgroundColor: colors.primaryColor }
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Redirecting...
                </>
              ) : (
                "View My Bookings"
              )}
            </button>
            <button
              onClick={() => router.push("/")}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg shadow transition-all"
            >
              Return Home
            </button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-10 grid grid-cols-1 gap-6 text-sm">
          <div
            className="p-4 rounded-xl shadow"
            style={{
              backgroundColor: `${colors.secondaryColor}10`,
            }}
          >
            <h3
              className="font-semibold mb-2"
              style={{ color: colors.primaryColor }}
            >
              What's Next?
            </h3>
            <ul className="list-disc list-inside text-gray-800 space-y-1">
              <li>A confirmation email has been sent.</li>
              <li>You can view or cancel bookings anytime.</li>
              <li>Need changes? Contact us 24/7.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  ) : (
    // 🚫 Pending UI
    <div className="min-h-screen bg-gray-100 pt-28 pb-8 px-4">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-8 text-center">
        <div
          className="flex flex-col items-center border px-6 py-5 rounded-xl mb-6"
          style={{
            backgroundColor: `${colors.secondaryColor}10`,
            borderColor: colors.primaryColor,
            color: colors.primaryColor,
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M12 2a10 10 0 110 20 10 10 0 010-20z"
            />
          </svg>
          <h1 className="text-2xl font-bold mb-1">Booking Pending</h1>
          <p className="text-sm sm:text-base">
            We've received your booking request and it's currently being
            processed.
          </p>
        </div>

        <p className="text-gray-700 mb-4">
          You will receive a confirmation email shortly. If you don't hear from
          us within 10 minutes, please contact our support team.
        </p>

        <div
          className="border rounded-lg p-4 text-left text-sm text-gray-700 mb-6"
          style={{
            backgroundColor: `${colors.secondaryColor}10`,
            borderColor: colors.primaryColor,
          }}
        >
          <h2 className="font-semibold text-gray-800 mb-2">Next Steps</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Make sure you have completed the payment if required.</li>
            <li>
              If you paid via bank transfer or UPI, allow a few minutes for
              processing.
            </li>
            <li>
              Your booking will be confirmed once the payment is verified.
            </li>
          </ul>
        </div>

        <div className="flex justify-center gap-4 mt-6 flex-wrap">
          <button
            onClick={handleViewBookings}
            disabled={loading}
            className="text-white px-6 py-2 rounded-lg shadow transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            style={{
              backgroundColor: colors.secondaryColor,
              color: colors.buttonTextColor,
            }}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Redirecting...
              </>
            ) : (
              "View My Bookings"
            )}
          </button>
          <button
            onClick={() => router.push("/")}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg shadow"
          >
            Return Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;

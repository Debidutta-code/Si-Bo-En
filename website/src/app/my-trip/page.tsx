"use client";
import CancelModal from "../../components/BookingModals/CancelModal";
import ModifyBookingModal from "@/src/components/BookingModals/ModifyBookingmodal";
import { useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setBookingData as setBookingViewData } from "../../store/bookingviewSlice";
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

export default function MyTripPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [bookingCode, setBookingCode] = useState("");
  const [bookingData, setBookingData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const dispatch = useDispatch();

  // Add the hook usage at the component level
  const { colors } = useBookingStorage({}); // You may need to pass actual bookingContext if available

  const searchParams = useSearchParams();
  const handleSearch = async () => {
    const propertyCode = searchParams.get("propertyCode");
    if(!propertyCode) {
      toast.error("Property code is missing in the URL");
      return;
    }
    if (!bookingCode.trim()) {
      toast.error("Please enter a booking code");
      return;
    }
    setLoading(true);
    setBookingData(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/front-office/reservations/${bookingCode}?propertyCode=${propertyCode}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Booking not found");
      setBookingData(data.data); // ✅ local state
      dispatch(setBookingViewData(data.data)); // ✅ global redux state
      // toast.success("Booking found!");
    } catch (err: any) {
      toast.error(err.message || "Error fetching booking");
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
    if (!codeFromUrl) return;
    setBookingCode(codeFromUrl); // for input field
    const fetchFromUrl = async () => {
      setLoading(true);
      setBookingData(null);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/front-office/reservations/${codeFromUrl}`
        );
        const data = await res.json();
        // //console.log(data)
        if (!res.ok) throw new Error(data.message || "Booking not found");
        setBookingData(data.data);
        dispatch(setBookingViewData(data.data));
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

  const handleDownloadPDF = () => {
    if (!bookingData) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const centerX = pageWidth / 2;
    let y = 15;

    // === HEADER BAR ===
    doc.setFillColor(25, 85, 150);
    doc.rect(0, 0, pageWidth, 25, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Booking Confirmation", centerX, 15, { align: "center" });
    y = 35;

    // === STATUS BADGE ===
    doc.setFontSize(10);
    let statusColor: [number, number, number] = [34, 197, 94]; // green
    if (bookingData.bookingStatus === "cancelled") statusColor = [239, 68, 68]; // red
    if (bookingData.bookingStatus === "modified") statusColor = [234, 179, 8]; // yellow
    doc.setTextColor(...statusColor);
    doc.setFont("helvetica", "bold");
    const statusText = bookingData.bookingStatus
      ? bookingData.bookingStatus.charAt(0).toUpperCase() + bookingData.bookingStatus.slice(1)
      : "Unknown";
    doc.text(`STATUS: ${statusText}`, 20, y);
    doc.setTextColor(100);
    doc.setFont("helvetica", "normal");
    doc.text(`Booking Code: ${bookingData.bookingCode || bookingCode || "N/A"}`, pageWidth - 20, y, {
      align: "right",
    });
    y += 15;

    // === SPLIT INTO TWO COLUMNS (HOTEL INFO + STAY DETAILS) ===
    const colLeftX = 20;
    const colRightX = pageWidth / 2 + 10;
    let yLeft = y;
    let yRight = y;

    // --- LEFT: HOTEL INFO ---
    doc.setTextColor(25, 85, 150);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("HOTEL INFORMATION", colLeftX, yLeft);
    doc.line(colLeftX, yLeft + 2, colLeftX + 70, yLeft + 2);
    yLeft += 10;
    doc.setTextColor(50);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Hotel: ${bookingData.hotelName || "N/A"}`, colLeftX, yLeft);
    yLeft += 6;
    doc.text(`Property Code: ${bookingData.propertyCode || "N/A"}`, colLeftX, yLeft);
    yLeft += 6;
    doc.text(`Room Type: ${bookingData.roomTypeCode || "N/A"}`, colLeftX, yLeft);
    yLeft += 6;
    doc.text(`Rate Plan: ${bookingData.ratePlanCode || "N/A"}`, colLeftX, yLeft);

    // --- RIGHT: STAY DETAILS ---
    doc.setTextColor(25, 85, 150);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("STAY DETAILS", colRightX, yRight);
    doc.line(colRightX, yRight + 2, colRightX + 60, yRight + 2);
    yRight += 10;
    doc.setTextColor(50);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Check-In: ${bookingData.checkInDate ? new Date(bookingData.checkInDate).toDateString() : "N/A"}`, colRightX, yRight);
    yRight += 6;
    doc.text(`Check-Out: ${bookingData.checkOutDate ? new Date(bookingData.checkOutDate).toDateString() : "N/A"}`, colRightX, yRight);
    yRight += 6;
    doc.text(`Rooms: ${bookingData.finalPrice?.requestedRooms || 1}`, colRightX, yRight);
    yRight += 6;
    doc.text(`Nights: ${bookingData.finalPrice?.numberOfNights || 1}`, colRightX, yRight);

    // Start second row
    y = Math.max(yLeft, yRight) + 15;

    // === SPLIT INTO TWO COLUMNS (GUEST INFO + PAYMENT INFO) ===
    yLeft = y;
    yRight = y;

    // --- LEFT: GUEST INFO ---
    doc.setTextColor(25, 85, 150);
    doc.setFont("helvetica", "bold");
    doc.text("GUEST INFORMATION", colLeftX, yLeft);
    doc.line(colLeftX, yLeft + 2, colLeftX + 75, yLeft + 2);
    yLeft += 10;
    doc.setTextColor(50);
    doc.setFont("helvetica", "normal");
    // Check if guests array exists and has items
    if (bookingData.guests && bookingData.guests.length > 0) {
      bookingData.guests.forEach((guest: any, index: number) => {
        const guestName = `${guest.firstName || ""} ${guest.lastName || ""}`.trim();
        const guestType = guest.type ? guest.type.charAt(0).toUpperCase() + guest.type.slice(1) : "Unknown";
        doc.text(
          `${index + 1}. ${guestName || "N/A"} (${guestType})`,
          colLeftX + 5,
          yLeft
        );
        yLeft += 6;
      });
    } else {
      doc.text("No guest information available", colLeftX, yLeft);
      yLeft += 6;
    }
    yLeft += 8;
    doc.text(`Phone: +91${bookingData.bookingUserPhone || "N/A"}`, colLeftX, yLeft);
    yLeft += 6;
    doc.text(`Email: ${bookingData.bookingUserEmail || "N/A"}`, colLeftX, yLeft);

    // --- RIGHT: PAYMENT INFO ---
    doc.setTextColor(25, 85, 150);
    doc.setFont("helvetica", "bold");
    doc.text("PAYMENT INFORMATION", colRightX, yRight);
    doc.line(colRightX, yRight + 2, colRightX + 80, yRight + 2);
    yRight += 10;
    doc.setTextColor(50);
    doc.setFont("helvetica", "normal");

    // helper for payment rows with safe property access
    const addPaymentRow = (label: string, value: any, bold = false) => {
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.text(label, colRightX, yRight);
      // Format value safely
      let formattedValue = "N/A";
      if (value !== undefined && value !== null) {
        if (typeof value === "number") {
          formattedValue = value.toLocaleString("en-IN");
        } else if (typeof value === "string") {
          formattedValue = value;
        } else if (value instanceof Date) {
          formattedValue = value.toDateString();
        } else {
          formattedValue = String(value);
        }
      }
      doc.text(formattedValue, pageWidth - 20, yRight, { align: "right" });
      yRight += 6;
    };

    // Safely access all properties with fallbacks
    const paymentMethod = bookingData.paymentMethod
      ? bookingData.paymentMethod.replace(/_/g, " ").toLowerCase()
      : "N/A";
    const bookingDate = bookingData.bookedAt
      ? new Date(bookingData.bookedAt)
      : new Date();
    const amount = bookingData.amount || 0;
    const paidAmount = bookingData.paidAmount || 0;
    const extraAmountToPay = bookingData.extraAmountToPay || 0;
    const refundAmount = bookingData.refundAmount || 0;

    addPaymentRow("Method:", paymentMethod);
    addPaymentRow("Booking Date:", bookingDate);
    addPaymentRow("Total Amount:", `${amount} ${bookingData.currencyCode || "USD"}`, true);
    addPaymentRow("Amount Paid:", `${paidAmount} ${bookingData.currencyCode || "USD"}`, true);
    addPaymentRow("Extra amount to be Paid:", `${extraAmountToPay} ${bookingData.currencyCode || "USD"}`);
    addPaymentRow("Refundable Amount:", `${refundAmount} ${bookingData.currencyCode || "USD"}`, true);

    // Add subtotal and tax breakdown if available
    if (bookingData.finalPrice) {
      yRight += 3;
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text("--- Price Breakdown ---", colRightX, yRight);
      yRight += 6;
      addPaymentRow("Subtotal:", bookingData.finalPrice.subtotal);
      addPaymentRow("Taxes:", bookingData.finalPrice.totalTax);
      addPaymentRow("Total:", bookingData.finalPrice.totalAmount, true);
    }

    // === FOOTER ===
    const footerY = doc.internal.pageSize.getHeight() - 15;
    doc.setDrawColor(200);
    doc.line(20, footerY - 5, pageWidth - 20, footerY - 5);
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.setFont("helvetica", "normal");
    doc.text(
      "Thank you for booking with SwiftRooms. We look forward to hosting you!",
      centerX,
      footerY,
      { align: "center" }
    );

    const fileName = `booking-itinerary-${bookingData.bookingCode || bookingCode || "trip"}.pdf`;
    doc.save(fileName);
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

  // //console.log("bookingdata", bookingData)

  return (
    <div className="min-h-screen bg-gray-100 px-4 pt-32 py-12 flex flex-col items-center">
      <Toaster position="top-center" />
      {/* Search Bar Section - Always at the top */}
      <div className="w-full max-w-3xl mb-10">
        <h1 className="text-4xl font-bold text-center mb-8" style={{ color: colors.primaryColor }}>
          Find Your Booking
        </h1>
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <input
            ref={inputRef}
            type="text"
            value={bookingCode}
            onChange={(e) => setBookingCode(e.target.value.toUpperCase())}
            onKeyDown={handleKeyPress}
            placeholder="Enter your booking code (e.g., SR123456)"
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
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
        <p className="text-center text-gray-600 mt-4">
          Not sure where to find your code? Check your confirmation email.
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
                {bookingData.bookingStatus}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 px-6 gap-6 text-gray-700 text-sm pb-2">
            <div>
              <p className="text-gray-500 font-medium">Check-in</p>
              <p className="text-green-700">
                {new Date(bookingData.checkInDate).toDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Check-out</p>
              <p className="text-green-700">
                {new Date(bookingData.checkOutDate).toDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Room Type</p>
              <p>
                <FaBed className="inline mr-1" /> {bookingData.roomTypeCode}
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Payment Method</p>
              <p className="text-purple-700 capitalize">
                {bookingData.paymentMethod?.replace(/_/g, ' ') || "Pay at Hotel"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Primary Guest</p>
              <p>
                <FaUser className="inline mr-1" />{" "}
                {`${bookingData.guests[0].firstName} ${bookingData.guests[0].lastName}`}
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Rate</p>
              <p className="text-blue-700 font-semibold">
                USD {bookingData.amount.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-4 p-6">
            {/* View Booking Details Button */}
            <button
              onClick={() => setShowModal(true)}
              className="text-white px-4 py-2 rounded-md font-medium shadow hover:opacity-90 w-full"
              style={{
                background: `linear-gradient(to right, ${colors.primaryColor}, ${colors.tertiaryColor})`,
                color: colors.buttonTextColor
              }}
            >
              <HiOutlineViewGridAdd className="inline mr-2" /> View Booking
              Details
            </button>
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
                    <FaEdit className="inline mr-2 mb-1" /> Modify
                  </button>
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="border px-4 py-2 rounded-md font-medium text-red-600 border-red-500 hover:bg-red-50 w-full"
                  >
                    <GiCancel className="inline mr-2 mb-1" />
                    Cancel
                  </button>
                </div>
              )}
          </div>
        </div>
      )}

      {/* MODAL */}
      {showModal && bookingData && (
        <div className="fixed inset-0 py-8 bg-black bg-opacity-50 backdrop-blur-sm flex overflow-y-auto justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-xl relative animate-fadeIn max-h-[90vh] overflow-y-auto">
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
                  Booking Code: {bookingData.bookingCode}
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
                {bookingData.bookingStatus.charAt(0).toUpperCase() + bookingData.bookingStatus.slice(1)}
              </span>
            </div>
            {/* Details */}
            <div className="space-y-6 text-sm text-gray-700 px-6 sm:px-8 pb-6">
              {/* Stay Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold flex items-center gap-2 mb-3" style={{ color: colors.primaryColor }}>
                  <FaCalendarAlt style={{ color: colors.primaryColor }} /> Stay Details
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Check-In</p>
                    <p className="text-green-600 font-semibold">
                      {new Date(bookingData.checkInDate).toLocaleDateString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Check-Out</p>
                    <p className="text-red-600 font-semibold">
                      {new Date(bookingData.checkOutDate).toLocaleDateString("en-US", {
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
                    <p className="text-gray-500 text-sm font-medium">Room Type</p>
                    <span
                      className="inline-block px-3 py-1 rounded-sm text-xs font-semibold"
                      style={{
                        backgroundColor: colors.secondaryColor,
                        color: colors.buttonTextColor
                      }}
                    >
                      {bookingData.roomTypeCode}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Rooms</p>
                    <p className="text-gray-800 font-medium">
                      {bookingData.finalPrice?.requestedRooms || 1}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Rate Plan</p>
                    <p className="text-gray-800 font-medium">
                      {bookingData.ratePlanCode}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Nights</p>
                    <p className="text-gray-800 font-medium">
                      {bookingData.finalPrice?.numberOfNights || 1}
                    </p>
                  </div>
                </div>
              </div>
              {/* Guest Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold flex items-center gap-2 mb-3" style={{ color: colors.primaryColor }}>
                  <FaUser style={{ color: colors.primaryColor }} /> Guest Details
                </h4>
                <div className="space-y-2">
                  {bookingData.guests.map((guest: any, index: number) => (
                    <div
                      key={index}
                      className="grid grid-cols-2 gap-4 border-b pb-2 last:border-none"
                    >
                      <div>
                        <p className="text-gray-500 text-sm font-medium">Name</p>
                        <p className="text-gray-800 font-medium">
                          {guest.firstName} {guest.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm font-medium">Type</p>
                        <p className="text-gray-800 font-medium">
                          {guest.type.charAt(0).toUpperCase() + guest.type.slice(1)}
                        </p>
                      </div>
                      {guest.dateOfBirth && (
                        <div className="col-span-2">
                          <p className="text-gray-500 text-sm font-medium">Date of Birth</p>
                          <p className="text-gray-800">
                            {new Date(guest.dateOfBirth).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Contact Number</p>
                    <span className="font-medium text-gray-800">
                      +91{bookingData.bookingUserPhone}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Email</p>
                    <span className="font-medium text-gray-800">
                      {bookingData.bookingUserEmail}
                    </span>
                  </div>
                </div>
                {/* Primary Guest Details if available */}
                {bookingData.primaryGuest && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm font-semibold text-blue-800 mb-1">Primary Guest</p>
                    <p className="text-gray-700">
                      {bookingData.primaryGuest.firstName} {bookingData.primaryGuest.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      Phone: {bookingData.primaryGuest.phoneNumber}
                    </p>
                  </div>
                )}
              </div>
              {/* Payment Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold flex items-center gap-2 mb-3" style={{ color: colors.primaryColor }}>
                  <FaCreditCard style={{ color: colors.primaryColor }} /> Payment Details
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Payment Method</p>
                    <p className="capitalize text-gray-800">
                      {bookingData.paymentMethod?.replace(/_/g, ' ') || "Pay at Hotel"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Booking Date</p>
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
                    <p className="text-gray-500 text-sm font-medium">Currency</p>
                    <p className="text-gray-800">{bookingData.currencyCode}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Booking Source</p>
                    <p className="text-gray-800 uppercase">{bookingData.bookingSource}</p>
                  </div>
                </div>
                {/* Price Breakdown */}
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-gray-600">Subtotal</p>
                    <p className="font-medium">
                      ${bookingData.finalPrice?.subtotal?.toLocaleString() || bookingData.amount.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-gray-600">Taxes</p>
                    <p className="font-medium">
                      ${bookingData.finalPrice?.totalTax?.toLocaleString() || "0"}
                    </p>
                  </div>
                  <div className="flex justify-between items-center border-t pt-2">
                    <p className="text-gray-800 font-semibold">Total Amount</p>
                    <p className="text-blue-700 font-bold text-lg">
                      ${bookingData.amount.toLocaleString()}
                    </p>
                  </div>
                  {bookingData.paidAmount !== undefined && (
                    <div className="flex justify-between items-center">
                      <p className="text-gray-600">Paid Amount</p>
                      <p className="font-medium text-green-600">
                        ${bookingData.paidAmount.toLocaleString()}
                      </p>
                    </div>
                  )}
                  {bookingData.extraAmountToPay !== undefined && (
                    <div className="flex justify-between items-center">
                      <p className="text-gray-600">Extra to Pay</p>
                      <p className="font-medium text-orange-600">
                        ${bookingData.extraAmountToPay.toLocaleString()}
                      </p>
                    </div>
                  )}
                  {bookingData.refundAmount !== undefined && (
                    <div className="flex justify-between items-center">
                      <p className="text-gray-600">Refundable Amount</p>
                      <p className="font-medium text-green-600">
                        ${bookingData.refundAmount.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
                {/* Daily Breakdown if available */}
                {bookingData.finalPrice?.dailyBreakdown && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Daily Rate Breakdown:</p>
                    {bookingData.finalPrice.dailyBreakdown.map((day: any, index: number) => (
                      <div key={index} className="flex justify-between items-center text-sm border-b py-2 last:border-0">
                        <div>
                          <p className="font-medium">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</p>
                          <p className="text-gray-500 text-xs">{new Date(day.date).toLocaleDateString()}</p>
                        </div>
                        <p className="font-semibold">${day.baseRate.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Additional Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-3" style={{ color: colors.primaryColor }}>Additional Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Property Code</p>
                    <p className="text-gray-800 font-medium">{bookingData.propertyCode}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Promo Used</p>
                    <p className="text-gray-800">{bookingData.isPromoUsed ? "Yes" : "No"}</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Buttons */}
            <div className="sticky bottom-0 bg-white border-t p-4">
              <div className="flex flex-col sm:flex-row gap-3">
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
                        <FaEdit /> Modify
                      </button>
                    </div>
                    <div className="w-full sm:w-auto flex-1">
                      <button
                        onClick={() => setShowCancelModal(true)}
                        className="border px-4 py-3 rounded-md font-medium text-red-600 border-red-500 hover:bg-red-50 w-full flex items-center justify-center gap-2"
                      >
                        <GiCancel />
                        Cancel
                      </button>
                    </div>
                  </>
                )}
                <div className="w-full sm:w-auto flex-1">
                  <button
                    onClick={handleDownloadPDF}
                    className="bg-gray-800 text-white px-4 py-3 rounded-md hover:bg-gray-900 w-full flex items-center justify-center gap-2 transition-colors"
                  >
                    <FaPrint /> Print Itinerary
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
          bookingData={bookingData} // ✅ pass full data
          onClose={() => setShowUpdateModal(false)}
          onUpdate={handleSearch} // or refreshBooking if needed
        />
      )}
    </div>
  );
}
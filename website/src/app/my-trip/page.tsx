"use client";

import CancelModal from "../../components/BookingModals/CancelModal";
import ModifyBookingModal from "@/src/components/BookingModals/ModifyBookingmodal";
import { useEffect, useState } from "react";
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
} from "react-icons/fa";
import { GiCancel } from "react-icons/gi";
import { HiOutlineViewGridAdd } from "react-icons/hi";

export default function MyTripPage() {
  const [bookingCode, setBookingCode] = useState("");
  const [bookingData, setBookingData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const dispatch = useDispatch();
  

  const handleSearch = async () => {
    if (!bookingCode.trim()) {
      toast.error("Please enter a booking code");
      return;
    }

    setLoading(true);
    setBookingData(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/booking/my-trip?code=${bookingCode}`
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Booking not found");

      setBookingData(data.data); // ✅ local state
      dispatch(setBookingViewData(data.data)); // ✅ global redux state

      toast.success("Booking found!");
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
  const searchParams = useSearchParams();


  useEffect(() => {
    const codeFromUrl = searchParams.get("code");
    if (!codeFromUrl) return;

    setBookingCode(codeFromUrl); // for input field

    const fetchFromUrl = async () => {
      setLoading(true);
      setBookingData(null);

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/booking/my-trip?code=${codeFromUrl}`
        );
        const data = await res.json();
        console.log(data)
        if (!res.ok) throw new Error(data.message || "Booking not found");

        setBookingData(data.data);
        dispatch(setBookingViewData(data.data));
        toast.success("Booking found!");
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
  if (bookingData.status === "Cancelled") statusColor = [239, 68, 68]; // red
  if (bookingData.status === "Modified") statusColor = [234, 179, 8]; // yellow

  doc.setTextColor(...statusColor);
  doc.setFont("helvetica", "bold");
  doc.text(`STATUS: ${bookingData.status}`, 20, y);

  doc.setTextColor(100);
  doc.setFont("helvetica", "normal");
  doc.text(`Booking Code: ${bookingCode || "N/A"}`, pageWidth - 20, y, {
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
  doc.text(`Hotel: ${bookingData.hotelName || bookingData.property?.name}`, colLeftX, yLeft);
  yLeft += 6;
  doc.text(`Room Type: ${bookingData.roomTypeCode}`, colLeftX, yLeft);

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
  doc.text(`Check-In: ${new Date(bookingData.checkInDate).toDateString()}`, colRightX, yRight);
  yRight += 6;
  doc.text(`Check-Out: ${new Date(bookingData.checkOutDate).toDateString()}`, colRightX, yRight);
  yRight += 6;
  doc.text(`Rooms: ${bookingData.finalPrice?.requestedRooms || 1}`, colRightX, yRight);

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
  bookingData.guests.forEach((guest: any, index: number) => {
    doc.text(
      `${index + 1}. ${guest.firstName} ${guest.lastName} (${guest.type})`,
      colLeftX + 5,
      yLeft
    );
    yLeft += 6;
  });

  yLeft += 8;
  doc.text(`Phone: +91${bookingData.bookingUserPhone}`, colLeftX, yLeft);
  yLeft += 6;
  doc.text(`Email: ${bookingData.bookingUserEmail}`, colLeftX, yLeft);

  // --- RIGHT: PAYMENT INFO ---
  doc.setTextColor(25, 85, 150);
  doc.setFont("helvetica", "bold");
  doc.text("PAYMENT INFORMATION", colRightX, yRight);
  doc.line(colRightX, yRight + 2, colRightX + 80, yRight + 2);

  yRight += 10;
  doc.setTextColor(50);
  doc.setFont("helvetica", "normal");

  // helper for payment rows
  const addPaymentRow = (label: string, value: string, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.text(label, colRightX, yRight);
    doc.text(value, pageWidth - 20, yRight, { align: "right" });
    yRight += 6;
  };

  addPaymentRow("Method:", bookingData.paymenttype || "N/A");
  addPaymentRow("Booking Date:", new Date(bookingData.bookingdates).toDateString());
  addPaymentRow("Total Amount:", `${bookingData.amount.toLocaleString("en-IN")}`, true);
  addPaymentRow("Amount Paid:", `${bookingData.paidamount.toLocaleString("en-IN")}`, true);
  addPaymentRow("Extra amount to be Paid(Check-in):", `${bookingData.extraamounttopay.toLocaleString("en-IN")}`);
  addPaymentRow("Refundable Amount:", `${bookingData.refundamount.toLocaleString("en-IN")}`, true);

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

  doc.save(`booking-itinerary-${bookingData.bookingCode || "trip"}.pdf`);
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

console.log("bookingdata",bookingData)

  return (
    <div className="min-h-screen bg-gray-100 px-4 pt-32 py-12 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6 text-blue-800">
        Find Your Booking
      </h1>
      {bookingData && (
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl border border-gray-200 transition-all duration-300">
          <div className="relative flex items-center mb-4">
            <div className="bg-gradient-to-r w-full from-blue-500 to-indigo-600 rounded-t-lg p-3 shadow-md">
              <h2 className="text-2xl font-semibold gap-2 flex text-white">
                🏨 {bookingData?.hotelName || ""}
              </h2>
            </div>

            {/* Status Badge */}
            <div className="absolute sm:top-3 top-10 sm:right-4 right-2">
              <span
                className={`text-xs font-semibold   px-3 py-1 rounded-full
        ${bookingData.status === "Cancelled"
                    ? "bg-red-100 text-red-600"
                    : bookingData.status === "Modified"
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-green-100 text-green-600"
                  }
      `}
              >
                {bookingData.status}
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
                {bookingData.paymenttype || "Pay at Hotel"}
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
                INR {bookingData.amount.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 p-6">
            {/* View Booking Details Button */}
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-blue-700 to-blue-900 text-white px-4 py-2 rounded-md font-medium shadow hover:opacity-90 w-full"
            >
              <HiOutlineViewGridAdd className="inline mr-2" /> View Booking
              Details
            </button>

            {/* Modify & Cancel Buttons */}
            {(bookingData.status === "Confirmed" ||
              bookingData.status === "Modified") && (
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => setShowUpdateModal(true)}
                    className="border px-4 py-2 rounded-md font-medium text-indigo-600 border-blue-500 hover:bg-blue-50 w-full"
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
        <div className="fixed inset-0 py-8  bg-black bg-opacity-50 backdrop-blur-sm flex overflow-y-auto justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-xl relative animate-fadeIn max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-1 right-4 text-gray-100 hover:text-gray-500 text-4xl"
            >
              &times;
            </button>

            {/* Header with Glossy Badge */}
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 w-full text-white rounded-t-lg p-3  shadow-md">
                <h3 className="text-2xl font-bold text-white">
                  🏨 {bookingData?.hotelName || ""}
                </h3>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-2 text-sm text-gray-700 px-6 sm:px-8">
              {/* Stay Details */}
              <div>
                <h4 className="text-lg font-semibold text-blue-900 flex items-center gap-2 mb-3">
                  <FaCalendarAlt className="text-blue-600" /> Stay Details
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">
                      Check-In
                    </p>
                    <p className="text-green-600 font-semibold">
                      {new Date(bookingData.checkInDate).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm font-medium">
                      Check-Out
                    </p>
                    <p className="text-red-600 font-semibold">
                      {new Date(bookingData.checkOutDate).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">
                      Room Type
                    </p>
                    <span className="inline-block bg-blue-100 text-blue-700 font-semibold px-3 py-1 rounded-sm text-xs">
                      {bookingData.roomTypeCode}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Rooms</p>
                    <p className="text-gray-800 font-medium">
                      {bookingData.finalprice?.requestedRooms || 1}
                    </p>
                  </div>
                </div>
              </div>

              {/* Guest Details */}
              <div>
                <h4 className="text-lg font-semibold text-blue-900 flex items-center gap-2 mb-3">
                  <FaUser className="text-blue-600" /> Guest Details
                </h4>
                <div className="space-y-2">
                  {bookingData.guests.map((guest: any, index: number) => (
                    <div
                      key={guest._id}
                      className="grid grid-cols-2 gap-4 border-b pb-2 last:border-none"
                    >
                      <div>
                        <p className="text-gray-500 text-sm font-medium">
                          Name
                        </p>
                        <p className="text-gray-800 font-medium">
                          {guest.firstName} {guest.lastName}
                        </p>
                      </div>
                      <div>
                      <p className="text-gray-800 font-medium">{guest.type.charAt(0).toUpperCase() + guest.type.slice(1)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className=" grid grid-cols-2">
                  <div className="mt-2 text-sm text-gray-600">
                    Contact Number <br />
                    <span className="font-medium text-gray-800">
                      +91{bookingData.bookingUserPhone}
                    </span>
                  </div>
                  <div className="mt-2 ml-2 text-sm text-gray-600">
                    Email <br />
                    <span className="font-medium text-gray-800">
                      {bookingData.bookingUserEmail}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div>
                <h4 className="text-lg font-semibold text-blue-900 flex items-center gap-2 mb-3">
                  <FaCreditCard className="text-blue-600" /> Payment Details
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">
                      Payment Method
                    </p>
                    <p className="capitalize text-gray-800">
                      {bookingData.paymentType}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm font-medium">
                      Booking Date
                    </p>
                    <p className="text-gray-800">
                      {new Date(bookingData.bookingDates).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </div>
                <div className="mt-4 text-xl font-bold text-blue-700">
                  Total Amount: ₹{bookingData.amount.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-3 flex flex-col sm:flex-row gap-3 p-4">
              {(bookingData.status === "Confirmed" ||
                bookingData.status === "Modified") && (
                  <>
                    <div className="w-full sm:w-auto flex-1">
                      <button
                        onClick={() => setShowUpdateModal(true)}
                        className="border px-4 py-2 rounded-md font-medium text-indigo-600 border-blue-500 hover:bg-blue-50 w-full"
                      >
                        <FaEdit className="inline mr-2 mb-1" /> Modify
                      </button>
                    </div>

                    <div className="w-full sm:w-auto flex-1">
                      <button
                        onClick={() => setShowCancelModal(true)}
                        className="border px-4 py-2 rounded-md font-medium text-red-600 border-red-500 hover:bg-red-50 w-full"
                      >
                        <GiCancel className="inline mr-2 mb-1" />
                        Cancel
                      </button>
                    </div>
                  </>
                )}

              <div className="w-full sm:w-auto flex-1">
                <button
                  onClick={handleDownloadPDF}
                className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-800 w-full">
                  <FaPrint className="inline mr-1 mb-1" /> Print Itinerary
                </button>
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
            toast.success("Booking cancelled");
            setShowCancelModal(false);
            setBookingData((prevBookingData: any) => {
              if (!prevBookingData) return prevBookingData;
              return { ...prevBookingData, status: "Cancelled" };
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

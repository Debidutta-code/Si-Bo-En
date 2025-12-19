"use client";

import { FC, useState, useMemo, useEffect } from "react";
import { FaHotel, FaBed, FaCalendarAlt, FaRupeeSign } from "react-icons/fa";
import { X } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  bookingData: any;
  onClose: () => void;
  onCancel: () => void;
}

const CancelModal: FC<Props> = ({ bookingData, onClose, onCancel }) => {
  const {
    bookingCode,
    property,
    roomTypeCode,
    checkInDate,
    checkOutDate,
    amount,
    currencyCode,
  } = bookingData;
// console.log("bookingdatsdfsjdfhcdsa",bookingData)
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

 const handleCancellation = async () => {
  setLoading(true);
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/booking/cancel/${bookingData.bookingCode}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason,
          bookingCode,
          property,
          roomTypeCode,
          checkInDate,
          checkOutDate,
          amount,
          currencyCode,
          ...bookingData, // 👈 includes email, guestDetails, hotelName etc. if present
        }),
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Cancellation failed");

    toast.success("Booking cancelled successfully! Please check Your Email ");
    onCancel();
  } catch (err: any) {
    toast.error(err.message || "Something went wrong");
  } finally {
    setLoading(false);
  }
};

  const refundInfo = useMemo(() => {
    const today = new Date();
    const checkIn = new Date(checkInDate);
    const diffDays = Math.ceil(
      (checkIn.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays > 5) return { label: "💯 Full refund", refund: 100 };
    if (diffDays > 1) return { label: "🔁 50% refund", refund: 50 };
    return { label: "❌ No refund", refund: 0 };
  }, [checkInDate]);


  useEffect(() => {
  // Disable background scroll
  document.body.classList.add("overflow-hidden");

  return () => {
    // Re-enable scroll when modal unmounts
    document.body.classList.remove("overflow-hidden");
  };
}, []);

  return (
  <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 overflow-y-auto py-8">
  <div className="bg-white rounded-xl shadow-lg w-full max-w-xl p-6 space-y-6 relative max-h-[90vh] overflow-y-auto">
    {/* Close Button */}
    <button
      onClick={onClose}
      disabled={loading}
      className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
    >
      <X size={24} />
    </button>

    {/* Header */}
    <div className="text-center text-yellow-600">
      <h2 className="text-xl font-bold">⚠ Confirm Cancellation</h2>
      <p className="text-sm text-gray-600">
        Please review the details below before proceeding with your cancellation.
      </p>
    </div>

    {/* Booking Details */}
    <div className="border rounded-lg p-4 bg-gray-50">
      <p className="text-gray-700 font-semibold mb-2">Booking Details</p>
      <div className="text-sm space-y-2 text-gray-700">
        <div className="flex items-center gap-2">
          <FaHotel /> <span>{property?.name || "Hotel"}</span>
        </div>
        <div className="flex items-center gap-2">
          <FaCalendarAlt />
          <span>
            {new Date(checkInDate).toDateString()} -{" "}
            {new Date(checkOutDate).toDateString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <FaBed /> <span>Room: {roomTypeCode}</span>
        </div>
        <div className="flex items-center gap-2">
          <FaRupeeSign />
          <span>Total: ₹{amount.toLocaleString()}</span>
        </div>
      </div>
    </div>

    {/* Cancellation Policy */}
    <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-2">
        <h4 className="font-semibold text-blue-700">
          Moderate Cancellation Policy
        </h4>
        <span className="text-xs bg-blue-100 px-2 py-1 rounded-full text-blue-700 font-semibold">
          {refundInfo.refund}% Refund Eligible
        </span>
      </div>
      <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
        <li>💯 Full refund: If cancelled 5+ days before check-in</li>
        <li>🔁 50% refund: If cancelled 1–5 days before check-in</li>
        <li>❌ No refund: If cancelled within 24 hours of check-in</li>
      </ul>
      <p className="text-sm text-red-600 mt-3 font-medium">
        Your Refund Status: {refundInfo.label}
      </p>
    </div>

    {/* Financial Breakdown */}
    <div className="bg-gray-50 p-4 rounded-lg">
      <p className="font-medium text-gray-700 mb-2">Financial Breakdown</p>
      <div className="text-sm space-y-1">
        <p className="flex justify-between">
          <span>Original Payment Amount:</span>
          <span className="font-semibold text-gray-800">
            ₹{amount.toLocaleString()}
          </span>
        </p>
        <p className="flex justify-between">
          <span>Refund Amount:</span>
          <span className="font-semibold text-green-600">
            ₹{Math.round((amount * refundInfo.refund) / 100).toLocaleString()}
          </span>
        </p>
        <p className="flex justify-between">
          <span>Cancellation Fee:</span>
          <span className="font-semibold text-red-500">
            ₹{Math.round(amount - (amount * refundInfo.refund) / 100).toLocaleString()}
          </span>
        </p>
      </div>
    </div>

    {/* Reason for Cancellation */}
    <div>
      <label className="text-sm font-medium text-gray-700 mb-1 block">
        Reason for Cancellation (optional)
      </label>
      <textarea
        rows={3}
        placeholder="Please tell us why you’re cancelling..."
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="w-full border border-gray-300 resize-none rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={loading}
      />
    </div>

    {/* Warning */}
    <div className="text-xs text-yellow-800 bg-yellow-100 border border-yellow-300 p-3 rounded-md">
      <strong>Note:</strong> This action cannot be undone. Once cancelled, your
      reservation cannot be reinstated.
    </div>

    {/* Buttons */}
    <div className="flex flex-col sm:flex-row gap-3 pt-2">
      <button
        onClick={onClose}
        disabled={loading}
        className="w-full bg-gray-200 text-gray-800 py-2 rounded-md font-medium hover:bg-gray-300 transition"
      >
        ⬅ Keep My Reservation
      </button>
      <button
        onClick={handleCancellation}
        disabled={loading}
        className="w-full bg-red-600 text-white py-2 rounded-md font-semibold hover:bg-red-700 transition"
      >
        {loading ? "Cancelling..." : "Confirm Cancellation"}
      </button>
    </div>
  </div>
</div>

  );
};

export default CancelModal;

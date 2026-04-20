"use client";

import { FC, useState, useMemo, useEffect } from "react";
import { FaHotel, FaBed, FaCalendarAlt, FaRupeeSign, FaMoneyBill } from "react-icons/fa";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { useBookingStorage } from "@/src/hooks/useBookingStorage"; // Add this import
import { currencies } from "../currencyCode/cuurency";
import { useTranslation } from "react-i18next";

interface Props {
  bookingData: any;
  onClose: () => void;
  onCancel: () => void;
}

const CancelModal: FC<Props> = ({ bookingData, onClose, onCancel }) => {
  const { t } = useTranslation();
  const {
    bookingCode,
    property,
    roomTypeCode,
    amount,
    currencyCode,
    hotelName,
    reservationStartDate,
    reservationEndDate,
  } = bookingData;
  console.log("bookingdatsdfsjdfhcdsa", bookingData)
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  // Add the hook usage at the component level
  const { colors } = useBookingStorage({}); // You may need to pass actual bookingContext if available

  const handleCancellation = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/front-office/reservations/cancel/${bookingData.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reason,
            bookingCode,
            property,
            roomTypeCode,
            reservationStartDate,
            reservationEndDate,
            amount,
            currencyCode,
            ...bookingData, // 👈 includes email, guestDetails, hotelName etc. if present
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Cancellation failed");

      if (data.refund) {
        if (data.refund.success) {
          toast.success(t("CancelModal.successWithRefund"), { duration: 4000 });
        } else {
          toast.error(t("CancelModal.successNoRefund"), { duration: 6000 });
        }
      } else {
        toast.success(t("CancelModal.successCancelled"));
      }

      onCancel();
    } catch (err: any) {
      toast.error(err.message || t("CancelModal.somethingWentWrong"));
    } finally {
      setLoading(false);
    }
  };

  const refundInfo = useMemo(() => {
    const today = new Date();
    const checkIn = new Date(reservationStartDate);
    const diffDays = Math.ceil(
      (checkIn.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays > 5) return { label: "💯 Full refund", refund: 100 };
    if (diffDays > 1) return { label: "🔁 50% refund", refund: 50 };
    return { label: "❌ No refund", refund: 0 };
  }, [reservationStartDate]);
console.log("property",property)

  useEffect(() => {
    // Disable background scroll
    document.body.classList.add("overflow-hidden");

    return () => {
      // Re-enable scroll when modal unmounts
      document.body.classList.remove("overflow-hidden");
    };
  }, []);
    const getCurrencySymbol = (code: string) =>
    currencies.find((c) => c.code === code)?.symbol ?? code;
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
        <div className="text-center" style={{ color: colors.primaryColor }}>
          <h2 className="text-xl font-bold">{t("CancelModal.title")}</h2>
          <p className="text-sm text-gray-600">{t("CancelModal.subtitle")}</p>
        </div>

        {/* Booking Details */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <p className="font-semibold mb-2" style={{ color: colors.primaryColor }}>{t("CancelModal.bookingDetails")}</p>
          <div className="text-sm space-y-2 text-gray-700">
            <div className="flex items-center gap-2">
              <FaHotel style={{ color: colors.primaryColor }} /> <span>{hotelName || t("CancelModal.hotel")}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCalendarAlt style={{ color: colors.primaryColor }} />
              <span>
                {new Date(reservationStartDate).toDateString()} -{" "}
                {new Date(reservationEndDate).toDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FaBed style={{ color: colors.primaryColor }} /> <span>{t("CancelModal.room")} {roomTypeCode}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaMoneyBill style={{ color: colors.primaryColor }} />
              <span>{t("CancelModal.total")} {getCurrencySymbol(currencyCode)} {amount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="font-medium mb-2" style={{ color: colors.primaryColor }}>{t("CancelModal.financialBreakdown")}</p>
          <div className="text-sm space-y-1">
            <p className="flex justify-between">
              <span>{t("CancelModal.originalPayment")}:</span>
              <span className="font-semibold text-gray-800">
                {getCurrencySymbol(currencyCode)} {amount.toLocaleString()}
              </span>
            </p>
          </div>
        </div>

        {/* Reason for Cancellation */}
        <div>
          <label className="text-sm font-medium mb-1 block" style={{ color: colors.primaryColor }}>
            {t("CancelModal.reasonLabel")}
          </label>
          <textarea
            rows={3}
            placeholder={t("CancelModal.reasonPlaceholder")}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border border-gray-300 resize-none rounded-md text-sm focus:outline-none focus:ring-2 p-2"
            style={{
              borderColor: colors.tertiaryColor,
              // focusBorderColor: colors.primaryColor,
              // focusRingColor: colors.primaryColor
            }}
            disabled={loading}
          />
        </div>

        {/* Warning */}
        <div className="text-xs text-yellow-800 bg-yellow-100 border border-yellow-300 p-3 rounded-md">
          <strong>{t("CancelModal.warning")}</strong> {t("CancelModal.warningText")}
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="w-full text-gray-800 py-2 rounded-md font-medium hover:opacity-90 transition"
            style={{
              backgroundColor: colors.secondaryColor,
              color: colors.buttonTextColor
            }}
          >
            {t("CancelModal.keepReservation")}
          </button>
          <button
            onClick={handleCancellation}
            disabled={loading}
            className="w-full bg-red-600 text-white py-2 rounded-md font-semibold hover:bg-red-700 transition"
          >
            {loading ? t("CancelModal.cancelling") : t("CancelModal.confirmCancellation")}
          </button>
        </div>
      </div>
    </div>

  );
};

export default CancelModal;
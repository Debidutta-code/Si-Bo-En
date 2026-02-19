"use client";
import React, { useState } from "react";
import { CheckCircle, DollarSign, CreditCard } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

interface PriceDetailsProps {
  bookingDetails: any;
  onPriceUpdate: (totalAmount: number, discount: number, promo?: any) => void;
}

const PriceDetails: React.FC<PriceDetailsProps> = ({ bookingDetails, onPriceUpdate }) => {
  const [promo, setPromo] = useState("");
  const [loading, setLoading] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(
    bookingDetails?.finalPrice?.totalAmount || 0
  );

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);

  const getDeviceType = () => {
    if (typeof window === "undefined") return "Desktop";
    const width = window.innerWidth;
    if (width < 768) return "Mobile";
    if (width >= 768 && width < 1024) return "Tablet";
    return "Desktop";
  };

  const handleApply = async () => {
    if (!promo) {
      toast.error("Please enter a promo code");
      return;
    };
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/property/promocode/validate`,
        {
          data: {
            promoCode: promo,
            propertyId: bookingDetails.propertyDetails?.id,
            Devicetype: getDeviceType(),
            bookingDetails,
          },
        }
      );

      const data = response.data;

      if (data.success) {
        const newDiscount = data.data.discount || 0;
        const newTotal = data.data.finalprice || bookingDetails.finalPrice?.totalAmount || 0;

        setDiscount(newDiscount);
        setTotalPrice(newTotal);

        // ✅ Send updates back to parent with promo details
        onPriceUpdate(newTotal, newDiscount, data.data.promo);

        toast.success(data.message || "Promo code applied!");
      } else {
        setDiscount(0);
        const fallbackTotal = bookingDetails.finalPrice?.totalAmount || 0;
        setTotalPrice(fallbackTotal);

        // Reset parent state
        onPriceUpdate(fallbackTotal, 0);

        toast.error(data.message || "Invalid promo code");
      }
    } catch (err: any) {
      console.error("Promo code validation error:", err);
      const fallbackTotal = bookingDetails.finalPrice?.totalAmount || 0;

      setDiscount(0);
      setTotalPrice(fallbackTotal);

      // Reset parent state
      onPriceUpdate(fallbackTotal, 0);

      toast.error(err?.response?.data?.message || "Something went wrong. Try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
      <h2 className="text-lg font-semibold text-orange-600 mb-4">Price Details</h2>

      {/* Promo Code Section */}
      <div className="bg-orange-50 p-3 rounded-xl mb-4">
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            value={promo}
            onChange={(e) => setPromo(e.target.value)}
            placeholder="Enter promo code"
            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            onClick={handleApply}
            disabled={loading}
            className={`px-4 py-2 rounded-lg font-medium text-white transition ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-orange-600 hover:bg-orange-700"
            }`}
          >
            {loading ? "Applying..." : "Apply"}
          </button>
        </div>
        {discount > 0 && (
          <p className="mt-2 text-green-700 text-sm">
            Promo applied! You saved {formatCurrency(discount)}
          </p>
        )}
      </div>

      {/* Total Amount */}
      <div className="flex justify-between items-center text-base border-t pt-3">
        <span className="font-semibold text-gray-900">Total Amount</span>
        <span className="font-bold text-orange-600 text-xl">{formatCurrency(totalPrice)}</span>
      </div>

      {/* Secure Payment */}
      <div className="mt-4 text-xs text-gray-700 bg-orange-50 p-3 rounded-xl">
        <strong>Secure Payment:</strong> Your payment information is encrypted and secure.
      </div>

      {/* Payment Methods */}
      <div className="mt-4 flex flex-wrap gap-2 gap-x-4 items-center">
        <div className="flex gap-2 items-center text-gray-700 text-xs">
          <DollarSign className="h-6 w-6" />
          <span>Stripe</span>
        </div>
        <div className="flex gap-2 items-center text-orange-600 text-xs">
          <CreditCard className="h-6 w-6" />
          <span>Visa</span>
        </div>
        <div className="flex gap-2 items-center text-orange-600 text-xs">
          <CreditCard className="h-6 w-6" />
          <span>Mastercard</span>
        </div>
      </div>
    </div>
  );
};

export default PriceDetails;

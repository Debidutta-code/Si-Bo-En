"use client";
import React, { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { currencies } from "../currencyCode/cuurency";

interface PriceDetailsProps {
  bookingDetails: any;
  onPriceUpdate: (totalAmount: number, discount: number, promo?: any) => void;
}

// ── Image Links (Reliable CDN hosted SVGs) ────────────────────────────────────

const VisaIcon = () => (
  <img 
    src="https://cdn.simpleicons.org/visa/1434CB" 
    alt="Visa" 
    className="h-full w-full object-contain"
  />
);
const MastercardIcon = () => (
  <img 
    src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" 
    alt="Mastercard" 
    className="h-full w-full object-contain"
  />
);

const PayPalIcon = () => (
  <img 
    src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" 
    alt="PayPal" 
    className="h-full w-full object-contain"
  />
);

const GooglePayIcon = () => (
  <img 
    src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" 
    alt="Google Pay" 
    className="h-full w-full object-contain"
  />
);

const ApplePayIcon = () => (
  <img 
    src="https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg" 
    alt="Apple Pay" 
    className="h-full w-full object-contain"
  />
);

const PAYMENT_METHODS = [
  { id: "apple-pay",   Icon: ApplePayIcon },
  { id: "google-pay",  Icon: GooglePayIcon },
  { id: "paypal",      Icon: PayPalIcon },
  { id: "visa",        Icon: VisaIcon },
  { id: "mastercard",  Icon: MastercardIcon },
];

const PriceDetails: React.FC<PriceDetailsProps> = ({ bookingDetails, onPriceUpdate }) => {
  const [promo, setPromo] = useState("");
  const [loading, setLoading] = useState(false);
  const [discount, setDiscount] = useState(0);
const [totalPrice, setTotalPrice] = useState<number>(
    bookingDetails?.finalPrice?.totalAmount || 0
  );

const currencyCode = bookingDetails?.finalPrice?.currencyCode || "USD";
const currencySymbol = currencies.find((c) => c.code === currencyCode)?.symbol ?? currencyCode;

const formatCurrency = (amount: number) =>
  `${currencySymbol}${new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(amount)}`;

  const getDeviceType = () => {
    if (typeof window === "undefined") return "Desktop";
    const width = window.innerWidth;
    if (width < 768) return "Mobile";
    if (width >= 768 && width < 1024) return "Tablet";
    return "Desktop";
  };

  const handleApply = async () => {
    if (!promo) { toast.error("Please enter a promo code"); return; }
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
        onPriceUpdate(newTotal, newDiscount, data.data.promo);
        toast.success(data.message || "Promo code applied!");
      } else {
        const fallbackTotal = bookingDetails.finalPrice?.totalAmount || 0;
        setDiscount(0);
        setTotalPrice(fallbackTotal);
        onPriceUpdate(fallbackTotal, 0);
        toast.error(data.message || "Invalid promo code");
      }
    } catch (err: any) {
      const fallbackTotal = bookingDetails.finalPrice?.totalAmount || 0;
      setDiscount(0);
      setTotalPrice(fallbackTotal);
      onPriceUpdate(fallbackTotal, 0);
      toast.error(err?.response?.data?.message || "Something went wrong. Try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 max-w-sm">
      <h2 className="text-lg font-semibold text-orange-600 mb-4">Price Details</h2>

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
      <div className="mt-4">
        <p className="text-xs text-gray-500 mb-2">Accepted payment methods</p>
        <div className="flex flex-wrap items-center gap-2">
          {PAYMENT_METHODS.map(({ id, Icon }) => (
            <div
              key={id}
              className="flex h-[36px] w-[56px] shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white p-1.5 shadow-sm transition-shadow hover:shadow-md"
            >
              <Icon />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PriceDetails;
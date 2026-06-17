"use client";
import React from "react";
import { useTranslation } from "react-i18next";
import { currencies } from "../currencyCode/cuurency";
import { Currency } from "../currencyCode/currency-code.type";
import { formatNumber } from "@/src/utils/numLang";

interface PriceDetailsProps {
  bookingDetails: any;
}

const VisaIcon = () => (
  <img src="https://cdn.simpleicons.org/visa/1434CB" alt="Visa" className="h-full w-full object-contain" />
);
const MastercardIcon = () => (
  <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-full w-full object-contain" />
);
const PayPalIcon = () => (
  <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-full w-full object-contain" />
);
const GooglePayIcon = () => (
  <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="Google Pay" className="h-full w-full object-contain" />
);
const ApplePayIcon = () => (
  <img src="https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg" alt="Apple Pay" className="h-full w-full object-contain" />
);

const PAYMENT_METHODS = [
  { id: "apple-pay", Icon: ApplePayIcon },
  { id: "google-pay", Icon: GooglePayIcon },
  { id: "paypal", Icon: PayPalIcon },
  { id: "visa", Icon: VisaIcon },
  { id: "mastercard", Icon: MastercardIcon },
];

const PriceDetails: React.FC<PriceDetailsProps> = ({ bookingDetails }) => {
  const { t } = useTranslation();

  const fp = bookingDetails?.finalPrice;
  const currencyCode = fp?.currencyCode || "USD";
  const currencySymbol = currencies.find((c: Currency) => c.code === currencyCode)?.symbol || currencyCode;

 const hasPayLater = (fp?.latterpayableAmount ?? 0) > 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 max-w-sm">
      <h2 className="text-lg font-semibold text-orange-600 mb-4">
        {t("PriceDetails.title")}
      </h2>

      {/* Pay now / Pay at hotel — only shown when a split exists */}
      {hasPayLater && (
        <div className="space-y-2 border-t pt-3 mb-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">{t("PriceDetails.payNow")}</span>
            <span className="font-semibold text-green-700">
              {currencySymbol} {formatNumber(Number(fp?.currentChargeableAmount.toFixed(2)) || 0)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">{t("PriceDetails.payAtHotel")}</span>
            <span className="font-semibold text-amber-600">
              {currencySymbol} {formatNumber(Number(fp?.latterpayableAmount.toFixed(2)) || 0)}
            </span>
          </div>
        </div>
      )}

      {/* Total Amount */}
      <div className={`flex justify-between items-center text-base border-t pt-3 ${hasPayLater ? "" : "mt-0"}`}>
        <span className="font-semibold text-gray-900">{t("PriceDetails.totalAmount")}</span>
        <span className="font-bold text-orange-600 text-xl">{currencySymbol} {formatNumber(Number(fp?.totalAmount.toFixed(2)) || 0)}</span>
      </div>

      {/* Secure Payment */}
      <div className="mt-4 text-xs text-gray-700 bg-orange-50 p-3 rounded-xl">
        <strong>{t("PriceDetails.securePayment")}</strong> {t("PriceDetails.securePaymentInfo")}
      </div>

      {/* Payment Methods */}
      <div className="mt-4">
        <p className="text-xs text-gray-500 mb-2">{t("PriceDetails.acceptedMethods")}</p>
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
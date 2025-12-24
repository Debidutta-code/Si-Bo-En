"use client";
import React from "react";
import { Camera, Upload, X, Check, Copy, CreditCard, DollarSign } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

interface BankDetails {
  activatedPaymentMethod: {
    payAtHotel?: boolean;
    bankTransfer?: boolean;
    upi?: boolean;
    gateway?: boolean;
  };
  accountHolder: string;
  accountNumber: string;
  ifsc: string;
  upiId: string;
}

interface PaymentMethodProps {
  bankDetails: BankDetails | null;
  selectedPayment: string | null;
  setSelectedPayment: (method: string) => void;
  copiedField: string | null;
  setCopiedField: (field: string | null) => void;
  paymentProofPreview: string | null;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: () => void;
  cloudinaryImageUrl: string | null;
  loading: boolean;
  handleConfirmBooking: () => void;
  noAvailablePayment: boolean;
  requiresImage: boolean;
  hasRequiredImage: boolean;
  totalAmount: number;
}

const PaymentMethod: React.FC<PaymentMethodProps> = ({
  bankDetails,
  selectedPayment,
  setSelectedPayment,
  copiedField,
  setCopiedField,
  paymentProofPreview,
  handleImageUpload,
  removeImage,
  cloudinaryImageUrl,
  loading,
  handleConfirmBooking,
  noAvailablePayment,
  requiresImage,
  hasRequiredImage,
  totalAmount,
}) => {
  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const renderPaymentDetails = (paymentType: string) => {
    if (selectedPayment !== paymentType) return null;
    if (!bankDetails) return null;

    switch (paymentType) {
      case "bankTransfer":
        return (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-3">Bank Transfer Details</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between flex-col sm:flex-row items-center">
                <span>Account Holder</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{bankDetails.accountHolder}</span>
                  <button
                    onClick={() => copyToClipboard(bankDetails.accountHolder, "Account Holder")}
                  >
                    {copiedField === "Account Holder" ? <Check /> : <Copy />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between flex-col sm:flex-row items-center">
                <span>Account Number</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono">{bankDetails.accountNumber}</span>
                  <button
                    onClick={() => copyToClipboard(bankDetails.accountNumber, "Account Number")}
                  >
                    {copiedField === "Account Number" ? <Check /> : <Copy />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between flex-col sm:flex-row items-center">
                <span>IFSC Code</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono">{bankDetails.ifsc}</span>
                  <button onClick={() => copyToClipboard(bankDetails.ifsc, "IFSC Code")}>
                    {copiedField === "IFSC Code" ? <Check /> : <Copy />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case "upi":
        return (
          <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-3">UPI Payment Details</h4>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <span>UPI ID:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono break-all">{bankDetails.upiId}</span>
                <button onClick={() => copyToClipboard(bankDetails.upiId, "UPI ID")}>
                  {copiedField === "UPI ID" ? <Check /> : <Copy />}
                </button>
              </div>
            </div>
            <div className="text-center mt-4">
              <QRCodeCanvas
                value={`upi://pay?pa=${bankDetails.upiId}&am=${totalAmount}&cu=INR&tn=Hotel Booking Payment`}
                size={150}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
      <h2 className="text-lg font-semibold text-orange-600 mb-4">Choose Payment Method</h2>
      {noAvailablePayment ? (
        <div className="bg-orange-50 text-orange-700 px-4 py-3 rounded-lg mb-4 text-sm">
          <strong>No payment methods available</strong>
          <p className="mt-1">Please contact the hotel directly for payment arrangements.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {["payAtHotel", "bankTransfer", "upi", "gateway"].map((key) => {
            const isActive = bankDetails?.activatedPaymentMethod?.[key as keyof typeof bankDetails.activatedPaymentMethod];
            const isSelected = selectedPayment === key;
            return (
              <div key={key} className={`border-2 rounded-xl ${isActive ? (isSelected ? "border-orange-600 bg-orange-50" : "border-gray-200 hover:border-gray-300 bg-white") : "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"}`}>
                <label className={`block p-4 ${isActive ? "cursor-pointer" : "cursor-not-allowed"}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    disabled={!isActive}
                    checked={isSelected}
                    onChange={() => isActive && setSelectedPayment(key)}
                  />
                  {renderPaymentDetails(key)}
                </label>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PaymentMethod;

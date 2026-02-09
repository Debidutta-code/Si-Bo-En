"use client";

import React, { useState } from "react";
import { CreditCard, Loader2, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";

interface FikafiPaymentButtonProps {
  bookingCode: string;
  amount: number;
  currency: string;
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
  propertyName: string;
  propertyId: string;
  checkInDate: string;
    paymentMethod?: string; 
  numberOfNights: number;
  onPaymentLinkGenerated?: (paymentLink: string, paymentId: string) => void;
  onPaymentError?: (error: string) => void;
  buttonText?: string;
  className?: string;
}

const FikafiPaymentButton: React.FC<FikafiPaymentButtonProps> = ({
  bookingCode,
  amount,
  currency,
  guestName,
  guestEmail,
  guestPhone,
  propertyName,
  propertyId,
  checkInDate,
  numberOfNights,
  onPaymentLinkGenerated,
  onPaymentError,
  paymentMethod = "payment_gateway",
  buttonText = "Pay with Fikafi",
  className = "",
}) => {
  const [loading, setLoading] = useState(false);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);

  const handleFikafiPayment = async () => {
    setLoading(true);
    setPaymentLink(null);

    try {
      // Validate required fields
      if (!guestEmail && !guestPhone) {
        toast.error("Please provide either email or phone number");
        onPaymentError?.("Missing guest contact information");
        setLoading(false);
        return;
      }

      console.log("🚀 Starting Fikafi payment flow...");
      console.log("📋 Booking Code:", bookingCode);
      console.log("💰 Amount:", amount, currency);
      console.log("👤 Guest:", guestName);

      // Clean the backend URL to avoid duplicate /api/v1 and double slashes
      let backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "").trim();
      // Remove any trailing slashes
      backendUrl = backendUrl.replace(/\/+$/, "");
      // Remove /api/v1/ if present to avoid duplicates
      backendUrl = backendUrl.replace(/\/api\/v1\/?$/, "");
      // If empty, use default
      if (!backendUrl) {
        backendUrl = "http://localhost:8080";
      }
      // Ensure no double slashes when appending path
      const cleanPath = (path: string) =>
        `${backendUrl}${backendUrl.endsWith('/') ? '' : '/'}${path.replace(/^\/+/, '')}`;

      const requestBody = {
        bookingRefNum: bookingCode,

guestDetails: {
          guestName,
          email: guestEmail || "guest@email.com", // Required by Fikafi
          // phoneNum removed - Fikafi doesn't require it
          // country removed - Fikafi doesn't require it
        },

        // country removed - Fikafi doesn't require country at all

        bookingDetails: {
      "propertyID": "KSA_MUK_01",
          propertyName, // Only propertyName is needed
          referenceDetails: bookingCode,
          communicationMode: guestEmail ? "EMAIL" : "WHATSAPP",
          arrivalDate: checkInDate,
          numberOfNights,
        },

        paymentDetails: {
          currency: currency || "USD",
          totalAmounts: amount,
          numOfPayments: 1,
          validity: "24 hours",
          payments: [
            {
              // paymentNumber removed - Fikafi doesn't require it
              // paymentName removed - Fikafi doesn't require it
              amount,
              // date removed - Fikafi doesn't require it
            },
          ],
        },

        returnURL: {
          success_url: `${window.location.origin}/PaymentSuccess?bookingCode=${bookingCode}`,
          failed_url: `${window.location.origin}/PaymentFailed?bookingCode=${bookingCode}`,
        },

        webhook: {
          payment_details_url: "https://webhook.site/268808ea-38e6-44ba-b6b2-0575c29d71d6",
          payment_event_url: "https://webhook.site/268808ea-38e6-44ba-b6b2-0575c29d71d6",
        },
      };



      console.log("📤 Sending request to Fikafi API...");

      const response = await fetch(
        `${backendUrl}/api/v1/fikafi/create-payment-link`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      console.log("📥 Response status:", response.status);

      const data = await response.json();
      console.log("📥 Response data:", data);

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: Failed to create payment link`);
      }

      if (data.success && data.data?.paymentLink) {
        // ✅ Store booking confirmation in localStorage for the success page
        const bookingConfirmation = {
          bookingCode: bookingCode,
          status: 'confirmed',
          timestamp: Date.now(),
          paymentId: data.data.paymentId,
          paymentMethod: paymentMethod || "payment_gateway",
        };
        localStorage.setItem('bookingConfirmation', JSON.stringify(bookingConfirmation));
        
        setPaymentLink(data.data.paymentLink);
        onPaymentLinkGenerated?.(data.data.paymentLink, data.data.paymentId);
        console.log("🔗 Redirecting to:", data.data.paymentLink);
        window.location.href = data.data.paymentLink;
      } else {
        throw new Error(data.message || "Failed to generate payment link");
      }
    } catch (error: any) {
      console.error("❌ Fikafi payment error:", error);
      toast.error(error.message || "Payment failed. Please try again.");
      onPaymentError?.(error.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  // If we already have a payment link, show redirect button
  if (paymentLink) {
    return (
      <a
        href={paymentLink}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors ${className}`}
      >
        <ExternalLink className="w-5 h-5" />
        Redirect to Payment
      </a>
    );
  }

  return (
    <button
      onClick={handleFikafiPayment}
      disabled={loading}
      className={`flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium py-3 px-6 rounded-lg transition-colors ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Generating Payment Link...
        </>
      ) : (
        <>
          <CreditCard className="w-5 h-5" />
          {buttonText}
        </>
      )}
    </button>
  );
};

export default FikafiPaymentButton;


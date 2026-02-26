"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { CreditCard, Loader2, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";

interface FikafiPaymentButtonProps {
  bookingCode?: string;
  amount: number;
  currency: string;
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
  propertyName: string;
  propertyID: string;
  checkInDate: string;
    paymentMethod?: string; 
  numberOfNights: number;
  onPaymentLinkGenerated?: (paymentLink: string) => void;
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
  propertyID,
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
  const socketRef = useRef<any>(null);

  // Initialize socket connection for payment updates
  const initializeSocket = useCallback((ref: string) => {
    const init = async () => {
      try {
        const { default: io } = await import("socket.io-client");
        
        const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
          transports: ["websocket", "polling"],
          reconnection: false,
        });

        socketRef.current = socket;

        socket.on("connect", () => {
          console.log("✅ Fikafi socket connected:", socket.id);
          const roomName = `payment:${ref}`;
          socket.emit("join-payment-room", roomName);
          console.log(`📌 Joined payment room: ${roomName}`);
        });

        socket.on("room-joined", (data: any) => {
          console.log("✅ Room joined:", data);
        });

        socket.on("payment-status-update", (data: any) => {
          console.log("📡 Payment update received:", data);
          
          if (data.orderReference === ref && data.status === "success") {
            toast.success("Payment successful!");
            setTimeout(() => {
              window.location.href = `/success?ref=${ref}`;
            }, 1500);
          }
        });

        socket.on("disconnect", () => {
          console.log("🔌 Fikafi socket disconnected");
        });

        socket.on("connect_error", (error: any) => {
          console.error("❌ Fikafi socket connection error:", error);
        });
      } catch (error) {
        console.error("Failed to initialize socket:", error);
      }
    };

    init();
  }, []);

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

      //console.log("🚀 Starting Fikafi payment flow...");
      //console.log("📋 Booking Code:", bookingCode);
      //console.log("💰 Amount:", amount, currency);
      //console.log("👤 Guest:", guestName);

      // Require booking code - reservation must exist first
      if (!bookingCode) {
        toast.error("Please confirm your booking first before payment");
        onPaymentError?.("Booking code is required - reservation must exist");
        setLoading(false);
        return;
      }

      // Use the provided booking code (reservation already exists)
      const bookingRefNum = bookingCode;
      
      console.log("📋 Booking Ref:", bookingRefNum);

      // Clean the backend URL
      let backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "").trim();
      backendUrl = backendUrl.replace(/\/+$/, "");
      backendUrl = backendUrl.replace(/\/api\/v1\/?$/, "");

      // Get the website URL for redirects
      let websiteUrl = (process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000").trim();
      websiteUrl = websiteUrl.replace(/\/+$/, "");

      // Build request matching the exact format
      const requestBody = {
        bookingRefNum: bookingRefNum,
        guestDetails: {
          guestName: guestName,
          phoneNum: guestPhone || "",
          email: guestEmail || "guest@email.com",
          country: "IN"
        },
        bookingDetails: {
          propertyID: propertyID,
          referenceDetails: bookingRefNum,
          communicationMode: guestEmail ? "EMAIL" : "WHATSAPP",
          arrivalDate: checkInDate,
          numberOfNights: numberOfNights
        },
        paymentDetails: {
          currency: currency || "USD",
          totalAmounts: amount,
          numOfPayments: 1,
          validity: "5 mins",
          payments: [
            {
              paymentNumber: 1,
              amount: amount,
              date: new Date().toISOString().split('T')[0]
            }
          ]
        },
        returnURL: {
          success_url: `${websiteUrl}/success?ref=${bookingRefNum}`,
          failed_url: `${websiteUrl}/PaymentSuccess?ref=${bookingRefNum}&status=failed`
        },
        webhook: {
          payment_event_url: `${backendUrl}/api/v1/fikafi/webhook/payment-event`
        }
      };

      //console.log("📤 Sending request to Fikafi API...");

      // Create payment link
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

      //console.log("📥 Response status:", response.status);

      const data = await response.json();
      //console.log("📥 Response data:", data);

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: Failed to create payment link`);
      }

      if (data.success && data.data?.paymentLink) {
        // Store payment reference for success page
        const bookingData = {
          bookingCode: bookingRefNum,
          fikafiRefNum: data.data.referenceNumber || bookingRefNum,
          timestamp: Date.now(),
          paymentId: data.data.paymentId,
          paymentMethod: paymentMethod || "payment_gateway",
        };
        localStorage.setItem('fikafi_booking', JSON.stringify(bookingData));
        
        // Initialize socket connection and join room
        initializeSocket(bookingRefNum);

        setPaymentLink(data.data.paymentLink);
        onPaymentLinkGenerated?.(data.data.paymentLink);
        console.log("🔗 Redirecting to:", data.data.paymentLink);
        
        // Redirect after a short delay
        setTimeout(() => {
          window.location.href = data.data.paymentLink;
        }, 1500);
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

  // Cleanup socket on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

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
      disabled={loading || !bookingCode}
      className={`flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium py-3 px-6 rounded-lg transition-colors ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Processing Payment...
        </>
      ) : !bookingCode ? (
        <>
          <CreditCard className="w-5 h-5" />
          Confirm Booking First
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
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";

import { useRouter, useSearchParams } from "next/navigation";

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<any>(null);
  const socketConnectedRef = useRef(false);
  const paymentTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const paymentHandledRef = useRef(false);  // Prevent double processing in StrictMode
  const bookingCodeRef = useRef<string | null>(null);  // Use ref to avoid stale closure

  const handlePaymentConfirmed = useCallback((bookingCode: string, paymentId?: string) => {
    // console.log("✅ Payment confirmed via WebSocket!");

    // Clear timeout
    if (paymentTimeoutRef.current) {
      clearTimeout(paymentTimeoutRef.current);
    }

    // Disconnect socket
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    // Redirect to PaymentSuccess page
    setLoading(false);
    router.replace(`/PaymentSuccess?bookingCode=${bookingCode}`);
  }, [router]);

  const handlePaymentTimeout = useCallback((bookingCode: string) => {
    // console.log("⏰ Payment confirmation timeout - redirecting with pending status");

    // Disconnect socket
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    // Store pending status
    localStorage.setItem(
      "bookingConfirmation",
      JSON.stringify({
        bookingCode,
        status: "pending",
        timestamp: Date.now(),
        paymentId: searchParams?.get("ref"),
      })
    );

    setLoading(false);
    router.replace(`/PaymentSuccess?bookingCode=${bookingCode}&status=pending`);
  }, [router, searchParams]);

  const setupSocket = useCallback((bookingCode: string) => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL!;

    // Dynamically import socket.io-client
    import('socket.io-client').then(({ default: io }) => {
      const socket = io(socketUrl, {
        transports: ['websocket'],
        reconnection: false,
        autoConnect: true,
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        // console.log("🔌 Socket connected:", socket.id);
        socketConnectedRef.current = true;

        // Join the payment room with correct format matching server's payment:{bookingCode}
        const roomName = `payment:${bookingCode}`;
        socket.emit('join-payment-room', roomName);
        // console.log(`📌 Joining payment room: ${roomName}`);
      });

      socket.on('payment-status-update', (data: { orderReference: string; status: string; message?: string }) => {
        // console.log("🎉 Payment status update received:", data);
        // console.log("📋 Comparing:", data.orderReference, "===", bookingCodeRef.current);

        // Prevent double processing in StrictMode
        if (data.orderReference === bookingCodeRef.current && !paymentHandledRef.current) {
          paymentHandledRef.current = true;  // Mark as handled immediately
          // console.log("✅ Match found! Status:", data.status);
          
          if (data.status === 'success') {
            // console.log("➡️ Calling handlePaymentConfirmed");
            handlePaymentConfirmed(bookingCodeRef.current!);
          }
          // Note: failed payments are handled by /failed page, not here
        } else {
          // console.log("❌ No match or already handled - ignoring event");
        }
      });

      socket.on('disconnect', () => {
        // console.log("🔌 Socket disconnected");
        socketConnectedRef.current = false;
      });

      socket.on('connect_error', (err: any) => {
        // console.error("Socket connection error:", err);
        socketConnectedRef.current = false;
      });
    }).catch((err: any) => {
      // console.error("Failed to load socket.io-client:", err);
    });
  }, [handlePaymentConfirmed]);

  useEffect(() => {
    // Get reference number from URL first, then localStorage
    const ref = searchParams?.get("ref");
    const code = searchParams?.get("bookingCode");
    let bookingCode = code || ref;

    // Also try localStorage (set by FikafiPaymentButton)
    if (!bookingCode) {
      const storedFikafiBooking = localStorage.getItem('fikafi_booking');
      if (storedFikafiBooking) {
        try {
          const bookingData = JSON.parse(storedFikafiBooking);
          bookingCode = bookingData.bookingCode;
          // console.log("📦 Retrieved bookingCode from localStorage:", bookingCode);
        } catch (e) {
          // console.error("Failed to parse stored booking data:", e);
        }
      }
    }

    // Also try currentBookingCode from booking flow
    if (!bookingCode) {
      const currentBookingCode = localStorage.getItem('currentBookingCode');
      if (currentBookingCode) {
        bookingCode = currentBookingCode;
        // console.log("📦 Retrieved bookingCode from currentBookingCode:", bookingCode);
      }
    }

    // console.log("🎉 Success page loaded, ref:", ref, "code:", code, "final:", bookingCode);

    // Validate we have a real booking code, not a placeholder

    if (!bookingCode || bookingCode === "PENDING_BOOKING") {
      setError(t("SuccessPage.invalidBooking"));
      setLoading(false);
      return;
    }


    const confirmedBookingCode = bookingCode;

    // Store in ref to avoid stale closure in socket handler
    bookingCodeRef.current = confirmedBookingCode;

    // Setup WebSocket connection - this is the PRIMARY way to receive payment confirmation
    // The reservation is created in DB ONLY after Fikafi sends webhook to backend
    // So we wait for WebSocket event which is triggered after webhook processes
    setupSocket(confirmedBookingCode);

    // Set a timeout as fallback (e.g., 5 minutes) - in case WebSocket fails
    // This is just a safety net, the main flow should be WebSocket
    paymentTimeoutRef.current = setTimeout(() => {
      // console.log("⚠️ WebSocket timeout reached, using fallback");
      handlePaymentTimeout(confirmedBookingCode);
    }, 5 * 60 * 1000); // 5 minutes timeout

    // Cleanup on unmount
    return () => {
      paymentHandledRef.current = false;
      if (paymentTimeoutRef.current) {
        clearTimeout(paymentTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [searchParams, setupSocket, handlePaymentTimeout]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">

        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">{t("SuccessPage.error")}</h1>
          <p className="text-gray-600 mt-2">{error}</p>
        </div>

      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">

        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-800">{t("SuccessPage.verifying")}</h1>
          <p className="text-gray-600 mt-2">{t("SuccessPage.verifyingSubtitle")}</p>
          <p className="text-sm text-gray-500 mt-4">{t("SuccessPage.doNotClose")}</p>
        </div>

      </div>
    );
  }

  return null;
}
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<any>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const maxAttempts = 30; // Poll for maximum 30 seconds (30 * 1000ms)
  const attemptsRef = useRef(0);
  const socketConnectedRef = useRef(false);

  const checkBackendUrl = () => {
    let backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "").trim();
    backendUrl = backendUrl.replace(/\/+$/, "");
    backendUrl = backendUrl.replace(/\/api\/v1\/?$/, "");
    return backendUrl;
  };

  const checkPaymentStatus = async (bookingCode: string) => {
    const backendUrl = checkBackendUrl();
    try {
      const response = await fetch(
        `${backendUrl}/api/v1/fikafi/reservation/${bookingCode}`
      );
      const data = await response.json();

      if (data.success && data.data) {
        return {
          bookingStatus: data.data.bookingStatus,
          isPaid: data.data.paidAmount > 0 || data.data.bookingStatus === 'confirmed',
        };
      }
      return null;
    } catch (err) {
      console.error("Error checking payment status:", err);
      return null;
    }
  };

  const handlePaymentConfirmed = useCallback((bookingCode: string, paymentId?: string) => {
    console.log("✅ Payment confirmed!");

    // Clear polling
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    // Disconnect socket
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }


    // Redirect to PaymentSuccess page
    setLoading(false);
    router.replace(`/PaymentSuccess?bookingCode=${bookingCode}`);
  }, [router, searchParams]);

  const setupSocket = useCallback((bookingCode: string) => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL!;

    // Dynamically import socket.io-client
    import('socket.io-client').then(({ default: io }) => {
      const socket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        reconnection: false,
        autoConnect: true,
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log("🔌 Socket connected:", socket.id);
        socketConnectedRef.current = true;
        
        // Join the payment room with correct format matching server's payment:{bookingCode}
        const roomName = `payment:${bookingCode}`;
        socket.emit('join-payment-room', roomName);
        console.log(`📌 Joining payment room: ${roomName}`);
      });

      socket.on('payment-status-update', (data: { orderReference: string; status: string }) => {
        console.log("🎉 Payment status update received:", data);
        
        if (data.orderReference === bookingCode && data.status === 'success') {
          handlePaymentConfirmed(bookingCode);
        }
      });

      socket.on('disconnect', () => {
        console.log("🔌 Socket disconnected");
        socketConnectedRef.current = false;
      });

      socket.on('connect_error', (err: any) => {
        console.error("Socket connection error:", err);
        socketConnectedRef.current = false;
      });
    }).catch((err: any) => {
      console.error("Failed to load socket.io-client:", err);
    });
  }, [handlePaymentConfirmed]);

  const startPolling = useCallback((bookingCode: string) => {
    console.log("📡 Starting polling fallback...");
    
    pollingRef.current = setInterval(async () => {
      attemptsRef.current += 1;
      console.log(`🔄 Checking payment status (attempt ${attemptsRef.current})...`);

      const status = await checkPaymentStatus(bookingCode);

      if (status?.isPaid || status?.bookingStatus === 'confirmed') {
        handlePaymentConfirmed(bookingCode);
      } else if (attemptsRef.current >= maxAttempts) {
        // Max attempts reached, redirect anyway with pending status
        console.log("⏰ Max polling attempts reached, redirecting...");

        if (pollingRef.current) {
          clearInterval(pollingRef.current);
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
      }
    }, 1000);
  }, [router, searchParams, handlePaymentConfirmed]);

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
          console.log("📦 Retrieved bookingCode from localStorage:", bookingCode);
        } catch (e) {
          console.error("Failed to parse stored booking data:", e);
        }
      }
    }

    // Also try currentBookingCode from booking flow
    if (!bookingCode) {
      const currentBookingCode = localStorage.getItem('currentBookingCode');
      if (currentBookingCode) {
        bookingCode = currentBookingCode;
        console.log("📦 Retrieved bookingCode from currentBookingCode:", bookingCode);
      }
    }

    console.log("🎉 Success page loaded, ref:", ref, "code:", code, "final:", bookingCode);

    // Validate we have a real booking code, not a placeholder
    if (!bookingCode || bookingCode === "PENDING_BOOKING") {
      setError("Invalid booking reference. Please contact support.");
      setLoading(false);
      return;
    }

    // Setup WebSocket connection
    setupSocket(bookingCode);

    // Start polling fallback (will be stopped if socket confirms payment)
    startPolling(bookingCode);

    // Cleanup on unmount
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [searchParams, setupSocket, startPolling]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
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
          <h1 className="text-2xl font-bold text-gray-800">Verifying Payment...</h1>
          <p className="text-gray-600 mt-2">Please wait while we confirm your payment with the gateway.</p>
          <p className="text-sm text-gray-500 mt-4">Do not close this window.</p>
        </div>
      </div>
    );
  }

  return null;
}


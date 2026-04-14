"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { XCircle, ArrowLeft, RefreshCw, Home, Send, X } from "lucide-react";
import type { RootState } from "../../../store/store";

export default function PaymentFailedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = useSelector((state: RootState) => state.user);
  const [loading, setLoading] = useState(true);
  const [resending, setResending] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const socketRef = useRef<any>(null);
  const paymentHandledRef = useRef(false);
  const bookingCodeRef = useRef<string | null>(null);
  const fikafiRefNumRef = useRef<string | null>(null);
  const paymentTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const ref = searchParams?.get("ref");
    const code = searchParams?.get("bookingCode");
    const urlStatus = searchParams?.get("status");
    let bookingCode: string | undefined = code || ref || undefined;
    let fikafiRefNum: string | null = ref ?? null;

    // Try to get paymentId from localStorage (check both keys)
    const storedFikafiBooking = localStorage.getItem('fikafi_booking');
    if (storedFikafiBooking) {
      try {
        const bookingData = JSON.parse(storedFikafiBooking);
        bookingCode = bookingCode || bookingData.bookingCode;
        // Use paymentId as fikafiRefNum if available, otherwise fall back to bookingCode
        fikafiRefNum = bookingData.paymentId || bookingData.fikafiRefNum || bookingCode;
        console.log("📦 Retrieved from localStorage:", bookingData);
      } catch (e) {
        console.error("Failed to parse stored booking data:", e);
      }
    }

    // Use bookingCode as fallback if fikafiRefNum is still not set
    if (!fikafiRefNum && bookingCode) {
      fikafiRefNum = bookingCode;
    }

    // Also try to get paymentId from currentBookingCode localStorage
    if (!fikafiRefNum) {
      const storedCurrentBooking = localStorage.getItem('currentBookingCode');
      if (storedCurrentBooking) {
        try {
          const currentBookingData = JSON.parse(storedCurrentBooking);
          fikafiRefNum = currentBookingData.paymentId || currentBookingData;
          console.log("📦 Retrieved paymentId from currentBookingCode:", fikafiRefNum);
        } catch (e) {
          console.error("Failed to parse currentBookingCode:", e);
        }
      }
    }

    fikafiRefNumRef.current = fikafiRefNum || null;

    if (!bookingCode) {
      const currentBookingCode = localStorage.getItem('currentBookingCode');
      if (currentBookingCode) {
        bookingCode = currentBookingCode;
      }
    }

    console.log("💸 Failed page loaded, ref:", ref, "code:", code, "final:", bookingCode);

    if (!bookingCode || bookingCode === "PENDING_BOOKING") {
      setError("Invalid booking reference. Please contact support.");
      setLoading(false);
      return;
    }

    bookingCodeRef.current = bookingCode;

    // Add a small delay to ensure page is fully loaded
    const timer = setTimeout(() => {
      // Setup timeout to stop loading after 30 seconds (fallback)
      paymentTimeoutRef.current = setTimeout(() => {
        console.log("⏰ Payment timeout - showing failed UI");
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
        setLoading(false);
      }, 30000); // 30 seconds timeout

      // Setup socket to listen for any updates
      const setupSocket = async () => {
        try {
          const { default: io } = await import('socket.io-client');
          const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL!;
          
          const socket = io(socketUrl, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 3,
            reconnectionDelay: 1000,
          });

          socketRef.current = socket;

          socket.on('connect', () => {
            console.log("🔌 Socket connected:", socket.id);
            const roomName = `payment:${bookingCode}`;
            console.log("📤 Joining room:", roomName);
            socket.emit('join-payment-room', roomName);
          });

          socket.on('connect_error', (err: any) => {
            console.error("❌ Socket connection error:", err.message);
          });

          socket.on('room-joined', (data: any) => {
            console.log("✅ Room joined:", data);
          });

          socket.on('error', (err: any) => {
            console.error("❌ Socket error:", err);
          });

          socket.on('payment-status-update', (data: { orderReference: string; status: string; message?: string }) => {
            console.log("📥 Payment status update received:", data);
            
            // Handle empty or null data
            if (!data || !data.orderReference) {
              console.log("⚠️ Empty payment status received, showing failed UI");
              setLoading(false);
              return;
            }
            
            if (data.orderReference === bookingCode && !paymentHandledRef.current) {
              paymentHandledRef.current = true;
              
              // Clear timeout since we got a response
              if (paymentTimeoutRef.current) {
                clearTimeout(paymentTimeoutRef.current);
              }
              
              if (data.status === 'success') {
                // Payment succeeded - redirect to success page
                toast.success("Payment confirmed!");
                router.replace(`/success?ref=${bookingCode}`);
              } else {
                // Payment failed or other status - show failed UI
                setLoading(false);
              }
            }
          });

          socket.on('disconnect', (reason: any) => {
            console.log("🔌 Socket disconnected:", reason);
          });
        } catch (err) {
          console.error("Socket setup error:", err);
        }
      };

      setupSocket();
    }, 100);

    // Cleanup
    return () => {
      clearTimeout(timer);
      if (paymentTimeoutRef.current) {
        clearTimeout(paymentTimeoutRef.current);
      }
      paymentHandledRef.current = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [searchParams, router]);

  // const handleRetryPayment = () => {
  //   // Clear old booking data and redirect to payment
  //   localStorage.removeItem('fikafi_booking');
  //   router.replace('/Payment');
  // };

  const handleResendPaymentLink = async () => {
    const bookingCode = bookingCodeRef.current;
    const fikafiRefNum = fikafiRefNumRef.current;

    if (!bookingCode || !fikafiRefNum) {
      toast.error("Missing payment reference. Please try again.");
      return;
    }

    setResending(true);

    try {
      let backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "").trim();
      backendUrl = backendUrl.replace(/\/+$/, "");
      backendUrl = backendUrl.replace(/\/api\/v1\/?$/, "");

      const response = await fetch(
        `${backendUrl}/api/v1/fikafi/payment-action`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({
            bookingRefNum: bookingCode,
            fikafiRefNum: fikafiRefNum,
            action: "resend",
          }),
        }
      );

      const data = await response.json();

      if (data.success && data.data?.url) {
        toast.success("Payment link sent! Redirecting...");
        // Redirect to the new payment link
        window.location.href = data.data.url;
      } else {
        throw new Error(data.error || "Failed to resend payment link");
      }
    } catch (error: any) {
      console.error("❌ Resend payment error:", error);
      toast.error(error.message || "Failed to resend payment link");
    } finally {
      setResending(false);
    }
  };

  const handleCancelBooking = async () => {
    const bookingCode = bookingCodeRef.current;
    const fikafiRefNum = fikafiRefNumRef.current;

    if (!bookingCode || !fikafiRefNum) {
      toast.error("Missing payment reference. Please try again.");
      return;
    }

    setShowCancelModal(true);
  };

  const confirmCancelBooking = async () => {
    setShowCancelModal(false);
    setCanceling(true);

    const bookingCode = bookingCodeRef.current;
    const fikafiRefNum = fikafiRefNumRef.current;

    try {
      let backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "").trim();
      backendUrl = backendUrl.replace(/\/+$/, "");
      backendUrl = backendUrl.replace(/\/api\/v1\/?$/, "");

      const response = await fetch(
        `${backendUrl}/api/v1/fikafi/payment-action`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({
            bookingRefNum: bookingCode,
            fikafiRefNum: fikafiRefNum,
            action: "cancel",
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Booking cancelled successfully");
        localStorage.removeItem('fikafi_booking');
        localStorage.removeItem('currentBookingCode');
        router.replace('/bookings');
      } else {
        throw new Error(data.error || "Failed to cancel booking");
      }
    } catch (error: any) {
      console.error("❌ Cancel booking error:", error);
      toast.error(error.message || "Failed to cancel booking");
    } finally {
      setCanceling(false);
    }
  };

  const handleGoHome = () => {
    localStorage.removeItem('fikafi_booking');
    localStorage.removeItem('currentBookingCode');
    router.replace('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-2 border-gray-200"></div>
            <div className="absolute inset-0 rounded-full border-2 border-t-gray-800 animate-spin"></div>
          </div>
          <p className="text-sm text-gray-400 tracking-wide font-medium">Checking payment status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-sm mx-auto px-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-6 h-6 text-red-400" />
          </div>
          <h1 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <button onClick={handleGoHome} className="inline-flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-colors">
            <Home className="w-4" />
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-8 bg-gray-100">
      <div className="w-full max-w-md mx-auto">

        {/* Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">

          {/* Top accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-red-400 via-rose-500 to-orange-400"></div>

          <div className="p-5 sm:p-8">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-50 flex items-center justify-center">
                  <XCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-400" strokeWidth={1.5} />
                </div>
                <div className="absolute -inset-1 rounded-full bg-red-100 opacity-40 animate-ping" style={{ animationDuration: '2s' }}></div>
              </div>
            </div>

            {/* Text */}
            <div className="text-center mb-8">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 tracking-tight">Payment Failed</h1>
              <p className="text-gray-500 text-sm leading-relaxed">
                Your payment request has expired or was declined. You can resend the link or start a new booking.
              </p>
            </div>

            {/* Primary actions */}
            <div className="space-y-3 mb-4">
              <button
                onClick={handleResendPaymentLink}
                disabled={resending || !fikafiRefNumRef.current}
                className="w-full flex items-center justify-center gap-2.5 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white text-sm font-semibold py-3.5 px-6 rounded-2xl transition-all duration-200 disabled:cursor-not-allowed"
              >
                {resending ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                    Sending link...
                  </>
                ) : (
                  <>
                    <Send className="w-4" />
                    Resend Payment Link
                  </>
                )}
              </button>

              {/* <button
                onClick={handleRetryPayment}
                className="w-full flex items-center justify-center gap-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-semibold py-3.5 px-6 rounded-2xl transition-all duration-200 border border-gray-200"
              >
                <RefreshCw className="w-4" />
                Create New Booking
              </button> */}
            </div>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs text-gray-400">or</span>
              </div>
            </div>

            {/* Secondary actions */}
            <div className="flex justify-center">
              <button
                onClick={handleCancelBooking}
                disabled={canceling || !fikafiRefNumRef.current}
                className="flex items-center justify-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 disabled:opacity-40 text-xs font-medium py-2.5 px-3 rounded-xl transition-colors disabled:cursor-not-allowed"
              >
                {canceling ? (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-red-400/30 border-t-red-500 animate-spin"></div>
                ) : (
                  <X className="w-3.5" />
                )}
                {canceling ? 'Cancelling...' : 'Cancel Booking'}
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 sm:px-8 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">Need help?</p>
            <button className="text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCancelModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-5 sm:p-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Cancel Booking?
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to cancel this booking? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Keep Booking
                </button>
                <button
                  onClick={confirmCancelBooking}
                  disabled={canceling}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {canceling ? 'Cancelling...' : 'Yes, Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
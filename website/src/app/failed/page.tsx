"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { XCircle, ArrowLeft, RefreshCw, Home, Send, X } from "lucide-react";

export default function PaymentFailedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [resending, setResending] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<any>(null);
  const paymentHandledRef = useRef(false);
  const bookingCodeRef = useRef<string | null>(null);
  const fikafiRefNumRef = useRef<string | null>(null);

  useEffect(() => {
    const ref = searchParams?.get("ref");
    const code = searchParams?.get("bookingCode");
    const urlStatus = searchParams?.get("status");
    let bookingCode = code || ref;

    // Also try localStorage
    if (!bookingCode) {
      const storedFikafiBooking = localStorage.getItem('fikafi_booking');
      if (storedFikafiBooking) {
        try {
          const bookingData = JSON.parse(storedFikafiBooking);
          bookingCode = bookingData.bookingCode;
          fikafiRefNumRef.current = bookingData.fikafiRefNum || bookingCode;
          console.log("📦 Retrieved from localStorage:", bookingData);
        } catch (e) {
          console.error("Failed to parse stored booking data:", e);
        }
      }
    }

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

    // Setup socket to listen for any updates
    const setupSocket = async () => {
      try {
        const { default: io } = await import('socket.io-client');
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL!;
        
        const socket = io(socketUrl, {
          transports: ['websocket'],
          reconnection: false,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
          console.log("🔌 Socket connected:", socket.id);
          const roomName = `payment:${bookingCode}`;
          socket.emit('join-payment-room', roomName);
        });

        socket.on('payment-status-update', (data: { orderReference: string; status: string; message?: string }) => {
          if (data.orderReference === bookingCode && !paymentHandledRef.current) {
            paymentHandledRef.current = true;
            
            if (data.status === 'success') {
              // Payment succeeded - redirect to success page
              toast.success("Payment confirmed!");
              router.replace(`/success?ref=${bookingCode}`);
            }
          }
        });

        socket.on('disconnect', () => {
          console.log("🔌 Socket disconnected");
        });
      } catch (err) {
        console.error("Socket setup error:", err);
      }
    };

    setupSocket();

    // Cleanup
    return () => {
      paymentHandledRef.current = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [searchParams, router]);

  const handleRetryPayment = () => {
    // Clear old booking data and redirect to payment
    localStorage.removeItem('fikafi_booking');
    router.replace('/Payment');
  };

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

    const confirmed = window.confirm("Are you sure you want to cancel this booking? This action cannot be undone.");
    if (!confirmed) return;

    setCanceling(true);

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

  const handleGoToBookings = () => {
    localStorage.removeItem('fikafi_booking');
    router.replace('/bookings');
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
            <Home className="w-4 h-4" />
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #fff5f5 0%, #fafafa 50%, #f5f5ff 100%)' }}>
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-100/80 overflow-hidden">

          {/* Top accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-red-400 via-rose-500 to-orange-400"></div>

          <div className="p-8">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
                  <XCircle className="w-10 h-10 text-red-400" strokeWidth={1.5} />
                </div>
                <div className="absolute -inset-1 rounded-full bg-red-100 opacity-40 animate-ping" style={{ animationDuration: '2s' }}></div>
              </div>
            </div>

            {/* Text */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Payment Failed</h1>
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
                    <Send className="w-4 h-4" />
                    Resend Payment Link
                  </>
                )}
              </button>

              <button
                onClick={handleRetryPayment}
                className="w-full flex items-center justify-center gap-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-semibold py-3.5 px-6 rounded-2xl transition-all duration-200 border border-gray-200"
              >
                <RefreshCw className="w-4 h-4" />
                Create New Booking
              </button>
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
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleCancelBooking}
                disabled={canceling || !fikafiRefNumRef.current}
                className="flex items-center justify-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 disabled:opacity-40 text-xs font-medium py-2.5 px-3 rounded-xl transition-colors disabled:cursor-not-allowed"
              >
                {canceling ? (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-red-400/30 border-t-red-500 animate-spin"></div>
                ) : (
                  <X className="w-3.5 h-3.5" />
                )}
                {canceling ? 'Cancelling...' : 'Cancel Booking'}
              </button>

              <button
                onClick={handleGoToBookings}
                className="flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 text-xs font-medium py-2.5 px-3 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                My Bookings
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">Need help? Contact support</p>
            <button onClick={handleGoHome} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
              <Home className="w-3.5 h-3.5" />
              Home
            </button>
          </div>
        </div>

        {/* Bottom note */}
        <p className="text-center text-xs text-gray-400 mt-4">
          Your booking reference has been saved. No charges were made.
        </p>
      </div>
    </div>
  );
}
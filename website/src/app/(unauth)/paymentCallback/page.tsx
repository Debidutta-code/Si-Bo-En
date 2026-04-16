"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/src/store/store";
import { ngeniusService } from "@/src/services/ngenius.service";
import toast from "react-hot-toast";
import {
  setBookingCode,
  setBookingStatus,
  setFullBookingDetails,
} from "@/src/store/bookingSlice";
import { Loader2, CheckCircle2, XCircle, AlertCircle, Wifi, WifiOff } from "lucide-react";
import { usePaymentSocket } from "@/src/hooks/usePaymentSocket";

const PaymentCallbackPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const booking = useSelector((state: RootState) => state.booking);

  const [status, setStatus] = useState<"checking" | "success" | "failed" | "error">("checking");
  const [message, setMessage] = useState("Verifying your payment...");
  const [orderReference, setOrderReference] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [usePolling, setUsePolling] = useState(false);

  // Use a ref for booking to access latest state without triggering re-renders
  const bookingRef = useRef(booking);
  // Ref to track if we've already performed a fallback check
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    bookingRef.current = booking;
  }, [booking]);

  const handleFailedPayment = useCallback((errorMessage: string) => {
    setStatus("failed");
    setMessage(errorMessage || "Payment failed. Please try again.");
    toast.error("Payment was not successful. Please try again.", {
      id: "payment-failed",
    });

    localStorage.removeItem("ngeniusOrderRef");
    localStorage.removeItem("pendingBookingData");

    setTimeout(() => {
      router.replace("/Payment");
    }, 3000);
  }, [router]);

  const handleSuccessfulPayment = useCallback(async (orderRef: string) => {
    try {
      setStatus("success");
      setMessage("Payment successful! Creating your booking...");

      // Get booking data from localStorage or Redux
      let bookingData;
      const storedBookingData = localStorage.getItem("pendingBookingData");

      if (storedBookingData) {
        bookingData = JSON.parse(storedBookingData);
        //console.log("📦 Using stored booking data");
      } else {
        //console.log("⚠️ No stored data, using Redux state");
        // Use ref here to avoid dependency on 'booking'
        const currentBooking = bookingRef.current;

        bookingData = {
          bookingSource: currentBooking.bookingSource,
          propertyCode: currentBooking.PropertyCode,
          reservationStartDate: currentBooking.startDate,
          reservationEndDate: currentBooking.endDate,
          hotelName: currentBooking.hotelName,
          roomName: currentBooking.roomName,
          roomTypeCode: currentBooking.roomTypeCode,
          guests: currentBooking.guests,
          bookingUserEmail: currentBooking.email,
          bookingUserPhone: currentBooking.phone,
          numberOfRooms: currentBooking.numberOfRooms || 1,
          finalPrice: currentBooking.finalPrice,
          promoCode: currentBooking.promocode,
          currencyCode: currentBooking.finalPrice?.dailyPriceBrakeDown?.[0]?.currencyCode || "AED",
          guestDetails: currentBooking.guestDetails,
          ratePlanCode: currentBooking.ratePlanCode,
          paymentMethod: "payment_gateway",
          selectedPromotions: currentBooking.selectedPromotions || [],
          selectedAddons: currentBooking.selectedAddons || [],
          platforms: "web"
        };
      }

      // Attach payment info to booking
      if (bookingData) {
        bookingData.ngeniusOrderRef = orderRef;
      }

      //console.log("📤 Sending booking request:", bookingData);

      // Create booking via backend
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/front-office/reservations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bookingData),
        }
      );

      const result = await response.json();
      //console.log("📥 Booking Response:", result);

      if (!response.ok) {
        throw new Error(result.message || "Failed to create booking");
      }

      // Update Redux and navigate
      dispatch(setBookingCode(result.data.bookingCode));
      dispatch(setBookingStatus(result.data.bookingStatus));
      dispatch(setFullBookingDetails(result.data));

      // Cleanup
      localStorage.removeItem("ngeniusOrderRef");
      localStorage.removeItem("pendingBookingData");

      setMessage("Booking confirmed successfully!");
      toast.success("Payment successful! Your booking is confirmed.", {
        id: "payment-success",
      });

      setTimeout(() => {
        router.replace("/PaymentSuccess");
      }, 2000);
    } catch (err: any) {
      console.error("❌ Booking creation error:", err);
      setStatus("error");
      setMessage(err?.message || "Failed to create booking after successful payment");
      toast.error("Failed to create booking. Please contact support.", {
        id: "booking-error",
      });
    }
  }, [dispatch, router]);

  // Handle payment status updates from socket
  const handlePaymentUpdate = useCallback((update: any) => {
    //console.log('🎯 Payment update received via socket:', update);

    if (update.status === 'success') {
      handleSuccessfulPayment(update.orderReference);
    } else if (update.status === 'failed') {
      handleFailedPayment(update.message);
    } else {
      setMessage(update.message || 'Processing payment...');
    }
  }, [handleSuccessfulPayment, handleFailedPayment]);

  // Initialize socket connection
  const { isConnected, connectionError } = usePaymentSocket({
    orderReference,
    onStatusUpdate: handlePaymentUpdate,
    enabled: !!orderReference && !usePolling,
  });

  // Fallback polling function
  const performPaymentCheck = useCallback(async (orderRef: string, isMounted: boolean) => {
    try {
      setMessage("Checking payment status...");

      const orderStatus = await ngeniusService.getOrderStatus(orderRef);
      //console.log("✅ Order Status Response:", orderStatus);
      setDebugInfo(orderStatus);

      const isSuccess = ngeniusService.isPaymentSuccessful(orderStatus);
      const paymentState = ngeniusService.getPaymentState(orderStatus);

      //console.log("💳 Payment State:", paymentState);
      //console.log("✔️ Is Successful:", isSuccess);

      if (!isSuccess) {
        if (isMounted) {
          handleFailedPayment(`Payment ${paymentState.toLowerCase()}`);
        }
        return;
      }

      // Payment successful
      if (isMounted) {
        await handleSuccessfulPayment(orderRef);
      }
    } catch (err: any) {
      console.error("❌ Payment check error:", err);
      if (isMounted) {
        setStatus("error");
        setMessage(err?.message || "Failed to verify payment");
      }
    }
  }, [handleSuccessfulPayment, handleFailedPayment]);

  useEffect(() => {
    let isMounted = true;
    let socketTimeout: NodeJS.Timeout;

    const initializePayment = async () => {
      try {
        // Get order reference from URL or localStorage
        const urlOrderRef = searchParams.get("orderRef") || searchParams.get("ref");
        const storedOrderRef = localStorage.getItem("ngeniusOrderRef");
        const orderRef = urlOrderRef || storedOrderRef;

        //console.log("🔍 Order Reference:", orderRef);

        if (!orderRef) {
          if (isMounted) {
            setStatus("error");
            setMessage("Payment reference not found. Please contact support.");
          }
          return;
        }

        if (isMounted) {
          setOrderReference(orderRef);
          setMessage("Waiting for payment confirmation...");
        }

        // Check if socket was pre-connected
        const wasSocketConnected = localStorage.getItem("socketConnected") === "true";
        if (wasSocketConnected) {
          //console.log("✅ Socket was pre-connected before payment");
          localStorage.removeItem("socketConnected");
        }

        // Handle connection error immediately if it happens
        if (connectionError && isMounted && !hasCheckedRef.current) {
          console.log("⚠️ Connection error detected, falling back to polling immediately");
          setUsePolling(true);
          hasCheckedRef.current = true;
          performPaymentCheck(orderRef, isMounted);
          return;
        }

        // Wait for socket connection or fall back to polling after 15 seconds
        socketTimeout = setTimeout(() => {
          if (!isConnected && isMounted && !hasCheckedRef.current) {
            //console.log("⚠️ No webhook received in 15 seconds, falling back to polling");
            setUsePolling(true);
            setMessage("Verifying payment status...");
            hasCheckedRef.current = true;
            performPaymentCheck(orderRef, isMounted);
          }
        }, 15000);

        return () => {
          clearTimeout(socketTimeout);
        };
      } catch (err: any) {
        console.error("❌ Payment initialization error:", err);
        if (isMounted) {
          setStatus("error");
          setMessage(err?.message || "An error occurred");
        }
      }
    };

    initializePayment();

    return () => {
      isMounted = false;
      // Socket timeout is commented out above, so we don't need to clear it here
      // if (socketTimeout) {
      //   clearTimeout(socketTimeout);
      // }
    };
  }, [searchParams, isConnected, performPaymentCheck, connectionError]);

  const renderIcon = () => {
    switch (status) {
      case "checking":
        return <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />;
      case "success":
        return <CheckCircle2 className="h-16 w-16 text-green-600" />;
      case "failed":
        return <XCircle className="h-16 w-16 text-red-600" />;
      case "error":
        return <AlertCircle className="h-16 w-16 text-orange-600" />;
      default:
        return <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "checking":
        return "text-blue-600";
      case "success":
        return "text-green-600";
      case "failed":
        return "text-red-600";
      case "error":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="flex justify-center mb-6">{renderIcon()}</div>

        <h1 className={`text-2xl md:text-3xl font-bold mb-4 ${getStatusColor()}`}>
          {status === "checking" && "Processing Payment"}
          {status === "success" && "Payment & Booking Successful!"}
          {status === "failed" && "Payment Failed"}
          {status === "error" && "Something Went Wrong"}
        </h1>

        <p className="text-gray-600 mb-6 text-lg">{message}</p>

        {/* Connection Status */}
        {status === "checking" && (
          <div className="mb-4 flex items-center justify-center gap-2 text-sm">
            {isConnected ? (
              <>
                <Wifi className="h-4 w-4 text-green-600" />
                <span className="text-green-600">Live updates active</span>
              </>
            ) : usePolling ? (
              <>
                <WifiOff className="h-4 w-4 text-orange-600" />
                <span className="text-orange-600">Using fallback mode</span>
              </>
            ) : (
              <>
                <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                <span className="text-blue-600">Connecting...</span>
              </>
            )}
          </div>
        )}

        {orderReference && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 break-all">
            <p className="text-xs text-gray-500 mb-1 font-medium">Payment Reference</p>
            <p className="text-sm font-mono text-gray-800">{orderReference}</p>
          </div>
        )}

        {status === "checking" && (
          <div className="space-y-2 text-sm text-gray-500 mt-4">
            <p>Please do not close or refresh this window</p>
            <p>This may take a few moments...</p>
          </div>
        )}

        {(status === "failed" || status === "error") && (
          <button
            onClick={() => router.replace("/Payment")}
            className="mt-6 px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Try Payment Again
          </button>
        )}

        {/* Debug info in dev mode */}
        {process.env.NODE_ENV === 'development' && debugInfo && (
          <details className="mt-6 text-left">
            <summary className="text-xs text-gray-400 cursor-pointer">Debug Info</summary>
            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

export default PaymentCallbackPage;
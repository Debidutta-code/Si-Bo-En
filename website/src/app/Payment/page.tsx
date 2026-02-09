"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useRouter } from "next/navigation";
import {ngeniusService} from "../../services/ngenius.service";
import {
  DollarSign,
  CreditCard,
  Check,
  Loader2,
  ShieldCheck,
  Info,
  Wallet,
} from "lucide-react";
import toast from "react-hot-toast";
import { setBookingCode, setBookingStatus, setFullBookingDetails } from "@/src/store/bookingSlice";
import PriceDetails from "@/src/components/payment/PriceDetails";
import HelpBox from "@/src/components/payment/HelpBox";
import { useBookingStorage } from "@/src/hooks/useBookingStorage";
import FikafiPaymentButton from "@/src/components/payment/FikafiPaymentButton";

// Updated interface to match actual API response
interface PaymentIntegrationDetail {
  id: string;
  propertyId: string;
  paymentIntegrationId: string;
  isActive: boolean;
  paymentIntegration: {
    id: string;
    name: string;
    isActive: boolean;
  };
}

interface BankDetails {
  id: string;
  payAtHotel: boolean;
  paymentGateway: boolean;
  propertyId: string;
  createdAt: string;
  updatedAt: string;
  selectedPaymentIntegrations?: PaymentIntegrationDetail[];
}

const BookingReviewPage = () => {
  const bookingDetails = useSelector((state: RootState) => state.booking);
  const {
    startDate: checkIn,
    endDate: checkOut,
    guestDetails: guest,
    email,
    finalPrice,
    guests,
    hotelName,
    PropertyDetails,
  } = bookingDetails;

  const ratePlanCode = finalPrice?.dailyBreakdown?.[0]?.ratePlanCode;
  const currencyCode = finalPrice?.dailyBreakdown?.[0]?.currencyCode || "USD";
  const roomTypeCode = bookingDetails.roomTypeCode;
  const propertyCode = bookingDetails.PropertyCode;
  const PropertyId = bookingDetails.PropertyDetails?.id;
  const propertyName = PropertyDetails?.propertyName || hotelName || "";
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [bankDetailsLoading, setBankDetailsLoading] = useState(true);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [availableMethods, setAvailableMethods] = useState<string[]>([]);
  const [noAvailablePayment, setNoAvailablePayment] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [activeGateway, setActiveGateway] = useState<'fikafi' | 'ngenius' | null>(null);
  const [bookingCode, setBookingCodeValue] = useState<string>("");

  const dispatch = useDispatch();
  const nights = finalPrice?.numberOfNights || 0;
  const totalAmount = finalPrice?.totalAmount || 0;
  const [updatedPrice, setUpdatedPrice] = useState(totalAmount);
  const [promoDetails, setPromoDetails] = useState<any>(null);
  const [discount, setDiscount] = useState(0);

  const { colors } = useBookingStorage({});

  // Map frontend payment method names to database enum values
  const mapPaymentMethodToEnum = (method: string): string => {
    switch (method) {
      case "payAtHotel":
        return "pay_at_hotel";
      case "gateway":
        return "payment_gateway";
      default:
        return "pay_at_hotel";
    }
  };

  // Helper function to check which gateway integration is available
  const getActiveGateway = (): 'fikafi' | 'ngenius' | null => {
    if (!bankDetails?.selectedPaymentIntegrations || !bankDetails.paymentGateway) {
      return null;
    }

    // Check for Fikafi first (priority)
    const hasFikafi = bankDetails.selectedPaymentIntegrations.some(
      integration => 
        integration.paymentIntegration.name.toLowerCase() === 'fikafi' &&
        integration.isActive &&
        integration.paymentIntegration.isActive
    );

    if (hasFikafi) return 'fikafi';

    // Check for Network Global (N-Genius)
    const hasNgenius = bankDetails.selectedPaymentIntegrations.some(
      integration => 
        integration.paymentIntegration.name.toLowerCase() === 'network_global' &&
        integration.isActive &&
        integration.paymentIntegration.isActive
    );

    if (hasNgenius) return 'ngenius';

    return null;
  };

  useEffect(() => {
    if (finalPrice?.totalAmount) {
      setUpdatedPrice(finalPrice.totalAmount - discount);
    }
  }, [finalPrice?.totalAmount, discount]);

  useEffect(() => {
    const fetchBankDetails = async () => {
      if (!PropertyId) {
        console.warn("No PropertyId available, skipping payment details fetch");
        setBankDetailsLoading(false);
        return;
      }

      try {
        setBankDetailsLoading(true);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/property-management/property/${PropertyId}/payment-details`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || "Failed to fetch payment details");
        }

        console.log("💳 Fetched Bank Details:", data?.data);
        setBankDetails(data?.data);
      } catch (error) {
        console.error("❌ Error fetching payment details:", error);
        toast.error(
          "Failed to load payment methods. Please refresh the page.",
          {
            id: "payment-details-error",
          }
        );
      } finally {
        setBankDetailsLoading(false);
      }
    };

    fetchBankDetails();
  }, [PropertyId]);

  useEffect(() => {
    if (!bankDetails) return;

    console.log("📋 Processing Bank Details:", bankDetails);
    console.log("💳 paymentGateway:", bankDetails.paymentGateway);
    console.log("🏨 payAtHotel:", bankDetails.payAtHotel);
    console.log("🔌 selectedPaymentIntegrations:", bankDetails.selectedPaymentIntegrations);

    const methods: string[] = [];
    
    // Add Pay at Hotel if enabled
    if (bankDetails.payAtHotel) {
      methods.push("payAtHotel");
      console.log("✅ Pay at Hotel is available");
    }

    // Determine which gateway is active
    const gateway = getActiveGateway();
    setActiveGateway(gateway);

    if (gateway) {
      methods.push("gateway");
      console.log(`✅ Online Payment Gateway is available (${gateway})`);
    } else if (bankDetails.paymentGateway) {
      console.log("⚠️ Payment Gateway is enabled but no valid integration found");
    }

    console.log("✅ Final available payment methods:", methods);

    setAvailableMethods(methods);
    setNoAvailablePayment(methods.length === 0);

    // Auto-select the first available method if none is selected
    if (!selectedPayment && methods.length > 0) {
      setSelectedPayment(methods[0]);
    }
  }, [bankDetails, selectedPayment]);

  // Check if a payment method is available
  const isMethodAvailable = (methodKey: string): boolean => {
    if (!bankDetails) return false;

    switch (methodKey) {
      case "payAtHotel":
        return bankDetails.payAtHotel;
      case "gateway":
        return bankDetails.paymentGateway && activeGateway !== null;
      default:
        return false;
    }
  };

  // Get guest name from booking details
  const getGuestName = () => {
    if (guest && guest.length > 0) {
      return `${guest[0].firstName} ${guest[0].lastName}`;
    }
    return email || "Guest";
  };

  // Get guest phone from booking details
  const getGuestPhone = () => {
    return bookingDetails.phone || "";
  };

  // Get guest email from booking details
  const getGuestEmail = () => {
    return email || "";
  };

  // Show loading state while payment details are being fetched
  if (bankDetailsLoading) {
    return (
      <div className="max-w-6xl pt-32 mx-auto p-6 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: colors.primaryColor }}></div>
          <p className="mt-4 text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  // Safely extract rooms and guest count
  let rooms = 0;
  let adults = 0;
  let children = 0;

  if (
    guests &&
    typeof guests === "object" &&
    "rooms" in guests &&
    Array.isArray(guests.rooms)
  ) {
    rooms = guests.rooms.length;
    adults = guests.rooms.reduce((sum, r) => sum + (r.adults || 0), 0);
    children = guests.rooms.reduce((sum, r) => sum + (r.children || 0), 0);
  }

  const handleConfirmBooking = async () => {
    setLoading(true);
    setError(null);
    try {
      // If gateway payment is selected, route to appropriate handler
      if (selectedPayment === "gateway") {
        if (activeGateway === "ngenius") {
          await handleNGeniusPayment();
          return;
        }
        // For Fikafi, the FikafiPaymentButton handles the flow
        // We just create the booking first
      }

      // For payAtHotel or Fikafi (before payment), create booking
      const bookingData = {
        data: {
          bookingDetails: {
            startDate: checkIn,
            endDate: checkOut,
            propertyCode: bookingDetails.PropertyCode,
            hotelName,
            roomTypeCode,
            numberOfRooms: bookingDetails.numberOfRooms || 1,
            finalPrice: {
              ...finalPrice,
              totalAmount: updatedPrice,
            },
            promoCode: promoDetails || null,
            currency: currencyCode,
            email,
            phone: bookingDetails.phone,
            guests: guests,
            guestDetails: guest,
            ratePlanCode: bookingDetails.ratePlanCode,
            paymentMethod: mapPaymentMethodToEnum(selectedPayment || ""),
            bookingSource: bookingDetails.bookingSource,
            selectedPromotions: bookingDetails.selectedPromotions || [],
            selectedAddons: bookingDetails.selectedAddons || [],
          },
          bankDetails,
          guestDetails: guest,
        },
      };

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

      const data = await response.json();

      if (!response.ok) {
        if (data?.errors && Array.isArray(data.errors)) {
          data.errors.forEach((err: string) => toast.error(err, { id: err }));
        } else {
          toast.error(data.message || "Booking failed", {
            id: "booking-error",
          });
        }
        throw new Error(data.message || "Booking failed");
      }

      const newBookingCode = data.data.bookingCode;
      setBookingCodeValue(newBookingCode);
      dispatch(setBookingCode(newBookingCode));
      dispatch(setBookingStatus(data.data.bookingStatus));
      dispatch(setFullBookingDetails(data.data));
      document.cookie = "can_access_payment=true; path=/";

      // If Fikafi gateway, trigger Fikafi payment flow
      if (selectedPayment === "gateway" && activeGateway === "fikafi") {
        toast.success("Booking confirmed! Redirecting to payment...", {
          id: "booking-success",
          duration: 2000,
        });
        // The FikafiPaymentButton will handle the payment flow
        return;
      }

      toast.success("Booking confirmed! Please check your email for details.", {
        id: "booking-success",
        duration: 2000,
      });

      setTimeout(() => {
        router.replace("/PaymentSuccess");
      }, 1500);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.", {
        id: "generic-error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNGeniusPayment = async () => {
    try {
      setLoading(true);

      if (!updatedPrice || updatedPrice <= 0) {
        toast.error("Invalid booking amount. Please try again.");
        return;
      }

      if (!email || !checkIn || !checkOut) {
        toast.error("Missing required booking information.");
        return;
      }

      const isAED = currencyCode === "AED";
      const amountInSmallestUnit = Math.round(updatedPrice * 100);
      const gatewayCurrency = currencyCode === "USD" ? "AED" : currencyCode;

      toast.loading("Creating secure payment order...", { id: "ngenius-order" });

      const orderResponse = await ngeniusService.createOrder({
        action: "PURCHASE",
        amount: {
          currencyCode: gatewayCurrency,
          value: amountInSmallestUnit,
        },
        merchantAttributes: {
          redirectUrl: `${window.location.origin}/paymentCallback`,
          skipConfirmationPage: true,
        },
        emailAddress: email.trim(),
      });

      if (!orderResponse?.data?.orderReference || !orderResponse?.data?.paymentUrl) {
        throw new Error("Invalid response from payment gateway");
      }

      toast.dismiss("ngenius-order");

      const orderReference = orderResponse.data.orderReference;

      localStorage.setItem("ngeniusOrderRef", orderReference);
      localStorage.setItem(
        "pendingBookingData",
        JSON.stringify({
          data: {
            bookingDetails: {
              startDate: checkIn,
              endDate: checkOut,
              propertyCode: bookingDetails.PropertyCode,
              hotelName: hotelName,
              roomTypeCode: roomTypeCode,
              numberOfRooms: bookingDetails.numberOfRooms || 1,
              finalPrice: {
                ...finalPrice,
                totalAmount: updatedPrice,
              },
              promoCode: promoDetails || null,
              currency: currencyCode,
              email: email.trim(),
              phone: bookingDetails.phone,
              guests: guests,
              guestDetails: guest,
              ratePlanCode: bookingDetails.ratePlanCode,
              paymentMethod: mapPaymentMethodToEnum("gateway"),
              bookingSource: bookingDetails.bookingSource,
            },
            guestDetails: guest,
            bankDetails: bankDetails || null,
          },
        })
      );

      console.log("🔌 Establishing WebSocket connection before payment redirect...");
      toast.loading("Connecting to payment system...", { id: "socket-connect" });

      try {
        const { default: io } = await import('socket.io-client');

        const socket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}`, {
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          autoConnect: true,
        });

        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Socket connection timeout'));
          }, 5000);

          socket.on('connect', () => {
            clearTimeout(timeout);
            console.log('✅ Socket connected before payment redirect:', socket.id);

            socket.emit('join-payment-room', orderReference);
            console.log(`📌 Joined payment room: payment:${orderReference}`);

            resolve();
          });

          socket.on('connect_error', (error: any) => {
            clearTimeout(timeout);
            console.error('❌ Socket connection error:', error);
            reject(error);
          });
        });

        toast.dismiss("socket-connect");
        console.log("✅ WebSocket connection established successfully");

        localStorage.setItem("socketConnected", "true");

      } catch (socketError) {
        console.warn("⚠️ Could not establish socket connection, will use fallback polling:", socketError);
        toast.dismiss("socket-connect");
      }

      toast.success("Redirecting to secure payment gateway...", {
        id: "redirect-payment",
        duration: 2000,
      });

      setTimeout(() => {
        window.location.href = orderResponse.data.paymentUrl;
      }, 1800);

    } catch (err: any) {
      console.error("❌ N-Genius payment initiation failed:", err);
      toast.dismiss("ngenius-order");
      toast.dismiss("socket-connect");

      const message =
        err?.message?.includes("network") || err?.message?.includes("fetch")
          ? "Network error. Please check your connection and try again."
          : err?.message || "Failed to initiate payment. Please try again later.";

      toast.error(message, {
        id: "ngenius-error",
        duration: 6000,
      });

      setLoading(false);
    }
  };

  const renderPaymentDetails = (paymentType: string) => {
    if (selectedPayment !== paymentType) return null;

    switch (paymentType) {
      case "payAtHotel":
        return (
          <div className="mt-4 p-4 border rounded-lg" style={{
            backgroundColor: `${colors.secondaryColor}10`,
            borderColor: colors.primaryColor
          }}>
            <h4 className="font-medium mb-2" style={{ color: colors.primaryColor }}>Pay at Hotel</h4>
            <p className="text-sm" style={{ color: colors.primaryColor }}>
              Your booking will be confirmed and you can pay directly at the
              hotel during check-in. We accept cash, cards, and digital payments
              at the property.
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs" style={{ color: colors.primaryColor }}>
              <span>✓ No advance payment required</span>
              <span>✓ Flexible payment options</span>
            </div>
          </div>
        );

      case "gateway":
        // Render different content based on active gateway
        if (activeGateway === "fikafi") {
          return (
            <div className="mt-4 p-4 border rounded-lg" style={{
              backgroundColor: `${colors.secondaryColor}10`,
              borderColor: colors.primaryColor
            }}>
              <h4 className="font-medium mb-2 flex items-center gap-2" style={{ color: colors.primaryColor }}>
                <Wallet className="w-4 h-4" />
                Secure Online Payment
              </h4>
              <p className="text-sm" style={{ color: colors.primaryColor }}>
                You'll be redirected to our secure payment partner to complete your payment
                using credit/debit card, net banking, or other online payment methods.
              </p>

              {/* Fikafi Payment Button */}
              <div className="mt-4">
                <FikafiPaymentButton
                  bookingCode={bookingCode || "PENDING_BOOKING"}
                  amount={updatedPrice}
                  currency={currencyCode}
                  guestName={getGuestName()}
                  guestEmail={getGuestEmail()}
                  guestPhone={getGuestPhone()}
                  propertyName={propertyName}
                  propertyId={PropertyId || "UNKNOWN_PROPERTY"}
                  checkInDate={checkIn}
                  numberOfNights={nights}
                  paymentMethod="payment_gateway"
                  onPaymentLinkGenerated={(paymentLink, paymentId) => {
                    console.log('Payment link generated:', paymentLink);
                    toast.success("Redirecting to payment...", { id: "fikafi-success" });
                  }}
                  onPaymentError={(error) => {
                    console.error('Fikafi error:', error);
                    toast.error("Payment failed. Please try again.", { id: "fikafi-error" });
                  }}
                  buttonText="Pay Now"
                  className="w-full"
                />
              </div>

              <div className="mt-3 flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <CreditCard className="h-4 w-4" />
                  <span>Visa</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <CreditCard className="h-4 w-4" />
                  <span>Mastercard</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  <span>Secure SSL</span>
                </div>
              </div>
            </div>
          );
        } else if (activeGateway === "ngenius") {
          return (
            <div
              className="mt-4 p-5 border rounded-xl shadow-sm"
              style={{
                backgroundColor: `${colors.secondaryColor}08`,
                borderColor: `${colors.primaryColor}60`,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <h4
                  className="font-semibold text-lg"
                  style={{ color: colors.primaryColor }}
                >
                  Pay with Card
                </h4>
                <div className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-800">
                  Secure
                </div>
              </div>

              <p
                className="text-sm mb-4 leading-relaxed"
                style={{ color: colors.primaryColor }}
              >
                Complete your payment securely via Network International payment gateway.
                You will be redirected to their encrypted payment page.
              </p>

              <div className="flex flex-wrap gap-3 mb-4">
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <CreditCard className="h-4 w-4" />
                  <span>Visa</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <CreditCard className="h-4 w-4" />
                  <span>Mastercard</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <CreditCard className="h-4 w-4" />
                  <span>American Express</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <CreditCard className="h-4 w-4" />
                  <span>Discover</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-green-700 font-medium">
                  <ShieldCheck className="h-4 w-4 text-green-600" />
                  <span>3D Secure</span>
                </div>
              </div>

              <div className="mt-2 p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-blue-800 flex items-start gap-2">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  You will be securely redirected to the payment page to
                  complete your transaction.
                </span>
              </div>

              <p className="mt-3 text-xs text-gray-500 italic">
                Supported cards processed in seconds • No hidden fees
              </p>
            </div>
          );
        }
        return null;

      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl pt-32 mx-auto p-6 grid md:grid-cols-3 gap-6">
      {/* Left Side */}
      <div className="md:col-span-2 space-y-6">
        {/* Booking Summary */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
          <h2 className="text-lg font-semibold mb-4" style={{ color: colors.primaryColor }}>
            Booking Summary
          </h2>
          <div className="text-sm text-gray-800 space-y-1">
            <p>
              <strong>Stay Dates:</strong> {checkIn} - {checkOut} ({nights}{" "}
              night{nights > 1 ? "s" : ""})
            </p>
            <p>
              <strong>Guests:</strong> {rooms || 1} Room · {adults || 1} Adult
              {adults !== 1 ? "s" : ""}
              {children > 0
                ? ` · ${children} Child${children !== 1 ? "ren" : ""}`
                : ""}
            </p>
            <p>
              <strong>Guest Name:</strong>{" "}
              {guest && guest.length > 0
                ? `${guest[0].firstName} ${guest[0].lastName}`
                : ""}{" "}
              <br />
              <span className="text-gray-500">
                <strong>Email:</strong> {email}
              </span>
            </p>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
          <h2 className="text-lg font-semibold mb-4" style={{ color: colors.primaryColor }}>
            Choose Payment Method
          </h2>

          {noAvailablePayment ? (
            <div className="px-4 py-3 rounded-lg mb-4 text-sm" style={{
              backgroundColor: `${colors.secondaryColor}20`,
              color: colors.primaryColor
            }}>
              <strong>No payment methods available</strong>
              <p className="mt-1">
                Please contact the hotel directly for payment arrangements.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {[
                {
                  key: "payAtHotel",
                  label: "Pay at Hotel",
                  icon: "🏨",
                  description: "Pay directly at the property during check-in",
                },
                {
                  key: "gateway",
                  label: "Pay Online",
                  icon: "💳",
                  description: activeGateway === "fikafi" 
                    ? "Secure payment via Fikafi payment gateway"
                    : activeGateway === "ngenius"
                    ? "Secure payment via Network International gateway"
                    : "Secure online payment",
                  isRecommended: true,
                },
              ].map(({ key, label, icon, description, isRecommended }) => {
                const isActive = isMethodAvailable(key);
                const isSelected = selectedPayment === key;

                return (
                  <div
                    key={key}
                    className={`border-2 rounded-xl transition-all ${isActive
                      ? isSelected
                        ? `bg-orange-50`
                        : "border-gray-200 hover:border-gray-300 bg-white"
                      : "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"
                      }`}
                    style={isActive && isSelected ? {
                      borderColor: colors.primaryColor,
                      backgroundColor: `${colors.secondaryColor}10`
                    } : {}}
                  >
                    <label
                      className={`block p-4 ${isActive ? "cursor-pointer" : "cursor-not-allowed"
                        }`}
                    >
                      <div className="flex items-start space-x-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          disabled={!isActive}
                          checked={isSelected}
                          onChange={() => isActive && setSelectedPayment(key)}
                          className="mt-1 h-4 w-4"
                          style={{ accentColor: colors.primaryColor }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{icon}</span>
                            <span className="font-medium text-gray-900">
                              {label}
                            </span>
                            {isRecommended && isActive && (
                              <span className="text-xs text-white bg-green-500 px-2 py-1 rounded">
                                Recommended
                              </span>
                            )}
                            {!isActive && (
                              <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                                Not Available
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{description}</p>
                          {renderPaymentDetails(key)}
                        </div>
                      </div>
                    </label>
                  </div>
                );
              })}
            </div>
          )}

          {/* Only show confirm button for non-Fikafi payments or when Fikafi payment button is not rendered */}
          {selectedPayment !== "gateway" || activeGateway !== "fikafi" ? (
            <button
              onClick={handleConfirmBooking}
              className={`mt-6 w-full py-3 px-4 rounded-xl font-medium transition-all transform ${loading ||
                noAvailablePayment ||
                !selectedPayment
                ? "bg-gray-400 cursor-not-allowed opacity-50"
                : "text-white hover:scale-[1.02]"
                }`}
              style={!(loading || noAvailablePayment || !selectedPayment) ? {
                backgroundColor: colors.primaryColor,
                color: colors.buttonTextColor
              } : {}}
              disabled={
                loading ||
                noAvailablePayment ||
                !selectedPayment
              }
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : !selectedPayment ? (
                "Select Payment Method"
              ) : (
                "Confirm Booking"
              )}
            </button>
          ) : null}

          {error && (
            <p className="mt-3 text-red-600 font-medium text-center text-sm bg-red-50 p-2 rounded">
              {error}
            </p>
          )}
        </div>
      </div>

      {/* Right Side */}
      <div className="space-y-6">
        <PriceDetails
          bookingDetails={bookingDetails}
          onPriceUpdate={(total, discountAmount, promo) => {
            setUpdatedPrice(total);
            setDiscount(discountAmount);
            setPromoDetails(promo);
          }}
        />

        <HelpBox />
      </div>
    </div>
  );
};

export default BookingReviewPage;
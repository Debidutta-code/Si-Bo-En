"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useRouter } from "next/navigation";
import {
  DollarSign,
  CreditCard,
  Check,
  Upload,
  X,
  Camera,
} from "lucide-react";
import toast from "react-hot-toast";
import { setBookingCode, setBookingStatus, setFullBookingDetails } from "@/src/store/bookingSlice";
import PriceDetails from "@/src/components/payment/PriceDetails";
import HelpBox from "@/src/components/payment/HelpBox";
import { useBookingStorage } from "@/src/hooks/useBookingStorage";

// Simplified BankDetails interface based on current API response
interface BankDetails {
  id: string;
  payAtHotel: boolean;
  paymentGateway: boolean;
  propertyId: string;
  createdAt: string;
  updatedAt: string;
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
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [bankDetailsLoading, setBankDetailsLoading] = useState(true);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [availableMethods, setAvailableMethods] = useState<string[]>([]);
  const [noAvailablePayment, setNoAvailablePayment] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);

  // Image upload states (not needed for payAtHotel or gateway)
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(
    null
  );
  const [imageUploading, setImageUploading] = useState(false);
  const [cloudinaryImageUrl, setCloudinaryImageUrl] = useState<string | null>(
    null
  );
  const dispatch = useDispatch();
  const nights = finalPrice?.numberOfNights || 0;
  const totalAmount = finalPrice?.totalAmount || 0;
  const [updatedPrice, setUpdatedPrice] = useState(totalAmount);
  const [promoDetails, setPromoDetails] = useState<any>(null);
  const [discount, setDiscount] = useState(0);

  // Add the hook usage at the component level
  const { colors } = useBookingStorage({});

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
        console.log("💡 Payment Details Response:", data);

        if (!response.ok) {
          throw new Error(data?.message || "Failed to fetch payment details");
        }

        setBankDetails(data?.data);
        console.log("✅ Payment details fetched successfully");
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

    // Check which payment methods are available
    const methods: string[] = [];
    
    if (bankDetails.payAtHotel) {
      methods.push("payAtHotel");
    }
    
    if (bankDetails.paymentGateway) {
      methods.push("gateway");
    }

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
        return bankDetails.paymentGateway;
      default:
        return false;
    }
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
            paymentMethod: selectedPayment,
            bookingSource: bookingDetails.bookingSource,
            selectedPromotions: bookingDetails.selectedPromotions ||[],
            selectedAddons: bookingDetails.selectedAddons ||[],
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

      dispatch(setBookingCode(data.data.bookingCode));
      dispatch(setBookingStatus(data.data.bookingStatus));
      dispatch(setFullBookingDetails(data.data));
      document.cookie = "can_access_payment=true; path=/";

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
        return (
          <div className="mt-4 p-4 border rounded-lg" style={{
            backgroundColor: `${colors.secondaryColor}10`,
            borderColor: colors.primaryColor
          }}>
            <h4 className="font-medium mb-2" style={{ color: colors.primaryColor }}>
              Online Payment Gateway
            </h4>
            <p className="text-sm" style={{ color: colors.primaryColor }}>
              You'll be redirected to a secure payment gateway where you can pay
              using your credit/debit card, net banking, or other online payment methods.
            </p>
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
                  label: "Online Payment",
                  icon: "💳",
                  description: "Secure payment via card/netbanking/UPI",
                },
              ].map(({ key, label, icon, description }) => {
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
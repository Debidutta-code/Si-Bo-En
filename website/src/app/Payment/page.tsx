"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useRouter } from "next/navigation";
import {
  DollarSign,
  CreditCard,
  Copy,
  Check,
  Upload,
  X,
  Camera,
} from "lucide-react";
import toast from "react-hot-toast";
import { setBookingCode, setBookingStatus, setFullBookingDetails } from "@/src/store/bookingSlice";
import { QRCodeCanvas } from "qrcode.react";
import PriceDetails from "@/src/components/payment/PriceDetails";
import HelpBox from "@/src/components/payment/HelpBox";

// Define the type of bankDetails
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
  propertyId: string;
  updatedAt: string;
  id: string;
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
    PropertyDetails
  } = bookingDetails;
  console.log("wsdfs",bookingDetails)
  const ratePlanCode = finalPrice?.dailyBreakdown?.[0]?.ratePlanCode;
  const currencyCode = finalPrice?.dailyBreakdown?.[0]?.currencyCode || "INR";
  const roomTypeCode = bookingDetails.roomTypeCode;
  const propertyCode = bookingDetails.PropertyCode;
  const PropertyId=bookingDetails.PropertyDetails?.id;
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [bankDetailsLoading, setBankDetailsLoading] = useState(true);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [availableMethods, setAvailableMethods] = useState<string[]>([]);
  const [noAvailablePayment, setNoAvailablePayment] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Image upload states
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
  useEffect(() => {
    if (finalPrice?.totalAmount) {
      setUpdatedPrice(finalPrice.totalAmount - discount);
    }
  }, [finalPrice?.totalAmount, discount]);
  useEffect(() => {
    const fetchBankDetails = async () => {
      if (!propertyCode) {
        console.warn(" No propertyCode available, skipping bank details fetch");
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
        console.log("💡 Bank Details Response:", data);

        if (!response.ok) {
          throw new Error(data?.message || "Failed to fetch bank details");
        }

        setBankDetails(data?.data);
        console.log("✅ Bank details fetched successfully");
      } catch (error) {
        console.error("❌ Error fetching bank details:", error);
        toast.error(
          "Failed to load payment methods. Please refresh the page.",
          {
            id: "bank-details-error",
          }
        );
      } finally {
        setBankDetailsLoading(false);
      }
    };

    fetchBankDetails();
  }, [propertyCode]);

  useEffect(() => {
    if (!bankDetails?.activatedPaymentMethod) return;

    const activated = bankDetails.activatedPaymentMethod;
    const methods = Object.entries(activated)
      .filter(([_, value]) => value === true)
      .map(([key]) => key);

    setAvailableMethods(methods);
    setNoAvailablePayment(methods.length === 0);
  }, [bankDetails]);

  // Reset image states when payment method changes
  useEffect(() => {
    if (selectedPayment !== "bankTransfer" && selectedPayment !== "upi") {
      setPaymentProof(null);
      setPaymentProofPreview(null);
      setCloudinaryImageUrl(null);
    }
  }, [selectedPayment]);

  // Copy to clipboard function
  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast.success(`${fieldName} copied to clipboard!`, { duration: 2000 });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  // Handle image selection and upload
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // ✅ Validate file type and size
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setPaymentProof(file);

    // ✅ Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPaymentProofPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // ✅ Upload to backend API
    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (result.status === "success") {
        const imageUrl = result.data.urls[0].secure_url;
        setCloudinaryImageUrl(imageUrl);
        toast.success("Payment screenshot uploaded successfully!");
      } else {
        throw new Error(result.message || "Upload failed");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image. Please try again.");
      setPaymentProof(null);
      setPaymentProofPreview(null);
    } finally {
      setImageUploading(false);
    }
  };

  // Remove uploaded image
  const removeImage = () => {
    setPaymentProof(null);
    setPaymentProofPreview(null);
    setCloudinaryImageUrl(null);

    // Clear the file input
    const fileInput = document.getElementById(
      "payment-proof"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  // Check if payment method requires image and if image is provided
  const requiresImage =
    selectedPayment === "bankTransfer" || selectedPayment === "upi";
  const hasRequiredImage = !requiresImage || cloudinaryImageUrl !== null;

  // Show loading state while bank details are being fetched
  if (bankDetailsLoading) {
    return (
      <div className="max-w-6xl pt-32 mx-auto p-6 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
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
        totalAmount: updatedPrice,   // <-- send discounted price
      },
            promoCode: promoDetails || null, // <-- send applied promo code
            currency: currencyCode,
            email,
            phone: bookingDetails.phone,
            guests: guests,
            guestDetails: guest,
            ratePlanCode:bookingDetails.ratePlanCode,
            paymentMethod: selectedPayment,
            // Include payment proof URL if available
            ...(cloudinaryImageUrl && { paymentProof: cloudinaryImageUrl }),
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

      dispatch(setBookingCode(data.bookingCode));
      dispatch(setBookingStatus(data.status));
      dispatch(setFullBookingDetails(data.booking));
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
      case "bankTransfer":
        return (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-3">
              Bank Transfer Details
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between flex-col sm:flex-row items-center">
                <span className="text-gray-600">Account Holder</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {bankDetails?.accountHolder}
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        bankDetails?.accountHolder || "",
                        "Account Holder"
                      )
                    }
                    className="p-1 hover:bg-blue-200 rounded transition-colors"
                  >
                    {copiedField === "Account Holder" ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex justify-between flex-col sm:flex-row items-center">
                <span className="text-gray-600">Account Number</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium font-mono">
                    {bankDetails?.accountNumber}
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        bankDetails?.accountNumber || "",
                        "Account Number"
                      )
                    }
                    className="p-1 hover:bg-blue-200 rounded transition-colors"
                  >
                    {copiedField === "Account Number" ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex justify-between flex-col sm:flex-row items-center">
                <span className="text-gray-600">IFSC Code</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium font-mono">
                    {bankDetails?.ifsc}
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(bankDetails?.ifsc || "", "IFSC Code")
                    }
                    className="p-1 hover:bg-blue-200 rounded transition-colors"
                  >
                    {copiedField === "IFSC Code" ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-xs text-yellow-800">
                  <strong>Important:</strong> Open your banking app and complete
                  the transfer using the details above. Your booking will be
                  confirmed once the payment is received.
                </p>
              </div>
            </div>
          </div>
        );

      case "upi":
        return (
          <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-3 text-lg sm:text-xl">
              UPI Payment Details
            </h4>

            <div className="space-y-6">
              {/* UPI ID row */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <span className="text-gray-600 text-sm sm:text-base">
                  UPI ID:
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-medium font-mono text-sm sm:text-base break-all">
                    {bankDetails?.upiId}
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(bankDetails?.upiId || "", "UPI ID")
                    }
                    className="p-1 hover:bg-purple-200 rounded transition-colors"
                  >
                    {copiedField === "UPI ID" ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              {/* QR Code Section */}
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Scan QR Code to Pay:
                </p>
                <div className="inline-block sm:p-2   bg-white rounded-lg border">
                  <QRCodeCanvas
                    value={`upi://pay?pa=${bankDetails?.upiId}&am=${updatedPrice}&cu=INR&tn=Hotel Booking Payment`}
                    size={150}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Amount: ₹{updatedPrice}
                </p>
              </div>

              {/* Payment Note */}
              <div className="p-3 bg-green-50 border border-green-200 rounded text-center">
                <p className="text-sm text-green-800">
                  <strong>Quick Payment:</strong> Open any UPI app, scan the QR
                  code, and complete the payment. Your booking will be confirmed
                  once the payment is received.
                </p>
              </div>
            </div>
          </div>
        );

      case "payAtHotel":
        return (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Pay at Hotel</h4>
            <p className="text-sm text-green-800">
              Your booking will be confirmed and you can pay directly at the
              hotel during check-in. We accept cash, cards, and digital payments
              at the property.
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-green-700">
              <span>✓ No advance payment required</span>
              <span>✓ Flexible payment options</span>
            </div>
          </div>
        );

      case "gateway":
        return (
          <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
            <h4 className="font-medium text-indigo-900 mb-2">
              Online Payment Gateway
            </h4>
            <p className="text-sm text-indigo-800">
              You'll be redirected to a secure payment gateway where you can pay
              using your credit/debit card, net banking, or UPI.
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
          <h2 className="text-lg font-semibold text-orange-600 mb-4">
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
          <h2 className="text-lg font-semibold text-orange-600 mb-4">
            Choose Payment Method
          </h2>

          {noAvailablePayment ? (
            <div className="bg-orange-50 text-orange-700 px-4 py-3 rounded-lg mb-4 text-sm">
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
                  color: "orange",
                },
                {
                  key: "bankTransfer",
                  label: "Bank Transfer",
                  icon: "🏦",
                  description:
                    "Transfer funds directly to hotel's bank account",
                  color: "orange",
                },
                {
                  key: "upi",
                  label: "UPI Payment",
                  icon: "📱",
                  description: "Pay instantly using UPI with QR code",
                  color: "orange",
                },
                {
                  key: "gateway",
                  label: "Online Payment",
                  icon: "💳",
                  description: "Secure payment via card/netbanking/UPI",
                  color: "orange",
                },
              ].map(({ key, label, icon, description, color }) => {
                const isActive =
                  bankDetails?.activatedPaymentMethod?.[
                    key as keyof typeof bankDetails.activatedPaymentMethod
                  ];
                const isSelected = selectedPayment === key;

                return (
                  <div
                    key={key}
                    className={`border-2 rounded-xl transition-all ${
                      isActive
                        ? isSelected
                          ? `border-${color}-600 bg-${color}-50`
                          : "border-gray-200 hover:border-gray-300 bg-white"
                        : "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"
                    }`}
                  >
                    <label
                      className={`block p-4 ${
                        isActive ? "cursor-pointer" : "cursor-not-allowed"
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          disabled={!isActive}
                          checked={isSelected}
                          onChange={() => isActive && setSelectedPayment(key)}
                          className="mt-1 h-4 w-4 accent-orange-600"
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

          {/* Image Upload Section */}
          {(selectedPayment === "bankTransfer" ||
            selectedPayment === "upi") && (
            <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Camera className="h-5 w-5 text-orange-600" />
                <h5 className="font-medium text-orange-900">
                  Payment Screenshot Required *
                </h5>
              </div>
              <p className="text-sm text-orange-800 mb-4">
                Please upload a screenshot of your payment confirmation.
              </p>

              {!paymentProofPreview ? (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="payment-proof"
                    disabled={imageUploading}
                  />
                  <label
                    htmlFor="payment-proof"
                    className={`block w-full p-4 border-2 border-dashed border-orange-300 rounded-xl text-center cursor-pointer hover:border-orange-400 transition-colors ${
                      imageUploading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      {imageUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                          <span className="text-orange-600 text-sm">
                            Uploading...
                          </span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 text-orange-600" />
                          <span className="text-orange-600 font-medium">
                            Click to upload payment screenshot
                          </span>
                          <span className="text-xs text-gray-500">
                            PNG, JPG up to 5MB
                          </span>
                        </>
                      )}
                    </div>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <div className="border border-orange-300 rounded-xl p-2 bg-white">
                    <img
                      src={paymentProofPreview}
                      alt="Payment proof"
                      className="w-full max-w-sm mx-auto rounded object-contain"
                      style={{ maxHeight: "200px" }}
                    />
                  </div>
                  <button
                    onClick={removeImage}
                    className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                    title="Remove image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="mt-2 flex items-center justify-center gap-2 text-sm">
                    {cloudinaryImageUrl ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <Check className="h-4 w-4" />
                        Image uploaded successfully
                      </span>
                    ) : (
                      <span className="text-orange-600">Processing...</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleConfirmBooking}
            className={`mt-6 w-full py-3 px-4 rounded-xl font-medium transition-all transform ${
              loading ||
              noAvailablePayment ||
              !selectedPayment ||
              !hasRequiredImage
                ? "bg-gray-400 cursor-not-allowed opacity-50"
                : "bg-orange-600 hover:bg-orange-700 text-white hover:scale-[1.02]"
            }`}
            disabled={
              loading ||
              noAvailablePayment ||
              !selectedPayment ||
              !hasRequiredImage
            }
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </div>
            ) : !selectedPayment ? (
              "Select Payment Method"
            ) : requiresImage && !cloudinaryImageUrl ? (
              "Upload Payment Screenshot to Continue"
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

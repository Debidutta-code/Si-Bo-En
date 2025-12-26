import React, { useEffect, useRef, useState } from "react";
import { X, Info, Loader2, CheckCircle2, Mail, Phone, User, Calendar } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { useBookingStorage } from "@/src/hooks/useBookingStorage";
import axios from "axios"; // Add this import if axios is not already available

interface Guest {
  type: "adult" | "child";
  firstName: string;
  lastName: string;
  dateOfBirth: string;
}
interface Props {
  guestForms: Guest[];
  contactInfo: { email: string; phoneNumber: string };
  price: number | null;
  finalPrice: any;
  loadingPrice: boolean;
  errorPrice: string | null;
  bookingRoom: any;
  bookingContext: any;
  onClose: () => void;
  handleGuestDetailChange: (
    index: number,
    field: keyof Guest,
    value: string
  ) => void;
  handleContactChange: (field: "email" | "phoneNumber", value: string) => void;
  onSubmit: () => void;
}

const GuestFormModal: React.FC<Props> = ({
  guestForms,
  contactInfo,
  price,
  finalPrice,
  bookingContext,
  onClose,
  handleGuestDetailChange,
  handleContactChange,
  onSubmit,
}) => {
  const { colors } = useBookingStorage(bookingContext);
  const [errors, setErrors] = useState<any>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setShowTooltip(false);
      }
    };

    if (showTooltip) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTooltip]);

  useEffect(() => {
    if (otpSent && countdown > 0) {
      const interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [otpSent, countdown]);

  const validate = (): boolean => {
    const newErrors: any = {};
    const nameRegex = /^[A-Za-z\s]+$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^[0-9]{10}$/;

    guestForms.forEach((guest, index) => {
      const gErrors: any = {};
      if (!guest.firstName.trim()) gErrors.firstName = "First name is required.";
      else if (!nameRegex.test(guest.firstName)) gErrors.firstName = "Invalid name format.";
      if (!guest.lastName.trim()) gErrors.lastName = "Last name is required.";
      else if (!nameRegex.test(guest.lastName)) gErrors.lastName = "Invalid name format.";
      if (Object.keys(gErrors).length > 0) newErrors[`guest-${index}`] = gErrors;
    });

    if (!contactInfo.email.trim()) newErrors.email = "Email is required.";
    else if (!emailRegex.test(contactInfo.email)) newErrors.email = "Invalid email address.";
    if (!contactInfo.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required.";
    else if (!phoneRegex.test(contactInfo.phoneNumber)) newErrors.phoneNumber = "Phone number must be exactly 10 digits.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  const getMaxDOBForAdult = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 18);
    return formatDate(date);
  };

  const getMinDOBForChild = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 17);
    return formatDate(date);
  };

  const getMaxDOBForChild = () => formatDate(new Date());

  const handleSubmit = () => {
    if (!price) {
      setSubmitError("Something went wrong, please try again.");
      return;
    }
    setSubmitError(null);
    const isValid = validate();
    if (!isValid) return;
    setPaymentProcessing(true);
    onSubmit();
  };

  const handleVerifyEmail = async () => {
    const email = contactInfo.email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setErrors((prev: any) => ({ ...prev, email: "Invalid email address." }));
      return;
    }

    try {
      setSendingOtp(true);
      // Call the real API
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/email-service/send-otp`, { email });

      setOtpSent(true);
      setCountdown(120);
      setEmailVerified(false);
    } catch (err: any) {
      console.error("OTP Request Error:", err);
      setErrors((prev: any) => ({
        ...prev,
        email: err.response?.data?.message || "Failed to send OTP. Please try again.",
      }));
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim() || otp.length !== 6) {
      setErrors((prev: any) => ({ ...prev, otp: "Please enter a valid 6-digit OTP." }));
      return;
    }

    try {
      // Call the real API
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/email-service/verify-otp`, { email: contactInfo.email.trim(), otp });

      setEmailVerified(true);
      setOtpSent(false);
      setCountdown(0);
      setOtp("");
      setErrors((prev: any) => {
        const { email: _, otp: __, ...rest } = prev;
        return rest;
      });
    } catch (err: any) {
      console.error("OTP Verify Error:", err);
      setErrors((prev: any) => ({
        ...prev,
        otp: err.response?.data?.message || "Invalid OTP. Please try again.",
      }));
    }
  };

  console.log("Final price", finalPrice);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <CardHeader className="border-b space-y-0 pb-4" style={{ backgroundColor: colors.secondaryColor }}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-white" style={{}}>
              Complete Your Booking
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        {/* Scrollable Content */}
        <CardContent className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Guest Forms */}
          {guestForms.map((guest, index) => {
            const gErr = errors[`guest-${index}`] || {};
            const typeCount = guestForms
              .slice(0, index + 1)
              .filter((g) => g.type === guest.type).length;

            return (
              <Card key={index} className="border-2 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5" style={{ color: colors.primaryColor }} />
                    <CardTitle className="text-lg">
                      {guest.type === "adult" ? `Adult ${typeCount}` : `Child ${typeCount}`}
                    </CardTitle>
                    <Badge variant="outline" style={{ borderColor: colors.primaryColor, color: colors.primaryColor }}>
                      {guest.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`first-${index}`}>
                        First Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id={`first-${index}`}
                        placeholder="First Name"
                        value={guest.firstName}
                        onChange={(e: any) =>
                          handleGuestDetailChange(index, "firstName", e.target.value)
                        }
                        className={gErr.firstName ? "border-red-500" : ""}
                      />
                      {gErr.firstName && (
                        <p className="text-sm text-red-600">{gErr.firstName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`last-${index}`}>
                        Last Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id={`last-${index}`}
                        placeholder="Last Name"
                        value={guest.lastName}
                        onChange={(e: any) =>
                          handleGuestDetailChange(index, "lastName", e.target.value)
                        }
                        className={gErr.lastName ? "border-red-500" : ""}
                      />
                      {gErr.lastName && (
                        <p className="text-sm text-red-600">{gErr.lastName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`dob-${index}`}>
                        <Calendar className="inline h-4 w-4 mr-1" />
                        Date of Birth
                      </Label>
                      <Input
                        id={`dob-${index}`}
                        type="date"
                        min={guest.type === "child" ? getMinDOBForChild() : undefined}
                        max={guest.type === "adult" ? getMaxDOBForAdult() : getMaxDOBForChild()}
                        value={guest.dateOfBirth}
                        onChange={(e: any) =>
                          handleGuestDetailChange(index, "dateOfBirth", e.target.value)
                        }
                        className={gErr.dateOfBirth ? "border-red-500" : ""}
                      />
                      {gErr.dateOfBirth && (
                        <p className="text-sm text-red-600">{gErr.dateOfBirth}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Contact Information */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="h-5 w-5" style={{ color: colors.primaryColor }} />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    id="email"
                    type="email"
                    value={contactInfo.email}
                    onChange={(e: any) => {
                      const newEmail = e.target.value;
                      if (emailVerified && newEmail !== contactInfo.email) {
                        setEmailVerified(false);
                        setOtpSent(false);
                      }
                      handleContactChange("email", newEmail);
                    }}
                    disabled={emailVerified}
                    placeholder="your@email.com"
                    className={`flex-1 ${errors.email ? "border-red-500" : ""} ${emailVerified ? "bg-muted" : ""
                      }`}
                  />
                  {!emailVerified && (
                    <Button
                      onClick={handleVerifyEmail}
                      disabled={sendingOtp || (otpSent && countdown > 0)}
                      style={{ backgroundColor: colors.primaryColor, color: colors.buttonTextColor }}
                      className="whitespace-nowrap"
                    >
                      {sendingOtp ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : otpSent && countdown > 0 ? (
                        `Resend (${countdown}s)`
                      ) : (
                        "Verify Email"
                      )}
                    </Button>
                  )}
                </div>

                {otpSent && countdown > 0 && !emailVerified && (
                  <div className="flex flex-col sm:flex-row gap-2 mt-2">
                    <Input
                      placeholder="Enter OTP"
                      value={otp}
                      maxLength={6}
                      onChange={(e: any) => {
                        setOtp(e.target.value.replace(/\D/g, '')); // Allow only digits
                        setErrors((prev: any) => {
                          const { otp: _, ...rest } = prev;
                          return rest;
                        });
                      }}
                      className={`flex-1 ${errors.otp ? "border-red-500" : ""}`}
                    />
                    <Button
                      onClick={handleVerifyOtp}
                      disabled={otp.trim().length !== 6}
                      className="bg-green-600 hover:bg-green-700 whitespace-nowrap"
                    >
                      Verify OTP
                    </Button>
                  </div>
                )}

                {errors.otp && (
                  <p className="text-sm text-red-600">{errors.otp}</p>
                )}

                {emailVerified && (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <CheckCircle2 className="h-4 w-4" />
                    Email verified
                  </div>
                )}

                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Your booking confirmation will be sent here
                </p>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">
                  <Phone className="inline h-4 w-4 mr-1" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={contactInfo.phoneNumber}
                  maxLength={10}
                  onChange={(e: any) => handleContactChange("phoneNumber", e.target.value.replace(/\D/g, ''))}
                  placeholder="10-digit number"
                  className={errors.phoneNumber ? "border-red-500" : ""}
                />
                {errors.phoneNumber && (
                  <p className="text-sm text-red-600">{errors.phoneNumber}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Used for booking-related notifications
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Price Details */}
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">Price Details</CardTitle>
                <div className="relative" ref={tooltipRef}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full"
                    onClick={() => setShowTooltip(!showTooltip)}
                  >
                    <Info className="h-4 w-4" />
                  </Button>

                  {finalPrice?.dailyBreakdown && showTooltip && (
                    <Card className="absolute top-8 left-0 z-50 w-80 shadow-xl">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">Daily Breakdown</CardTitle>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => setShowTooltip(false)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="max-h-60 overflow-y-auto space-y-3 text-xs">
                        {Array.isArray(finalPrice.dailyBreakdown) ? (
                          finalPrice.dailyBreakdown.map((day: any, idx: number) => (
                            <div key={idx} className="border-b pb-2 last:border-0">
                              <div className="font-semibold mb-1">{day.date}</div>
                              <div className="space-y-1">
                                <div className="flex justify-between">
                                  <span>Base Rate:</span>
                                  <span>${day.baseRate}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Additional Charges:</span>
                                  <span>${day.additionalCharges}</span>
                                </div>
                                <div className="flex justify-between font-semibold">
                                  <span>Total:</span>
                                  <span>${day.totalPerRoom}</span>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span>Base Rate:</span>
                              <span>${finalPrice.dailyBreakdown.baseRate}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Additional Charges:</span>
                              <span>${finalPrice.dailyBreakdown.additionalCharges}</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {finalPrice && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Base Amount:</span>
                    <span>${finalPrice.currency}{finalPrice.breakdown.totalBaseAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Additional Charges:</span>
                    <span>${finalPrice.breakdown.totalAdditionalCharges}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Number of Nights:</span>
                    <span>{finalPrice.numberOfNights}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>${finalPrice.totalTaxAmount || 0}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t-2 font-bold text-lg">
                    <span>Total Amount:</span>
                    <span style={{ color: colors.primaryColor }}>${finalPrice.totalAmount}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {submitError && (
            <Alert variant="destructive">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}
        </CardContent>

        {/* Footer */}
        <div className="border-t p-6 space-y-3 bg-muted/50">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleSubmit}
              disabled={!emailVerified || paymentProcessing || Object.keys(errors).length > 0}
              style={{ backgroundColor: colors.primaryColor, color: colors.buttonTextColor }}
              className="flex-1"
              size="lg"
            >
              {paymentProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                "Proceed to Payment"
              )}
            </Button>
            <Button onClick={onClose} variant="outline" size="lg" className="flex-1 sm:flex-none">
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GuestFormModal;
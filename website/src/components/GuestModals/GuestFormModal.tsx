import React, { useEffect, useRef, useState } from "react";
import { X, Info, Loader2, Mail, Phone, User, Calendar } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { useBookingStorage } from "@/src/hooks/useBookingStorage";
import { currencies } from "../currencyCode/cuurency";
import { useTranslation } from "react-i18next";

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
  bookingContext: any;
  loyaltyMemberEmail?: string;
  propertyId?: string;
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
  loyaltyMemberEmail,
  propertyId,
  onClose,
  handleGuestDetailChange,
  handleContactChange,
  onSubmit,
}) => {
  const { colors } = useBookingStorage(bookingContext);
  const [errors, setErrors] = useState<any>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [isLoyaltyMember, setIsLoyaltyMember] = useState(false);
  const [loyaltyDiscount, setLoyaltyDiscount] = useState<any>(null);
  const [verifyingLoyalty, setVerifyingLoyalty] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { t } = useTranslation();

  // Auto-fill email if loyalty member
  useEffect(() => {
    if (loyaltyMemberEmail && !contactInfo.email) {
      handleContactChange("email", loyaltyMemberEmail);
      // Verify loyalty membership
      verifyLoyaltyMembership(loyaltyMemberEmail);
    }
  }, [loyaltyMemberEmail]);

  // Verify loyalty membership when email changes with debouncing
  const verifyLoyaltyMembership = async (email: string) => {
    if (!email || !propertyId) return;

    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setVerifyingLoyalty(true);

    // Set up new debounce timer
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/loyalty/guest/check-discount`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: email,
              propertyId: propertyId,
            }),
          }
        );

        const data = await response.json();

        if (response.ok && data.success && data.data?.isLoyaltyMember) {
          setIsLoyaltyMember(true);
          setLoyaltyDiscount(data.data.discount);
        } else {
          setIsLoyaltyMember(false);
          setLoyaltyDiscount(null);
        }
      } catch (error) {
        console.error("Error verifying loyalty membership:", error);
        setIsLoyaltyMember(false);
        setLoyaltyDiscount(null);
      } finally {
        setVerifyingLoyalty(false);
      }
    }, 800); // 800ms debounce delay
  };

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

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

  const validate = (): boolean => {
    const newErrors: any = {};
    const nameRegex = /^[A-Za-z\s]+$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^[0-9]{5,15}$/;

    // Validate each guest
    guestForms.forEach((guest, index) => {
      const gErrors: any = {};
      if (!guest.firstName.trim()) {
        gErrors.firstName = t("GuestForm.errors.firstNameRequired");
      } else if (!nameRegex.test(guest.firstName)) {
        gErrors.firstName = t("GuestForm.errors.invalidName");
      }

      if (!guest.lastName.trim()) {
        gErrors.lastName = t("GuestForm.errors.lastNameRequired");
      } else if (!nameRegex.test(guest.lastName)) {
        gErrors.lastName = t("GuestForm.errors.invalidName");
      }

      if (Object.keys(gErrors).length > 0) {
        newErrors[`guest-${index}`] = gErrors;
      }
    });

    // Validate email
    if (!contactInfo.email.trim()) {
      newErrors.email = t("GuestForm.errors.emailRequired");
    } else if (!emailRegex.test(contactInfo.email)) {
      newErrors.email = t("GuestForm.errors.invalidEmail");
    }

    // Validate phone
    // Validate phone
    if (!contactInfo.phoneNumber.trim()) {
      newErrors.phoneNumber = t("GuestForm.errors.phoneRequired");
    } else if (!phoneRegex.test(contactInfo.phoneNumber)) {
      newErrors.phoneNumber = t("GuestForm.errors.invalidPhone");
    }

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
      setSubmitError(t("GuestForm.somethingWentWrong"));
      return;
    }

    setSubmitError(null);
    const isValid = validate();

    if (!isValid) {
      // Scroll to first error if validation fails
      const firstErrorKey = Object.keys(errors)[0];
      if (firstErrorKey) {
        const element = document.getElementById(
          firstErrorKey.startsWith('guest-')
            ? `first-${firstErrorKey.split('-')[1]}`
            : firstErrorKey
        );
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setPaymentProcessing(true);
    onSubmit();
  };

  // Clear specific field error when user starts typing
  const handleFieldChange = (
    type: 'guest' | 'contact',
    indexOrField: number | string,
    field: string,
    value: string
  ) => {
    // Clear submit error when user starts correcting
    if (submitError) setSubmitError(null);

    if (type === 'guest') {
      const index = indexOrField as number;
      handleGuestDetailChange(index, field as keyof Guest, value);

      // Clear guest field error
      if (errors[`guest-${index}`]?.[field]) {
        setErrors((prev: any) => {
          const updated = { ...prev };
          if (updated[`guest-${index}`]) {
            delete updated[`guest-${index}`][field];
            if (Object.keys(updated[`guest-${index}`]).length === 0) {
              delete updated[`guest-${index}`];
            }
          }
          return updated;
        });
      }
    } else {
      const fieldName = indexOrField as string;
      handleContactChange(fieldName as "email" | "phoneNumber", value);

      // Clear contact field error
      if (errors[fieldName]) {
        setErrors((prev: any) => {
          const updated = { ...prev };
          delete updated[fieldName];
          return updated;
        });
      }
    }
  };

  const getCurrencySymbol = (code: string) =>
    currencies.find((c) => c.code === code)?.symbol ?? code;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <CardHeader className="border-b space-y-0 pb-4" style={{ backgroundColor: colors.secondaryColor }}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-white">
              {t("GuestForm.title")}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full hover:bg-white/20"
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
                      {guest.type === "adult"
                        ? `${t("GuestForm.adult")} ${typeCount}`
                        : `${t("GuestForm.child")} ${typeCount}`}
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
                        {t("GuestForm.firstName")} <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id={`first-${index}`}
                        placeholder={t("GuestForm.firstNamePlaceholder")}
                        value={guest.firstName}
                        onChange={(e: any) =>
                          handleFieldChange('guest', index, "firstName", e.target.value)
                        }
                        className={gErr.firstName ? "border-red-500" : ""}
                      />
                      {gErr.firstName && (
                        <p className="text-sm text-red-600">{gErr.firstName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`last-${index}`}>
                        {t("GuestForm.lastName")} <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id={`last-${index}`}
                        placeholder={t("GuestForm.lastNamePlaceholder")}
                        value={guest.lastName}
                        onChange={(e: any) =>
                          handleFieldChange('guest', index, "lastName", e.target.value)
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
                        {t("GuestForm.dateOfBirth")}
                      </Label>
                      <Input
                        id={`dob-${index}`}
                        type="date"
                        min={guest.type === "child" ? getMinDOBForChild() : undefined}
                        max={guest.type === "adult" ? getMaxDOBForAdult() : getMaxDOBForChild()}
                        value={guest.dateOfBirth}
                        onChange={(e: any) =>
                          handleFieldChange('guest', index, "dateOfBirth", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Contact Information - Simplified without email verification */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="h-5 w-5" style={{ color: colors.primaryColor }} />
                {t("GuestForm.contactInfo")}
                {isLoyaltyMember && (
                  <Badge className="ml-2 bg-green-500 text-white">
                    {t("GuestForm.loyaltyMember")}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  {t("GuestForm.emailLabel")} <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={contactInfo.email}
                    onChange={(e: any) => {
                      handleFieldChange('contact', 'email', 'email', e.target.value);
                      // Verify loyalty when email changes (debounced)
                      if (e.target.value && propertyId) {
                        verifyLoyaltyMembership(e.target.value);
                      }
                    }}
                    placeholder={t("GuestForm.emailPlaceholder")}
                    className={errors.email ? "border-red-500" : ""}
                    disabled={!!loyaltyMemberEmail}
                  />
                  {verifyingLoyalty && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    </div>
                  )}
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email}</p>
                )}
                {isLoyaltyMember && loyaltyDiscount && (
                  <div
                    className="flex items-center gap-2 p-2 rounded-lg text-sm font-medium"
                    style={{ backgroundColor: `${colors.primaryColor}10`, color: colors.primaryColor }}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>
                      {loyaltyDiscount.type === "percentage"
                        ? t("GuestForm.loyaltyDiscountPercent", { value: loyaltyDiscount.value })
                        : t("GuestForm.loyaltyDiscountFlat", {
                          currency: loyaltyDiscount.currencyCode,
                          value: loyaltyDiscount.value
                        })}
                    </span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  {t("GuestForm.emailConfirmation")}
                </p>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">
                  <Phone className="inline h-4 w-4 mr-1" />
                  {t("GuestForm.phoneLabel")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={contactInfo.phoneNumber}
                  maxLength={15}
                  onChange={(e: any) =>
                    handleFieldChange('contact', 'phoneNumber', 'phoneNumber', e.target.value.replace(/\D/g, ''))
                  }
                  placeholder={t("GuestForm.phonePlaceholder")}
                  className={errors.phoneNumber ? "border-red-500" : ""}
                />
                {errors.phoneNumber && (
                  <p className="text-sm text-red-600">{errors.phoneNumber}</p>
                )}
                <p className="text-xs text-muted-foreground">{t("GuestForm.phoneNote")}</p>
              </div>
            </CardContent>
          </Card>

          {/* Price Details */}
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{t("GuestForm.priceDetails")}</CardTitle>
                <div className="relative" ref={tooltipRef}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full"
                    onClick={() => setShowTooltip(!showTooltip)}
                  >
                    <Info className="h-4 w-4" />
                  </Button>

                  {finalPrice?.dailyPriceBrakeDown && showTooltip && (
                    <Card className="absolute top-8 left-0 z-50 w-80 shadow-xl">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">{t("GuestForm.dailyBreakdown")}</CardTitle>
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
                        {Array.isArray(finalPrice.dailyPriceBrakeDown) && (() => {
                          // Group by roomNumber
                          const grouped = finalPrice.dailyPriceBrakeDown.reduce(
                            (acc: Record<string, any[]>, entry: any) => {
                              if (!acc[entry.roomNumber]) acc[entry.roomNumber] = [];
                              acc[entry.roomNumber].push(entry);
                              return acc;
                            }, {}
                          );

                          return (
                            <>
                              {(Object.entries(grouped) as [string, any[]][]).map(([roomNumber, days]) => (<div key={roomNumber} className="mb-3">
                                {/* Room Header */}
                                <div className="flex items-center justify-between bg-gray-100 rounded px-2 py-1 mb-2">
                                  <span className="font-bold text-xs text-gray-700">🏨 {t("GuestForm.room")} {roomNumber}</span>
                                  <span className="font-bold text-xs text-gray-700">
                                    {getCurrencySymbol(days[0]?.currencyCode || "USD")}{" "}
                                    {days.reduce((s: number, d: any) => s + (d.totalAmount || 0), 0).toFixed(2)}
                                  </span>
                                </div>

                                {/* Date Rows */}
                                {days.map((day: any, idx: number) => (
                                  <div key={idx} className="border-b pb-2 mb-2 last:border-0 last:mb-0">
                                    <div className="font-semibold mb-1 text-gray-700">
                                      {new Date(day.date).toLocaleDateString("en-US", {
                                        weekday: "short", month: "short", day: "numeric"
                                      })}
                                    </div>
                                    <div className="space-y-1 pl-2">
                                      <div className="flex justify-between">
                                        <span>{t("GuestForm.baseRate")}</span>
                                        <span>{getCurrencySymbol(day.currencyCode)} {(day.baseChargesAmount ?? 0).toFixed(2)}</span>
                                      </div>
                                      {(day.additionalChargesAmount ?? 0) > 0 && (
                                        <div className="flex justify-between">
                                          <span>{t("GuestForm.additional")}</span>
                                          <span>{getCurrencySymbol(day.currencyCode)} {day.additionalChargesAmount.toFixed(2)}</span>
                                        </div>
                                      )}
                                      {day.taxBrakeDown?.length > 0
                                        ? day.taxBrakeDown.map((t: any, ti: number) => (
                                          <div key={ti} className="flex justify-between text-gray-500">
                                            <span>{t.name}:</span>
                                            <span>{getCurrencySymbol(t.currencyCode)} {(t.taxedAmount ?? 0).toFixed(2)}</span>
                                          </div>
                                        ))
                                        : (day.totalDailyTaxedAmount ?? 0) > 0 && (
                                          <div className="flex justify-between text-gray-500">
                                            <span>{t("GuestForm.taxFees")}</span>
                                            <span>{getCurrencySymbol(day.currencyCode)} {day.totalDailyTaxedAmount.toFixed(2)}</span>
                                          </div>
                                        )
                                      }
                                      {day.addOnBrakeDown?.length > 0 && (
                                        <div className="flex justify-between text-orange-600">
                                          <span>{t("GuestForm.addons")}</span>
                                          <span>
                                            {getCurrencySymbol(day.currencyCode)}{" "}
                                            {day.addOnBrakeDown.reduce((s: number, a: any) => s + (a.price || 0), 0).toFixed(2)}
                                          </span>
                                        </div>
                                      )}
                                      <div className="flex justify-between font-semibold pt-1 border-t">
                                        <span>{t("GuestForm.dayTotal")}</span>
                                        <span>{getCurrencySymbol(day.currencyCode)} {(day.totalAmount ?? 0).toFixed(2)}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              ))}

                              {/* Grand Summary */}
                              <div className="pt-2 border-t mt-2 space-y-1">
                                <div className="flex justify-between font-semibold">
                                  <span>{t("GuestForm.subtotalBeforeTax")}</span>
                                  <span>{getCurrencySymbol(finalPrice.currencyCode)}{(finalPrice.amountBeforeTax ?? 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-semibold">
                                  <span>{t("GuestForm.totalTax")}</span>
                                  <span>{getCurrencySymbol(finalPrice.currencyCode)}{(finalPrice.taxedAmount ?? 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-sm border-t pt-1">
                                  <span>{t("GuestForm.grandTotal")}</span>
                                  <span>{getCurrencySymbol(finalPrice.currencyCode)}{(finalPrice.totalAmount ?? 0).toFixed(2)}</span>
                                </div>
                              </div>
                            </>
                          );
                        })()}
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
                    <span>{t("GuestForm.baseAmount")}</span>
                    <span>{getCurrencySymbol(finalPrice.currencyCode)}{(finalPrice.amountBeforeTax ?? 0).toFixed(2)}</span>
                  </div>
                  {(finalPrice.additionalGuestCharges ?? 0) > 0 && (
                    <div className="flex justify-between">
                      <span>{t("GuestForm.additionalGuestCharges")}</span>
                      <span>{getCurrencySymbol(finalPrice.currencyCode)}{(finalPrice.additionalGuestCharges).toFixed(2)}</span>
                    </div>
                  )}
                  {(finalPrice.totalAddonAmount ?? 0) > 0 && (() => {
                    const grouped = new Map<
                      string,
                      { name: string; quantity: number; total: number; currency: string; type: string }
                    >();

                    for (const addon of finalPrice.addonBrakeDown ?? []) {
                      const isChild = addon.name?.includes("Child age");

                      const key = isChild
                        ? `${addon.addonId}::child`
                        : `${addon.addonId}::${addon.type}`;

                      const baseName = isChild
                        ? addon.name.replace(/\s*\(Child age \d+\)/, "")
                        : addon.name;

                      const displayName = isChild
                        ? t("GuestForm.childrenAddon", { name: baseName })
                        : baseName;

                      if (grouped.has(key)) {
                        const e = grouped.get(key)!;
                        e.quantity += addon.quantity ?? 0;
                        e.total += addon.totalAmount ?? 0;
                      } else {
                        grouped.set(key, {
                          name: displayName,
                          quantity: addon.quantity ?? 0,
                          total: addon.totalAmount ?? 0,
                          currency: addon.currencyCode || finalPrice.currencyCode,
                          type: addon.type,
                        });
                      }
                    }

                    return (
                      <div className="border-t pt-2 mt-2">

                        {/* Label */}
                        <div className="font-medium text-gray-700 mb-1">
                          {t("GuestForm.addonsLabel")}
                        </div>

                        {/* Addon List */}
                        {Array.from(grouped.values()).map((addon, i) => (
                          <div key={`${addon.name}-${i}`} className="flex justify-between text-gray-600 pl-4">

                            <span className="flex items-center gap-1.5">

                              {/* Included badge */}
                              {addon.type === "included" && (
                                <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">
                                  {t("GuestForm.included")}
                                </span>
                              )}

                              {addon.name}
                              <span className="text-gray-400">×{addon.quantity}</span>
                            </span>

                            {/* Price */}
                            <span>
                              {addon.total === 0 ? (
                                <span className="text-green-600 text-xs font-medium">
                                  {t("GuestForm.free")}
                                </span>
                              ) : (
                                `${getCurrencySymbol(addon.currency)}${addon.total.toFixed(2)}`
                              )}
                            </span>
                          </div>
                        ))}

                        {/* Total */}
                        <div className="flex justify-between font-medium pt-1 border-t mt-1">
                          <span>{t("GuestForm.totalAddons")}</span>
                          <span>
                            {getCurrencySymbol(finalPrice.currencyCode)}
                            {finalPrice.totalAddonAmount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                  {finalPrice.promotionBrakeDown && Array.isArray(finalPrice.promotionBrakeDown) && finalPrice.promotionBrakeDown.length > 0 && (
                    <div className="border-t pt-2 mt-2">
                      <div className="font-medium text-gray-700 mb-1">{t("GuestForm.promotions")}</div>
                      {finalPrice.promotionBrakeDown.map((promo: any, index: number) => {
                        const isDiscount = promo.restrictionType === "decrease";
                        const isSurcharge = promo.restrictionType === "increase";
                        const isPayLater = promo.restrictionType === "payLater";
                        return (
                          <div
                            key={index}
                            className={`flex justify-between pl-4 ${isDiscount ? "text-green-600" :
                              isSurcharge ? "text-red-500" :
                                isPayLater ? "text-amber-600" : "text-gray-600"
                              }`}
                          >
                            <span>{promo.name}:</span>
                            <span>
                              {isDiscount ? "-" : isSurcharge ? "+" : ""}
                              {getCurrencySymbol(promo.currencyCode || finalPrice.currencyCode)}{(promo.discountAmount ?? 0).toFixed(2)}
                              {isPayLater && ` ${t("GuestForm.payAtHotel")}`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {(finalPrice.loyalityDiscount ?? 0) > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>{t("GuestForm.loyaltyDiscount")}</span>
                      <span>-${(finalPrice.loyalityDiscount).toFixed(2)}</span>
                    </div>
                  )}
                  {(finalPrice.promoCodeDiscount ?? 0) > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>{t("GuestForm.promoCodeDiscount")}</span>
                      <span>-${(finalPrice.promoCodeDiscount).toFixed(2)}</span>
                    </div>
                  )}

                  {finalPrice.taxBrakeDown && Array.isArray(finalPrice.taxBrakeDown) && finalPrice.taxBrakeDown.length > 0 && (
                    <>
                      <div className="border-t pt-2 mt-2">
                        <div className="font-medium text-gray-700 mb-1">{t("GuestForm.taxesAndFees")}</div>
                        {finalPrice.taxBrakeDown.map((taxItem: any, index: number) => (
                          <div key={index} className="flex justify-between text-gray-600 pl-4">
                            <span>{taxItem.name}:</span>
                            <span>{getCurrencySymbol(taxItem.currencyCode || finalPrice.currencyCode)}{(taxItem.taxedAmount ?? 0).toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between font-medium pt-1 border-t mt-1">
                          <span>{t("GuestForm.totalTax")}</span>
                          <span>{getCurrencySymbol(finalPrice.currencyCode)}{(finalPrice.taxedAmount || 0).toFixed(2)}</span>
                        </div>
                      </div>
                    </>
                  )}

                  {(finalPrice.latterpayableAmount ?? 0) > 0 && (
                    <div className="flex justify-between text-amber-600 border-t pt-2 mt-2">
                      <span>{t("GuestForm.amountPaidLater")}</span>
                      <span>{getCurrencySymbol(finalPrice.currencyCode)}{(finalPrice.latterpayableAmount).toFixed(2)}</span>
                    </div>
                  )}

                  {finalPrice.currentChargeableAmount > 0 && (finalPrice.latterpayableAmount ?? 0) > 0 && (
                    <div className="flex justify-between text-green-600 border-t pt-2 mt-2">
                      <span>{t("GuestForm.amountPaidNow")}</span>
                      <span>{getCurrencySymbol(finalPrice.currencyCode)}{finalPrice.currentChargeableAmount.toFixed(2)}</span>
                    </div>
                  )}


                  <div className="border-t-2 pt-3 mt-2">
                    <div className="flex justify-between items-center font-bold text-lg">
                      <span>{t("GuestForm.grandTotal")}</span>
                      <span style={{ color: colors.primaryColor }}>
                        {getCurrencySymbol(finalPrice.currencyCode)}{(finalPrice.totalAmount).toFixed(2)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{t("GuestForm.includesAllTaxes")}</div>
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
              disabled={paymentProcessing || Object.keys(errors).length > 0}
              style={{
                backgroundColor: paymentProcessing || Object.keys(errors).length > 0
                  ? '#9ca3af'
                  : colors.primaryColor,
                color: colors.buttonTextColor
              }}
              className="flex-1 py-4 hover:opacity-90 transition-opacity"
              size="lg"
            >
              {paymentProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {t("GuestForm.processing")}
                </>
              ) : (
                t("GuestForm.proceedToPayment")
              )}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              size="lg"
              className="flex-1 py-4 sm:flex-none hover:bg-gray-100"
            >
              {t("GuestForm.cancel")}
            </Button>
          </div>
          {Object.keys(errors).length > 0 && (
            <p className="text-sm text-amber-600 text-center">
              {t("GuestForm.validationError")}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default GuestFormModal;
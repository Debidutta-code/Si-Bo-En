import React, { useEffect, useRef, useState } from "react";
import { X, Mail, Phone, User, Calendar, Loader2, Plus } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { useBookingStorage } from "@/src/hooks/useBookingStorage";
import { useTranslation } from "react-i18next";
import { currencies } from "../currencyCode/cuurency";
import { Currency } from "../currencyCode/currency-code.type";
import { formatNumber } from "@/src/utils/numLang";
import { IAddonAvailability } from "@/src/app/(unauth)/Rooms/types";

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
  loyaltyDiscountInfo?: { type: string; value: number; currencyCode: string } | null;
  propertyId?: string;
  /** Addons available for the selected rate plan, fetched by the parent after Step 1 completes. */
  // availableAddons?: IAddonAvailability[];
  /** Opens the parent-owned AddonSelectionModal on top of this one. */
  onOpenAddonModal?: () => void;
  onClose: () => void;
  handleGuestDetailChange: (
    index: number,
    field: keyof Guest,
    value: string
  ) => void;
  handleContactChange: (field: "email" | "phoneNumber", value: string) => void;
  /** Called when Step 1 is valid — parent fetches addons + price together. Only advance to Step 2 if this resolves. */
  onStepOneComplete: (email: string) => Promise<void>;
  isFetchingStep2: boolean;
  step2Error: string | null;
  onSubmit: () => void;
}

const GuestFormModal: React.FC<Props> = ({
  guestForms,
  contactInfo,
  price,
  finalPrice,
  bookingContext,
  loyaltyDiscountInfo,
  propertyId,
  // availableAddons = [],
  onOpenAddonModal,
  onClose,
  handleGuestDetailChange,
  handleContactChange,
  onStepOneComplete,
  isFetchingStep2,
  step2Error,
  onSubmit,
}) => {
  const { colors } = useBookingStorage(bookingContext);
  const [step, setStep] = useState<1 | 2>(1);
  const [errors, setErrors] = useState<any>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const toggleSection = (key: string) =>
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  const { t } = useTranslation();
  const loyaltyDiscount = loyaltyDiscountInfo ?? null;


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
      const isPrimary = index === 0 && guest.type === "adult";
      const gErrors: any = {};

      if (isPrimary) {
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
      } else {
        if (guest.firstName.trim() && !nameRegex.test(guest.firstName)) {
          gErrors.firstName = t("GuestForm.errors.invalidName");
        }
        if (guest.lastName.trim() && !nameRegex.test(guest.lastName)) {
          gErrors.lastName = t("GuestForm.errors.invalidName");
        }
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

  const handleStep1Continue = async () => {
    setSubmitError(null);
    const isValid = validate();
    if (!isValid) {
      setErrors((prev: any) => {
        const firstErrorKey = Object.keys(prev)[0];
        if (firstErrorKey) {
          const element = document.getElementById(
            firstErrorKey.startsWith('guest-')
              ? `first-${firstErrorKey.split('-')[1]}`
              : firstErrorKey
          );
          element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return prev;
      });
      return;
    }
    try {
      await onStepOneComplete(contactInfo.email);
      setStep(2);
    } catch {
      // step2Error is already set by the parent; stay on Step 1 so the user can retry.
    }
  };

  /** Step 2 → confirm & pay */
  const handleConfirmPay = () => {
    if (!price) {
      setSubmitError(t("GuestForm.somethingWentWrong"));
      return;
    }
    setSubmitError(null);
    setPaymentProcessing(true);
    onSubmit();
  };

  const handleFieldChange = (
    type: 'guest' | 'contact',
    indexOrField: number | string,
    field: string,
    value: string
  ) => {
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



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <CardHeader className="border-b space-y-0 pb-4" style={{ backgroundColor: colors.secondaryColor }}>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-white">
                {step === 1 ? t("GuestForm.title") : t("GuestForm.priceDetails")}
              </CardTitle>
              <p className="text-white/70 text-xs mt-0.5">
                {t("GuestForm.stepIndicator", { current: step, total: 2, defaultValue: `Step ${step} of 2` })}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          {/* Step progress bar */}
          <div className="flex gap-1.5 mt-3">
            <div className="flex-1 h-1 rounded-full" style={{ backgroundColor: colors.primaryColor ?? '#fff' }} />
            <div className="flex-1 h-1 rounded-full" style={{ backgroundColor: step === 2 ? (colors.primaryColor ?? '#fff') : 'rgba(255,255,255,0.3)' }} />
          </div>
        </CardHeader>

        {/* Scrollable Content */}
        <CardContent className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* ── STEP 1: Guest & Contact Details ── */}
          {step === 1 && (<>
            {/* Guest Forms */}
            {guestForms.map((guest, index) => {
              const gErr = errors[`guest-${index}`] || {};
              const typeCount = guestForms
                .slice(0, index + 1)
                .filter((g) => g.type === guest.type).length;

              const isPrimaryGuest = index === 0 && guest.type === "adult";

              return (
                <Card key={index} className="border-2 shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5" style={{ color: colors.primaryColor }} />
                      <CardTitle className="text-lg ">
                        {guest.type === "adult"
                          ? `${t("GuestForm.adult")} ${formatNumber(typeCount)}`
                          : `${t("GuestForm.child")} ${formatNumber(typeCount)}`}
                      </CardTitle>
                      <Badge variant="outline" style={{ borderColor: colors.primaryColor, color: colors.primaryColor }}>
                        {t(`${guest.type}`)}
                      </Badge>
                      {isPrimaryGuest ? (
                        <Badge style={{ backgroundColor: colors.primaryColor, color: colors.buttonTextColor }}>
                          {t("GuestForm.primary")}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-400 border-gray-300">
                          {t("GuestForm.optional")}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`first-${index}`}>
                          {t("GuestForm.firstName")} {isPrimaryGuest && <span className="text-red-500">*</span>}                      </Label>
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
                          {t("GuestForm.lastName")} {isPrimaryGuest && <span className="text-red-500">*</span>}
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
                  {loyaltyDiscount && (
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
                      }}
                      placeholder={t("GuestForm.emailPlaceholder")}
                      className={errors.email ? "border-red-500" : ""}
                    // disabled={!!loyaltyMemberEmail}
                    />

                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email}</p>
                  )}
                  {
                    // isLoyaltyMember&&
                    loyaltyDiscount && (
                      <div
                        className="flex items-center gap-2 p-2 rounded-lg text-sm font-medium"
                        style={{ backgroundColor: `${colors.primaryColor}10`, color: colors.primaryColor }}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>
                          {loyaltyDiscount.type === "percentage"
                            ? t("GuestForm.loyaltyDiscountPercent", { value: formatNumber(loyaltyDiscount.value) })
                            : t("GuestForm.loyaltyDiscountFlat", {
                              currency: currencies.find((c: Currency) => c.code === loyaltyDiscount.currencyCode)?.symbol || loyaltyDiscount.currencyCode,
                              value: formatNumber(loyaltyDiscount.value)
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

          </>
          )}

          {/* ── STEP 2: Price Breakdown ── */}
          {step === 2 && (
            <>
              {step2Error && (
                <Alert variant="destructive">
                  <AlertDescription>{step2Error}</AlertDescription>
                </Alert>
              )}


              <Card className={`border-2 transition-opacity ${isFetchingStep2 ? "opacity-50" : ""}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{t("GuestForm.priceDetails")}</CardTitle>
                </CardHeader>

                <CardContent className="p-0">
                  {finalPrice && (() => {

                    const curCode = finalPrice.currencyCode;
                    const cur = currencies.find((c: Currency) => c.code === curCode)?.symbol || curCode;

                    const formatGuests = (g: any) => {
                      if (!g) return '';
                      const parts: string[] = [];
                      if (g.adults) parts.push(`${formatNumber(g.adults)} adult${g.adults > 1 ? 's' : ''}`);
                      if (g.children) parts.push(`${formatNumber(g.children)} child${g.children > 1 ? 'ren' : ''}`);
                      return parts.join(', ');
                    };

                    const groupedAddons = (() => {
                      const map = new Map<string, { name: string; quantity: number; total: number; currency: string; type: string }>();
                      for (const addon of finalPrice.addonBrakeDowns ?? []) {
                        const addonNameRaw = addon._translations?.name || addon.name;
                        const isChild = addonNameRaw?.includes("Child age");
                        const key = isChild ? `${addon.addonId}::child` : `${addon.addonId}::${addon.type}`;
                        const baseName = isChild ? addonNameRaw.replace(/\s*\(Child age \d+\)/, "") : addonNameRaw;
                        const displayName = isChild ? t("GuestForm.childrenAddon", { name: baseName }) : baseName;
                        if (map.has(key)) {
                          const e = map.get(key)!;
                          e.quantity += addon.quantity ?? 0;
                          e.total += addon.totalAmount ?? 0;
                        } else {
                          map.set(key, {
                            name: displayName,
                            quantity: addon.quantity ?? 0,
                            total: addon.totalAmount ?? 0,
                            currency: addon.currencyCode || finalPrice.currencyCode,
                            type: addon.type,
                          });
                        }
                      }
                      return Array.from(map.values());
                    })();

                    const deductPromos = (finalPrice.promotionBrakeDown ?? []).filter((p: any) => p.restrictionType !== "payLater");
                    const payLaterPromos = (finalPrice.promotionBrakeDown ?? []).filter((p: any) => p.restrictionType === "payLater");
                    const totalPromoDiscount = deductPromos.reduce((s: number, p: any) => s + (p.discountAmount ?? 0), 0);

                    const roomGroups = (finalPrice.dailyPriceBrakeDown ?? []).reduce(
                      (acc: Record<string, any[]>, day: any) => {
                        if (!acc[day.roomNumber]) acc[day.roomNumber] = [];
                        acc[day.roomNumber].push(day);
                        return acc;
                      }, {}
                    );
                    const totalRoomAmount = (finalPrice.dailyPriceBrakeDown ?? []).reduce(
                      (s: number, d: any) => s + (d.totalAmount ?? 0), 0
                    );

                    const AccordionSection = ({
                      sectionKey,
                      label,
                      amount,
                      amountClass = "",
                      children,
                    }: {
                      sectionKey: string;
                      label: string;
                      amount: string;
                      amountClass?: string;
                      children: React.ReactNode;
                    }) => {
                      const isOpen = openSections[sectionKey] ?? false;
                      return (
                        <div className="border-b border-gray-100 last:border-b-0">
                          <button
                            type="button"
                            className="w-full flex justify-between items-center px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                            onClick={() => toggleSection(sectionKey)}
                          >
                            <span className="text-sm font-medium text-gray-900">{label}</span>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-medium ${amountClass || "text-gray-900"}`}>{amount}</span>
                              <svg
                                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                                viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
                              >
                                <polyline points="4,6 8,10 12,6" />
                              </svg>
                            </div>
                          </button>
                          {isOpen && (
                            <div className="px-4 pb-3 pt-1 bg-gray-50 space-y-1.5 text-xs">
                              {children}
                            </div>
                          )}
                        </div>
                      );
                    };

                    return (
                      <div className="border border-gray-200 rounded-lg overflow-hidden text-sm mx-4 mb-4">

                        {/* 1. Room charges */}
                        {(finalPrice.dailyPriceBrakeDown ?? []).length > 0 && (
                          <AccordionSection
                            sectionKey="rooms"
                            label={t("GuestForm.roomCharges")}
                            amount={`${cur} ${formatNumber(totalRoomAmount)}`}
                          >
                            {(Object.entries(roomGroups) as [string, any[]][]).map(([roomNumber, days]) => (
                              <div key={roomNumber}>
                                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mt-2 mb-1">
                                  {t("GuestForm.room")} {formatNumber(Number(roomNumber))}
                                </p>
                                {days.map((day: any, i: number) => (
                                  <div key={i} className="flex justify-between text-gray-600 py-0.5">
                                    <span>
                                      {new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                      {day.guestDistribution && ` (${formatGuests(day.guestDistribution)})`}
                                    </span>
                                    <span className="text-gray-900">{cur} {formatNumber(day.totalAmount ?? 0)}</span>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </AccordionSection>
                        )}

                        {/* 2. Add-ons */}
                        {groupedAddons.length > 0 && (
                          <AccordionSection
                            sectionKey="addons"
                            label={t("GuestForm.addonsLabel")}
                            amount={`${cur} ${formatNumber(finalPrice.totalAddonAmount ?? 0)}`}
                          >
                            {groupedAddons.map((addon, i) => (
                              <div key={i} className="flex justify-between items-center py-0.5">
                                <span className="flex items-center gap-1.5 text-gray-600 flex-wrap">
                                  {addon.name} × {formatNumber(addon.quantity)}
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${addon.type === "included"
                                    ? "bg-blue-50 text-blue-700"
                                    : "bg-gray-100 text-gray-600"
                                    }`}>
                                    {addon.type}
                                  </span>
                                </span>
                                <span className="text-gray-900 whitespace-nowrap ml-4">
                                  {addon.total === 0
                                    ? <span className="text-green-600 font-medium">{t("GuestForm.free")}</span>
                                    : `${cur} ${formatNumber(addon.total)}`
                                  }
                                </span>
                              </div>
                            ))}
                          </AccordionSection>
                        )}

                        {/* 3. Discounts */}
                        {(deductPromos.length > 0 ||
                          (finalPrice.loyalityDiscount ?? 0) > 0 ||
                          (finalPrice.customizableDealDiscount ?? 0) > 0 ||
                                                    (finalPrice.customizableDealDiscount ?? 0) > 0 ||

                          (finalPrice.promoCodeDiscount ?? 0) > 0) && (
                            <AccordionSection
                              sectionKey="discounts"
                              label={t("GuestForm.discountsApplied")}
                              amount={`- ${cur} ${formatNumber(totalPromoDiscount + (finalPrice.loyalityDiscount || 0) + (finalPrice.promoCodeDiscount || 0))}`}
                              amountClass="text-green-700"
                            >
                              {deductPromos.map((promo: any, i: number) => {
                                const promoName = promo._translations?.promotionName || promo.name;
                                const promoCurrencyCode = finalPrice.currencyCode;
                                const promoCurrencySymbol = currencies.find((c: Currency) => c.code === promoCurrencyCode)?.symbol || promoCurrencyCode;
                                return (
                                  <div key={i} className="flex justify-between py-0.5 text-green-700">
                                    <span>{promoName} ({formatNumber(promo.discountValue)}%)</span>
                                    <span>- {promoCurrencySymbol} {formatNumber(promo.discountAmount ?? 0)}</span>
                                  </div>
                                );
                              })}
                              {(finalPrice.loyalityDiscount ?? 0) > 0 && (
                                <div className="flex justify-between py-0.5 text-green-700">
                                  <span>{t("GuestForm.loyaltyDiscount")}</span>
                                  <span>- {cur} {formatNumber(finalPrice.loyalityDiscount)}</span>
                                </div>
                              )}
                              {(finalPrice.promoCodeDiscount ?? 0) > 0 && (
                                <div className="flex justify-between py-0.5 text-green-700">
                                  <span>{t("GuestForm.promoCodeDiscount")}</span>
                                  <span>- {cur} {formatNumber(finalPrice.promoCodeDiscount)}</span>
                                </div>
                              )}
                              {/* 5. Customizable Deal Discount */}
                              {finalPrice.customizableDealDiscount > 0 && (
                                <div className="flex justify-between py-0.5 text-green-700">
                                  <span>{t("GuestForm.customizableDealDiscount")}</span>
                                  <span>- {cur} {formatNumber(finalPrice.customizableDealDiscount)}</span>
                                </div>
                              )}
                            </AccordionSection>
                          )}

                        {/* 4. Taxes */}
                        {(finalPrice.taxBrakeDown ?? []).length > 0 && (
                          <AccordionSection
                            sectionKey="taxes"
                            label={t("GuestForm.taxesAndFees")}
                            amount={`${cur} ${formatNumber(finalPrice.taxedAmount ?? 0)}`}
                          >
                            {finalPrice.taxBrakeDown.map((tax: any, i: number) => {
                              const taxName = tax._translations?.name || tax.name;
                              const taxCurrencyCode = finalPrice.currencyCode;
                              const taxCurrencySymbol = currencies.find((c: Currency) => c.code === taxCurrencyCode)?.symbol || taxCurrencyCode;
                              return (
                                <div key={i} className="flex justify-between py-0.5 text-gray-600">
                                  <span>{taxName}</span>
                                  <span className="text-gray-900">
                                    {taxCurrencySymbol} {formatNumber(tax.taxedAmount ?? 0)}
                                  </span>
                                </div>
                              );
                            })}
                          </AccordionSection>
                        )}

                        {/* 5. Totals — always visible, no expand */}
                        <div className="px-4 py-4 space-y-2 bg-white">

                          {/* Subtotal & tax */}
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>{t("GuestForm.subtotalBeforeTax")}</span>
                            <span>{cur} {formatNumber(finalPrice.amountBeforeTax ?? 0)}</span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>{t("GuestForm.totalTax")}</span>
                            <span>{cur} {formatNumber(finalPrice.taxedAmount ?? 0)}</span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>{t("GuestForm.amountAfterTax")}</span>
                            <span>{cur} {formatNumber(finalPrice.currentChargeableAmount ?? 0)}</span>
                          </div>
                          {/* Pay now / Pay at hotel split — sits between tax and grand total */}
                          {(finalPrice.latterpayableAmount ?? 0) > 0 && (
                            <div className="pt-2 border-t border-gray-100 space-y-1.5">
                              {/* Pay now */}
                              <div className="flex justify-between text-sm font-medium text-green-700">
                                <span>{t("GuestForm.amountPaidNow")}</span>
                                <span>{cur} {formatNumber(finalPrice.currentChargeableAmount ?? 0)}</span>
                              </div>
                              {/* Pay at hotel — with itemised pay-later promos indented below */}
                              <div className="flex justify-between text-sm font-medium text-blue-700">
                                <span>{t("GuestForm.amountToBePaidAtHotel")}</span>
                                <span>{cur} {formatNumber(finalPrice.latterpayableAmount ?? 0)}</span>
                              </div>
                              {payLaterPromos.length > 0 && (
                                <div className="pl-3 space-y-1 pb-1">

                                  {payLaterPromos.map((promo: any, i: number) => {
                                    const payLaterName = promo._translations?.name || promo.name;
                                    return (
                                      <div key={i} className="flex justify-between text-xs text-blue-500">
                                        <span>{payLaterName}</span>
                                        <span>{cur} {formatNumber(promo.discountAmount ?? 0)}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Grand total — always last */}
                          <div className="flex justify-between text-base font-semibold text-gray-900 pt-2 border-t border-gray-200">
                            <span>{t("GuestForm.grandTotal")}</span>
                            <span style={{ color: colors.primaryColor }}>
                              {cur} {formatNumber(finalPrice.totalAmount ?? 0)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">{t("GuestForm.includesAllTaxes")}</p>

                        </div>

                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {submitError && (
                <Alert variant="destructive">
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}
            </>
          )}
        </CardContent>

        {/* Footer */}
        <div className="border-t p-6 space-y-3 bg-muted/50">
          {step === 1 ? (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleStep1Continue}
                disabled={isFetchingStep2 || Object.keys(errors).length > 0}
                style={{
                  backgroundColor: isFetchingStep2 || Object.keys(errors).length > 0
                    ? '#9ca3af'
                    : colors.primaryColor,
                  color: colors.buttonTextColor
                }}
                className="flex-1 py-4 hover:opacity-90 transition-opacity"
                size="lg"
              >
                {isFetchingStep2 ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t("GuestForm.loading", { defaultValue: "Loading…" })}
                  </>
                ) : (
                  t("GuestForm.continueToPriceDetails", { defaultValue: "Continue to Price Details →" })
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
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleConfirmPay}
                disabled={paymentProcessing || isFetchingStep2}
                style={{
                  backgroundColor: (paymentProcessing || isFetchingStep2) ? '#9ca3af' : colors.primaryColor,
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
                onClick={() => setStep(1)}
                variant="outline"
                size="lg"
                className="flex-1 py-4 sm:flex-none hover:bg-gray-100"
              >
                ← {t("GuestForm.back", { defaultValue: "Back" })}
              </Button>
            </div>
          )}
          {Object.keys(errors).length > 0 && step === 1 && (
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
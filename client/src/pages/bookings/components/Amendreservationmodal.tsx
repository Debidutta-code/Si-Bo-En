"use client";

import { useState, useCallback, type FC } from "react";
import { startOfDay, isBefore } from "date-fns";
import toast from "react-hot-toast";
import { checkAmendPrice, amendReservationApi } from "../api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type {
  IAmendGuest,
  IAmendRoom,
  IAmendFinalPrice,
  IAmendReservationModalProps,
  IAmendValidationErrors,
  IGuestFieldErrors,
  ISelectedAddons,
  IPromotion,
  AmendStep,
  PriceStatus,
} from "../types/amend.types";
import type { IAddOn } from "../types/reservation";
import GuestSelector from "./GuestSelector";
import GuestDetails from "./GuestDetails";
import PriceSection from "./PricingModal";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const parseDate = (date: any): string => {
  if (typeof date === "string") return date.split("T")[0];
  if (date && typeof date === "object" && "$date" in date)
    return (date as any).$date.split("T")[0];
  return "";
};

const normalizeGuests = (guests: any[]): IAmendGuest[] =>
  (guests || []).map((g) => ({
    type: g.type === "child" ? "child" : "adult",
    firstName: g.firstName || "",
    lastName: g.lastName || "",
    dob:
      typeof g.dob === "string"
        ? g.dob.split("T")[0]
        : typeof g.dob === "object" && g.dob?.$date
          ? g.dob.$date.split("T")[0]
          : typeof g.dateOfBirth === "string"
            ? g.dateOfBirth.split("T")[0]
            : "",
    age: g.age ?? undefined,
  }));

const buildInitialRoomConfigs = (reservation: any): IAmendRoom[] => {
  const breakdown =
    reservation.priceBreakdowns?.[0]?.dailyBreakdown ??
    reservation.finalPrice?.dailyBreakdown ??
    [];

  const roomMap = new Map<string, IAmendRoom>();
  for (const day of breakdown) {
    if (!roomMap.has(day.roomNumber)) {
      roomMap.set(day.roomNumber, {
        adults: day.guestDistribution?.adults ?? 1,
        children: day.guestDistribution?.children ?? 0,
        childAges: [...(day.guestDistribution?.childAges ?? [])],
      });
    }
  }

  return roomMap.size > 0
    ? Array.from(roomMap.values())
    : [{ adults: 1, children: 0, childAges: [] }];
};

const emptyFinalPrice = (): IAmendFinalPrice => ({
  totalAmount: 0,
  amountBeforeTax: 0,
  taxedAmount: 0,
  totalAddonAmount: 0,
  totalPromotionAmount: 0,
  currentChargeableAmount: 0,
  latterpayableAmount: 0,
  loyalityDiscount: 0,
  promoCodeDiscount: 0,
  currencyCode: "",
  dailyPriceBrakeDown: [],
  taxBrakeDown: [],
  addonBrakeDown: [],
  promotionBrakeDown: [],
  booking: { finalPayable: 0, refundAmount: 0, discount: 0 },
});

const buildPromotions = (reservation: any): IPromotion[] => {
  const promotionBreakdown: any[] = reservation.finalPrice?.promotionBrakeDown ?? [];

  // Send all user-applied promotions from finalPrice.promotionBrakeDown.
  // reservationPromotions is unreliable (sometimes missing) — finalPrice is the source of truth.
  return promotionBreakdown
    .filter((p) => p.type === "user-applied" && p.id)
    .map((p) => ({ id: p.id as string, promotionType: "normal" }));
};

// NEW — groups by addonId+date, preserves per-day quantities
const buildParsedAddons = (addOns: IAddOn[]): ISelectedAddons[] => {
  const result: ISelectedAddons[] = [];

  (addOns || [])
    .filter((addon) => addon.type === "selected" && !addon.name?.includes("Child age"))
    .forEach((addon) => {
      let existing = result.find((a) => a.addOnId === addon.addonId);
      if (!existing) {
        existing = { addOnId: addon.addonId, availability: [] };
        result.push(existing);
      }

      // Use the addon's actual date but normalize to midnight UTC
      // addon.date is "2026-03-18T18:30:00.000Z" (UTC-shifted) — add 1 day to get correct date
      const rawDate = new Date(addon.date);
      rawDate.setUTCDate(rawDate.getUTCDate() + 1);
      rawDate.setUTCHours(0, 0, 0, 0);
      const normalizedDate = rawDate.toISOString();

      // Merge if same date already exists (in case of duplicates)
      const existingEntry = existing.availability.find((a) => a.date === normalizedDate);
      if (existingEntry) {
        existingEntry.quantity += addon.quantity;
      } else {
        existing.availability.push({ date: normalizedDate, quantity: addon.quantity });
      }
    });

  return result;
};

// ─── Step Indicator ───────────────────────────────────────────────────────────

const steps = [{ label: "Dates & Rooms" }, { label: "Guest Details" }, { label: "Review & Confirm" }];

const StepIndicator: FC<{ current: AmendStep }> = ({ current }) => (
  <div className="flex items-center w-full">
    {steps.map((step, idx) => {
      const stepNum = (idx + 1) as AmendStep;
      const isComplete = current > stepNum;
      const isActive = current === stepNum;
      return (
        <div key={idx} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
              ${isComplete ? "bg-primary text-primary-foreground"
                : isActive ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                : "bg-muted text-muted-foreground border border-border"}`}>
              {isComplete ? (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : stepNum}
            </div>
            <span className={`text-[10px] font-medium whitespace-nowrap hidden sm:block
              ${isActive ? "text-primary" : "text-muted-foreground"}`}>
              {step.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 mb-4 rounded-full transition-all
              ${isComplete ? "bg-primary" : "bg-border"}`} />
          )}
        </div>
      );
    })}
  </div>
);

// ─── Main Modal ───────────────────────────────────────────────────────────────

const AmendReservationModal: FC<IAmendReservationModalProps> = ({
  open,
  reservation,
  onClose,
  onSuccess,
}) => {
  const initialCheckIn = parseDate(reservation.reservationStartDate);
  const initialCheckOut = parseDate(reservation.reservationEndDate);
  const originalRooms =
    reservation.finalPrice?.requestedRooms ??
    1;

  // ── Navigation ──
  const [step, setStep] = useState<AmendStep>(1);

  // ── Step 1 ──
  const [checkInDate, setCheckInDate] = useState(initialCheckIn);
  const [checkOutDate, setCheckOutDate] = useState(initialCheckOut);
  const [roomConfigs, setRoomConfigs] = useState<IAmendRoom[]>(buildInitialRoomConfigs(reservation));
  const [dateErrors, setDateErrors] = useState<Pick<IAmendValidationErrors, "checkIn" | "checkOut">>({});

  // ── Step 2 ──
  const [guestForms, setGuestForms] = useState<IAmendGuest[]>(normalizeGuests(reservation.guests));
  const [guestErrors, setGuestErrors] = useState<Record<string, IGuestFieldErrors>>({});

  // ── Step 3 — 5 booleans → 2 states ──
  const [amount, setAmount] = useState<number>(reservation.amount);
  const [finalPrice, setFinalPrice] = useState<IAmendFinalPrice>(emptyFinalPrice());
  const [priceStatus, setPriceStatus] = useState<PriceStatus>("idle"); // replaces priceFetched + priceFetchError + priceLoading
  const [loading, setLoading] = useState(false);                        // replaces confirmLoading; showBreakdown lives in PriceSection

  // ── Derived ──
  const requestedRooms = roomConfigs.length;
  const resetPrice = useCallback(() => setPriceStatus("idle"), []);

  // ─── Room Handlers ────────────────────────────────────────────────────────

  const handleAddRoom = () => {
    setRoomConfigs((prev) => [...prev, { adults: 1, children: 0, childAges: [] }]);
    resetPrice();
  };

  const handleRemoveRoom = (i: number) => {
    if (roomConfigs.length <= 1) { toast.error("At least one room is required."); return; }
    setRoomConfigs((prev) => prev.filter((_, idx) => idx !== i));
    resetPrice();
  };

  const handleAdultChange = (roomIdx: number, delta: number) => {
    setRoomConfigs((prev) => {
      const updated = [...prev];
      const newVal = updated[roomIdx].adults + delta;
      if (newVal < 1) return prev;
      updated[roomIdx] = { ...updated[roomIdx], adults: newVal };
      return updated;
    });
    resetPrice();
  };

  const handleChildChange = (roomIdx: number, delta: number) => {
    setRoomConfigs((prev) => {
      const updated = [...prev];
      const room = updated[roomIdx];
      const newCount = room.children + delta;
      if (newCount < 0) return prev;
      const newChildAges = [...room.childAges];
      if (delta > 0) newChildAges.push(0);
      else newChildAges.pop();
      updated[roomIdx] = { ...room, children: newCount, childAges: newChildAges };
      return updated;
    });
    resetPrice();
  };

  const handleChildAgeChange = (roomIdx: number, childIdx: number, age: number) => {
    setRoomConfigs((prev) => {
      const updated = [...prev];
      const newChildAges = [...updated[roomIdx].childAges];
      newChildAges[childIdx] = age;
      updated[roomIdx] = { ...updated[roomIdx], childAges: newChildAges };
      return updated;
    });
    resetPrice();
  };

  // ─── Price API (shared, called automatically from step 2 → 3) ────────────

  const fetchPrice = async (rooms: IAmendRoom[], checkIn: string, checkOut: string): Promise<void> => {
    const guestDistribution = rooms.map((r) => ({ adults: r.adults, children: r.children, childAges: r.childAges }));
    const adults = rooms.reduce((s, r) => s + r.adults, 0);
    const children = rooms.reduce((s, r) => s + r.children, 0);
    const childAges = rooms.flatMap((r) => r.childAges);

    const includedAddons = Array.from(
      new Set((reservation.addOns || []).filter((a: IAddOn) => a.type === "included").map((a: IAddOn) => a.addonId))
    );
    const parsedAddons = buildParsedAddons(reservation.addOns || []);
    const promotions = buildPromotions(reservation);

    setPriceStatus("loading");

    const result = await checkAmendPrice({
      bookingCode: reservation.bookingCode,
      propertyCode: reservation.propertyCode || "",
      invTypeCode: reservation.roomTypeCode || "",
      startDate: checkIn,
      endDate: checkOut,
      noOfAdults: adults,
      noOfChildren: children,
      noOfRooms: rooms.length,
      ratePlanCode: reservation.ratePlanCode || "",
      childAges,
      guestDistribution,
      parsedAddons,
      includedAddons,
      promotions,
      promoCode: reservation.promoCode || "",
    });

    if (!result.success || !result.data) {
      setPriceStatus("error");
      toast.error(result.message || "Failed to fetch updated price");
      return;
    }

    const priceData = result.data;
    const updatedTotal = Number(priceData.totalAmount);
    const diff = updatedTotal - (reservation.paidAmount || 0);

    setFinalPrice({
      ...priceData,
      booking: {
        finalPayable: diff > 0 ? diff : 0,
        refundAmount: diff < 0 ? Math.abs(diff) : 0,
        discount: priceData.promoCodeDiscount || 0,
      },
    });
    setAmount(updatedTotal);
    setPriceStatus("success");
  };

  // ─── Step 1 → 2 ──────────────────────────────────────────────────────────

  const validateDates = (): boolean => {
    const errors: typeof dateErrors = {};
    const today = startOfDay(new Date());
    const checkInIsPast = isBefore(startOfDay(new Date(initialCheckIn)), today);
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (!checkInDate) errors.checkIn = "Check-in date is required.";
    else if (!checkInIsPast && checkIn <= today) errors.checkIn = "Check-in must be after today.";
    if (!checkOutDate) errors.checkOut = "Check-out date is required.";
    else if (checkOut <= checkIn) errors.checkOut = "Check-out must be after check-in.";

    setDateErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleStep1Apply = () => {
    if (!validateDates()) return;

    const existingAdults = guestForms.filter((g) => g.type === "adult");
    const existingChildren = guestForms.filter((g) => g.type === "child");
    const newGuests: IAmendGuest[] = [];
    let aIdx = 0;
    let cIdx = 0;

    roomConfigs.forEach((room) => {
      for (let i = 0; i < room.adults; i++) {
        newGuests.push(existingAdults[aIdx++] ?? { type: "adult", firstName: "", lastName: "", dob: "" });
      }
      room.childAges.forEach((age) => {
        const existing = existingChildren[cIdx++];
        newGuests.push(existing ? { ...existing, age } : { type: "child", firstName: "", lastName: "", dob: "", age });
      });
    });

    setGuestForms(newGuests);
    setGuestErrors({});
    setStep(2);
  };

  // ─── Step 2 → 3 (auto-fetches price on transition) ───────────────────────

  const validateGuests = (): boolean => {
    const nameRegex = /^[A-Za-z\s]+$/;
    const errors: Record<string, IGuestFieldErrors> = {};
    let valid = true;

    guestForms.forEach((guest, index) => {
      const gErr: IGuestFieldErrors = {};
      if (!guest.firstName.trim()) { gErr.firstName = "First name is required."; valid = false; }
      else if (!nameRegex.test(guest.firstName)) { gErr.firstName = "Only letters allowed."; valid = false; }
      if (!guest.lastName.trim()) { gErr.lastName = "Last name is required."; valid = false; }
      else if (!nameRegex.test(guest.lastName)) { gErr.lastName = "Only letters allowed."; valid = false; }
      if (Object.keys(gErr).length) errors[`guest-${index}`] = gErr;
    });

    setGuestErrors(errors);
    return valid;
  };

  const handleStep2Next = async () => {
    if (!validateGuests()) {
      toast.error("Please fix the guest details before continuing.");
      return;
    }
    setStep(3);
    // Auto-fetch — user lands on step 3 and sees price loading immediately
    fetchPrice(roomConfigs, checkInDate, checkOutDate);
  };

  // ─── Guest Handlers ───────────────────────────────────────────────────────

  const handleGuestChange = (index: number, field: keyof IAmendGuest, value: string) => {
    setGuestForms((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: field === "age" ? (value === "" ? undefined : Number(value)) : value,
      };
      return updated;
    });
    setGuestErrors((prev) => {
      const key = `guest-${index}`;
      if (!prev[key]) return prev;
      const updated = { ...prev[key] };
      delete updated[field as keyof IGuestFieldErrors];
      if (Object.keys(updated).length === 0) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: updated };
    });
  };

  // ─── Confirm ─────────────────────────────────────────────────────────────

  const handleConfirm = async () => {
    if (priceStatus !== "success") {
      toast.error("Please wait for availability confirmation.");
      return;
    }
    setLoading(true);
    const result = await amendReservationApi(reservation.bookingCode, {
      propertyCode: reservation.propertyCode,
      checkInDate,
      checkOutDate,
      requestedRooms,
      rooms: roomConfigs,
      previousRooms: originalRooms,
      guests: guestForms,
      roomTypeCode: reservation.roomTypeCode,
      ratePlanCode: reservation.ratePlanCode,
      amount,
      finalPrice,
      currencyCode: reservation.currencyCode,
      bookingUserEmail: reservation.bookingUserEmail,
      bookingUserPhone: reservation.bookingUserPhone,
      status: "Modified",
      extraAmountToPay: finalPrice.booking?.finalPayable || 0,
      refundAmount: finalPrice.booking?.refundAmount || 0,
      paymentType: reservation.paymentMethod,
    });
    setLoading(false);

    if (!result.success) {
      toast.error(result.message || "Failed to amend reservation");
      return;
    }

    toast.success("Reservation amended successfully!");
    onSuccess();
    onClose();
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">

        <DialogHeader className="px-6 py-5 border-b border-border">
          <div>
            <DialogTitle className="text-xl font-bold text-card-foreground">Amend Reservation</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-0.5">
              {reservation.bookingCode}
            </DialogDescription>
          </div>
          <div className="mt-5">
            <StepIndicator current={step} />
          </div>
        </DialogHeader>

        <div className="px-6 py-4 bg-muted/40 border-b border-border">
          <p className="font-semibold text-card-foreground text-sm mb-2">{reservation.hotelName || "Property"}</p>
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
            <span>
              <span className="font-medium text-card-foreground">Stay: </span>
              {new Date(initialCheckIn).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              {" → "}
              {new Date(initialCheckOut).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
            <span><span className="font-medium text-card-foreground">Room: </span>{reservation.roomTypeCode}</span>
            <span><span className="font-medium text-card-foreground">Rate: </span>{reservation.ratePlanCode}</span>
          </div>
        </div>

        <div className="px-6 py-6">
          {step === 1 && (
            <GuestSelector
              checkInDate={checkInDate}
              checkOutDate={checkOutDate}
              roomConfigs={roomConfigs}
              originalCheckIn={initialCheckIn}
              originalCheckOut={initialCheckOut}
              originalRooms={originalRooms}
              dateErrors={dateErrors}
              onCheckInChange={(val) => { setCheckInDate(val); setDateErrors((p) => ({ ...p, checkIn: undefined })); resetPrice(); }}
              onCheckOutChange={(val) => { setCheckOutDate(val); setDateErrors((p) => ({ ...p, checkOut: undefined })); resetPrice(); }}
              onAddRoom={handleAddRoom}
              onRemoveRoom={handleRemoveRoom}
              onAdultChange={handleAdultChange}
              onChildChange={handleChildChange}
              onChildAgeChange={handleChildAgeChange}
              onApply={handleStep1Apply}
            />
          )}

          {step === 2 && (
            <GuestDetails
              guests={guestForms}
              guestErrors={guestErrors}
              onGuestChange={handleGuestChange}
              onBack={() => setStep(1)}
              onNext={handleStep2Next}
            />
          )}

          {step === 3 && (
            <PriceSection
              currency={reservation.currencyCode}
              paidAmount={reservation.paidAmount}
              originalAmount={reservation.amount}
              updatedAmount={amount}
              finalPrice={finalPrice}
              priceStatus={priceStatus}
              loading={loading}
              paymentMethod={reservation.paymentMethod}
              onRetry={() => fetchPrice(roomConfigs, checkInDate, checkOutDate)}
              onBack={() => setStep(2)}
              onConfirm={handleConfirm}
            />
          )}
        </div>

      </DialogContent>
    </Dialog>
  );
};

export default AmendReservationModal;
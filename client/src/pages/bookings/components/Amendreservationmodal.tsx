"use client";

import { useState, useCallback, type FC } from "react";
import { isBefore, startOfDay } from "date-fns";
import {
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Info,
  User,
  CalendarRange,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import toast from "react-hot-toast";
import { checkAmendPrice, amendReservationApi } from "../api";
import type {
  IAmendGuest,
  IAmendRoom,
  IAmendFinalPrice,
  AmendTab,
  IAmendValidationErrors,
  IGuestFieldErrors,
  IAmendReservationModalProps,
  IBookingAddon,
  ISelectedAddons,
} from "../types/amend.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// ─── Types ────────────────────────────────────────────────────────────────────

interface IRoomConfig {
  adults: number;
  children: number;
  childAges: number[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const parseDate = (date: any): string => {
  if (typeof date === "string") return date.split("T")[0];
  if (date && typeof date === "object" && "$date" in date)
    return (date as any).$date.split("T")[0];
  return "";
};

const formatDateForInput = (date: Date) => date.toISOString().split("T")[0];

const todayStr = formatDateForInput(new Date());
const tomorrowStr = (() => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return formatDateForInput(d);
})();

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

const buildInitialRoomConfigs = (reservation: any): IRoomConfig[] => {
  const breakdown =
    reservation.priceBreakdowns?.[0]?.dailyBreakdown ??
    reservation.finalPrice?.dailyBreakdown ??
    [];

  const roomMap = new Map<string, IRoomConfig>();
  for (const day of breakdown) {
    if (!roomMap.has(day.roomNumber)) {
      roomMap.set(day.roomNumber, {
        adults: day.guestDistribution?.adults ?? 1,
        children: day.guestDistribution?.children ?? 0,
        childAges: [...(day.guestDistribution?.childAges ?? [])],
      });
    }
  }

  if (roomMap.size === 0) {
    return [{ adults: 1, children: 0, childAges: [] }];
  }

  return Array.from(roomMap.values());
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

// ─── Counter ──────────────────────────────────────────────────────────────────

const Counter: FC<{
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
  min?: number;
}> = ({ value, onDecrement, onIncrement, min = 0 }) => (
  <div className="flex items-center gap-2">
    <button
      onClick={onDecrement}
      disabled={value <= min}
      className="w-7 h-7 rounded-full border border-border bg-card flex items-center justify-center
        text-card-foreground font-bold text-base hover:bg-accent transition-colors
        disabled:opacity-30 disabled:cursor-not-allowed"
    >
      −
    </button>
    <span className="w-5 text-center text-sm font-bold text-card-foreground">{value}</span>
    <button
      onClick={onIncrement}
      className="w-7 h-7 rounded-full border border-border bg-card flex items-center justify-center
        text-card-foreground font-bold text-base hover:bg-accent transition-colors"
    >
      +
    </button>
  </div>
);

// ─── Price Summary ────────────────────────────────────────────────────────────

interface PriceSummaryProps {
  currency: string;
  paidAmount: number;
  originalAmount: number;
  updatedAmount: number;
  finalPrice: IAmendFinalPrice;
  priceFetched: boolean;
  paymentMethod: string;
  showBreakdown: boolean;
  onToggleBreakdown: () => void;
}

const PriceSummary: FC<PriceSummaryProps> = ({
  currency,
  paidAmount,
  originalAmount,
  updatedAmount,
  finalPrice,
  priceFetched,
  paymentMethod,
  showBreakdown,
  onToggleBreakdown,
}) => {
  const isPayAtHotel = paymentMethod === "pay_at_hotel" || paymentMethod === "payAtHotel";

  const fmt = (n: number) =>
    `${currency} ${Number(n || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // Derive number of nights from unique dates in dailyPriceBrakeDown
  const numberOfNights = [...new Set(finalPrice.dailyPriceBrakeDown.map((d) => d.date))].length;

  const DetailsToggle = () => (
    <button
      onClick={onToggleBreakdown}
      className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
    >
      <Info className="h-4 w-4" />
      {showBreakdown ? "Hide" : "Details"}
      {showBreakdown ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
    </button>
  );

  const BreakdownPanel = () => (
    <div className="border-t border-border bg-muted/40 px-5 py-4 space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        Price Breakdown
      </p>

      {/* Base charges */}
      {finalPrice.amountBeforeTax > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-card-foreground">
            Base Rate{numberOfNights > 0 ? ` (${numberOfNights} ${numberOfNights === 1 ? "night" : "nights"})` : ""}
          </span>
          <span className="font-medium">{fmt(finalPrice.amountBeforeTax)}</span>
        </div>
      )}

      {/* Add-ons */}
      {finalPrice.totalAddonAmount > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-card-foreground">Add-ons</span>
          <span className="font-medium">{fmt(finalPrice.totalAddonAmount)}</span>
        </div>
      )}

      {/* Promotions */}
      {finalPrice.totalPromotionAmount > 0 && (
        <div className="flex justify-between text-sm text-green-700 dark:text-green-400">
          <span>Promotion Discount</span>
          <span>− {fmt(finalPrice.totalPromotionAmount)}</span>
        </div>
      )}

      {/* Loyalty */}
      {finalPrice.loyalityDiscount > 0 && (
        <div className="flex justify-between text-sm text-green-700 dark:text-green-400">
          <span>Loyalty Discount</span>
          <span>− {fmt(finalPrice.loyalityDiscount)}</span>
        </div>
      )}

      {/* Tax rows */}
      {finalPrice.taxBrakeDown?.length > 0 && (
        <>
          <div className="border-t border-border pt-2 mt-1 space-y-1">
            {finalPrice.taxBrakeDown.map((t, i) => (
              <div key={i} className="flex justify-between text-sm text-muted-foreground">
                <span>{t.name}</span>
                <span>{fmt(t.taxedAmount)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span>Total Tax</span>
            <span>{fmt(finalPrice.taxedAmount)}</span>
          </div>
        </>
      )}

      {/* Total */}
      <div className="flex justify-between font-bold text-base border-t border-border pt-2 mt-2">
        <span>Total</span>
        <span className="text-primary">{fmt(finalPrice.totalAmount)}</span>
      </div>
    </div>
  );

  if (isPayAtHotel) {
    return (
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Pay at Hotel
            </p>
            <p className="text-2xl font-bold text-card-foreground">
              {priceFetched ? fmt(updatedAmount) : fmt(originalAmount)}
            </p>
            {priceFetched && updatedAmount !== originalAmount && (
              <p className="text-xs text-muted-foreground mt-0.5 line-through">{fmt(originalAmount)}</p>
            )}
          </div>
          {priceFetched && <DetailsToggle />}
        </div>
        {showBreakdown && priceFetched && <BreakdownPanel />}
      </div>
    );
  }

  // ── Paid online ──
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-5 py-4 grid grid-cols-2 gap-6 border-b border-border">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Original Price
          </p>
          <p className="text-xl font-bold text-card-foreground">{fmt(originalAmount)}</p>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Updated Price
            </p>
            <p className={`text-xl font-bold ${priceFetched ? "text-primary" : "text-muted-foreground"}`}>
              {fmt(updatedAmount)}
            </p>
          </div>
          {priceFetched && <DetailsToggle />}
        </div>
      </div>

      {showBreakdown && priceFetched && <BreakdownPanel />}

      <div className="px-5 py-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Already Paid</span>
          <span className="font-semibold text-card-foreground">{fmt(paidAmount)}</span>
        </div>

        {priceFetched && (finalPrice.booking?.finalPayable ?? 0) > 0 && (
          <div className="flex justify-between items-center bg-destructive/10 rounded-md px-3 py-2.5">
            <span className="text-sm font-medium text-destructive">Additional Amount Due</span>
            <span className="text-sm font-bold text-destructive">{fmt(finalPrice.booking!.finalPayable)}</span>
          </div>
        )}

        {priceFetched && (finalPrice.booking?.refundAmount ?? 0) > 0 && (
          <div className="flex justify-between items-center bg-green-500/10 rounded-md px-3 py-2.5">
            <span className="text-sm font-medium text-green-700 dark:text-green-400">Refund Amount</span>
            <span className="text-sm font-bold text-green-700 dark:text-green-400">{fmt(finalPrice.booking!.refundAmount)}</span>
          </div>
        )}

        {!priceFetched && (
          <p className="text-xs text-muted-foreground text-center py-1 italic">
            Check availability to see updated pricing
          </p>
        )}
      </div>
    </div>
  );
};

// ─── Main Modal ───────────────────────────────────────────────────────────────

const AmendReservationModal: FC<IAmendReservationModalProps> = ({
  open,
  reservation,
  onClose,
  onSuccess,
}) => {
  const initialCheckIn = parseDate(reservation.checkInDate);
  const initialCheckOut = parseDate(reservation.checkOutDate);
  const originalRooms =
    reservation.priceBreakdowns?.[0]?.requestedRooms ??
    (reservation.finalPrice as any)?.requestedRooms ??
    1;

  const [activeTab, setActiveTab] = useState<AmendTab>("dates");
  const [checkInDate, setCheckInDate] = useState(initialCheckIn);
  const [checkOutDate, setCheckOutDate] = useState(initialCheckOut);
  const [roomConfigs, setRoomConfigs] = useState<IRoomConfig[]>(buildInitialRoomConfigs(reservation));
  const [guestForms, setGuestForms] = useState<IAmendGuest[]>(normalizeGuests(reservation.guests));
  const [amount, setAmount] = useState<number>(reservation.amount);
  const [finalPrice, setFinalPrice] = useState<IAmendFinalPrice>(emptyFinalPrice());
  const [priceFetched, setPriceFetched] = useState(false);
  const [priceFetchError, setPriceFetchError] = useState(false);
  const [priceLoading, setPriceLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [dateErrors, setDateErrors] = useState<Pick<IAmendValidationErrors, "checkIn" | "checkOut">>({});
  const [guestErrors, setGuestErrors] = useState<Record<string, IGuestFieldErrors>>({});

  const checkInIsPast = isBefore(startOfDay(new Date(initialCheckIn)), startOfDay(new Date()));

  const resetPrice = useCallback(() => {
    setPriceFetched(false);
    setPriceFetchError(false);
    setShowBreakdown(false);
  }, []);

  // ─── Room Handlers ────────────────────────────────────────────────────────

  const handleAddRoom = () => {
    setRoomConfigs((prev) => [...prev, { adults: 1, children: 0, childAges: [] }]);
    resetPrice();
  };

  const handleRemoveRoom = (roomIndex: number) => {
    if (roomConfigs.length <= 1) { toast.error("At least one room is required."); return; }
    setRoomConfigs((prev) => prev.filter((_, i) => i !== roomIndex));
    resetPrice();
  };

  const handleRoomAdultChange = (roomIndex: number, delta: number) => {
    setRoomConfigs((prev) => {
      const updated = [...prev];
      const newVal = updated[roomIndex].adults + delta;
      if (newVal < 1) return prev;
      updated[roomIndex] = { ...updated[roomIndex], adults: newVal };
      return updated;
    });
    resetPrice();
  };

  const handleRoomChildChange = (roomIndex: number, delta: number) => {
    setRoomConfigs((prev) => {
      const updated = [...prev];
      const room = updated[roomIndex];
      const newCount = room.children + delta;
      if (newCount < 0) return prev;
      const newChildAges = [...room.childAges];
      if (delta > 0) newChildAges.push(0);
      else newChildAges.pop();
      updated[roomIndex] = { ...room, children: newCount, childAges: newChildAges };
      return updated;
    });
    resetPrice();
  };

  const handleChildAgeChange = (roomIndex: number, childIndex: number, age: number) => {
    setRoomConfigs((prev) => {
      const updated = [...prev];
      const newChildAges = [...updated[roomIndex].childAges];
      newChildAges[childIndex] = age;
      updated[roomIndex] = { ...updated[roomIndex], childAges: newChildAges };
      return updated;
    });
    resetPrice();
  };

  // ─── Derived totals ───────────────────────────────────────────────────────

  const totalAdults = roomConfigs.reduce((sum, r) => sum + r.adults, 0);
  const totalChildren = roomConfigs.reduce((sum, r) => sum + r.children, 0);
  const totalChildAges = roomConfigs.flatMap((r) => r.childAges);
  const requestedRooms = roomConfigs.length;

  // ─── Check Price ──────────────────────────────────────────────────────────

  const handleCheckPrice = async () => {
    if (!checkInDate || !checkOutDate) {
      toast.error("Please select both check-in and check-out dates");
      return;
    }

    // ✅ guestDistribution directly from room cards
    const guestDistribution = roomConfigs.map((r) => ({
      adults: r.adults,
      children: r.children,
      childAges: r.childAges,
    }));



    const includedAddons = Array.from(
      new Set(
        (reservation.addOns || [])
          .filter((a: IBookingAddon) => a.type === "included")
          .map((a: IBookingAddon) => a.addonId)
      )
    );

    const parsedAddons: ISelectedAddons[] = [];

    (reservation.addOns || [])
      .filter(
        (addon: IBookingAddon) =>
          addon.type === "selected" &&
          !addon.name?.includes("Child age") // 👈 ignore child addons
      )
      .forEach((addon: IBookingAddon) => {
        let existing = parsedAddons.find(a => a.addOnId === addon.addonId);

        if (!existing) {
          existing = {
            addOnId: addon.addonId,
            availability: []
          };
          parsedAddons.push(existing);
        }

        existing.availability.push({
          date: addon.date,
          quantity: addon.quantity
        });
      });

    setPriceLoading(true);
    setPriceFetchError(false);

    const result = await checkAmendPrice({
      propertyCode: reservation.propertyCode || "",
      invTypeCode: reservation.roomTypeCode || "",
      startDate: checkInDate,
      endDate: checkOutDate,
      noOfAdults: totalAdults,
      noOfChildren: totalChildren,
      noOfRooms: requestedRooms,
      ratePlanCode: reservation.ratePlanCode || "",
      bookingCode: reservation.bookingCode,
      previousRooms: originalRooms,
      childAges: totalChildAges,
      guestDistribution,
      parsedAddons,
      includedAddons,
      promoCode: reservation.promoCode || "",
    });

    setPriceLoading(false);

    if (!result.success || !result.data) {
      setPriceFetchError(true);
      toast.error(result.message || "Failed to fetch updated price");
      return;
    }

    // ✅ Use API response directly — no mapping needed
    const priceData = result.data;
    const updatedTotal = Number(priceData.totalAmount);
    const paidAmt = reservation.paidAmount || 0;
    const diff = updatedTotal - paidAmt;

    setFinalPrice({
      ...priceData,
      booking: {
        finalPayable: diff > 0 ? diff : 0,
        refundAmount: diff < 0 ? Math.abs(diff) : 0,
        discount: priceData.promoCodeDiscount || 0,
      },
    });
    setAmount(updatedTotal);
    setPriceFetched(true);
    toast.success("Availability confirmed!");
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
    resetPrice();
  };

  const handleAddGuest = (type: "adult" | "child") => {
    setGuestForms((prev) => [...prev, { type, firstName: "", lastName: "", dob: "" }]);
    resetPrice();
  };

  const handleRemoveGuest = (index: number) => {
    const guest = guestForms[index];
    if (guest.type === "adult") {
      const adultCount = guestForms.filter((g) => g.type === "adult").length;
      if (adultCount <= 1) { toast.error("At least one adult guest is required."); return; }
    }
    setGuestForms((prev) => prev.filter((_, i) => i !== index));
    resetPrice();
  };

  // ─── Validation ───────────────────────────────────────────────────────────

  const validateDates = (): boolean => {
    const errors: typeof dateErrors = {};
    const today = startOfDay(new Date());
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    if (!checkInDate) errors.checkIn = "Check-in date is required.";
    else if (!checkInIsPast && checkIn <= today) errors.checkIn = "Check-in must be after today.";
    if (!checkOutDate) errors.checkOut = "Check-out date is required.";
    else if (checkOut <= checkIn) errors.checkOut = "Check-out must be after check-in.";
    setDateErrors(errors);
    return Object.keys(errors).length === 0;
  };

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

  // ─── Confirm ──────────────────────────────────────────────────────────────

  const handleConfirm = async () => {
    if (priceFetchError) { toast.error("Please check availability first."); return; }
    if (!priceFetched) { toast.error("Please check availability & price before confirming."); return; }
    if (!validateDates()) return;
    if (!validateGuests()) { toast.error("Please fix guest details before confirming."); return; }

    const rooms: IAmendRoom[] = roomConfigs.map((r) => ({
      adults: r.adults,
      children: r.children,
      childAges: r.childAges,
    }));

    setLoading(true);
    const result = await amendReservationApi(reservation.bookingCode, {
      propertyCode: reservation.propertyCode,
      checkInDate,
      checkOutDate,
      requestedRooms,
      rooms,
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

    if (!result.success) { toast.error(result.message || "Failed to amend reservation"); return; }
    toast.success("Reservation amended! Check your email for details.");
    onSuccess();
    onClose();
  };

  const adultCount = guestForms.filter((g) => g.type === "adult").length;
  const childCount = guestForms.filter((g) => g.type === "child").length;

  // ─── Check Availability Button ────────────────────────────────────────────

  const CheckAvailabilityButton = () => (
    <div className="pt-6 border-t border-border">
      <button
        onClick={handleCheckPrice}
        disabled={priceLoading || !checkInDate || !checkOutDate}
        className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-lg font-semibold text-sm transition-all
          bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {priceLoading ? (
          <>
            <svg className="animate-spin h-4 w-4 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Checking availability...
          </>
        ) : (
          <>
            <RefreshCw className={`h-4 w-4 ${priceFetched ? "text-primary-foreground/80" : ""}`} />
            {priceFetched ? "Re-check Availability & Price" : "Check Availability & Price"}
          </>
        )}
      </button>

      {priceFetched && !priceLoading && (
        <div className="flex items-center justify-center gap-1.5 mt-3">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <span className="text-sm text-green-700 dark:text-green-400 font-medium">Availability confirmed</span>
        </div>
      )}

      {priceFetchError && !priceLoading && (
        <div className="flex items-center gap-2 mt-3 bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2.5">
          <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
          <p className="text-sm text-destructive">Could not fetch price. Please try again.</p>
        </div>
      )}
    </div>
  );

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">

        {/* Header */}
        <DialogHeader className="px-6 py-5 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold text-card-foreground">Amend Reservation</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-0.5">{reservation.bookingCode}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Booking Summary Strip */}
        <div className="px-6 py-4 bg-muted/50 border-b border-border">
          <p className="font-semibold text-card-foreground text-base mb-3">{reservation.hotelName || "Property"}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">Current Stay</p>
              <p className="text-card-foreground font-medium">
                {new Date(initialCheckIn).toLocaleDateString("en-US", { month: "short", day: "numeric" })}{" "}→{" "}
                {new Date(initialCheckOut).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">Room Type</p>
              <p className="text-card-foreground font-medium">{reservation.roomTypeCode}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">Rate Plan</p>
              <p className="text-card-foreground font-medium">{reservation.ratePlanCode}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-5 pb-0 flex gap-2 border-b border-border">
          {(["dates", "guests"] as AmendTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-card-foreground hover:border-border"
                }`}
            >
              {tab === "dates" ? <CalendarRange className="w-4 h-4" /> : <User className="w-4 h-4" />}
              {tab === "dates" ? "Dates & Rooms" : "Guests"}
              {tab === "guests" && (
                <span className="ml-1 bg-muted text-muted-foreground text-xs rounded-full px-1.5 py-0.5 font-normal">
                  {adultCount + childCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="px-6 py-6">

          {/* DATES TAB */}
          {activeTab === "dates" && (
            <div className="space-y-6">

              {/* Date pickers */}
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-card-foreground">Check-In Date</label>
                  <input
                    type="date" value={checkInDate} min={todayStr} disabled={checkInIsPast}
                    onChange={(e) => { setCheckInDate(e.target.value); setDateErrors((p) => ({ ...p, checkIn: undefined })); resetPrice(); }}
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm bg-background text-card-foreground
                      focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors
                      ${dateErrors.checkIn ? "border-destructive" : "border-border"}
                      ${checkInIsPast ? "opacity-60 cursor-not-allowed bg-muted" : ""}`}
                  />
                  {checkInIsPast && (
                    <p className="text-xs text-amber-600 flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5" />Cannot change — check-in date has passed
                    </p>
                  )}
                  {dateErrors.checkIn && <p className="text-xs text-destructive">{dateErrors.checkIn}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-card-foreground">Check-Out Date</label>
                  <input
                    type="date" value={checkOutDate} min={tomorrowStr}
                    onChange={(e) => { setCheckOutDate(e.target.value); setDateErrors((p) => ({ ...p, checkOut: undefined })); resetPrice(); }}
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm bg-background text-card-foreground
                      focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors
                      ${dateErrors.checkOut ? "border-destructive" : "border-border"}`}
                  />
                  {dateErrors.checkOut && <p className="text-xs text-destructive">{dateErrors.checkOut}</p>}
                </div>
              </div>

              {/* Room Cards */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-card-foreground">
                    Rooms
                    <span className="ml-2 text-xs text-muted-foreground font-normal">(originally booked: {originalRooms})</span>
                  </p>
                  <button
                    onClick={handleAddRoom}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card
                      text-sm font-medium text-card-foreground hover:bg-accent transition-colors"
                  >
                    <Plus className="w-4 h-4 text-primary" />
                    Add Room
                  </button>
                </div>

                <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                  {roomConfigs.map((room, roomIndex) => (
                    <div key={roomIndex} className="rounded-lg border border-border bg-card p-4 space-y-4">

                      {/* Room header */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-card-foreground">Room {roomIndex + 1}</span>
                        {roomConfigs.length > 1 && (
                          <button
                            onClick={() => handleRemoveRoom(roomIndex)}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Adults */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-card-foreground font-medium">Adults</p>
                          <p className="text-xs text-muted-foreground">Min. 1 per room</p>
                        </div>
                        <Counter
                          value={room.adults} min={1}
                          onDecrement={() => handleRoomAdultChange(roomIndex, -1)}
                          onIncrement={() => handleRoomAdultChange(roomIndex, 1)}
                        />
                      </div>

                      {/* Children */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-card-foreground font-medium">Children</p>
                          <p className="text-xs text-muted-foreground">Age required per child</p>
                        </div>
                        <Counter
                          value={room.children} min={0}
                          onDecrement={() => handleRoomChildChange(roomIndex, -1)}
                          onIncrement={() => handleRoomChildChange(roomIndex, 1)}
                        />
                      </div>

                      {/* Child age inputs */}
                      {room.children > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-border">
                          {room.childAges.map((age, childIndex) => (
                            <div key={childIndex} className="space-y-1">
                              <label className="text-xs font-medium text-muted-foreground">
                                Child {childIndex + 1} Age
                              </label>
                              <input
                                type="number" min="0" max="17" placeholder="Age"
                                value={age === 0 ? "" : age}
                                onChange={(e) =>
                                  handleChildAgeChange(roomIndex, childIndex, e.target.value === "" ? 0 : Number(e.target.value))
                                }
                                className="w-full rounded-md border border-border px-3 py-2 text-sm bg-background
                                  text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/30
                                  focus:border-primary transition-colors"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Summary pill */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
                  <span>{requestedRooms} {requestedRooms === 1 ? "room" : "rooms"}</span>
                  <span>·</span>
                  <span>{totalAdults} {totalAdults === 1 ? "adult" : "adults"}</span>
                  {totalChildren > 0 && (
                    <>
                      <span>·</span>
                      <span>{totalChildren} {totalChildren === 1 ? "child" : "children"}</span>
                      <span className="text-muted-foreground/70">(ages: {totalChildAges.join(", ")})</span>
                    </>
                  )}
                </div>
              </div>

              <CheckAvailabilityButton />
            </div>
          )}

          {/* GUESTS TAB */}
          {activeTab === "guests" && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleAddGuest("adult")}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card
                    text-sm font-medium text-card-foreground hover:bg-accent transition-colors"
                >
                  <Plus className="w-4 h-4 text-primary" />Add Adult
                </button>
                <button
                  onClick={() => handleAddGuest("child")}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card
                    text-sm font-medium text-card-foreground hover:bg-accent transition-colors"
                >
                  <Plus className="w-4 h-4 text-primary" />Add Child
                </button>
                <span className="ml-auto text-sm text-muted-foreground">
                  {adultCount} adult{adultCount !== 1 ? "s" : ""}
                  {childCount > 0 ? ` · ${childCount} child${childCount !== 1 ? "ren" : ""}` : ""}
                </span>
              </div>

              <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                {guestForms.map((guest, index) => {
                  const typeCount = guestForms.slice(0, index + 1).filter((g) => g.type === guest.type).length;
                  const gErr = guestErrors[`guest-${index}`] || {};

                  return (
                    <div key={index} className="rounded-lg border border-border bg-card p-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded-full
                          ${guest.type === "adult" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                          {guest.type === "adult" ? `Adult ${typeCount}` : `Child ${typeCount}`}
                        </span>
                        <button
                          onClick={() => handleRemoveGuest(index)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground">
                            First Name <span className="text-destructive">*</span>
                          </label>
                          <input
                            type="text" placeholder="First name" value={guest.firstName}
                            onChange={(e) => handleGuestChange(index, "firstName", e.target.value)}
                            className={`w-full rounded-md border px-3 py-2 text-sm bg-background text-card-foreground
                              focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors
                              ${gErr.firstName ? "border-destructive" : "border-border"}`}
                          />
                          {gErr.firstName && <p className="text-xs text-destructive">{gErr.firstName}</p>}
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground">
                            Last Name <span className="text-destructive">*</span>
                          </label>
                          <input
                            type="text" placeholder="Last name" value={guest.lastName}
                            onChange={(e) => handleGuestChange(index, "lastName", e.target.value)}
                            className={`w-full rounded-md border px-3 py-2 text-sm bg-background text-card-foreground
                              focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors
                              ${gErr.lastName ? "border-destructive" : "border-border"}`}
                          />
                          {gErr.lastName && <p className="text-xs text-destructive">{gErr.lastName}</p>}
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground">Date of Birth</label>
                          <input
                            type="date" value={guest.dob}
                            onChange={(e) => handleGuestChange(index, "dob", e.target.value)}
                            className="w-full rounded-md border border-border px-3 py-2 text-sm bg-background text-card-foreground
                              focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                          />
                        </div>

                        {guest.type === "child" && (
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">Age</label>
                            <input
                              type="number" min="0" max="17" placeholder="Age" value={guest.age ?? ""}
                              onChange={(e) => handleGuestChange(index, "age", e.target.value)}
                              className="w-full rounded-md border border-border px-3 py-2 text-sm bg-background text-card-foreground
                                focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <CheckAvailabilityButton />
            </div>
          )}
        </div>

        {/* Price Summary */}
        <div className="px-6 pb-6 space-y-4">
          <div className="border-t border-border pt-5">
            <p className="text-sm font-semibold text-card-foreground mb-3">Pricing Summary</p>
            <PriceSummary
              currency={reservation.currencyCode}
              paidAmount={reservation.paidAmount}
              originalAmount={reservation.amount}
              updatedAmount={amount}
              finalPrice={finalPrice}
              priceFetched={priceFetched}
              paymentMethod={reservation.paymentMethod}
              showBreakdown={showBreakdown}
              onToggleBreakdown={() => setShowBreakdown((v) => !v)}
            />
          </div>

          {/* Policy */}
          <div className="rounded-lg bg-muted/50 border border-border px-4 py-3 space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Policy Notes</p>
            <p className="text-xs text-muted-foreground">• Date changes are subject to availability</p>
            <p className="text-xs text-muted-foreground">• Changes within 72 hours of check-in may incur additional fees</p>
            <p className="text-xs text-muted-foreground">• Reducing length of stay may be subject to cancellation policy</p>
          </div>

          {/* Footer buttons */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-lg border border-border text-sm font-medium
                text-muted-foreground hover:text-card-foreground hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={priceFetchError || !priceFetched || loading}
              className="flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold
                bg-primary text-primary-foreground hover:bg-primary/90 transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Updating...
                </>
              ) : "Confirm Amend"}
            </button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
};

export default AmendReservationModal;
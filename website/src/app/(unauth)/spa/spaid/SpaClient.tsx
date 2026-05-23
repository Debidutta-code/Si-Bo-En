"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import {
  MapPin, CheckCircle, Trash2, ShoppingCart, Clock, CalendarDays,
  Loader2, X, AlertCircle, ChevronLeft, Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { getSpaByPropertyCodeApi, createSpaReservationApi, cancelSpaReservationApi } from "../api/spa.api";
import { ISpa, ISpaDate, ISpaSlot } from "../interface";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/store";
import { formatInTimeZone } from "date-fns-tz";
import { CurrencyCode } from "@/src/components/currencyCode/currency-code.type";

interface SelectedSlot {
  id: string;
  spaId: string;
  slotId: string;
  spaDateId: string;
  date: string;
  spaName: string;
  dateLabel: string;
  startTime: string;
  endTime: string;
  amount: number;
}


export default function SpaClient() {
  const searchParams = useSearchParams();
  const propertyCode = searchParams.get("propertyCode") || searchParams.get("code") || "";
  const spaId = searchParams.get("id") || "";
  const customer = useSelector((state: RootState) => (state as any).customer);
  const [spas, setSpas] = useState<ISpa[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<Map<string, SelectedSlot>>(new Map());
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [formErrors, setFormErrors] = useState<{ name?: string; email?: string; phone?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [cancellingSlotId, setCancellingSlotId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    bookingId: string;
    slotId: string;
    label: string;
  } | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const bookingMapRef = useRef<Record<string, string>>({});

  const hasPropertyCode = Boolean(propertyCode.trim());

  useEffect(() => {
    if (!hasPropertyCode) return;
    void loadSpas(propertyCode.trim());
  }, [propertyCode, hasPropertyCode]);

  const loadSpas = async (code: string) => {
    setLoading(true);
    try {
      const response = await getSpaByPropertyCodeApi(code);
      if (response.success) {
        setSpas(response.data || []);
      } else {
        setSpas([]);
        toast.error(response.message || "Unable to load spa services");
      }
    } catch {
      toast.error("Unable to load spa services");
      setSpas([]);
    } finally {
      setLoading(false);
    }
  };

  const getSlotUniqueId = (slotId: string, dateId: string) => `${slotId}_${dateId}`;

  const isUpcomingDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    } catch {
      return false;
    }
  };

  const handleToggleSlot = (spa: ISpa, spaDate: ISpaDate, slot: ISpaSlot) => {
    if (slot.isBooked) { toast.error("This slot is already booked."); return; }
    const uniqueId = getSlotUniqueId(slot.id, spaDate.id);
    const amount = spa.isInclusive ? 0 : spa.discountValue || 0;
    setSelectedSlots(prev => {
      const next = new Map(prev);
      if (next.has(uniqueId)) {
        next.delete(uniqueId);
      } else {
        next.set(uniqueId, {
          id: uniqueId, spaId: spa.id || spaId as string, slotId: slot.id,
          spaDateId: spaDate.id, date: spaDate.date, spaName: spa.name,
          dateLabel: formatInTimeZone(new Date(spaDate.date), "UTC", "EEEE, MMM dd, yyyy"),
          startTime: slot.startTime, endTime: slot.endTime || slot.startTime, amount,
        });
      }
      return next;
    });
  };

  const isSlotSelected = (slotId: string, dateId: string) => selectedSlots.has(getSlotUniqueId(slotId, dateId));

  const totalAmount = useMemo(() => {
    let total = 0;
    selectedSlots.forEach(s => { total += s.amount; });
    return total;
  }, [selectedSlots]);

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPhone = (phone: string) => /^[0-9+()\-\s]{7,20}$/.test(phone);

  const validateField = (field: "name" | "email" | "phone", value: string) => {
    let error: string | undefined;
    const trimmed = value.trim();

    if (field === "name") {
      if (!trimmed) error = "Full name is required.";
    }
    if (field === "email") {
      if (!trimmed) error = "Email address is required.";
      else if (!isValidEmail(trimmed)) error = "Enter a valid email address.";
    }
    if (field === "phone") {
      if (!trimmed) error = "Phone number is required.";
      else if (!isValidPhone(trimmed)) error = "Enter a valid phone number.";
    }

    setFormErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  };

  const validateBookingForm = () => {
    const nameValid = validateField("name", customerName);
    const emailValid = validateField("email", customerEmail);
    const phoneValid = validateField("phone", customerPhone);
    return nameValid && emailValid && phoneValid;
  };

  const handleConfirmBooking = async () => {
    if (selectedSlots.size === 0) { toast.error("Please select at least one slot."); return; }
    if (!validateBookingForm()) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    // If not logged in, redirect to login and come back to this SPA page after success
    if (!(customer as any)?.isAuthenticated) {
      const redirectUrl = `/spa/spaid/?id=${encodeURIComponent(spaId)}&propertyCode=${encodeURIComponent(propertyCode)}`;
      sessionStorage.setItem("customerRedirectUrl", redirectUrl);
      toast.error("Please login to book spa slots");
      window.location.href = "/login";
      return;
    }
    setSubmitting(true);
    try {
      const slotsData = Array.from(selectedSlots.values()).map(s => ({
        spaId: s.spaId, spaSlotId: s.slotId, amount: s.amount,
      }));
      const response = await createSpaReservationApi({
        userEmail: customerEmail.trim(),
        userContactNumber: customerPhone.trim(),
        slots: slotsData,
        userName: customerName,
        currencyCode: spa?.currencyCode as CurrencyCode || "AED",
      });
      if (response.success) {
        toast.success(`${selectedSlots.size} slot(s) booked!`);
        const bookingId = response.data?.id;
        if (bookingId) {
          selectedSlots.forEach(s => { bookingMapRef.current[s.slotId] = bookingId; });
        }
        setSpas(prev =>
          prev.map(s => ({
            ...s,
            SpaDates: s.SpaDates?.map(d => ({
              ...d,
              Slots: d.Slots?.map(sl => {
                const hit = Array.from(selectedSlots.values()).some(
                  sel => sel.slotId === sl.id && sel.spaDateId === d.id
                );
                return hit ? { ...sl, isBooked: true, reservationId: bookingId, SlotBooking: { spaBookingId: bookingId }, Reservation: { bookingCode: sl.Reservation?.bookingCode || "", id: bookingId } as any } : sl;
              }),
            })),
          }))
        );
        // Close booking modal and clear form
        setShowBookingModal(false);
        setSelectedSlots(new Map());
        setCustomerName(""); setCustomerEmail(""); setCustomerPhone("");
        await loadSpas(propertyCode.trim());
      } else {
        toast.error(response.message || "Failed to create booking.");
      }
    } catch {
      toast.error("Failed to create booking.");
    } finally {
      setSubmitting(false);
    }
  };

  // Cancel a booked slot (single slot within booking)
  const openCancelModal = (slot: ISpaSlot, spaDateId: string) => {
    const bookingId =
      bookingMapRef.current[slot.id] ||
      slot.SlotBooking?.spaBookingId ||
      slot.reservationId ||
      (slot.Reservation as any)?.id;

    if (!bookingId) {
      toast.error("Unable to cancel: booking ID missing.");
      return;
    }
    setConfirmModal({
      bookingId,
      slotId: slot.id,
      label: formatTime(slot.startTime),
    });
  };

  // const handleConfirmCancel = async () => {
  //   if (!confirmModal) return;
  //   const { bookingId, slotId, label } = confirmModal;
  //   setConfirmModal(null);
  //   setCancellingSlotId(slotId);
  //   try {
  //     // Cancel single slot: pass spaSlotId in body
  //     const response = await cancelSpaReservationApi(bookingId, slotId);
  //     if (response.success) {
  //       toast.success(`Slot cancelled successfully.`);
  //       // Mark the specific slot as cancelled locally so the UI shows 'Cancelled'
  //       setSpas(prev =>
  //         prev.map(s => ({
  //           ...s,
  //           SpaDates: s.SpaDates?.map(d => ({
  //             ...d,
  //             Slots: d.Slots?.map(sl => {
  //               if (sl.id === slotId) {
  //                 return { ...sl, status: 'cancelled', isCancelled: true } as any;
  //               }
  //               return sl;
  //             }),
  //           })),
  //         }))
  //       );
  //     } else {
  //       toast.error(response.message || "Failed to cancel slot.");
  //     }
  //   } catch {
  //     toast.error("Failed to cancel slot.");
  //   } finally {
  //     setCancellingSlotId(null);
  //   }
  // };

  const formatDate = (v: string) => {
    try {
      return formatInTimeZone(new Date(v), "UTC", "EEE, MMM d, yyyy");
    } catch { return v; }
  };

  const formatTime = (v: string) => {
    try {
      return formatInTimeZone(new Date(v), "UTC", "hh:mm a");
    } catch { return v; }
  };
  const spa = useMemo(() => spas.find(item => item.id === spaId), [spas, spaId]);
  const availableSlots = useMemo(
    () => spa?.SpaDates?.reduce((s, d) => s + (isUpcomingDate(d.date) ? (d.Slots?.filter(sl => !sl.isBooked).length || 0) : 0), 0) || 0,
    [spa],
  );
  const coverImage = (spa as any)?.images?.[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-stone-100 to-amber-50/30">
      {/* Cancel Confirm Modal */}
      {/* {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmModal(null)} />
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-stone-900">Cancel this slot?</h3>
            <p className="mt-2 text-sm text-stone-500 leading-relaxed">
              You're about to cancel the <strong>{confirmModal.label}</strong> slot. Other slots in this booking will remain active.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
              >
                Keep it
              </button>
              <button
                onClick={handleConfirmCancel}
                className="flex-1 rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Yes, cancel
              </button>
            </div>
          </div>
        </div>
      )} */}

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Back nav */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href={`/spa?propertyCode=${encodeURIComponent(propertyCode)}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-sm transition hover:bg-stone-50"
          >
            <ChevronLeft className="h-4 w-4" /> Back to services
          </Link>
        </div>

        {!hasPropertyCode ? (
          <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-12 text-center text-stone-500">
            Add <code className="rounded bg-stone-100 px-2 py-0.5 font-mono text-sm">?code=PROPERTY_CODE</code> to the URL.
          </div>
        ) : loading ? (
          <div className="rounded-3xl border border-stone-200 bg-white p-16 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-amber-600 mb-3" />
            <p className="text-sm text-stone-500">Loading…</p>
          </div>
        ) : !spa ? (
          <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-16 text-center text-stone-500">
            Spa not found for this property code.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Spa Hero */}
            <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
              {coverImage && (
                <div className="h-52 w-full overflow-hidden">
                  <img src={coverImage} alt={spa.name} className="h-full w-full object-cover" />
                </div>
              )}
              <div className="p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {spa.Category?.name && (
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                          {spa.Category.name}
                        </span>
                      )}
                      {spa.location && (
                        <span className="inline-flex items-center gap-1 text-xs text-stone-500">
                          <MapPin className="h-3 w-3" />{spa.location}
                        </span>
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-stone-900">{spa.name}</h2>
                      <p className="mt-1.5 max-w-2xl text-sm leading-6 text-stone-500">{spa.description || "No description available."}</p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 rounded-2xl bg-gradient-to-br from-amber-50 to-stone-50 border border-amber-100 p-4 text-sm min-w-[160px]">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">
                      <Sparkles className="h-3 w-3" /> Details
                    </div>
                    <p className="text-xl font-bold text-stone-900">
                      {spa.isInclusive ? "Inclusive" : spa.discountValue ? `${spa.currencyCode || "AED"} ${spa.discountValue}` : "—"}
                    </p>
                    <div className="mt-2 space-y-1 text-xs text-stone-500">
                      <p className="flex items-center gap-1"><Clock className="h-3 w-3" />{spa.serviceTime || "TBD"} min session</p>
                      <p className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{availableSlots} open slots</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Dates & Slots */}
              <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-stone-900">Available Dates & Slots</h3>
                  {selectedSlots.size > 0 && (
                    <button
                      onClick={() => setSelectedSlots(new Map())}
                      className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      <X className="h-4 w-4" />
                      Clear ({selectedSlots.size})
                    </button>
                  )}
                </div>
                {!spa.SpaDates?.length ? (
                  <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 p-8 text-center text-sm text-stone-500">
                    No dates configured for this spa yet.
                  </div>
                ) : (
                  <div className="space-y-5">
                    {spa.SpaDates?.filter((spaDate: ISpaDate) => isUpcomingDate(spaDate.date)).map((spaDate: ISpaDate) => {
                      const openCount = spaDate.Slots?.filter(s => !s.isBooked).length || 0;
                      const selectedCount = spaDate.Slots?.filter(s => selectedSlots.has(getSlotUniqueId(s.id, spaDate.id))).length || 0;

                      return (
                        <div key={spaDate.id} className="rounded-2xl border border-stone-200 overflow-hidden">
                          <div className="flex items-center justify-between bg-stone-50 px-4 py-3 border-b border-stone-200">
                            <div>
                              <p className="text-sm font-semibold text-stone-900">{formatDate(spaDate.date)}</p>
                              <p className="text-xs text-stone-500 mt-0.5">{openCount} open · {spaDate.Slots?.length || 0} total</p>
                            </div>
                            {selectedCount > 0 && (
                              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                                {selectedCount} selected
                              </span>
                            )}
                          </div>
                          <div className="grid gap-3 p-4 sm:grid-cols-2">
                            {spaDate.Slots?.map((slot: ISpaSlot) => {
                              const isSelected = isSlotSelected(slot.id, spaDate.id);
                              const isCancellingThis = cancellingSlotId === slot.id;
                              const isInPast = (() => {
                                try {
                                  if (!slot.startTime) return false;
                                  return new Date(slot.startTime).getTime() < Date.now();
                                } catch {
                                  return false;
                                }
                              })();
                              return (
                                !slot.isBooked && (
                                  <div
                                    key={slot.id}
                                    className={`rounded-2xl border p-4 transition-all ${isSelected
                                      ? "border-amber-400 bg-amber-50 shadow-sm"
                                      : "border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm cursor-pointer"
                                      }`}
                                    onClick={() => handleToggleSlot(spa, spaDate, slot)}
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div>
                                        <p className="text-sm font-semibold text-stone-900">
                                          {formatTime(slot.startTime)}
                                        </p>
                                        {slot.endTime && (
                                          <p className="text-xs text-stone-400">to {formatTime(slot.endTime)}</p>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        {isSelected && <CheckCircle className="h-4 w-4 text-amber-600" />}
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${isSelected
                                          ? "bg-amber-100 text-amber-800"
                                          : "bg-emerald-100 text-emerald-700"
                                          }`}>
                                          {isSelected ? "Selected" : "Open"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Booking Button */}
              {selectedSlots.size > 0 && (
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      if (!(customer as any)?.isAuthenticated) {
                        const redirectUrl = `/spa/spaid/?id=${encodeURIComponent(spaId)}&propertyCode=${encodeURIComponent(propertyCode)}`;
                        sessionStorage.setItem("customerRedirectUrl", redirectUrl);
                        window.location.href = "/login";
                        return;
                      }
                      setShowBookingModal(true);
                    }} className="inline-flex items-center gap-2 rounded-2xl bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-700 hover:shadow-lg"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Review & Book ({selectedSlots.size})
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Booking Modal */}
        {showBookingModal && customer.isAuthenticated && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowBookingModal(false)} />
            <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-stone-900">Complete Your Booking</h2>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="rounded-xl p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Selected Slots Summary */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-3">Selected Slots</p>
                  <div className="max-h-[200px] overflow-y-auto space-y-2 pr-1">
                    {Array.from(selectedSlots.values()).map(slot => (
                      <div key={slot.id} className="rounded-xl border border-stone-100 bg-stone-50 p-3">
                        <div className="flex items-start justify-between">
                          <div className="text-xs">
                            <p className="font-semibold text-stone-700">{slot.dateLabel}</p>
                            <p className="text-stone-500 mt-0.5">
                              {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                            </p>
                            <p className="font-semibold text-emerald-700 mt-1">
                              {slot.amount === 0 ? "Inclusive" : `${spa?.currencyCode || "AED"} ${slot.amount}`}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedSlots(prev => { const n = new Map(prev); n.delete(slot.id); return n; });
                            }}
                            className="rounded-lg p-1 text-stone-400 hover:bg-stone-200 hover:text-stone-600 transition flex-shrink-0"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Summary */}
                <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-stone-50 border border-amber-100 p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Slots</span>
                    <span className="font-semibold text-stone-900">{selectedSlots.size}</span>
                  </div>
                  <div className="border-t border-amber-100 pt-2 flex justify-between">
                    <span className="text-stone-500">Total</span>
                    <span className="text-lg font-bold text-stone-900">
                      {totalAmount === 0 ? "Inclusive" : `${spa?.currencyCode || "AED"} ${totalAmount}`}
                    </span>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="space-y-2.5 pt-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">Your Details</p>
                  <div>
                    <input
                      type="text"
                      value={customerName}
                      onChange={e => {
                        setCustomerName(e.target.value);
                        if (formErrors.name) validateField("name", e.target.value);
                      }}
                      onBlur={e => validateField("name", e.target.value)}
                      placeholder="Full name *"
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 ${formErrors.name
                        ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100"
                        : "border-stone-200 bg-white focus:border-amber-400 focus:ring-amber-100"
                        } text-stone-900`}
                    />
                    {formErrors.name && (
                      <p className="mt-2 text-xs text-red-600">{formErrors.name}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={e => {
                        setCustomerEmail(e.target.value);
                        if (formErrors.email) validateField("email", e.target.value);
                      }}
                      onBlur={e => validateField("email", e.target.value)}
                      placeholder="Email address *"
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 ${formErrors.email
                        ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100"
                        : "border-stone-200 bg-white focus:border-amber-400 focus:ring-amber-100"
                        } text-stone-900`}
                    />
                    {formErrors.email && (
                      <p className="mt-2 text-xs text-red-600">{formErrors.email}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={e => {
                        setCustomerPhone(e.target.value);
                        if (formErrors.phone) validateField("phone", e.target.value);
                      }}
                      onBlur={e => validateField("phone", e.target.value)}
                      placeholder="Phone number *"
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 ${formErrors.phone
                        ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100"
                        : "border-stone-200 bg-white focus:border-amber-400 focus:ring-amber-100"
                        } text-stone-900`}
                    />
                    {formErrors.phone && (
                      <p className="mt-2 text-xs text-red-600">{formErrors.phone}</p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowBookingModal(false)}
                    className="flex-1 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmBooking}
                    disabled={submitting}
                    className="flex-1 rounded-2xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Booking…</span>
                    ) : (
                      `Book ${selectedSlots.size} Slot${selectedSlots.size !== 1 ? "s" : ""}`
                    )}
                  </button>
                </div>

                <div className="rounded-2xl border border-stone-100 bg-stone-50 p-4 text-xs text-stone-500 text-center">
                  <p className="font-semibold text-stone-700 mb-1">Available Slots</p>
                  <p className="text-lg font-bold text-stone-900">{availableSlots}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
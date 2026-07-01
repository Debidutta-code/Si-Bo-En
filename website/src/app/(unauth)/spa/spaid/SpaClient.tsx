"use client";

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  MapPin, CheckCircle, ShoppingCart, Clock, CalendarDays,
  Loader2, X, AlertCircle, ChevronLeft, Sparkles, Plus, Trash2
} from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { getSpaByPropertyCodeApi, createSpaReservationApi } from "../api/spa.api";
import { ISpa, ISpaDate, ISpaSlot, IGuestSlot, ICreateSpaReservationSlot } from "../interface";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/store";
import { CurrencyCode } from "@/src/components/currencyCode/currency-code.type";
import { formatNumber, getLocale } from "../../../../utils/numLang";
import { currencies } from "@/src/components/currencyCode/cuurency";
import { Currency } from "@/src/components/currencyCode/currency-code.type";

interface SelectedSlot {
  id: string;
  spaId: string;
  slotId: string;
  slotsAvailableId: string;
  spaDateId: string;
  date: string;
  spaName: string;
  dateLabel: string;
  startTime: string;
  endTime: string;
  amount: number;
  guestName?: string;
  guestEmail?: string;
  isInclusive?: boolean;
}

interface GuestEntry {
  id: string;
  name: string;
  email: string;
  nameError?: string;
}

export default function SpaClient() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const propertyCode = searchParams.get("propertyCode") || searchParams.get("code") || "";
  const spaId = searchParams.get("id") || "";
  const customer = useSelector((state: RootState) => (state as any).customer);

  const [spas, setSpas] = useState<ISpa[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<Map<string, SelectedSlot>>(new Map());
  const [additionalGuests, setAdditionalGuests] = useState<Map<string, GuestEntry[]>>(new Map());

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const [formErrors, setFormErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
  }>({});

  const [submitting, setSubmitting] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const bookingMapRef = useRef<Record<string, string>>({});

  const hasPropertyCode = Boolean(propertyCode.trim());

  const loadSpas = useCallback(async (code: string) => {
    setLoading(true);
    try {
      const response = await getSpaByPropertyCodeApi(code);
      if (response.success) {
        setSpas(response.data || []);
      } else {
        setSpas([]);
        toast.error(response.message || t("SpaClient.toast.loadFailed"));
      }
    } catch {
      toast.error(t("SpaClient.toast.loadFailed"));
      setSpas([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (!hasPropertyCode) return;
    void loadSpas(propertyCode.trim());
  }, [propertyCode, hasPropertyCode, loadSpas]);

  useEffect(() => {
    if (customer?.isAuthenticated) {
      setCustomerName(`${customer.firstName || ""} ${customer.lastName || ""}`.trim());
      setCustomerEmail(customer.email || "");
      setCustomerPhone(customer.contactNumber || "");
    }
  }, [customer]);

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

  const spa = useMemo(() => spas.find(item => item.id === spaId), [spas, spaId]);

  const handleToggleSlot = (targetSpa: ISpa, spaDate: ISpaDate, slot: ISpaSlot) => {
    const firstActiveAvailability = slot.slotsAvailable?.find(a => a.status === 'active');
    if (!firstActiveAvailability) {
      toast.error(t("SpaClient.toast.slotAlreadyBooked"));
      return;
    }
    const uniqueId = getSlotUniqueId(slot.id, spaDate.id);
    const amount = targetSpa.isInclusive ? 0 : targetSpa.discountValue || 0;

    setSelectedSlots(prev => {
      const next = new Map(prev);
      if (next.has(uniqueId)) {
        next.delete(uniqueId);
        // Also clear guests for this slot
        setAdditionalGuests(prevGuests => {
          const nextGuests = new Map(prevGuests);
          nextGuests.delete(uniqueId);
          return nextGuests;
        });
      } else {
        next.set(uniqueId, {
          id: uniqueId,
          spaId: targetSpa.id || (spaId as string),
          slotId: slot.id,
          slotsAvailableId: firstActiveAvailability.id,
          spaDateId: spaDate.id,
          date: spaDate.date,
          spaName: targetSpa.name,
          dateLabel: new Intl.DateTimeFormat(getLocale(), {
            timeZone: "UTC", weekday: "long", month: "short", day: "2-digit", year: "numeric"
          }).format(new Date(spaDate.date)),
          startTime: slot.startTime,
          endTime: slot.endTime || slot.startTime,
          amount,
          isInclusive: targetSpa.isInclusive,
        });
      }
      return next;
    });
  };

  const isSlotSelected = (slotId: string, dateId: string) => selectedSlots.has(getSlotUniqueId(slotId, dateId));

  const totalGuestsCount = useMemo(() => {
    let count = selectedSlots.size;
    additionalGuests.forEach(guests => { count += guests.length; });
    return count;
  }, [selectedSlots, additionalGuests]);

  const totalAmount = useMemo(() => {
    let total = 0;
    selectedSlots.forEach((s, uniqueId) => {
      total += s.amount;
      const guests = additionalGuests.get(uniqueId) || [];
      total += (s.amount * guests.length);
    });
    return total;
  }, [selectedSlots, additionalGuests]);

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPhone = (phone: string) => /^[0-9+()\-\s]{7,20}$/.test(phone);

  const canAddMoreGuestsToSlot = (uniqueId: string) => {
    const slotSelection = selectedSlots.get(uniqueId);
    if (!slotSelection || !spa) return false;

    const parentDate = spa.SpaDates?.find(d => d.id === slotSelection.spaDateId);
    const parentSlot = (parentDate?.Slots || parentDate?.slots)?.find(s => s.id === slotSelection.slotId);
    const totalAvailableInSlot = parentSlot?.slotsAvailable?.filter(a => a.status === 'active').length || 0;

    const currentlyAdded = (additionalGuests.get(uniqueId)?.length || 0) + 1; // +1 for the primary selection
    return currentlyAdded < totalAvailableInSlot;
  };

  const handleAddGuest = (uniqueId: string) => {
    if (!canAddMoreGuestsToSlot(uniqueId)) {
      toast.error(t("SpaClient.toast.noMoreSpots"));
      return;
    }
    setAdditionalGuests(prev => {
      const next = new Map(prev);
      const guests = next.get(uniqueId) || [];
      next.set(uniqueId, [...guests, { id: crypto.randomUUID(), name: "", email: "" }]);
      return next;
    });
  };

  const handleRemoveGuest = (uniqueId: string, guestId: string) => {
    setAdditionalGuests(prev => {
      const next = new Map(prev);
      const guests = next.get(uniqueId) || [];
      next.set(uniqueId, guests.filter(g => g.id !== guestId));
      return next;
    });
  };

  const updateGuest = (uniqueId: string, guestId: string, field: 'name' | 'email', value: string) => {
    setAdditionalGuests(prev => {
      const next = new Map(prev);
      const guests = next.get(uniqueId) || [];
      next.set(uniqueId, guests.map(g => g.id === guestId ? {
        ...g,
        [field]: value,
        nameError: field === 'name' && !value.trim() ? t("SpaClient.validation.nameRequired") : ""
      } : g));
      return next;
    });
  };

  const validateField = (field: "name" | "email" | "phone", value: string) => {
    let error: string | undefined;
    const trimmed = value.trim();

    if (field === "name") {
      if (!trimmed) error = t("SpaClient.validation.nameRequired");
    }
    if (field === "email") {
      if (!trimmed) error = t("SpaClient.validation.emailRequired");
      else if (!isValidEmail(trimmed)) error = t("SpaClient.validation.emailInvalid");
    }
    if (field === "phone") {
      if (!trimmed) error = t("SpaClient.validation.phoneRequired");
      else if (!isValidPhone(trimmed)) error = t("SpaClient.validation.phoneInvalid");
    }

    setFormErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  };

  const validateBookingForm = () => {
    const nameValid = validateField("name", customerName);
    const emailValid = validateField("email", customerEmail);
    const phoneValid = validateField("phone", customerPhone);

    let allGuestsValid = true;
    additionalGuests.forEach((guests, uniqueId) => {
      guests.forEach(g => {
        if (!g.name.trim()) {
          updateGuest(uniqueId, g.id, 'name', ''); // Trigger error state
          allGuestsValid = false;
        }
      });
    });

    return nameValid && emailValid && phoneValid && allGuestsValid;
  };

  const buildRequestPayload = () => {
    const slots: ICreateSpaReservationSlot[] = [];
    const extraGuests: IGuestSlot[] = [];

    selectedSlots.forEach((s, uniqueId) => {
      // Primary guest for this slot
      slots.push({
        spaId: s.spaId,
        slotsAvailableId: s.slotsAvailableId,
        amount: s.amount,
        userName: customerName,
        userEmail: customerEmail,
      });

      // Additional guests for this same physical slot
      const guests = additionalGuests.get(uniqueId) || [];
      if (guests.length > 0 && spa) {
        const parentDate = spa.SpaDates?.find(d => d.id === s.spaDateId);
        const parentSlot = (parentDate?.Slots || parentDate?.slots)?.find(sl => sl.id === s.slotId);
        const otherAvailables = parentSlot?.slotsAvailable?.filter(a =>
          a.status === 'active' && a.id !== s.slotsAvailableId
        ) || [];

        guests.forEach((g, idx) => {
          if (idx < otherAvailables.length) {
            extraGuests.push({
              guestName: g.name,
              guestEmail: g.email || customerEmail,
              spaId: s.spaId,
              slotsAvailableId: otherAvailables[idx].id,
              amount: s.amount,
            });
          }
        });
      }
    });

    return { slots, extraGuests };
  };

  const handleConfirmBooking = async () => {
    if (selectedSlots.size === 0) { toast.error(t("SpaClient.toast.selectAtLeastOne")); return; }
    if (!validateBookingForm()) {
      toast.error(t("SpaClient.toast.fixFields"));
      return;
    }

    if (!customer?.isAuthenticated) {
      const redirectUrl = `/spa/spaid/?id=${encodeURIComponent(spaId)}&propertyCode=${encodeURIComponent(propertyCode)}`;
      sessionStorage.setItem("customerRedirectUrl", redirectUrl);
      toast.error(t("SpaClient.toast.loginRequired"));
      window.location.href = "/login";
      return;
    }

    setSubmitting(true);
    try {
      const { slots, extraGuests } = buildRequestPayload();

      const response = await createSpaReservationApi({
        userEmail: customerEmail.trim(),
        userContactNumber: customerPhone.trim(),
        userName: customerName,
        slots,
        additionalGuests: extraGuests,
        currencyCode: (spa?.currencyCode as CurrencyCode) || "AED",
        bookingCode: searchParams.get("bookingCode") || "",
      });

      if (response.success) {
        toast.success(t("SpaClient.toast.bookSuccess", { count: totalGuestsCount }));
        setShowBookingModal(false);
        setSelectedSlots(new Map());
        setAdditionalGuests(new Map());
        await loadSpas(propertyCode.trim());
      } else {
        toast.error(response.message || t("SpaClient.toast.bookFailed"));
      }
    } catch {
      toast.error(t("SpaClient.toast.bookFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (v: string) => {
    try {
      return new Intl.DateTimeFormat(getLocale(), {
        timeZone: "UTC", weekday: "short", month: "short", day: "numeric", year: "numeric"
      }).format(new Date(v));
    } catch { return v; }
  };

  const formatTime = (v: string) => {
    try {
      return new Intl.DateTimeFormat(getLocale(), {
        timeZone: "UTC", hour: "2-digit", minute: "2-digit", hour12: true
      }).format(new Date(v));
    } catch { return v; }
  };

  const availableSlotsTotal = useMemo(
    () => spa?.SpaDates?.reduce((s, d) => s + (isUpcomingDate(d.date) ? ((d.Slots || d.slots)?.reduce((slotSum, sl) => {
      const activeCount = sl.slotsAvailable?.filter(a => a.status === 'active').length || 0;
      return slotSum + activeCount;
    }, 0) || 0) : 0), 0) || 0,
    [spa],
  );

  const coverImage = spa?.images?.[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-stone-100 to-amber-50/30">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href={`/spa?propertyCode=${encodeURIComponent(propertyCode)}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-sm transition hover:bg-stone-50"
          >
            <ChevronLeft className="h-4 w-4" /> {t("SpaClient.nav.backToServices")}
          </Link>
        </div>

        {!hasPropertyCode ? (
          <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-12 text-center text-stone-500">
            Add <code className="rounded bg-stone-100 px-2 py-0.5 font-mono text-sm">?code=PROPERTY_CODE</code> to the URL.
          </div>
        ) : loading ? (
          <div className="rounded-3xl border border-stone-200 bg-white p-16 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-amber-600 mb-3" />
            <p className="text-sm text-stone-500">{t("SpaClient.states.loading")}</p>
          </div>
        ) : !spa ? (
          <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-16 text-center text-stone-500">
            {t("SpaClient.states.spaNotFound")}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Hero Section */}
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
                          {spa.Category._translations?.name || spa.Category.name}
                        </span>
                      )}
                      {spa.location && (
                        <span className="inline-flex items-center gap-1 text-xs text-stone-500">
                          <MapPin className="h-3 w-3" />{spa.location}
                        </span>
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-stone-900">{spa._translations ? spa._translations.name : spa.name}</h2>
                      <p className="mt-1.5 max-w-2xl text-sm leading-6 text-stone-500">
                        {spa._translations ? spa._translations.description : (spa.description || t("SpaClient.hero.noDescription"))}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 rounded-2xl bg-gradient-to-br from-amber-50 to-stone-50 border border-amber-100 p-4 text-sm min-w-[160px]">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">
                      <Sparkles className="h-3 w-3" /> {t("SpaClient.hero.detailsLabel")}
                    </div>
                    <p className="text-xl font-bold text-stone-900">
                      {spa.isInclusive
                        ? t("SpaClient.hero.inclusive")
                        : spa.discountValue
                          ? `${(currencies.find((c: Currency) => c.code === (spa.currencyCode || "AED"))?.symbol || spa.currencyCode || "AED")} ${formatNumber(spa.discountValue)}`
                          : "—"}
                    </p>
                    <div className="mt-2 space-y-1 text-xs text-stone-500">
                      <p className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />{spa.serviceTime ? formatNumber(spa.serviceTime) : t("SpaClient.hero.timeTbd")} {t("SpaClient.hero.minSession")}
                      </p>
                      <p className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />{formatNumber(availableSlotsTotal)} {t("SpaClient.hero.openSlots")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Slots Grid */}
              <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-stone-900">{t("SpaClient.slots.sectionTitle")}</h3>
                  {selectedSlots.size > 0 && (
                    <button
                      onClick={() => { setSelectedSlots(new Map()); setAdditionalGuests(new Map()); }}
                      className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      <X className="h-4 w-4" />
                      {t("SpaClient.slots.clearSelection", { count: formatNumber(selectedSlots.size) })}
                    </button>
                  )}
                </div>
                {!spa.SpaDates?.length ? (
                  <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 p-8 text-center text-sm text-stone-500">
                    {t("SpaClient.slots.noDates")}
                  </div>
                ) : (
                  <div className="space-y-5">
                    {spa.SpaDates?.filter((spaDate: ISpaDate) => isUpcomingDate(spaDate.date)).map((spaDate: ISpaDate) => {
                      const slots = spaDate.Slots || spaDate.slots || [];
                      const openCount = slots.reduce((sum, s) => sum + (s.slotsAvailable?.filter(a => a.status === 'active').length || 0), 0) || 0;
                      const selectedCount = slots.filter(s => selectedSlots.has(getSlotUniqueId(s.id, spaDate.id))).length || 0;

                      return (
                        <div key={spaDate.id} className="rounded-2xl border border-stone-200 overflow-hidden">
                          <div className="flex items-center justify-between bg-stone-50 px-4 py-3 border-b border-stone-200">
                            <div>
                              <p className="text-sm font-semibold text-stone-900">{formatDate(spaDate.date)}</p>
                              <p className="text-xs text-stone-500 mt-0.5">
                                {t("SpaClient.slots.openDot", {
                                  open: formatNumber(openCount),
                                  total: formatNumber(slots.reduce((sum, s) => sum + (s.slotsAvailable?.length || 0), 0) || 0)
                                })}
                              </p>
                            </div>
                            {selectedCount > 0 && (
                              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                                {t("SpaClient.slots.selectedBadge", { count: selectedCount })}
                              </span>
                            )}
                          </div>
                          <div className="grid gap-3 p-4 sm:grid-cols-2">
                            {slots.map((slot: ISpaSlot) => {
                              const uniqueId = getSlotUniqueId(slot.id, spaDate.id);
                              const isSelected = selectedSlots.has(uniqueId);
                              const activeCount = slot.slotsAvailable?.filter(a => a.status === 'active').length || 0;

                              if (activeCount === 0) return null;

                              return (
                                <div
                                  key={slot.id}
                                  className={`rounded-2xl border p-4 transition-all ${isSelected
                                    ? "border-amber-400 bg-amber-50 shadow-sm"
                                    : "border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm cursor-pointer"
                                    }`}
                                  onClick={() => handleToggleSlot(spa, spaDate, slot)}
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="space-y-1">
                                      <p className="text-sm font-semibold text-stone-900">
                                        {formatTime(slot.startTime)}
                                      </p>
                                      {slot.endTime && (
                                        <p className="text-xs text-stone-400">
                                          {t("SpaClient.slots.toTime", { time: formatTime(slot.endTime) })}
                                        </p>
                                      )}

                                      <div className="pt-1">
                                        {activeCount > 1 ? (
                                          <span className="inline-flex items-center rounded-lg bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600 border border-amber-100">
                                            {t("SpaClient.slots.spotsLeft", { count: activeCount })}
                                          </span>
                                        ) : activeCount === 1 ? (
                                          <span className="inline-flex items-center rounded-lg bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-600 border border-orange-100">
                                            {t("SpaClient.slots.lastSpot")}
                                          </span>
                                        ) : null}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      {isSelected && <CheckCircle className="h-4 w-4 text-amber-600" />}
                                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${isSelected
                                        ? "bg-amber-100 text-amber-800"
                                        : "bg-emerald-100 text-emerald-700"
                                        }`}>
                                        {isSelected ? t("SpaClient.slots.slotSelected") : t("SpaClient.slots.slotOpen")}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Checkout Trigger */}
              {selectedSlots.size > 0 && (
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      if (!customer?.isAuthenticated) {
                        const redirectUrl = `/spa/spaid/?id=${encodeURIComponent(spaId)}&propertyCode=${encodeURIComponent(propertyCode)}`;
                        sessionStorage.setItem("customerRedirectUrl", redirectUrl);
                        window.location.href = "/login";
                        return;
                      }
                      setShowBookingModal(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-2xl bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-700 hover:shadow-lg"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {t("SpaClient.bookingButton", { count: formatNumber(totalGuestsCount) })}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Booking Modal */}
        {showBookingModal && customer?.isAuthenticated && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowBookingModal(false)} />
            <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-stone-900">{t("SpaClient.modal.title")}</h2>
                  <p className="text-xs text-stone-500 mt-1">{t("SpaClient.modal.subtitle")}</p>
                </div>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="rounded-xl p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Primary User Details */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">
                    {t("SpaClient.modal.yourDetails")}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <input
                        type="text"
                        value={customerName}
                        onChange={e => { setCustomerName(e.target.value); validateField("name", e.target.value); }}
                        placeholder={t("SpaClient.modal.placeholders.fullName")}
                        className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 ${formErrors.name ? "border-red-300 bg-red-50 focus:ring-red-100" : "border-stone-200 focus:border-amber-400 focus:ring-amber-100"} text-stone-900`}
                      />
                      {formErrors.name && <p className="mt-1 text-[10px] text-red-600">{formErrors.name}</p>}
                    </div>
                    <div>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={e => { setCustomerEmail(e.target.value); validateField("email", e.target.value); }}
                        placeholder={t("SpaClient.modal.placeholders.email")}
                        className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 ${formErrors.email ? "border-red-300 bg-red-50 focus:ring-red-100" : "border-stone-200 focus:border-amber-400 focus:ring-amber-100"} text-stone-900`}
                      />
                      {formErrors.email && <p className="mt-1 text-[10px] text-red-600">{formErrors.email}</p>}
                    </div>
                  </div>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={e => { setCustomerPhone(e.target.value); validateField("phone", e.target.value); }}
                    placeholder={t("SpaClient.modal.placeholders.phone")}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 ${formErrors.phone ? "border-red-300 bg-red-50 focus:ring-red-100" : "border-stone-200 focus:border-amber-400 focus:ring-amber-100"} text-stone-900`}
                  />
                  {formErrors.phone && <p className="mt-1 text-[10px] text-red-600">{formErrors.phone}</p>}
                </div>

                {/* Selected Slots & Additional Guests */}
                <div className="space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">
                    {t("SpaClient.modal.selectedSlotsLabel")}
                  </p>

                  {Array.from(selectedSlots.values()).map(s => {
                    const guests = additionalGuests.get(s.id) || [];
                    const canAddMore = canAddMoreGuestsToSlot(s.id);

                    return (
                      <div key={s.id} className="rounded-2xl border border-stone-100 bg-stone-50 p-4 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-0.5">
                            <p className="text-sm font-bold text-stone-800">{s.dateLabel}</p>
                            <p className="text-xs text-stone-500">{formatTime(s.startTime)} – {formatTime(s.endTime)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-emerald-700">
                              {s.amount === 0 ? t("SpaClient.modal.inclusive") : `${(currencies.find((c: Currency) => c.code === (spa?.currencyCode || "AED"))?.symbol || spa?.currencyCode || "AED")} ${formatNumber(s.amount)}`}
                            </p>
                            <p className="text-[10px] text-stone-400 uppercase font-semibold tracking-wider">Per Person</p>
                          </div>
                        </div>

                        {/* Additional Guests List for THIS slot */}
                        <div className="space-y-3 pt-3 border-t border-stone-200">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-bold uppercase text-stone-400 tracking-wider">
                              {t("SpaClient.modal.additionalGuests")} ({guests.length})
                            </p>
                            <button
                              type="button"
                              onClick={() => handleAddGuest(s.id)}
                              disabled={!canAddMore}
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 hover:text-amber-700 disabled:opacity-30 uppercase tracking-wider"
                            >
                              <Plus className="h-3 w-3" /> {t("SpaClient.modal.addGuest")}
                            </button>
                          </div>

                          {guests.length > 0 && (
                            <div className="space-y-3">
                              {guests.map((g, idx) => (
                                <div key={g.id} className="flex gap-2 group">
                                  <div className="flex-1 space-y-2">
                                    <div className="relative">
                                      <input
                                        type="text"
                                        value={g.name}
                                        onChange={e => updateGuest(s.id, g.id, 'name', e.target.value)}
                                        placeholder={t("SpaClient.modal.placeholders.guestName")}
                                        className={`w-full rounded-lg border bg-white px-3 py-1.5 text-xs outline-none transition ${g.nameError ? "border-red-300 focus:ring-1 focus:ring-red-100" : "border-stone-200 focus:border-amber-400"}`}
                                      />
                                      {g.nameError && <p className="absolute -bottom-3 left-1 text-[9px] text-red-500">{g.nameError}</p>}
                                    </div>
                                    <input
                                      type="email"
                                      value={g.email}
                                      onChange={e => updateGuest(s.id, g.id, 'email', e.target.value)}
                                      placeholder={t("SpaClient.modal.placeholders.guestEmailOptional")}
                                      className="w-full rounded-lg border bg-white px-3 py-1.5 text-xs border-stone-200 outline-none transition focus:border-amber-400"
                                    />
                                  </div>
                                  <button
                                    onClick={() => handleRemoveGuest(s.id, g.id)}
                                    className="h-8 w-8 flex items-center justify-center rounded-lg text-stone-300 hover:text-red-500 hover:bg-red-50 transition"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Summary & Total */}
                <div className="rounded-2xl bg-stone-900 p-5 text-white shadow-xl">
                  <div className="flex justify-between items-center mb-2 text-xs text-stone-400">
                    <span>{t("SpaClient.modal.price.totalGuests", { count: totalGuestsCount })}</span>
                    <span>{t("SpaClient.modal.price.totalSlots", { count: selectedSlots.size })}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-medium">{t("SpaClient.modal.price.totalAmount")}</span>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-amber-400">
                        {totalAmount === 0 ? t("SpaClient.modal.inclusive") : `${(currencies.find((c: Currency) => c.code === (spa?.currencyCode || "AED"))?.symbol || spa?.currencyCode || "AED")} ${formatNumber(totalAmount)}`}
                      </p>
                      {spa?.currencyCode && <p className="text-[10px] text-stone-400 uppercase tracking-widest">{spa.currencyCode}</p>}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowBookingModal(false)}
                    className="flex-1 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-600 transition hover:bg-stone-50"
                  >
                    {t("SpaClient.modal.cancel")}
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmBooking}
                    disabled={submitting}
                    className="flex-[2] rounded-2xl bg-amber-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-amber-700 disabled:opacity-50 shadow-lg shadow-amber-600/20"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />{t("SpaClient.modal.booking")}
                      </span>
                    ) : (
                      t("SpaClient.modal.confirmAndBook")
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

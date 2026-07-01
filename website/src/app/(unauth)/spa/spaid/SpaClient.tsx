"use client";

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import {
  MapPin, CheckCircle, Trash2, ShoppingCart, Clock, CalendarDays,
  Loader2, X, AlertCircle, ChevronLeft, Sparkles, Plus,
} from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { getSpaByPropertyCodeApi, createSpaReservationApi, cancelSpaReservationApi } from "../api/spa.api";
import { ISpa, ISpaDate, ISpaSlot, IGuestSlot } from "../interface";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/store";
import { formatInTimeZone } from "date-fns-tz";
import { CurrencyCode } from "@/src/components/currencyCode/currency-code.type";
import { formatNumber, getLocale } from "../../../../utils/numLang";
import { currencies } from "@/src/components/currencyCode/cuurency";
import { Currency } from "@/src/components/currencyCode/currency-code.type";

interface SelectedSlot {
  id: string;
  spaId: string;
  slotId: string;
  slotsAvailableId: string; // NEW — the specific SlotsAvailable record to book
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
  id: string; // local UUID for React key
  name: string;
  email: string; // optional — empty string if not provided
  nameError?: string;
  slotsAvailableId?: string; // auto-assigned from next available SlotsAvailable for same slot
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
  const [additionalGuests, setAdditionalGuests] = useState<GuestEntry[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [guestDetails, setGuestDetails] = useState<Record<string, { name: string; email: string }>>({});
  const [formErrors, setFormErrors] = useState<{ name?: string; email?: string; phone?: string; guests?: Record<string, { name?: string; email?: string }> }>({});
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
    const firstActiveAvailability = slot.slotsAvailable?.find(a => a.status === 'active');
    if (!firstActiveAvailability) {
      toast.error(t("SpaClient.toast.slotAlreadyBooked"));
      return;
    }
    const uniqueId = getSlotUniqueId(slot.id, spaDate.id);
    const amount = spa.isInclusive ? 0 : spa.discountValue || 0;
    setSelectedSlots(prev => {
      const next = new Map(prev);
      if (next.has(uniqueId)) {
        next.delete(uniqueId);
        setGuestDetails(prevGuests => {
          const updated = { ...prevGuests };
          delete updated[uniqueId];
          return updated;
        });
      } else {
        next.set(uniqueId, {
          id: uniqueId,
          spaId: spa.id || spaId as string,
          slotId: slot.id,
          slotsAvailableId: firstActiveAvailability.id,
          spaDateId: spaDate.id,
          date: spaDate.date,
          spaName: spa.name,
          dateLabel: new Intl.DateTimeFormat(getLocale(), { timeZone: "UTC", weekday: "long", month: "short", day: "2-digit", year: "numeric" }).format(new Date(spaDate.date)),
          startTime: slot.startTime, endTime: slot.endTime || slot.startTime, amount,
          isInclusive: spa.isInclusive,
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

  const handleAddGuest = () => {
    setAdditionalGuests(prev => [
      ...prev,
      { id: crypto.randomUUID(), name: "", email: "" }
    ]);
  };

  const handleRemoveGuest = (id: string) => {
    setAdditionalGuests(prev => prev.filter(g => g.id !== id));
  };

  const updateGuest = (id: string, field: keyof GuestEntry, value: string) => {
    setAdditionalGuests(prev =>
      prev.map(g => (g.id === id ? { ...g, [field]: value, nameError: field === 'name' && !value ? t("SpaClient.validation.nameRequired") : g.nameError } : g))
    );
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

  const validateGuestField = (uniqueId: string, field: "name" | "email", value: string, isInclusive: boolean) => {
    let error: string | undefined;
    const trimmed = value.trim();

    if (field === "name") {
      if (!trimmed) error = t("SpaClient.validation.nameRequired");
    }
    if (field === "email") {
      if (!isInclusive && !trimmed) error = t("SpaClient.validation.emailRequired");
      else if (trimmed && !isValidEmail(trimmed)) error = t("SpaClient.validation.emailInvalid");
    }

    setFormErrors(prev => {
      const guests = { ...prev.guests };
      guests[uniqueId] = { ...guests[uniqueId], [field]: error };
      return { ...prev, guests };
    });
    return !error;
  };

  const validateBookingForm = () => {
    const nameValid = validateField("name", customerName);
    const emailValid = validateField("email", customerEmail);
    const phoneValid = validateField("phone", customerPhone);

    let guestsValid = true;
    selectedSlots.forEach((slot, uniqueId) => {
      const details = guestDetails[uniqueId] || { name: "", email: "" };
      const gNameValid = validateGuestField(uniqueId, "name", details.name, !!slot.isInclusive);
      const gEmailValid = validateGuestField(uniqueId, "email", details.email, !!slot.isInclusive);
      if (!gNameValid || !gEmailValid) guestsValid = false;
    });

    let additionalGuestsValid = true;
    additionalGuests.forEach(g => {
      const nameValid = !!g.name.trim();
      if (!nameValid) {
        updateGuest(g.id, 'name', '');
        additionalGuestsValid = false;
      }
    });

    return nameValid && emailValid && phoneValid && guestsValid && additionalGuestsValid;
  };

  const buildGuestSlots = (): IGuestSlot[] => {
    if (!spa) return [];
    const guestSlots: IGuestSlot[] = [];
    let guestIdx = 0;

    // We need to find available slots for additional guests.
    // We'll iterate through all dates and slots of the CURRENT SPA.
    spa.SpaDates?.forEach(spaDate => {
      spaDate.Slots?.forEach(slot => {
        const selectedUniqueId = getSlotUniqueId(slot.id, spaDate.id);
        const isCurrentlySelected = selectedSlots.has(selectedUniqueId);

        // Active slots that ARE NOT the one picked as the primary for a selected slot
        const availableAvailabilities = slot.slotsAvailable?.filter(a => {
          if (a.status !== 'active') return false;
          // If this slot is selected, one of its 'active' availabilities is already taken by the primary selection
          if (isCurrentlySelected && a.id === selectedSlots.get(selectedUniqueId)?.slotsAvailableId) return false;
          return true;
        }) || [];

        availableAvailabilities.forEach(avail => {
          if (guestIdx < additionalGuests.length) {
            const g = additionalGuests[guestIdx];
            guestSlots.push({
              guestName: g.name,
              guestEmail: g.email || null,
              spaId: spa.id,
              slotsAvailableId: avail.id,
              amount: spa.isInclusive ? 0 : (spa.discountValue || 0),
            });
            guestIdx++;
          }
        });
      });
    });

    return guestSlots;
  };

  const handleConfirmBooking = async () => {
    if (selectedSlots.size === 0) { toast.error(t("SpaClient.toast.selectAtLeastOne")); return; }
    if (!validateBookingForm()) {
      toast.error(t("SpaClient.toast.fixFields"));
      return;
    }

    if (!(customer as any)?.isAuthenticated) {
      const redirectUrl = `/spa/spaid/?id=${encodeURIComponent(spaId)}&propertyCode=${encodeURIComponent(propertyCode)}`;
      sessionStorage.setItem("customerRedirectUrl", redirectUrl);
      toast.error(t("SpaClient.toast.loginRequired"));
      window.location.href = "/login";
      return;
    }
    setSubmitting(true);
    try {
      const slotsData = Array.from(selectedSlots.values()).map(s => ({
        spaId: s.spaId,
        slotsAvailableId: s.slotsAvailableId,
        amount: s.amount,
        userName: guestDetails[s.id]?.name,
        userEmail: guestDetails[s.id]?.email,
      }));
      const guestSlots = buildGuestSlots();

      const response = await createSpaReservationApi({
        userEmail: customerEmail.trim(),
        userContactNumber: customerPhone.trim(),
        slots: slotsData,
        additionalGuests: guestSlots,
        userName: customerName,
        currencyCode: spa?.currencyCode as CurrencyCode || "AED",
        bookingCode: searchParams.get("bookingCode") || "",
      });
      if (response.success) {
        toast.success(t("SpaClient.toast.bookSuccess", { count: selectedSlots.size + additionalGuests.length }));
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
                return hit
                  ? { ...sl, isBooked: true, reservationId: bookingId, SlotBooking: { spaBookingId: bookingId }, Reservation: { bookingCode: sl.Reservation?.bookingCode || "", id: bookingId } as any }
                  : sl;
              }),
            })),
          }))
        );
        setShowBookingModal(false);
        setSelectedSlots(new Map());
        setAdditionalGuests([]);
        setCustomerName(""); setCustomerEmail(""); setCustomerPhone("");
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

  const openCancelModal = (slot: ISpaSlot, spaDateId: string) => {
    const bookingId =
      bookingMapRef.current[slot.id] ||
      slot.SlotBooking?.spaBookingId ||
      slot.reservationId ||
      (slot.Reservation as any)?.id;

    if (!bookingId) {
      toast.error(t("SpaClient.toast.cancelMissingId"));
      return;
    }
    setConfirmModal({
      bookingId,
      slotId: slot.id,
      label: formatTime(slot.startTime),
    });
  };

  const formatDate = (v: string) => {
    try {
      return new Intl.DateTimeFormat(getLocale(), {
        timeZone: "UTC",
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric"
      }).format(new Date(v));
    } catch { return v; }
  };

  const formatTime = (v: string) => {
    try {
      return new Intl.DateTimeFormat(getLocale(), {
        timeZone: "UTC",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      }).format(new Date(v));
    } catch { return v; }
  };

  const spa = useMemo(() => spas.find(item => item.id === spaId), [spas, spaId]);
  const availableSlots = useMemo(
    () => spa?.SpaDates?.reduce((s, d) => s + (isUpcomingDate(d.date) ? (d.Slots?.reduce((slotSum, sl) => {
      const activeCount = sl.slotsAvailable?.filter(a => a.status === 'active').length || 0;
      return slotSum + activeCount;
    }, 0) || 0) : 0), 0) || 0,
    [spa],
  );

  const canAddMoreGuests = useMemo(() => {
    return availableSlots > (selectedSlots.size + additionalGuests.length);
  }, [availableSlots, selectedSlots.size, additionalGuests.length]);
  const coverImage = spa?.images?.[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-stone-100 to-amber-50/30">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Back nav */}
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
            {/* Spa Hero */}
            <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
              {coverImage && (
                <div className="relative h-52 w-full overflow-hidden">
                  <Image src={coverImage} alt={spa.name} fill className="object-cover" />
                </div>
              )}
              <div className="p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {spa.Category?.name && (
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                          {spa._translations?spa._translations.name:spa.Category.name}
                        </span>
                      )}
                      {spa.location && (
                        <span className="inline-flex items-center gap-1 text-xs text-stone-500">
                          <MapPin className="h-3 w-3" />{spa.location}
                        </span>
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-stone-900">{spa._translations?spa._translations.name:spa.name}</h2>
                      <p className="mt-1.5 max-w-2xl text-sm leading-6 text-stone-500">
                        {spa._translations?spa._translations.description:spa.description || t("SpaClient.hero.noDescription")}
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
                        <CalendarDays className="h-3 w-3" />{formatNumber(availableSlots)} {t("SpaClient.hero.openSlots")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Dates & Slots */}
              <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-stone-900">{t("SpaClient.slots.sectionTitle")}</h3>
                  {selectedSlots.size > 0 && (
                    <button
                      onClick={() => setSelectedSlots(new Map())}
                      className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      <X className="h-4 w-4" />
                      {t("SpaClient.slots.clearSelection",{count: formatNumber(selectedSlots.size)})}
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
                      const openCount = spaDate.Slots?.reduce((sum, s) => sum + (s.slotsAvailable?.filter(a => a.status === 'active').length || 0), 0) || 0;
                      const selectedCount = spaDate.Slots?.filter(s => selectedSlots.has(getSlotUniqueId(s.id, spaDate.id))).length || 0;

                      return (
                        <div key={spaDate.id} className="rounded-2xl border border-stone-200 overflow-hidden">
                          <div className="flex items-center justify-between bg-stone-50 px-4 py-3 border-b border-stone-200">
                            <div>
                              <p className="text-sm font-semibold text-stone-900">{formatDate(spaDate.date)}</p>
                              <p className="text-xs text-stone-500 mt-0.5">
                                {t("SpaClient.slots.openDot", { open: formatNumber(openCount), total: formatNumber(spaDate.Slots?.reduce((sum, s) => sum + (s.slotsAvailable?.length || 0), 0) || 0) })}
                              </p>
                            </div>
                            {selectedCount > 0 && (
                              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                                {t("SpaClient.slots.selectedBadge", { count: selectedCount })}
                              </span>
                            )}
                          </div>
                          <div className="grid gap-3 p-4 sm:grid-cols-2">
                            {spaDate.Slots?.map((slot: ISpaSlot) => {
                              const isSelected = isSlotSelected(slot.id, spaDate.id);
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

                                      {/* Availability Badge */}
                                      {!isSelected && (
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
                                      )}
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
                    }}
                    className="inline-flex items-center gap-2 rounded-2xl bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-700 hover:shadow-lg"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {t("SpaClient.bookingButton", { count: formatNumber(selectedSlots.size) })}
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
                <h2 className="text-xl font-bold text-stone-900">{t("SpaClient.modal.title")}</h2>
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
                  <p className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-3">
                    {t("SpaClient.modal.selectedSlotsLabel")}
                  </p>
                  <div className="max-h-[400px] overflow-y-auto space-y-4 pr-1">
                    {Array.from(selectedSlots.values()).map(slot => (
                      <div key={slot.id} className="rounded-xl border border-stone-100 bg-stone-50 p-3">
                        <div className="flex items-start justify-between">
                          <div className="text-xs">
                            <p className="font-semibold text-stone-700">{slot.dateLabel}</p>
                            <p className="text-stone-500 mt-0.5">
                              {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                            </p>
                            <p className="font-semibold text-emerald-700 mt-1">
                              {slot.amount === 0 ? t("SpaClient.modal.inclusive") : `${(currencies.find((c: Currency) => c.code === (spa?.currencyCode || "AED"))?.symbol || spa?.currencyCode || "AED")} ${formatNumber(slot.amount)}`}
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

                        {/* Guest details for each slot */}
                        <div className="mt-3 space-y-2 border-t border-stone-200 pt-3">
                          <p className="text-[10px] font-bold uppercase text-stone-400">{t("SpaClient.modal.guestDetails")}</p>
                          <div>
                            <input
                              type="text"
                              value={guestDetails[slot.id]?.name || ""}
                              onChange={e => {
                                setGuestDetails(prev => ({ ...prev, [slot.id]: { ...prev[slot.id], name: e.target.value } }));
                                if (formErrors.guests?.[slot.id]?.name) validateGuestField(slot.id, "name", e.target.value, !!slot.isInclusive);
                              }}
                              onBlur={e => validateGuestField(slot.id, "name", e.target.value, !!slot.isInclusive)}
                              placeholder={t("SpaClient.modal.placeholders.fullName")}
                              className={`w-full rounded-lg border px-3 py-1.5 text-xs outline-none transition focus:ring-2 ${formErrors.guests?.[slot.id]?.name
                                ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100"
                                : "border-stone-200 bg-white focus:border-amber-400 focus:ring-amber-100"
                                } text-stone-900`}
                            />
                            {formErrors.guests?.[slot.id]?.name && (
                              <p className="mt-1 text-[10px] text-red-600">{formErrors.guests[slot.id].name}</p>
                            )}
                          </div>
                          <div>
                            <input
                              type="email"
                              value={guestDetails[slot.id]?.email || ""}
                              onChange={e => {
                                setGuestDetails(prev => ({ ...prev, [slot.id]: { ...prev[slot.id], email: e.target.value } }));
                                if (formErrors.guests?.[slot.id]?.email) validateGuestField(slot.id, "email", e.target.value, !!slot.isInclusive);
                              }}
                              onBlur={e => validateGuestField(slot.id, "email", e.target.value, !!slot.isInclusive)}
                              placeholder={t("SpaClient.modal.placeholders.email") + (slot.isInclusive ? ` (${t("SpaClient.optional")})` : "")}
                              className={`w-full rounded-lg border px-3 py-1.5 text-xs outline-none transition focus:ring-2 ${formErrors.guests?.[slot.id]?.email
                                ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100"
                                : "border-stone-200 bg-white focus:border-amber-400 focus:ring-amber-100"
                                } text-stone-900`}
                            />
                            {formErrors.guests?.[slot.id]?.email && (
                              <p className="mt-1 text-[10px] text-red-600">{formErrors.guests[slot.id].email}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Summary */}
                <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-stone-50 border border-amber-100 p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">{t("SpaClient.modal.price.slots")}</span>
                    <span className="font-semibold text-stone-900">{formatNumber(selectedSlots.size)}</span>
                  </div>
                  <div className="border-t border-amber-100 pt-2 flex justify-between">
                    <span className="text-stone-500">{t("SpaClient.modal.price.total")}</span>
                    <span className="text-lg font-bold text-stone-900">
                      {totalAmount === 0 ? t("SpaClient.modal.inclusive") : `${(currencies.find((c: Currency) => c.code === (spa?.currencyCode || "AED"))?.symbol || spa?.currencyCode || "AED")} ${formatNumber(totalAmount)}`}
                    </span>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="space-y-2.5 pt-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">
                    {t("SpaClient.modal.yourDetails")}
                  </p>
                  <div>
                    <input
                      type="text"
                      value={customerName}
                      onChange={e => {
                        setCustomerName(e.target.value);
                        if (formErrors.name) validateField("name", e.target.value);
                      }}
                      onBlur={e => validateField("name", e.target.value)}
                      placeholder={t("SpaClient.modal.placeholders.fullName")}
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
                      placeholder={t("SpaClient.modal.placeholders.email")}
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
                      placeholder={t("SpaClient.modal.placeholders.phone")}
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

                {/* Additional Guests Section */}
                <div className="space-y-3 pt-2 border-t border-stone-100">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">
                      {t("SpaClient.modal.additionalGuests")}
                    </p>
                    <button
                      type="button"
                      onClick={handleAddGuest}
                      disabled={!canAddMoreGuests}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {t("SpaClient.modal.addGuest")}
                    </button>
                  </div>

                  {additionalGuests.map((guest: GuestEntry, idx: number) => (
                    <div key={guest.id} className="rounded-2xl border border-stone-200 bg-stone-50 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-stone-500">
                          {t("SpaClient.modal.guestLabel", { number: idx + 1 })}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleRemoveGuest(guest.id)}
                          className="rounded-lg p-1 text-stone-400 hover:text-red-500 hover:bg-red-50 transition"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={guest.name}
                        onChange={e => updateGuest(guest.id, 'name', e.target.value)}
                        placeholder={t("SpaClient.modal.placeholders.guestName")}
                        className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 ${
                          guest.nameError
                            ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100"
                            : "border-stone-200 bg-white focus:border-amber-400 focus:ring-amber-100"
                        } text-stone-900`}
                      />
                      {guest.nameError && <p className="text-xs text-red-600">{guest.nameError}</p>}
                      <input
                        type="email"
                        value={guest.email}
                        onChange={e => updateGuest(guest.id, 'email', e.target.value)}
                        placeholder={t("SpaClient.modal.placeholders.guestEmail")}
                        className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 focus:border-amber-400 focus:ring-amber-100 text-stone-900"
                      />
                      <p className="text-[10px] text-stone-400">
                        {t("SpaClient.modal.guestEmailNote")}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowBookingModal(false)}
                    className="flex-1 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
                  >
                    {t("SpaClient.modal.cancel")}
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmBooking}
                    disabled={submitting}
                    className="flex-1 rounded-2xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />{t("SpaClient.modal.booking")}
                      </span>
                    ) : (
                      selectedSlots.size === 1 ? t("SpaClient.modal.bookSlot", { count: selectedSlots.size }) : t("SpaClient.modal.bookSlots", { count: selectedSlots.size })
                    )}
                  </button>
                </div>

                <div className="rounded-2xl border border-stone-100 bg-stone-50 p-4 text-xs text-stone-500 text-center">
                  <p className="font-semibold text-stone-700 mb-1">{t("SpaClient.modal.availableSlotsLabel")}</p>
                  <p className="text-lg font-bold text-stone-900">{formatNumber(availableSlots)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
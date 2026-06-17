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
import { useTranslation } from "react-i18next";
import { getSpaByPropertyCodeApi, createSpaReservationApi, cancelSpaReservationApi } from "../api/spa.api";
import { ISpa, ISpaDate, ISpaSlot } from "../interface";
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
  spaDateId: string;
  date: string;
  spaName: string;
  dateLabel: string;
  startTime: string;
  endTime: string;
  amount: number;
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
        toast.error(response.message || t("SpaClient.toast.loadFailed"));
      }
    } catch {
      toast.error(t("SpaClient.toast.loadFailed"));
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
    if (slot.isBooked) { toast.error(t("SpaClient.toast.slotAlreadyBooked")); return; }
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
          dateLabel: new Intl.DateTimeFormat(getLocale(), { timeZone: "UTC", weekday: "long", month: "short", day: "2-digit", year: "numeric" }).format(new Date(spaDate.date)),
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
    return nameValid && emailValid && phoneValid;
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
        toast.success(t("SpaClient.toast.bookSuccess", { count: selectedSlots.size }));
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
    () => spa?.SpaDates?.reduce((s, d) => s + (isUpcomingDate(d.date) ? (d.Slots?.filter(sl => !sl.isBooked).length || 0) : 0), 0) || 0,
    [spa],
  );
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
                      const openCount = spaDate.Slots?.filter(s => !s.isBooked).length || 0;
                      const selectedCount = spaDate.Slots?.filter(s => selectedSlots.has(getSlotUniqueId(s.id, spaDate.id))).length || 0;

                      return (
                        <div key={spaDate.id} className="rounded-2xl border border-stone-200 overflow-hidden">
                          <div className="flex items-center justify-between bg-stone-50 px-4 py-3 border-b border-stone-200">
                            <div>
                              <p className="text-sm font-semibold text-stone-900">{formatDate(spaDate.date)}</p>
                              <p className="text-xs text-stone-500 mt-0.5">
                                {t("SpaClient.slots.openDot", { open: formatNumber(openCount), total: formatNumber(spaDate.Slots?.length || 0) })}
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
                                          <p className="text-xs text-stone-400">
                                            {t("SpaClient.slots.toTime", { time: formatTime(slot.endTime) })}
                                          </p>
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
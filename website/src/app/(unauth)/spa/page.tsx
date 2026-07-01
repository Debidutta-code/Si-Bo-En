"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { MapPin, Trash2, ShoppingBag, Loader2, X, CalendarDays, Clock, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { getSpaByPropertyCodeApi, cancelSpaReservationApi } from "./api/spa.api";
import { ISpa, ISpaSlot } from "./interface";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { getCustomerSpaBookingsApi } from "../../(auth)/profile/api/spa.api";
import { formatInTimeZone } from "date-fns-tz";
import { formatNumber, getLocale } from "../../../utils/numLang";
import { currencies } from "@/src/components/currencyCode/cuurency";
import { Currency } from "@/src/components/currencyCode/currency-code.type";

type Tab = "all" | "booked";

export default function SpaPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const customer = useSelector((state: RootState) => (state as any).customer);
  const searchParams = useSearchParams();
  const propertyCode = searchParams.get("propertyCode") || searchParams.get("code") || "";
  const [spas, setSpas] = useState<ISpa[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("all");

  const [bookedLoading, setBookedLoading] = useState(false);
  const [bookedSpas, setBookedSpas] = useState<any[]>([]);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [expandedBookings, setExpandedBookings] = useState<Set<string>>(new Set());
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    type: "slot";
    bookingId: string;
    spaSlotId?: string;
    label: string;
  } | null>(null);

  const hasPropertyCode = Boolean(propertyCode.trim());

  useEffect(() => {
    if (!hasPropertyCode) return;
    if (activeTab !== "all") return;
    void loadSpas(propertyCode.trim());
  }, [propertyCode, hasPropertyCode, activeTab]);

  const loadSpas = async (code: string) => {
    setLoading(true);
    try {
      const response = await getSpaByPropertyCodeApi(code);
      if (response.success) {
        setSpas(response.data || []);
      } else {
        setSpas([]);
        toast.error(response.message || t("SpaPage.toast.loadFailed"));
      }
    } catch {
      toast.error(t("SpaPage.toast.loadFailed"));
      setSpas([]);
    } finally {
      setLoading(false);
    }
  };

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

  const getUpcomingSpaSlots = (spa: ISpa) => {
    return (
      spa.SpaDates?.reduce(
        (sum, spaDate) => {
          const slots = spaDate.Slots || spaDate.slots;
          return sum +
          (isUpcomingDate(spaDate.date)
            ? slots?.reduce((slotSum, slot: ISpaSlot) => {
                const activeCount = slot.slotsAvailable?.filter(a => a.status === 'active').length || 0;
                return slotSum + activeCount;
              }, 0) || 0
            : 0);
        },
        0,
      ) || 0
    );
  };

  const upcomingSpas = useMemo(() => {
    return spas.filter((spa) => getUpcomingSpaSlots(spa) > 0);
  }, [spas]);

  const availableSpaCount = useMemo(
    () => upcomingSpas.reduce((count, spa) => count + (getUpcomingSpaSlots(spa) || 0), 0),
    [upcomingSpas],
  );

  const formatDate = (dateValue: string) => {
    try {
      return new Intl.DateTimeFormat(getLocale(), {
        timeZone: "UTC",
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric"
      }).format(new Date(dateValue));
    } catch {
      return dateValue;
    }
  };

  const formatTime = (dateValue: string) => {
    try {
      return new Intl.DateTimeFormat(getLocale(), {
        timeZone: "UTC",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      }).format(new Date(dateValue));
    } catch {
      return dateValue;
    }
  };

  const fetchBookedSpas = async () => {
    if (activeTab !== "booked") return;
    setBookedLoading(true);
    try {
      const response = await getCustomerSpaBookingsApi();
      if (response.success && response.data) {
        const bookings = Array.isArray(response.data) ? response.data : response.data?.data || [];
        setBookedSpas(bookings);
      } else {
        setBookedSpas([]);
      }
    } catch {
      setBookedSpas([]);
    } finally {
      setBookedLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab !== "booked") {
      setBookedSpas([]);
      return;
    }
    if (!(customer as any)?.isAuthenticated) {
      const redirectUrl = `/spa?propertyCode=${encodeURIComponent(propertyCode)}`;
      sessionStorage.setItem("customerRedirectUrl", redirectUrl);
      toast.error(t("SpaPage.toast.loginRequired"));
      router.push("/login");
      return;
    }
    void fetchBookedSpas();
  }, [activeTab]);

  const toggleExpanded = (bookingId: string) => {
    setExpandedBookings((prev) => {
      const next = new Set(prev);
      next.has(bookingId) ? next.delete(bookingId) : next.add(bookingId);
      return next;
    });
  };

  const openCancelModal = (type: "slot", bookingId: string, label: string, spaSlotId?: string) => {
    setConfirmModal({ open: true, type: "slot", bookingId, spaSlotId, label });
  };

  const handleConfirmCancel = async () => {
    if (!confirmModal) return;
    const { bookingId, spaSlotId, label } = confirmModal;
    setConfirmModal(null);
    setCancellingId(spaSlotId || bookingId);
    try {
      const response = await cancelSpaReservationApi(bookingId, spaSlotId);
      if (response?.success) {
        toast.success(t("SpaPage.toast.cancelSuccess"));
        if (spaSlotId) {
          setBookedSpas((prev) => {
            return prev.map((booking: any) => {
              const id = booking?.id || booking?.spaBookingId;
              if (!id || String(id) !== String(bookingId)) return booking;
              const slots: any[] = booking?.SlotBookings || booking?.slotBookings || booking?.Slots || booking?.slots || [];
              const newSlots = slots.map((sb: any) => {
                const spaSlotIdCurrent = sb?.spaSlotId || sb?.id;
                if (!spaSlotIdCurrent) return sb;
                if (String(spaSlotIdCurrent) === String(spaSlotId)) {
                  return { ...sb, status: "cancelled", isCancelled: true };
                }
                return sb;
              });
              if (booking.SlotBookings) return { ...booking, SlotBookings: newSlots };
              if (booking.slotBookings) return { ...booking, slotBookings: newSlots };
              if (booking.Slots) return { ...booking, Slots: newSlots };
              if (booking.slots) return { ...booking, slots: newSlots };
              return { ...booking };
            });
          });
        } else {
          setBookedSpas((prev) =>
            prev.map((b) => {
              const id = b?.id || b?.spaBookingId;
              if (!id || String(id) !== String(bookingId)) return b;
              return { ...b, status: "cancelled" };
            }),
          );
        }
      } else {
        toast.error(response?.message || t("SpaPage.toast.cancelFailed"));
      }
    } catch (error: any) {
      toast.error(error?.message || t("SpaPage.toast.cancelFailed"));
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "confirmed": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "cancelled": return "bg-red-100 text-red-700 border-red-200";
      case "pending": return "bg-amber-100 text-amber-700 border-amber-200";
      default: return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const visibleBookedSpas = useMemo(() => {
    return bookedSpas.filter((booking: any) => {
      const status = booking?.status?.toLowerCase();
      if (status === "cancelled") return false;
      const slots: any[] = booking?.SlotBookings || booking?.slotBookings || booking?.Slots || booking?.slots || [];
      return slots.some((sb: any) => sb?.status?.toLowerCase() !== "cancelled");
    });
  }, [bookedSpas]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-stone-100 to-amber-50/30">
      {/* Confirm Modal */}
      {confirmModal?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmModal(null)} />
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">{t("SpaPage.modal.title")}</h3>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              {t("SpaPage.modal.description", { label: confirmModal.label })}
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                {t("SpaPage.modal.keepIt")}
              </button>
              <button
                onClick={handleConfirmCancel}
                className="flex-1 rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                {t("SpaPage.modal.yesCancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-stone-900">{t("SpaPage.header.title")}</h1>
            <p className="mt-1.5 text-sm text-stone-500">
              {hasPropertyCode
                ? t("SpaPage.header.subtitle", {
                    slotCount: formatNumber(availableSpaCount),
                    slotWord: availableSpaCount === 1 ? t("SpaPage.header.slot") : t("SpaPage.header.slots"),
                    serviceCount: formatNumber(upcomingSpas.length),
                    serviceWord: upcomingSpas.length === 1 ? t("SpaPage.header.service") : t("SpaPage.header.services"),
                  })
                : t("SpaPage.header.noPropertyCode")}
            </p>
          </div>
          <Link
            href={`/Rooms/?code=${encodeURIComponent(propertyCode)}`}
            className="inline-flex items-center rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-sm transition hover:bg-stone-50"
          >
            {t("SpaPage.header.homepage")}
          </Link>
        </div>

        {!hasPropertyCode ? (
          <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-12 text-center text-stone-500">
            Add <code className="rounded bg-stone-100 px-2 py-0.5 text-sm font-mono">?code=PROPERTY_CODE</code>{" "}
            to the URL to load spa services.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Tab Bar */}
            <div className="flex gap-1 rounded-2xl border border-stone-200 bg-white p-1.5 shadow-sm w-fit">
              {(["all", "booked"] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-xl px-5 py-2 text-sm font-semibold transition-all ${
                    activeTab === tab ? "bg-stone-900 text-white shadow" : "text-stone-500 hover:text-stone-800"
                  }`}
                >
                  {tab === "all" ? t("SpaPage.tabs.allServices") : t("SpaPage.tabs.myBookings")}
                  {tab === "booked" && visibleBookedSpas.length > 0 && (
                    <span
                      className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                        activeTab === "booked" ? "bg-white/20" : "bg-stone-100 text-stone-600"
                      }`}
                    >
                      {formatNumber(visibleBookedSpas.length)}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* ALL TAB */}
            {activeTab === "all" && (
              <div>
                {loading ? (
                  <div className="rounded-3xl border border-stone-200 bg-white p-16 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-amber-600 mb-3" />
                    <p className="text-sm text-stone-500">{t("SpaPage.allTab.loading")}</p>
                  </div>
                ) : spas.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-16 text-center text-stone-500">
                    {t("SpaPage.allTab.noServices")}
                  </div>
                ) : upcomingSpas.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-16 text-center text-stone-500">
                    {t("SpaPage.allTab.noUpcoming")}
                  </div>
                ) : (
                  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {upcomingSpas.map((spa:ISpa) => {
                      const availableSlots = getUpcomingSpaSlots(spa);
                      const coverImage = spa.images?.[0];

                      return (
                        <div
                          key={spa.id}
                          className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 hover:border-amber-200"
                        >
                          {/* Image */}
                          <div className="relative h-44 w-full overflow-hidden bg-stone-100">
                            {coverImage ? (
                              <img
                                src={coverImage}
                                alt={spa.name}
                                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-stone-300">
                                <ShoppingBag className="h-10 w-10" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                            {spa.Category?.name && (
                              <span className="absolute left-3 top-3 rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-1 text-xs font-bold text-amber-700 shadow-sm">
                                {spa.Category._translations?spa.Category._translations.name:spa.Category.name}
                              </span>
                            )}
                            <span className="absolute bottom-3 right-3 rounded-full bg-black/60 backdrop-blur-sm px-3 py-1 text-xs font-bold text-white">
                              {spa.isInclusive
                                ? t("SpaPage.allTab.inclusive")
                                : spa.discountValue
                                  ? `${(currencies.find((c: Currency) => c.code === (spa.currencyCode || "AED"))?.symbol || spa.currencyCode || "AED")} ${formatNumber(spa.discountValue)}`
                                  : "—"}
                            </span>
                          </div>

                          {/* Body */}
                          <div className="flex flex-1 flex-col gap-3 p-4">
                            <div>
                              <h3 className="text-base font-bold leading-snug text-stone-900 line-clamp-1">
                                {spa._translations?spa._translations.name:spa.name}
                              </h3>
                              <p className="mt-1 text-xs leading-relaxed text-stone-500 line-clamp-2">
                                {spa._translations?spa._translations.description:spa.description}
                              </p>
                            </div>

                            {/* Stats row */}
                            <div className="flex items-center gap-2 rounded-xl bg-stone-50 border border-stone-100 px-3 py-2 text-xs">
                              {spa.location && (
                                <span className="flex items-center gap-1 text-stone-500 min-w-0">
                                  <MapPin className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                                  <span className="truncate">{spa._translations?spa._translations.location:spa.location}</span>
                                </span>
                              )}
                              <span className="flex items-center gap-1 text-stone-600 font-medium ml-auto shrink-0">
                                <Clock className="h-3.5 w-3.5 text-amber-500" />
                                {spa.serviceTime ? formatNumber(spa.serviceTime) : t("SpaPage.allTab.timeTbd")} min
                              </span>
                              <span className="flex items-center gap-1 text-emerald-700 font-semibold shrink-0">
                                <CalendarDays className="h-3.5 w-3.5" />
                                {formatNumber(availableSlots)}
                              </span>
                            </div>

                            <Link
                              href={`/spa/spaid/?id=${encodeURIComponent(spa.id)}&propertyCode=${encodeURIComponent(propertyCode)}`}
                              className="mt-auto flex w-full items-center justify-center rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700"
                            >
                              {t("SpaPage.allTab.viewAndBook")}
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* BOOKED TAB */}
            {activeTab === "booked" && (
              <div>
                {bookedLoading ? (
                  <div className="rounded-3xl border border-stone-200 bg-white p-16 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-amber-600 mb-3" />
                    <p className="text-sm text-stone-500">{t("SpaPage.bookedTab.loading")}</p>
                  </div>
                ) : visibleBookedSpas.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-16 text-center">
                    <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-stone-300" />
                    <p className="text-stone-500">{t("SpaPage.bookedTab.noBookings")}</p>
                    <button
                      onClick={() => setActiveTab("all")}
                      className="mt-4 rounded-2xl bg-stone-900 px-5 py-2 text-sm font-semibold text-white hover:bg-stone-700 transition"
                    >
                      {t("SpaPage.bookedTab.browseServices")}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {visibleBookedSpas.map((booking: any) => {
                      const bookingId = booking?.id || booking?.spaBookingId;
                      if (!bookingId) return null;

                      const slots: any[] = (
                        booking?.SlotBookings ||
                        booking?.slotBookings ||
                        booking?.Slots ||
                        booking?.slots ||
                        []
                      ).filter((sb: any) => sb?.status?.toLowerCase() !== "cancelled");
                      const firstSpa = slots[0]?.Spa || slots[0]?.spa;
                      const spaName = firstSpa?.name || t("SpaPage.bookedTab.spaServiceFallback");
                      const coverImage = firstSpa?.images?.[0];
                      const status = booking?.status || "unknown";
                      const isExpanded = expandedBookings.has(bookingId);
                      const isCancellingThis = cancellingId === bookingId;
                      const isCancelled = status?.toLowerCase() === "cancelled";

                      return (
                        <div key={bookingId} className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
                          {/* Booking Header */}
                          <div className="flex items-start gap-4 p-5">
                            {coverImage && (
                              <img src={coverImage} alt={spaName} className="h-16 w-16 rounded-2xl object-cover flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h3 className="text-base font-bold text-stone-900 truncate">{spaName}</h3>
                                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${getStatusColor(status)}`}>
                                  {status}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-500">
                                <span>
                                  {slots.length === 1 ? t("SpaPage.bookedTab.slot") : t("SpaPage.bookedTab.slots", { count: slots.length })}
                                </span>
                                <span className="font-semibold text-stone-700">
                                  {(currencies.find((c: Currency) => c.code === (booking?.currencyCode || "AED"))?.symbol || booking?.currencyCode || "AED")} {formatNumber(booking?.totalAmount ?? 0)}
                                </span>
                                <span>{t("SpaPage.bookedTab.bookedOn", { date: new Intl.DateTimeFormat(getLocale(), { month: "short", day: "numeric", year: "numeric" }).format(new Date(booking.createdAt)) })}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                onClick={() => toggleExpanded(bookingId)}
                                className="rounded-xl border border-stone-200 p-1.5 text-stone-500 hover:bg-stone-50 transition"
                              >
                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>

                          {/* Slots */}
                          {isExpanded && slots.length > 0 && (
                            <div className="border-t border-stone-100 px-5 pb-5">
                              <p className="py-3 text-xs font-semibold uppercase tracking-widest text-stone-400">
                                {t("SpaPage.bookedTab.bookedSlots")}
                              </p>
                              <div className="space-y-2">
                                {slots.map((sb: any, idx: number) => {
                                  const spaSlotId = sb?.spaSlotId || sb?.id;
                                  const st = sb?.SpaSlot?.startTime || sb?.startTime;
                                  const et = sb?.SpaSlot?.endTime || sb?.endTime;
                                  const slotDate = sb?.SpaSlot?.spaDate?.date || sb?.spaDate?.date;
                                  const slotAmount = sb?.amount || 0;
                                  const isCancellingSlot = cancellingId === spaSlotId;
                                  const slotStatus = sb?.status?.toLowerCase();
                                  const isSlotCancelled = slotStatus === "cancelled" || isCancelled;

                                  return (
                                    <div
                                      key={sb?.id || idx}
                                      className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${
                                        isSlotCancelled ? "border-red-100 bg-red-50/50" : "border-stone-100 bg-stone-50"
                                      }`}
                                    >
                                      <div>
                                        {slotDate && (
                                          <p className="text-xs font-medium text-stone-500 mb-0.5">{formatDate(slotDate)}</p>
                                        )}
                                        {(st || et) && (
                                          <p className={`text-sm font-semibold ${isSlotCancelled ? "text-stone-400 line-through" : "text-stone-800"}`}>
                                            {st ? formatTime(st) : ""}
                                            {et ? ` – ${formatTime(et)}` : ""}
                                          </p>
                                        )}
                                        {slotAmount > 0 && (
                                          <p className="text-xs text-emerald-700 font-medium mt-0.5">
                                            {(currencies.find((c: Currency) => c.code === (booking?.currencyCode || "AED"))?.symbol || booking?.currencyCode || "AED")} {formatNumber(slotAmount)}
                                          </p>
                                        )}
                                      </div>

                                      {isSlotCancelled ? (
                                        <span className="rounded-xl bg-red-50 border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500">
                                          {t("SpaPage.bookedTab.cancelled")}
                                        </span>
                                      ) : spaSlotId ? (
                                        <button
                                          onClick={() =>
                                            openCancelModal("slot", bookingId, st ? formatTime(st) : "this slot", spaSlotId)
                                          }
                                          disabled={isCancellingSlot}
                                          className="inline-flex items-center gap-1 rounded-xl border border-red-100 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                        >
                                          {isCancellingSlot ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                          ) : (
                                            <X className="h-3 w-3" />
                                          )}
                                          {t("SpaPage.bookedTab.cancelSlot")}
                                        </button>
                                      ) : null}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { MapPin, Trash2, ShoppingBag, Loader2, X, CalendarDays, Clock, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { getSpaByPropertyCodeApi, cancelSpaReservationApi } from "./api/spa.api";
import { ISpa, ISpaDate, ISpaSlot } from "./interface";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { getCustomerSpaBookingsApi } from "../../(auth)/profile/api/spa.api";

type Tab = "all" | "booked";

export default function SpaPage() {
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
    type: "booking" | "slot";
    bookingId: string;
    spaSlotId?: string;
    label: string;
  } | null>(null);

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

  const availableSpaCount = useMemo(
    () =>
      spas.reduce((count, spa) => {
        return (
          count +
          (spa.SpaDates?.reduce(
            (slotCount, spaDate) => slotCount + (spaDate.Slots?.filter((slot: ISpaSlot) => !slot.isBooked).length || 0),
            0,
          ) || 0)
        );
      }, 0),
    [spas],
  );

  const formatDate = (dateValue: string) => {
    try { return format(new Date(dateValue), "EEE, MMM d, yyyy"); } catch { return dateValue; }
  };
  const formatTime = (dateValue: string) => {
    try { return format(new Date(dateValue), "hh:mm a"); } catch { return dateValue; }
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
    if (activeTab !== "booked") return;

    if (!(customer as any)?.isAuthenticated) {
      const redirectUrl = `/spa?propertyCode=${encodeURIComponent(propertyCode)}`;
      sessionStorage.setItem("customerRedirectUrl", redirectUrl);
      toast.error("Please login to view your spa bookings");
      router.push("/login");
      return;
    }

    void fetchBookedSpas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);


  const toggleExpanded = (bookingId: string) => {
    setExpandedBookings(prev => {
      const next = new Set(prev);
      next.has(bookingId) ? next.delete(bookingId) : next.add(bookingId);
      return next;
    });
  };

  // Open confirm modal
  const openCancelModal = (type: "booking" | "slot", bookingId: string, label: string, spaSlotId?: string) => {
    setConfirmModal({ open: true, type, bookingId, spaSlotId, label });
  };

  // Execute cancellation after confirm
  const handleConfirmCancel = async () => {
    if (!confirmModal) return;
    const { type, bookingId, spaSlotId, label } = confirmModal;
    setConfirmModal(null);
    setCancellingId(spaSlotId || bookingId);

    try {
      const response = await cancelSpaReservationApi(bookingId, type === "slot" ? spaSlotId : undefined);
      if (response?.success) {
        toast.success(type === "slot" ? `Slot cancelled successfully` : `Booking cancelled successfully`);
        await fetchBookedSpas();
      } else {
        toast.error(response?.message || "Failed to cancel");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to cancel");
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
            <h3 className="text-lg font-semibold text-slate-900">
              {confirmModal.type === "slot" ? "Cancel this slot?" : "Cancel entire booking?"}
            </h3>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              {confirmModal.type === "slot"
                ? `You're about to cancel the slot: "${confirmModal.label}". The rest of this booking will remain active.`
                : `You're about to cancel the entire booking for "${confirmModal.label}". All slots will be freed. This cannot be undone.`}
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
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
      )}

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-amber-700">
              {propertyCode ? propertyCode.toUpperCase() : "Property"}
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-stone-900">Spa & Wellness</h1>
            <p className="mt-1.5 text-sm text-stone-500">
              {hasPropertyCode
                ? `${availableSpaCount} slot${availableSpaCount === 1 ? "" : "s"} available across ${spas.length} service${spas.length === 1 ? "" : "s"}`
                : "A property code is required to load spa services."}
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-sm transition hover:bg-stone-50"
          >
            ← Homepage
          </Link>
        </div>

        {!hasPropertyCode ? (
          <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-12 text-center text-stone-500">
            Add <code className="rounded bg-stone-100 px-2 py-0.5 text-sm font-mono">?code=PROPERTY_CODE</code> to the URL to load spa services.
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
                    activeTab === tab
                      ? "bg-stone-900 text-white shadow"
                      : "text-stone-500 hover:text-stone-800"
                  }`}
                >
                  {tab === "all" ? "All Services" : "My Bookings"}
                  {tab === "booked" && bookedSpas.length > 0 && (
                    <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                      activeTab === "booked" ? "bg-white/20" : "bg-stone-100 text-stone-600"
                    }`}>
                      {bookedSpas.length}
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
                    <p className="text-sm text-stone-500">Loading spa services…</p>
                  </div>
                ) : spas.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-16 text-center text-stone-500">
                    No spa services configured for this property.
                  </div>
                ) : (
                  <div className="grid gap-5 xl:grid-cols-2">
                    {spas.map((spa) => {
                      const totalSlots = spa.SpaDates?.reduce((s, d) => s + (d.Slots?.length || 0), 0) || 0;
                      const availableSlots = spa.SpaDates?.reduce(
                        (sum, spaDate) => sum + (spaDate.Slots?.filter((slot: ISpaSlot) => !slot.isBooked).length || 0),
                        0,
                      ) || 0;
                      const coverImage = (spa as any).images?.[0];

                      return (
                        <div key={spa.id} className="group overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md hover:border-stone-300">
                          {coverImage && (
                            <div className="h-40 w-full overflow-hidden">
                              <img
                                src={coverImage}
                                alt={spa.name}
                                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                              />
                            </div>
                          )}
                          <div className="p-6">
                            <div className="flex flex-wrap items-center gap-2 mb-3">
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
                            <h3 className="text-xl font-bold text-stone-900">{spa.name}</h3>
                            <p className="mt-1.5 text-sm leading-6 text-stone-500 line-clamp-2">
                              {spa.description || "No description available."}
                            </p>

                            <div className="mt-4 flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm text-stone-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  {spa.serviceTime || "TBD"} min
                                </span>
                                <span className="flex items-center gap-1">
                                  <CalendarDays className="h-3.5 w-3.5" />
                                  {availableSlots} open
                                </span>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-stone-900">
                                  {spa.isInclusive ? "Inclusive" : spa.discountValue ? `${spa.currencyCode || "AED"} ${spa.discountValue}` : "—"}
                                </p>
                              </div>
                            </div>

                            <Link
                              href={`/spa/${encodeURIComponent(spa.id)}?propertyCode=${encodeURIComponent(propertyCode)}`}
                              className="mt-5 flex w-full items-center justify-center rounded-2xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-700"
                            >
                              View & Book
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
                    <p className="text-sm text-stone-500">Loading your bookings…</p>
                  </div>
                ) : bookedSpas.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-16 text-center">
                    <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-stone-300" />
                    <p className="text-stone-500">No bookings yet.</p>
                    <button
                      onClick={() => setActiveTab("all")}
                      className="mt-4 rounded-2xl bg-stone-900 px-5 py-2 text-sm font-semibold text-white hover:bg-stone-700 transition"
                    >
                      Browse services
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookedSpas.map((booking: any) => {
                      const bookingId = booking?.id || booking?.spaBookingId;
                      if (!bookingId) return null;

                      const slots: any[] = booking?.SlotBookings || booking?.slotBookings || booking?.Slots || booking?.slots || [];
                      const firstSpa = slots[0]?.Spa || slots[0]?.spa;
                      const spaName = firstSpa?.name || "Spa Service";
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
                                <span>{slots.length} slot{slots.length !== 1 ? "s" : ""}</span>
                                <span className="font-semibold text-stone-700">
                                  {booking?.currencyCode || "AED"} {booking?.totalAmount ?? 0}
                                </span>
                                <span>Booked {format(new Date(booking.createdAt), "MMM d, yyyy")}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              {!isCancelled && (
                                <button
                                  onClick={() => openCancelModal("booking", bookingId, spaName)}
                                  disabled={isCancellingThis}
                                  className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                                >
                                  {isCancellingThis ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                  Cancel All
                                </button>
                              )}
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
                              <p className="py-3 text-xs font-semibold uppercase tracking-widest text-stone-400">Booked Slots</p>
                              <div className="space-y-2">
                                {slots.map((sb: any, idx: number) => {
                                  const spaSlotId = sb?.spaSlotId || sb?.id;
                                  const st = sb?.SpaSlot?.startTime || sb?.startTime;
                                  const et = sb?.SpaSlot?.endTime || sb?.endTime;
                                  const slotDate = sb?.SpaSlot?.spaDate?.date || sb?.spaDate?.date;
                                  const slotAmount = sb?.amount || 0;
                                  const isCancellingSlot = cancellingId === spaSlotId;

                                  return (
                                    <div
                                      key={sb?.id || idx}
                                      className="flex items-center justify-between rounded-2xl border border-stone-100 bg-stone-50 px-4 py-3"
                                    >
                                      <div>
                                        {slotDate && (
                                          <p className="text-xs font-medium text-stone-500 mb-0.5">{formatDate(slotDate)}</p>
                                        )}
                                        {(st || et) && (
                                          <p className="text-sm font-semibold text-stone-800">
                                            {st ? formatTime(st) : ""}
                                            {et ? ` – ${formatTime(et)}` : ""}
                                          </p>
                                        )}
                                        {slotAmount > 0 && (
                                          <p className="text-xs text-emerald-700 font-medium mt-0.5">
                                            {booking?.currencyCode || "AED"} {slotAmount}
                                          </p>
                                        )}
                                      </div>
                                      {!isCancelled && spaSlotId && slots.length > 1 && (
                                        <button
                                          onClick={() =>
                                            openCancelModal(
                                              "slot",
                                              bookingId,
                                              st ? formatTime(st) : "this slot",
                                              spaSlotId,
                                            )
                                          }
                                          disabled={isCancellingSlot}
                                          className="inline-flex items-center gap-1 rounded-xl border border-red-100 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                        >
                                          {isCancellingSlot ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                          ) : (
                                            <X className="h-3 w-3" />
                                          )}
                                          Cancel Slot
                                        </button>
                                      )}
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
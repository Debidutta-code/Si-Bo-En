"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { MapPin, Trash2, ShoppingBag, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { getSpaByPropertyCodeApi, cancelSpaReservationApi } from "./api/spa.api";
import { ISpa, ISpaDate, ISpaSlot } from "./interface";

import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { getCustomerSpaBookingsApi } from "../../(auth)/profile/api/spa.api";

type Tab = "all" | "booked";

interface SelectedBooking {
  id: string;
  spaName: string;
  slotCount: number;
  bookingCode?: string;
}

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
  const [selectedBookings, setSelectedBookings] = useState<Set<string>>(new Set());
  const [cancellingBookings, setCancellingBookings] = useState<Set<string>>(new Set());
  const [isBulkCancelling, setIsBulkCancelling] = useState(false);

  const hasPropertyCode = Boolean(propertyCode.trim());

  useEffect(() => {
    if (!hasPropertyCode) {
      return;
    }
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
    } catch (error) {
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
    try {
      return format(new Date(dateValue), "EEE, MMM d, yyyy");
    } catch {
      return dateValue;
    }
  };

  const formatTime = (dateValue: string) => {
    try {
      return format(new Date(dateValue), "hh:mm a");
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
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setBookedSpas([]);
    } finally {
      setBookedLoading(false);
    }
  };

  useEffect(() => {
    void fetchBookedSpas();
  }, [activeTab]);

  // Toggle booking selection
  const toggleBookingSelection = (bookingId: string) => {
    setSelectedBookings(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(bookingId)) {
        newSelection.delete(bookingId);
      } else {
        newSelection.add(bookingId);
      }
      return newSelection;
    });
  };

  // Select all bookings
  const toggleSelectAllBookings = () => {
    if (selectedBookings.size === bookedSpas.length) {
      setSelectedBookings(new Set());
    } else {
      const allBookingIds = bookedSpas.map(booking => booking?.spaBookingId || booking?.id).filter(Boolean);
      setSelectedBookings(new Set(allBookingIds));
    }
  };

  // Cancel single booking
  const handleCancelSingleBooking = async (bookingId: string, spaName: string) => {
    if (!confirm(`Are you sure you want to cancel the booking for "${spaName}"? This action cannot be undone.`)) {
      return;
    }

    setCancellingBookings(prev => new Set(prev).add(bookingId));
    
    try {
      const response = await cancelSpaReservationApi(bookingId);
      
      if (response?.success) {
        toast.success(`${spaName} cancelled successfully`);
        // Remove from selected if it was selected
        setSelectedBookings(prev => {
          const newSelection = new Set(prev);
          newSelection.delete(bookingId);
          return newSelection;
        });
        // Refresh the list
        await fetchBookedSpas();
      } else {
        toast.error(response?.message || `Failed to cancel ${spaName}`);
      }
    } catch (error: any) {
      toast.error(error?.message || `Failed to cancel ${spaName}`);
    } finally {
      setCancellingBookings(prev => {
        const newSet = new Set(prev);
        newSet.delete(bookingId);
        return newSet;
      });
    }
  };

  // Cancel multiple selected bookings
  const handleCancelSelectedBookings = async () => {
    const selectedIds = Array.from(selectedBookings);
    const selectedBookingsData = bookedSpas.filter(booking => {
      const bookingId = booking?.spaBookingId || booking?.id;
      return selectedIds.includes(bookingId);
    });

    if (selectedIds.length === 0) {
      toast.error("Please select at least one booking to cancel");
      return;
    }

    const totalSlots = selectedBookingsData.reduce((sum, booking) => {
      const slots = booking?.slotBookings || booking?.SlotBookings || booking?.slots || booking?.Slots || [];
      return sum + slots.length;
    }, 0);

    if (!confirm(`Are you sure you want to cancel ${selectedIds.length} booking(s) (${totalSlots} total slots)? This action cannot be undone.`)) {
      return;
    }

    setIsBulkCancelling(true);
    let successCount = 0;
    let failCount = 0;
    const failedBookings: string[] = [];

    for (const bookingId of selectedIds) {
      const booking = bookedSpas.find(b => (b?.spaBookingId || b?.id) === bookingId);
      const spaName = booking?.spa?.name || booking?.spaName || "Spa";
      
      try {
        const response = await cancelSpaReservationApi(bookingId);
        if (response?.success) {
          successCount++;
        } else {
          failCount++;
          failedBookings.push(spaName);
        }
      } catch (error) {
        failCount++;
        failedBookings.push(spaName);
      }
    }

    // Show summary
    if (successCount > 0) {
      toast.success(`Successfully cancelled ${successCount} booking(s)`);
    }
    if (failCount > 0) {
      toast.error(`Failed to cancel ${failCount} booking(s): ${failedBookings.join(", ")}`);
    }
    
    // Clear selections and refresh
    setSelectedBookings(new Set());
    await fetchBookedSpas();
    setIsBulkCancelling(false);
  };

  // Clear all selections
  const handleClearSelection = () => {
    setSelectedBookings(new Set());
    toast.success("All selections cleared");
  };

  const selectedCount = selectedBookings.size;
  const selectedBookingsData = Array.from(selectedBookings).map(bookingId => 
    bookedSpas.find(booking => (booking?.spaBookingId || booking?.id) === bookingId)
  ).filter(Boolean);
  
  const totalSlotsSelected = selectedBookingsData.reduce((sum, booking) => {
    const slots = booking?.slotBookings || booking?.SlotBookings || booking?.slots || booking?.Slots || [];
    return sum + slots.length;
  }, 0);

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-slate-500">Property Code</p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Spa & Activities</h1>
            <p className="mt-2 text-sm text-slate-600">
              {hasPropertyCode
                ? `Showing spa services for property code ${propertyCode.toUpperCase()}`
                : "A property code is required to load spa services."}
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            Return to homepage
          </Link>
        </div>

        {!hasPropertyCode ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">
            No property code provided. Add <span className="font-semibold">?code=PROPERTY_CODE</span> or <span className="font-semibold">?propertyCode=PROPERTY_CODE</span> to the URL.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Spa services</h2>
                  <p className="mt-2 text-sm text-slate-500">{availableSpaCount} open slot{availableSpaCount === 1 ? "" : "s"} available across {spas.length} spa{spas.length === 1 ? "" : "s"}.</p>
                </div>
                <div className="flex overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("all");
                      setSelectedBookings(new Set());
                    }}
                    className={`inline-flex items-center px-4 py-2 text-sm font-medium transition ${
                      activeTab === "all"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:bg-white hover:text-slate-900"
                    }`}
                  >
                    All Spa
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("booked");
                      setSelectedBookings(new Set());
                    }}
                    className={`inline-flex items-center px-4 py-2 text-sm font-medium transition ${
                      activeTab === "booked"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:bg-white hover:text-slate-900"
                    }`}
                  >
                    Booked Spa
                  </button>
                </div>
              </div>
            </div>

            {activeTab === "all" ? (
              <div>
                {loading ? (
                  <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-400">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    Loading spa services…
                  </div>
                ) : spas.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-500">
                    No spa services configured for this property.
                  </div>
                ) : (
                  <div className="grid gap-6 xl:grid-cols-2">
                    {spas.map((spa) => {
                      const availableSlots = spa.SpaDates?.reduce(
                        (sum, spaDate) => sum + (spaDate.Slots?.filter((slot: ISpaSlot) => !slot.isBooked).length || 0),
                        0,
                      );

                      return (
                        <div key={spa.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                          <div className="p-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                              <div className="space-y-3">
                                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                                  {spa.Category?.name && (
                                    <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 font-medium text-sky-700">{spa.Category.name}</span>
                                  )}
                                  {spa.location && (
                                    <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{spa.location}</span>
                                  )}
                                </div>
                                <div>
                                  <h3 className="text-xl font-semibold text-slate-900">{spa.name}</h3>
                                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{spa.description || "No description available."}</p>
                                </div>
                              </div>
                              <div className="space-y-2 text-right">
                                <p className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                                  {spa.isInclusive ? "Inclusive" : spa.discountValue ? `${spa.currencyCode || "AED"} ${spa.discountValue}` : "Price not set"}
                                </p>
                                <p className="text-xs text-slate-500">Service length: {spa.serviceTime || "TBD"} mins</p>
                              </div>
                            </div>
                          </div>
                          <div className="border-t border-slate-200 bg-slate-50 p-6">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="text-sm text-slate-600">
                                <p>{availableSlots || 0} open slot{availableSlots === 1 ? "" : "s"}</p>
                                <p>{spa.SpaDates?.length || 0} date{spa.SpaDates?.length === 1 ? "" : "s"}</p>
                              </div>
                              <Link
                                href={`/spa/${encodeURIComponent(spa.id)}?propertyCode=${encodeURIComponent(propertyCode)}`}
                                className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                              >
                                View details
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div>
                {bookedLoading ? (
                  <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-400">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    Loading booked spas…
                  </div>
                ) : bookedSpas.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-500">
                    <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-slate-400" />
                    No booked spa yet. Booked spa will appear here once a reservation is made.
                  </div>
                ) : (
                  <>
                    {/* Selection Toolbar */}
                    {selectedCount > 0 && (
                      <div className="sticky top-4 z-10 mb-4 rounded-2xl bg-slate-900 p-4 shadow-lg">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <div className="text-white">
                            <span className="font-semibold">{selectedCount}</span> booking(s) selected
                            <span className="ml-2 text-sm text-slate-300">
                              ({totalSlotsSelected} total slots)
                            </span>
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={handleClearSelection}
                              className="rounded-xl bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-600 transition"
                            >
                              Clear
                            </button>
                            <button
                              onClick={handleCancelSelectedBookings}
                              disabled={isBulkCancelling}
                              className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isBulkCancelling ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Cancelling...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="h-4 w-4" />
                                  Cancel Selected ({selectedCount})
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Select All Button */}
                    <div className="mb-4 flex justify-end">
                      <button
                        onClick={toggleSelectAllBookings}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                      >
                        {selectedCount === bookedSpas.length ? "Deselect All" : "Select All Bookings"}
                      </button>
                    </div>

                    {/* Bookings List */}
                    <div className="space-y-4">
                      {bookedSpas.map((booking: any) => {
                        const spa = booking?.spa || booking?.Spa || null;
                        const spaName = spa?.name || booking?.spaName || "Spa";
                        const bookingId = booking?.spaBookingId || booking?.id;
                        const isSelected = selectedBookings.has(bookingId);
                        const isCancelling = cancellingBookings.has(bookingId);
                        
                        const slots = booking?.slotBookings || booking?.SlotBookings || booking?.slots || booking?.Slots || [];
                        const fallbackDate = booking?.date || booking?.Reservation?.reservationStartDate || booking?.startDate;
                        const bookingCode = booking?.bookingCode || booking?.Reservation?.bookingCode;

                        if (!bookingId) return null;

                        return (
                          <div
                            key={bookingId}
                            className={`rounded-3xl border-2 transition-all ${
                              isSelected 
                                ? 'border-emerald-500 bg-emerald-50/30' 
                                : 'border-slate-200 bg-white'
                            } p-6 shadow-sm`}
                          >
                            <div className="flex flex-col gap-4">
                              {/* Booking Header */}
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleBookingSelection(bookingId)}
                                    className="mt-1 h-5 w-5 rounded border-slate-300 cursor-pointer"
                                    disabled={isCancelling}
                                  />
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h3 className="text-lg font-semibold text-slate-900">{spaName}</h3>
                                      {slots.length > 1 && (
                                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                                          {slots.length} slots
                                        </span>
                                      )}
                                    </div>
                                    {bookingCode && (
                                      <p className="text-xs text-slate-500 mt-1">
                                        Booking Code: {bookingCode}
                                      </p>
                                    )}
                                    <p className="text-sm text-slate-600 mt-1">
                                      {fallbackDate ? formatDate(String(fallbackDate)) : "Date not available"}
                                    </p>
                                  </div>
                                </div>
                                
                                {/* Cancel Entire Booking Button */}
                                <button
                                  type="button"
                                  onClick={() => handleCancelSingleBooking(bookingId, spaName)}
                                  disabled={isCancelling}
                                  className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isCancelling ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      Cancelling...
                                    </>
                                  ) : (
                                    <>
                                      <Trash2 className="h-4 w-4" />
                                      Cancel Booking
                                    </>
                                  )}
                                </button>
                              </div>

                              {/* Slots List */}
                              {slots.length > 0 && (
                                <div className="mt-3 border-t border-slate-200 pt-4">
                                  <p className="text-sm font-medium text-slate-700 mb-2">Booked Slots:</p>
                                  <div className="space-y-2">
                                    {slots.map((sb: any, idx: number) => {
                                      const sDate = sb?.date || sb?.SpaSlot?.date || sb?.SpaDate?.date || fallbackDate;
                                      const st = sb?.startTime || sb?.SpaSlot?.startTime;
                                      const et = sb?.endTime || sb?.SpaSlot?.endTime;
                                      const amount = sb?.amount || sb?.SpaSlot?.amount || 0;

                                      return (
                                        <div
                                          key={sb?.id || idx}
                                          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2"
                                        >
                                          <div className="flex justify-between items-center">
                                            <div>
                                              <p className="text-sm font-medium text-slate-800">
                                                {sDate ? formatDate(String(sDate)) : "Date not available"}
                                              </p>
                                              {(st || et) && (
                                                <p className="text-xs text-slate-600">
                                                  {st ? formatTime(String(st)) : ""}
                                                  {et ? ` - ${formatTime(String(et))}` : ""}
                                                </p>
                                              )}
                                            </div>
                                            {!spa?.isInclusive && amount > 0 && (
                                              <p className="text-sm font-medium text-emerald-700">
                                                {spa?.currencyCode || "AED"} {amount}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
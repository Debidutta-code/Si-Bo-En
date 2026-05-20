"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { MapPin, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { getSpaByPropertyCodeApi, createSpaReservationApi, markSpaSlotAvailableApi } from "../api/spa.api";
import { ISpa, ISpaDate, ISpaSlot } from "../interface";

interface SelectedSlot {
  spaId: string;
  slotId: string;
  spaName: string;
  dateLabel: string;
  startTime: string;
  endTime: string;
  amount: number;
}

interface SpaClientProps {
  params: {
    spaId: string;
  };
}

export default function SpaClient({ params }: SpaClientProps) {
  const searchParams = useSearchParams();
  const propertyCode =
    searchParams.get("propertyCode") || searchParams.get("code") || "";
  const [spas, setSpas] = useState<ISpa[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cancellingSlotId, setCancellingSlotId] = useState<string | null>(null);

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

  const handleSelectSlot = (spa: ISpa, spaDate: ISpaDate, slot: ISpaSlot) => {
    if (slot.isBooked) {
      toast.error("This slot is already booked.");
      return;
    }

    const amount = spa.isInclusive ? 0 : spa.discountValue || 0;
    setSelectedSlot({
      spaId: spa.id || params.spaId,
      slotId: slot.id,
      spaName: spa.name,
      dateLabel: format(new Date(spaDate.date), "EEEE, MMM dd, yyyy"),
      startTime: slot.startTime,
      endTime: slot.endTime || slot.startTime,
      amount,
    });
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot) {
      return;
    }

    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      toast.error("Please enter name, email and phone to confirm booking.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await createSpaReservationApi({
        userEmail: customerEmail.trim(),
        userContactNumber: customerPhone.trim(),
        slots: [
          {
            spaId: selectedSlot.spaId,
            spaSlotId: selectedSlot.slotId,
            amount: selectedSlot.amount,
          },
        ],
      });

      if (response.success) {
        toast.success(response.message || "Spa slot booked successfully.");
        setSelectedSlot(null);
        setCustomerName("");
        setCustomerEmail("");
        setCustomerPhone("");
        await loadSpas(propertyCode.trim());
      } else {
        toast.error(response.message || "Failed to create spa booking.");
      }
    } catch (error) {
      toast.error("Failed to create spa booking.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelBooking = async (slot: ISpaSlot) => {
    setCancellingSlotId(slot.id);
    try {
      const response = await markSpaSlotAvailableApi(slot.id);
      if (response.success) {
        toast.success(response.message || "Spa booking released successfully.");
        await loadSpas(propertyCode.trim());
      } else {
        toast.error(response.message || "Failed to release spa booking.");
      }
    } catch (error) {
      toast.error("Failed to release spa booking.");
    } finally {
      setCancellingSlotId(null);
    }
  };

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

  const spa = useMemo(
    () => spas.find((item) => item.id === params.spaId),
    [spas, params.spaId],
  );

  const availableSlots = useMemo(
    () =>
      spa?.SpaDates?.reduce(
        (sum, date) => sum + (date.Slots?.filter((slot: ISpaSlot) => !slot.isBooked).length || 0),
        0,
      ) || 0,
    [spa],
  );

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-slate-500">Spa details</p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Spa service details</h1>
            <p className="mt-2 text-sm text-slate-600">
              {hasPropertyCode
                ? `Property code ${propertyCode.toUpperCase()}`
                : "A property code is required to load spa services."}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/spa?propertyCode=${encodeURIComponent(propertyCode)}`}
              className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
              Back to spa list
            </Link>
          </div>
        </div>

        {!hasPropertyCode ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">
            No property code provided. Add <span className="font-semibold">?code=PROPERTY_CODE</span> or <span className="font-semibold">?propertyCode=PROPERTY_CODE</span> to the URL.
          </div>
        ) : loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-400">Loading spa details…</div>
        ) : !spa ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-500">
            Spa not found for the selected property code.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                    {spa.Category?.name && (
                      <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 font-medium text-sky-700">{spa.Category.name}</span>
                    )}
                    {spa.location && (
                      <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{spa.location}</span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-900">{spa.name}</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{spa.description || "No description available."}</p>
                  </div>
                </div>
                <div className="rounded-3xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
                  <div>{spa.isInclusive ? "Inclusive" : spa.discountValue ? `Price: ${spa.currencyCode || "AED"} ${spa.discountValue}` : "Price not set"}</div>
                  <div className="mt-2 text-slate-500">Service length: {spa.serviceTime || "TBD"} mins</div>
                  <div className="mt-2 text-slate-500">Open slots: {availableSlots}</div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">Available dates and slots</h3>
                {spa.SpaDates && spa.SpaDates.length > 0 ? (
                  <div className="mt-6 space-y-6">
                    {spa.SpaDates.map((spaDate: ISpaDate) => (
                      <div key={spaDate.id} className="rounded-3xl border border-slate-200 p-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{formatDate(spaDate.date)}</p>
                            <p className="text-sm text-slate-500">{spaDate.Slots?.length || 0} slot{spaDate.Slots?.length === 1 ? "" : "s"}</p>
                          </div>
                          <div className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">Date ID: {spaDate.id.slice(0, 8)}</div>
                        </div>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          {spaDate.Slots?.map((slot: ISpaSlot) => (
                            <div key={slot.id} className="rounded-3xl border border-slate-200 p-4">
                              <div className="flex items-center justify-between gap-4">
                                <div>
                                  <p className="font-medium text-slate-900">{formatTime(slot.startTime)} - {formatTime(slot.endTime || slot.startTime)}</p>
                                  <p className="text-sm text-slate-500">{slot.isBooked ? "Booked" : "Available"}</p>
                                </div>
                                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${slot.isBooked ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                                  {slot.isBooked ? "Booked" : "Open"}
                                </span>
                              </div>
                              {slot.isBooked && slot.Reservation?.bookingCode ? (
                                <p className="mt-3 text-sm text-slate-600">Code: {slot.Reservation.bookingCode}</p>
                              ) : null}
                              {slot.isBooked ? (
                                <button
                                  type="button"
                                  onClick={() => handleCancelBooking(slot)}
                                  disabled={cancellingSlotId === slot.id}
                                  className="mt-4 inline-flex w-full justify-center rounded-2xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                  {cancellingSlotId === slot.id ? "Cancelling..." : "Cancel booking"}
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleSelectSlot(spa, spaDate, slot)}
                                  className="mt-4 inline-flex w-full justify-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                                >
                                  Select this slot
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-6 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-sm text-slate-500">
                    No dates configured for this spa yet.
                  </div>
                )}
              </div>

              <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">Spa summary</h3>
                {selectedSlot ? (
                  <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                    <p className="font-semibold text-slate-900">Selected slot</p>
                    <p className="mt-2">{selectedSlot.dateLabel}</p>
                    <p>{selectedSlot.startTime} – {selectedSlot.endTime}</p>
                    <p className="mt-2 font-medium">{selectedSlot.amount === 0 ? "Inclusive" : `${spa.currencyCode || "AED"} ${selectedSlot.amount}`}</p>
                    <div className="mt-4 space-y-3">
                      <input
                        type="text"
                        value={customerName}
                        onChange={(event) => setCustomerName(event.target.value)}
                        placeholder="Name"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      />
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(event) => setCustomerEmail(event.target.value)}
                        placeholder="Email"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      />
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(event) => setCustomerPhone(event.target.value)}
                        placeholder="Phone"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      />
                    </div>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={handleConfirmBooking}
                        disabled={submitting}
                        className="inline-flex w-full justify-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                      >
                        {submitting ? "Booking..." : "Confirm booking"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedSlot(null)}
                        className="inline-flex w-full justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                      >
                        Clear selection
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                    Select a slot to book it and enter your contact details.
                  </div>
                )}
                <div className="mt-4 space-y-4 text-sm text-slate-600">
                  <div>
                    <p className="font-medium text-slate-900">Property code</p>
                    <p>{propertyCode.toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Total dates</p>
                    <p>{spa.SpaDates?.length || 0}</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Open slots</p>
                    <p>{availableSlots}</p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

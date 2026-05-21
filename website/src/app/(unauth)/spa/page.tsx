"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { MapPin, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { getSpaByPropertyCodeApi } from "./api/spa.api";
import { ISpa, ISpaDate, ISpaSlot } from "./interface";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";

type Tab = "all" | "booked";

export default function SpaPage() {
  const router = useRouter();
  const customer = useSelector((state: RootState) => (state as any).customer);

  const searchParams = useSearchParams();
  const propertyCode = searchParams.get("propertyCode") || searchParams.get("code") || "";
  const [spas, setSpas] = useState<ISpa[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("all");

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
                    onClick={() => setActiveTab("all")}
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
                    onClick={() => setActiveTab("booked")}
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
                  <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-400">Loading spa services…</div>
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
                                <p className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">{spa.isInclusive ? "Inclusive" : spa.discountValue ? `${spa.currencyCode || "AED"} ${spa.discountValue}` : "Price not set"}</p>
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
              <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-500">
                No booked spa yet. Booked spa will appear here once a reservation is made.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

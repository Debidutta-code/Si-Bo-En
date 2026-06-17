"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "../../components/ui/dialog";
import {
  getAvailableSpasApi,
  markSlotAsAvailableApi,
} from "../../app/(auth)/profile/api/profile.api";
import { formatNumber, getLocale } from "../../utils/numLang";
import { currencies } from "../currencyCode/cuurency";
import { Currency } from "../currencyCode/currency-code.type";
import { Check, Search, Clock, MapPin, Tag, Users } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import createAxiosInstance from "../axiosInstance";
import { format } from "date-fns-tz";

const axiosInstance = createAxiosInstance();

// ─── Types ───────────────────────────────────────────────────────────────────

type ISpaSlotAvailableStatus = "active" | "Inactive" | "booked" | "completed";

interface ISpaSlotsAvailable {
  id: string;
  status: ISpaSlotAvailableStatus;
  spaSlotId: string;
  reservationId: string | null;
  slotBooking: string | null;
}

interface ISpaSlots {
  id: string;
  startTime: string;
  endTime: string;
  spaDateId: string;
  isActive: boolean;
  slotsAvailable: ISpaSlotsAvailable[];
}

interface ISpaDates {
  id: string;
  date: string;
  spaModuleId: string;
  slots: ISpaSlots[];
}

interface ISpa {
  id: string;
  name: string;
  itemCode: string;
  description: string;
  benefits: string[];
  conditions: any;
  isInclusive: boolean;
  images: string[];
  serviceTime: number;
  location: string;
  createdBy: string;
  categoryId: string;
  subCategoryId: string;
  isActive: boolean;
  discountValue: number;
  currencyCode: string;
  createdAt: string;
  propertyId: string;
  Category: { id: string; name: string };
  SubCategory: { id: string; name: string; categoryId: string; isActive: boolean };
  SpaDates: ISpaDates[];
}

// ─── Selection model ──────────────────────────────────────────────────────────
// One selected "unit" = one slotsAvailable entry chosen by the user

interface SelectedAvailability {
  availabilityId: string;   // ISpaSlotsAvailable.id
  slotId: string;           // ISpaSlots.id
  startTime: string;
  endTime: string;
  dateLabel: string;
  spaName: string;
  spaId: string;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface SpaBookingDialogProps {
  bookingCode: string;
  reservationId: string;
  guestName: string;
  onClose: () => void;
}

const TEAL = "#0d7a87";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso: string) {
  const d = new Date(iso);
  const hours = d.getUTCHours();
  const minutes = d.getUTCMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const h = hours % 12 || 12;
  const m = minutes.toString().padStart(2, "0");
  return `${h}:${m} ${ampm}`;
}

function dateLabel(iso: string) {
  return format(new Date(iso.split("T")[0] + "T00:00:00"), "EEEE, dd MMM yyyy");
}


interface AvailabilityBoxProps {
  avail: ISpaSlotsAvailable;
  isSelected: boolean;
  isMyBooking: boolean;
  disabled: boolean;
  onClick: () => void;
}

function AvailabilityBox({ avail, isSelected, isMyBooking, disabled, onClick }: AvailabilityBoxProps) {
  let bg = "#fff";
  let border = "#e5e7eb";
  let cursor = "pointer";
  let opacity = 1;
  let title = "Available – click to select";

  if (isSelected) {
    bg = TEAL;
    border = TEAL;
    title = "Selected – click to deselect";
  } else if (isMyBooking) {
    bg = "#f0fdf4";
    border = "#86efac";
    title = "Booked by you – click to cancel";
  } else if (avail.status !== "active") {
    bg = "#f3f4f6";
    border = "#e5e7eb";
    cursor = "not-allowed";
    opacity = 0.5;
    title = avail.status === "booked" ? "Already booked" : avail.status;
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      title={title}
      className="relative w-7 h-7 rounded-md border transition-all duration-100 flex items-center justify-center"
      style={{ background: bg, borderColor: border, cursor, opacity }}
    >
      {isSelected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
      {isMyBooking && !isSelected && <Check className="h-3 w-3 text-green-600" strokeWidth={3} />}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SpaBookingDialog({
  bookingCode,
  reservationId,
  guestName,
  onClose,
}: SpaBookingDialogProps) {
  const { t } = useTranslation();

  const [spas, setSpas] = useState<ISpa[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeSpa, setActiveSpa] = useState<ISpa | null>(null);

  // Multi-select across slots/dates/spas
  const [selectedAvailabilities, setSelectedAvailabilities] = useState<SelectedAvailability[]>([]);

  // Cancel flow
  const [cancelTarget, setCancelTarget] = useState<{ availabilityId: string; label: string } | null>(null);

  const [userName, setUserName] = useState(guestName || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchAvailableSpas(); }, [bookingCode]);
  useEffect(() => {
    if (confirmOpen && !cancelTarget) setTimeout(() => nameInputRef.current?.focus(), 50);
  }, [confirmOpen, cancelTarget]);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchAvailableSpas = async () => {
    setLoading(true);
    try {
      const res = await getAvailableSpasApi(bookingCode);
      if (res.success && res.data) {
        setSpas(res.data);
        if (res.data.length > 0) setActiveSpa(res.data[0]);
      } else {
        toast.error(res.message || t("SpaBookingDialog.toast.fetchSpasFailed"));
      }
    } catch {
      toast.error(t("SpaBookingDialog.toast.fetchSpasFailed"));
    } finally {
      setLoading(false);
    }
  };

  // ── Derived state ──────────────────────────────────────────────────────────

  const categories = [
    "All",
    ...Array.from(new Set(spas.map((s) => s.Category?.name).filter(Boolean))) as string[],
  ];

  const filteredSpas = spas.filter((spa) => {
    const matchesSearch = spa.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || spa.Category?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const grouped = filteredSpas.reduce<Record<string, ISpa[]>>((acc, spa) => {
    const cat = spa.Category?.name || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(spa);
    return acc;
  }, {});

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleSpaClick = (spa: ISpa) => {
    setActiveSpa(spa);
    setCancelTarget(null);
    setConfirmOpen(false);
  };

  /**
   * Clicking an availability box:
   * - If it's booked by me → show cancel confirm
   * - If active → toggle selection
   * - Otherwise → ignore
   */
  const handleAvailabilityClick = (
    avail: ISpaSlotsAvailable,
    slot: ISpaSlots,
    spaDate: ISpaDates,
    spa: ISpa
  ) => {
    const isMyBooking = avail.status === "booked" && avail.reservationId === reservationId;

    if (isMyBooking) {
      // Cancel flow
      const label = `${spa.name} · ${dateLabel(spaDate.date)} · ${formatTime(slot.startTime)}`;
      setCancelTarget({ availabilityId: avail.id, label });
      setSelectedAvailabilities([]);
      setConfirmOpen(true);
      return;
    }

    if (avail.status !== "active") return;

    // Toggle in selection list
    setCancelTarget(null);

    setSelectedAvailabilities((prev) => {
      const exists = prev.some((s) => s.availabilityId === avail.id);
      if (exists) {
        const next = prev.filter((s) => s.availabilityId !== avail.id);
        if (next.length === 0) setConfirmOpen(false);
        return next;
      }
      setConfirmOpen(true);
      return [
        ...prev,
        {
          availabilityId: avail.id,
          slotId: slot.id,
          startTime: slot.startTime,
          endTime: slot.endTime,
          dateLabel: dateLabel(spaDate.date),
          spaName: spa.name,
          spaId: spa.id,
        },
      ];
    });
  };

  const handleConfirmBooking = async () => {
    if (selectedAvailabilities.length === 0) return;
    if (!userName.trim()) {
      toast.error(t("SpaBookingDialog.toast.enterGuestName"));
      nameInputRef.current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        reservationId,
        userName: userName.trim(),
        availabilities: selectedAvailabilities.map((s) => ({
          availabilityId: s.availabilityId,
          slotId: s.slotId,
          spaId: s.spaId,
        })),
      };

      const { data: result } = await axiosInstance.patch("/spa/slots/slot-availibility/book", payload);

      if (!result.success) {
        toast.error(result.message || t("SpaBookingDialog.toast.bookActivitiesFailedOneOrMore"));
        return;
      }

      toast.success(t("SpaBookingDialog.toast.activitiesIncluded"));
      setSelectedAvailabilities([]);
      setConfirmOpen(false);
      fetchAvailableSpas();
    } catch {
      toast.error(t("SpaBookingDialog.toast.bookActivitiesFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelTarget) return;
    setSubmitting(true);
    try {
      const res = await markSlotAsAvailableApi(cancelTarget.availabilityId);
      if (res.success) {
        toast.success(t("SpaBookingDialog.toast.activityRemoved"));
        setCancelTarget(null);
        setConfirmOpen(false);
        fetchAvailableSpas();
      } else {
        toast.error(res.message || t("SpaBookingDialog.toast.removeActivityFailed"));
      }
    } catch {
      toast.error(t("SpaBookingDialog.toast.removeActivityFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Slot summary counts for list panel ────────────────────────────────────

  function getSpaAvailabilityCounts(spa: ISpa) {
    let total = 0;
    let available = 0;
    for (const d of spa.SpaDates ?? []) {
      for (const slot of d.slots ?? []) {
        for (const av of slot.slotsAvailable ?? []) {
          total++;
          if (av.status === "active") available++;
        }
      }
    }
    return { total, available };
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <Dialog open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        className="max-w-4xl w-full p-0 gap-0 overflow-hidden rounded-2xl max-h-[88vh]"
        style={{ display: "flex", flexDirection: "column", margin: "auto" }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0 bg-white">
          <h2 className="text-[15px] font-semibold text-gray-900">
            {t("SpaBookingDialog.title")}
          </h2>
          {selectedAvailabilities.length > 0 && (
            <span
              className="text-[11px] font-medium px-2 py-0.5 rounded-full text-white"
              style={{ background: TEAL }}
            >
              {selectedAvailabilities.length} selected
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div
              className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200"
              style={{ borderTopColor: TEAL }}
            />
          </div>
        ) : spas.length === 0 ? (
          <div className="text-center py-16 text-sm text-gray-400">
            {t("SpaBookingDialog.loading.noSpas")}
          </div>
        ) : (
          <div className="flex flex-1 overflow-hidden">

            {/* ── LEFT: Active spa detail ── */}
            <div className="w-[52%] flex-shrink-0 flex flex-col overflow-y-auto border-r border-gray-100 min-w-0">
              {activeSpa && (
                <div className="p-4 flex flex-col gap-3">

                  {/* Image */}
                  {activeSpa.images?.[0] ? (
                    <img
                      src={activeSpa.images[0]}
                      alt={activeSpa.name}
                      className="rounded-xl w-full h-44 object-cover"
                    />
                  ) : (
                    <div className="w-full h-44 rounded-xl bg-gray-100 flex items-center justify-center text-4xl text-gray-300">
                      🧖
                    </div>
                  )}

                  {/* Category badge */}
                  {activeSpa.Category?.name && (
                    <span
                      className="inline-flex self-start items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full text-white"
                      style={{ background: TEAL }}
                    >
                      {activeSpa.Category.name}
                    </span>
                  )}

                  <h3 className="text-[15px] font-semibold text-gray-900">{activeSpa.name}</h3>

                  {/* Meta */}
                  <div className="flex flex-col gap-1.5">
                    {activeSpa.location && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        {activeSpa.location}
                        {activeSpa.serviceTime && (
                          <>
                            <span className="text-gray-300 mx-1">|</span>
                            <Clock className="h-3 w-3 flex-shrink-0" />
                            {t("SpaBookingDialog.detail.duration")} {activeSpa.serviceTime}{" "}
                            {t("SpaBookingDialog.detail.minutes")}
                          </>
                        )}
                      </div>
                    )}
                    {activeSpa.discountValue && !activeSpa.isInclusive && (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                        <Tag className="h-3 w-3 flex-shrink-0" />
                        {t("SpaBookingDialog.detail.charges")} {activeSpa.discountValue}{" "}
                        {activeSpa.currencyCode}
                      </div>
                    )}
                  </div>

                  {activeSpa.description && (
                    <p className="text-xs text-gray-500 leading-relaxed">
                      <span className="font-medium text-gray-700">
                        {t("SpaBookingDialog.detail.description")}{" "}
                      </span>
                      {activeSpa.description}
                    </p>
                  )}

                  {/* ── Slot + availability picker ── */}
                  {activeSpa.SpaDates?.length > 0 && (
                    <div className="mt-1 flex flex-col gap-4">
                      {activeSpa.SpaDates.map((spaDate) => (
                        <div key={spaDate.id}>
                          <p className="text-[11px] font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                            {dateLabel(spaDate.date)}
                          </p>

                          {spaDate.slots?.length === 0 && (
                            <p className="text-xs text-gray-400 italic">No slots for this date.</p>
                          )}

                          <div className="flex flex-col gap-3">
                            {spaDate.slots?.map((slot) => {
                              const activeCount = slot.slotsAvailable.filter(
                                (a) => a.status === "active"
                              ).length;
                              const totalCount = slot.slotsAvailable.length;

                              return (
                                <div key={slot.id} className="flex items-start gap-3">
                                  {/* Time label */}
                                  <div className="flex-shrink-0 pt-0.5 min-w-[90px]">
                                    <span className="text-xs font-medium text-gray-700">
                                      {formatTime(slot.startTime)}
                                    </span>
                                    {slot.endTime && (
                                      <span className="text-[11px] text-gray-400 block">
                                        – {formatTime(slot.endTime)}
                                      </span>
                                    )}
                                    {/* availability count pill */}
                                    <span
                                      className="inline-flex items-center gap-1 mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded"
                                      style={
                                        activeCount > 0
                                          ? { background: "#f0fdf4", color: "#15803d" }
                                          : { background: "#fef2f2", color: "#b91c1c" }
                                      }
                                    >
                                      <Users className="h-2.5 w-2.5" />
                                      {activeCount}/{totalCount} free
                                    </span>
                                  </div>

                                  {/* Availability boxes */}
                                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                                    {slot.slotsAvailable.map((avail) => {
                                      const isSelected = selectedAvailabilities.some(
                                        (s) => s.availabilityId === avail.id
                                      );
                                      const isMyBooking =
                                        avail.status === "booked" &&
                                        avail.reservationId === reservationId;
                                      const disabled =
                                        submitting ||
                                        (avail.status !== "active" && !isMyBooking);

                                      return (
                                        <AvailabilityBox
                                          key={avail.id}
                                          avail={avail}
                                          isSelected={isSelected}
                                          isMyBooking={isMyBooking}
                                          disabled={disabled}
                                          onClick={() =>
                                            handleAvailabilityClick(avail, slot, spaDate, activeSpa)
                                          }
                                        />
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Legend */}
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                      <span className="w-4 h-4 rounded border border-gray-200 bg-white inline-block" />
                      Available
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                      <span
                        className="w-4 h-4 rounded border inline-flex items-center justify-center"
                        style={{ background: TEAL, borderColor: TEAL }}
                      >
                        <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                      </span>
                      Selected
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                      <span className="w-4 h-4 rounded border border-green-300 bg-green-50 inline-flex items-center justify-center">
                        <Check className="h-2.5 w-2.5 text-green-600" strokeWidth={3} />
                      </span>
                      Booked by you
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                      <span className="w-4 h-4 rounded border border-gray-200 bg-gray-100 inline-block opacity-50" />
                      Unavailable
                    </div>
                  </div>

                  {/* ── Confirm booking panel ── */}
                  {confirmOpen && !cancelTarget && selectedAvailabilities.length > 0 && (
                    <div className="mt-2 rounded-xl border border-blue-100 bg-blue-50/50 p-3 space-y-2">
                      <p className="text-xs font-medium text-gray-700">
                        {selectedAvailabilities.length === 1
                          ? t("SpaBookingDialog.confirmPanel.activitySelected", {
                            count: selectedAvailabilities.length,
                          })
                          : t("SpaBookingDialog.confirmPanel.activitiesSelected", {
                            count: selectedAvailabilities.length,
                          })}
                      </p>

                      {/* Selected summary */}
                      <div className="flex flex-col gap-0.5 max-h-20 overflow-y-auto">
                        {selectedAvailabilities.map((s) => (
                          <p key={s.availabilityId} className="text-[10px] text-gray-500">
                            {s.spaName} · {s.dateLabel} · {formatTime(s.startTime)}
                          </p>
                        ))}
                      </div>

                      <div>
                        <label className="text-[11px] text-gray-500 mb-1 block">
                          {t("SpaBookingDialog.confirmPanel.guestNameLabel")}
                        </label>
                        <input
                          ref={nameInputRef}
                          type="text"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") handleConfirmBooking(); }}
                          placeholder={t("SpaBookingDialog.confirmPanel.guestNamePlaceholder")}
                          className="w-full h-8 px-2.5 text-xs rounded-lg border border-gray-200 bg-white outline-none focus:border-teal-400"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={handleConfirmBooking}
                          disabled={submitting || !userName.trim()}
                          className="flex-1 h-8 rounded-lg text-white text-xs font-medium disabled:opacity-50 flex items-center justify-center gap-1"
                          style={{ background: TEAL }}
                        >
                          <Check className="h-3 w-3" />
                          {submitting
                            ? t("SpaBookingDialog.confirmPanel.booking")
                            : t("SpaBookingDialog.confirmPanel.bookAll")}
                        </button>
                        <button
                          onClick={() => { setConfirmOpen(false); setSelectedAvailabilities([]); }}
                          disabled={submitting}
                          className="px-3 h-8 rounded-lg text-xs border border-gray-200 text-gray-600 hover:bg-gray-50"
                        >
                          {t("SpaBookingDialog.confirmPanel.cancel")}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── Cancel booking panel ── */}
                  {confirmOpen && cancelTarget && (
                    <div className="mt-2 rounded-xl border border-red-100 bg-red-50/50 p-3 space-y-2">
                      <p className="text-xs font-medium text-gray-700">
                        {t("SpaBookingDialog.cancelPanel.cancelPrefix")} {cancelTarget.label}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={handleCancelBooking}
                          disabled={submitting}
                          className="flex-1 h-8 rounded-lg text-white text-xs font-medium bg-red-500 hover:bg-red-600 disabled:opacity-50"
                        >
                          {submitting
                            ? t("SpaBookingDialog.cancelPanel.cancelling")
                            : t("SpaBookingDialog.cancelPanel.yesCancel")}
                        </button>
                        <button
                          onClick={() => { setConfirmOpen(false); setCancelTarget(null); }}
                          className="px-3 h-8 rounded-lg text-xs border border-gray-200 text-gray-600 hover:bg-gray-50"
                        >
                          {t("SpaBookingDialog.cancelPanel.keep")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── RIGHT: Spa list ── */}
            <div className="flex-1 flex flex-col overflow-hidden">

              {/* Category tabs */}
              <div className="flex gap-2 px-4 pt-3 pb-2 flex-shrink-0 overflow-x-auto scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all whitespace-nowrap"
                    style={
                      selectedCategory === cat
                        ? { background: TEAL, color: "#fff", borderColor: TEAL }
                        : { background: "#fff", color: "#6b7280", borderColor: "#e5e7eb" }
                    }
                  >
                    {cat === "All" ? t("SpaBookingDialog.list.categoryAll") : cat}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="px-4 pb-2 flex-shrink-0">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50">
                  <Search className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("SpaBookingDialog.list.searchPlaceholder")}
                    className="flex-1 text-xs bg-transparent outline-none text-gray-700 placeholder-gray-400"
                  />
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
                {Object.entries(grouped).map(([categoryName, categorySpas]) => (
                  <div key={categoryName}>
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
                      {categoryName === "All" ? t("SpaBookingDialog.list.categoryAll") : categoryName}
                    </p>
                    <div className="space-y-2">
                      {categorySpas.map((spa) => {
                        const isActive = activeSpa?.id === spa.id;
                        const { total, available } = getSpaAvailabilityCounts(spa);

                        return (
                          <button
                            key={spa.id}
                            onClick={() => handleSpaClick(spa)}
                            className="w-full flex items-center gap-3 p-2.5 rounded-xl border transition-all text-left"
                            style={
                              isActive
                                ? { borderColor: TEAL, backgroundColor: "#f0fafa" }
                                : { borderColor: "#f0f0f0", backgroundColor: "#fff" }
                            }
                          >
                            {/* Thumbnail */}
                            <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                              {spa.images?.[0] ? (
                                <img
                                  src={spa.images[0]}
                                  alt={spa.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xl">
                                  🧖
                                </div>
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-800 truncate">{spa.name}</p>
                              <p className="text-[11px] text-gray-400">
                                {spa.SubCategory?.name || spa.Category?.name}
                              </p>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span
                                  className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                                  style={
                                    spa.isInclusive
                                      ? { background: "#f0fdf4", color: "#15803d" }
                                      : { background: "#f5f5f5", color: "#6b7280" }
                                  }
                                >
                                  {spa.isInclusive
                                    ? t("SpaBookingDialog.list.included")
                                    : t("SpaBookingDialog.list.paid")}
                                </span>
                                {/* Availability mini-boxes */}
                                <div className="flex items-center gap-0.5">
                                  {spa.SpaDates.flatMap((d) =>
                                    d.slots.flatMap((sl) =>
                                      sl.slotsAvailable.slice(0, 8).map((av) => (
                                        <span
                                          key={av.id}
                                          className="w-2.5 h-2.5 rounded-sm inline-block border"
                                          style={
                                            av.status === "active"
                                              ? { background: "#d1fae5", borderColor: "#6ee7b7" }
                                              : av.status === "booked" && av.reservationId === reservationId
                                                ? { background: "#bfdbfe", borderColor: "#93c5fd" }
                                                : { background: "#f3f4f6", borderColor: "#e5e7eb" }
                                          }
                                        />
                                      ))
                                    )
                                  ).slice(0, 8)}
                                  {total > 8 && (
                                    <span className="text-[9px] text-gray-400 ml-0.5">+{total - 8}</span>
                                  )}
                                </div>
                                <span className="text-[10px] text-gray-400">
                                  {t("SpaBookingDialog.list.slotsFree", {
                                    available,
                                    total,
                                  })}
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {filteredSpas.length === 0 && (
                  <div className="text-center py-8 text-xs text-gray-400">
                    {t("SpaBookingDialog.list.noResults")}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
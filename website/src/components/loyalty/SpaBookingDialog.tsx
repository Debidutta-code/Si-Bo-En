"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "../../components/ui/dialog";
import {
  getAvailableSpasApi,
  markSlotAsBookedApi,
  markSlotAsAvailableApi,
} from "../../app/(loyality)/(loyality-guest)/profile/api/profile.api";
import { format } from "date-fns";
import { Check, Search, Clock, MapPin, Tag } from "lucide-react";
import toast from "react-hot-toast";

interface SpaBookingDialogProps {
  bookingCode: string;
  reservationId: string;
  guestName: string;
  onClose: () => void;
}

interface SelectedSlot {
  slotId: string;
  startTime: string;
  endTime: string | null;
  dateLabel: string;
  spaName: string;
  spaId: string;
}

const TEAL = "#0d7a87";

export default function SpaBookingDialog({
  bookingCode,
  reservationId,
  guestName,
  onClose,
}: SpaBookingDialogProps) {
  const [spas, setSpas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [activeSpa, setActiveSpa] = useState<any | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [cancelSlot, setCancelSlot] = useState<SelectedSlot | null>(null);
  const [userName, setUserName] = useState(guestName || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchAvailableSpas(); }, [bookingCode]);
  useEffect(() => {
    if (confirmOpen) setTimeout(() => nameInputRef.current?.focus(), 50);
  }, [confirmOpen]);

  const fetchAvailableSpas = async () => {
    setLoading(true);
    try {
      const res = await getAvailableSpasApi(bookingCode);
      if (res.success && res.data) {
        setSpas(res.data);
        if (res.data.length > 0) setActiveSpa(res.data[0]);
      } else {
        toast.error(res.message || "Failed to fetch spas");
      }
    } catch {
      toast.error("Failed to fetch spas");
    } finally {
      setLoading(false);
    }
  };

  // Derive unique categories from Category field
  const categories = ["All", ...Array.from(new Set(spas.map((s) => s.Category?.name).filter(Boolean))) as string[]];

  const filteredSpas = spas.filter((spa) => {
    const matchesSearch = spa.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || spa.Category?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group filtered spas by Category
  const grouped = filteredSpas.reduce((acc: Record<string, any[]>, spa) => {
    const cat = spa.Category?.name || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(spa);
    return acc;
  }, {});

  const handleSpaClick = (spa: any) => {
    setActiveSpa(spa);
    setSelectedSlot(null);
    setCancelSlot(null);
    setConfirmOpen(false);
  };

  const handleSlotClick = (slot: any, spaDate: any, spa: any) => {
    const dateLabel = format(new Date(spaDate.date.split("T")[0] + "T00:00:00"), "EEEE, dd MMM yyyy");
    if (slot.isBooked) {
      if (slot.reservationId === reservationId) {
        setCancelSlot({
          slotId: slot.id,
          startTime: slot.startTime,
          endTime: slot.endTime,
          dateLabel,
          spaName: spa.name,
          spaId: spa.id,
        });
        setSelectedSlot(null);
        setConfirmOpen(true);
      }
      return;
    }
    setCancelSlot(null);
    setSelectedSlot({
      slotId: slot.id,
      startTime: slot.startTime,
      endTime: slot.endTime,
      dateLabel,
      spaName: spa.name,
      spaId: spa.id,
    });
    setConfirmOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot) return;
    if (!userName.trim()) {
      toast.error("Please enter a guest name");
      nameInputRef.current?.focus();
      return;
    }
    setSubmitting(true);
    try {
      const res = await markSlotAsBookedApi(selectedSlot.slotId, {
        reservationId,
        userName: userName.trim(),
      });
      if (res.success) {
        toast.success("Activity included in your stay");
        setSelectedSlot(null);
        setConfirmOpen(false);
        fetchAvailableSpas();
      } else {
        toast.error(res.message || "Failed to book");
      }
    } catch {
      toast.error("Failed to book activity");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelSlot) return;
    setSubmitting(true);
    try {
      const res = await markSlotAsAvailableApi(cancelSlot.slotId);
      if (res.success) {
        toast.success("Activity removed from your stay.");
        setCancelSlot(null);
        setConfirmOpen(false);
        fetchAvailableSpas();
      } else {
        toast.error(res.message || "Failed to remove activity");
      }
    } catch {
      toast.error("Failed to remove activity");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const hours = d.getUTCHours();
    const minutes = d.getUTCMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const h = hours % 12 || 12;
    const m = minutes.toString().padStart(2, "0");
    return `${h}:${m} ${ampm}`;
  };

  // Find earliest available slot date for active spa
  const activeSpaFirstDate = activeSpa?.SpaDates?.[0];
  const activeSpaFirstSlot = activeSpaFirstDate?.Slots?.find((s: any) => !s.isBooked);

  return (
    <Dialog open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-4xl w-full p-0 gap-0 overflow-hidden rounded-2xl max-h-[88vh]"
        style={{ display: "flex", flexDirection: "column", margin: "auto" }}>

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0 bg-white">
          <h2 className="text-[15px] font-semibold text-gray-900">Spa & Activities</h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200" style={{ borderTopColor: TEAL }} />
          </div>
        ) : spas.length === 0 ? (
          <div className="text-center py-16 text-sm text-gray-400">
            No spas or activities available for these dates.
          </div>
        ) : (
          <div className="flex flex-1 overflow-hidden">

            {/* ── LEFT: Active spa detail ── */}
            <div className="w-[45%] flex-shrink-0 flex flex-col overflow-y-auto border-r border-gray-100 min-w-0">
              {activeSpa && (
                <>
                  {/* Detail body */}
                  <div className="p-4 flex flex-col gap-3">
                    {/* Image */}
                    {activeSpa.images?.[0] ? (
                      <img
                        src={activeSpa.images[0]}
                        alt={activeSpa.name}
                        className="rounded-xl w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">🧖</div>
                    )}
                    {/* Category badge */}
                    {activeSpa.Category?.name && (
                      <span className="inline-flex self-start items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full text-white"
                        style={{ background: TEAL }}>
                        {activeSpa.Category.name}
                      </span>
                    )}

                    <h3 className="text-[15px] font-semibold text-gray-900">{activeSpa.name}</h3>

                    {/* Meta row */}
                    <div className="flex flex-col gap-1.5">
                      {activeSpa.location && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          {activeSpa.location}
                          {activeSpa.serviceTime && (
                            <span className="text-gray-300 mx-1">|</span>
                          )}
                          {activeSpa.serviceTime && (
                            <>
                              <Clock className="h-3 w-3 flex-shrink-0" />
                              Duration: {activeSpa.serviceTime} Minutes
                            </>
                          )}
                        </div>
                      )}
                      {activeSpa.discountValue && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Tag className="h-3 w-3 flex-shrink-0" />
                          {activeSpa.discountValue}% off · {activeSpa.currencyCode}
                          {activeSpa.isInclusive && (
                            <span className="ml-1 px-1.5 py-0.5 rounded bg-green-50 text-green-700 text-[10px] font-medium">Inclusive</span>
                          )}
                        </div>
                      )}
                    </div>

                    {activeSpa.description && (
                      <p className="text-xs text-gray-500 leading-relaxed">
                        <span className="font-medium text-gray-700">Description: </span>
                        {activeSpa.description}
                      </p>
                    )}

                    {/* Slot picker per date */}
                    {activeSpa.SpaDates?.length > 0 && (
                      <div className="mt-1 flex flex-col gap-3">
                        {activeSpa.SpaDates.map((spaDate: any) => (
                          <div key={spaDate.id}>
                            <p className="text-[11px] font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
                              {format(new Date(spaDate.date.split("T")[0] + "T00:00:00"), "EEEE, dd MMM yyyy")}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {spaDate.Slots?.map((slot: any) => {
                                const isMyBooking = slot.isBooked && slot.reservationId === reservationId;
                                const isSelected = selectedSlot?.slotId === slot.id || cancelSlot?.slotId === slot.id;

                                return (
                                  <button
                                    key={slot.id}
                                    type="button"
                                    disabled={submitting || (slot.isBooked && !isMyBooking)}
                                    onClick={() => handleSlotClick(slot, spaDate, activeSpa)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all duration-100"
                                    style={
                                      isSelected
                                        ? { backgroundColor: TEAL, borderColor: TEAL, color: "#fff" }
                                        : isMyBooking
                                          ? { backgroundColor: "#f0fdf4", borderColor: "#86efac", color: "#15803d" }
                                          : slot.isBooked
                                            ? { backgroundColor: "#f9fafb", borderColor: "#e5e7eb", color: "#9ca3af", cursor: "not-allowed", opacity: 0.6, borderStyle: "dashed" }
                                            : { backgroundColor: "#fff", borderColor: "#e5e7eb", color: "#374151" }
                                    }
                                  >
                                    {formatTime(slot.startTime)}
                                    {slot.endTime && <span className="opacity-60">– {formatTime(slot.endTime)}</span>}
                                    {isMyBooking && <Check className="h-3 w-3" />}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Confirm / Cancel panel */}
                    {confirmOpen && selectedSlot && (
                      <div className="mt-2 rounded-xl border border-blue-100 bg-blue-50/50 p-3 space-y-2">
                        <p className="text-xs font-medium text-gray-700">
                          {selectedSlot.dateLabel} · {formatTime(selectedSlot.startTime)}
                          {selectedSlot.endTime && ` – ${formatTime(selectedSlot.endTime)}`}
                        </p>
                        <div>
                          <label className="text-[11px] text-gray-500 mb-1 block">Guest name</label>
                          <input
                            ref={nameInputRef}
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") handleConfirmBooking(); }}
                            placeholder="Enter guest name…"
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
                            {submitting ? "Booking…" : "BOOK"}
                          </button>
                          <button
                            onClick={() => { setConfirmOpen(false); setSelectedSlot(null); }}
                            disabled={submitting}
                            className="px-3 h-8 rounded-lg text-xs border border-gray-200 text-gray-600 hover:bg-gray-50"
                          >
                            CANCEL
                          </button>
                        </div>
                      </div>
                    )}

                    {confirmOpen && cancelSlot && (
                      <div className="mt-2 rounded-xl border border-red-100 bg-red-50/50 p-3 space-y-2">
                        <p className="text-xs font-medium text-gray-700">
                          Cancel: {cancelSlot.spaName} · {cancelSlot.dateLabel} · {formatTime(cancelSlot.startTime)}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={handleCancelBooking}
                            disabled={submitting}
                            className="flex-1 h-8 rounded-lg text-white text-xs font-medium bg-red-500 hover:bg-red-600 disabled:opacity-50"
                          >
                            {submitting ? "Cancelling…" : "Yes, Cancel"}
                          </button>
                          <button
                            onClick={() => { setConfirmOpen(false); setCancelSlot(null); }}
                            className="px-3 h-8 rounded-lg text-xs border border-gray-200 text-gray-600 hover:bg-gray-50"
                          >
                            Keep
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
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
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
                    style={
                      selectedCategory === cat
                        ? { background: TEAL, color: "#fff", borderColor: TEAL }
                        : { background: "#fff", color: "#6b7280", borderColor: "#e5e7eb" }
                    }
                  >
                    {cat}
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
                    placeholder="Search"
                    className="flex-1 text-xs bg-transparent outline-none text-gray-700 placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Spa list grouped by category */}
              <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
                {Object.entries(grouped).map(([categoryName, categorySpas]) => (
                  <div key={categoryName}>
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">{categoryName}</p>
                    <div className="space-y-2">
                      {categorySpas.map((spa) => {
                        const isActive = activeSpa?.id === spa.id;
                        const totalSlots = spa.SpaDates?.reduce((acc: number, d: any) => acc + (d.Slots?.length || 0), 0) || 0;
                        const availableSlots = spa.SpaDates?.reduce((acc: number, d: any) =>
                          acc + (d.Slots?.filter((s: any) => !s.isBooked).length || 0), 0) || 0;

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
                                <img src={spa.images[0]} alt={spa.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xl">🧖</div>
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-800 truncate">{spa.name}</p>
                              <p className="text-[11px] text-gray-400">{spa.SubCategory?.name || spa.Category?.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span
                                  className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                                  style={
                                    spa.isInclusive
                                      ? { background: "#f0fdf4", color: "#15803d" }
                                      : { background: "#f5f5f5", color: "#6b7280" }
                                  }
                                >
                                  {spa.isInclusive ? "Included" : "Paid"}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                  {availableSlots}/{totalSlots} slots free
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
                    No results found. Try a different search or category.
                  </div>
                )}

                {/* <p className="text-[11px] text-gray-400 text-center pt-2">
                  Can&apos;t find a wellness service or activity that you would like to book?<br />
                  Please try selecting another date or time slot on the calendar
                </p> */}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { getAvailableSpasApi, markSlotAsBookedApi, markSlotAsAvailableApi } from "../../app/(loyality)/(loyality-guest)/profile/api/profile.api";
import { format } from "date-fns";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { UserCheck, CalendarCheck, Clock, Calendar, X, Check, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

interface SpaBookingDialogProps {
  bookingCode: string;
  reservationId: string;
  guestName: string;
  onClose: () => void;
}

interface SelectedSlot {
  slotId: string;
  label: string;
  dateLabel: string;
  spaName: string;
}

const TEAL = "#1595A2";

export default function SpaBookingDialog({ bookingCode, reservationId, guestName, onClose }: SpaBookingDialogProps) {
  const [spas, setSpas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected] = useState<SelectedSlot | null>(null);
  const [cancelSlot, setCancelSlot] = useState<SelectedSlot | null>(null);
  const [userName, setUserName] = useState(guestName || "");
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchAvailableSpas(); }, [bookingCode]);
  useEffect(() => { if (selected) setTimeout(() => nameInputRef.current?.focus(), 50); }, [selected]);

  const fetchAvailableSpas = async () => {
    setLoading(true);
    try {
      const res = await getAvailableSpasApi(bookingCode);
      if (res.success && res.data) setSpas(res.data);
      else toast.error(res.message || "Failed to fetch spas");
    } catch { toast.error("Failed to fetch spas"); }
    finally { setLoading(false); }
  };

  const handleSelectSlot = (slot: any, spaDate: any, spaName: string) => {
    const startLabel = format(new Date(slot.startTime), "hh:mm a");
    const endLabel = slot.endTime ? ` – ${format(new Date(slot.endTime), "hh:mm a")}` : "";
    const label = `${startLabel}${endLabel}`;
    const dateLabel = format(new Date(spaDate.date), "EEEE, MMM do, yyyy");
    if (slot.isBooked) {
      if (slot.reservationId === reservationId) {
        setCancelSlot({ slotId: slot.id, label, dateLabel, spaName });
        setSelected(null);
      }
      return;
    }
    setCancelSlot(null);
    setSelected({ slotId: slot.id, label, dateLabel, spaName });
  };

  const handleConfirmBooking = async () => {
    if (!selected) return;
    if (!userName.trim()) { toast.error("Please enter a guest name"); nameInputRef.current?.focus(); return; }
    setSubmitting(true);
    try {
      const res = await markSlotAsBookedApi(selected.slotId, { reservationId, userName: userName.trim() });
      if (res.success) { toast.success("Spa slot booked!"); setSelected(null); fetchAvailableSpas(); }
      else toast.error(res.message || "Failed to book");
    } catch { toast.error("Failed to book spa slot"); }
    finally { setSubmitting(false); }
  };

  const handleCancelBooking = async () => {
    if (!cancelSlot) return;
    setSubmitting(true);
    try {
      const res = await markSlotAsAvailableApi(cancelSlot.slotId);
      if (res.success) { toast.success("Booking cancelled."); setCancelSlot(null); fetchAvailableSpas(); }
      else toast.error(res.message || "Failed to cancel");
    } catch { toast.error("Failed to cancel booking"); }
    finally { setSubmitting(false); }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-3xl w-full max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-2xl">

        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-[15px] font-medium text-gray-900 flex items-center gap-2">
                <Sparkles className="h-4 w-4" style={{ color: TEAL }} />
                Add Spa / Activity
              </DialogTitle>
              <p className="text-xs text-gray-400 mt-0.5">Select a time slot to reserve for your stay</p>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 flex flex-col gap-5">

          {/* Confirm booking panel */}
          {selected && (
            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium" style={{ color: TEAL }}>
                <CalendarCheck className="h-4 w-4" />
                Confirm your booking
              </div>
              <p className="text-xs text-gray-500">
                <span className="font-medium text-gray-800">{selected.spaName}</span>
                {" · "}
                {selected.dateLabel}
                {" · "}
                <span className="font-medium text-gray-800">{selected.label}</span>
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="spa-guest-name" className="flex items-center gap-1.5 text-xs text-gray-500">
                  <UserCheck className="h-3.5 w-3.5" />
                  Guest name
                </Label>
                <Input
                  id="spa-guest-name"
                  ref={nameInputRef}
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleConfirmBooking(); }}
                  placeholder="Enter guest name…"
                  className="h-8 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleConfirmBooking}
                  disabled={submitting || !userName.trim()}
                  className="flex-1 h-8 text-xs font-medium text-white"
                  style={{ backgroundColor: TEAL, borderColor: TEAL }}
                >
                  <Check className="h-3.5 w-3.5 mr-1" />
                  {submitting ? "Booking…" : "Confirm booking"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSelected(null)} disabled={submitting} className="h-8 text-xs">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Cancel booking panel */}
          {cancelSlot && (
            <div className="rounded-xl border border-red-100 bg-red-50/60 p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-red-600">
                <X className="h-4 w-4" />
                Cancel spa booking
              </div>
              <p className="text-xs text-gray-500">
                <span className="font-medium text-gray-800">{cancelSlot.spaName}</span>
                {" · "}
                {cancelSlot.dateLabel}
                {" · "}
                <span className="font-medium text-gray-800">{cancelSlot.label}</span>
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="destructive" onClick={handleCancelBooking} disabled={submitting} className="flex-1 h-8 text-xs">
                  {submitting ? "Cancelling…" : "Yes, cancel booking"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setCancelSlot(null)} disabled={submitting} className="h-8 text-xs">
                  Keep booking
                </Button>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center gap-4 flex-wrap">
            {[
              { color: TEAL, label: "Available" },
              { color: "#16a34a", label: "Your booking" },
              { color: "#9ca3af", label: "Booked", dashed: true },
            ].map(({ color, label, dashed }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full`} style={{ background: color, opacity: dashed ? 0.5 : 1 }} />
                <span className="text-[11px] text-gray-400">{label}</span>
              </div>
            ))}
          </div>

          {/* Spa list */}
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-7 w-7 border-2 border-gray-200" style={{ borderTopColor: TEAL }} />
            </div>
          ) : spas.length === 0 ? (
            <div className="text-center py-12 text-sm text-gray-400">
              No spas or activities available for these dates.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {spas.map((spa) => (
                <div key={spa.id} className="border border-gray-100 rounded-xl overflow-hidden">

                  {/* Spa header */}
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{spa.name}</h3>
                      {spa.description && (
                        <p className="text-xs text-gray-400 mt-0.5">{spa.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-500 whitespace-nowrap flex-shrink-0">
                      <Clock className="h-3 w-3" />
                      {spa.duration ? `${spa.duration} min` : "60 min"}
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="p-3 flex flex-col gap-3">
                    {spa.SpaDates?.length > 0 ? spa.SpaDates.map((spaDate: any) => (
                      <div key={spaDate.id} className="rounded-lg border border-gray-100 overflow-hidden">

                        <div className="px-3 py-2 bg-gray-50/80 border-b border-gray-100 flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-xs font-medium text-gray-500">
                            {format(new Date(spaDate.date), "EEEE, MMM do, yyyy")}
                          </span>
                        </div>

                        <div className="p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                          {spaDate.Slots?.length > 0 ? spaDate.Slots.map((slot: any) => {
                            const isSelected = selected?.slotId === slot.id;
                            const isMyBooking = slot.isBooked && slot.reservationId === reservationId;

                            let slotClass = "";
                            let timeColor = "text-gray-700";
                            let statusText = "Available";
                            let statusColor = "text-gray-400";

                            if (isMyBooking) {
                              slotClass = "border-green-200 bg-green-50 hover:bg-green-100 cursor-pointer";
                              timeColor = "text-green-700";
                              statusText = "Your booking";
                              statusColor = "text-green-600";
                            } else if (slot.isBooked) {
                              slotClass = "border-dashed border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed";
                              timeColor = "text-gray-400";
                              statusText = slot.userName || "Booked";
                              statusColor = "text-red-400";
                            } else if (isSelected) {
                              slotClass = "cursor-pointer";
                              timeColor = "text-white";
                              statusText = "Selected";
                              statusColor = "text-white/80";
                            } else {
                              slotClass = "hover:border-teal-300 hover:bg-teal-50/50 cursor-pointer";
                            }

                            return (
                              <button
                                key={slot.id}
                                type="button"
                                disabled={submitting || (slot.isBooked && !isMyBooking)}
                                onClick={() => handleSelectSlot(slot, spaDate, spa.name)}
                                className={`flex flex-col items-center justify-center rounded-lg p-2 border text-xs transition-all duration-100 ${slotClass}`}
                                style={isSelected ? { backgroundColor: TEAL, borderColor: TEAL } : {}}
                              >
                                <span className={`font-medium text-center leading-tight ${timeColor}`}>
                                  {format(new Date(slot.startTime), "hh:mm a")}
                                  {slot.endTime && (
                                    <><br /><span className="font-normal opacity-70">
                                      {format(new Date(slot.endTime), "hh:mm a")}
                                    </span></>
                                  )}
                                </span>
                                <span className={`text-[10px] mt-1 ${statusColor}`}>
                                  {isMyBooking && <Check className="h-2.5 w-2.5 inline mr-0.5" />}
                                  {statusText}
                                </span>
                              </button>
                            );
                          }) : (
                            <p className="col-span-full text-xs text-gray-400 py-2">No slots for this date.</p>
                          )}
                        </div>
                      </div>
                    )) : (
                      <p className="text-xs text-gray-400 px-1 py-2">No dates configured for this spa.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
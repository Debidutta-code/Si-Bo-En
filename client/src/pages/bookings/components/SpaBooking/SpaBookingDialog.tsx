import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getAvailableSpaForReservation } from "../../../spa/api/spa.api";
import { markSlotAsBooked, markSlotAsAvailable } from "../../../spa/api/spa-slot.api";
import type { IReservation } from "../../types";
import { formatInTimeZone } from "date-fns-tz";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCheck, CalendarCheck } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

interface SpaBookingDialogProps {
  reservation: IReservation;
  onClose: () => void;
}

interface SelectedSlot {
  slotId: string;
  label: string;
  dateLabel: string;
  spaName: string;
}

export default function SpaBookingDialog({ reservation, onClose }: SpaBookingDialogProps) {
  const { t } = useTranslation();

  const [spas, setSpas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selected, setSelected] = useState<SelectedSlot | null>(null);
  const [cancelSlot, setCancelSlot] = useState<SelectedSlot | null>(null);
  const [guestName, setGuestName] = useState(
    `${reservation.primaryGuest?.firstName ?? ""} ${reservation.primaryGuest?.lastName ?? ""}`.trim()
  );

  const guestInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAvailableSpas();
  }, [reservation.bookingCode]);

  useEffect(() => {
    if (selected) {
      setTimeout(() => guestInputRef.current?.focus(), 50);
    }
  }, [selected]);

  const fetchAvailableSpas = async () => {
    setLoading(true);
    try {
      const res = await getAvailableSpaForReservation(reservation.bookingCode);
      if (res.success && res.data) {
        setSpas(res.data);
      } else {
        toast.error(res.message || t("Bookings.SpaBookingDialog.toast.fetchFailed"));
      }
    } catch {
      toast.error(t("Bookings.SpaBookingDialog.toast.fetchFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSlot = (slot: any, spaDate: any, spaName: string) => {
    const startLabel = formatInTimeZone(slot.startTime, "UTC", "hh:mm a");
    const endLabel = slot.endTime
      ? ` – ${formatInTimeZone(slot.endTime, "UTC", "hh:mm a")}`
      : "";
    const label = `${startLabel}${endLabel}`;
    const dateLabel = formatInTimeZone(spaDate.date, "UTC", "EEEE, MMM do, yyyy");

    if (slot.isBooked) {
      if (slot.reservationId === reservation.id) {
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
    if (!guestName.trim()) {
      toast.error(t("Bookings.SpaBookingDialog.toast.guestNameRequired"));
      guestInputRef.current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const payload = { reservationId: reservation.id, userName: guestName.trim() };
      const res = await markSlotAsBooked(selected.slotId, payload);
      if (res.success) {
        toast.success(t("Bookings.SpaBookingDialog.toast.bookSuccess"));
        setSelected(null);
        fetchAvailableSpas();
      } else {
        toast.error(res.message || t("Bookings.SpaBookingDialog.toast.bookFailed"));
      }
    } catch {
      toast.error(t("Bookings.SpaBookingDialog.toast.bookFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelSlot) return;
    setSubmitting(true);
    try {
      const res = await markSlotAsAvailable(cancelSlot.slotId);
      if (res.success) {
        toast.success(t("Bookings.SpaBookingDialog.toast.cancelSuccess"));
        setCancelSlot(null);
        fetchAvailableSpas();
      } else {
        toast.error(res.message || t("Bookings.SpaBookingDialog.toast.cancelFailed"));
      }
    } catch {
      toast.error(t("Bookings.SpaBookingDialog.toast.cancelFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t("Bookings.SpaBookingDialog.title", { firstName: reservation.primaryGuest?.firstName })}
          </DialogTitle>
        </DialogHeader>

        {/* ── Guest name confirmation panel ── */}
        {selected && (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2 text-primary font-semibold">
              <CalendarCheck className="h-4 w-4" />
              <span>{t("Bookings.SpaBookingDialog.confirmPanel.heading")}</span>
            </div>

            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{selected.spaName}</span>
              {" · "}
              {selected.dateLabel}
              {" · "}
              <span className="font-medium text-foreground">{selected.label}</span>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="spa-guest-name" className="flex items-center gap-1.5 text-sm">
                <UserCheck className="h-3.5 w-3.5" />
                {t("Bookings.SpaBookingDialog.confirmPanel.guestNameLabel")}
              </Label>
              <Input
                id="spa-guest-name"
                ref={guestInputRef}
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleConfirmBooking(); }}
                placeholder={t("Bookings.SpaBookingDialog.confirmPanel.guestNamePlaceholder")}
                className="h-9"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                onClick={handleConfirmBooking}
                disabled={submitting || !guestName.trim()}
                className="flex-1"
              >
                {submitting ? t("Bookings.SpaBookingDialog.confirmPanel.confirmingButton") : t("Bookings.SpaBookingDialog.confirmPanel.confirmButton")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelected(null)}
                disabled={submitting}
              >
                {t("Bookings.SpaBookingDialog.confirmPanel.cancelButton")}
              </Button>
            </div>
          </div>
        )}

        {/* ── Cancel booking confirmation panel ── */}
        {cancelSlot && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2 text-destructive font-semibold">
              <CalendarCheck className="h-4 w-4" />
              <span>{t("Bookings.SpaBookingDialog.cancelPanel.heading")}</span>
            </div>

            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{cancelSlot.spaName}</span>
              {" · "}
              {cancelSlot.dateLabel}
              {" · "}
              <span className="font-medium text-foreground">{cancelSlot.label}</span>
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                variant="destructive"
                onClick={handleCancelBooking}
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? t("Bookings.SpaBookingDialog.cancelPanel.confirmingButton") : t("Bookings.SpaBookingDialog.cancelPanel.confirmButton")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCancelSlot(null)}
                disabled={submitting}
              >
                {t("Bookings.SpaBookingDialog.cancelPanel.keepButton")}
              </Button>
            </div>
          </div>
        )}

        {/* ── Spa / slot grid ── */}
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : spas.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {t("Bookings.SpaBookingDialog.empty.noSpas")}
          </div>
        ) : (
          <div className="space-y-8">
            {spas.map((spa) => (
              <div key={spa.id} className="border border-border rounded-lg p-4 bg-muted/20">
                <h3 className="text-xl font-semibold mb-2">{spa.name}</h3>
                {spa.description && (
                  <p className="text-sm text-muted-foreground mb-4">{spa.description}</p>
                )}

                <div className="space-y-4">
                  {spa.SpaDates && spa.SpaDates.length > 0 ? (
                    spa.SpaDates.map((spaDate: any) => (
                      <div
                        key={spaDate.id}
                        className="bg-card rounded-md shadow-sm border border-border overflow-hidden"
                      >
                        <div className="bg-muted px-4 py-2 border-b border-border font-medium flex justify-between items-center">
                          <span>
                            {formatInTimeZone(spaDate.date, "UTC", "EEEE, MMM do, yyyy")}
                          </span>
                        </div>

                        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                          {spaDate.Slots && spaDate.Slots.length > 0 ? (
                            spaDate.Slots.map((slot: any) => {
                              const isSelected = selected?.slotId === slot.id;
                              const isMyBooking = slot.isBooked && slot.reservationId === reservation.id;

                              return (
                                <button
                                  key={slot.id}
                                  type="button"
                                  disabled={submitting || (slot.isBooked && !isMyBooking)}
                                  onClick={() => handleSelectSlot(slot, spaDate, spa.name)}
                                  className={[
                                    "h-auto flex flex-col items-center justify-center rounded-md p-2 text-xs border transition-all",
                                    isMyBooking
                                      ? "bg-green-100 text-green-800 border-green-300 hover:bg-green-200 cursor-pointer"
                                      : slot.isBooked
                                        ? "bg-muted text-muted-foreground opacity-70 cursor-not-allowed border-dashed"
                                        : isSelected
                                          ? "bg-primary text-primary-foreground border-primary ring-2 ring-primary ring-offset-1 shadow-md"
                                          : "bg-primary/10 hover:bg-primary/20 text-primary border-primary/30 cursor-pointer",
                                  ].join(" ")}
                                >
                                  <span className="font-semibold block mb-1">
                                    {formatInTimeZone(slot.startTime, "UTC", "hh:mm a")}
                                    {slot.endTime &&
                                      ` – ${formatInTimeZone(slot.endTime, "UTC", "hh:mm a")}`}
                                  </span>
                                  {isMyBooking ? (
                                    <span className="text-[10px] text-green-700 font-medium">
                                      {t("Bookings.SpaBookingDialog.slots.yourBooking")}
                                    </span>
                                  ) : slot.isBooked ? (
                                    <span className="text-[10px] text-red-500 font-medium">
                                      {t("Bookings.SpaBookingDialog.slots.booked")}
                                    </span>
                                  ) : isSelected ? (
                                    <span className="text-[10px] font-medium">{t("Bookings.SpaBookingDialog.slots.selected")}</span>
                                  ) : (
                                    <span className="text-[10px] opacity-80">{t("Bookings.SpaBookingDialog.slots.available")}</span>
                                  )}
                                </button>
                              );
                            })
                          ) : (
                            <p className="col-span-full text-sm text-muted-foreground">
                              {t("Bookings.SpaBookingDialog.empty.noSlots")}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {t("Bookings.SpaBookingDialog.empty.noDates")}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
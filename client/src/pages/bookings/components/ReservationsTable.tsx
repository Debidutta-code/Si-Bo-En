"use client";

import { useState } from "react";
import {
  MoreVertical,
  Eye,
  Edit,
  XCircle,
  AlertTriangle,
  EyeOff,
  FileText,
  VenetianMask,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { IReservation } from "../types";
import ReservationCard from "./ReservationCard";
import NoShowConfirmationModal from "./NoShowModal";
import { downloadBookingVoucher } from "../api/reservation.api";
import toast from "react-hot-toast";
import AmendReservationModal from "./Amendreservationmodal";
// import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import SpaBookingDialog from "./SpaBooking/SpaBookingDialog";
import { useTranslation } from "react-i18next";


interface ViewDetailsModalProps {
  reservation: IReservation | null;
  onClose: () => void;
  onAmend: (reservation: IReservation) => void;
  onCancel: (reservation: IReservation) => void;
}

function ViewDetailsModal({ reservation, onClose, onAmend, onCancel }: ViewDetailsModalProps) {
  if (!reservation) return null;
  return (
    <Dialog open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-5xl w-full p-0 gap-0 max-h-[90vh] overflow-y-auto [&>button]:hidden">
        <div className="p-6">
          <ReservationCard
            reservation={reservation}
            onAmend={() => { onClose(); onAmend(reservation); }}
            onCancel={() => { onClose(); onCancel(reservation); }}
            onClose={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}


interface CancelConfirmationModalProps {
  reservation: IReservation;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

function CancelConfirmationModal({
  reservation,
  onConfirm,
  onCancel,
  isLoading,
}: CancelConfirmationModalProps) {
    const { t } = useTranslation();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg shadow-xl max-w-md w-full border border-border">
        <div className="p-6">
          <div className="flex flex-col items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                {t('Bookings.cancelConfirm.title')}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t('Bookings.cancelConfirm.message')}
              </p>
              <div className="bg-muted rounded-md p-3 mb-4">
                <div className="text-sm space-y-1">
                  <p className="font-medium text-card-foreground">
                    {t('Bookings.cancelConfirm.bookingCode')}: {reservation.bookingCode}
                  </p>
                  <p className="text-muted-foreground">
                     {t('Bookings.cancelConfirm.guest')}: {reservation.primaryGuest?.firstName}{" "}
                    {reservation.primaryGuest?.lastName}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('Bookings.cancelConfirm.actionNote')}
              </p>
            </div>
          </div>
        </div>
        <div className="border-t border-border p-4 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-card-foreground border border-border rounded-md hover:bg-accent transition-colors disabled:opacity-50"
          >
            {t('Bookings.cancelConfirm.cancelBtn')}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors disabled:opacity-50"
          >
            {isLoading ? t('Bookings.cancelConfirm.cancelling') : t('Bookings.cancelConfirm.confirmBtn')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Table ───────────────────────────────────────────────────────────────

interface ReservationsTableProps {
  reservations: IReservation[];
  onCancel: (reservationId: string) => Promise<void>;
  onNoShow: (reservationId: string) => Promise<void>;
}

type DialogType = "view" | "amend" | "cancel" | "noShow" | "spaBooking" | null;

export default function ReservationsTable({
  reservations,
  onCancel,
  onNoShow,
}: ReservationsTableProps) {
  const {t}= useTranslation();
  const [selectedReservation, setSelectedReservation] = useState<IReservation | null>(null);
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isMarkingNoShow, setIsMarkingNoShow] = useState(false);

  const openDialog = (type: DialogType, reservation: IReservation) => {
    setSelectedReservation(reservation);
    setActiveDialog(type);
  };

  const closeDialog = () => {
    setSelectedReservation(null);
    setActiveDialog(null);
  };

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleConfirmCancel = async () => {
    if (!selectedReservation) return;
    setIsCancelling(true);
    try {
      await onCancel(selectedReservation.id);
      closeDialog();
    } catch (error) {
      console.error("Failed to cancel reservation:", error);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleConfirmNoShow = async () => {
    if (!selectedReservation) return;
    setIsMarkingNoShow(true);
    try {
      await onNoShow(selectedReservation.id);
      closeDialog();
    } catch (error) {
      console.error("Failed to mark reservation as no-show:", error);
    } finally {
      setIsMarkingNoShow(false);
    }
  };

  const handleDownloadVoucher = async (bookingCode: string) => {
    try {
      const response = await downloadBookingVoucher(bookingCode);
      if (!response.success) {
        toast.error(response.message || t('Bookings.toast.failedToDownloadVoucher'));
      }
    } catch {
      toast.error(t('Bookings.toast.failedToDownloadVoucher'));
    }
  };

  // ─── Formatting ────────────────────────────────────────────────────────────

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatStatusLabel = (status: string) =>
    status?.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      confirmed: "bg-green-100 text-green-800",
      reserved: "bg-blue-100 text-blue-800",
      pending: "bg-yellow-100 text-yellow-800",
      cancelled: "bg-red-100 text-red-800",
      modified: "bg-purple-100 text-purple-800",
      no_show: "bg-red-100 text-red-800",
    };
    return (
      <span className={`inline-flex px-1 py-0 text-[10px] font-medium rounded  ${variants[status] || "bg-muted text-muted-foreground"}`}>
        {formatStatusLabel(status)}
      </span>
    );
  };
  const getNoOfRooms = (reservation: IReservation) => {
    const uniqueRoomNumbersSize = new Set(
      reservation.PricingBrakeDown?.DailyPriceBrakeDown
        ?.map((item: any) => item.roomNumber)
        .filter(Boolean) || []
    ).size || 1;
    return uniqueRoomNumbersSize;
  };


  return (
    <>
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[12px]">{t('Bookings.table.bookingCode')}</TableHead>
              <TableHead className="text-[12px]">{t('Bookings.table.guest')}</TableHead>
              <TableHead className="text-[12px]">{t('Bookings.table.rooms')}</TableHead>
              <TableHead className="text-[12px]">{t('Bookings.table.checkIn')}</TableHead>
              <TableHead className="text-[12px]">{t('Bookings.table.checkOut')}</TableHead>
              <TableHead className="text-[12px]">{t('Bookings.table.status')}</TableHead>
              <TableHead className="text-[12px]">{t('Bookings.table.source')}</TableHead>
              <TableHead className="text-[12px]">{t('Bookings.table.inclTax')}</TableHead>
              <TableHead className="text-[12px]">{t('Bookings.table.exclTax')}</TableHead>
              <TableHead className="text-right text-[12px]">{t('Bookings.table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservations.map((reservation) => (
              <TableRow key={reservation.id}>
                <TableCell className="font-medium">
                  {reservation.bookingCode.split("-")[1]}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-card-foreground">
                      {reservation.primaryGuest?.firstName}{" "}
                      {reservation.primaryGuest?.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {reservation.bookingUserEmail}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M9 3v18" />
                    </svg>
                    <span>{getNoOfRooms(reservation)}</span>
                  </div>
                </TableCell>
                <TableCell>{formatDate(reservation.reservationStartDate)}</TableCell>
                <TableCell>{formatDate(reservation.reservationEndDate)}</TableCell>
                <TableCell>{getStatusBadge(reservation.bookingStatus)}</TableCell>
                <TableCell className="uppercase text-[12px]">{reservation.bookingSource}</TableCell>
                <TableCell>{reservation.PricingBrakeDown?.totalAmount?.toFixed(2) ?? reservation.amount?.toFixed(2) ?? "—"}</TableCell>
                <TableCell>
                  {((reservation.PricingBrakeDown?.totalAmount ?? reservation.amount ?? 0) - (reservation.PricingBrakeDown?.taxedAmount ?? 0)).toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>

                    <DropdownMenuTrigger asChild>
                      <button className="p-2 hover:bg-accent rounded-md transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                     <DropdownMenuItem onClick={() => openDialog("view", reservation)} className="cursor-pointer">
                        <Eye className="w-4 h-4 mr-3" />
                        {t('Bookings.table.viewDetails')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openDialog("spaBooking", reservation)} className="cursor-pointer">
                        <VenetianMask className="w-4 h-4 mr-3" />
                        {t('Bookings.table.addSpa')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownloadVoucher(reservation.bookingCode)} className="cursor-pointer">
                        <FileText className="w-4 h-4 mr-3" />
                        {t('Bookings.table.downloadVoucher')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openDialog("amend", reservation)} className="cursor-pointer">
                        <Edit className="w-4 h-4 mr-3" />
                        {t('Bookings.table.amend')}
                      </DropdownMenuItem>
                      {!["cancelled", "no_show"].includes(reservation.bookingStatus) && (
                        <DropdownMenuItem onClick={() => openDialog("noShow", reservation)} className="cursor-pointer text-destructive focus:text-destructive">
                          <EyeOff className="w-4 h-4 mr-3" />
                          {t('Bookings.table.noShow')}
                        </DropdownMenuItem>
                      )}
                      {!["cancelled", "no_show"].includes(reservation.bookingStatus) && (
                        <DropdownMenuItem onClick={() => openDialog("cancel", reservation)} className="cursor-pointer text-destructive focus:text-destructive">
                          <XCircle className="w-4 h-4 mr-3" />
                          {t('Bookings.table.cancel')}
                        </DropdownMenuItem>
                      )}
                      {/* {
                        reservation.bookingStatus === "checked_in" && (
                          <>
                            <Button>
                              Checked in Details
                            </Button>
                          </>
                        )
                      } */}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* View Details */}
      {activeDialog === "view" && (
        <ViewDetailsModal
          reservation={selectedReservation}
          onClose={closeDialog}
          onAmend={(r) => openDialog("amend", r)}
          onCancel={(r) => openDialog("cancel", r)}
        />
      )}

      {/* Cancel */}
      {activeDialog === "cancel" && selectedReservation && (
        <CancelConfirmationModal
          reservation={selectedReservation}
          onConfirm={handleConfirmCancel}
          onCancel={closeDialog}
          isLoading={isCancelling}
        />
      )}

      {/* No Show */}
      {activeDialog === "noShow" && selectedReservation && (
        <NoShowConfirmationModal
          reservation={selectedReservation}
          onConfirm={handleConfirmNoShow}
          onCancel={closeDialog}
          isLoading={isMarkingNoShow}
        />
      )}

      {/* Amend */}
      {activeDialog === "amend" && selectedReservation && (
        <AmendReservationModal
          open={true}
          reservation={selectedReservation}
          onClose={closeDialog}
          onSuccess={closeDialog}
        />
      )}

      {/* Spa Booking */}
      {activeDialog === "spaBooking" && selectedReservation && (
        <SpaBookingDialog
          reservation={selectedReservation}
          onClose={closeDialog}
        />
      )}
    </>
  );
}
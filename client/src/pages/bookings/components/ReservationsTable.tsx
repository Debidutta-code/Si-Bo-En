import { useState } from "react";
import {
  MoreVertical,
  Eye,
  Edit,
  XCircle,
  X,
  AlertTriangle,
  EyeOff,
  FileText,
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
import {
  // downloadBookingInvoice,
  downloadBookingVoucher,
} from "../api/reservation.api";
import toast from "react-hot-toast";
import AmendReservationModal from "./Amendreservationmodal";

// Modal to show ReservationCard
interface ViewDetailsModalProps {
  reservation: IReservation | null;
  onClose: () => void;
}

function ViewDetailsModal({ reservation, onClose }: ViewDetailsModalProps) {
  if (!reservation) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-card rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto relative my-8">
        <button
          onClick={onClose}
          className="sticky top-4 float-right mr-4 mt-4 p-2 hover:bg-accent rounded-md transition-colors z-10 bg-card border border-border"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="p-6 pt-0">
          <ReservationCard reservation={reservation} />
        </div>
      </div>
    </div>
  );
}

// Cancel Confirmation Modal
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
                Cancel Reservation
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Are you sure you want to cancel this reservation?
              </p>
              <div className="bg-muted rounded-md p-3 mb-4">
                <div className="text-sm space-y-1">
                  <p className="font-medium text-card-foreground">
                    Booking Code: {reservation.bookingCode}
                  </p>
                  <p className="text-muted-foreground">
                    Guest: {reservation.primaryGuest?.firstName}{" "}
                    {reservation.primaryGuest?.lastName}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                This action cannot be undone. The guest will be notified of the
                cancellation.
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
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Cancelling..." : "Yes, Cancel Reservation"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Reservations Table Component
interface ReservationsTableProps {
  reservations: IReservation[];
  onCancel: (reservationId: string) => Promise<void>;
  onNoShow: (reservationId: string) => Promise<void>;
}

export default function ReservationsTable({
  reservations,
  onCancel,
  onNoShow,
}: ReservationsTableProps) {
  const [selectedReservation, setSelectedReservation] = useState<IReservation | null>(null);
  const [dialogOpen, setDialogOpen] = useState<{
    cancelDialog: boolean;
    noShowDialog: boolean;
    amendDialog: boolean;
  }>({
    cancelDialog: false,
    noShowDialog: false,
    amendDialog: false
  });
  // const [reservationToCancel, setReservationToCancel] = useState<IReservation | null>(null);
  // const [reservationToAmend, setReservationToAmend] = useState<IReservation | null>(null);
  // const [reservationToNoShow, setReservationToNoShow] = useState<IReservation | null>(null);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const [isMarkingNoShow, setIsMarkingNoShow] = useState<boolean>(false);
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };
  const formatStatusLabel = (status: string) => {
    return status
      ?.toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || "";
    const variants: Record<string, string> = {
      confirmed: "bg-green-100 text-green-800",
      reserved: "bg-blue-100 text-blue-800",
      pending: "bg-yellow-100 text-yellow-800",
      cancelled: "bg-red-100 text-red-800",
      modified: "bg-purple-100 text-purple-800",
      no_show: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`inline-flex px-1 py-0 text-[10px] font-medium rounded uppercase ${variants[statusLower] || "bg-muted text-muted-foreground"
          }`}
      >
        {formatStatusLabel(status)}
      </span>
    );
  };

  const calculateRooms = (reservation: IReservation) => {
    return (
      reservation.finalPrice?.requestedRooms ??
      reservation.priceBreakdowns?.[0]?.requestedRooms ??
      1
    );
  };

  // const handleViewDetails = (reservation: IReservation) => {
  //   setSelectedReservation(reservation);
  // };

  // const handleAmendClick = (reservation: IReservation) => {
  //   setReservationToAmend(reservation);
  // };

  // const handleCancelClick = (reservation: IReservation) => {
  //   setReservationToCancel(reservation);
  // };

  const handleConfirmCancel = async () => {
    if (!selectedReservation) return;

    setIsCancelling(true);
    try {
      await onCancel(selectedReservation.id);
      setSelectedReservation(null);
    } catch (error) {
      console.error("Failed to cancel reservation:", error);
    } finally {
      setIsCancelling(false);
    }
  };

  // const handleNoShowClick = (reservation: IReservation) => {
  //   setReservationToNoShow(reservation);
  // };

  const handleConfirmNoShow = async () => {
    if (!selectedReservation) return;

    setIsMarkingNoShow(true);
    try {
      await onNoShow(selectedReservation.id);
      setSelectedReservation(null);
    } catch (error) {
      console.error("Failed to mark reservation as no-show:", error);
    } finally {
      setIsMarkingNoShow(false);
    }
  };
  // Add these functions inside your ReservationsTable component
  const handleDownloadVoucher = async (bookingCode: string) => {
    try {
      const response = await downloadBookingVoucher(bookingCode);
      if (!response.success) {
        toast.error(response.message || "Failed to download voucher");
      }
    } catch (error) {
      toast.error("Failed to download voucher");
    }
  };

  // const handleDownloadInvoice = async (bookingCode: string) => {
  //   try {
  //     const response = await downloadBookingInvoice(bookingCode);
  //     if (!response.success) {
  //       toast.error(response.message || "Failed to download invoice");
  //     }
  //   } catch (error) {
  //     toast.error("Failed to download invoice");
  //   }
  // };
  return (
    <>
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[12px]">Booking Code</TableHead>
              <TableHead className="text-[12px]">Guest</TableHead>
              <TableHead className="text-[12px]">Rooms</TableHead>
              <TableHead className="text-[12px]">Check-in</TableHead>
              <TableHead className="text-[12px]">Check-out</TableHead>
              <TableHead className="text-[12px]">Status</TableHead>
              <TableHead className="text-[12px]">Source</TableHead>
              <TableHead className="text-[12px]">Incl. Tax</TableHead>
              <TableHead className="text-[12px]">Excl. Tax</TableHead>
              <TableHead className="text-right text-[12px]">Actions</TableHead>
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
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-muted-foreground"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M9 3v18" />
                    </svg>
                    <span>{calculateRooms(reservation)}</span>
                  </div>
                </TableCell>
                <TableCell>{formatDate(reservation.checkInDate)}</TableCell>
                <TableCell>{formatDate(reservation.checkOutDate)}</TableCell>
                <TableCell>
                  {getStatusBadge(reservation.bookingStatus)}
                </TableCell>
                <TableCell className="uppercase text-[12px]">
                  {reservation.bookingSource}
                </TableCell>
                <TableCell>
                  {" "}
                  {reservation.finalPrice?.totalAmount?.toFixed(2) ?? "—"}
                </TableCell>
                <TableCell>
                  {((reservation.finalPrice?.totalAmount ?? 0) -
                    (reservation.finalPrice?.totalTaxAmount ?? 0)
                  ).toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-2 hover:bg-accent rounded-md transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={() => setSelectedReservation(reservation)}
                        className="cursor-pointer"
                      >
                        <Eye className="w-4 h-4 mr-3" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleDownloadVoucher(reservation.bookingCode)
                        }
                        className="cursor-pointer"
                      >
                        <FileText className="w-4 h-4 mr-3" />
                        Download Voucher
                      </DropdownMenuItem>
                      {/* <DropdownMenuItem
    onClick={() => handleDownloadInvoice(reservation.bookingCode)}
    className="cursor-pointer"
  >
    <FileDown className="w-4 h-4 mr-3" />
    Download Invoice
  </DropdownMenuItem> */}
                      <DropdownMenuItem
                        onClick={() => setSelectedReservation(reservation)}
                        className="cursor-pointer"
                      >
                        <Edit className="w-4 h-4 mr-3" />
                        Amend
                      </DropdownMenuItem>
                      {!["cancelled", "no_show"].includes(
                        reservation.bookingStatus,
                      ) && (
                          <DropdownMenuItem
                            onClick={() => setSelectedReservation(reservation)}
                            className="cursor-pointer text-destructive focus:text-destructive"
                          >
                            <EyeOff className="w-4 h-4 mr-3" />
                            No Show
                          </DropdownMenuItem>
                        )}
                      {!["cancelled", "no_show"].includes(
                        reservation.bookingStatus,
                      ) && (
                          <DropdownMenuItem
                            onClick={() => setSelectedReservation(reservation)}
                            className="cursor-pointer text-destructive focus:text-destructive"
                          >
                            <XCircle className="w-4 h-4 mr-3" />
                            Cancel
                          </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* View Details Modal */}
      {selectedReservation && (
        <ViewDetailsModal
          reservation={selectedReservation}
          onClose={() => setSelectedReservation(null)}
        />
      )}

      {/* Cancel Confirmation Modal */}
      {selectedReservation && (
        <CancelConfirmationModal
          reservation={selectedReservation}
          onConfirm={handleConfirmCancel}
          onCancel={() => setSelectedReservation(null)}
          isLoading={isCancelling}
        />
      )}
      {selectedReservation && (
        <NoShowConfirmationModal
          open={dialogOpen.noShowDialog}
          reservation={selectedReservation}
          onConfirm={handleConfirmNoShow}
          onCancel={() => setSelectedReservation(null)}
          isLoading={isMarkingNoShow}
        />
      )}
      {selectedReservation && (
        <AmendReservationModal
          open={dialogOpen.amendDialog}
          reservation={selectedReservation}
          onClose={() => setSelectedReservation(null)}
          onSuccess={() => {
            setSelectedReservation(null);
          }}
        />
      )}
    </>
  );
}

import { AlertTriangle } from "lucide-react";
import type { IReservation } from "../types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface NoShowConfirmationModalProps {
  open: boolean;
  reservation: IReservation;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

function NoShowConfirmationModal({
  open,
  reservation,
  onConfirm,
  onCancel,
  isLoading,
}: NoShowConfirmationModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onCancel(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <DialogTitle className="text-lg font-semibold">
              Mark as No-Show
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            Are you sure you want to mark this reservation as no-show?
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted rounded-md p-3">
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
          This action will mark the guest as not having arrived.
        </p>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Marking..." : "Yes, Mark as No-Show"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
export default NoShowConfirmationModal;
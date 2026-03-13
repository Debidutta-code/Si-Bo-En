import { AlertTriangle } from "lucide-react";
import type { IReservation } from "../types";

interface NoShowConfirmationModalProps {
  reservation: IReservation;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

function NoShowConfirmationModal({
  reservation,
  onConfirm,
  onCancel,
  isLoading
}: NoShowConfirmationModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg shadow-xl max-w-md w-full border border-border">
        <div className="p-6">
          <div className="flex flex-col  items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-warning" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                Mark as No-Show
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Are you sure you want to mark this reservation as no-show?
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
                This action will mark the guest as not having arrived.
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
            className="px-4 py-2 text-sm bg-primary hover:bg-primary/90 text-primary-foreground font-medium bg-warning text-warning-foreground rounded-md hover:bg-warning/90 transition-colors bg-tripswift-blue disabled:opacity-50"
          >
            {isLoading ? "Marking..." : "Yes, Mark as No-Show"}
          </button>
        </div>
      </div>
    </div>
  );
}
export default NoShowConfirmationModal;
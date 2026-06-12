interface DeleteConfirmDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  showDateRange?: boolean;
  startDate?: string;
  endDate?: string;
  onStartDateChange?: (date: string) => void;
  onEndDateChange?: (date: string) => void;
}
import { useTranslation } from "react-i18next";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { RatePlan } from "@/pages/tax-system/interface";

export default function DeleteConfirmDialog({
  title,
  message,
  onConfirm,
  onCancel,
  isLoading = false,
  showDateRange = false,
  startDate = "",
  endDate = "",
  onStartDateChange,
  onEndDateChange,
  ratePlans,
  selectedRatePlanId,
  onRatePlanChange,
}: DeleteConfirmDialogProps & {
  ratePlans?: RatePlan[];
  selectedRatePlanId?: string;
  onRatePlanChange?: (id: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>

        {(showDateRange || ratePlans) && (
          <div className="grid grid-cols-1 gap-4 py-4">
            {ratePlans && (
              <div className="space-y-2">
                <Label>Rate Plan</Label>
                <select
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  value={selectedRatePlanId || ""}
                  onChange={(e) => onRatePlanChange?.(e.target.value)}
                >
                  <option value="">Select a Rate Plan</option>
                  {ratePlans.map((rp) => (
                    <option key={rp.id} value={rp.id}>
                      {rp._translations?.ratePlanName ?? rp.ratePlanName}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {showDateRange && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  {t("BookingOffsetForm.formModal.startDate")}
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => onStartDateChange?.(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  {t("BookingOffsetForm.formModal.endDate")}
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => onEndDateChange?.(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            {t("BookingOffsetForm.formModal.cancel")}
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? t("BookingOffsetForm.formModal.deleting") : t("BookingOffsetForm.formModal.delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

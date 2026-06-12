import { useState, useEffect } from "react";
import type { ICBookingOffsetS } from "../interfaces";
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
import { useTranslation } from "react-i18next";

const OFFSET_FIELDS: { key: keyof ICBookingOffsetS; label: string }[] = [
  { key: "minimumAdvanceBookingOffset", label: "Min Advance" },
  { key: "maximumAdvanceBookingOffset", label: "Max Advance" },
  { key: "minimumAmendBookingOffset", label: "Min Amend" },
  { key: "maximumAmendBookingOffset", label: "Max Amend" },
  { key: "minimumCancelBookingOffset", label: "Min Cancel" },
  { key: "maximumCancelBookingOffset", label: "Max Cancel" },
];

type Unit = "hours" | "days";
type UnitsMap = Record<keyof ICBookingOffsetS, Unit>;

const getInitialUnits = (form: ICBookingOffsetS): UnitsMap => {
  const units = {} as UnitsMap;
  for (const field of OFFSET_FIELDS) {
    const val = form[field.key];
    units[field.key] =
      val !== null && val >= 24 && val % 24 === 0 ? "days" : "hours";
  }
  return units;
};

const toDisplay = (hours: number | null, unit: Unit): string => {
  if (hours === null) return "";
  return unit === "days" ? String(hours / 24) : String(hours);
};

const toHours = (displayVal: number, unit: Unit): number => {
  return unit === "days" ? displayVal * 24 : displayVal;
};

interface OffsetFormModalProps {
  title: string;
  subtitle?: string;
  form: ICBookingOffsetS;
  onFormChange: (form: ICBookingOffsetS) => void;
  onSubmit: () => void;
  onClose: () => void;
  submitLabel?: string;
  showDateRange?: boolean;
  startDate?: string;
  endDate?: string;
  onStartDateChange?: (date: string) => void;
  onEndDateChange?: (date: string) => void;
  ratePlans?: RatePlan[];
  selectedRatePlanId?: string;
  onRatePlanChange?: (id: string) => void;
}

export default function OffsetFormModal({
  title,
  subtitle,
  form,
  onFormChange,
  onSubmit,
  onClose,
  submitLabel = "Save Changes",
  showDateRange = false,
  startDate = "",
  endDate = "",
  onStartDateChange,
  onEndDateChange,
  ratePlans,
  selectedRatePlanId,
  onRatePlanChange,
}: OffsetFormModalProps) {
  const { t } = useTranslation();
  const [units, setUnits] = useState<UnitsMap>(() => getInitialUnits(form));

  useEffect(() => {
    setUnits(getInitialUnits(form));
  }, []);

  const handleUnitChange = (key: keyof ICBookingOffsetS, newUnit: Unit) => {
    setUnits((prev) => ({ ...prev, [key]: newUnit }));
  };

  const handleValueChange = (key: keyof ICBookingOffsetS, rawValue: string) => {
    if (rawValue === "") {
      onFormChange({ ...form, [key]: null });
      return;
    }
    const numVal = Number(rawValue);
    const hours = toHours(numVal, units[key]);
    onFormChange({ ...form, [key]: hours });
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {subtitle && <DialogDescription>{subtitle}</DialogDescription>}
        </DialogHeader>

        <div className="space-y-6 py-4">
          {(showDateRange || ratePlans) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <>
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
                </>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {OFFSET_FIELDS.map((field) => (
              <div key={field.key} className="space-y-2">
                {t(`BookingOffsetForm.formModal.fields.${field.key}`)}
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="0"
                    placeholder="—"
                    value={toDisplay(form[field.key], units[field.key])}
                    onChange={(e) => handleValueChange(field.key, e.target.value)}
                  />
                  <select
                    className="px-3 py-2 bg-background border border-input rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={units[field.key]}
                    onChange={(e) =>
                      handleUnitChange(field.key, e.target.value as Unit)
                    }
                  >
                  <option value="hours">{t("BookingOffsetForm.formModal.units.hours")}</option>
                  <option value="days">{t("BookingOffsetForm.formModal.units.days")}</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("BookingOffsetForm.formModal.cancel")}
          </Button>
          <Button onClick={onSubmit}>{submitLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

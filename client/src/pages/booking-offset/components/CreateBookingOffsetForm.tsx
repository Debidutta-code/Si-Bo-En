import { useState } from "react";
import type { ICBookingOffsetS } from "../interfaces";
import type { RatePlan } from "@/pages/tax-system/interface";
import { createBookingOffsetService } from "../services";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";

interface CreateBookingOffsetFormProps {
  propertyId: string;
  ratePlans: RatePlan[];
  selectedRatePlan: RatePlan | null;
  startDate: string;
  endDate: string;
  onClose: () => void;
  onSuccess: () => void;
}

const OFFSET_FIELDS: { key: keyof ICBookingOffsetS; label: string }[] = [
  { key: "minimumAdvanceBookingOffset", label: "Min Advance Booking Offset" },
  { key: "maximumAdvanceBookingOffset", label: "Max Advance Booking Offset" },
  { key: "minimumAmendBookingOffset", label: "Min Amend Booking Offset" },
  { key: "maximumAmendBookingOffset", label: "Max Amend Booking Offset" },
  { key: "minimumCancelBookingOffset", label: "Min Cancel Booking Offset" },
  { key: "maximumCancelBookingOffset", label: "Max Cancel Booking Offset" },
];

const INITIAL_FORM: ICBookingOffsetS = {
  minimumAdvanceBookingOffset: null,
  maximumAdvanceBookingOffset: null,
  minimumAmendBookingOffset: null,
  maximumAmendBookingOffset: null,
  minimumCancelBookingOffset: null,
  maximumCancelBookingOffset: null,
};

type Unit = "hours" | "days";
type UnitsMap = Record<keyof ICBookingOffsetS, Unit>;

const defaultUnits = (): UnitsMap => {
  const units = {} as UnitsMap;
  for (const field of OFFSET_FIELDS) {
    units[field.key] = "hours";
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

export default function CreateBookingOffsetForm({
  propertyId,
  ratePlans,
  selectedRatePlan,
  startDate,
  endDate,
  onClose,
  onSuccess,
}: CreateBookingOffsetFormProps) {
    const { t } = useTranslation();

  const [form, setForm] = useState<ICBookingOffsetS>({ ...INITIAL_FORM });
  const [units, setUnits] = useState<UnitsMap>(defaultUnits);
  const [ratePlanId, setRatePlanId] = useState(selectedRatePlan?.id || "");
  const [createStartDate, setCreateStartDate] = useState(startDate);
  const [createEndDate, setCreateEndDate] = useState(endDate);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleValueChange = (key: keyof ICBookingOffsetS, rawValue: string) => {
    if (rawValue === "") {
      setForm((prev) => ({ ...prev, [key]: null }));
      return;
    }
    const numVal = Number(rawValue);
    const hours = toHours(numVal, units[key]);
    setForm((prev) => ({ ...prev, [key]: hours }));
  };

  const handleSubmit = async () => {
    if (!ratePlanId) {
      toast.error(t("BookingOffsetForm.toast.selectRatePlan"));
      return;
    }
    if (!createStartDate || !createEndDate) {
      toast.error(t("BookingOffsetForm.toast.selectDates"));
      return;
    }
    if (new Date(createStartDate) > new Date(createEndDate)) {
      toast.error(t("BookingOffsetForm.toast.invalidDateRange"));
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await createBookingOffsetService(
        propertyId,
        ratePlanId,
        createStartDate,
        createEndDate,
        form,
      );
      if (result.success) {
        toast.success(t("BookingOffsetForm.toast.createdSuccess"));
        onSuccess();
      } else {
        toast.error(result.message || t("BookingOffsetForm.toast.failedCreate"));
      }
    } catch (error) {
      toast.error(t("BookingOffsetForm.toast.failedCreate"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
            {t("BookingOffsetForm.title")}
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>              {t("BookingOffsetForm.ratePlan")}
</Label>
              <select
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                value={ratePlanId}
                onChange={(e) => setRatePlanId(e.target.value)}
              >
              <option value="">{t("BookingOffsetForm.selectRatePlan")}</option>
           {ratePlans.map((rp) => (
  <option key={rp.id} value={rp.id}>
    {rp._translations?.ratePlanName ?? rp.ratePlanName}
  </option>
))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>              {t("BookingOffsetForm.startDate")}
</Label>
              <Input
                type="date"
                value={createStartDate}
                onChange={(e) => setCreateStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("BookingOffsetForm.endDate")}</Label>
              <Input
                type="date"
                value={createEndDate}
                onChange={(e) => setCreateEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {OFFSET_FIELDS.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label>                {t(`BookingOffsetForm.fields.${field.key}`)}
</Label>
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
                      setUnits((prev) => ({
                        ...prev,
                        [field.key]: e.target.value as Unit,
                      }))
                    }
                  >
                  <option value="hours">{t("BookingOffsetForm.units.hours")}</option>
                  <option value="days">{t("BookingOffsetForm.units.days")}</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            {t("BookingOffsetForm.buttons.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? t("BookingOffsetForm.buttons.creating") : t("BookingOffsetForm.buttons.create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

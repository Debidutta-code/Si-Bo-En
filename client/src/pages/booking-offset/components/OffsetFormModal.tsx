import { useState, useEffect } from "react";
import type { ICBookingOffsetS } from "../interfaces";
import { X } from "lucide-react";

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
}: OffsetFormModalProps) {
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-4xl w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {subtitle && (
          <p className="text-sm text-muted-foreground mb-4">{subtitle}</p>
        )}
        {showDateRange && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Start Date
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                value={startDate}
                onChange={(e) => onStartDateChange?.(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                End Date
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                value={endDate}
                onChange={(e) => onEndDateChange?.(e.target.value)}
              />
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          {OFFSET_FIELDS.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {field.label}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  value={toDisplay(form[field.key], units[field.key])}
                  onChange={(e) => handleValueChange(field.key, e.target.value)}
                  placeholder="—"
                />
                <select
                  className="px-2 py-2 bg-background border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={units[field.key]}
                  onChange={(e) =>
                    handleUnitChange(field.key, e.target.value as Unit)
                  }
                >
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end space-x-3 pt-4 mt-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

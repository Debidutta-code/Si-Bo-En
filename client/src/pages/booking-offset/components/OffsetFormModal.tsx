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
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-lg w-full mx-4 p-6">
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
              <input
                type="number"
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                value={form[field.key] ?? ""}
                onChange={(e) =>
                  onFormChange({
                    ...form,
                    [field.key]:
                      e.target.value === "" ? null : Number(e.target.value),
                  })
                }
                placeholder="—"
              />
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

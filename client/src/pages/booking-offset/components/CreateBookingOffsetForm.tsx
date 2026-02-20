import { useState } from "react";
import type { ICBookingOffsetS } from "../interfaces";
import type { RatePlan } from "@/pages/tax-system/interface";
import { createBookingOffsetService } from "../services";
import toast from "react-hot-toast";
import { X } from "lucide-react";

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

export default function CreateBookingOffsetForm({
  propertyId,
  ratePlans,
  selectedRatePlan,
  startDate,
  endDate,
  onClose,
  onSuccess,
}: CreateBookingOffsetFormProps) {
  const [form, setForm] = useState<ICBookingOffsetS>({ ...INITIAL_FORM });
  const [ratePlanId, setRatePlanId] = useState(selectedRatePlan?.id || "");
  const [createStartDate, setCreateStartDate] = useState(startDate);
  const [createEndDate, setCreateEndDate] = useState(endDate);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!ratePlanId) {
      toast.error("Please select a rate plan");
      return;
    }
    if (!createStartDate || !createEndDate) {
      toast.error("Please select both start and end dates");
      return;
    }
    if (new Date(createStartDate) > new Date(createEndDate)) {
      toast.error("Start date must be before end date");
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
        toast.success("Booking offsets created successfully!");
        onSuccess();
      } else {
        toast.error(result.message || "Failed to create booking offsets");
      }
    } catch (error) {
      toast.error("Failed to create booking offsets");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            Create Booking Offsets
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent rounded-md transition-colors text-muted-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rate Plan & Date Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Rate Plan
            </label>
            <select
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              value={ratePlanId}
              onChange={(e) => setRatePlanId(e.target.value)}
            >
              <option value="">Select a Rate Plan</option>
              {ratePlans.map((rp) => (
                <option key={rp.id} value={rp.id}>
                  {rp.ratePlanName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Start Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              value={createStartDate}
              onChange={(e) => setCreateStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              End Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              value={createEndDate}
              onChange={(e) => setCreateEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* Offset Fields */}
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
                  setForm((prev) => ({
                    ...prev,
                    [field.key]:
                      e.target.value === "" ? null : Number(e.target.value),
                  }))
                }
                placeholder="—"
              />
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 mt-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Offsets"}
          </button>
        </div>
      </div>
    </div>
  );
}

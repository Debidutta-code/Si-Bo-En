import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import type { RatePlanRule } from "../interfaces/ratePlan.type";
import { createRatePlanRuleService, updateRatePlanRuleService } from "../services";

interface RatePlanRulesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ratePlanId: string;
  ratePlanName: string;
  existingRule?: RatePlanRule | null;
  onSuccess: () => void;
}

interface RatePlanRuleFormData {
  startDate: Date | null;
  endDate: Date | null;
  minLos: number;
  maxLos: number | null;
  discountType: "percentage" | "flat" | null;
  discountValue: number | null;
  isActive: boolean;
}

const DISCOUNT_TYPES = [
  { value: "percentage", label: "Percentage (%)" },
  { value: "flat", label: "Flat Amount" },
];

// Helper function to convert string date to Date object
const parseDate = (dateString?: string | null): Date | null => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

export default function RatePlanRulesDialog({
  open,
  onOpenChange,
  ratePlanId,
  ratePlanName,
  existingRule,
  onSuccess,
}: RatePlanRulesDialogProps) {
  const [formData, setFormData] = useState<RatePlanRuleFormData>({
    startDate: null,
    endDate: null,
    minLos: 1,
    maxLos: null,
    discountType: null,
    discountValue: null,
    isActive: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data when existingRule changes
  useEffect(() => {
    if (existingRule) {
      setFormData({
        startDate: parseDate(existingRule.startDate),
        endDate: parseDate(existingRule.endDate),
        minLos: existingRule.minLos || 1,
        maxLos: existingRule.maxLos || null,
        discountType: existingRule.discountType || null,
        discountValue: existingRule.discountValue ? Number(existingRule.discountValue) : null,
        isActive: existingRule.isActive ?? true,
      });
    } else {
      // Reset form when creating new rule
      setFormData({
        startDate: null,
        endDate: null,
        minLos: 1,
        maxLos: null,
        discountType: null,
        discountValue: null,
        isActive: true,
      });
    }
  }, [existingRule, open]);

  const handleSubmit = async () => {
    // Validation
    if (formData.minLos < 1) {
      toast.error("Minimum LOS must be at least 1");
      return;
    }

    if (formData.maxLos !== null && formData.maxLos < formData.minLos) {
      toast.error("Maximum LOS must be greater than or equal to Minimum LOS");
      return;
    }

    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
      toast.error("End date must be after start date");
      return;
    }

    if (formData.discountType && !formData.discountValue) {
      toast.error("Please enter a discount value");
      return;
    }

    if (formData.discountValue && !formData.discountType) {
      toast.error("Please select a discount type");
      return;
    }

    if (formData.discountType === "percentage" && formData.discountValue && formData.discountValue > 100) {
      toast.error("Percentage discount cannot exceed 100%");
      return;
    }

    if (formData.discountValue && formData.discountValue < 0) {
      toast.error("Discount value cannot be negative");
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare data for API
      const payload = {
        ratePlanId,
        startDate: formData.startDate?.toISOString() || null,
        endDate: formData.endDate?.toISOString() || null,
        minLos: formData.minLos,
        maxLos: formData.maxLos,
        discountType: formData.discountType,
        discountValue: formData.discountValue,
        isActive: formData.isActive,
      };

      // Call API - create if no existing rule, update if exists
      const response = existingRule
        ? await updateRatePlanRuleService(ratePlanId, payload)
        : await createRatePlanRuleService(payload);

      if (response.success) {
        toast.success(
          response.message || 
          (existingRule
            ? "Rate plan rule updated successfully"
            : "Rate plan rule created successfully")
        );
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(response.message || "Failed to save rate plan rule");
      }
    } catch (error) {
      console.error("Error saving rate plan rule:", error);
      toast.error("Failed to save rate plan rule");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {existingRule ? "Edit" : "Add"} Rate Plan Rules
          </DialogTitle>
          <DialogDescription>
            Configure rules for <span className="font-semibold">{ratePlanName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Date Range Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Date Range (Optional)</h3>
            <p className="text-xs text-gray-500">Leave empty for rules that apply year-round</p>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Start Date */}
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`justify-start text-left font-normal ${
                        !formData.startDate && "text-muted-foreground"
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.startDate ? (
                        format(formData.startDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.startDate || undefined}
                      onSelect={(date) =>
                        setFormData({ ...formData, startDate: date || null })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* End Date */}
              <div className="grid gap-2">
                <Label htmlFor="endDate">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`justify-start text-left font-normal ${
                        !formData.endDate && "text-muted-foreground"
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.endDate ? (
                        format(formData.endDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.endDate || undefined}
                      onSelect={(date) =>
                        setFormData({ ...formData, endDate: date || null })
                      }
                      initialFocus
                      disabled={(date) =>
                        formData.startDate ? date < formData.startDate : false
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Length of Stay Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Length of Stay</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Min LOS */}
              <div className="grid gap-2">
                <Label htmlFor="minLos">
                  Minimum LOS <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="minLos"
                  type="number"
                  min="1"
                  value={formData.minLos}
                  onChange={(e) =>
                    setFormData({ ...formData, minLos: parseInt(e.target.value) || 1 })
                  }
                  placeholder="1"
                />
                <p className="text-xs text-gray-500">Must be at least 1 night</p>
              </div>

              {/* Max LOS */}
              <div className="grid gap-2">
                <Label htmlFor="maxLos">Maximum LOS</Label>
                <Input
                  id="maxLos"
                  type="number"
                  min={formData.minLos}
                  value={formData.maxLos || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxLos: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                  placeholder="No limit"
                />
                <p className="text-xs text-gray-500">Leave empty for no limit</p>
              </div>
            </div>
          </div>

          {/* Discount Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Discount (Optional)</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Discount Type */}
              <div className="grid gap-2">
                <Label htmlFor="discountType">Discount Type</Label>
                <Select
                  value={formData.discountType || ""}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      discountType: value as "percentage" | "flat" | null,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {DISCOUNT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Discount Value */}
              <div className="grid gap-2">
                <Label htmlFor="discountValue">Discount Value</Label>
                <Input
                  id="discountValue"
                  type="number"
                  min="0"
                  step="0.01"
                  max={formData.discountType === "percentage" ? "100" : undefined}
                  value={formData.discountValue || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discountValue: e.target.value ? parseFloat(e.target.value) : null,
                    })
                  }
                  placeholder={formData.discountType === "percentage" ? "0-100" : "Amount"}
                  disabled={!formData.discountType}
                />
              </div>
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between space-x-2 pt-2">
            <div className="space-y-0.5">
              <Label htmlFor="isActive">Active Rule</Label>
              <p className="text-xs text-gray-500">
                Enable or disable this rule
              </p>
            </div>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isActive: checked })
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? existingRule
                ? "Updating..."
                : "Creating..."
              : existingRule
              ? "Update Rule"
              : "Create Rule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
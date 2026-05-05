import React, { useState, useEffect } from "react";
import type { RatePlan } from "@/pages/rate-plan/interfaces";
import Loader from "@/components/Loader/Loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  ICRatePlanRule,
  RatePlanRule,
} from "@/pages/rate-plan/interfaces/ratePlan.type";
import type { ILoader } from "@/pages/dashboard/interface";
import type { IMLOScu } from "../interfaces";
import { Label } from "@/components/ui/label";
import type { CurrencyCode } from "@/components/currency-code/currency-code.type";
import { currencies } from "@/components/currency-code/cuurency";

interface MLOSRuleFormProps {
  ratePlans: RatePlan[];
  onSubmit: (payload: ICRatePlanRule) => Promise<void>;
  onCancel: () => void;
  editData?:
  | (RatePlanRule & {
    ratePlan?: { ratePlanName: string; ratePlanCode: string };
  })
  | null;
  isLoading: ILoader;
}

const MLOSRuleForm: React.FC<MLOSRuleFormProps> = ({
  ratePlans,
  onSubmit,
  onCancel,
  editData,
  isLoading,
}) => {
  const [mlos, setMlos] = useState<IMLOScu>({
    selectedRatePlan: "",
    startDate: "",
    endDate: "",
    minLos: "1",
    maxLos: "",
    discountType: "percentage",
    discountValue: 0,
    isActive: true,
    isAutoApplied: false,
    currencyCode: "USD",
  });
  useEffect(() => {
    if (editData) {
      setMlos({
        selectedRatePlan: editData.ratePlanId,
        startDate: editData.startDate ? new Date(editData.startDate).toISOString().split("T")[0] : "",
        endDate: editData.endDate ? new Date(editData.endDate).toISOString().split("T")[0] : "",
        minLos: editData.minLos.toString(),
        maxLos: editData.maxLos?.toString() || "",
        discountType: editData.discountType || "percentage",
        discountValue: editData.discountValue || 0,
        isActive: editData.isActive,
        isAutoApplied: editData.isAutoApplied,
        currencyCode: editData.currencyCode
      })
    }
  }, [editData]);

  // Get available rate plans (those without rules)
  const availableRatePlans = ratePlans.filter(
    (rp) => !rp.ratePlanRules || editData?.ratePlanId === rp.id,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: ICRatePlanRule = {
      ratePlanId: mlos.selectedRatePlan,
      startDate: mlos.startDate,
      endDate: mlos.endDate,
      minLos: parseInt(mlos.minLos),
      maxLos: mlos.maxLos ? parseInt(mlos.maxLos) : null,
      discountType: mlos.discountType,
      discountValue: mlos.discountValue || null,
      isActive: mlos.isActive,
      isAutoApplied: mlos.isAutoApplied,
      currencyCode: mlos.currencyCode
    };

    await onSubmit(payload);
  };

  if (isLoading.isLoading) {
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
      <Loader text="Processing..." />
    </div>;
  }
  return (
    <>
      <div className="bg-card rounded-lg border border-border shadow-sm relative">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Rate Plan Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-foreground">
              Rate Plan *
            </label>
            {editData ? (
              <div className="px-4 py-2 bg-muted/30 border border-border rounded-md">
                <div className="text-sm font-medium text-foreground">
                  {editData.ratePlan?.ratePlanName}
                </div>
                <div className="text-xs text-muted-foreground">
                  {editData.ratePlan?.ratePlanCode}
                </div>
              </div>
            ) : (
              <Select
                value={mlos.selectedRatePlan}
                onValueChange={(value) => setMlos({ ...mlos, selectedRatePlan: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a rate plan" />
                </SelectTrigger>
                <SelectContent>
                  {availableRatePlans.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      No available rate plans
                    </div>
                  ) : (
                    availableRatePlans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.ratePlanName} ({plan.ratePlanCode})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
            <p className="text-xs text-muted-foreground">
              Only rate plans without existing MLOS rules are shown
            </p>
          </div>

          {/* Date Range */}
          <div className="space-y-4 p-4 bg-muted/20 rounded-lg border border-border">
            <h3 className="text-sm font-semibold text-foreground">
              Date Range (Optional)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={mlos.startDate}
                  onChange={(e) => setMlos({ ...mlos, startDate: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={mlos.endDate}
                  onChange={(e) => setMlos({ ...mlos, endDate: e.target.value })}
                  min={mlos.startDate}
                  className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                />
              </div>
            </div>
          </div>

          {/* Length of Stay */}
          <div className="space-y-4 p-4 bg-muted/20 rounded-lg border border-border">
            <h3 className="text-sm font-semibold text-foreground">
              Length of Stay Requirements
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Minimum LOS (nights) *
                </label>
                <input
                  type="number"
                  value={mlos.minLos}
                  onChange={(e) => setMlos({ ...mlos, minLos: e.target.value })}
                  min="1"
                  className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Maximum LOS (nights)
                </label>
                <input
                  type="number"
                  value={mlos.maxLos}
                  onChange={(e) => setMlos({ ...mlos, maxLos: e.target.value })}
                  min={mlos.minLos}
                  placeholder="No limit"
                  className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave empty for no maximum limit
                </p>
              </div>
            </div>
          </div>

          {/* Discount Configuration */}
          <div className="space-y-4 p-4 bg-muted/20 rounded-lg border border-border">
            <h3 className="text-sm font-semibold text-foreground">
              Discount Configuration (Optional)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Discount Type
                </label>
                <Select
                  value={mlos.discountType || "none"}
                  onValueChange={(value) => {
                    setMlos({ ...mlos, discountType: value as "percentage" | "flat" | "none" });
                    if (!value) {
                      setMlos({ ...mlos, discountValue: 0 });
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select discount type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Discount</SelectItem>
                    <SelectItem value="percentage">
                      Percentage Discount
                    </SelectItem>
                    <SelectItem value="flat">Flat Amount Discount</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {mlos.discountType !== "none" && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {mlos.discountType === "percentage"
                      ? "Percentage Value"
                      : "Amount"}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={mlos.discountValue || ""}
                      onChange={(e) => setMlos({ ...mlos, discountValue: parseInt(e.target.value) })}
                      min="0"
                      max={mlos.discountType === "percentage" ? "100" : undefined}
                      step="0.1"
                      className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground pr-8"
                      placeholder={
                        mlos.discountType === "percentage" ? "e.g., 10" : "e.g., 50"
                      }
                      required={true}
                    />
                    {mlos.discountType === "percentage" && (
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground font-medium">
                        %
                      </span>
                    )}
                  </div>
                </div>
              )}
              {mlos.discountType === "flat" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="currencyCode">Currency Code</Label>
                    <Select
                      value={mlos.currencyCode}
                      onValueChange={(value) => setMlos({ ...mlos, currencyCode: value as CurrencyCode })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.name} ({currency.symbol})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-muted/20 rounded-lg border border-border">
            <input
              type="checkbox"
              id="isAutoApplied"
              checked={mlos.isAutoApplied}
              onChange={(e) => setMlos({ ...mlos, isAutoApplied: e.target.checked })}
              className="w-5 h-5 text-primary border-border rounded focus:ring-2 focus:ring-primary"
            />
            <label
              htmlFor="isAutoApplied"
              className="text-sm font-medium text-foreground cursor-pointer flex-1"
            >
              Auto Applied
              <span className="block text-xs text-muted-foreground font-normal mt-0.5">
                {mlos.isAutoApplied
                  ? "This MLOS rule is auto applied to reservations"
                  : "This MLOS rule is not auto applied"}
              </span>
            </label>
          </div>
          {/* Status Toggle */}
          <div className="flex items-center space-x-3 p-3 bg-muted/20 rounded-lg border border-border">
            <input
              type="checkbox"
              id="isActive"
              checked={mlos.isActive}
              onChange={(e) => setMlos({ ...mlos, isActive: e.target.checked })}
              className="w-5 h-5 text-primary border-border rounded focus:ring-2 focus:ring-primary"
            />
            <label
              htmlFor="isActive"
              className="text-sm font-medium text-foreground cursor-pointer flex-1"
            >
              Active Status
              <span className="block text-xs text-muted-foreground font-normal mt-0.5">
                {mlos.isActive
                  ? "This MLOS rule is currently active"
                  : "This MLOS rule is currently inactive"}
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors font-medium"
              disabled={isLoading.isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
              disabled={isLoading.isLoading || !mlos.selectedRatePlan}
            >
              {editData ? "✓ Update" : "+ Create"} MLOS Rule
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default MLOSRuleForm;

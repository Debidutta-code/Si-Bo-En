import React, { useState, useEffect } from 'react';
import type { RatePlan } from '@/pages/rate-plan/interfaces';
import Loader from '@/components/Loader/Loader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { RatePlanRule } from '@/pages/rate-plan/interfaces/ratePlan.type';

interface MLOSRuleFormProps {
  ratePlans: RatePlan[];
  onSubmit: (payload: Partial<RatePlanRule>) => Promise<void>;
  onCancel: () => void;
  editData?: RatePlanRule & { ratePlan?: { ratePlanName: string; ratePlanCode: string } } | null;
  isLoading: boolean;
}

const MLOSRuleForm: React.FC<MLOSRuleFormProps> = ({
  ratePlans,
  onSubmit,
  onCancel,
  editData,
  isLoading
}) => {
  const [selectedRatePlan, setSelectedRatePlan] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [minLos, setMinLos] = useState<string>('1');
  const [maxLos, setMaxLos] = useState<string>('');
  const [discountType, setDiscountType] = useState<'percentage' | 'flat' | ''>('');
  const [discountValue, setDiscountValue] = useState<string>('');
  const [isActive, setIsActive] = useState(true);
  const [isAutoApplied, setIsAutoApplied] = useState<boolean>(false);
  useEffect(() => {
    if (editData) {
      setSelectedRatePlan(editData.ratePlanId);
      setStartDate(editData.startDate ? new Date(editData.startDate).toISOString().split('T')[0] : '');
      setEndDate(editData.endDate ? new Date(editData.endDate).toISOString().split('T')[0] : '');
      setMinLos(editData.minLos.toString());
      setMaxLos(editData.maxLos?.toString() || '');
      setDiscountType(editData.discountType || '');
      setDiscountValue(editData.discountValue?.toString() || '');
      setIsActive(editData.isActive);
      setIsAutoApplied(editData.isAutoApplied);
    }
  }, [editData]);

  // Get available rate plans (those without rules)
  const availableRatePlans = ratePlans.filter(
    rp => !rp.ratePlanRules || editData?.ratePlanId === rp.id
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: Partial<RatePlanRule> = {
      ratePlanId: selectedRatePlan,
      startDate: startDate || null,
      endDate: endDate || null,
      minLos: parseInt(minLos),
      maxLos: maxLos ? parseInt(maxLos) : null,
      discountType: discountType || null,
      discountValue: discountValue ? parseFloat(discountValue) : null,
      isActive,
      isAutoApplied
    };

    await onSubmit(payload);
  };

  const showDiscountFields = discountType !== '';

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm relative">
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
          <Loader text="Processing..." />
        </div>
      )}
      
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
              value={selectedRatePlan}
              onValueChange={setSelectedRatePlan}
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
          <h3 className="text-sm font-semibold text-foreground">Date Range (Optional)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              />
            </div>
          </div>
        </div>

        {/* Length of Stay */}
        <div className="space-y-4 p-4 bg-muted/20 rounded-lg border border-border">
          <h3 className="text-sm font-semibold text-foreground">Length of Stay Requirements</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Minimum LOS (nights) *
              </label>
              <input
                type="number"
                value={minLos}
                onChange={(e) => setMinLos(e.target.value)}
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
                value={maxLos}
                onChange={(e) => setMaxLos(e.target.value)}
                min={minLos}
                placeholder="No limit"
                className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              />
              <p className="text-xs text-muted-foreground mt-1">Leave empty for no maximum limit</p>
            </div>
          </div>
        </div>

        {/* Discount Configuration */}
        <div className="space-y-4 p-4 bg-muted/20 rounded-lg border border-border">
          <h3 className="text-sm font-semibold text-foreground">Discount Configuration (Optional)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Discount Type
              </label>
              <Select
                value={discountType}
                onValueChange={(value) => {
                  setDiscountType(value as 'percentage' | 'flat' | '');
                  if (!value) {
                    setDiscountValue('');
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select discount type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Discount</SelectItem>
                  <SelectItem value="percentage">Percentage Discount</SelectItem>
                  <SelectItem value="flat">Flat Amount Discount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {showDiscountFields && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {discountType === 'percentage' ? 'Percentage Value' : 'Amount'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    min="0"
                    max={discountType === 'percentage' ? '100' : undefined}
                    step="0.01"
                    className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground pr-8"
                    placeholder={discountType === 'percentage' ? 'e.g., 10' : 'e.g., 50'}
                    required={showDiscountFields}
                  />
                  {discountType === 'percentage' && (
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground font-medium">
                      %
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-3 p-3 bg-muted/20 rounded-lg border border-border">
          <input
            type="checkbox"
            id="isAutoApplied"
            checked={isAutoApplied}
            onChange={(e) => setIsAutoApplied(e.target.checked)}
            className="w-5 h-5 text-primary border-border rounded focus:ring-2 focus:ring-primary"
          />
          <label htmlFor="isAutoApplied" className="text-sm font-medium text-foreground cursor-pointer flex-1">
            Auto Applied 
            <span className="block text-xs text-muted-foreground font-normal mt-0.5">
              {isAutoApplied ? 'This MLOS rule is auto applied to reservations' : 'This MLOS rule is not auto applied'}
            </span>
          </label>
        </div>
        {/* Status Toggle */}
        <div className="flex items-center space-x-3 p-3 bg-muted/20 rounded-lg border border-border">
          <input
            type="checkbox"
            id="isActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-5 h-5 text-primary border-border rounded focus:ring-2 focus:ring-primary"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-foreground cursor-pointer flex-1">
            Active Status
            <span className="block text-xs text-muted-foreground font-normal mt-0.5">
              {isActive ? 'This MLOS rule is currently active' : 'This MLOS rule is currently inactive'}
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors font-medium"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
            disabled={isLoading || !selectedRatePlan}
          >
            {editData ? '✓ Update' : '+ Create'} MLOS Rule
          </button>
        </div>
      </form>
    </div>
  );
};

export default MLOSRuleForm;
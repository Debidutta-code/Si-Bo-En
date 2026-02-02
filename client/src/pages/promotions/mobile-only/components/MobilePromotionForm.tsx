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
import type { CreateMobilePromotion, MobilePromotionWithRatePlan } from '../interfaces/mobilePromotion.type';

interface MobilePromotionFormProps {
  ratePlans: RatePlan[];
  onSubmit: (payload: CreateMobilePromotion) => Promise<void>;
  onCancel: () => void;
  editData?: MobilePromotionWithRatePlan | null;
  isLoading: boolean;
}

const MobilePromotionForm: React.FC<MobilePromotionFormProps> = ({
  ratePlans,
  onSubmit,
  onCancel,
  editData,
  isLoading
}) => {
  const [selectedRatePlan, setSelectedRatePlan] = useState<string>('');
  const [promotionName, setPromotionName] = useState<string>('');
  const [discountPercentage, setDiscountPercentage] = useState<string>('10');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [dateMode, setDateMode] = useState<'continuous' | 'individual'>('continuous');
  const [isB2C, setIsB2C] = useState(false);
  const [isB2B, setIsB2B] = useState(false);
  const [isActive, setIsActive] = useState(true);
  
  const [applicableDays, setApplicableDays] = useState({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: true,
  });

  useEffect(() => {
    if (editData) {
      setSelectedRatePlan(editData.ratePlanId);
      setPromotionName(editData.promotionName);
      setDiscountPercentage(editData.discountPercentage.toString());
      setStartDate(editData.startDate ? new Date(editData.startDate).toISOString().split('T')[0] : '');
      setEndDate(editData.endDate ? new Date(editData.endDate).toISOString().split('T')[0] : '');
      setDateMode(editData.endDate ? 'continuous' : 'individual');
      setApplicableDays(editData.applicableDays);
      setIsB2C(editData.isB2C);
      setIsB2B(editData.isB2B);
      setIsActive(editData.isActive);
    }
  }, [editData]);

  // Get available rate plans (those without mobile promotions)
  const availableRatePlans = ratePlans.filter(
    rp => !rp.ratePlanRules || editData?.ratePlanId === rp.id
  );

  const handleDayToggle = (day: keyof typeof applicableDays) => {
    setApplicableDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };

  const handleSelectAllDays = () => {
    const allSelected = Object.values(applicableDays).every(v => v);
    const newState = {
      monday: !allSelected,
      tuesday: !allSelected,
      wednesday: !allSelected,
      thursday: !allSelected,
      friday: !allSelected,
      saturday: !allSelected,
      sunday: !allSelected,
    };
    setApplicableDays(newState);
  };

  const getActiveDaysSummary = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const activeDays = Object.entries(applicableDays)
      .filter(([_, isActive]) => isActive)
      .map(([day]) => days.find(d => d.toLowerCase() === day));
    return activeDays.join(', ');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: CreateMobilePromotion = {
      ratePlanId: selectedRatePlan,
      promotionName,
      discountPercentage: parseFloat(discountPercentage),
      startDate,
      endDate: dateMode === 'continuous' ? endDate || null : null,
      applicableDays,
      isB2C,
      isB2B,
      isActive
    };

    await onSubmit(payload);
  };

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm relative">
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
          <Loader text="Processing..." />
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Header */}
        <div className="pb-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">
            Create a Mobile Rate Promotion
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Become a top pick among mobile users (up to 76% of bookings are made using the app)
          </p>
        </div>

        {/* Rate Plan Selection */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">Room types and rate plans</h4>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Which rate plan can be added to this promotion? *
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
              <>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={isB2B}
                      onChange={() => {
                        setIsB2B(true);
                        setIsB2C(false);
                      }}
                      className="w-4 h-4 text-primary border-border focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-sm text-foreground">B2C rate plan</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={isB2C}
                      onChange={() => {
                        setIsB2C(true);
                        setIsB2B(false);
                      }}
                      className="w-4 h-4 text-primary border-border focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-sm text-foreground">Non-connectivity rate plan</span>
                  </label>
                </div>
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
              </>
            )}
          </div>
        </div>

        {/* Discounts and Stay dates */}
        <div className="space-y-4 p-4 bg-muted/20 rounded-lg border border-border">
          <h4 className="text-sm font-semibold text-foreground">Discounts and Stay dates</h4>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              How much of a discount do you want to give? *
            </label>
            <div className="relative max-w-xs">
              <input
                type="number"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(e.target.value)}
                min="1"
                max="100"
                step="1"
                className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground pr-12"
                required
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground font-medium">
                % off
              </span>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-sm text-blue-900 dark:text-blue-100 font-medium">Promotion Stack Rule</p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Stacks with: TripPlus, ComPlus, Basic Deal, Early Bird, Last Minute, Offer for Tonight, and Minimum Stay.
              Doesn't stack with: Packages, campaigns, or XPOS. When running concurrently with these types of promotions,
              users will only see the larger discount.
            </p>
          </div>
        </div>

        {/* Date Selection */}
        <div className="space-y-4 p-4 bg-muted/20 rounded-lg border border-border">
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              What dates of stay does the promotion apply to? *
            </label>
            
            <div className="space-y-3">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  checked={dateMode === 'continuous'}
                  onChange={() => setDateMode('continuous')}
                  className="w-4 h-4 text-primary border-border focus:ring-2 focus:ring-primary mt-0.5"
                />
                <div className="flex-1">
                  <span className="text-sm text-foreground font-medium">Valid continuously from start date</span>
                  {dateMode === 'continuous' && (
                    <div className="mt-2 max-w-xs">
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                        required
                      />
                    </div>
                  )}
                </div>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  checked={dateMode === 'individual'}
                  onChange={() => setDateMode('individual')}
                  className="w-4 h-4 text-primary border-border focus:ring-2 focus:ring-primary mt-0.5"
                />
                <span className="text-sm text-foreground font-medium">Select individual dates</span>
              </label>
            </div>
          </div>

          {/* Days Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-foreground">
                Which days would you like to include? *
              </label>
              <button
                type="button"
                onClick={handleSelectAllDays}
                className="text-xs text-primary hover:text-primary/80 font-medium"
              >
                {Object.values(applicableDays).every(v => v) ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(applicableDays).map(([day, isChecked]) => (
                <label
                  key={day}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleDayToggle(day as keyof typeof applicableDays)}
                    className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-sm text-foreground capitalize">{day}</span>
                </label>
              ))}
            </div>

            {Object.values(applicableDays).some(v => v) && (
              <div className="mt-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Promotion will be active on the following days:
                </p>
                <p className="text-sm text-blue-900 dark:text-blue-100 font-medium mt-1">
                  {discountPercentage}% OFF: Valid continuously from {startDate || 'Jan 23, 2026'}, including {getActiveDaysSummary()}.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Promotion Name */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-foreground">
            Promotion name
          </label>
          <p className="text-xs text-muted-foreground">
            What do you want to name this promotion?
          </p>
          <p className="text-xs text-muted-foreground italic">
            This is just for you - users won't be able to see it
          </p>
          <input
            type="text"
            value={promotionName}
            onChange={(e) => setPromotionName(e.target.value)}
            placeholder={`${discountPercentage}% off - Mobile Rate - ${startDate || 'Jan 23, 2026'}`}
            className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            required
          />
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
              {isActive ? 'This promotion is currently active' : 'This promotion is currently inactive'}
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
            Back
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
            disabled={isLoading || !selectedRatePlan || !promotionName || !startDate || !Object.values(applicableDays).some(v => v)}
          >
            {editData ? 'Update' : 'Preview'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MobilePromotionForm;
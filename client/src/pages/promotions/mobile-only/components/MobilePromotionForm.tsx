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
import type { 
  CreateDeviceSpecificPromotion, 
  DeviceSpecificPromotionWithRatePlan,
  DeviceType,
  DiscountType,
  CurrencyCode
} from '../interfaces';
import { Smartphone, Tablet, Monitor } from 'lucide-react';

interface DeviceSpecificPromotionFormProps {
  ratePlans: RatePlan[];
  propertyId: string;
  onSubmit: (payload: CreateDeviceSpecificPromotion) => Promise<void>;
  onCancel: () => void;
  editData?: DeviceSpecificPromotionWithRatePlan | null;
  isLoading: boolean;
}

const DeviceSpecificPromotionForm: React.FC<DeviceSpecificPromotionFormProps> = ({
  ratePlans,
  propertyId,
  onSubmit,
  onCancel,
  editData,
  isLoading
}) => {
  //needs refactor
  const [selectedRatePlan, setSelectedRatePlan] = useState<string>('');
  const [selectedRatePlanCode, setSelectedRatePlanCode] = useState<string>('');
  const [promotionName, setPromotionName] = useState<string>('');
  const [discountType, setDiscountType] = useState<DiscountType>('percentage' as DiscountType);
  const [discountValue, setDiscountValue] = useState<string>('10');
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>('USD' as CurrencyCode);
  const [validFrom, setValidFrom] = useState<string>('');
  const [validTo, setValidTo] = useState<string>('');
  const [hasEndDate, setHasEndDate] = useState<boolean>(false);
  const [ratePlanType, setRatePlanType] = useState<'b2b' | 'b2c'>('b2c');
  const [isActive, setIsActive] = useState(true);
  const [selectedDevices, setSelectedDevices] = useState<DeviceType[]>(['mobile' as DeviceType]);
  const [isAutoApplied, setIsAutoApplied] = useState<boolean>(false);
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
      setSelectedRatePlanCode(editData.ratePlanCode);
      setPromotionName(editData.promotionName);
      setDiscountType(editData.DiscountType);
      setDiscountValue(editData.DiscountValue.toString());
      setCurrencyCode(editData.currencyCode || 'USD' as CurrencyCode);
      setValidFrom(editData.validFrom ? new Date(editData.validFrom).toISOString().split('T')[0] : '');
      setValidTo(editData.validTo ? new Date(editData.validTo).toISOString().split('T')[0] : '');
      setHasEndDate(!!editData.validTo);
      setApplicableDays(editData.applicableDays);
      setIsActive(editData.isActive);
      setSelectedDevices(editData.deviceType);
      
      // Set rate plan type based on the rate plan
      if (editData.ratePlan.b2bAvailable) {
        setRatePlanType('b2b');
      } else if (editData.ratePlan.b2cAvailable) {
        setRatePlanType('b2c');
      }
    }
  }, [editData]);

  // Filter rate plans based on selected type
  const filteredRatePlans = ratePlans.filter(rp => {
    if (editData?.ratePlanId === rp.id) return true;
    if (ratePlanType === 'b2b') return rp.b2bAvailable;
    if (ratePlanType === 'b2c') return rp.b2cAvailable;
    return false;
  });

  const handleRatePlanChange = (value: string) => {
    setSelectedRatePlan(value);
    const plan = ratePlans.find(rp => rp.id === value);
    if (plan) {
      setSelectedRatePlanCode(plan.ratePlanCode);
    }
  };

  const handleDeviceToggle = (device: DeviceType) => {
    setSelectedDevices(prev => {
      if (prev.includes(device)) {
        // Don't allow removing if it's the last device
        if (prev.length === 1) return prev;
        return prev.filter(d => d !== device);
      } else {
        return [...prev, device];
      }
    });
  };

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

  const getDeviceIcons = (device: DeviceType) => {
    switch (device) {
      case 'mobile':
        return <Smartphone className="w-5 h-5" />;
      case 'tablet':
        return <Tablet className="w-5 h-5" />;
      case 'desktop':
        return <Monitor className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: CreateDeviceSpecificPromotion = {
      propertyId,
      promotionType:'device_specific',
      ratePlanId: selectedRatePlan,
      ratePlanCode: selectedRatePlanCode,
      promotionName,
      deviceType: selectedDevices,
      discountType,
      discountValue: parseFloat(discountValue),
      currencyCode: discountType === 'flat' ? currencyCode : undefined,
      validFrom,
      validTo: hasEndDate ? validTo || null : null,
      monApplicable: applicableDays.monday,
      tueApplicable: applicableDays.tuesday,
      wedApplicable: applicableDays.wednesday,
      thuApplicable: applicableDays.thursday,
      friApplicable: applicableDays.friday,
      satApplicable: applicableDays.saturday,
      sunApplicable: applicableDays.sunday,
      isActive,
      isAutoApplied: isAutoApplied
    };

    await onSubmit(payload);
  };

  const getDiscountDisplayText = () => {
    if (discountType === 'percentage') {
      return `${discountValue}% OFF`;
    } else {
      return `${currencyCode} ${discountValue} OFF`;
    }
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
            {editData ? 'Edit' : 'Create'} Device-Specific Promotion
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Target specific devices with customized promotions (mobile, tablet, or desktop users)
          </p>
        </div>

        {/* Device Selection */}
        <div className="space-y-3 p-4 bg-muted/20 rounded-lg border border-border">
          <h4 className="text-sm font-semibold text-foreground">Device Type Selection *</h4>
          <p className="text-xs text-muted-foreground">
            Select which devices this promotion will be available on
          </p>
          
          <div className="grid grid-cols-3 gap-3">
            {(['mobile', 'tablet', 'desktop'] as DeviceType[]).map((device) => (
              <button
                key={device}
                type="button"
                onClick={() => handleDeviceToggle(device)}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                  selectedDevices.includes(device)
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:border-primary/50'
                }`}
              >
                {getDeviceIcons(device)}
                <span className="text-sm font-medium mt-2 capitalize">{device}</span>
                {selectedDevices.includes(device) && (
                  <span className="text-xs mt-1">Selected</span>
                )}
              </button>
            ))}
          </div>

          {selectedDevices.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-3">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Active on: <span className="font-medium">{selectedDevices.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')}</span>
              </p>
            </div>
          )}
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
                      checked={ratePlanType === 'b2c'}
                      onChange={() => {
                        setRatePlanType('b2c');
                        setSelectedRatePlan('');
                        setSelectedRatePlanCode('');
                      }}
                      className="w-4 h-4 text-primary border-border focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-sm text-foreground">B2C rate plan</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={ratePlanType === 'b2b'}
                      onChange={() => {
                        setRatePlanType('b2b');
                        setSelectedRatePlan('');
                        setSelectedRatePlanCode('');
                      }}
                      className="w-4 h-4 text-primary border-border focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-sm text-foreground">B2B rate plan</span>
                  </label>
                </div>
                <Select
                  value={selectedRatePlan}
                  onValueChange={handleRatePlanChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a rate plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredRatePlans.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        No available {ratePlanType.toUpperCase()} rate plans
                      </div>
                    ) : (
                      filteredRatePlans.map((plan) => (
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

        {/* Discount Configuration */}
        <div className="space-y-4 p-4 bg-muted/20 rounded-lg border border-border">
          <h4 className="text-sm font-semibold text-foreground">Discount Configuration</h4>
          
          {/* Discount Type */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Discount Type *
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  checked={discountType === 'percentage'}
                  onChange={() => setDiscountType('percentage' as DiscountType)}
                  className="w-4 h-4 text-primary border-border focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm text-foreground">Percentage (%)</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  checked={discountType === 'flat'}
                  onChange={() => setDiscountType('flat' as DiscountType)}
                  className="w-4 h-4 text-primary border-border focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm text-foreground">Flat Amount</span>
              </label>
            </div>
          </div>

          {/* Discount Value */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Discount Value *
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  min="1"
                  max={discountType === 'percentage' ? '100' : undefined}
                  step={discountType === 'percentage' ? '1' : '0.01'}
                  className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground pr-12"
                  required
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground font-medium">
                  {discountType === 'percentage' ? '%' : currencyCode}
                </span>
              </div>
            </div>

            {/* Currency Selection (only for flat discount) */}
            {discountType === 'flat' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Currency *
                </label>
                <Select
                  value={currencyCode}
                  onValueChange={(value) => setCurrencyCode(value as CurrencyCode)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-sm text-blue-900 dark:text-blue-100 font-medium">Preview</p>
            <p className="text-lg text-blue-700 dark:text-blue-300 mt-1 font-semibold">
              {getDiscountDisplayText()}
            </p>
          </div>
        </div>

        {/* Date Selection */}
        <div className="space-y-4 p-4 bg-muted/20 rounded-lg border border-border">
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Promotion Validity Period *
            </label>
            
            <div className="space-y-3">
              {/* Start Date */}
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={validFrom}
                  onChange={(e) => setValidFrom(e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  required
                />
              </div>

              {/* End Date Option */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="hasEndDate"
                  checked={hasEndDate}
                  onChange={(e) => {
                    setHasEndDate(e.target.checked);
                    if (!e.target.checked) setValidTo('');
                  }}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                />
                <label htmlFor="hasEndDate" className="text-sm text-foreground cursor-pointer">
                  Set end date (optional)
                </label>
              </div>

              {hasEndDate && (
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={validTo}
                    onChange={(e) => setValidTo(e.target.value)}
                    min={validFrom}
                    className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  />
                </div>
              )}
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
                  Promotion will be active on:
                </p>
                <p className="text-sm text-blue-900 dark:text-blue-100 font-medium mt-1">
                  {getDiscountDisplayText()}: Valid from {validFrom || 'start date'}{hasEndDate && validTo ? ` to ${validTo}` : ' onwards'}, including {getActiveDaysSummary()}.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Promotion Name */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-foreground">
            Promotion name *
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
            placeholder={`${getDiscountDisplayText()} - ${selectedDevices.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join('/')} - ${validFrom || 'Start Date'}`}
            className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            required
          />
        </div>
<div className="flex items-center space-x-3 p-3 bg-muted/20 rounded-lg border border-border">
          <input
            type="checkbox"
            id="isActive"
            checked={isAutoApplied}
            onChange={(e) => setIsAutoApplied(e.target.checked)}
            className="w-5 h-5 text-primary border-border rounded focus:ring-2 focus:ring-primary"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-foreground cursor-pointer flex-1">
            Auto Apply
            <span className="block text-xs text-muted-foreground font-normal mt-0.5">
              {isAutoApplied ? 'This promotion is currently auto applied to the reservation' : 'This promotion is currently not auto applied'}
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
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
            disabled={
              isLoading || 
              !selectedRatePlan || 
              !promotionName || 
              !validFrom || 
              selectedDevices.length === 0 ||
              !Object.values(applicableDays).some(v => v)
            }
          >
            {editData ? 'Update Promotion' : 'Create Promotion'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DeviceSpecificPromotionForm;
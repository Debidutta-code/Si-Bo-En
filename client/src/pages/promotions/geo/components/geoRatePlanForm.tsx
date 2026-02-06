import type { RoomTypes } from '@/pages/inventory/types';
import type { RatePlan } from '@/pages/rate-plan/interfaces';
import React, { useState, useEffect } from 'react';
import type { CreateGeoRatePlan, CurrencyCode, GeoRatePlan, GeoRestrictionType, GeoRestrictionTypeAction } from '../interfaces';
import { countries, searchCountries } from '@/pages/bookings/utils/country.utils';
import Loader from '@/components/Loader/Loader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface GeoRatePlanFormProps {
  propertyId: string;
  roomTypes: RoomTypes[];
  ratePlans: RatePlan[];
  onSubmit: (payload: CreateGeoRatePlan) => Promise<void>;
  onCancel: () => void;
  editData?: GeoRatePlan | null;
  isLoading: boolean;
}

const GeoRatePlanForm: React.FC<GeoRatePlanFormProps> = ({
  propertyId,
  roomTypes,
  ratePlans,
  onSubmit,
  onCancel,
  editData,
  isLoading
}) => {
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [selectedRatePlans, setSelectedRatePlans] = useState<string[]>([]);
  const [restrictionType, setRestrictionType] = useState<GeoRestrictionType>("percentage");
  const [restrictionAction, setRestrictionAction] = useState<GeoRestrictionTypeAction>("increase");
  const [restrictionValue, setRestrictionValue] = useState<string>('');
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>("USD");
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [countrySearch, setCountrySearch] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (editData) {
     if (editData.roomId) {
  setSelectedRooms([editData.roomId]);
}
      setSelectedRatePlans([editData.ratePlanId]);
      setRestrictionType(editData.restrictionType);
      if (editData.restrictionTypeAction) {
        setRestrictionAction(editData.restrictionTypeAction);
      }
      setRestrictionValue(editData.restrictionValue?.toString() || '');
      if (editData.currencyCode) {
        setCurrencyCode(editData.currencyCode);
      }
      setSelectedCountries(editData.countryCode);
      setIsActive(editData.isActive);
    }
  }, [editData]);

  const filteredCountries = countrySearch
    ? searchCountries(countrySearch)
    : countries;

  const handleCountryToggle = (code: string) => {
    setSelectedCountries(prev =>
      prev.includes(code)
        ? prev.filter(c => c !== code)
        : [...prev, code]
    );
  };


  const handleSelectAllRatePlans = () => {
    if (selectedRatePlans.length === ratePlans.length) {
      setSelectedRatePlans([]);
    } else {
      setSelectedRatePlans(ratePlans.map(plan => plan.id));
    }
  };

  const handleSelectAllCountries = () => {
    if (selectedCountries.length === filteredCountries.length) {
      setSelectedCountries([]);
    } else {
      setSelectedCountries(filteredCountries.map(country => country.code));
    }
  };

  const handleSelectAllRooms = () => {
    if (selectedRooms.length === roomTypes.length) {
      setSelectedRooms([]);
    } else {
      setSelectedRooms(roomTypes.map(room => room.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

   const roomsPayload = selectedRooms.map(roomId => {
  const room = roomTypes.find(r => r.id === roomId);
  return {
    id: roomId,
    type: room?.roomType || ''
  };
});

    const ratePlansPayload = selectedRatePlans.map(ratePlanId => {
      const plan = ratePlans.find(p => p.id === ratePlanId);
      return {
        id: ratePlanId,
        code: plan?.ratePlanCode || ''
      };
    });

    const payload: CreateGeoRatePlan = {
      propertyId,
      rooms: roomsPayload,
      ratePlans: ratePlansPayload,
      restrictionType,
      restrictionTypeAction: restrictionType === "restricted" ? null : restrictionAction,
      restrictionValue: restrictionType === "restricted" ? null : parseFloat(restrictionValue) || null,
      currencyCode: restrictionType === "fixed" ? currencyCode : null,
      countryCode: selectedCountries,
      isActive
    };

    await onSubmit(payload);
  };

  const showRestrictionValue = restrictionType !== "restricted";
  const showCurrencyCode = restrictionType === "fixed";
  const showRestrictionAction = restrictionType !== "restricted";

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm relative">
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
          <Loader text="Processing..." />
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Room Selection */}
        {/* Room Selection */}
<div className="space-y-3">
  <div className="flex items-center justify-between">
    <label className="text-sm font-semibold text-foreground">
      Room Selection
    </label>
    <button
      type="button"
      onClick={handleSelectAllRooms}
      className="text-xs text-primary hover:text-primary/80 font-medium"
    >
      {selectedRooms.length === roomTypes.length ? 'Deselect All' : 'Select All'}
    </button>
  </div>
  
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto border border-border rounded-lg p-4 bg-muted/30">
    {roomTypes.length === 0 ? (
      <p className="text-sm text-muted-foreground text-center py-4 col-span-full">No rooms available</p>
    ) : (
      roomTypes.map((room) => (
        <label 
          key={room.id} 
          className="flex items-start space-x-3 cursor-pointer hover:bg-muted/50 p-3 rounded-md transition-colors border border-transparent hover:border-border"
        >
          <input
            type="checkbox"
            checked={selectedRooms.includes(room.id)}
            onChange={() => {
              setSelectedRooms(prev =>
                prev.includes(room.id)
                  ? prev.filter(id => id !== room.id)
                  : [...prev, room.id]
              );
            }}
            className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary mt-0.5"
          />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-foreground truncate">{room.roomName}</div>
            <div className="text-xs text-muted-foreground">({room.roomType})</div>
          </div>
        </label>
      ))
    )}
  </div>
</div>

        {/* Rate Plans Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground">
              Rate Plans *
            </label>
            <button
              type="button"
              onClick={handleSelectAllRatePlans}
              className="text-xs text-primary hover:text-primary/80 font-medium"
            >
              {selectedRatePlans.length === ratePlans.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto border border-border rounded-lg p-4 bg-muted/30">
            {ratePlans.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4 col-span-full">No rate plans available</p>
            ) : (
              ratePlans.map((plan) => (
                <label 
                  key={plan.id} 
                  className="flex items-start space-x-3 cursor-pointer hover:bg-muted/50 p-3 rounded-md transition-colors border border-transparent hover:border-border"
                >
                  <input
                    type="checkbox"
                    checked={selectedRatePlans.includes(plan.id)}
                    onChange={() => {
                      setSelectedRatePlans(prev =>
                        prev.includes(plan.id)
                          ? prev.filter(id => id !== plan.id)
                          : [...prev, plan.id]
                      );
                    }}
                    className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{plan.ratePlanName}</div>
                    <div className="text-xs text-muted-foreground">({plan.ratePlanCode})</div>
                  </div>
                </label>
              ))
            )}
          </div>
        </div>

        {/* Restriction Configuration */}
        <div className="space-y-4 p-4 bg-muted/20 rounded-lg border border-border">
          <h3 className="text-sm font-semibold text-foreground">Pricing Configuration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Restriction Type *
              </label>
              <Select
                value={restrictionType}
                onValueChange={(value) => {
                  setRestrictionType(value as GeoRestrictionType);
                  if (value === "restricted") {
                    setRestrictionValue('');
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage Adjustment</SelectItem>
                  <SelectItem value="fixed">Fixed Amount Adjustment</SelectItem>
                  <SelectItem value="restricted">Block Access</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {showRestrictionAction && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Price Action *
                </label>
                <Select
                  value={restrictionAction}
                  onValueChange={(value) => setRestrictionAction(value as GeoRestrictionTypeAction)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="increase">⬆ Increase Price</SelectItem>
                    <SelectItem value="decrease">⬇ Decrease Price</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {showRestrictionValue && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {restrictionType === "percentage" ? 'Percentage Value *' : 'Amount *'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={restrictionValue}
                    onChange={(e) => setRestrictionValue(e.target.value)}
                    min="0"
                    max={restrictionType === "percentage" ? "100" : undefined}
                    step="0.01"
                    className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground pr-8"
                    placeholder={restrictionType === "percentage" ? "e.g., 10" : "e.g., 50"}
                    required
                  />
                  {restrictionType === "percentage" && (
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground font-medium">
                      %
                    </span>
                  )}
                </div>
              </div>

              {showCurrencyCode && (
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
                      <SelectItem value="USD"> USD - US Dollar</SelectItem>
                      <SelectItem value="EUR"> EUR - Euro</SelectItem>
                      <SelectItem value="INR"> INR - Indian Rupee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {restrictionType === "restricted" && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-sm text-destructive font-medium">⚠ Selected countries will be completely blocked from booking</p>
            </div>
          )}
        </div>

        {/* Country Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground">
              Target Countries * 
              {selectedCountries.length > 0 && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  ({selectedCountries.length} selected)
                </span>
              )}
            </label>
            <button
              type="button"
              onClick={handleSelectAllCountries}
              className="text-xs text-primary hover:text-primary/80 font-medium"
            >
              {selectedCountries.length === filteredCountries.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          
          <input
            type="text"
            value={countrySearch}
            onChange={(e) => setCountrySearch(e.target.value)}
            placeholder="Search countries..."
            className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-80 overflow-y-auto border border-border rounded-lg p-4 bg-muted/30">
            {filteredCountries.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4 col-span-full">No countries found</p>
            ) : (
              filteredCountries.map((country) => (
                <label
                  key={country.code}
                  className="flex items-center space-x-3 cursor-pointer hover:bg-muted/50 p-2.5 rounded-md transition-colors border border-transparent hover:border-border"
                >
                  <input
                    type="checkbox"
                    checked={selectedCountries.includes(country.code)}
                    onChange={() => handleCountryToggle(country.code)}
                    className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{country.name} <span>({country.code})</span></div>
                  </div>
                </label>
              ))
            )}
          </div>
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
              {isActive ? 'This rate plan is currently active' : 'This rate plan is currently inactive'}
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
  selectedRatePlans.length === 0 || 
  selectedCountries.length === 0
}
          >
            {editData ? '✓ Update' : '+ Create'} Geo Rate Plan
          </button>
        </div>
      </form>
    </div>
  );
};

export default GeoRatePlanForm;
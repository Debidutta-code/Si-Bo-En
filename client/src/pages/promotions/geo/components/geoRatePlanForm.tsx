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
      setSelectedRooms(editData.roomId ? [editData.roomId] : []);
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
    <div className="bg-card p-6 rounded-lg border border-border">
      {isLoading && <Loader text="Processing..." />}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Select Rooms *
          </label>
          <div className="space-y-2 max-h-40 overflow-y-auto border border-border rounded-md p-3">
            {roomTypes.map((room) => (
              <label key={room.id} className="flex items-center space-x-2 cursor-pointer hover:bg-muted p-2 rounded">
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
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                />
                <span className="text-sm text-foreground">
                  {room.roomName} ({room.roomType})
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Select Rate Plans *
          </label>
          <div className="space-y-2 max-h-40 overflow-y-auto border border-border rounded-md p-3">
            {ratePlans.map((plan) => (
              <label key={plan.id} className="flex items-center space-x-2 cursor-pointer hover:bg-muted p-2 rounded">
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
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                />
                <span className="text-sm text-foreground">
                  {plan.ratePlanName} ({plan.ratePlanCode})
                </span>
              </label>
            ))}
          </div>
        </div>

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
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="fixed">Fixed Amount</SelectItem>
              <SelectItem value="restricted">Restricted (Block Access)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {showRestrictionAction && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Action *
            </label>
            <Select
              value={restrictionAction}
              onValueChange={(value) => setRestrictionAction(value as GeoRestrictionTypeAction)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="increase">Increase Price</SelectItem>
                <SelectItem value="decrease">Decrease Price</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {showRestrictionValue && (
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
                className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                placeholder={restrictionType === "percentage" ? "Enter percentage (0-100)" : "Enter amount"}
                required
              />
              {restrictionType === "percentage" && (
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  %
                </span>
              )}
            </div>
          </div>
        )}

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
                <SelectItem value="USD">USD - US Dollar</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
                <SelectItem value="INR">INR - Indian Rupee</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Select Countries * ({selectedCountries.length} selected)
          </label>
          <input
            type="text"
            value={countrySearch}
            onChange={(e) => setCountrySearch(e.target.value)}
            placeholder="Search countries..."
            className="w-full px-4 py-2 mb-3 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
          />
          <div className="space-y-1 max-h-60 overflow-y-auto border border-border rounded-md p-3">
            {filteredCountries.map((country) => (
              <label
                key={country.code}
                className="flex items-center space-x-2 cursor-pointer hover:bg-muted p-2 rounded"
              >
                <input
                  type="checkbox"
                  checked={selectedCountries.includes(country.code)}
                  onChange={() => handleCountryToggle(country.code)}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                />
                <span className="text-xl">{country.flag}</span>
                <span className="text-sm text-foreground">
                  {country.name} ({country.code})
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-foreground cursor-pointer">
            Active
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || selectedRooms.length === 0 || selectedRatePlans.length === 0 || selectedCountries.length === 0}
          >
            {editData ? 'Update' : 'Create'} Geo Rate Plan
          </button>
        </div>
      </form>
    </div>
  );
};

export default GeoRatePlanForm;
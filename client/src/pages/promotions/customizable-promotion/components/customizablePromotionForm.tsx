import React, { useState, useEffect } from 'react';
import type { RatePlan } from '@/pages/rate-plan/interfaces';
import type { RoomTypes } from '@/pages/inventory/types';
import Loader from '@/components/Loader/Loader';
import toast from 'react-hot-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { 
  CreateCustomizableDeal, 
  CustomizableDeal,
  DiscountType,
  CurrencyCode
} from '../interfaces';
import { Tag } from 'lucide-react';
import type { IAddon } from '@/pages/add-on/interface';

interface CustomizableDealFormProps {
  ratePlans: RatePlan[];
  roomTypes: RoomTypes[];
  addons: IAddon[];
  onSubmit: (payload: CreateCustomizableDeal) => Promise<void>;
  onCancel: () => void;
  editData?: CustomizableDeal | null;
  isLoading: boolean;
}

const CustomizableDealForm: React.FC<CustomizableDealFormProps> = ({
  ratePlans,
  roomTypes,
  addons,
  onSubmit,
  onCancel,
  editData,
  isLoading
}) => {
  const [discountType, setDiscountType] = useState<DiscountType>('percentage');
  const [discountValue, setDiscountValue] = useState<string>('10');
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>('USD');
  
  // Room, Rate Plan, and Addon Selection
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [selectedRatePlans, setSelectedRatePlans] = useState<string[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  useEffect(() => {
    if (editData) {
      setDiscountType(editData.discountType);
      setDiscountValue(editData.discountValue.toString());
      setCurrencyCode(editData.currencyCode || 'USD');
      
      // Extract selected room IDs
      const roomIds = editData.CustomizableDealsApplicableRoomTypes.map(rt => rt.roomId);
      setSelectedRooms(roomIds);
      
      // Extract selected rate plan IDs
      const ratePlanIds = editData.CustomizableDealsApplicableRatePlanTypes.map(rp => rp.ratePlanId);
      setSelectedRatePlans(ratePlanIds);
      
      // Extract selected addon IDs
      const addonIds = editData.CustomizableDealsApplicableAddons.map(a => a.addOnId);
      setSelectedAddons(addonIds);
    }
  }, [editData]);

  const handleSelectAllRooms = () => {
    if (selectedRooms.length === roomTypes.length) {
      setSelectedRooms([]);
    } else {
      setSelectedRooms(roomTypes.map(room => room.id));
    }
  };

  const handleSelectAllRatePlans = () => {
    if (selectedRatePlans.length === ratePlans.length) {
      setSelectedRatePlans([]);
    } else {
      setSelectedRatePlans(ratePlans.map(plan => plan.id));
    }
  };

  const handleSelectAllAddons = () => {
    if (selectedAddons.length === addons.length) {
      setSelectedAddons([]);
    } else {
      setSelectedAddons(addons.map(addon => addon.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Custom validation
    const discountVal = parseFloat(discountValue);
    
    if (isNaN(discountVal) || discountVal <= 0) {
      toast?.error?.('Please enter a valid discount value greater than 0') || 
      alert('Please enter a valid discount value greater than 0');
      return;
    }

    if (discountType === 'percentage' && discountVal > 100) {
      toast?.error?.('Percentage discount cannot exceed 100') || 
      alert('Percentage discount cannot exceed 100');
      return;
    }

    if (selectedRooms.length === 0) {
      toast?.error?.('Please select at least one room type') || 
      alert('Please select at least one room type');
      return;
    }

    if (selectedRatePlans.length === 0) {
      toast?.error?.('Please select at least one rate plan') || 
      alert('Please select at least one rate plan');
      return;
    }

    const payload: CreateCustomizableDeal = {
      discountType,
      discountValue: discountVal,
      currencyCode: discountType === 'flat' ? currencyCode : undefined,
      applicableRoomTypes: selectedRooms,
      applicableRatePlans: selectedRatePlans,
      applicableAddons: selectedAddons,
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
            {editData ? 'Edit' : 'Create'} Customizable Deal
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Create flexible deals by selecting specific room types, rate plans, and add-ons
          </p>
        </div>

        {/* Discount Configuration */}
        <div className="space-y-4 p-4 bg-muted/20 rounded-lg border border-border">
          <h4 className="text-sm font-semibold text-foreground">Discount Configuration</h4>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Discount Type *
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  checked={discountType === 'percentage'}
                  onChange={() => setDiscountType('percentage')}
                  className="w-4 h-4 text-primary border-border focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm text-foreground">Percentage discount</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  checked={discountType === 'flat'}
                  onChange={() => setDiscountType('flat')}
                  className="w-4 h-4 text-primary border-border focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm text-foreground">Fixed amount discount</span>
              </label>
            </div>
          </div>

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
                  onKeyDown={(e) => {
                    // Prevent 'e', '+', '-' characters
                    if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
                      e.preventDefault();
                    }
                  }}
                  className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground pr-12"
                  placeholder={discountType === 'percentage' ? 'Enter percentage (1-100)' : 'Enter amount'}
                  required
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground font-medium">
                  {discountType === 'percentage' ? '% off' : currencyCode}
                </span>
              </div>
              {discountValue && parseFloat(discountValue) <= 0 && (
                <p className="text-xs text-destructive mt-1">Discount value must be greater than 0</p>
              )}
              {discountType === 'percentage' && discountValue && parseFloat(discountValue) > 100 && (
                <p className="text-xs text-destructive mt-1">Percentage cannot exceed 100</p>
              )}
            </div>

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
            <p className="text-sm text-blue-900 dark:text-blue-100 font-medium">Discount Preview</p>
            <p className="text-lg text-blue-700 dark:text-blue-300 mt-1 font-semibold">
              {getDiscountDisplayText()}
            </p>
          </div>
        </div>

        {/* Room Types Selection */}
        <div className="space-y-4 p-4 bg-muted/20 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-foreground">Applicable Room Types *</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Select which room types this deal applies to
              </p>
            </div>
            {!editData && (
              <button
                type="button"
                onClick={handleSelectAllRooms}
                className="text-xs text-primary hover:text-primary/80 font-medium"
              >
                {selectedRooms.length === roomTypes.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>
          
          {editData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {editData.CustomizableDealsApplicableRoomTypes.map((rt) => (
                <div key={rt.id} className="px-3 py-2 bg-muted/30 border border-border rounded-md">
                  <div className="text-sm font-medium text-foreground truncate">
                    {rt.Room.roomName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ({rt.Room.roomType})
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto border border-border rounded-lg p-4 bg-background">
              {roomTypes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4 col-span-full">
                  No rooms available
                </p>
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
                      <div className="text-sm font-medium text-foreground truncate">
                        {room.roomName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ({room.roomType})
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>
          )}

          {!editData && selectedRooms.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Selected <span className="font-semibold">{selectedRooms.length}</span> room type(s)
              </p>
            </div>
          )}
        </div>

        {/* Rate Plans Selection */}
        <div className="space-y-4 p-4 bg-muted/20 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-foreground">Applicable Rate Plans *</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Select which rate plans this deal applies to
              </p>
            </div>
            {!editData && (
              <button
                type="button"
                onClick={handleSelectAllRatePlans}
                className="text-xs text-primary hover:text-primary/80 font-medium"
              >
                {selectedRatePlans.length === ratePlans.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>
          
          {editData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {editData.CustomizableDealsApplicableRatePlanTypes.map((rp) => (
                <div key={rp.id} className="px-3 py-2 bg-muted/30 border border-border rounded-md">
                  <div className="text-sm font-medium text-foreground truncate">
                    {rp.RatePlan.ratePlanName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ({rp.RatePlan.ratePlanCode})
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto border border-border rounded-lg p-4 bg-background">
              {ratePlans.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4 col-span-full">
                  No rate plans available
                </p>
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
                      <div className="text-sm font-medium text-foreground truncate">
                        {plan.ratePlanName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ({plan.ratePlanCode})
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>
          )}

          {!editData && selectedRatePlans.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Selected <span className="font-semibold">{selectedRatePlans.length}</span> rate plan(s)
              </p>
            </div>
          )}
        </div>

        {/* Add-ons Selection */}
        <div className="space-y-4 p-4 bg-muted/20 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Tag className="w-4 h-4 text-primary" />
              <div>
                <h4 className="text-sm font-semibold text-foreground">Applicable Add-ons</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Select which add-ons this deal applies to (optional)
                </p>
              </div>
            </div>
            {!editData && addons.length > 0 && (
              <button
                type="button"
                onClick={handleSelectAllAddons}
                className="text-xs text-primary hover:text-primary/80 font-medium"
              >
                {selectedAddons.length === addons.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>
          
          {editData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {editData.CustomizableDealsApplicableAddons.length === 0 ? (
                <p className="text-sm text-muted-foreground col-span-full">No add-ons selected</p>
              ) : (
                editData.CustomizableDealsApplicableAddons.map((addon) => (
                  <div key={addon.id} className="px-3 py-2 bg-muted/30 border border-border rounded-md">
                    <div className="text-sm font-medium text-foreground truncate">
                      {addon.AddOn.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ({addon.AddOn.code})
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <>
              {addons.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No add-ons available
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto border border-border rounded-lg p-4 bg-background">
                  {addons.map((addon) => (
                    <label 
                      key={addon.id} 
                      className="flex items-start space-x-3 cursor-pointer hover:bg-muted/50 p-3 rounded-md transition-colors border border-transparent hover:border-border"
                    >
                      <input
                        type="checkbox"
                        checked={selectedAddons.includes(addon.id)}
                        onChange={() => {
                          setSelectedAddons(prev =>
                            prev.includes(addon.id)
                              ? prev.filter(id => id !== addon.id)
                              : [...prev, addon.id]
                          );
                        }}
                        className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">
                          {addon.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ({addon.code})
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {selectedAddons.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Selected <span className="font-semibold">{selectedAddons.length}</span> add-on(s)
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Summary */}
        {!editData && (selectedRooms.length > 0 || selectedRatePlans.length > 0) && (
          <div className="bg-success/10 border border-success/20 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-foreground mb-2">Deal Summary</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Discount: <span className="font-medium text-foreground">{getDiscountDisplayText()}</span></li>
              <li>• Room Types: <span className="font-medium text-foreground">{selectedRooms.length} selected</span></li>
              <li>• Rate Plans: <span className="font-medium text-foreground">{selectedRatePlans.length} selected</span></li>
              <li>• Add-ons: <span className="font-medium text-foreground">{selectedAddons.length} selected</span></li>
            </ul>
          </div>
        )}

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
              selectedRooms.length === 0 ||
              selectedRatePlans.length === 0
            }
          >
            {editData ? 'Update Deal' : 'Create Deal'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomizableDealForm;
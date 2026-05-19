import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { RoomTypes } from '@/pages/inventory/types';
import type { RatePlan } from '@/pages/rate-plan/interfaces';

interface GeoRatePlanFilterProps {
  roomTypes: RoomTypes[];
  ratePlans: RatePlan[];
  selectedRoomType: string;
  selectedRatePlan: string;
  onRoomTypeChange: (value: string) => void;
  onRatePlanChange: (value: string) => void;
  onClearFilters: () => void;
}

const GeoRatePlanFilter: React.FC<GeoRatePlanFilterProps> = ({
  roomTypes,
  ratePlans,
  selectedRoomType,
  selectedRatePlan,
  onRoomTypeChange,
  onRatePlanChange,
  onClearFilters
}) => {
  
const hasActiveFilters = selectedRoomType !== "all" || selectedRatePlan !== "all";
  return (
    <div className="bg-card p-4 rounded-lg border border-border mb-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Room Type
          </label>
          <Select value={selectedRoomType} onValueChange={onRoomTypeChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Room Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Room Types</SelectItem>
              {roomTypes.map((room) => (
                <SelectItem key={room.id} value={room.roomType}>
                  {room._translations ? room._translations.roomName : room.roomName} ({room.roomType})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Rate Plan
          </label>
          <Select value={selectedRatePlan} onValueChange={onRatePlanChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Rate Plans" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Rate Plans</SelectItem>
              {ratePlans.map((plan) => (
                <SelectItem key={plan.id} value={plan.ratePlanCode}>
                  {plan._translations ? plan._translations.ratePlanName : plan.ratePlanName} ({plan.ratePlanCode})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeoRatePlanFilter;
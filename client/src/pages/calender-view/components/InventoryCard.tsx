import React from 'react';
import { Bed, Users } from 'lucide-react';
import type { InventoryDay } from '../types/inventory';

interface InventoryCardProps {
  day: InventoryDay;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export const InventoryCard: React.FC<InventoryCardProps> = ({
  day,
  onMouseEnter,
  onMouseLeave
}) => {
  const occupancyPercent = day.total > 0 ? Math.round((day.sold / day.total) * 100) : 0;

  return (
    <div
  className="relative"
  onMouseEnter={onMouseEnter}
  onMouseLeave={onMouseLeave}
>
  {/* Date Header */}
  <div className="bg-gray-200 rounded-t-lg p-1 text-center">
    <div className="text-xs font-semibold text-gray-600">{day.dayOfWeek}</div>
    <div className="text-sm font-medium text-gray-800">
      {day.month} {day.date}
    </div>
  </div>

  {/* Inventory Card - Compact styling */}
  <div className={`rounded-b-lg p-2 text-black text-center cursor-pointer transition-colors bg-gray-100`}>
    {day.available !== 0 ? (
      <div className='bg-green-400 rounded text-center text-xs h-4 text-green-800 flex items-center justify-center'>
        Bookable
      </div>
    ) : (
      <div className='bg-red-400 rounded text-center text-xs h-4 text-red-800 flex items-center justify-center'>
        Not Bookable
      </div>
    )}
    
    <Bed className="w-4 h-4 mx-auto my-1 opacity-90" />

    <div className="text-xl font-bold">{day.available}</div>
    <div className="text-xs mb-1">{day.sold} sold</div>
    <div className="flex items-center justify-center gap-1 text-xs opacity-75">
      <Users className="w-3 h-3" />
      <span>{occupancyPercent}%</span>
    </div>
  </div>
</div>
  );
};
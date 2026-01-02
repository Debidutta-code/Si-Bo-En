// components/PriceInput.tsx

import React from "react";
import { ArrowRight } from "lucide-react";

interface PriceInputProps {
  roomType: string;
  ratePlan: string;
  dayIndex: number;
  currentPrice: number | string;
  currencyCode: string;
  numberOfGuests?: number;
  showOnlyInput?: boolean;
  priceEdits: Map<string, any>;
  pendingChanges: Set<string>;
  generateKey: (roomType: string, ratePlan: string, dayIndex: number, numberOfGuests?: number) => string;
  onPriceChange: (roomType: string, ratePlan: string, dayIndex: number, value: string, numberOfGuests?: number) => void;
  onApplyToRow: (roomType: string, ratePlan: string, dayIndex: number, numberOfGuests?: number) => void;
  // ✅ Commission data directly from API response
  commissionAmount?: number;
  totalAfterCommission?: number;
}

export const PriceInput: React.FC<PriceInputProps> = ({
  roomType,
  ratePlan,
  dayIndex,
  currentPrice,
  currencyCode,
  numberOfGuests,
  showOnlyInput = false,
  priceEdits,
  pendingChanges,
  generateKey,
  onPriceChange,
  onApplyToRow,
  commissionAmount = 0,
  totalAfterCommission = 0,
}) => {
  const key = generateKey(roomType, ratePlan, dayIndex, numberOfGuests);
  const edit = priceEdits.get(key);

  const numericPrice = typeof currentPrice === 'string' 
    ? (currentPrice === 'N/A' ? 0 : parseFloat(currentPrice) || 0)
    : currentPrice;

  const displayValue = edit ? edit.value : (numericPrice || "");
  const hasChanges = pendingChanges.has(key);

  if (showOnlyInput) {
    return (
      <div className="flex flex-col items-center gap-0.5 w-full">
        {/* Editable Base Amount */}
        <div className="flex items-center gap-1 w-full justify-center">
          <input
            type="number"
            min="0"
            step="0.01"
            value={displayValue}
            onChange={(e) => onPriceChange(roomType, ratePlan, dayIndex, e.target.value, numberOfGuests)}
            className={`w-16 h-7 text-center text-xs font-bold rounded border ${
              hasChanges ? "border-orange-400 bg-orange-50" : "border-gray-300"
            } focus:outline-none focus:ring-2 focus:ring-purple-400 hover:border-gray-400 transition-colors`}
            placeholder="0"
          />
          {edit && (
            <button
              onClick={() => onApplyToRow(roomType, ratePlan, dayIndex, numberOfGuests)}
              className="p-1 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors flex-shrink-0"
              title="Apply to entire row"
            >
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Commission (Read-only) - Only show if exists */}
        {commissionAmount > 0 && (
          <span className="text-[10px] text-blue-600 font-medium">
            Comm: +{commissionAmount.toFixed(2)}
          </span>
        )}

        {/* Total (Read-only) - Only show if commission exists */}
        {totalAfterCommission > 0 && commissionAmount > 0 && (
          <span className="text-[10px] text-green-700 font-semibold">
            Sell Rate: {totalAfterCommission.toFixed(2)}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-0.5">
      {/* Editable Base Amount */}
      <div className="flex items-center gap-1">
        <input
          type="number"
          min="0"
          step="0.01"
          value={displayValue}
          onChange={(e) => onPriceChange(roomType, ratePlan, dayIndex, e.target.value, numberOfGuests)}
          className={`w-14 h-7 text-center text-xs font-bold rounded border ${
            hasChanges ? "border-orange-400 bg-orange-50" : "border-gray-300"
          } focus:outline-none focus:ring-2 focus:ring-blue-400 hover:border-gray-400 transition-colors`}
          placeholder="0"
        />
        <span className="text-[10px] text-gray-600">{currencyCode}</span>
        {edit && (
          <button
            onClick={() => onApplyToRow(roomType, ratePlan, dayIndex, numberOfGuests)}
            className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            title="Apply to entire row"
          >
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Commission (Read-only) - Only show if exists */}
      {commissionAmount > 0 && (
        <span className="text-[10px] text-blue-600 font-medium">
          Comm: +{commissionAmount.toFixed(2)}
        </span>
      )}

      {/* Total (Read-only) - Only show if commission exists */}
      {totalAfterCommission > 0 && commissionAmount > 0 && (
        <span className="text-[10px] text-green-700 font-semibold">
          Sell Rate: {totalAfterCommission.toFixed(2)}
        </span>
      )}
    </div>
  );
};
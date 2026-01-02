// components/AdditionalChargeInput.tsx

import React from "react";
import { ArrowRight } from "lucide-react";

interface AdditionalChargeInputProps {
  roomType: string;
  ratePlan: string;
  dayIndex: number;
  currentAmount: number;
  currencyCode: string;
  ageQualifyingCode: string;
  showOnlyInput?: boolean;
  priceEdits: Map<string, any>;
  pendingChanges: Set<string>;
  generateKey: (roomType: string, ratePlan: string, dayIndex: number, ageCode: string) => string;
  onChargeChange: (roomType: string, ratePlan: string, dayIndex: number, value: string, ageCode: string) => void;
  onApplyToRow: (roomType: string, ratePlan: string, dayIndex: number, ageCode: string) => void;
  // ✅ Commission data directly from API response
  commissionAmount?: number;
  totalAfterCommission?: number;
}

export const AdditionalChargeInput: React.FC<AdditionalChargeInputProps> = ({
  roomType,
  ratePlan,
  dayIndex,
  currentAmount,
  currencyCode,
  ageQualifyingCode,
  showOnlyInput = false,
  priceEdits,
  pendingChanges,
  generateKey,
  onChargeChange,
  onApplyToRow,
  commissionAmount = 0,
  totalAfterCommission = 0,
}) => {
  const key = generateKey(roomType, ratePlan, dayIndex, ageQualifyingCode);
  const edit = priceEdits.get(key);
  const displayValue = edit !== undefined ? edit.value : (currentAmount || "");
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
            onChange={(e) => onChargeChange(roomType, ratePlan, dayIndex, e.target.value, ageQualifyingCode)}
            className={`w-16 h-7 text-center text-xs font-bold rounded border ${
              hasChanges ? "border-orange-400 bg-orange-50" : "border-gray-300"
            } focus:outline-none focus:ring-2 focus:ring-blue-400 hover:border-gray-400 transition-colors`}
            placeholder="0"
          />
          {edit && (
            <button
              onClick={() => onApplyToRow(roomType, ratePlan, dayIndex, ageQualifyingCode)}
              className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex-shrink-0"
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
          onChange={(e) => onChargeChange(roomType, ratePlan, dayIndex, e.target.value, ageQualifyingCode)}
          className={`w-14 h-7 text-center text-xs font-bold rounded border ${
            hasChanges ? "border-orange-400 bg-orange-50" : "border-gray-300"
          } focus:outline-none focus:ring-2 focus:ring-blue-400 hover:border-gray-400 transition-colors`}
          placeholder="0"
        />
        <span className="text-[10px] text-gray-600">{currencyCode}</span>
        {edit && (
          <button
            onClick={() => onApplyToRow(roomType, ratePlan, dayIndex, ageQualifyingCode)}
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
          Sale Rate: {totalAfterCommission.toFixed(2)}
        </span>
      )}
    </div>
  );
};
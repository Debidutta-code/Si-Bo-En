import React from "react";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Save } from "lucide-react";

// Hooks and Components
import { useInventoryState } from "../hooks/useInventoryState";
import { UnsavedChangesDialog } from "./UnsavedChangesDialog";
import { RoomTypeSection } from "./RoomTypeSection";

// Utils and Handlers
import { getRoomTypes } from "../features";
import {
  saveAvailabilityChanges,
  savePriceChanges,
  checkUnsavedChanges,
  handleSaveAndContinue,
  handleDiscardAndContinue,
} from "../features";
import type { InventoryDay } from "../types/inventory";

interface InventoryTableProps {
  days: InventoryDay[];
  onMouseEnter: (index: number) => void;
  onMouseLeave: () => void;
  hotelCode: string;
  accessToken?: string;
  onDataUpdate?: () => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  days,
  onMouseEnter,
  onMouseLeave,
  hotelCode,
  onDataUpdate,
}) => {
  const state = useInventoryState(days);

  // Unsaved changes handlers
  const checkChanges = (action: () => void) => {
    checkUnsavedChanges(
      action,
      state.pendingChanges,
      state.setPendingAction,
      state.setShowUnsavedDialog
    );
  };

  const handleSave = async () => {
    await handleSaveAndContinue(
      state.losEdits,
      state.availabilityEdits,
      state.priceEdits,
      days,
      hotelCode,
      state.setLosEdits,
      state.setAvailabilityEdits,
      state.setPriceEdits,
      state.setPendingChanges,
      state.setShowUnsavedDialog,
      state.pendingAction,
      state.setPendingAction,
      state.expandedOccupancy,
      state.customTiers,
      onDataUpdate
    );
  };

  const handleDiscard = () => {
    handleDiscardAndContinue(
      state.setLosEdits,
      state.setAvailabilityEdits,
      state.setPriceEdits,
      state.setPendingChanges,
      state.setCustomTiers,
      state.setShowUnsavedDialog,
      state.pendingAction,
      state.setPendingAction
    );
  };

  // Save all availability changes
  const saveAllAvailability = () => {
    const roomTypesWithAvailability = new Set<string>();
    state.availabilityEdits.forEach((edit) => {
      roomTypesWithAvailability.add(edit.roomType);
    });
    Promise.all(
      Array.from(roomTypesWithAvailability).map((rt) =>
        saveAvailabilityChanges(
          rt,
          days,
          state.availabilityEdits,
          state.pendingChanges,
          // hotelCode,
          state.setAvailabilityEdits,
          state.setPendingChanges,
          onDataUpdate
        )
      )
    );
  };

  // Save all pricing changes
  const saveAllPricing = () => {
    const ratePlansWithPriceChanges = new Map<string, Set<string>>();
    state.priceEdits.forEach((edit) => {
      if (!ratePlansWithPriceChanges.has(edit.roomType)) {
        ratePlansWithPriceChanges.set(edit.roomType, new Set());
      }
      ratePlansWithPriceChanges.get(edit.roomType)!.add(edit.ratePlan);
    });
    Promise.all(
      Array.from(ratePlansWithPriceChanges.entries()).flatMap(([rt, rps]) =>
        Array.from(rps).map((rp) =>
          savePriceChanges(
            rt,
            rp,
            days,
            state.priceEdits,
            state.pendingChanges,
            state.expandedOccupancy,
            state.customTiers,
            // hotelCode,
            state.setPriceEdits,
            state.setPendingChanges,
            onDataUpdate
          )
        )
      )
    );
  };

  if (!days || days.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <div className="text-lg font-medium">No inventory data available</div>
        <div className="text-sm">Please check back later for updates</div>
      </div>
    );
  }

  const roomTypes = getRoomTypes(days);

  return (
    <>
      <div className="bg-white rounded-lg shadow border border-gray-300 overflow-hidden">
        {/* Header with Navigation */}
        <div className="relative bg-gray-50 border-b border-gray-300 py-2">
          <div className="flex items-center justify-between px-3">
            <h2 className="text-sm font-semibold text-gray-800">Inventory Overview</h2>

            <div className="flex items-center space-x-3 flex-wrap gap-2">
              {state.pendingChanges.size > 0 && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                  <span>{state.pendingChanges.size} unsaved changes</span>
                </div>
              )}

              {/* Save Availability Button */}
              {Array.from(state.pendingChanges).some((k) => k.includes("-availability-")) && (
                <button
                  onClick={saveAllAvailability}
                  className="flex items-center space-x-1 px-3 py-1 bg-green-500 text-white text-xs font-medium rounded hover:bg-green-600 transition-colors"
                >
                  <Save className="w-3 h-3" />
                  <span className="hidden sm:inline">Save Availability</span>
                  <span className="sm:hidden">Save</span>
                </button>
              )}

              {/* Save Pricing Button */}
              {Array.from(state.pendingChanges).some((k) => k.includes("-price")) && (
                <button
                  onClick={saveAllPricing}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded hover:bg-blue-600 transition-colors"
                >
                  <Save className="w-3 h-3" />
                  <span className="hidden sm:inline">Save Pricing</span>
                  <span className="sm:hidden">Save</span>
                </button>
              )}

              <button
                onClick={() => checkChanges(() => state.setShowRestrictions(!state.showRestrictions))}
                className="flex items-center space-x-1 px-3 py-1 bg-purple-500 text-white text-xs font-medium rounded hover:bg-purple-600 transition-colors"
              >
                <span className="hidden sm:inline">
                  {state.showRestrictions ? "Hide" : "Show"} Restrictions
                </span>
                <span className="sm:hidden">Restrictions</span>
                {state.showRestrictions ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              <button
                onClick={() => checkChanges(() => state.setShowRatePlans(!state.showRatePlans))}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded hover:bg-blue-600 transition-colors"
              >
                <span className="hidden sm:inline">
                  {state.showRatePlans ? "Hide" : "Show"} Rate Plans
                </span>
                <span className="sm:hidden">Plans</span>
                {state.showRatePlans ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => state.scroll("left")}
                  className="flex items-center justify-center w-6 h-6 bg-white rounded shadow-sm border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={state.scrollLeft === 0}
                >
                  <ChevronLeft className="w-3 h-3 text-gray-700" />
                </button>
                <button
                  onClick={() => state.scroll("right")}
                  className="flex items-center justify-center w-6 h-6 bg-white rounded shadow-sm border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight className="w-3 h-3 text-gray-700" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div
  ref={state.scrollContainerRef}
  onScroll={state.handleScroll}
  className="flex-1 overflow-x-auto overflow-y-auto scrollbar-hide"
  style={{ 
    scrollbarWidth: "none", 
    msOverflowStyle: "none" 
  }}
>
  <div className="min-w-max">
    {roomTypes.map((roomType) => (
      <RoomTypeSection
        key={roomType}
        roomType={roomType}
        days={days}
        state={state}
        hotelCode={hotelCode}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onDataUpdate={onDataUpdate}
      />
    ))}
  </div>
</div>

        {/* Footer with Summary */}
        <div className="bg-gray-50 border-t border-gray-300 px-3 py-1">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>
              Showing {days.length} days across {roomTypes.length} room types
            </span>
            <span>
              {state.showRestrictions && "Restrictions visible • "}
              {state.showRatePlans && "Rate plans visible"}
            </span>
          </div>
        </div>
      </div>

      {/* Unsaved Changes Dialog */}
      <UnsavedChangesDialog
        show={state.showUnsavedDialog}
        pendingChangesCount={state.pendingChanges.size}
        onSave={handleSave}
        onDiscard={handleDiscard}
      />
    </>
  );
};
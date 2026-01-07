// features/unsavedChangesHandler.ts

import { saveAvailabilityChanges, saveLOSChanges } from "./availabilityAndLosHandlers";
import { savePriceChanges } from "./pricingHandlers";

interface LOSEdit {
  roomType: string;
  ratePlan: string | null;
  dayIndex: number;
  type: "min" | "max";
  value: string;
}

interface AvailabilityEdit {
  roomType: string;
  dayIndex: number;
  value: string;
}

interface PriceEdit {
  roomType: string;
  ratePlan: string;
  dayIndex: number;
  value: string;
  numberOfGuests?: number;
  ageQualifyingCode?: string;
}

/**
 * Check if there are unsaved changes before an action
 */
export const checkUnsavedChanges = (
  action: () => void,
  pendingChanges: Set<string>,
  setPendingAction: (action: (() => void) | null) => void,
  setShowUnsavedDialog: (show: boolean) => void
) => {
  if (pendingChanges.size > 0) {
    setPendingAction(() => action);
    setShowUnsavedDialog(true);
  } else {
    action();
  }
};

/**
 * Save all changes and continue with pending action
 */
export const handleSaveAndContinue = async (
  losEdits: Map<string, LOSEdit>,
  availabilityEdits: Map<string, AvailabilityEdit>,
  priceEdits: Map<string, PriceEdit>,
  days: any[],
  hotelCode: string,
  propertyId: string,
  roomSetupData: Array<{
    id: string;
    roomName: string;
    roomType: string;
    totalRoom: number;
  }>,
  setLosEdits: (edits: Map<string, LOSEdit>) => void,
  setAvailabilityEdits: (edits: Map<string, AvailabilityEdit>) => void,
  setPriceEdits: (edits: Map<string, PriceEdit>) => void,
  setPendingChanges: (changes: Set<string>) => void,
  setShowUnsavedDialog: (show: boolean) => void,
  pendingAction: (() => void) | null,
  setPendingAction: (action: (() => void) | null) => void,
  expandedOccupancy: Set<string>,
  customTiers: Map<string, any>,
  onDataUpdate?: () => void
) => {
  const roomTypesWithChanges = new Set<string>();
  const ratePlansWithChanges = new Map<string, Set<string>>();
  const roomTypesWithAvailability = new Set<string>();
  const ratePlansWithPriceChanges = new Map<string, Set<string>>();

  // Check LOS changes
  losEdits.forEach((edit) => {
    if (edit.ratePlan) {
      if (!ratePlansWithChanges.has(edit.roomType)) {
        ratePlansWithChanges.set(edit.roomType, new Set());
      }
      ratePlansWithChanges.get(edit.roomType)!.add(edit.ratePlan);
    } else {
      roomTypesWithChanges.add(edit.roomType);
    }
  });

  // Check availability changes
  availabilityEdits.forEach((edit) => {
    roomTypesWithAvailability.add(edit.roomType);
  });

  // Check price changes
  priceEdits.forEach((edit) => {
    if (!ratePlansWithPriceChanges.has(edit.roomType)) {
      ratePlansWithPriceChanges.set(edit.roomType, new Set());
    }
    ratePlansWithPriceChanges.get(edit.roomType)!.add(edit.ratePlan);
  });

  await Promise.all([
    // Save room type LOS changes
    ...Array.from(roomTypesWithChanges).map((rt) =>
      saveLOSChanges(
        rt,
        null,
        days,
        losEdits,
        new Set(),
        hotelCode,
        "", // ✅ FIXED: Added ratePlanCode parameter (null for room type)
        setLosEdits,
        setPendingChanges,
        onDataUpdate
      )
    ),
    // Save rate plan LOS changes
    ...Array.from(ratePlansWithChanges.entries()).flatMap(([rt, rps]) =>
      Array.from(rps).map((rp) =>
        saveLOSChanges(
          rt,
          rp,
          days,
          losEdits,
          new Set(),
          hotelCode,
          rp, // ✅ FIXED: Added ratePlanCode parameter
          setLosEdits,
          setPendingChanges,
          onDataUpdate
        )
      )
    ),
    // Save availability changes
    ...Array.from(roomTypesWithAvailability).map((rt) =>
      saveAvailabilityChanges(
        rt,
        days,
        availabilityEdits,
        new Set(),
        propertyId,
        roomSetupData,
        setAvailabilityEdits,
        setPendingChanges,
        onDataUpdate
      )
    ),
    // Save price changes
    ...Array.from(ratePlansWithPriceChanges.entries()).flatMap(([rt, rps]) =>
      Array.from(rps).map((rp) =>
        savePriceChanges(
          rt,
          rp,
          days,
          priceEdits,
          new Set(),
          expandedOccupancy,
          customTiers,
          hotelCode,
          setPriceEdits,
          setPendingChanges,
          onDataUpdate
        )
      )
    ),
  ]);

  setShowUnsavedDialog(false);
  if (pendingAction) {
    pendingAction();
    setPendingAction(null);
  }
};

/**
 * Discard all changes and continue with pending action
 */
export const handleDiscardAndContinue = (
  setLosEdits: (edits: Map<string, LOSEdit>) => void,
  setAvailabilityEdits: (edits: Map<string, AvailabilityEdit>) => void,
  setPriceEdits: (edits: Map<string, PriceEdit>) => void,
  setPendingChanges: (changes: Set<string>) => void,
  setCustomTiers: (tiers: Map<string, any>) => void,
  setShowUnsavedDialog: (show: boolean) => void,
  pendingAction: (() => void) | null,
  setPendingAction: (action: (() => void) | null) => void
) => {
  setLosEdits(new Map());
  setAvailabilityEdits(new Map());
  setPriceEdits(new Map());
  setPendingChanges(new Set());
  setCustomTiers(new Map());
  setShowUnsavedDialog(false);
  
  if (pendingAction) {
    pendingAction();
    setPendingAction(null);
  }
};
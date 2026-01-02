// features/occupancyHandlers.ts

import type { InventoryDay } from "../types/inventory";
import { getRatePlanDetails, generateKey } from "../utils/inventoryUtils";
import toast from "react-hot-toast";

interface PriceEdit {
  roomType: string;
  ratePlan: string;
  dayIndex: number;
  value: string;
  numberOfGuests?: number;
  ageQualifyingCode?: string;
}

interface CustomTier {
  baseGuests: number[];
  additionalCharges: Array<{ ageCode: string; id: string }>;
}

/**
 * Toggle occupancy expansion
 */
export const toggleOccupancyExpansion = (
  roomType: string,
  ratePlan: string,
  expandedOccupancy: Set<string>,
  setExpandedOccupancy: (expanded: Set<string>) => void
) => {
  const key = generateKey.customTier(roomType, ratePlan);
  const newExpanded = new Set(expandedOccupancy);

  if (newExpanded.has(key)) {
    newExpanded.delete(key);
  } else {
    newExpanded.add(key);
  }

  setExpandedOccupancy(newExpanded);
};

/**
 * Add guest tier
 */
export const addGuestTier = (
  roomType: string,
  ratePlan: string,
  numberOfGuests: number,
  days: InventoryDay[],
  customTiers: Map<string, CustomTier>,
  priceEdits: Map<string, PriceEdit>,
  pendingChanges: Set<string>,
  setCustomTiers: (tiers: Map<string, CustomTier>) => void,
  setPriceEdits: (edits: Map<string, PriceEdit>) => void,
  setPendingChanges: (changes: Set<string>) => void
) => {
  const key = generateKey.customTier(roomType, ratePlan);
  const current = customTiers.get(key) || { baseGuests: [], additionalCharges: [] };

  if (!current.baseGuests.includes(numberOfGuests)) {
    current.baseGuests.push(numberOfGuests);
    current.baseGuests.sort((a, b) => a - b);

    const newCustomTiers = new Map(customTiers);
    newCustomTiers.set(key, current);
    setCustomTiers(newCustomTiers);

    // Auto-fill the new tier with data from first tier
    const newEdits = new Map(priceEdits);
    const newPending = new Set(pendingChanges);

    days.forEach((day, dayIndex) => {
      const firstTierKey = generateKey.price(roomType, ratePlan, dayIndex, 1);
      const firstTierEdit = priceEdits.get(firstTierKey);

      if (firstTierEdit && firstTierEdit.value) {
        const newTierKey = generateKey.price(roomType, ratePlan, dayIndex, numberOfGuests);
        newEdits.set(newTierKey, {
          roomType,
          ratePlan,
          dayIndex,
          value: firstTierEdit.value,
          numberOfGuests,
        });
        newPending.add(newTierKey);
      } else {
        const ratePlanDetails = getRatePlanDetails(day, roomType, ratePlan);
        const firstTierData = ratePlanDetails?.ratePlan?.prices?.[0]?.baseByGuestAmts?.find(
          (t: any) => t.numberOfGuests === 1
        );

        if (firstTierData && firstTierData.amountBeforeTax) {
          const newTierKey = generateKey.price(roomType, ratePlan, dayIndex, numberOfGuests);
          newEdits.set(newTierKey, {
            roomType,
            ratePlan,
            dayIndex,
            value: firstTierData.amountBeforeTax.toString(),
            numberOfGuests,
          });
          newPending.add(newTierKey);
        }
      }
    });

    setPriceEdits(newEdits);
    setPendingChanges(newPending);

    toast.success(`Added ${numberOfGuests} Guest tier with copied pricing`);
  }
};

/**
 * Remove guest tier
 */
export const removeGuestTier = (
  roomType: string,
  ratePlan: string,
  numberOfGuests: number,
  customTiers: Map<string, CustomTier>,
  setCustomTiers: (tiers: Map<string, CustomTier>) => void
) => {
  const key = generateKey.customTier(roomType, ratePlan);
  const current = customTiers.get(key);

  if (current) {
    current.baseGuests = current.baseGuests.filter(g => g !== numberOfGuests);
    const newCustomTiers = new Map(customTiers);
    newCustomTiers.set(key, current);
    setCustomTiers(newCustomTiers);
  }
};

/**
 * Add additional charge
 */
export const addAdditionalCharge = (
  roomType: string,
  ratePlan: string,
  ageCode: string,
  days: InventoryDay[],
  customTiers: Map<string, CustomTier>,
  priceEdits: Map<string, PriceEdit>,
  pendingChanges: Set<string>,
  setCustomTiers: (tiers: Map<string, CustomTier>) => void,
  setPriceEdits: (edits: Map<string, PriceEdit>) => void,
  setPendingChanges: (changes: Set<string>) => void
) => {
  const key = generateKey.customTier(roomType, ratePlan);
  const current = customTiers.get(key) || { baseGuests: [], additionalCharges: [] };

  const newCharge = {
    ageCode: ageCode,
    id: `${ageCode}-${Date.now()}-${Math.random()}`
  };

  current.additionalCharges.push(newCharge);

  const newCustomTiers = new Map(customTiers);
  newCustomTiers.set(key, current);
  setCustomTiers(newCustomTiers);

  // Auto-fill the new charge with data from existing charges of same type
  const newEdits = new Map(priceEdits);
  const newPending = new Set(pendingChanges);

  days.forEach((day, dayIndex) => {
    const existingEditKey = Array.from(priceEdits.keys()).find(k =>
      k.includes(`${roomType}-${ratePlan}-${dayIndex}-additional-`) &&
      k.includes(`-${ageCode}-`)
    );

    if (existingEditKey) {
      const existingEdit = priceEdits.get(existingEditKey);
      if (existingEdit && existingEdit.value) {
        const newChargeKey = generateKey.additionalCharge(roomType, ratePlan, dayIndex, newCharge.id);
        newEdits.set(newChargeKey, {
          roomType,
          ratePlan,
          dayIndex,
          value: existingEdit.value,
          ageQualifyingCode: newCharge.id,
        });
        newPending.add(newChargeKey);
      }
    } else {
      const ratePlanDetails = getRatePlanDetails(day, roomType, ratePlan);
      const existingCharge = ratePlanDetails?.ratePlan?.prices?.[0]?.additionalGuestAmounts?.find(
        (c: any) => c.ageQualifyingCode === ageCode
      );

      if (existingCharge && existingCharge.amount) {
        const newChargeKey = generateKey.additionalCharge(roomType, ratePlan, dayIndex, newCharge.id);
        newEdits.set(newChargeKey, {
          roomType,
          ratePlan,
          dayIndex,
          value: existingCharge.amount.toString(),
          ageQualifyingCode: newCharge.id,
        });
        newPending.add(newChargeKey);
      }
    }
  });

  setPriceEdits(newEdits);
  setPendingChanges(newPending);

  const ageLabels: { [key: string]: string } = { "10": "Adult", "8": "Child", "7": "Infant" };
  toast.success(`Added new ${ageLabels[ageCode] || "Guest"} charge row with copied pricing`);
};

/**
 * Remove additional charge
 */
export const removeAdditionalCharge = (
  roomType: string,
  ratePlan: string,
  chargeId: string,
  days: InventoryDay[],
  customTiers: Map<string, CustomTier>,
  priceEdits: Map<string, PriceEdit>,
  pendingChanges: Set<string>,
  setCustomTiers: (tiers: Map<string, CustomTier>) => void,
  setPriceEdits: (edits: Map<string, PriceEdit>) => void,
  setPendingChanges: (changes: Set<string>) => void
) => {
  const key = generateKey.customTier(roomType, ratePlan);
  const current = customTiers.get(key);

  if (current) {
    current.additionalCharges = current.additionalCharges.filter(a => a.id !== chargeId);
    const newCustomTiers = new Map(customTiers);
    newCustomTiers.set(key, current);
    setCustomTiers(newCustomTiers);

    // Clear any edits for this specific charge instance
    const newEdits = new Map(priceEdits);
    const newPending = new Set(pendingChanges);

    days.forEach((_, dayIndex) => {
      const editKey = generateKey.additionalCharge(roomType, ratePlan, dayIndex, chargeId);
      newEdits.delete(editKey);
      newPending.delete(editKey);
    });

    setPriceEdits(newEdits);
    setPendingChanges(newPending);
  }
};
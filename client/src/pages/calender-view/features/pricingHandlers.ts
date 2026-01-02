// features/pricingHandlers.ts

// import { ratePlanPush } from "../api/api";
import toast from "react-hot-toast";
import { formatDateForAPI, generateKey, getRatePlanDetails } from "../utils/inventoryUtils";
import type { InventoryDay } from "../types/inventory";

interface PriceEdit {
  roomType: string;
  ratePlan: string;
  dayIndex: number;
  value: string;
  numberOfGuests?: number;
  ageQualifyingCode?: string;
}

/**
 * Handle price input change
 */
export const handlePriceInputChange = (
  roomType: string,
  ratePlan: string,
  dayIndex: number,
  value: string,
  numberOfGuests: number | undefined,
  priceEdits: Map<string, PriceEdit>,
  pendingChanges: Set<string>,
  setPriceEdits: (edits: Map<string, PriceEdit>) => void,
  setPendingChanges: (changes: Set<string>) => void
) => {
  const key = generateKey.price(roomType, ratePlan, dayIndex, numberOfGuests);
  const newEdits = new Map(priceEdits);
  const newPending = new Set(pendingChanges);

  if (value === "") {
    newEdits.set(key, { roomType, ratePlan, dayIndex, value: "", numberOfGuests });
    newPending.add(key);
  } else {
    newEdits.set(key, { roomType, ratePlan, dayIndex, value, numberOfGuests });
    newPending.add(key);
  }

  setPriceEdits(newEdits);
  setPendingChanges(newPending);
};

/**
 * Handle additional charge input change
 */
export const handleAdditionalChargeChange = (
  roomType: string,
  ratePlan: string,
  dayIndex: number,
  value: string,
  ageQualifyingCode: string,
  priceEdits: Map<string, PriceEdit>,
  pendingChanges: Set<string>,
  setPriceEdits: (edits: Map<string, PriceEdit>) => void,
  setPendingChanges: (changes: Set<string>) => void
) => {
  const key = generateKey.additionalCharge(roomType, ratePlan, dayIndex, ageQualifyingCode);
  const newEdits = new Map(priceEdits);
  const newPending = new Set(pendingChanges);

  if (value === "") {
    newEdits.set(key, { roomType, ratePlan, dayIndex, value: "", ageQualifyingCode });
    newPending.add(key);
  } else {
    newEdits.set(key, { roomType, ratePlan, dayIndex, value, ageQualifyingCode });
    newPending.add(key);
  }

  setPriceEdits(newEdits);
  setPendingChanges(newPending);
};

/**
 * Apply price to entire row
 */
export const applyPriceToRow = (
  roomType: string,
  ratePlan: string,
  dayIndex: number,
  numberOfGuests: number | undefined,
  days: InventoryDay[],
  priceEdits: Map<string, PriceEdit>,
  pendingChanges: Set<string>,
  setPriceEdits: (edits: Map<string, PriceEdit>) => void,
  setPendingChanges: (changes: Set<string>) => void
) => {
  const key = generateKey.price(roomType, ratePlan, dayIndex, numberOfGuests);
  const edit = priceEdits.get(key);

  if (!edit || !edit.value) return;

  const newEdits = new Map(priceEdits);
  const newPending = new Set(pendingChanges);

  days.forEach((_, index) => {
    if (index >= dayIndex) { 
    const rowKey = generateKey.price(roomType, ratePlan, index, numberOfGuests);
    newEdits.set(rowKey, {
      roomType,
      ratePlan,
      dayIndex: index,
      value: edit.value,
      numberOfGuests,
    });
    newPending.add(rowKey);
  }
  });

  setPriceEdits(newEdits);
  setPendingChanges(newPending);
  toast.success(`Applied price to entire row (${days.length} days)`);
};

/**
 * Apply additional charge to entire row
 */
export const applyAdditionalChargeToRow = (
  roomType: string,
  ratePlan: string,
  dayIndex: number,
  ageQualifyingCode: string,
  days: InventoryDay[],
  priceEdits: Map<string, PriceEdit>,
  pendingChanges: Set<string>,
  setPriceEdits: (edits: Map<string, PriceEdit>) => void,
  setPendingChanges: (changes: Set<string>) => void
) => {
  const key = generateKey.additionalCharge(roomType, ratePlan, dayIndex, ageQualifyingCode);
  const edit = priceEdits.get(key);

  if (!edit || !edit.value) return;

  const newEdits = new Map(priceEdits);
  const newPending = new Set(pendingChanges);

  days.forEach((_, index) => {
    if (index >= dayIndex) { 
    const rowKey = generateKey.additionalCharge(roomType, ratePlan, index, ageQualifyingCode);
    newEdits.set(rowKey, {
      roomType,
      ratePlan,
      dayIndex: index,
      value: edit.value,
      ageQualifyingCode,
    });
    newPending.add(rowKey);
  }
  });

  setPriceEdits(newEdits);
  setPendingChanges(newPending);
};

/**
 * Validate pricing before save
 */
export const validatePricingBeforeSave = (
  roomType: string,
  ratePlan: string,
  days: InventoryDay[],
  priceEdits: Map<string, PriceEdit>,
  expandedOccupancy: Set<string>,
  customTiers: Map<string, { baseGuests: number[]; additionalCharges: Array<{ ageCode: string; id: string }> }>
): { isValid: boolean; error?: string } => {
  const isExpanded = expandedOccupancy.has(`${roomType}-${ratePlan}`);

  if (!isExpanded) {
    return { isValid: true };
  }

  const customKey = generateKey.customTier(roomType, ratePlan);
  const customData = customTiers.get(customKey) || { baseGuests: [], additionalCharges: [] };

  const firstDayData = getRatePlanDetails(days[0], roomType, ratePlan);
  const existingTiers = firstDayData?.ratePlan?.prices?.[0]?.baseByGuestAmts || [];

  const allTiers = [...existingTiers.map(t => t.numberOfGuests)];
  customData.baseGuests.forEach(num => {
    if (!allTiers.includes(num)) allTiers.push(num);
  });
  allTiers.sort((a, b) => a - b);

  const existingCharges = firstDayData?.ratePlan?.prices?.[0]?.additionalGuestAmounts || [];
  const allChargeIds = new Set<string>();

  existingCharges.forEach((charge: any, idx: number) => {
    allChargeIds.add(`existing-${charge.ageQualifyingCode}-${idx}`);
  });
  customData.additionalCharges.forEach(charge => {
    allChargeIds.add(charge.id);
  });

  // Validate new guest tiers
  for (const tierNum of customData.baseGuests) {
    for (let dayIndex = 0; dayIndex < days.length; dayIndex++) {
      const tierKey = generateKey.price(roomType, ratePlan, dayIndex, tierNum);
      const tierEdit = priceEdits.get(tierKey);

      if (!tierEdit || tierEdit.value === "" || tierEdit.value === undefined) {
        const day = days[dayIndex];
        return {
          isValid: false,
          error: `Please fill in pricing for ${tierNum} Guest${tierNum > 1 ? 's' : ''} on ${day.month.slice(0, 3)} ${day.date} before saving`
        };
      }
    }
  }

  // Validate new charges
  for (const chargeId of customData.additionalCharges.map(c => c.id)) {
    for (let dayIndex = 0; dayIndex < days.length; dayIndex++) {
      const chargeKey = generateKey.additionalCharge(roomType, ratePlan, dayIndex, chargeId);
      const chargeEdit = priceEdits.get(chargeKey);

      if (!chargeEdit || chargeEdit.value === "" || chargeEdit.value === undefined) {
        const day = days[dayIndex];
        return {
          isValid: false,
          error: `Please fill in Extra charge on ${day.month.slice(0, 3)} ${day.date} before saving`
        };
      }
    }
  }

  // Validate dates with edits that originally had no occupancy data
  const editedDays = new Set<number>();
  priceEdits.forEach((_edit, key) => {
    if (key.includes(`${roomType}-${ratePlan}-`)) {
      const match = key.match(/-(\d+)-/);
      if (match) editedDays.add(parseInt(match[1]));
    }
  });

  for (const dayIndex of editedDays) {
    const day = days[dayIndex];
    const originalData = getRatePlanDetails(day, roomType, ratePlan);
    const hadOccupancyData = (originalData?.ratePlan?.prices?.[0]?.baseByGuestAmts?.length || 0) > 0;

    if (!hadOccupancyData) {
      for (const tierNum of allTiers) {
        const tierKey = generateKey.price(roomType, ratePlan, dayIndex, tierNum);
        const tierEdit = priceEdits.get(tierKey);

        if (!tierEdit || tierEdit.value === "" || tierEdit.value === undefined) {
          return {
            isValid: false,
            error: `Please complete all pricing tiers (${tierNum} Guest${tierNum > 1 ? 's' : ''}) for ${day.month.slice(0, 3)} ${day.date} before saving`
          };
        }
      }

      for (const chargeId of allChargeIds) {
        const chargeKey = generateKey.additionalCharge(roomType, ratePlan, dayIndex, chargeId);
        const chargeEdit = priceEdits.get(chargeKey);

        if (!chargeEdit || chargeEdit.value === "" || chargeEdit.value === undefined) {
          return {
            isValid: false,
            error: `Please complete all additional charges for ${day.month.slice(0, 3)} ${day.date} before saving`
          };
        }
      }
    }
  }

  return { isValid: true };
};

/**
 * Save price changes
 */
export const savePriceChanges = async (
  roomType: string,
  ratePlan: string,
  days: InventoryDay[],
  priceEdits: Map<string, PriceEdit>,
  pendingChanges: Set<string>,
  expandedOccupancy: Set<string>,
  customTiers: Map<string, { baseGuests: number[]; additionalCharges: Array<{ ageCode: string; id: string }> }>,
  // hotelCode: string,
  setPriceEdits: (edits: Map<string, PriceEdit>) => void,
  setPendingChanges: (changes: Set<string>) => void,
  onDataUpdate?: () => void
) => {
  const relevantEdits = Array.from(priceEdits.entries()).filter(([key]) =>
    key.startsWith(`${roomType}-${ratePlan}-`) && (key.includes('-price') || key.includes('-additional-'))
  );

  if (relevantEdits.length === 0) {
    toast.error("No price changes to save");
    return;
  }

  const isExpanded = expandedOccupancy.has(`${roomType}-${ratePlan}`);

  // Validate before saving
  const validation = validatePricingBeforeSave(
    roomType,
    ratePlan,
    days,
    priceEdits,
    expandedOccupancy,
    customTiers
  );

  if (!validation.isValid) {
    toast.error(validation.error!);
    return;
  }

  try {
    const occupancyEdits = new Map<number, Map<number, number>>();
    const simpleEdits = new Map<number, number>();
    const additionalChargeEdits = new Map<number, Map<string, number>>();

    relevantEdits.forEach(([_key, edit]) => {
      if (edit.ageQualifyingCode) {
        if (!additionalChargeEdits.has(edit.dayIndex)) {
          additionalChargeEdits.set(edit.dayIndex, new Map());
        }
        const amount = edit.value === "" ? 0 : parseFloat(edit.value) || 0;
        additionalChargeEdits.get(edit.dayIndex)!.set(edit.ageQualifyingCode, amount);
      } else if (edit.numberOfGuests) {
        if (!occupancyEdits.has(edit.dayIndex)) {
          occupancyEdits.set(edit.dayIndex, new Map());
        }
        const price = edit.value === "" ? 0 : parseFloat(edit.value) || 0;
        occupancyEdits.get(edit.dayIndex)!.set(edit.numberOfGuests, price);
      } else {
        const price = edit.value === "" ? 0 : parseFloat(edit.value) || 0;
        simpleEdits.set(edit.dayIndex, price);
      }
    });

    const isOccupancyBased = occupancyEdits.size > 0;
    const dateDataList: any[] = [];

    // Build payload based on pricing type
    if (isExpanded && isOccupancyBased) {
      // Expanded view - full occupancy structure
      dateDataList.push(...buildExpandedPayload(
        roomType,
        ratePlan,
        days,
        occupancyEdits,
        additionalChargeEdits,
        customTiers
      ));
    } else if (!isExpanded && isOccupancyBased) {
      // Collapsed view - first tier only
      dateDataList.push(...buildCollapsedPayload(days, occupancyEdits));
    } else {
      // Simple pricing
      dateDataList.push(...buildSimplePayload(roomType, ratePlan, days, simpleEdits));
    }

    if (dateDataList.length === 0) {
      toast.error("No valid dates to update");
      return;
    }

    // const payload = {
    //   hotelCode: hotelCode,
    //   invTypeCode: roomType,
    //   ratePlanCode: ratePlan,
    //   isOccupancyBased: isOccupancyBased,
    //   dateDataList: dateDataList,
    // };

    // await ratePlanPush(payload, accessToken);
    toast.success(`Updated ${dateDataList.length} date(s) for ${ratePlan}`);

    // Clear saved edits
    const newEdits = new Map(priceEdits);
    const newPending = new Set(pendingChanges);

    relevantEdits.forEach(([key]) => {
      newEdits.delete(key);
      newPending.delete(key);
    });

    setPriceEdits(newEdits);
    setPendingChanges(newPending);

    if (onDataUpdate) {
      await new Promise(resolve => setTimeout(resolve, 500));
      await onDataUpdate();
    }
  } catch (error: any) {
    console.error("Failed to update pricing:", error);
    toast.error(error.message || "Failed to update pricing");
  }
};

// Helper functions for building payloads
function buildExpandedPayload(
  roomType: string,
  ratePlan: string,
  days: InventoryDay[],
  occupancyEdits: Map<number, Map<number, number>>,
  additionalChargeEdits: Map<number, Map<string, number>>,
  _customTiers: Map<string, { baseGuests: number[]; additionalCharges: Array<{ ageCode: string; id: string }> }>
) {
  const dateDataList: any[] = [];
  
  for (const [dayIndex, guestPrices] of occupancyEdits.entries()) {
    const day = days[dayIndex];
    if (!day) continue;

    const formattedDate = formatDateForAPI(day);
    const ratePlanDetails = getRatePlanDetails(day, roomType, ratePlan);
    
    const existingTiers = ratePlanDetails?.ratePlan?.prices?.[0]?.baseByGuestAmts || [];
    const existingAdditional = ratePlanDetails?.ratePlan?.prices?.[0]?.additionalGuestAmounts || [];

    const allTierNumbers = new Set<number>();
    existingTiers.forEach((t: any) => allTierNumbers.add(t.numberOfGuests));
    guestPrices.forEach((_, num) => allTierNumbers.add(num));

    const baseByGuestAmts = Array.from(allTierNumbers).sort((a, b) => a - b).map(numberOfGuests => {
      const editedPrice = guestPrices.get(numberOfGuests);
      if (editedPrice !== undefined) {
        return { numberOfGuests, amountBeforeTax: editedPrice };
      }
      
      const existingTier = existingTiers.find((t: any) => t.numberOfGuests === numberOfGuests);
      if (existingTier) {
        return { numberOfGuests, amountBeforeTax: existingTier.amountBeforeTax };
      }
      
      return { numberOfGuests, amountBeforeTax: 0 };
    });

    const additionalMap = additionalChargeEdits.get(dayIndex);
    const allAdditionalCodes = new Set<string>();
    existingAdditional.forEach((a: any) => allAdditionalCodes.add(a.ageQualifyingCode));
    if (additionalMap) {
      additionalMap.forEach((_, code) => {
        const actualAgeCode = code.startsWith('existing-') 
          ? code.split('-')[1]
          : code;
        allAdditionalCodes.add(actualAgeCode);
      });
    }

    const additionalGuestAmounts = Array.from(allAdditionalCodes).map(ageCode => {
      const editedAmount = additionalMap?.get(ageCode);
      if (editedAmount !== undefined) {
        return { ageQualifyingCode: ageCode, amount: editedAmount };
      }
      
      const existing = existingAdditional.find((a: any) => a.ageQualifyingCode === ageCode);
      if (existing) {
        return { ageQualifyingCode: ageCode, amount: existing.amount };
      }
      
      return { ageQualifyingCode: ageCode, amount: 0 };
    });

    dateDataList.push({
      date: formattedDate,
      baseByGuestAmts,
      additionalGuestAmounts: additionalGuestAmounts.length > 0 ? additionalGuestAmounts : undefined
    });
  }

  return dateDataList;
}

function buildCollapsedPayload(
  days: InventoryDay[],
  occupancyEdits: Map<number, Map<number, number>>
) {
  const dateDataList: any[] = [];

  for (const [dayIndex, guestPrices] of occupancyEdits.entries()) {
    const day = days[dayIndex];
    if (!day) continue;

    const formattedDate = formatDateForAPI(day);
    const firstTierPrice = guestPrices.get(1);

    if (firstTierPrice !== undefined) {
      dateDataList.push({
        date: formattedDate,
        baseByGuestAmts: [{ numberOfGuests: 1, amountBeforeTax: firstTierPrice }]
      });
    }
  }

  return dateDataList;
}

function buildSimplePayload(
  roomType: string,
  ratePlan: string,
  days: InventoryDay[],
  simpleEdits: Map<number, number>
) {
  const dateDataList: any[] = [];

  for (const [dayIndex, price] of simpleEdits.entries()) {
    const day = days[dayIndex];
    if (!day) continue;

    const formattedDate = formatDateForAPI(day);
    const ratePlanDetails = getRatePlanDetails(day, roomType, ratePlan);
    const hasOccupancyStructure = ratePlanDetails?.ratePlan?.prices?.[0]?.baseByGuestAmts;

    if (hasOccupancyStructure) {
      dateDataList.push({
        date: formattedDate,
        baseByGuestAmts: [{ numberOfGuests: 1, amountBeforeTax: price }],
        additionalGuestAmounts: []
      });
    } else {
      dateDataList.push({
        date: formattedDate,
        price: price
      });
    }
  }

  return dateDataList;
}
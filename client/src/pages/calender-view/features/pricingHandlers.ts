// features/pricingHandlers.ts

// import { ratePlanPush } from "../api/api";
import toast from "react-hot-toast";
import { formatDateForAPI, generateKey, getRatePlanDetails } from "../utils/inventoryUtils";
import type { InventoryDay } from "../types/inventory";
import { updateRatePlanChargesService } from "../services/inventory.service";

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


export const savePriceChanges = async (
  roomType: string,
  ratePlan: string,
  days: InventoryDay[],
  priceEdits: Map<string, PriceEdit>,
  pendingChanges: Set<string>,
  expandedOccupancy: Set<string>,
  customTiers: Map<string, { baseGuests: number[]; additionalCharges: Array<{ ageCode: string; id: string }> }>,
  hotelCode: string,
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

  // const isExpanded = expandedOccupancy.has(`${roomType}-${ratePlan}`);

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
    // Group edits by date
    const editsByDate = new Map<number, {
      baseGuests: Map<number, number>;
      additionalCharges: Map<string, number>;
    }>();

    relevantEdits.forEach(([_key, edit]) => {
      if (!editsByDate.has(edit.dayIndex)) {
        editsByDate.set(edit.dayIndex, {
          baseGuests: new Map(),
          additionalCharges: new Map()
        });
      }

      const dayData = editsByDate.get(edit.dayIndex)!;

      if (edit.ageQualifyingCode) {
        // ✅ FIXED: Extract actual age code properly
        const ageCode = extractAgeCode(edit.ageQualifyingCode);
        const amount = edit.value === "" ? 0 : parseFloat(edit.value) || 0;
        dayData.additionalCharges.set(ageCode, amount);
      } else if (edit.numberOfGuests) {
        const price = edit.value === "" ? 0 : parseFloat(edit.value) || 0;
        dayData.baseGuests.set(edit.numberOfGuests, price);
      }
    });

    const propertyCode = hotelCode;

    // Find continuous date ranges with same pricing
    const sortedIndices = Array.from(editsByDate.keys()).sort((a, b) => a - b);
    const dateRanges: Array<{
      startIndex: number;
      endIndex: number;
      data: { baseGuests: Map<number, number>; additionalCharges: Map<string, number> };
    }> = [];

    let currentRange: typeof dateRanges[0] | null = null;

    for (const dayIndex of sortedIndices) {
      const dayData = editsByDate.get(dayIndex)!;

      if (!currentRange) {
        currentRange = {
          startIndex: dayIndex,
          endIndex: dayIndex,
          data: dayData
        };
      } else {
        const isSameStructure = 
          areMapsEqual(currentRange.data.baseGuests, dayData.baseGuests) &&
          areMapsEqual(currentRange.data.additionalCharges, dayData.additionalCharges);

        if (dayIndex === currentRange.endIndex + 1 && isSameStructure) {
          currentRange.endIndex = dayIndex;
        } else {
          dateRanges.push(currentRange);
          currentRange = {
            startIndex: dayIndex,
            endIndex: dayIndex,
            data: dayData
          };
        }
      }
    }

    if (currentRange) {
      dateRanges.push(currentRange);
    }

    // console.log(`📊 Grouped into ${dateRanges.length} date range(s)`, dateRanges);

    // Process each date range
    const promises = dateRanges.map(async (range) => {
      const startDay = days[range.startIndex];
      const endDay = days[range.endIndex];

      // ✅ Get complete tier information
      const customKey = generateKey.customTier(roomType, ratePlan);
      const customData = customTiers.get(customKey) || { baseGuests: [], additionalCharges: [] };
      
      const firstDayData = getRatePlanDetails(startDay, roomType, ratePlan);
      const existingTiers = firstDayData?.ratePlan?.prices?.[0]?.baseByGuestAmts || [];
      const existingAdditional = firstDayData?.ratePlan?.prices?.[0]?.additionalGuestAmounts || [];

      // ✅ Build complete list of all guest tiers
      const allTierNumbers = new Set<number>();
      existingTiers.forEach((t: any) => allTierNumbers.add(t.numberOfGuests));
      customData.baseGuests.forEach((num: number) => allTierNumbers.add(num));
      range.data.baseGuests.forEach((_, num) => allTierNumbers.add(num));

      const allTiers = Array.from(allTierNumbers).sort((a, b) => a - b);

      // console.log(`👥 All guest tiers for this range:`, allTiers);

      // ✅ Build base guest amounts - MUST include ALL tiers
      const baseGuestAmounts = allTiers.map(numberOfGuests => {
        // First check if we have an edit for this tier
        const editedPrice = range.data.baseGuests.get(numberOfGuests);
        if (editedPrice !== undefined) {
          // console.log(`✏️ Using edited price for ${numberOfGuests} guests: $${editedPrice}`);
          return { numberOfGuests, amountBeforeTax: editedPrice };
        }
        
        // Otherwise, use existing tier data
        const existingTier = existingTiers.find((t: any) => t.numberOfGuests === numberOfGuests);
        if (existingTier) {
          // console.log(`📋 Using existing price for ${numberOfGuests} guests: $${existingTier.amountBeforeTax}`);
          return {
            numberOfGuests,
            amountBeforeTax: existingTier.amountBeforeTax
          };
        }

        // If neither exists (new tier), use 0
        // console.log(`🆕 New tier ${numberOfGuests} guests with default price: $0`);
        return {
          numberOfGuests,
          amountBeforeTax: 0
        };
      });

      // ✅ Build additional guest amounts
      const allAdditionalCodes = new Set<string>();
      existingAdditional.forEach((a: any) => allAdditionalCodes.add(a.ageQualifyingCode));
      customData.additionalCharges.forEach((charge: any) => {
        const ageCode = extractAgeCode(charge.id);
        allAdditionalCodes.add(ageCode);
      });
      range.data.additionalCharges.forEach((_, code) => allAdditionalCodes.add(code));

      const additionalGuestAmounts: Array<{
        ageQualifyingCode: string;
        amount: number;
      }> = [];

      allAdditionalCodes.forEach(ageCode => {
        // First check if we have an edit
        const editedAmount = range.data.additionalCharges.get(ageCode);
        if (editedAmount !== undefined) {
          // console.log(` Using edited additional charge for age ${ageCode}: $${editedAmount}`);
          additionalGuestAmounts.push({
            ageQualifyingCode: ageCode,
            amount: editedAmount
          });
          return;
        }

        // Otherwise use existing
        const existing = existingAdditional.find((a: any) => a.ageQualifyingCode === ageCode);
        if (existing) {
          // console.log(` Using existing additional charge for age ${ageCode}: $${existing.amount}`);
          additionalGuestAmounts.push({
            ageQualifyingCode: ageCode,
            amount: existing.amount
          });
        }
      });

      // ✅ Format dates properly (YYYY-MM-DD)
      const startDate = formatDateForAPI(startDay);
      const endDate = formatDateForAPI(endDay);

      // console.log(`💾 API Payload:`, {
      //   propertyCode,
      //   roomTypeCode: roomType,
      //   ratePlanCode: ratePlan,
      //   startDate,
      //   endDate,
      //   baseGuestAmounts,
      //   additionalGuestAmounts
      // });

      // Call API
      return updateRatePlanChargesService({
        propertyCode,
        roomTypeCode: roomType,
        ratePlanCode: ratePlan,
        startDate,
        endDate,
        baseGuestAmounts,
        additionalGuestAmounts: additionalGuestAmounts.length > 0 ? additionalGuestAmounts : undefined
      });
    });

    const results = await Promise.all(promises);

    // Check results
    const allSucceeded = results.every(r => r.success);
    const failedResults = results.filter(r => !r.success);

    if (allSucceeded) {
      const totalDates = results.reduce((sum, r) => {
        return sum + ((r.data?.updated || 0) + (r.data?.created || 0));
      }, 0);

      toast.success(` Successfully updated ${totalDates} date(s) for ${ratePlan}`);

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
    } else {
      console.error(" Failed results:", failedResults);
      
      // Show detailed error messages
      failedResults.forEach((result, index) => {
        console.error(`Failed API call ${index + 1}:`, result);
      });

      toast.error(
        `Failed to update ${failedResults.length} date range(s): ${failedResults[0]?.message || 'Unknown error'}`,
        { duration: 5000 }
      );
    }
  } catch (error: any) {
    console.error("❌ Failed to update pricing:", error);
    toast.error(error.message || "Failed to update pricing");
  }
};

// ✅ Helper function to extract age code from charge ID
function extractAgeCode(chargeId: string): string {
  // Handle formats like:
  // "existing-10-0" -> "10"
  // "10-1234567890-0.123" -> "10"
  // "10" -> "10"
  
  if (chargeId.startsWith('existing-')) {
    // Format: "existing-10-0"
    return chargeId.split('-')[1];
  }
  
  // Format: "10-1234567890-0.123" or just "10"
  return chargeId.split('-')[0];
}

// Helper function to compare Maps
function areMapsEqual<K, V>(map1: Map<K, V>, map2: Map<K, V>): boolean {
  if (map1.size !== map2.size) return false;
  
  for (const [key, value] of map1) {
    if (!map2.has(key) || map2.get(key) !== value) {
      return false;
    }
  }
  
  return true;
}


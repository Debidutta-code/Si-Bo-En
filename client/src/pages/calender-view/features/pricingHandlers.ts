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
  setPendingChanges: (changes: Set<string>) => void,
  ageQualifyingCode?: string
) => {
  const key = generateKey.price(roomType, ratePlan, dayIndex, numberOfGuests, ageQualifyingCode);
  const newEdits = new Map(priceEdits);
  const newPending = new Set(pendingChanges);

  if (value === "") {
    newEdits.set(key, { roomType, ratePlan, dayIndex, value: "", numberOfGuests, ageQualifyingCode });
    newPending.add(key);
  } else {
    newEdits.set(key, { roomType, ratePlan, dayIndex, value, numberOfGuests, ageQualifyingCode });
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
  setPendingChanges: (changes: Set<string>) => void,
  ageQualifyingCode?: string
) => {
  const key = generateKey.price(roomType, ratePlan, dayIndex, numberOfGuests, ageQualifyingCode);
  const edit = priceEdits.get(key);

  if (!edit || !edit.value) return;

  const newEdits = new Map(priceEdits);
  const newPending = new Set(pendingChanges);

  days.forEach((_, index) => {
    if (index >= dayIndex) {
      const rowKey = generateKey.price(roomType, ratePlan, index, numberOfGuests, ageQualifyingCode);
      newEdits.set(rowKey, {
        roomType,
        ratePlan,
        dayIndex: index,
        value: edit.value,
        numberOfGuests,
        ageQualifyingCode,
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

const getGuestTierLabel = (numberOfGuests: number, ageCode: string): string => {
  const labels: Record<string, string> = { "10": "Adult", "8": "Child", "7": "Infant" };
  const label = labels[ageCode] || "Guest";
  if (numberOfGuests > 1) return `${numberOfGuests} ${label}s`;
  return `${numberOfGuests} ${label}`;
};

/**
 * Validate pricing before save.
 *
 * Rules:
 * - ALL adult tiers 1..maxAdults are required (edit OR existing API price). No gaps, no zeros.
 * - If API only has 2 adults but maxAdults=3, tier 3 must be provided via edit.
 * - Child tiers are optional.
 */
export const validatePricingBeforeSave = (
  roomType: string,
  ratePlan: string,
  days: InventoryDay[],
  priceEdits: Map<string, PriceEdit>,
  expandedOccupancy: Set<string>,
  _customTiers: Map<string, { baseGuests: Array<{ numberOfGuests: number; ageQualifyingCode: string }>; additionalCharges: Array<{ ageCode: string; id: string }> }>
): { isValid: boolean; error?: string } => {
  const isExpanded = expandedOccupancy.has(`${roomType}-${ratePlan}`);
  if (!isExpanded) return { isValid: true };

  for (let dayIndex = 0; dayIndex < days.length; dayIndex++) {
    const day = days[dayIndex];
    const ratePlanDetails = getRatePlanDetails(day, roomType, ratePlan);
    const existingTiers = ratePlanDetails?.baseByGuestAmts || [];

    // Check if this day has ANY edit at all
    const dayHasAnyEdit = Array.from(priceEdits.values()).some(
      (e) => e.roomType === roomType && e.ratePlan === ratePlan && e.dayIndex === dayIndex
    );
    if (!dayHasAnyEdit) continue;

    // Get maxAdults from room type capacity
    const roomTypeData = day.roomTypes?.find((r: any) => r.invTypeCode === roomType);
    const maxAdults = roomTypeData?.maxAdults ?? 1;

    // Validate ALL adult tiers 1..maxAdults
    for (let n = 1; n <= maxAdults; n++) {
      const key = generateKey.price(roomType, ratePlan, dayIndex, n, "10");
      const edit = priceEdits.get(key);
      const editedPrice = edit ? parseFloat(edit.value) : null;

      // Fall back to existing API price
      const existingTier = existingTiers.find(
        (t: any) => t.numberOfGuests === n && (t.ageQualifyingCode || "10") === "10"
      );
      const apiPrice = existingTier?.amountBeforeTax ?? 0;

      // Must have either a valid edit or an existing API price
      if (editedPrice !== null) {
        if (isNaN(editedPrice) || editedPrice <= 0) {
          return {
            isValid: false,
            error: `${getGuestTierLabel(n, "10")} price cannot be 0 for ${day.month.slice(0, 3)} ${day.date}.`,
          };
        }
      } else if (apiPrice <= 0) {
        return {
          isValid: false,
          error: `${getGuestTierLabel(n, "10")} price is missing for ${day.month.slice(0, 3)} ${day.date}. All ${maxAdults} adult tiers are required.`,
        };
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
  customTiers: Map<string, { baseGuests: Array<{ numberOfGuests: number; ageQualifyingCode: string }>; additionalCharges: Array<{ ageCode: string; id: string }> }>,
  hotelCode: string,
  setPriceEdits: (edits: Map<string, PriceEdit>) => void,
  setPendingChanges: (changes: Set<string>) => void,
  onDataUpdate?: () => void
) => {
  const relevantEdits = Array.from(priceEdits.entries()).filter(([key]) =>
    key.startsWith(`${roomType}-${ratePlan}-`) &&
    (key.includes('-price') || key.includes('-additional-'))
  );

  if (relevantEdits.length === 0) {
    toast.error("No price changes to save");
    return;
  }

  // Run pre-save validation
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
    const editsByDate = new Map<number, {
      baseGuests: Map<string, { numberOfGuests: number; amountBeforeTax: number; ageQualifyingCode: string }>;
      additionalCharges: Map<string, number>;
    }>();

    relevantEdits.forEach(([key, edit]) => {
      if (!editsByDate.has(edit.dayIndex)) {
        editsByDate.set(edit.dayIndex, {
          baseGuests: new Map(),
          additionalCharges: new Map(),
        });
      }

      const dayData = editsByDate.get(edit.dayIndex)!;

      if (key.includes('-additional-')) {
        const ageCode = extractAgeCode(edit.ageQualifyingCode!);
        const amount = edit.value === "" ? 0 : parseFloat(edit.value) || 0;
        dayData.additionalCharges.set(ageCode, amount);
      } else if (edit.numberOfGuests) {
        const price = edit.value === "" ? 0 : parseFloat(edit.value) || 0;
        const ageCode = edit.ageQualifyingCode || "10";
        const compositeKey = `${edit.numberOfGuests}-${ageCode}`;
        dayData.baseGuests.set(compositeKey, {
          numberOfGuests: edit.numberOfGuests,
          amountBeforeTax: price,
          ageQualifyingCode: ageCode,
        });
      }
    });

    const propertyCode = hotelCode;

    const sortedIndices = Array.from(editsByDate.keys()).sort((a, b) => a - b);
    const dateRanges: Array<{
      startIndex: number;
      endIndex: number;
      data: {
        baseGuests: Map<string, { numberOfGuests: number; amountBeforeTax: number; ageQualifyingCode: string }>;
        additionalCharges: Map<string, number>;
      };
    }> = [];

    let currentRange: typeof dateRanges[0] | null = null;

    for (const dayIndex of sortedIndices) {
      const dayData = editsByDate.get(dayIndex)!;

      if (!currentRange) {
        currentRange = { startIndex: dayIndex, endIndex: dayIndex, data: dayData };
      } else {
        const isSameStructure =
          areMapsEqualDeep(currentRange.data.baseGuests, dayData.baseGuests) &&
          areMapsEqual(currentRange.data.additionalCharges, dayData.additionalCharges);

        if (dayIndex === currentRange.endIndex + 1 && isSameStructure) {
          currentRange.endIndex = dayIndex;
        } else {
          dateRanges.push(currentRange);
          currentRange = { startIndex: dayIndex, endIndex: dayIndex, data: dayData };
        }
      }
    }

    if (currentRange) {
      dateRanges.push(currentRange);
    }

    const promises = dateRanges.map(async (range) => {
      const startDay = days[range.startIndex];
      const endDay = days[range.endIndex];

      const customKey = generateKey.customTier(roomType, ratePlan);
      const customData = customTiers.get(customKey) || { baseGuests: [], additionalCharges: [] };

      const firstDayData = getRatePlanDetails(startDay, roomType, ratePlan);
      const existingTiers = firstDayData?.baseByGuestAmts || [];
      const existingAdditional = firstDayData?.additionalGuestAmounts || [];

      // Get maxAdults from room type capacity
      const roomTypeData = startDay.roomTypes?.find((r: any) => r.invTypeCode === roomType);
      const maxAdults = roomTypeData?.maxAdults ?? 1;

      const existingChildTiers = existingTiers.filter(
        (t: any) => t.ageQualifyingCode === "8"
      );

      const baseGuestAmounts: Array<{
        numberOfGuests: number;
        ageQualifyingCode: string;
        amountBeforeTax: number;
      }> = [];
      const missingAdultTiers: string[] = [];

      // ================================================================
      // ADULT TIERS — build all tiers 1..maxAdults
      // Priority: user edit > existing API price > error (missing)
      // ================================================================
      for (let n = 1; n <= maxAdults; n++) {
        const compositeKey = `${n}-10`;
        const editData = range.data.baseGuests.get(compositeKey);

        // Find existing API price for this tier
        const existingTier = existingTiers.find(
          (t: any) => t.numberOfGuests === n && (t.ageQualifyingCode || "10") === "10"
        );
        const apiPrice = existingTier?.amountBeforeTax ?? 0;

        if (editData !== undefined && editData.amountBeforeTax > 0) {
          baseGuestAmounts.push({
            numberOfGuests: n,
            ageQualifyingCode: "10",
            amountBeforeTax: editData.amountBeforeTax,
          });
        } else if (apiPrice > 0) {
          baseGuestAmounts.push({
            numberOfGuests: n,
            ageQualifyingCode: "10",
            amountBeforeTax: apiPrice,
          });
        } else {
          missingAdultTiers.push(`${getGuestTierLabel(n, "10")}`);
        }
      }

      // ================================================================
      // CUSTOM ADULT TIERS (beyond maxAdults) - FIXED to handle objects
      // ================================================================
      for (const customGuest of customData.baseGuests) {
        // Handle both old format (number) and new format (object) for backward compatibility
        const numGuests = typeof customGuest === 'number' ? customGuest : customGuest.numberOfGuests;
        const ageCode = typeof customGuest === 'object' ? customGuest.ageQualifyingCode : "10";

        // Only process adult tiers (ageCode "10") - child tiers handled separately
        if (ageCode !== "10") continue;

        if (numGuests <= maxAdults) continue; // already handled in the 1..maxAdults loop

        const compositeKey = `${numGuests}-10`;
        const editData = range.data.baseGuests.get(compositeKey);
        const existingTier = existingTiers.find(
          (t: any) => t.numberOfGuests === numGuests && (t.ageQualifyingCode || "10") === "10"
        );
        const apiPrice = existingTier?.amountBeforeTax ?? 0;

        if (editData && editData.amountBeforeTax > 0) {
          baseGuestAmounts.push({
            numberOfGuests: numGuests,
            ageQualifyingCode: "10",
            amountBeforeTax: editData.amountBeforeTax,
          });
        } else if (apiPrice > 0) {
          baseGuestAmounts.push({
            numberOfGuests: numGuests,
            ageQualifyingCode: "10",
            amountBeforeTax: apiPrice,
          });
        } else {
          missingAdultTiers.push(`${getGuestTierLabel(numGuests, "10")} (custom)`);
        }
      }

      if (missingAdultTiers.length > 0) {
        const startDate = formatDateForAPI(startDay);
        const endDate = formatDateForAPI(endDay);
        throw new Error(
          `Missing adult prices for ${startDate === endDate ? startDate : `${startDate} to ${endDate}`}: ${missingAdultTiers.join(", ")}. All adult tiers are required.`
        );
      }

     
      for (const tier of existingChildTiers) {
        const compositeKey = `${tier.numberOfGuests}-8`;
        const editData = range.data.baseGuests.get(compositeKey);

        if (editData !== undefined) {
          if (editData.amountBeforeTax > 0) {
            baseGuestAmounts.push({
              numberOfGuests: tier.numberOfGuests,
              ageQualifyingCode: "8",
              amountBeforeTax: editData.amountBeforeTax,
            });
          }
        } else if (tier.amountBeforeTax > 0) {
          baseGuestAmounts.push({
            numberOfGuests: tier.numberOfGuests,
            ageQualifyingCode: "8",
            amountBeforeTax: tier.amountBeforeTax,
          });
        }
      }

      // ✅ ADD CUSTOM CHILD TIERS (from customData.baseGuests)
      for (const customGuest of customData.baseGuests) {
        // Handle both old format (number) and new format (object)
        const numGuests = typeof customGuest === 'number' ? customGuest : customGuest.numberOfGuests;
        const ageCode = typeof customGuest === 'object' ? customGuest.ageQualifyingCode : "10";

        // Only process child tiers (ageCode "8")
        if (ageCode !== "8") continue;

        const compositeKey = `${numGuests}-8`;
        const editData = range.data.baseGuests.get(compositeKey);

        // Check if this child tier already exists in API (to avoid duplication)
        const existsInApi = existingChildTiers.some(
          (t: any) => t.numberOfGuests === numGuests
        );

        // If it exists in API, skip (already handled above)
        if (existsInApi) continue;

        // Add custom child tier if it has a price
        if (editData !== undefined && editData.amountBeforeTax > 0) {
          baseGuestAmounts.push({
            numberOfGuests: numGuests,
            ageQualifyingCode: "8",
            amountBeforeTax: editData.amountBeforeTax,
          });
        }
      }

      const allAdditionalCodes = new Set<string>();
      existingAdditional.forEach((a: any) => allAdditionalCodes.add(a.ageQualifyingCode));
      customData.additionalCharges.forEach((charge: any) => {
        const ageCode = extractAgeCode(charge.id);
        allAdditionalCodes.add(ageCode);
      });
      range.data.additionalCharges.forEach((_, code) => allAdditionalCodes.add(code));

      const additionalGuestAmounts: Array<{ ageQualifyingCode: string; amount: number }> = [];

      allAdditionalCodes.forEach((ageCode) => {
        const editedAmount = range.data.additionalCharges.get(ageCode);
        if (editedAmount !== undefined) {
          additionalGuestAmounts.push({ ageQualifyingCode: ageCode, amount: editedAmount });
          return;
        }
        const existing = existingAdditional.find((a: any) => a.ageQualifyingCode === ageCode);
        if (existing) {
          additionalGuestAmounts.push({ ageQualifyingCode: ageCode, amount: existing.amount });
        }
      });

      const startDate = formatDateForAPI(startDay);
      const endDate = formatDateForAPI(endDay);
      const currencyCode = getRatePlanDetails(days[0], roomType, ratePlan)?.currencyCode || "USD";

      const payload = {
        propertyCode,
        roomTypeCode: roomType,
        ratePlanCode: ratePlan,
        startDate,
        endDate,
        baseGuestAmounts,
        additionalGuestAmounts: additionalGuestAmounts.length > 0 ? additionalGuestAmounts : undefined,
        currencyCode,
      };

      return updateRatePlanChargesService(payload);
    });

    const results = await Promise.all(promises);

    const allSucceeded = results.every((r) => r.success);
    const failedResults = results.filter((r) => !r.success);

    if (allSucceeded) {
      const totalDates = results.reduce((sum, r) => {
        return sum + ((r.data?.updated || 0) + (r.data?.created || 0));
      }, 0);

      toast.success(`Successfully updated ${totalDates} date(s) for ${ratePlan}`);

      const newEdits = new Map(priceEdits);
      const newPending = new Set(pendingChanges);
      relevantEdits.forEach(([key]) => {
        newEdits.delete(key);
        newPending.delete(key);
      });
      setPriceEdits(newEdits);
      setPendingChanges(newPending);

      if (onDataUpdate) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        await onDataUpdate();
      }
    } else {
      toast.error(
        `Failed to update ${failedResults.length} date range(s): ${failedResults[0]?.message || "Unknown error"}`,
        { duration: 5000 }
      );
    }
  } catch (error: any) {
    console.error("❌ Failed to update pricing:", error);
    toast.error(error.message || "Failed to update pricing");
  }
};

function extractAgeCode(chargeId: string): string {
  if (chargeId.startsWith("existing-")) {
    return chargeId.split("-")[1];
  }
  return chargeId.split("-")[0];
}

function areMapsEqual<K, V>(map1: Map<K, V>, map2: Map<K, V>): boolean {
  if (map1.size !== map2.size) return false;
  for (const [key, value] of map1) {
    if (!map2.has(key) || map2.get(key) !== value) return false;
  }
  return true;
}

function areMapsEqualDeep<K, V>(map1: Map<K, V>, map2: Map<K, V>): boolean {
  if (map1.size !== map2.size) return false;
  for (const [key, value] of map1) {
    if (!map2.has(key) || JSON.stringify(map2.get(key)) !== JSON.stringify(value)) return false;
  }
  return true;
}
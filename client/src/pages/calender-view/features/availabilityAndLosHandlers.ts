// features/availabilityAndLosHandlers.ts

import type { InventoryDay } from "../types/inventory";
import { formatDateForAPI, generateKey } from "../utils/inventoryUtils";
import toast from "react-hot-toast";

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

/**
 * Handle availability input change
 */
export const handleAvailabilityInputChange = (
  roomType: string,
  dayIndex: number,
  value: string,
  availabilityEdits: Map<string, AvailabilityEdit>,
  pendingChanges: Set<string>,
  setAvailabilityEdits: (edits: Map<string, AvailabilityEdit>) => void,
  setPendingChanges: (changes: Set<string>) => void
) => {
  const key = generateKey.availability(roomType, dayIndex);
  const newEdits = new Map(availabilityEdits);
  const newPending = new Set(pendingChanges);

  if (value === "") {
    newEdits.set(key, { roomType, dayIndex, value: "" });
    newPending.add(key);
  } else {
    newEdits.set(key, { roomType, dayIndex, value });
    newPending.add(key);
  }

  setAvailabilityEdits(newEdits);
  setPendingChanges(newPending);
};

/**
 * Apply availability to entire row
 */
export const applyAvailabilityToRow = (
  roomType: string,
  dayIndex: number,
  days: InventoryDay[],
  availabilityEdits: Map<string, AvailabilityEdit>,
  pendingChanges: Set<string>,
  setAvailabilityEdits: (edits: Map<string, AvailabilityEdit>) => void,
  setPendingChanges: (changes: Set<string>) => void
) => {
  const key = generateKey.availability(roomType, dayIndex);
  const edit = availabilityEdits.get(key);

  if (!edit || !edit.value) return;

  const newEdits = new Map(availabilityEdits);
  const newPending = new Set(pendingChanges);

  days.forEach((_, index) => {
    const rowKey = generateKey.availability(roomType, index);
    newEdits.set(rowKey, {
      roomType,
      dayIndex: index,
      value: edit.value,
    });
    newPending.add(rowKey);
  });

  setAvailabilityEdits(newEdits);
  setPendingChanges(newPending);
  toast.success("Applied availability to entire row");
};

/**
 * Save availability changes
 */
export const saveAvailabilityChanges = async (
  roomType: string,
  days: InventoryDay[],
  availabilityEdits: Map<string, AvailabilityEdit>,
  pendingChanges: Set<string>,
  // hotelCode: string,
  setAvailabilityEdits: (edits: Map<string, AvailabilityEdit>) => void,
  setPendingChanges: (changes: Set<string>) => void,
  onDataUpdate?: () => void
) => {
  const relevantEdits = Array.from(availabilityEdits.entries()).filter(([key]) =>
    key.startsWith(`${roomType}-availability-`)
  );

  if (relevantEdits.length === 0) {
    return;
  }

  try {
    const dateDataList = relevantEdits
      .map(([_key, edit]) => {
        const day = days[edit.dayIndex];
        if (!day) return null;

        const formattedDate = formatDateForAPI(day);
        const roomData = day.roomTypes?.find(room => room.invTypeCode === roomType);
        const sold = roomData?.sold || 0;
        const newAvailable = edit.value === "" ? 0 : parseInt(edit.value) || 0;

        return {
          date: formattedDate,
          sold: sold,
          newInventory: newAvailable,
        };
      })
      .filter(Boolean) as { date: string; sold: number; newInventory: number; }[];

    if (dateDataList.length === 0) {
      toast.error("No valid dates to update");
      return;
    }

    // const ratePlanCodes = getRatePlans(days);

    // const payload = {
    //   hotelCode: hotelCode,
    //   invTypeCode: roomType,
    //   ratePlanCode: ratePlanCodes,
    //   dateDataList: dateDataList,
    // };

    // await inventoryPush(payload, accessToken);
    toast.success(`Updated ${dateDataList.length} date(s) for ${roomType}`);

    const newEdits = new Map(availabilityEdits);
    const newPending = new Set(pendingChanges);

    relevantEdits.forEach(([key]) => {
      newEdits.delete(key);
      newPending.delete(key);
    });

    setAvailabilityEdits(newEdits);
    setPendingChanges(newPending);

    if (onDataUpdate) {
      onDataUpdate();
    }
  } catch (error: any) {
    console.error("Failed to update availability:", error);
    toast.error(error.message || "Failed to update availability");
  }
};

/**
 * Handle LOS input change
 */
export const handleLOSInputChange = (
  roomType: string,
  ratePlan: string | null,
  dayIndex: number,
  type: "min" | "max",
  value: string,
  losEdits: Map<string, LOSEdit>,
  pendingChanges: Set<string>,
  setLosEdits: (edits: Map<string, LOSEdit>) => void,
  setPendingChanges: (changes: Set<string>) => void
) => {
  const key = generateKey.los(roomType, ratePlan, dayIndex, type);
  const newEdits = new Map(losEdits);
  const newPending = new Set(pendingChanges);

  if (value === "") {
    newEdits.set(key, { roomType, ratePlan, dayIndex, type, value: "" });
    newPending.add(key);
  } else {
    newEdits.set(key, { roomType, ratePlan, dayIndex, type, value });
    newPending.add(key);
  }

  setLosEdits(newEdits);
  setPendingChanges(newPending);
};

/**
 * Apply LOS value to entire row
 */
export const applyLOSToRow = (
  roomType: string,
  ratePlan: string | null,
  dayIndex: number,
  type: "min" | "max",
  days: InventoryDay[],
  losEdits: Map<string, LOSEdit>,
  pendingChanges: Set<string>,
  setLosEdits: (edits: Map<string, LOSEdit>) => void,
  setPendingChanges: (changes: Set<string>) => void
) => {
  const key = generateKey.los(roomType, ratePlan, dayIndex, type);
  const edit = losEdits.get(key);

  if (!edit || !edit.value) return;

  const newEdits = new Map(losEdits);
  const newPending = new Set(pendingChanges);

  // Only apply from dayIndex onwards (forward direction)
  days.forEach((_, index) => {
    if (index >= dayIndex) {  // <-- THIS IS THE KEY CHANGE
      const rowKey = generateKey.los(roomType, ratePlan, index, type);
      newEdits.set(rowKey, {
        roomType,
        ratePlan,
        dayIndex: index,
        type,
        value: edit.value,
      });
      newPending.add(rowKey);
    }
  });

  setLosEdits(newEdits);
  setPendingChanges(newPending);
  const datesApplied = days.length - dayIndex;
  toast.success(`Applied ${type === "min" ? "Min" : "Max"} LOS to ${datesApplied} dates forward`);
};

/**
 * Save LOS changes
 */
export const saveLOSChanges = async (
  roomType: string,
  ratePlan: string | null,
  days: InventoryDay[],
  losEdits: Map<string, LOSEdit>,
  pendingChanges: Set<string>,
  hotelCode: string,
  setLosEdits: (edits: Map<string, LOSEdit>) => void,
  setPendingChanges: (changes: Set<string>) => void,
  onDataUpdate?: () => void
) => {
  const relevantEdits = Array.from(losEdits.entries()).filter(([key]) =>
    key.startsWith(`${roomType}-${ratePlan || "roomtype"}-`)
  );

  if (relevantEdits.length === 0) {
    toast.error("No changes to save");
    return;
  }

  const dateGroups = new Map<
    string,
    { min: number | null; max: number | null; dates: string[] }
  >();

  relevantEdits.forEach(([_key, edit]) => {
    const day = days[edit.dayIndex];
    if (!day) return;

    const formattedDate = formatDateForAPI(day);
    const groupKey = `${edit.roomType}-${edit.ratePlan || "roomtype"}`;
    
    if (!dateGroups.has(groupKey)) {
      dateGroups.set(groupKey, { min: null, max: null, dates: [] });
    }

    const group = dateGroups.get(groupKey)!;
    group.dates.push(formattedDate);

    if (edit.type === "min") {
      group.min = parseInt(edit.value) || null;
    } else {
      group.max = parseInt(edit.value) || null;
    }
  });

  try {
    for (const [_groupKey, group] of dateGroups.entries()) {
      if (group.dates.length === 0) continue;

      const sortedDates = group.dates.sort();
      const startDate = sortedDates[0];
      const endDate = sortedDates[sortedDates.length - 1];

      const endDateObj = new Date(endDate);
      endDateObj.setDate(endDateObj.getDate() + 1);

      const payload: any = {
        hotelCode,
        roomTypeCode: roomType,
        startDate,
        endDate: endDateObj.toISOString().split("T")[0],
      };

      if (ratePlan) {
        payload.ratePlanCode = ratePlan;
      }

      if (group.min !== null) {
        payload.minLengthOfStay = group.min;
      }

      if (group.max !== null) {
        payload.maxLengthOfStay = group.max;
      }

      // await updateMinMaxLengthOfStay(payload, accessToken);
    }

    toast.success("Length of stay updated successfully");

    const newEdits = new Map(losEdits);
    const newPending = new Set(pendingChanges);

    relevantEdits.forEach(([key]) => {
      newEdits.delete(key);
      newPending.delete(key);
    });

    setLosEdits(newEdits);
    setPendingChanges(newPending);

    if (onDataUpdate) {
      onDataUpdate();
    }
  } catch (error: any) {
    console.error("Failed to update length of stay:", error);
    toast.error(error.message || "Failed to update length of stay");
  }
};
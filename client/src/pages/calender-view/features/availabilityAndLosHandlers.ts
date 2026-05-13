// features/availabilityAndLosHandlers.ts

import { addRoomInventoryService } from "@/pages/inventory/services";
import type { InventoryDay } from "../types/inventory";
import { formatDateForAPI, generateKey } from "../utils/inventoryUtils";
import toast from "react-hot-toast";
import type { SelectedRoom } from "@/pages/inventory/types";
import { updateRatePlanRulesService } from "../services/inventory.service";
import type { IRatePlanRuleUpdate } from "../interfaces/inventory.interfaces";

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
 * Save availability changes - OPTIMIZED VERSION
 */
export const saveAvailabilityChanges = async (
  roomType: string,
  days: InventoryDay[],
  availabilityEdits: Map<string, AvailabilityEdit>,
  pendingChanges: Set<string>,
  propertyId: string,
  roomSetupData: Array<{
    id: string;
    roomName: string;
    roomType: string;
    totalRoom: number;
  }>,
  setAvailabilityEdits: (edits: Map<string, AvailabilityEdit>) => void,
  setPendingChanges: (changes: Set<string>) => void,
  onDataUpdate?: () => void
) => {
  const relevantEdits = Array.from(availabilityEdits.entries()).filter(([key]) =>
    key.startsWith(`${roomType}-availability-`)
  );

  if (relevantEdits.length === 0) {
    toast.error("No changes to save");
    return;
  }

  try {
    const roomData = roomSetupData.find(
      (room) => room.roomType === roomType
    );

    if (!roomData) {
      toast.error(`Room type "${roomType}" not found in property setup`);
      return;
    }

    for (const [_key, edit] of relevantEdits) {
      const requestedAvailability = edit.value === "" ? 0 : parseInt(edit.value) || 0;
      
      if (requestedAvailability > roomData.totalRoom) {
        toast.error(
          `Cannot set availability to ${requestedAvailability}. Maximum available rooms for ${roomType} is ${roomData.totalRoom}`
        );
        return;
      }
    }

    const dateRanges: Array<{
      startDate: string;
      endDate: string;
      availableRooms: number;
    }> = [];

    const sortedEdits = relevantEdits.sort(([, a], [, b]) => a.dayIndex - b.dayIndex);

    let currentRange: {
      startDate: string;
      endDate: string;
      availableRooms: number;
    } | null = null;

    sortedEdits.forEach(([_key, edit]) => {
      const day = days[edit.dayIndex];
      if (!day) return;

      const formattedDate = formatDateForAPI(day);
      const newAvailable = edit.value === "" ? 0 : parseInt(edit.value) || 0;

      if (!currentRange || currentRange.availableRooms !== newAvailable) {
        if (currentRange) {
          dateRanges.push(currentRange);
        }
        currentRange = {
          startDate: formattedDate,
          endDate: formattedDate,
          availableRooms: newAvailable,
        };
      } else {
        currentRange.endDate = formattedDate;
      }
    });

    if (currentRange) {
      dateRanges.push(currentRange);
    }

    if (dateRanges.length === 0) {
      toast.error("No valid dates to update");
      return;
    }

    toast.loading(`Updating ${dateRanges.length} date range(s)...`);
    
    const updatePromises = dateRanges.map(async (range) => {
      const payload: SelectedRoom = {
        id: roomData.id,
        roomName: roomData.roomName,
        roomType: roomData.roomType,
        totalRoom: roomData.totalRoom,
        availableRooms: range.availableRooms,
        startDate: range.startDate,
        endDate: range.endDate,
        pushFromCalender: true,
      };

      return addRoomInventoryService(propertyId, payload);
    });

    const results = await Promise.all(updatePromises);

    const failedUpdates = results.filter((r) => !r.success);
    
    toast.dismiss();

    if (failedUpdates.length > 0) {
      toast.error(`${failedUpdates.length} update(s) failed: ${failedUpdates[0].message}`);
      return;
    }

    toast.success(`Successfully updated ${dateRanges.length} date range(s) for ${roomType}`);

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
    toast.dismiss();
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

  days.forEach((_, index) => {
    if (index >= dayIndex) {
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
 * ✅ UPDATED: Helper function to get all rate plans for a room type
 */
const getRatePlansForRoomType = (roomType: string, days: InventoryDay[]): string[] => {
  const ratePlansSet = new Set<string>();
  
  days.forEach(day => {
    day.ratePlans?.forEach(ratePlan => {
      // Check if this rate plan has prices for this room type
      const hasRoomType = ratePlan.prices?.some(
        (price: any) => price.invTypeCode === roomType
      );
      if (hasRoomType) {
        ratePlansSet.add(ratePlan.ratePlanCode);
      }
    });
  });
  
  return Array.from(ratePlansSet);
};

/**
 * ✅ UPDATED: Save LOS changes - Handles both Room Type and Rate Plan level
 */
export const saveLOSChanges = async (
  roomType: string,
  ratePlan: string | null,
  days: InventoryDay[],
  losEdits: Map<string, LOSEdit>,
  pendingChanges: Set<string>,
  _hotelCode: string,
  ratePlanCode: string | null,
  setLosEdits: (edits: Map<string, LOSEdit>) => void,
  setPendingChanges: (changes: Set<string>) => void,
  onDataUpdate?: () => void,
  startDate?: string | null,  // ✅ ADD THIS
  endDate?: string | null      // ✅ ADD THIS
) => {
  const relevantEdits = Array.from(losEdits.entries()).filter(([key]) =>
    key.startsWith(`${roomType}-${ratePlan || "roomtype"}-`)
  );

  if (relevantEdits.length === 0) {
    toast.error("No changes to save");
    return;
  }

  try {
    // ✅ Collect min and max values
    let minimumLOS: number | undefined;
    let maximumLOS: number | undefined;

    relevantEdits.forEach(([_key, edit]) => {
      const value = parseInt(edit.value) || 0;
      if (edit.type === "min") {
        minimumLOS = value;
      } else {
        maximumLOS = value;
      }
    });

    // ✅ Prepare rule data with start and end dates
    const ruleData: IRatePlanRuleUpdate = {
      b2bAvailable: true,
      b2cAvailable: true,
      minimumLengthOfStay: minimumLOS ?? 0,
      maximumLengthOfStay: maximumLOS ?? 0,
      startDate: startDate ?? null,
      endDate: endDate ?? null,
    };

    // ✅ ROOM TYPE LEVEL: Update all connected rate plans
    if (!ratePlan && ratePlanCode === null) {
      const connectedRatePlans = getRatePlansForRoomType(roomType, days);
      
      if (connectedRatePlans.length === 0) {
        toast.error(`No rate plans found for room type ${roomType}`);
        return;
      }

      toast.loading(`Updating ${connectedRatePlans.length} rate plan(s)...`);

      // ✅ Update all rate plans in parallel using updateRatePlanRulesService
      const updatePromises = connectedRatePlans.map(async (rpCode) => {
        return updateRatePlanRulesService(rpCode, ruleData);
      });

      const results = await Promise.all(updatePromises);
      toast.dismiss();

      // ✅ Check for failures
      const failedUpdates = results.filter((r) => !r.success);
      
      if (failedUpdates.length > 0) {
        toast.error(
          `${failedUpdates.length} rate plan(s) failed to update: ${failedUpdates[0].message}`
        );
        return;
      }

      // ✅ Show single success message
      toast.success(
        `Successfully updated Min/Max LOS for ${roomType} (${connectedRatePlans.length} rate plan${connectedRatePlans.length > 1 ? 's' : ''})`
      );
    } 
    // ✅ RATE PLAN LEVEL: Update single rate plan
    else if (ratePlan && ratePlanCode) {
      toast.loading("Updating rate plan length of stay...");

      const result = await updateRatePlanRulesService(ratePlanCode, ruleData);

      toast.dismiss();

      if (!result.success) {
        toast.error(result.message || "Failed to update rate plan");
        return;
      }

      toast.success(`Rate plan ${ratePlanCode} updated successfully`);
    } else {
      toast.error("Invalid parameters for LOS update");
      return;
    }

    // ✅ Clear the edits from state
    const newEdits = new Map(losEdits);
    const newPending = new Set(pendingChanges);

    relevantEdits.forEach(([key]) => {
      newEdits.delete(key);
      newPending.delete(key);
    });

    setLosEdits(newEdits);
    setPendingChanges(newPending);

    // ✅ Refresh data
    if (onDataUpdate) {
      onDataUpdate();
    }
  } catch (error: any) {
    console.error("Failed to update length of stay:", error);
    toast.dismiss();
    toast.error(error.message || "Failed to update length of stay");
  }
};
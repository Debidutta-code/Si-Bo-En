// features/bookingOffsetHandlers.ts

import toast from "react-hot-toast";
import type { InventoryDay } from "../types/inventory";
import type { BookingOffsetEdit } from "../hooks/useInventoryState";
import { upsertBookingOffsetsService } from "../services/inventory.service";
import { formatDateForAPI } from "../utils/inventoryUtils";

/**
 * Save booking offset changes — groups edits by date and sends ONLY the changed fields per date.
 * Uses the new PATCH upsert endpoint so unchanged fields are NOT overridden.
 * All values in bookingOffsetEdits are ALWAYS stored in hours (conversion happens at input time).
 */
export const saveBookingOffsetChanges = async (
  roomType: string,
  ratePlanType: string,
  days: InventoryDay[],
  bookingOffsetEdits: Map<string, BookingOffsetEdit>,
  pendingChanges: Set<string>,
  propertyId: string,
  ratePlanId: string,
  setBookingOffsetEdits: (edits: Map<string, BookingOffsetEdit>) => void,
  setPendingChanges: (changes: Set<string>) => void,
  onDataUpdate?: () => void,
) => {
  // Filter edits relevant to this roomType/ratePlan
  const relevantEdits = Array.from(bookingOffsetEdits.entries()).filter(
    ([key]) =>
      key.includes(`${roomType}-${ratePlanType}-`) &&
      key.includes("-bookingOffset-"),
  );

  if (relevantEdits.length === 0) {
    toast.error("No booking offset changes to save");
    return;
  }

  if (!propertyId || !ratePlanId) {
    toast.error("Missing property or rate plan information");
    return;
  }

  try {
    // Group edits by dayIndex → for each date, collect only the changed fields
    const editsByDay = new Map<number, Record<string, number>>();

    relevantEdits.forEach(([_key, edit]) => {
      if (!editsByDay.has(edit.dayIndex)) {
        editsByDay.set(edit.dayIndex, {});
      }
      editsByDay.get(edit.dayIndex)![edit.field] = parseInt(edit.value) || 0;
    });

    toast.loading("Saving booking offset changes...");

    // Build entries array: each entry has { date, ...only_changed_fields }
    const entries = Array.from(editsByDay.entries()).map(
      ([dayIndex, fields]) => ({
        date: formatDateForAPI(days[dayIndex]),
        ...fields,
      }),
    );

    const result = await upsertBookingOffsetsService(
      propertyId,
      ratePlanId,
      entries,
    );

    toast.dismiss();

    if (!result.success) {
      toast.error(result.message || "Failed to save booking offsets");
      return;
    }

    toast.success(
      `Booking offsets saved for ${ratePlanType} (${entries.length} date${entries.length > 1 ? "s" : ""})`,
    );

    // Clear relevant edits
    const newEdits = new Map(bookingOffsetEdits);
    const newPending = new Set(pendingChanges);

    relevantEdits.forEach(([key]) => {
      newEdits.delete(key);
      newPending.delete(key);
    });

    setBookingOffsetEdits(newEdits);
    setPendingChanges(newPending);

    // Refresh data
    if (onDataUpdate) {
      onDataUpdate();
    }
  } catch (error: any) {
    console.error("Failed to save booking offsets:", error);
    toast.dismiss();
    toast.error(error.message || "Failed to save booking offsets");
  }
};

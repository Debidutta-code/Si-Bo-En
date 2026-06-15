import {
    createSpaDate,
    createSpaSlots,
    deleteSpaDate,
    deleteSpaSlot,
    getSpaForDateRange,
    markSlotAsAvailable,
    markSlotAsCompleted,
} from "../api";
import type {  ICSpaSlotS ,IgetInDates} from "../interfaces";

export const createSpaDateService = async (spaId: string, dates: string[]) => {
    try {
        const result = await createSpaDate(spaId, { dates });
        return result;
    } catch (error) {
        return { success: false, message: "Failed to create spa dates" };
    }
};


export const deleteSpaDateService = async (spaId: string) => {
    try {
        const result = await deleteSpaDate(spaId);
        return result;
    } catch (error) {
        return {
            success: false,
            message: "Failed to delete spa date"
        };
    }
};

export const getSpaForDateRangeService = async (spaId: string, dateData: IgetInDates) => {
    try {
        const result = await getSpaForDateRange(spaId, dateData);
        return result;
    } catch (error) {
        return {
            success: false,
            message: "Failed to get spa dates for range"
        };
    }
};

export const createSpaSlotsService = async (slotData: (ICSpaSlotS & { spaDateId: string })[]) => {
    try {
        const result = await createSpaSlots(slotData);
        return result;
    } catch (error) {
        return { success: false, message: "Failed to create spa slots" };
    }
};

export const deleteSpaSlotService = async (slotId: string) => {
    try {
        const result = await deleteSpaSlot(slotId);
        return result;
    } catch (error) {
        return {
            success: false,
            message: "Failed to delete spa slot"
        };
    }
};

export const markSlotAsAvailableService = async (slotId: string) => {
    try {
        const result = await markSlotAsAvailable(slotId);
        return result;
    } catch (error) {
        return {
            success: false,
            message: "Failed to mark spa slot as available"
        };
    }
};

export const markSlotAsCompletedService = async (slotId: string) => {
    try {
        if(!slotId||slotId.trim().length===0) {
            return {
                success: false,
                message: "Slot ID is required"
            };
        }
        const result = await markSlotAsCompleted(slotId);
        return result;
    } catch (error) {
        return {
            success: false,
            message: "Failed to mark spa slot as completed"
        };
    }
};

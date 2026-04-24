import {
    createSpaDate,
    createSpaSlots,
    deleteSpaDate,
    deleteSpaSlot,
    getSpaForDateRange,
    markSlotAsAvailable,
    // markSlotAsBooked
} from "../api";
import type { ICSpaDatesS, ICSpaSlotS, IgetInDates } from "../interfaces";

export const createSpaDateService = async (spaId: string, dateData: ICSpaDatesS) => {
    try {
        const result = await createSpaDate(spaId, dateData);
        return result;
    } catch (error) {
        return {
            success: false,
            message: "Failed to create spa date"
        };
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

export const createSpaSlotsService = async (spaDateId: string, slotData: ICSpaSlotS[]) => {
    try {
        const result = await createSpaSlots(spaDateId, slotData);
        return result;
    } catch (error) {
        return {
            success: false,
            message: "Failed to create spa slots"
        };
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

// export const markSlotAsBookedService = async (slotId: string) => {
//     try {
//         const result = await markSlotAsBooked(slotId);
//         return result;
//     } catch (error) {
//         return {
//             success: false,
//             message: "Failed to mark spa slot as booked"
//         };
//     }
// };

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

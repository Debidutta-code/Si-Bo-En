import {
    deleteLoyaltyGuest,
    getLoyaltyGuestsForProperty,
    getLoyaltyGuestsForCreation
} from "../api";


export { getLoyaltyGuestsForProperty, getLoyaltyGuestsForCreation };

// ===== Loyalty Guest Services =====


export const deleteLoyaltyGuestService = async (loyaltyGuestId: string) => {
    try {
        if (!loyaltyGuestId || loyaltyGuestId.trim() === "") {
            return { success: false, message: "Loyalty Guest ID is required." };
        }
        const response = await deleteLoyaltyGuest(loyaltyGuestId);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to delete loyalty guest." };
    }
};

export const getLoyaltyGuestsForPropertyService = async (propertyId: string, skip: number = 0, take: number = 10) => {
    try {
        if (!propertyId || propertyId.trim() === "") {
            return { success: false, message: "Property ID is required." };
        }
        if (skip < 0) {
            return { success: false, message: "Skip value must be non-negative." };
        }
        if (take < 1) {
            return { success: false, message: "Take value must be at least 1." };
        }
        const response = await getLoyaltyGuestsForProperty(propertyId, skip, take);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to retrieve loyalty guests for property." };
    }
};

export const getLoyaltyGuestsForCreationService = async (creationLoyaltyId: string, skip: number = 0, take: number = 10) => {
    try {
        if (!creationLoyaltyId || creationLoyaltyId.trim() === "") {
            return { success: false, message: "Creation Loyalty ID is required." };
        }
        if (skip < 0) {
            return { success: false, message: "Skip value must be non-negative." };
        }
        if (take < 1) {
            return { success: false, message: "Take value must be at least 1." };
        }
        const response = await getLoyaltyGuestsForCreation(creationLoyaltyId, skip, take);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to retrieve loyalty guests for creation loyalty." };
    }
};

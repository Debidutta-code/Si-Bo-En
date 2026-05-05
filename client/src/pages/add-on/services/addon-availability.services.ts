import {
    createAddonAvailability,
    deleteAddonAvailability,
    fetchAddonAvailabilities,
    updateAddonAvailability
} from "../api";

import type { IAddonAvailabilityCreate, IAddonAvailabilityUpdate } from "../interface";


export const createAvailabilityService = async (data:IAddonAvailabilityCreate) => {
    try {
        if(!data.addonId || data.addonId.trim() === "") {
            return { success: false, message: "Add-on ID is required." };
        }
        if(!data.from || !data.to) {
            return { success: false, message: "Available From and To dates are required." };
        }
        if(new Date(data.from) >= new Date(data.to)) {
            return { success: false, message: "Available From date must be earlier than To date." };
        }
        if(!data.price || data.price < 0) {
            return { success: false, message: "Price must be a positive number." };
        }
        const response = await createAddonAvailability(data.addonId, data);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to create availability."};
    }
}
export const updateAvailabilityService = async (availabilityId:string, data:IAddonAvailabilityUpdate) => {
    try {
        if(!availabilityId || availabilityId.trim() === "") {
            return { success: false, message: "Availability ID is required." };
        }
        if(!data.price || data.price < 0) {
            return { success: false, message: "Price must be a positive number." };
        }
        if(!data.currencyCode || data.currencyCode.trim() === "") {
            return { success: false, message: "Currency code is required." };
        }
        if(typeof data.isAvailable !== "boolean") {
            return { success: false, message: "Availability status is required." };
        }
        const response = await updateAddonAvailability(availabilityId, data);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to update availability."};
    }
}
export const fetchAvailabilitiesService = async (addonId:string) => {
    try {
        if(!addonId || addonId.trim() === "") {
            return { success: false, message: "Add-on ID is required." };
        }
        const response = await fetchAddonAvailabilities(addonId);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to fetch availabilities."};
    }
}
export const deleteAvailabilityService = async (availabilityId:string) => {
    try {
        if(!availabilityId || availabilityId.trim() === "") {
            return { success: false, message: "Availability ID is required." };
        }
        const response = await deleteAddonAvailability(availabilityId);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to delete availability."};
    }
}
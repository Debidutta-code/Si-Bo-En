import {
    fetchProperties,
} from "../api";

export const fetchPropertiesService = async (location?: string, country?: string) => {
    try {
        const response = await fetchProperties(location, country);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to fetch properties." };
    }
};

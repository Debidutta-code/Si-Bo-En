import {
    fetchProperties,
} from "../api";

export const fetchPropertiesService = async (location?: string) => {
    try {
        const response = await fetchProperties(location);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to fetch properties." };
    }
};

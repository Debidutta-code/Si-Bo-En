import {
    fetchProperties,
} from "../api";

export const fetchPropertiesService = async () => {
    try {
        const response = await fetchProperties();
        return response;
    } catch (error) {
        return { success: false, message: "Failed to fetch properties." };
    }
};


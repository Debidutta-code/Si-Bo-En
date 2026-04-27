import {
    createSpa,
    deleteSpa,
    getSpa,
    updateSpa
} from "../api";
import type { ICSpaC, IUSpaR } from "../interfaces";

export const createSpaService = async (data: ICSpaC) => {
    try {
        const result = await createSpa(data);
        return result;
    } catch (error) {
        return {
            success: false,
            message: "Failed to create spa"
        };
    }
};

export const getSpaService = async (propertyId: string) => {
    try {
        const result = await getSpa(propertyId);
        return result;
    } catch (error) {
        return {
            success: false,
            message: "Failed to retrieve spa"
        };
    }
};

export const updateSpaService = async (id: string, data: IUSpaR) => {
    try {
        const result = await updateSpa(id, data);
        return result;
    } catch (error) {
        return {
            success: false,
            message: "Failed to update spa"
        };
    }
};

export const deleteSpaService = async (id: string) => {
    try {
        const result = await deleteSpa(id);
        return result;
    } catch (error) {
        return {
            success: false,
            message: "Failed to delete spa"
        };
    }
};

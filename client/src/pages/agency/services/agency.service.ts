import type {
    // IAgency,
    ICAgency,

} from "../interfaces";
import {
    getAgencies,
    createAgency,
    updateAgency,
    deleteAgency,
    getReservationsForAgency
} from "../api";

export const getAgenciesService = async (page: number, limit: number) => {
    try {
        const response = await getAgencies(page, limit);
        return response;
    } catch (error) {
        return {
            success: false,
            message: "Failed to retrieve agencies, try again later"
        };
    }
};

export const createAgencyService = async (agencyData: ICAgency) => {
    try {
        const response = await createAgency(agencyData);
        return response;
    } catch (error) {
        return {
            success: false,
            message: "Failed to create agency, try again later"
        };
    }
};

export const updateAgencyService = async (agencyId: string, agencyData: ICAgency) => {
    try {
        const response = await updateAgency(agencyId, agencyData);
        return response;
    } catch (error) {
        return {
            success: false,
            message: "Failed to update agency, try again later"
        };
    }
};

export const deleteAgencyService = async (agencyId: string) => {
    try {
        const response = await deleteAgency(agencyId);
        return response;
    } catch (error) {
        return {
            success: false,
            message: "Failed to delete agency, try again later"
        };
    }
};

export const getReservationsForAgencyService = async (agencyId: string, page: number=1, limit: number=10) => {
    try {
        const response = await getReservationsForAgency(agencyId, page, limit);
        return response;
    } catch (error) {
        return {
            success: false,
            message: "Failed to retrieve reservations for agency, try again later"
        };
    }
};

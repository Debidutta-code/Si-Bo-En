
import createAxiosInstance from "@/components/axiosInstance";
import type { ICTouristTax, IUTouristTax } from "../interface";

const axiosInstance = createAxiosInstance();

export const fetchTouristTaxesByPropertyApi = async (propertyId: string) => {
    try {
        const response = await axiosInstance.get(
            `/tax-system/tourist-taxes/property/${propertyId}`
        );
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message
            };
        }
    }
};

export const createTouristTaxApi = async (propertyId: string, data: ICTouristTax) => {
    try {
        const response = await axiosInstance.post(
            `/tax-system/tourist-taxes?propertyId=${propertyId}`,
            data
        );
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message
            };
        }
    }
};

export const updateTouristTaxApi = async (touristTaxId: string, data: IUTouristTax) => {
    try {
        const response = await axiosInstance.put(
            `/tax-system/tourist-taxes/${touristTaxId}`,
            data
        );
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message
            };
        }
    }
};

export const deleteTouristTaxApi = async (touristTaxId: string) => {
    try {
        const response = await axiosInstance.delete(
            `/tax-system/tourist-taxes/${touristTaxId}`
        );
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message
            };
        }
    }
};
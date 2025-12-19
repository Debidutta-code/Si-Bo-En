import createAxiosInstance from "@/components/axiosInstance";
import type { ICreatePromoCode, IRPromoCode } from "../interfaces"
const axiosInstance = createAxiosInstance();



const createPromoCode = async (promoCodeData: ICreatePromoCode) => {
    try {
        const response = await axiosInstance.post(`/promo-codes`, promoCodeData);
        return response.data;
    } catch (error: any) {
        if (!error?.response?.data?.success) {
            return error.response.data
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
};
const fetchPromoCodes = async (propertyId: string) => {
    try {
        const response = await axiosInstance.get(`/promo-codes/property/${propertyId}`);
        return response.data;
    } catch (error: any) {
        if (!error?.response?.data?.success) {
            return error.response.data
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
};
const updatePromoCode = async (id: string, promoCodeData: IRPromoCode) => {
    try {
        const response = await axiosInstance.patch(`/promo-codes/${id}`, { promoCodeData });
        return response.data;
    } catch (error: any) {
        if (!error?.response?.data?.success) {
            return error.response.data
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
};

const deletePromoCode = async (propertyId: string, id: string, hardDelete = false) => {
    try {
        const response = await axiosInstance.delete(`/promo-codes/${id}`, {
            params: { propertyId, hardDelete }
        });
        return response.data;
    } catch (error: any) {
        if (!error?.response?.data?.success) {
            return error.response.data
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
};

export { fetchPromoCodes, createPromoCode, updatePromoCode, deletePromoCode };
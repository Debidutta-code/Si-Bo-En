import createAxiosInstance from "@/components/axiosInstance";
import type { CreateGeoRatePlan, UpdateGeoRatePlan } from "../interfaces";

const axiosInstance = createAxiosInstance();

export const createGeoRatePlan = async (payload: CreateGeoRatePlan) => {
  try {
const response = await axiosInstance.post(`/promotions/geo-rate-plan?propertyId=${payload.propertyId}`, payload);
    return response.data;
  } catch (error: any) {
    if (!error?.response?.data?.success) {
      return error.response.data;
    } else {
      return {
        success: false,
        message: error?.message
      };
    }
  }
};

export const getGeoRatePlans = async (propertyId: string, filters?: { roomType?: string; ratePlanCode?: string }) => {
  try {
    const params = new URLSearchParams();
if (filters?.roomType) params.append('roomTypeCode', filters.roomType);
if (filters?.ratePlanCode) params.append('ratePlanCode', filters.ratePlanCode);

const queryString = params.toString();
const url = `/promotions/geo-rate-plan/property/${propertyId}${queryString ? `?${queryString}` : ''}`;
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error: any) {
    if (!error?.response?.data?.success) {
      return error.response.data;
    } else {
      return {
        success: false,
        message: error?.message
      };
    }
  }
};

export const getGeoRatePlanById = async (id: string) => {
  try {
const response = await axiosInstance.get(`/promotions/geo-rate-plan/${id}`);
    return response.data;
  } catch (error: any) {
    if (!error?.response?.data?.success) {
      return error.response.data;
    } else {
      return {
        success: false,
        message: error?.message
      };
    }
  }
};

export const updateGeoRatePlan = async (id: string, payload: UpdateGeoRatePlan) => {
  try {
const response = await axiosInstance.patch(`/promotions/geo-rate-plan/${id}`, payload);
    return response.data;
  } catch (error: any) {
    if (!error?.response?.data?.success) {
      return error.response.data;
    } else {
      return {
        success: false,
        message: error?.message
      };
    }
  }
};

export const deleteGeoRatePlan = async (id: string) => {
  try {
const response = await axiosInstance.delete(`/promotions/geo-rate-plan/${id}`);
    return response.data;
  } catch (error: any) {
    if (!error?.response?.data?.success) {
      return error.response.data;
    } else {
      return {
        success: false,
        message: error?.message
      };
    }
  }
};

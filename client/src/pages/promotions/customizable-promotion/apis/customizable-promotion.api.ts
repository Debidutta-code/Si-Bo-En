import createAxiosInstance from "@/components/axiosInstance";
import type { CreateCustomizableDeal } from "../interfaces";

const axiosInstance = createAxiosInstance();

export async function createCustomizableDeal(payload: CreateCustomizableDeal, propertyId: string) {
  try {
    const response = await axiosInstance.post('/promotions/customizable-deal', {
      ...payload,
      propertyId
    });
    return response.data;
  } catch (error: any) {
    return error?.response?.data || { success: false, message: error?.message };
  }
}

export async function getCustomizableDealsByProperty(propertyId: string) {
  try {
    const response = await axiosInstance.get(`/promotions/customizable-deal/property/${propertyId}`);
    return response.data;
  } catch (error: any) {
    return error?.response?.data || { success: false, message: error?.message };
  }
}

export async function getCustomizableDealById(dealId: string) {
  try {
    const response = await axiosInstance.get(`/promotions/customizable-deal/${dealId}`);
    return response.data;
  } catch (error: any) {
    return error?.response?.data || { success: false, message: error?.message };
  }
}

export async function updateCustomizableDeal(dealId: string, payload: CreateCustomizableDeal, propertyId: string) {
  try {
    const response = await axiosInstance.put(`/promotions/customizable-deal/${dealId}`, {
      ...payload,
      propertyId
    });
    return response.data;
  } catch (error: any) {
    return error?.response?.data || { success: false, message: error?.message };
  }
}

export async function deleteCustomizableDeal(dealId: string, propertyId: string) {
  try {
    const response = await axiosInstance.delete(`/promotions/customizable-deal/${dealId}`, {
      data: { propertyId }
    });
    return response.data;
  } catch (error: any) {
    return error?.response?.data || { success: false, message: error?.message };
  }
}
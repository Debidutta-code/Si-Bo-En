import createAxiosInstance from "@/components/axiosInstance";
import type { CreateOfferForTonight, UpdateOfferForTonight } from "../interfaces";

const axiosInstance = createAxiosInstance();

/**
 * Create an early bird promotion
 */
export async function createOfferForTonight(payload: CreateOfferForTonight) {
  try {
    const response = await axiosInstance.post('/promotions/offer-for-tonight', payload);
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
}

/**
 * Get all early bird promotions by property
 */
export async function getOfferForTonightByProperty(propertyId: string) {
  try {
    const response = await axiosInstance.get(`/promotions/offer-for-tonight/property/${propertyId}`);
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
}

/**
 * Get early bird promotion by ID
 */
export async function getOfferForTonightById(promotionId: string) {
  try {
    const response = await axiosInstance.get(`/promotions/offer-for-tonight/${promotionId}`);
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
}

/**
 * Update early bird promotion
 */
export async function updateOfferForTonight(promotionId: string, payload: UpdateOfferForTonight) {
  try {
    const response = await axiosInstance.patch(`/promotions/offer-for-tonight/${promotionId}`, payload);
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
}

/**
 * Delete early bird promotion
 */
export async function deleteOfferForTonight(promotionId: string) {
  try {
    const response = await axiosInstance.delete(`/promotions/offer-for-tonight/${promotionId}`);
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
}

/**
 * Toggle early bird promotion status
 */
export async function toggleOfferForTonightStatus(promotionId: string, isActive: boolean) {
  try {
    const response = await axiosInstance.patch(`/promotions/offer-for-tonight/${promotionId}/toggle-status`, {
      isActive
    });
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
}
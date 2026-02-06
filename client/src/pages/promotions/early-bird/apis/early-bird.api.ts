import createAxiosInstance from "@/components/axiosInstance";
import type { CreateEarlyBirdPromotion, UpdateEarlyBirdPromotion } from "../interfaces";

const axiosInstance = createAxiosInstance();

/**
 * Create an early bird promotion
 */
export async function createEarlyBirdPromotion(payload: CreateEarlyBirdPromotion) {
  try {
    const response = await axiosInstance.post('/promotions/early-bird', payload);
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
export async function getEarlyBirdPromotionsByProperty(propertyId: string) {
  try {
    const response = await axiosInstance.get(`/promotions/early-bird/property/${propertyId}`);
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
export async function getEarlyBirdPromotionById(promotionId: string) {
  try {
    const response = await axiosInstance.get(`/promotions/early-bird/${promotionId}`);
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
export async function updateEarlyBirdPromotion(promotionId: string, payload: UpdateEarlyBirdPromotion) {
  try {
    const response = await axiosInstance.patch(`/promotions/early-bird/${promotionId}`, payload);
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
export async function deleteEarlyBirdPromotion(promotionId: string) {
  try {
    const response = await axiosInstance.delete(`/promotions/early-bird/${promotionId}`);
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
export async function toggleEarlyBirdPromotionStatus(promotionId: string, isActive: boolean) {
  try {
    const response = await axiosInstance.patch(`/promotions/early-bird/${promotionId}/toggle-status`, {
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
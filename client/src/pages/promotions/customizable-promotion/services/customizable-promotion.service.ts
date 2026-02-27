import {
  createCustomizableDeal,
  getCustomizableDealsByProperty,
  getCustomizableDealById,
  updateCustomizableDeal,
  deleteCustomizableDeal
} from "../apis";
import type { CreateCustomizableDeal } from "../interfaces";

export async function createCustomizableDealService(payload: CreateCustomizableDeal, propertyId: string) {
  if (!propertyId) return { success: false, message: "Property ID is required" };
  if (!payload.discountType) return { success: false, message: "Discount type is required" };
  if (!payload.discountValue || payload.discountValue <= 0) return { success: false, message: "Discount value must be greater than 0" };
  if (payload.discountType === 'percentage' && payload.discountValue > 100) return { success: false, message: "Percentage discount cannot exceed 100" };
  if (!payload.roomId) return { success: false, message: "Room is required" };
  if (!payload.ratePlanId) return { success: false, message: "Rate plan is required" };
  if (!payload.startDate) return { success: false, message: "Start date is required" };
  if (!payload.endDate) return { success: false, message: "End date is required" };
  if (new Date(payload.startDate) >= new Date(payload.endDate)) return { success: false, message: "Start date must be before end date" };

  return await createCustomizableDeal(payload, propertyId);
}

export async function getCustomizableDealsByPropertyService(propertyId: string) {
  if (!propertyId) return { success: false, message: "Property ID is required" };
  return await getCustomizableDealsByProperty(propertyId);
}

export async function getCustomizableDealByIdService(dealId: string) {
  if (!dealId) return { success: false, message: "Deal ID is required" };
  return await getCustomizableDealById(dealId);
}

export async function updateCustomizableDealService(dealId: string, payload: CreateCustomizableDeal, propertyId: string) {
  if (!dealId) return { success: false, message: "Deal ID is required" };
  if (!propertyId) return { success: false, message: "Property ID is required" };
  if (payload.discountValue !== undefined && payload.discountValue <= 0) return { success: false, message: "Discount value must be greater than 0" };
  if (payload.discountType === 'percentage' && payload.discountValue > 100) return { success: false, message: "Percentage discount cannot exceed 100" };
  if (payload.startDate && payload.endDate && new Date(payload.startDate) >= new Date(payload.endDate)) return { success: false, message: "Start date must be before end date" };

  return await updateCustomizableDeal(dealId, payload, propertyId);
}

export async function deleteCustomizableDealService(dealId: string, propertyId: string) {
  if (!dealId) return { success: false, message: "Deal ID is required" };
  if (!propertyId) return { success: false, message: "Property ID is required" };
  return await deleteCustomizableDeal(dealId, propertyId);
}
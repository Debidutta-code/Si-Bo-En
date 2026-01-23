// services/services.ts

import {
  getBookingEngineConfig,
  createBookingEngineConfig,
  updateBookingEngineConfig,
  deleteBookingEngineConfig,
  uploadImages,
} from "../api";
import type { BookingEngineConfig } from "../interface";

export async function fetchBookingEngineConfigService(propertyId: string) {
  if (!propertyId) {
    return {
      success: false,
      message: "Property ID is required",
    };
  }
  const result = await getBookingEngineConfig(propertyId);
  return result;
}

export async function createBookingEngineConfigService(
  propertyId: string,
  payload: BookingEngineConfig
) {
  if (!propertyId) {
    return {
      success: false,
      message: "Property ID is required",
    };
  }
  if (!payload.primaryColor || !payload.secondaryColor || !payload.tertiaryColor || !payload.buttonTextColor) {
    return {
      success: false,
      message: "All color fields are required",
    };
  }
  if (!payload.logo) {
    return {
      success: false,
      message: "Logo is required",
    };
  }
  const result = await createBookingEngineConfig(propertyId, payload);
  return result;
}

export async function updateBookingEngineConfigService(
  propertyId: string,
  payload: BookingEngineConfig
) {
  if (!propertyId) {
    return {
      success: false,
      message: "Property ID is required",
    };
  }
  if (!payload.primaryColor || !payload.secondaryColor || !payload.tertiaryColor || !payload.buttonTextColor) {
    return {
      success: false,
      message: "All color fields are required",
    };
  }
  if (!payload.logo) {
    return {
      success: false,
      message: "Logo is required",
    };
  }
  const result = await updateBookingEngineConfig(propertyId, payload);
  return result;
}

export async function deleteBookingEngineConfigService(propertyId: string) {
  if (!propertyId) {
    return {
      success: false,
      message: "Property ID is required",
    };
  }
  const result = await deleteBookingEngineConfig(propertyId);
  return result;
}

export async function uploadImagesService(files: File[]) {
  if (!files || files.length === 0) {
    return {
      success: false,
      message: "No files provided",
    };
  }
  const result = await uploadImages(files);
  return result;
}
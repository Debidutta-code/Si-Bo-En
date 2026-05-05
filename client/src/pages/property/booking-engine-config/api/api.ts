// api/api.ts

import createAxiosInstance from "@/components/axiosInstance";
import type { BookingEngineConfig } from "../interface";
import toast from "react-hot-toast";

export async function getBookingEngineConfig(propertyId: string) {
  const axiosInstance = createAxiosInstance();
  try {
    const response = await axiosInstance.get(
      `/property-management/property/booking-engine/${propertyId}`
    );
    return response.data;
  } catch (error: any) {
    if (!error?.response?.data?.success) {
      return error.response.data;
    } else {
      return {
        success: false,
        message: error?.message,
      };
    }
  }
}

export async function createBookingEngineConfig(
  propertyId: string,
  payload: BookingEngineConfig
) {
  const axiosInstance = createAxiosInstance();
  try {
    const response = await axiosInstance.post(
      `/property-management/property/booking-engine/${propertyId}`,
      payload
    );
    return response.data;
  } catch (error: any) {
    if (!error?.response?.data?.success) {
      return error.response.data;
    } else {
      return {
        success: false,
        message: error?.message,
      };
    }
  }
}

export async function updateBookingEngineConfig(
  propertyId: string,
  payload: BookingEngineConfig
) {
  const axiosInstance = createAxiosInstance();
  try {
    const response = await axiosInstance.patch(
      `/property-management/property/booking-engine/${propertyId}`,
      payload
    );
    return response.data;
  } catch (error: any) {
    if (!error?.response?.data?.success) {
      return error.response.data;
    } else {
      return {
        success: false,
        message: error?.message,
      };
    }
  }
}

export async function deleteBookingEngineConfig(propertyId: string) {
  const axiosInstance = createAxiosInstance();
  try {
    const response = await axiosInstance.delete(
      `/property-management/property/booking-engine/${propertyId}`
    );
    return response.data;
  } catch (error: any) {
    if (!error?.response?.data?.success) {
      return error.response.data;
    } else {
      return {
        success: false,
        message: error?.message,
      };
    }
  }
}

export async function uploadImages(files: File[]) {
  const axiosInstance = createAxiosInstance();

  const formData = new FormData();
  files.forEach((file) => formData.append("file", file));

  try {
    const response = await axiosInstance.post(
      "/property-management/upload",
      formData,
      {}
    );
    if (!response.data.success) {
      toast.error(response.data.message);
      return [];
    }
    return response.data.data;
  } catch (error) {
    console.error("Upload failed", error);
    toast.error("Image upload failed");
    throw new Error("Image upload failed");
  }
}
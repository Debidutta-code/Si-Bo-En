import createAxiosInstance from "@/components/axiosInstance";
import type { ICBookingOffsetS, IUBookingOffsetR } from "../interfaces";
const axiosInstance = createAxiosInstance();

export const getBookingOffsets = async (
  propertyId: string,
  ratePlanId: string,
  startDate: string|null,
  endDate: string|null,
) => {
    const query = new URLSearchParams();
    if(startDate){
        query.append("startDate", startDate);
    }
    if(endDate){
        query.append("endDate", endDate);
    }
  try {
    const response = await axiosInstance.get(
      `/ari/booking-offset/${propertyId}?ratePlanId=${ratePlanId}&${query.toString()}`,
    );
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data;
    } else {
      return {
        success: false,
        message: error?.message,
      };
    }
  }
};
export const createBookingOffset = async (
  propertyId: string,
  ratePlanId: string,
  startDate: string,
  endDate: string,
  bookingOffsets: ICBookingOffsetS,
) => {
  try {
    const response = await axiosInstance.post(
      `/ari/booking-offset/${propertyId}`,
      { bookingOffsets, ratePlanId, startDate, endDate },
    );
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data;
    } else {
      return {
        success: false,
        message: error?.message,
      };
    }
  }
};
export const updateBookingOffsets = async (
  propertyId: string,
  ratePlanId: string,
  startDate: string,
  endDate: string,
  bookingOffsets: ICBookingOffsetS,
) => {
  try {
    const response = await axiosInstance.put(
      `/ari/booking-offset/${propertyId}`,
      { bookingOffsets, ratePlanId, startDate, endDate },
    );
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data;
    } else {
      return {
        success: false,
        message: error?.message,
      };
    }
  }
};
export const deleteBookingOffsets = async (
  propertyId: string,
  ratePlanId: string,
  startDate: string,
  endDate: string,
) => {
  try {
    const response = await axiosInstance.delete(
      `/ari/booking-offset/${propertyId}?ratePlanId=${ratePlanId}&startDate=${startDate}&endDate=${endDate}`,
    );
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data;
    } else {
      return {
        success: false,
        message: error?.message,
      };
    }
  }
};
export const updateBookingOffsetById = async (
  id: string,
  bookingOffsets: IUBookingOffsetR,
) => {
  try {
    const response = await axiosInstance.put(
      `/ari/booking-offset/single/${id}`,
      { id, bookingOffsets },
    );
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data;
    } else {
      return {
        success: false,
        message: error?.message,
      };
    }
  }
};
export const deleteBookingOffsetById = async (id: string) => {
  try {
    const response = await axiosInstance.delete(
      `/ari/booking-offset/single/${id}`,
    );
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data;
    } else {
      return {
        success: false,
        message: error?.message,
      };
    }
  }
};

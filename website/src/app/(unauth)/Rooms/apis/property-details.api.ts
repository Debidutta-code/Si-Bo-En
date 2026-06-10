import createAxiosInstance from "@/src/components/axiosInstance";
import { IPropertyDetailsResponse } from "../types/property-details.type";

const axiosInstance = createAxiosInstance();

export const fetchPropertyDetailsByCode = async (
  propertyCode: string
): Promise<IPropertyDetailsResponse> => {
  try {
    const response = await axiosInstance.get<IPropertyDetailsResponse>(
      `/booking-engine/property-details/get-property-details/${propertyCode}`
    );
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data;
    }
    return {
      success: false,
      message: error?.message ?? "Failed to fetch property details.",
      data: null as any,
      timestamp: new Date().toISOString(),
    };
  }
};
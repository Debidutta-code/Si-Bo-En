import createAxiosInstance from "@/components/axiosInstance";
import type { IActivityLogQueryParams, IActivityLogResponse } from "../interfaces";

const axiosInstance = createAxiosInstance();

export const getActivityLogs = async (
  params: IActivityLogQueryParams = {}
): Promise<IActivityLogResponse> => {
  try {
    const { page = 1, limit = 25, ...otherParams } = params;
    
    const response = await axiosInstance.get("/activities", {
      params: {
        page,
        limit,
        ...otherParams
      }
    });
    
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data;
    } else {
      return {
        success: false,
        message: error?.message || "Failed to fetch activity logs",
        data: {
          data: [],
          total: 0,
          page: 1,
          limit: 25,
          totalPages: 0
        }
      };
    }
  }
};

/**
 * Export activity logs (for future enhancement)
 * @param params Query parameters for filtering
 * @returns Promise with blob data for download
 */
export const exportActivityLogs = async (
  params: IActivityLogQueryParams = {}
): Promise<Blob> => {
  try {
    const response = await axiosInstance.get("/activities/export", {
      params,
      responseType: 'blob'
    });
    
    return response.data;
  } catch (error: any) {
    throw new Error(error?.message || "Failed to export activity logs");
  }
};

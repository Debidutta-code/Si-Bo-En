import axiosInstance from "@/src/lib/axios";
import { IAgencyApplicationForm, IAgencyApplicationResponse } from "../types";

export const createAgencyApplicationApi = async (
  data: IAgencyApplicationForm
): Promise<IAgencyApplicationResponse> => {
  try {
    const res = await axiosInstance.post(`/agency/agency-applications`, data);
    return res.data;
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || error?.message || "Failed to submit application",
    };
  }
};

export const getAgencyApplicationByIdApi = async (
  id: string
): Promise<IAgencyApplicationResponse> => {
  try {
    const res = await axiosInstance.get(`/agency/agency-applications/id/${id}`);
    return res.data;
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || error?.message || "Failed to fetch application",
    };
  }
};
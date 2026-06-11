import createAxiosInstance from "@/src/components/axiosInstance";
import { IFetchRoomsRequest, IFetchRoomsResponse } from "../types";

const axiosInstance = createAxiosInstance();

export const fetchRoomsApi = async (
  payload: IFetchRoomsRequest
): Promise<IFetchRoomsResponse> => {
  try {
    const response = await axiosInstance.post<IFetchRoomsResponse>(
      "/booking-engine/fetch-rooms",
      payload
    );
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) return error.response.data;
    return {
      success: false,
      status: "fail",
      message: error?.message ?? "Failed to fetch rooms.",
      data: null as any,
    };
  }
};
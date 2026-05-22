import axios from "axios";
import { ISpaApiResponse } from "./interface";

const SPA_BASE = `${process.env.NEXT_PUBLIC_BACKEND_URL}/spa`;

/** Fetch authenticated customer's booked spa reservations */
export const getCustomerSpaBookingsApi = async (): Promise<
  ISpaApiResponse<any>
> => {
  try {
    const response = await axios.get(`${SPA_BASE}/reservation/customer`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    return error?.response?.data ?? {
      success: false,
      message: error?.message,
    };
  }
};



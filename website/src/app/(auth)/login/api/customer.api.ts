import axios from "axios";
import {
  CustomerLoginPayload,
  CustomerRegisterPayload,
  CustomerAuthResponse,
} from "../types";

const BASE = `${process.env.NEXT_PUBLIC_BACKEND_URL}`;

export const customerLoginApi = async (
  payload: CustomerLoginPayload
): Promise<CustomerAuthResponse> => {
  try {
    const res = await axios.post(`${BASE}/customer/login`, payload, { withCredentials: true });
    return res.data;
  } catch (error: any) {
    return error?.response?.data ?? { success: false, message: error?.message };
  }
};

export const customerRegisterApi = async (
  payload: CustomerRegisterPayload
): Promise<CustomerAuthResponse> => {
  try {
    const res = await axios.post(`${BASE}/customer/register`, payload, { withCredentials: true });
    return res.data;
  } catch (error: any) {
    return error?.response?.data ?? { success: false, message: error?.message };
  }
};

export const customerMeApi = async (): Promise<CustomerAuthResponse> => {
  try {
    const res = await axios.get(`${BASE}/customer/me`, { withCredentials: true });
    return res.data;
  } catch (error: any) {
    return error?.response?.data ?? { success: false, message: error?.message };
  }
};

export const customerLogoutApi = async (): Promise<void> => {
  await axios.post(`${BASE}/customer/logout`, {}, { withCredentials: true });
};
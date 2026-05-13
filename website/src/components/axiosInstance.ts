import axios, { type AxiosInstance } from "axios";

const createAxiosInstance = (): AxiosInstance => {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!baseUrl) {
    throw new Error(
      "Base URL is not defined. Please set NEXT_PUBLIC_BASE_API_URL in your .env file."
    );
  }

  const axiosInstance = axios.create({
    baseURL: baseUrl,
    withCredentials: true
  });
  return axiosInstance;
};

export default createAxiosInstance;
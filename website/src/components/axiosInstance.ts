import axios, { type AxiosInstance } from "axios";

const createAxiosInstance = (): AxiosInstance => {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!baseUrl) {
    throw new Error(
      "Base URL is not defined. Please set NEXT_PUBLIC_BACKEND_URL in your .env file."
    );
  }

  const axiosInstance = axios.create({
    baseURL: baseUrl,
    withCredentials: true,
  });

  axiosInstance.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
      const lang = localStorage.getItem("i18nextLng") ?? "en";
      config.headers["Accept-Language"] = lang;
    }
    return config;
  });

  return axiosInstance;
};

export default createAxiosInstance;
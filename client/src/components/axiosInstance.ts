import axios, { type AxiosInstance } from "axios";


const createAxiosInstance = (): AxiosInstance => {
  const baseUrl = import.meta.env.VITE_BACKEND_URI;

  if (!baseUrl) {
    throw new Error(
      "Backend URI is not defined."
    );
  }

  const axiosInstance = axios.create({
    baseURL: baseUrl,
    withCredentials: true,
  });

  axiosInstance.interceptors.request.use((config) => {
    const language = localStorage.getItem("exlang");
    if (language) {
      config.headers["Accept-Language"] = language;
    }
    return config;
  });

  return axiosInstance;
};

export default createAxiosInstance;
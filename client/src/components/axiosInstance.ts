import axios, { type AxiosInstance } from "axios";

import { store } from "@/redux/store";

const createAxiosInstance = (): AxiosInstance => {
  const baseUrl = import.meta.env.VITE_BACKEND_URI;

  if (!baseUrl) {
    throw new Error(
      "Backend URI is not defined."
    );
  }

  const language =
    store.getState().language.selectedLanguage || "en";

  const axiosInstance = axios.create({
    baseURL: baseUrl,
    withCredentials: true,

    headers: {
      "Accept-Language": language,
    },
  });

  return axiosInstance;
};

export default createAxiosInstance;
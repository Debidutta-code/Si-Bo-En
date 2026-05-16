import axios, { type AxiosInstance } from "axios";


const createAxiosInstance = (): AxiosInstance => {
  const baseUrl = import.meta.env.VITE_BACKEND_URI;

  if (!baseUrl) {
    throw new Error(
      "Backend URI is not defined."
    );
  }

const language=localStorage.getItem("exlang")  

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
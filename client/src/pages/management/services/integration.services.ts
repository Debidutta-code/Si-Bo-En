import axiosInstance from "@/components/axiosInstance";
import type { ICMasterIntegrationsS, IMasterIntegrations, ICMasterIntegrationUrlFields, ICMasterIntegrationIntegrationFields } from "../types/integration.interface";

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

// Master Integration Partner APIs
export const createMasterIntegrationService = async (
  data: ICMasterIntegrationsS
): Promise<ApiResponse<IMasterIntegrations>> => {
  try {
    const response = await axiosInstance().post("/utils-management/integration-partner", data);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to create master integration",
    };
  }
};

export const getAllMasterIntegrationsService = async (): Promise<ApiResponse<IMasterIntegrations[]>> => {
  try {
    const response = await axiosInstance().get("/utils-management/integration-partner");
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to fetch master integrations",
      data: [],
    };
  }
};

export const deleteMasterIntegrationService = async (id: string): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance().delete(`/utils-management/integration-partner/${id}`);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to delete master integration",
    };
  }
};

// URL Fields APIs
export const addUrlFieldService = async (
  data: ICMasterIntegrationUrlFields & { masterIntegrationId: string }
): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance().post("/utils-management/integration-partner/url-fields", data);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to add URL field",
    };
  }
};

export const deleteUrlFieldService = async (id: string): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance().delete(`/utils-management/integration-partner/url-fields/${id}`);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to delete URL field",
    };
  }
};

// Required Fields APIs
export const addRequiredFieldService = async (
  data: ICMasterIntegrationIntegrationFields & { masterIntegrationId: string }
): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance().post("/utils-management/integration-partner/required-fields", data);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to add required field",
    };
  }
};

export const deleteRequiredFieldService = async (id: string): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance().delete(`/utils-management/integration-partner/required-fields/${id}`);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to delete required field",
    };
  }
};

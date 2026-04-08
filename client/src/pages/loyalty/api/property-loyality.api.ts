import createAxiosInstance from "@/components/axiosInstance";
import type { ICPropertyLoyaltyConfig } from "../interfaces";
const axiosInstance = createAxiosInstance();

export const createPropertyLoyalityConfig = async (
  data: ICPropertyLoyaltyConfig,
) => {
  try {
    const response = await axiosInstance.post("/loyalty/property", data);
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data;
    } else {
      return {
        success: false,
        message: error?.message,
      };
    }
  }
};

export const getLoyalityForProperty = async (propertyId: string) => {
  try {
    const response = await axiosInstance.get(`/loyalty/property/${propertyId}`);
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data;
    } else {
      return {
        success: false,
        message: error?.message,
      };
    }
  }
};

export const updatePropertyLoyalityConfig = async (
  propertyId: string,
  isActive: boolean,
  discountPercentage?: number | null,
  loyalityConfigLogo?: string | null,
) => {
  try {
    const response = await axiosInstance.patch(
      `/loyalty/property/config/${propertyId}`,
      { isActive, discountPercentage, loyalityConfigLogo },
    );
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data;
    } else {
      return {
        success: false,
        message: error?.message,
      };
    }
  }
};

export const deletePropertyLoyalityConfig = async (propertyId: string) => {
  try {
    const response = await axiosInstance.delete(
      `/loyalty/property/config/${propertyId}`,
    );
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data;
    } else {
      return {
        success: false,
        message: error?.message,
      };
    }
  }
};

export const getAllPropertyLoyalityWithLoyality = async (
  propertyId: string,
) => {
  try {
    const response = await axiosInstance.get(
      `/loyalty/property/all/${propertyId}`,
    );
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data;
    } else {
      return {
        success: false,
        message: error?.message,
      };
    }
  }
};

export const getActiveLoyaltyConfigByPropertyId = async (
  propertyId: string,
) => {
  try {
    const response = await axiosInstance.get(
      `/loyalty/property/active/${propertyId}`,
    );
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data;
    } else {
      return {
        success: false,
        message: error?.message,
      };
    }
  }
};

export const getPropertiesByLoyaltyProgram = async (
  loyaltyProgramId: string,
) => {
  try {
    const response = await axiosInstance.get(
      `/loyalty/program/property/${loyaltyProgramId}`,
    );
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data;
    } else {
      return {
        success: false,
        message: error?.message,
      };
    }
  }
};

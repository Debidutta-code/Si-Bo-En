import AxiosInstance from "@/components/axiosInstance";

const axios = AxiosInstance();

// Category APIs
export const getCategories = async () => {
  try {
    const response = await axios.get("/utils-management/category/get");
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data
    } else {
      return {
        success: false,
        message: error?.message
      }
    }
  }
};

export const createCategory = async (categoryName: string, description: string) => {
  try {
    const response = await axios.post("/utils-management/category/create", {
      categoryName,
      description,
    });
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data
    } else {
      return {
        success: false,
        message: error?.message
      }
    }
  }
};

export const deleteCategory = async (categoryName: string) => {
  try {
    const response = await axios.delete(`/utils-management/category/delete/${categoryName}`);
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data
    } else {
      return {
        success: false,
        message: error?.message
      }
    }
  }
};

// Property Type APIs
export const getPropertyTypes = async () => {
  try {
    const response = await axios.get("/utils-management/type/get");
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data
    } else {
      return {
        success: false,
        message: error?.message
      }
    }
  }
};

export const createPropertyType = async (propertyTypeName: string, description: string) => {
  try {
    const response = await axios.post("/utils-management/type/create", {
      propertyTypeName,
      description,
    });
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data
    } else {
      return {
        success: false,
        message: error?.message
      }
    }
  }
};

export const deletePropertyType = async (propertyTypeName: string) => {
  try {
    const response = await axios.delete(`/utils-management/type/delete/${propertyTypeName}`);
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data
    } else {
      return {
        success: false,
        message: error?.message
      }
    }
  }
};

// Destination Type APIs
export const getDestinationTypes = async () => {
  try {
    const response = await axios.get("/utils-management/destination-type/get");
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data
    } else {
      return {
        success: false,
        message: error?.message
      }
    }
  }
};

export const createDestinationType = async (destinationTypeName: string, description: string) => {
  try {
    const response = await axios.post("/utils-management/destination-type/create", {
      destinationTypeName,
      description,
    });
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data
    } else {
      return {
        success: false,
        message: error?.message
      }
    }
  }
};

export const deleteDestinationType = async (destinationTypeName: string) => {
  try {
    const response = await axios.delete(`/utils-management/destination-type/delete/${destinationTypeName}`);
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data
    } else {
      return {
        success: false,
        message: error?.message
      }
    }
  }
};

// Property Amenity APIs
export const getPropertyAmenities = async (type: string = "property") => {
  try {
    const response = await axios.get(`/utils-management/amenity/get?type=${type}`);
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data
    } else {
      return {
        success: false,
        message: error?.message
      }
    }
  }
};

export const createPropertyAmenities = async (amenities: string[]) => {
  try {
    const response = await axios.post("/utils-management/amenity/create", {
      amenities,
    });
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data
    } else {
      return {
        success: false,
        message: error?.message
      }
    }
  }
};

export const deletePropertyAmenities = async (amenities: string[]) => {
  try {
    const response = await axios.patch("/utils-management/amenity/update", {
      amenities,
    });
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data
    } else {
      return {
        success: false,
        message: error?.message
      }
    }
  }
};

// Room Amenity APIs
export const getRoomAmenities = async () => {
  try {
    const response = await axios.get("/utils-management/amenity/room/get");
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data
    } else {
      return {
        success: false,
        message: error?.message
      }
    }
  }
};

export const createRoomAmenities = async (amenities: string[]) => {
  try {
    const response = await axios.post("/utils-management/amenity/room", {
      amenities,
    });
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data
    } else {
      return {
        success: false,
        message: error?.message
      }
    }
  }
};

export const deleteRoomAmenities = async (amenities: string[]) => {
  try {
    const response = await axios.delete("/utils-management/amenity/room", {
      data: { amenities },
    });
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data
    } else {
      return {
        success: false,
        message: error?.message
      }
    }
  }
};

// Loyalty Guest Fields APIs
export const getLoyaltyGuestFields = async () => {
  try {
    const response = await axios.get("/utils-management/loyalty-guest-field/");
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data
    } else {
      return {
        success: false,
        message: error?.message
      }
    }
  }
};

export const createLoyaltyGuestFields = async (fields: string[]) => {
  try {
    const response = await axios.post("/utils-management/loyalty-guest-field/", {
      fields,
    });
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data
    } else {
      return {
        success: false,
        message: error?.message
      }
    }
  }
};

export const deleteLoyaltyGuestField = async (id: string) => {
  try {
    const response = await axios.post(`/utils-management/loyalty-guest-field/${id}`);
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data
    } else {
      return {
        success: false,
        message: error?.message
      }
    }
  }
};
// Payment Integration APIs
export const getPaymentIntegrations = async (propertyId: string) => {
  try {
    const response = await axios.get(`/utils-management/payment-integrations?propertyId=${propertyId}`);
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data
    } else {
      return {
        success: false,
        message: error?.message
      }
    }
  }
};
export const getMasterPaymentIntegrations = async () => {
  try {
    const response = await axios.get(`/utils-management/payment-integrations/master-payment-integrations`);
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data
    } else {
      return {
        success: false,
        message: error?.message
      }
    }
  }
};

export const createPaymentIntegration = async (name: string) => {
  try {
    const response = await axios.post("/utils-management/payment-integrations/", {
      name,
    });
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data
    } else {
      return {
        success: false,
        message: error?.message
      }
    }
  }
};

export const deletePaymentIntegration = async (id: string) => {
  try {
    const response = await axios.delete(`/utils-management/payment-integrations/${id}`);
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data
    } else {
      return {
        success: false,
        message: error?.message
      }
    }
  }
};
import AxiosInstance from "@/components/axiosInstance";

const axios = AxiosInstance();

// Category APIs
export const getCategories = async () => {
  try {
    const response = await axios.get("/property-management/property/management/category/get");
    return response.data;
  } catch (error: any) {
    throw error.response?.data ;
  }
};

export const createCategory = async (categoryName: string, description: string) => {
  try {
    const response = await axios.post("/property-management/property/management/category/create", {
      categoryName,
      description,
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data ;
  }
};

export const deleteCategory = async (categoryName: string) => {
  try {
    const response = await axios.delete(`/property-management/property/management/category/delete/${categoryName}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data ;
  }
};

// Property Type APIs
export const getPropertyTypes = async () => {
  try {
    const response = await axios.get("/property-management/property/management/type/get");
    return response.data;
  } catch (error: any) {
    throw error.response?.data ;
  }
};

export const createPropertyType = async (propertyTypeName: string, description: string) => {
  try {
    const response = await axios.post("/property-management/property/management/type/create", {
      propertyTypeName,
      description,
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data ;
  }
};

export const deletePropertyType = async (propertyTypeName: string) => {
  try {
    const response = await axios.delete(`/property-management/property/management/type/delete/${propertyTypeName}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data ;
  }
};

// Destination Type APIs
export const getDestinationTypes = async () => {
  try {
    const response = await axios.get("/property-management/property/management/destination-type/get");
    return response.data;
  } catch (error: any) {
    throw error.response?.data ;
  }
};

export const createDestinationType = async (destinationTypeName: string, description: string) => {
  try {
    const response = await axios.post("/property-management/property/management/destination-type/create", {
      destinationTypeName,
      description,
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data ;
  }
};

export const deleteDestinationType = async (destinationTypeName: string) => {
  try {
    const response = await axios.delete(`/property-management/property/management/destination-type/delete/${destinationTypeName}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data ;
  }
};

// Property Amenity APIs
export const getPropertyAmenities = async (type: string = "property") => {
  try {
    const response = await axios.get(`/property-management/property/management/amenity/get?type=${type}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data ;
  }
};

export const createPropertyAmenities = async (amenities: string[]) => {
  try {
    const response = await axios.post("/property-management/property/management/amenity/create", {
      amenities,
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data ;
  }
};

export const deletePropertyAmenities = async (amenities: string[]) => {
  try {
    const response = await axios.patch("/property-management/property/management/amenity/update", {
      amenities,
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data ;
  }
};

// Room Amenity APIs
export const getRoomAmenities = async () => {
  try {
    const response = await axios.get("/property-management/property/management/amenity/room/get");
    return response.data;
  } catch (error: any) {
    throw error.response?.data ;
  }
};

export const createRoomAmenities = async (amenities: string[]) => {
  try {
    const response = await axios.post("/property-management/property/management/amenity/room/create", {
      amenities,
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data ;
  }
};

export const deleteRoomAmenities = async (amenities: string[]) => {
  try {
    const response = await axios.patch("/property-management/property/management/amenity/room/update", {
      amenities,
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data ;
  }
};

// Loyalty Guest Fields APIs
export const getLoyaltyGuestFields = async () => {
  try {
    const response = await axios.get("/property-management/property/management/loyalty-guest-field/");
    return response.data;
  } catch (error: any) {
    throw error.response?.data ;
  }
};

export const createLoyaltyGuestFields = async (fields: string[]) => {
  try {
    const response = await axios.post("/property-management/property/management/loyalty-guest-field/", {
      fields,
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data ;
  }
};

export const deleteLoyaltyGuestField = async (id: string) => {
  try {
    const response = await axios.post(`/property-management/property/management/loyalty-guest-field/${id}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data ;
  }
};

import {
  getCategories,
  createCategory,
  deleteCategory,
  getPropertyTypes,
  createPropertyType,
  deletePropertyType,
  getPropertyAmenities,
  createPropertyAmenities,
  deletePropertyAmenities,
  getRoomAmenities,
  createRoomAmenities,
  deleteRoomAmenities,
  getLoyaltyGuestFields,
  createLoyaltyGuestFields,
  deleteLoyaltyGuestField,
} from "../api";

// Category Services
export const getCategoriesService = async () => {
  try {
    return await getCategories();
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch categories",
    };
  }
};

export const createCategoryService = async (categoryName: string, description: string) => {
  if (!categoryName || !description) {
    return {
      success: false,
      message: "Category name and description are required",
    };
  }

  if (categoryName.trim().length < 2) {
    return {
      success: false,
      message: "Category name must be at least 2 characters long",
    };
  }

  if (description.trim().length < 5) {
    return {
      success: false,
      message: "Description must be at least 5 characters long",
    };
  }

  try {
    return await createCategory(categoryName.trim(), description.trim());
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to create category",
    };
  }
};

export const deleteCategoryService = async (categoryName: string) => {
  if (!categoryName) {
    return {
      success: false,
      message: "Category name is required",
    };
  }

  try {
    return await deleteCategory(categoryName);
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to delete category",
    };
  }
};

// Property Type Services
export const getPropertyTypesService = async () => {
  try {
    return await getPropertyTypes();
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch property types",
    };
  }
};

export const createPropertyTypeService = async (propertyTypeName: string, description: string) => {
  if (!propertyTypeName || !description) {
    return {
      success: false,
      message: "Property type name and description are required",
    };
  }

  if (propertyTypeName.trim().length < 2) {
    return {
      success: false,
      message: "Property type name must be at least 2 characters long",
    };
  }

  if (description.trim().length < 5) {
    return {
      success: false,
      message: "Description must be at least 5 characters long",
    };
  }

  try {
    return await createPropertyType(propertyTypeName.trim(), description.trim());
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to create property type",
    };
  }
};

export const deletePropertyTypeService = async (propertyTypeName: string) => {
  if (!propertyTypeName) {
    return {
      success: false,
      message: "Property type name is required",
    };
  }

  try {
    return await deletePropertyType(propertyTypeName);
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to delete property type",
    };
  }
};






// Property Amenities Services
export const getPropertyAmenitiesService = async (type: string = "property") => {
  try {
    return await getPropertyAmenities(type);
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch property amenities",
    };
  }
};

export const createPropertyAmenitiesService = async (amenities: string[]) => {
  if (!amenities || amenities.length === 0) {
    return {
      success: false,
      message: "At least one amenity is required",
    };
  }

  // Filter out empty strings and validate
  const validAmenities = amenities.filter((a) => a.trim().length > 0);

  if (validAmenities.length === 0) {
    return {
      success: false,
      message: "Please provide valid amenity names",
    };
  }

  // Check for minimum length
  const invalidAmenities = validAmenities.filter((a) => a.trim().length < 2);
  if (invalidAmenities.length > 0) {
    return {
      success: false,
      message: "Each amenity name must be at least 2 characters long",
    };
  }

  try {
    return await createPropertyAmenities(validAmenities.map((a) => a.trim()));
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to create property amenities",
    };
  }
};

export const deletePropertyAmenitiesService = async (amenities: string[]) => {
  if (!amenities || amenities.length === 0) {
    return {
      success: false,
      message: "At least one amenity is required to delete",
    };
  }

  try {
    return await deletePropertyAmenities(amenities);
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to delete property amenities",
    };
  }
};

// Room Amenities Services
export const getRoomAmenitiesService = async () => {
  try {
    return await getRoomAmenities();
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch room amenities",
    };
  }
};

export const createRoomAmenitiesService = async (amenities: string[]) => {
  if (!amenities || amenities.length === 0) {
    return {
      success: false,
      message: "At least one amenity is required",
    };
  }

  // Filter out empty strings and validate
  const validAmenities = amenities.filter((a) => a.trim().length > 0);

  if (validAmenities.length === 0) {
    return {
      success: false,
      message: "Please provide valid amenity names",
    };
  }

  // Check for minimum length
  const invalidAmenities = validAmenities.filter((a) => a.trim().length < 2);
  if (invalidAmenities.length > 0) {
    return {
      success: false,
      message: "Each amenity name must be at least 2 characters long",
    };
  }

  try {
    return await createRoomAmenities(validAmenities.map((a) => a.trim()));
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to create room amenities",
    };
  }
};

export const deleteRoomAmenitiesService = async (amenities: string[]) => {
  if (!amenities || amenities.length === 0) {
    return {
      success: false,
      message: "At least one amenity is required to delete",
    };
  }

  try {
    return await deleteRoomAmenities(amenities);
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to delete room amenities",
    };
  }
};
// Loyalty Guest Fields Services
export const getLoyaltyGuestFieldsService = async () => {
  try {
    return await getLoyaltyGuestFields();
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch loyalty guest fields",
    };
  }
};

export const createLoyaltyGuestFieldsService = async (fields: string[]) => {
  if (!fields || fields.length === 0) {
    return {
      success: false,
      message: "At least one field is required",
    };
  }

  // Validate each field
  for (const field of fields) {
    if (!field || field.trim().length < 2) {
      return {
        success: false,
        message: "Each field name must be at least 2 characters long",
      };
    }
  }

  try {
    return await createLoyaltyGuestFields(fields.map(f => f.trim()));
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to create loyalty guest fields",
    };
  }
};

export const deleteLoyaltyGuestFieldService = async (id: string) => {
  if (!id) {
    return {
      success: false,
      message: "Field ID is required",
    };
  }

  try {
    return await deleteLoyaltyGuestField(id);
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to delete loyalty guest field",
    };
  }
};
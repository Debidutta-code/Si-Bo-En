import {createAddonCategory,updateCategory,fetchAddonCategories,deleteCategory} from "../api";
import type { IAddonCategoryCreate } from "../interface";

export const createCategoryService = async (data: IAddonCategoryCreate, propertyId: string) => {
    try {
        if(!data.name || data.name.trim() === "") {
            return { success: false, message: "Category name is required." };
        }
        if(!propertyId || propertyId.trim() === "") {
            return { success: false, message: "Property ID is required." };
        }
        const response = await createAddonCategory(data, propertyId);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to create category."};
    }
}
export const updateCategoryService = async (categoryId:string, data:IAddonCategoryCreate) => {
    try {
        if(!categoryId || categoryId.trim() === "") {
            return { success: false, message: "Category ID is required." };
        }
        if(!data.name || data.name.trim() === "") {
            return { success: false, message: "Category name is required." };
        }
        const response = await updateCategory(categoryId, data);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to update category."};
    }
}
export const fetchCategoriesService = async (propertyId: string) => {
    try {
        if(!propertyId || propertyId.trim() === "") {
            return { success: false, message: "Property detail is required." };
        }
        const response = await fetchAddonCategories(propertyId);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to fetch categories."};
    }
}
export const deleteCategoryService = async (categoryId:string) => {
    try {
        if(!categoryId || categoryId.trim() === "") {
            return { success: false, message: "Category ID is required." };
        }
        const response = await deleteCategory(categoryId);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to delete category."};
    }
}
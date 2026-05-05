import {createAddonSubCategory,
    deleteSubCategory,
    fetchAddonSubCategories,
    updateSubCategory
} from "../api";
import type { IAddonSubCategoryCreate,IAddonSubCategoryUpdate } from "../interface";

export const createSubCategoryService = async (data:IAddonSubCategoryCreate) => {
    try {
        if(!data.name || data.name.trim() === "") {
            return { success: false, message: "Sub-category name is required." };
        }
        if(!data.categoryId || data.categoryId.trim() === "") {
            return { success: false, message: "Category ID is required." };
        }
        const response = await createAddonSubCategory(data);
        return response;
    }
    catch (error) {
        return { success: false, message: "Failed to create sub-category."};
    }
}
export const updateSubCategoryService = async (subCategoryId:string, data:IAddonSubCategoryUpdate) => {
    try {
        if(!subCategoryId || subCategoryId.trim() === "") {
            return { success: false, message: "Sub-category ID is required." };
        }
        if(!data.name || data.name.trim() === "") {
            return { success: false, message: "Sub-category name is required." };
        }
        if(!data.categoryId || data.categoryId.trim() === "") {
            return { success: false, message: "Category ID is required." };
        }
        const response = await updateSubCategory(subCategoryId, data);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to update sub-category."};
    }
}
export const fetchSubCategoriesService = async () => {
    try {
        const response = await fetchAddonSubCategories();
        return response;
    } catch (error) {
        return { success: false, message: "Failed to fetch sub-categories."};
    }
}
export const deleteSubCategoryService = async (subCategoryId:string) => {
    try {
        if(!subCategoryId || subCategoryId.trim() === "") {
            return { success: false, message: "Sub-category ID is required." };
        }
        const response = await deleteSubCategory(subCategoryId);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to delete sub-category."};
    }
}
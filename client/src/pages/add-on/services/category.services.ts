import {createAddonCategory,updateCategory,fetchAddonCategories,deleteCategory} from "../api";
import type { IAddonCategoryCreate } from "../interface";

export const createCategoryService = async (data:IAddonCategoryCreate) => {
    try {
        if(!data.name || data.name.trim() === "") {
            return { success: false, message: "Category name is required." };
        }
        const response = await createAddonCategory(data);
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
export const fetchCategoriesService = async () => {
    try {
        const response = await fetchAddonCategories();
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
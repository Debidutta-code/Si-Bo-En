import {
    createSpaCategory,
    createSpaSubCategory,
    deleteSpaCategory,
    deleteSpaSubCategory,
    getAllSpaCategory,
    getAllSpaSubCategories,
    updateSpaCategory,
    updateSpaSubCategory
} from "../api/spa.api";
import type { ICSpaCatrgory, IUSpaSubCategory } from "../types";

export const createSpaCategoryService = async (data: ICSpaCatrgory) => {
    try {
        if (!data.name || !data.name.trim()) {
            throw new Error("Invalid Spa Category Name");
        }
        const result = await createSpaCategory({
            name: data.name.trim().toLowerCase()
        });
        return result;
    } catch (error) {
        return {
            success: false,
            message: "Failed to create spa category"
        };
    }
};
export const getAllSpaCategoryService = async () => {
    try {
        const result = await getAllSpaCategory();
        return result;
    } catch (error) {
        return {
            success: false,
            message: "Failed to retrieve spa categories"
        };
    }
};
export const updateSpaCategoryService = async (id: string, data: ICSpaCatrgory) => {
    try {
        if (!data.name || !data.name.trim()) {
            throw new Error("Invalid Spa Category Name");
        }
        const result = await updateSpaCategory(id, {
            name: data.name.trim().toLowerCase()
        });
        return result;
    } catch (error) {
        return {
            success: false,
            message: "Failed to update spa category"
        };
    }
};
export const deleteSpaCategoryService = async (id: string) => {
    try {
        const result = await deleteSpaCategory(id);
        return result;
    } catch (error) {
        return {
            success: false,
            message: "Failed to delete spa category"
        };
    }
};


export const createSpaSubCategoryService = async (data: { name: string; categoryId: string }) => {
    try {
        if (!data.name || !data.name.trim()) {
            throw new Error("Invalid Spa Sub-Category Name");
        }
        const result = await createSpaSubCategory({
            name: data.name.trim().toLowerCase(),
            categoryId: data.categoryId
        });
        return result;
    } catch (error) {
        return {
            success: false,
            message: "Failed to create spa sub-category"
        };
    }
};
export const getAllSpaSubCategoriesService = async (categoryId?: string) => {
    try {
        const result = await getAllSpaSubCategories(categoryId);
        return result;
    } catch (error) {
        return {
            success: false,
            message: "Failed to retrieve spa sub-categories"
        };
    }
};
export const updateSpaSubCategoryService = async (id: string, data:IUSpaSubCategory) => {
    try {
        if (!data.name || !data.name.trim()) {
            throw new Error("Invalid Spa Sub-Category Name");
        }
        const result = await updateSpaSubCategory(id, {
            ...data,
            name: data.name.trim().toLowerCase(),
        });
        return result;
    } catch (error) {
        return {
            success: false,
            message: "Failed to update spa sub-category"
        };
    }
};
export const deleteSpaSubCategoryService = async (id: string) => {
    try {
        const result = await deleteSpaSubCategory(id);
        return result;
    } catch (error) {
        return {
            success: false,
            message: "Failed to delete spa sub-category"
        };
    }
};

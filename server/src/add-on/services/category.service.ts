import CategoryAddonRepository from '../repository/categoryAddon.repository';
import { IAddOnCategory, ICCategory } from '../interfaces';
import { IApiResponse } from '../../utils/return.types';
import { successResponse, errorResponse } from '../../utils/return';
import { generateAddOnCategoryCode } from '../utils/';
export class CategoryService {
    /**
     * Create a new addon category
     */
    async createCategory(name: string): Promise<IApiResponse> {
        try {
            const code = await generateAddOnCategoryCode();
            const category = await CategoryAddonRepository.createCategory(
                name,
                code
            );
            return successResponse('Category created successfully', category);
        } catch (error: any) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to create category',
                    error.message
                );
            }
            return errorResponse('Failed to create category', 'Unknown error');
        }
    }

    /**
     * Get all categories
     */
    async getAllCategories(): Promise<IApiResponse> {
        try {
            const categories = await CategoryAddonRepository.getAllCategories();
            return successResponse(
                'Categories fetched successfully',
                categories
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to fetch categories',
                    error.message
                );
            }
            return errorResponse('Failed to fetch categories', 'Unknown error');
        }
    }

    /**
     * Get category by ID
     */
    async getCategoryById(categoryId: string): Promise<IApiResponse> {
        try {
            const category =
                await CategoryAddonRepository.getCategoryById(categoryId);
            if (!category) {
                return errorResponse(
                    'Category not found',
                    'Category not found'
                );
            }

            return successResponse('Category fetched successfully', category);
        } catch (error: any) {
            if (error instanceof Error) {
                return errorResponse('Failed to fetch category', error.message);
            }
            return errorResponse('Failed to fetch category', 'Unknown error');
        }
    }

    /**
     * Update category
     */
    async updateCategory(
        categoryId: string,
        updateData: ICCategory
    ): Promise<IApiResponse> {
        try {
            // Check if category exists
            const existingCategory =
                await CategoryAddonRepository.getCategoryById(categoryId);
            if (!existingCategory) {
                return errorResponse(
                    'Category not found',
                    'Category not found'
                );
            }

            // If updating code, check for duplicates
            if (updateData.code && updateData.code !== existingCategory.code) {
                const allCategories =
                    await CategoryAddonRepository.getAllCategories();
                const codeExists = allCategories.some(
                    cat => cat.code === updateData.code
                );

                if (codeExists) {
                    return errorResponse(
                        'Category with this code already exists',
                        'Category with this code already exists'
                    );
                }
            }

            const updatedCategory =
                await CategoryAddonRepository.updateCategory(
                    categoryId,
                    updateData
                );
            if (!updatedCategory) {
                return errorResponse(
                    'Failed to update category',
                    'Failed to update category'
                );
            }

            return successResponse(
                'Category updated successfully',
                updatedCategory
            );
        } catch (error: any) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to update category',
                    error.message
                );
            }
            return errorResponse('Failed to update category', 'Unknown error');
        }
    }

    /**
     * Add subcategory to category
     */
    async addSubCategoryToCategory(
        categoryId: string,
        subCategoryId: string
    ): Promise<IApiResponse> {
        try {
            const category =
                await CategoryAddonRepository.addSubCategoryToCategory(
                    categoryId,
                    subCategoryId
                );
            if (!category) {
                return errorResponse(
                    'Failed to add subcategory to category',
                    'Failed to add subcategory to category'
                );
            }

            return successResponse(
                'Subcategory added to category successfully',
                category
            );
        } catch (error: any) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to add subcategory to category',
                    error.message
                );
            }
            return errorResponse(
                'Failed to add subcategory to category',
                'Unknown error'
            );
        }
    }
    /**
     * Remove subcategory from category
     */
    async removeSubCategoryFromCategory(
        categoryId: string,
        subCategoryId: string
    ): Promise<IApiResponse> {
        try {
            const category =
                await CategoryAddonRepository.removeSubCategoryFromCategory(
                    categoryId,
                    subCategoryId
                );
            if (!category) {
                return errorResponse(
                    'Failed to remove subcategory from category',
                    'Failed to remove subcategory from category'
                );
            }

            return successResponse(
                'Subcategory removed from category successfully',
                category
            );
        } catch (error: any) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to remove subcategory from category',
                    error.message
                );
            }
            return errorResponse(
                'Failed to remove subcategory from category',
                'Unknown error'
            );
        }
    }
}

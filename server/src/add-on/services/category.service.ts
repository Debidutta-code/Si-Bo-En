import CategoryAddonRepository from '../repository/categoryAddon.repository';
import { IAddOnCategory, ICCategory, IUCategory } from '../interfaces';
import { IApiResponse } from '../../utils/return.types';
import { successResponse, errorResponse } from '../../utils/return';
import { generateAddOnCategoryCode } from '../utils/';
export class CategoryService {
    private categoryAddonRepository: CategoryAddonRepository;

    constructor() {
        this.categoryAddonRepository = new CategoryAddonRepository();
    }

    public async createCategory(name: string, propertyId: string): Promise<IApiResponse> {
        try {
            const code = await generateAddOnCategoryCode();
            const category = await this.categoryAddonRepository.createCategory(
                name,
                code,
                propertyId
            );
            return successResponse('Category created successfully', category);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to create category',
                    error.message
                );
            }
            return errorResponse('Failed to create category', 'Unknown error');
        }
    }

    public async getAllCategories(propertyId: string): Promise<IApiResponse> {
        try {
            const categories = await this.categoryAddonRepository.getAllCategories(propertyId);
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

    public async getCategoryById(categoryId: string): Promise<IApiResponse> {
        try {
            const category =
                await this.categoryAddonRepository.getCategoryById(categoryId);
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
    public async updateCategory(
        categoryId: string,
        updateData: IUCategory
    ): Promise<IApiResponse> {
        try {
            // Check if category exists
            const existingCategory =
                await this.categoryAddonRepository.getCategoryById(categoryId);
            if (!existingCategory) {
                return errorResponse(
                    'Category not found',
                    'Category not found'
                );
            }



            const updatedCategory =
                await this.categoryAddonRepository.updateCategory(
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
    public async deleteCategory(categoryId: string): Promise<IApiResponse> {
        try {
            const existingCategory =
                await this.categoryAddonRepository.getCategoryById(categoryId);
            if (!existingCategory) {
                return errorResponse(
                    'Category not found',
                    'Category not found'
                );
            }
            const deleted = await this.categoryAddonRepository.deleteCategory(categoryId);
            if (!deleted) {
                return errorResponse('Failed to delete category', 'Category not found');
            }
            return successResponse('Category deleted successfully');
        } catch (error: any) {
            if (error instanceof Error) {
                return errorResponse('Failed to delete category', error.message);
            }
            return errorResponse('Failed to delete category', 'Unknown error');
        }
    }
}
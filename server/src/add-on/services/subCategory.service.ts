import SubCategoryRepository from '../repository/subCategory.repository';
import CategoryAddonRepository from '../repository/categoryAddon.repository';
import { IAddonSubCategory, IUSubCategory } from '../interfaces';
import { successResponse, errorResponse } from '../../utils/return';
import { IApiResponse } from '../../utils/return.types';
export class SubCategoryService {
    private subCategoryRepository: SubCategoryRepository;
    private categoryAddonRepository: CategoryAddonRepository;

    constructor() {
        this.subCategoryRepository = new SubCategoryRepository();
        this.categoryAddonRepository = new CategoryAddonRepository();
    }
    public async createSubCategory(
        code: string,
        name: string,
        categoryId: string,
        propertyId: string
    ): Promise<IApiResponse> {
        try {
            // Check if category exists
            const category =
                await this.categoryAddonRepository.getCategoryById(categoryId);
            if (!category) {
                return errorResponse(
                    'Category not found',
                    'Category not found'
                );
            }
            const subCategory = await this.subCategoryRepository.createSubCategory(
                code,
                name,
                categoryId,
                propertyId
            );

            return successResponse(
                'Subcategory created successfully',
                subCategory
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to create subcategory',
                    error.message
                );
            }
            return errorResponse(
                'Failed to create subcategory',
                'Unknown error'
            );
        }
    }

    public async getAllSubCategories(propertyId: string): Promise<IApiResponse> {
        try {
            const subCategories =
                await this.subCategoryRepository.getAllSubCategories(propertyId);
            return successResponse(
                'Subcategories fetched successfully',
                subCategories
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to fetch subcategories',
                    error.message
                );
            }
            return errorResponse(
                'Failed to fetch subcategories',
                'Unknown error'
            );
        }
    }

    public async getSubCategoryById(subCategoryId: string): Promise<IApiResponse> {
        try {
            const subCategory =
                await this.subCategoryRepository.getSubCategoryById(subCategoryId);
            if (!subCategory) {
                return errorResponse(
                    'Subcategory not found',
                    'Subcategory not found'
                );
            }

            return successResponse(
                'Subcategory fetched successfully',
                subCategory
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to fetch subcategory',
                    error.message
                );
            }
            return errorResponse(
                'Failed to fetch subcategory',
                'Unknown error'
            );
        }
    }

    public async updateSubCategory(
        subCategoryId: string,
        updateData: IUSubCategory
    ): Promise<IApiResponse> {
        try {
            // Check if subcategory exists
            const existingSubCategory =
                await this.subCategoryRepository.getSubCategoryById(subCategoryId);
            if (!existingSubCategory) {
                return errorResponse(
                    'Subcategory not found',
                    'Subcategory not found'
                );
            }

         

            const updatedSubCategory =
                await this.subCategoryRepository.updateSubCategory(
                    subCategoryId,
                    updateData
                );
            if (!updatedSubCategory) {
                return errorResponse(
                    'Failed to update subcategory',
                    'Failed to update subcategory'
                );
            }

            return successResponse(
                'Subcategory updated successfully',
                updatedSubCategory
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to update subcategory',
                    error.message
                );
            }
            return errorResponse(
                'Failed to update subcategory',
                'Unknown error'
            );
        }
    }
    public async deleteSubCategory(subCategoryId: string): Promise<IApiResponse> {
        try {
            const existingSubCategory =
                await this.subCategoryRepository.getSubCategoryById(subCategoryId);
            if (!existingSubCategory) {
                return errorResponse(
                    'Subcategory not found',
                    'Subcategory not found'
                );
            }

            const deletedSubCategory =
                await this.subCategoryRepository.deleteSubCategory(subCategoryId);
            if (!deletedSubCategory) {
                return errorResponse(
                    'Failed to delete subcategory',
                    'Failed to delete subcategory'
                );
            }

            return successResponse(
                'Subcategory deleted successfully',
                deletedSubCategory
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to delete subcategory',
                    error.message
                );
            }
            return errorResponse(
                'Failed to delete subcategory',
                'Unknown error'
            );
        }
    }
}

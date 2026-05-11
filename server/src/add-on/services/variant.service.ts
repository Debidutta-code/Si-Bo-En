import VariantRepository from '../repository/variant.repository';
import SubCategoryRepository from '../repository/subCategory.repository';
import { IAddonVariant, IUVariant } from '../interfaces';
import { successResponse, errorResponse } from '../../utils/return';
import { IApiResponse } from '../../utils/return.types';

export class VariantService {
    private variantRepository: VariantRepository;
    private subCategoryRepository: SubCategoryRepository;

    constructor() {
        this.variantRepository = new VariantRepository();
        this.subCategoryRepository = new SubCategoryRepository();
    }

    public async createVariant(
        code: string,
        name: string,
        subcategoryId: string,
        propertyId: string
    ): Promise<IApiResponse> {
        try {
            const subCategory =
                await this.subCategoryRepository.getSubCategoryById(subcategoryId);
            if (!subCategory) {
                return errorResponse(
                    'Subcategory not found',
                    'Subcategory not found'
                );
            }

            const variant = await this.variantRepository.createVariant(
                code,
                name,
                subcategoryId,
                propertyId
            );
            return successResponse('Variant created successfully', variant);
        } catch (error: any) {
            if (error instanceof Error) {
                return errorResponse('Failed to create variant', error.message);
            }
            return errorResponse('Failed to create variant', 'Unknown error');
        }
    }
    public async getAllVariants(propertyId: string): Promise<IApiResponse> {
        try {
            const variants = await this.variantRepository.getAllVariants(propertyId);
            return successResponse('Variants fetched successfully', variants);
        } catch (error: any) {
            if (error instanceof Error) {
                return errorResponse('Failed to fetch variants', error.message);
            }
            return errorResponse('Failed to fetch variants', 'Unknown error');
        }
    }

    public async getVariantById(variantId: string): Promise<IApiResponse> {
        try {
            const variant = await this.variantRepository.getVariantById(variantId);
            if (!variant) {
                return errorResponse('Variant not found', 'Variant not found');
            }

            return successResponse('Variant fetched successfully', variant);
        } catch (error: any) {
            if (error instanceof Error) {
                return errorResponse('Failed to fetch variant', error.message);
            }
            return errorResponse('Failed to fetch variant', 'Unknown error');
        }
    }
    public async getVariantsBySubCategoryId(
        subcategoryId: string
    ): Promise<IApiResponse> {
        try {
            const variants =
                await this.variantRepository.getBySubCategoryId(
                    subcategoryId
                );
            return successResponse('Variants fetched successfully', variants);
        } catch (error: any) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to fetch variants by subcategory',
                    error.message
                );
            }
            return errorResponse(
                'Failed to fetch variants by subcategory',
                'Unknown error'
            );
        }
    }

    async updateVariant(
        variantId: string,
        updateData: IUVariant
    ): Promise<IApiResponse> {
        try {
            // Check if variant exists
            const existingVariant =
                await this.variantRepository.getVariantById(variantId);
            if (!existingVariant) {
                return errorResponse('Variant not found', 'Variant not found');
            }
            const updatedVariant = await this.variantRepository.updateVariant(
                variantId,
                updateData
            );
            if (!updatedVariant) {
                return errorResponse(
                    'Failed to update variant',
                    'Failed to update variant'
                );
            }

            return successResponse(
                'Variant updated successfully',
                updatedVariant
            );
        } catch (error: any) {
            if (error instanceof Error) {
                return errorResponse('Failed to update variant', error.message);
            }
            return errorResponse('Failed to update variant', 'Unknown error');
        }
    }

    async deleteVariant(variantId: string): Promise<IApiResponse> {
        try {
            const variant = await this.variantRepository.deleteVariant(variantId);
            if (!variant) {
                return errorResponse('Variant not found', 'Variant not found');
            }

            return successResponse('Variant deleted successfully', variant);
        } catch (error: any) {
            if (error instanceof Error) {
                return errorResponse('Failed to delete variant', error.message);
            }
            return errorResponse('Failed to delete variant', 'Unknown error');
        }
    }

}

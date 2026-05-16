import { Request, Response } from 'express';
import { VariantService } from '../services';
import { generateAddOnVariantCode } from '../utils';
import { successResponse, errorResponse } from '../../utils/return';
import { CustomRequest, PropertyCustomRequest } from '../../utils';
import { VariantInterceptor } from '../../multi-language/interceptors/addon/variant.interceptor';

export class VariantController {
    private variantService: VariantService;

    constructor() {
        this.variantService = new VariantService();
    }

    public async createVariant(req: PropertyCustomRequest, res: Response) {
        try {
            let { name, subcategoryId } = req.body;
            const id = req.property?.id;
            if (!id) {
                return res.status(400).json(errorResponse('Property detail is required for creating category'));
            }

            const code = await generateAddOnVariantCode();

            const variant = await this.variantService.createVariant(
                code,
                name,
                subcategoryId,
                id
            );

            return res.status(variant.success ? 201 : 400).json(variant);
        } catch (error: any) {
            console.error(
                'Failed to create variant at Controller Layer:',
                error
            );

            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse('Failed to create variant', error.message)
                    );
            }

            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to create variant',
                        'Unable to create variant at this moment'
                    )
                );
        }
    };

    public async getAllVariants(req: CustomRequest, res: Response) {
        try {
            const locale = req.headers['accept-language']?.slice(0, 2).toLowerCase() || 'en';
            const propertyId = req.query.id as string;
            if(!propertyId){
                return res.status(400).json(errorResponse('Property detail is required for fetching variants'));
            }
            let variants = await this.variantService.getAllVariants(propertyId);

            variants = await VariantInterceptor.intercept(variants, locale);

            return res.status(variants.success ? 200 : 400).json(variants);
        } catch (error: any) {
            console.error(
                'Failed to fetch variants at Controller Layer:',
                error
            );

            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to fetch variants',
                        'Unable to fetch variants at this moment'
                    )
                );
        }
    };

    public async getVariantById(req: CustomRequest, res: Response) {
        try {
            const locale = req.headers['accept-language']?.slice(0, 2).toLowerCase() || 'en';
            const { variantId } = req.params;

            let variant = await this.variantService.getVariantById(variantId);

            variant = await VariantInterceptor.intercept(variant, locale);

            return res.status(variant.success ? 200 : 400).json(variant);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse('Failed to fetch variant', error.message)
                    );
            }

            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to fetch variant',
                        'Unable to fetch variant at this moment'
                    )
                );
        }
    };

    public async getVariantsBySubCategoryId(req: CustomRequest, res: Response) {
        try {
            const locale = req.headers['accept-language']?.slice(0, 2).toLowerCase() || 'en';
            const { subcategoryId } = req.params;

            let variants =
                await this.variantService.getVariantsBySubCategoryId(
                    subcategoryId
                );

            variants = await VariantInterceptor.intercept(variants, locale);

            return res.status(variants.success ? 200 : 400).json(variants);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to fetch variants by subcategory',
                            error.message
                        )
                    );
            }

            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to fetch variants by subcategory',
                        'Unable to fetch variants at this moment'
                    )
                );
        }
    };

    public async updateVariant(req: CustomRequest, res: Response) {
        try {
            const { variantId } = req.params;
            const updateData = req.body;

            if (Object.keys(updateData).length === 0) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Update payload cannot be empty',
                            'Update payload cannot be empty'
                        )
                    );
            }

            const variant = await this.variantService.updateVariant(
                variantId,
                updateData
            );

            return res.status(variant.success ? 200 : 400).json(variant);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse('Failed to update variant', error.message)
                    );
            }

            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to update variant',
                        'Unable to update variant at this moment'
                    )
                );
        }
    };

    public async deleteVariant(req: CustomRequest, res: Response) {
        try {
            const { variantId } = req.params;

            const variant = await this.variantService.deleteVariant(variantId);

            return res.status(variant.success ? 200 : 400).json(variant);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse('Failed to delete variant', error.message)
                    );
            }

            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to delete variant',
                        'Unable to delete variant at this moment'
                    )
                );
        }
    };


}

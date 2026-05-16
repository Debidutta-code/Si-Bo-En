import { Request, Response } from 'express';
import { SubCategoryService } from '../services';
import { generateAddOnSubCategoryCode } from '../utils';
import { successResponse, errorResponse } from '../../utils/return';
import { CustomRequest, PropertyCustomRequest } from '../../utils';
import { SubCategoryInterceptor } from '../../multi-language/interceptors/addon/subcategory.interceptor';

export class SubCategoryController {
    private subCategoryService: SubCategoryService;

    constructor() {
        this.subCategoryService = new SubCategoryService();
    }

    public async createSubCategory(req: PropertyCustomRequest, res: Response) {
        try {
            let { name, categoryId } = req.body;
            const id = req.property?.id;
            if (!id) {
                return res.status(400).json(errorResponse('Property detail is required for creating category'));
            }

            const code = await generateAddOnSubCategoryCode();

            const subCategory = await this.subCategoryService.createSubCategory(
                code,
                name,
                categoryId,
                id
            );

            return res
                .status(subCategory.success ? 201 : 400)
                .json(subCategory);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to create subcategory',
                            error.message
                        )
                    );
            }

            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to create subcategory',
                        'Unable to create subcategory at this moment'
                    )
                );
        }
    };

    public async getAllSubCategories(req: CustomRequest, res: Response) {
        try {
            const locale = req.headers['accept-language']?.slice(0, 2).toLowerCase() || 'en';
            const id = req.query?.id as string;
            if (!id) {
                return res.status(400).json(errorResponse('Property detail is required for creating category'));
            }
            let subCategories =
                await this.subCategoryService.getAllSubCategories(id);

            subCategories = await SubCategoryInterceptor.intercept(subCategories, locale);

            return res
                .status(subCategories.success ? 200 : 400)
                .json(subCategories);
        } catch (error: any) {
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to fetch subcategories',
                        'Unable to fetch subcategories at this moment'
                    )
                );
        }
    };

    public async getSubCategoryById(req: CustomRequest, res: Response) {
        try {
            const locale = req.headers['accept-language']?.slice(0, 2).toLowerCase() || 'en';
            const { subcategoryId } = req.params;

            let subCategory =
                await this.subCategoryService.getSubCategoryById(subcategoryId);

            subCategory = await SubCategoryInterceptor.intercept(subCategory, locale);

            return res
                .status(subCategory.success ? 200 : 400)
                .json(subCategory);
        } catch (error: any) {
            console.error(
                'Failed to fetch subcategory at Controller Layer:',
                error
            );

            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to fetch subcategory',
                            error.message
                        )
                    );
            }

            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to fetch subcategory',
                        'Unable to fetch subcategory at this moment'
                    )
                );
        }
    };

    public async updateSubCategory(req: CustomRequest, res: Response) {
        try {
            const { subcategoryId } = req.params;
            const updateData = req.body;

            

            const subCategory = await this.subCategoryService.updateSubCategory(
                subcategoryId,
                updateData
            );

            return res
                .status(subCategory.success ? 200 : 400)
                .json(subCategory);
        } catch (error: any) {
            console.error(
                'Failed to update subcategory at Controller Layer:',
                error
            );

            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to update subcategory',
                            error.message
                        )
                    );
            }

            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to update subcategory',
                        'Unable to update subcategory at this moment'
                    )
                );
        }
    };
    public async deleteSubCategory(req: CustomRequest, res: Response) {
        try {
            const { subcategoryId } = req.params;

            const subCategory = await this.subCategoryService.deleteSubCategory(subcategoryId);

            return res.status(subCategory.success ? 200 : 400).json(subCategory);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse('Failed to delete subcategory', error.message)
                    );
            }

            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to delete subcategory',
                        'Unable to delete subcategory at this moment'
                    )
                );
        }
    }

}

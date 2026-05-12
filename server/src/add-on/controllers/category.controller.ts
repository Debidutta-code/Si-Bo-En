import { Request, Response } from 'express';
import { CategoryService } from '../services';
import { successResponse, errorResponse } from '../../utils/return';
import { CustomRequest, PropertyCustomRequest } from '../../utils';
export class CategoryController {
    private categoryService: CategoryService;

    constructor() {
        this.categoryService = new CategoryService();
    }

    public async createCategory(req: PropertyCustomRequest, res: Response) {
        try {
            const { name } = req.body;
            const id  = req.property?.id;
            if (!id) {
                return res.status(400).json(errorResponse('Property detail is required for creating category'));
            }
            const category = await this.categoryService.createCategory(name, id);

            return res.status(category.success ? 201 : 400).json(category);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to create category',
                            error.message
                        )
                    );
            }

            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to create category',
                        'Unable to create category at this moment'
                    )
                );
        }
    };

    public async getAllCategories(req: CustomRequest, res: Response) {
        try {
            const id = req.query?.id as string;
            if (!id) {
                return res.status(400).json(errorResponse('Property detail is required for fetching categories'));
            }
            const categories = await this.categoryService.getAllCategories(id);

            return res.status(categories.success ? 200 : 400).json(categories);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to fetch categories',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to fetch categories',
                        'Unable to fetch categories at this moment'
                    )
                );
        }
    };

    public async getCategoryById(req: CustomRequest, res: Response) {
        try {
            const { categoryId } = req.params;

            const category =
                await this.categoryService.getCategoryById(categoryId);

            return res.status(category.success ? 200 : 400).json(category);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse('Failed to fetch category', error.message)
                    );
            }

            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to fetch category',
                        'Unable to fetch category at this moment'
                    )
                );
        }
    };

    public async updateCategory(req: CustomRequest, res: Response) {
        try {
            const { categoryId } = req.params;
            const updateData = req.body;

            if (Object.keys(updateData).length === 0) {
                return res
                    .status(400)
                    .json(errorResponse('Update payload cannot be empty'));
            }

            const category = await this.categoryService.updateCategory(
                categoryId,
                updateData
            );

            return res.status(category.success ? 200 : 400).json(category);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to update category',
                            error.message
                        )
                    );
            }

            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to update category',
                        'Unable to update category at this moment'
                    )
                );
        }
    };

    public async deleteCategory(req: CustomRequest, res: Response) {
        try {
            const { categoryId } = req.params;

            const category = await this.categoryService.deleteCategory(categoryId);

            return res.status(category.success ? 200 : 400).json(category);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse('Failed to delete category', error.message)
                    );
            }

            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to delete category',
                        'Unable to delete category at this moment'
                    )
                );
        }
    }
}

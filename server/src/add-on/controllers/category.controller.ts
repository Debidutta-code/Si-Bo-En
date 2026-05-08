import { Request, Response } from 'express';
import { CategoryService } from '../services';
import { successResponse, errorResponse } from '../../utils/return';
export class CategoryController {
    private categoryService: CategoryService;

    constructor() {
        this.categoryService = new CategoryService();
    }

    /**
     * Create a new category
     */
    createCategory = async (req: Request, res: Response) => {
        try {
            const { name } = req.body;

            const category = await this.categoryService.createCategory(name);

            return res.status(category.success ? 201 : 400).json(category);
        } catch (error: any) {
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

    /**
     * Get all categories
     */
    getAllCategories = async (req: Request, res: Response) => {
        try {
            const categories = await this.categoryService.getAllCategories();

            return res.status(categories.success ? 200 : 400).json(categories);
        } catch (error: any) {
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

    /**
     * Get category by ID
     */
    getCategoryById = async (req: Request, res: Response) => {
        try {
            const { categoryId } = req.params;

            const category =
                await this.categoryService.getCategoryById(categoryId);

            return res.status(category.success ? 200 : 400).json(category);
        } catch (error: any) {
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

    /**
     * Update category
     */
    updateCategory = async (req: Request, res: Response) => {
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
        } catch (error: any) {
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

    /**
     * Add subcategory to category
     */
    addSubCategoryToCategory = async (req: Request, res: Response) => {
        try {
            const { categoryId } = req.params;
            const { subcategoryId } = req.body;

            if (!subcategoryId) {
                return res
                    .status(400)
                    .json(errorResponse('Subcategory ID is required'));
            }

            const category =
                await this.categoryService.addSubCategoryToCategory(
                    categoryId,
                    subcategoryId
                );

            return res.status(category.success ? 200 : 400).json(category);
        } catch (error: any) {
            console.error(
                'Failed to add subcategory to category at Controller Layer:',
                error
            );

            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to add subcategory to category',
                            error.message
                        )
                    );
            }

            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to add subcategory to category',
                        'Unable to add subcategory to category at this moment'
                    )
                );
        }
    };

    /**
     * Remove subcategory from category
     */
    removeSubCategoryFromCategory = async (req: Request, res: Response) => {
        try {
            const { categoryId, subcategoryId } = req.params;

            const category =
                await this.categoryService.removeSubCategoryFromCategory(
                    categoryId,
                    subcategoryId
                );

            return res.status(category.success ? 200 : 400).json(category);
        } catch (error: any) {
            console.error(
                'Failed to remove subcategory from category at Controller Layer:',
                error
            );

            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to remove subcategory from category',
                            error.message
                        )
                    );
            }

            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to remove subcategory from category',
                        'Unable to remove subcategory from category at this moment'
                    )
                );
        }
    };
}

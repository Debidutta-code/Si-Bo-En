import { CustomRequest } from '../../utils/customRequest';
import { errorResponse } from '../../utils/return';
import { CategoryService } from '../services';
import { Response } from 'express';
import { MasterPropertyCategoryInterceptor } from '../../multi-language/interceptors/masters/master-property-category.interceptor';

export class Category {
    private categoryService: CategoryService;
    constructor() {
        this.categoryService = new CategoryService();
    }
    public async createCategory(req: CustomRequest, res: Response) {
        try {
            const { categoryName, description } = req.body;
            if (!categoryName || !description) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Category Name and description required to create category'
                        )
                    );
            }
            const serRes = await this.categoryService.createCategory(
                categoryName,
                description
            );
            if (serRes.success) {
                return res.status(200).json(serRes);
            } else {
                return res.status(400).json(serRes);
            }
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal Server Error', error?.message));
        }
    }
    public async getCategory(req: CustomRequest, res: Response) {
        try {
            const locale = req.headers['accept-language']?.slice(0, 2).toLowerCase() || 'en';

            let serRes = await this.categoryService.getCategory();
            serRes = await MasterPropertyCategoryInterceptor.intercept(serRes as any, locale);

            if (serRes.success) {
                return res.status(200).json(serRes);
            } else {
                return res.status(400).json(serRes);
            }
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal Server Error', error?.message));
        }
    }
    public async deleteCategory(req: CustomRequest, res: Response) {
        try {
            const categoryName = req.params.categoryName;
            if (!categoryName) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Category Name is required to delete category'
                        )
                    );
            }
            const serRes =
                await this.categoryService.deleteCategory(categoryName);
            if (serRes.success) {
                return res.status(200).json(serRes);
            } else {
                return res.status(400).json(serRes);
            }
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal Server Error', error?.message));
        }
    }
}

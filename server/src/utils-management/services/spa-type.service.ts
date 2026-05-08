import { IApiResponse, successResponse, errorResponse } from '../../utils';
import { SpaCategory, SpaSubCategory } from '../repository';
import { ICSpaCatrgory, ICSpaSubCategory, IUSpaSubCategory } from '../types';

export class SpaCategoryService {
    private spaCategoryRepo: SpaCategory;

    constructor() {
        this.spaCategoryRepo = new SpaCategory();
    }
    public async createSpaCategory(data: ICSpaCatrgory): Promise<IApiResponse> {
        try {
            const isExists = await this.spaCategoryRepo.getByName(data.name);
            if (isExists) {
                return errorResponse('Spa Category already exists');
            }
            const result = await this.spaCategoryRepo.createSpaCategory({
                name: data.name,
            });
            return successResponse('Spa Category created successfully');
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Error occuring while creating Spa Category',
                    error.message
                );
            }
            return errorResponse('Error occuring while creating Spa Category');
        }
    }
    public async getSpaCategories(): Promise<IApiResponse> {
        try {
            const result = await this.spaCategoryRepo.getSpaCategories();
            return successResponse(
                'Spa Categories fetched successfully',
                result
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Error occuring while fetching Spa Categories',
                    error.message
                );
            }
            return errorResponse(
                'Error occuring while fetching Spa Categories'
            );
        }
    }
    public async updateSpaCategory(
        id: string,
        data: ICSpaCatrgory
    ): Promise<IApiResponse> {
        try {
            const isExists = await this.spaCategoryRepo.getById(id);
            if (!isExists) {
                return errorResponse('Spa Category does not exist');
            }
            const result = await this.spaCategoryRepo.update(id, {
                name: data.name,
            });
            return successResponse('Spa Category updated successfully', result);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Error occuring while updating Spa Category',
                    error.message
                );
            }
            return errorResponse('Error occuring while updating Spa Category');
        }
    }
    public async deleteCategory(id: string): Promise<IApiResponse> {
        try {
            const isExists = await this.spaCategoryRepo.getById(id);
            if (!isExists) {
                return errorResponse('Spa Category does not exist');
            }
            await this.spaCategoryRepo.delete(id);
            return successResponse('Spa Category deleted successfully');
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Error occuring while deleting Spa Category',
                    error.message
                );
            }
            return errorResponse('Error occuring while deleting Spa Category');
        }
    }
}

export class SpaSubCategoryService {
    private spaSubCategoryRepo: SpaSubCategory;

    constructor() {
        this.spaSubCategoryRepo = new SpaSubCategory();
    }

    public async createSpaSubCategory(
        data: ICSpaSubCategory
    ): Promise<IApiResponse> {
        try {
            const isExists = await this.spaSubCategoryRepo.getByName(
                data.name,
                data.categoryId
            );
            if (isExists) {
                return errorResponse('Spa SubCategory already exists');
            }
            const result = await this.spaSubCategoryRepo.createSpaSubCategory({
                name: data.name,
                categoryId: data.categoryId,
            });
            return successResponse('Spa SubCategory created successfully');
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Error occuring while creating Spa SubCategory',
                    error.message
                );
            }
            return errorResponse(
                'Error occuring while creating Spa SubCategory'
            );
        }
    }

    public async getSpaSubCategories(
        categoryId?: string
    ): Promise<IApiResponse> {
        try {
            const result = categoryId
                ? await this.spaSubCategoryRepo.getByCategoryId(categoryId)
                : await this.spaSubCategoryRepo.getSubCategories();
            return successResponse(
                'Spa SubCategories fetched successfully',
                result
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Error occuring while fetching Spa SubCategories',
                    error.message
                );
            }
            return errorResponse(
                'Error occuring while fetching Spa SubCategories'
            );
        }
    }

    public async updateSpaSubCategory(
        id: string,
        data: IUSpaSubCategory
    ): Promise<IApiResponse> {
        try {
            const isExists = await this.spaSubCategoryRepo.getById(id);
            if (!isExists) {
                return errorResponse('Spa SubCategory does not exist');
            }
            const result = await this.spaSubCategoryRepo.update(id, {
                name: data.name,
                isActive: data.isActive,
            });
            return successResponse('Spa SubCategory updated successfully');
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Error occuring while updating Spa SubCategory',
                    error.message
                );
            }
            return errorResponse(
                'Error occuring while updating Spa SubCategory'
            );
        }
    }

    public async deleteSubCategory(id: string): Promise<IApiResponse> {
        try {
            const isExists = await this.spaSubCategoryRepo.getById(id);
            if (!isExists) {
                return errorResponse('Spa SubCategory does not exist');
            }
            await this.spaSubCategoryRepo.delete(id);
            return successResponse('Spa SubCategory deleted successfully');
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Error occuring while deleting Spa SubCategory',
                    error.message
                );
            }
            return errorResponse(
                'Error occuring while deleting Spa SubCategory'
            );
        }
    }
}

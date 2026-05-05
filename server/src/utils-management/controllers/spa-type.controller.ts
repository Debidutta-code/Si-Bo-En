import { Response } from "express";
import { CustomRequest, errorResponse } from "../../utils";
import { SpaCategoryService, SpaSubCategoryService } from "../services/spa-type.service";
import { ICSpaCatrgory, ICSpaSubCategory, IUSpaSubCategory } from "../types";

export class SpaCategoryController {
    private spaCategoryService: SpaCategoryService;

    constructor() {
        this.spaCategoryService = new SpaCategoryService();
    }
    public async createSpaCategory(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const data: ICSpaCatrgory = req.body;
            if (!data.name || !data.name.trim()) {
                return res.status(400).json(errorResponse("Invalid Spa Category Name"));
            }
            const response = await this.spaCategoryService.createSpaCategory({
                name: data.name.trim().toLocaleLowerCase(),
            });
            return res.status(response.success ? 200 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Error occuring while creating Spa Category", error.message));
            }
            return res.status(500).json(errorResponse("Error occuring while creating Spa Category"));
        }
    }
    public async getAllSpaCategories(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const response = await this.spaCategoryService.getSpaCategories();
            return res.status(response.success ? 200 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Error occuring while fetching Spa Categories", error.message));
            }
            return res.status(500).json(errorResponse("Error occuring while fetching Spa Categories"));
        }
    }
    public async updateSpaCategory(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const data: ICSpaCatrgory = req.body;
            if (!data.name || !data.name.trim()) {
                return res.status(400).json(errorResponse("Invalid Spa Category Name"));
            }
            const response = await this.spaCategoryService.updateSpaCategory(id, {
                name: data.name.trim().toLocaleLowerCase(),

            });
            return res.status(response.success ? 200 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Error occuring while updating Spa Category", error.message));
            }
            return res.status(500).json(errorResponse("Error occuring while updating Spa Category"));
        }
    }
    public async deleteSpaCategory(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            if(!id){
                return res.status(400).json(errorResponse("Invalid Spa Category"));
            }
            const response = await this.spaCategoryService.deleteCategory(id);
            return res.status(response.success ? 200 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Error occuring while deleting Spa Category", error.message));
            }
            return res.status(500).json(errorResponse("Error occuring while deleting Spa Category"));
        }
    }
}

export class SpaSubCategoryController {
    private spaSubCategoryService: SpaSubCategoryService;

    constructor() {
        this.spaSubCategoryService = new SpaSubCategoryService();
    }
    public async createSpaSubCategory(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const data: ICSpaSubCategory = req.body;
            if (!data.name || !data.name.trim()) {
                return res.status(400).json(errorResponse("Invalid Spa SubCategory Name"));
            }
            const response = await this.spaSubCategoryService.createSpaSubCategory({
                name: data.name.trim().toLocaleLowerCase(),
                categoryId: data.categoryId
            });
            return res.status(response.success ? 200 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Error occuring while creating Spa SubCategory", error.message));
            }
            return res.status(500).json(errorResponse("Error occuring while creating Spa SubCategory"));
        }
    }
    public async getAllSpaSubCategories(req: CustomRequest, res: Response): Promise<Response> {
        try {
            let categoryId = req.query.categoryId as string | undefined;
            if (categoryId === 'undefined' || categoryId === 'null') {
                categoryId = undefined;
            }
            const response = await this.spaSubCategoryService.getSpaSubCategories(categoryId ? categoryId : undefined);
            return res.status(response.success ? 200 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Error occuring while fetching Spa SubCategories", error.message));
            }
            return res.status(500).json(errorResponse("Error occuring while fetching Spa SubCategories"));
        }
    }
    public async updateSpaSubCategory(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            if(!id){
                return res.status(400).json(errorResponse("Select an subcategory to update"));
            }
            const data: IUSpaSubCategory = req.body;
            if (!data.name || !data.name.trim()) {
                return res.status(400).json(errorResponse("Invalid Spa SubCategory Name"));
            }
            const response = await this.spaSubCategoryService.updateSpaSubCategory(id, {
                name: data.name.trim().toLocaleLowerCase(),
                isActive: data.isActive
            });
            return res.status(response.success ? 200 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Error occuring while updating Spa SubCategory", error.message));
            }
            return res.status(500).json(errorResponse("Error occuring while updating Spa SubCategory"));
        }
    }
    public async deleteSubCategory(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json(errorResponse("Select a subcategory to delete"));
            }
            const response = await this.spaSubCategoryService.deleteSubCategory(id);
            return res.status(response.success ? 200 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Error occuring while deleting Spa SubCategory", error.message));
            }
            return res.status(500).json(errorResponse("Error occuring while deleting Spa SubCategory"));
        }
    }
}
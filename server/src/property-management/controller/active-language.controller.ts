import { Response } from "express";
import { protect } from "../../middlewares/auth.middleware";
import { IPropertyActiveLanguage, LanguageCode } from "../types";
import { CustomRequest, errorResponse, IApiResponse, PropertyCustomRequest } from "../../utils";
import { ActiveLanguageService } from "../services/active-language.service";

export class ActiveLanguageController {
    private activeLanguageService: ActiveLanguageService
    constructor() {
        this.activeLanguageService = new ActiveLanguageService();
    }
    public async createActiveLanguage(req: PropertyCustomRequest, res: Response): Promise<Response<IApiResponse>> {

        try {
            const language:LanguageCode = req.body.language;
            const propertyId =req.property?.id;
            if(!propertyId) {
                return res.status(400).json(errorResponse("Property ID is required", "Missing property ID"));
            }
            const result = await this.activeLanguageService.addActiveLanguage({ language, propertyId });

            return res.status(result.success ? 201 : 400).json(result);
        } catch (error) {
            if(error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to add active language", error.message));
            }
            return res.status(500).json(errorResponse("Failed to add active language", "Unknown error occurred"));
        }
    }
    public async getAllActiveLanguages(req: CustomRequest, res: Response): Promise<Response<IApiResponse>> {
        try {
            const propertyId =req.params?.propertyId as string;
            if(!propertyId) {
                return res.status(400).json(errorResponse("Property ID is required", "Missing property ID"));
            }
            const result = await this.activeLanguageService.getAllActiveLanguages(propertyId);

            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if(error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to retrieve active languages", error.message));
            }
            return res.status(500).json(errorResponse("Failed to retrieve active languages", "Unknown error occurred"));
        }
    }
    public async deleteActiveLanguage(req: CustomRequest, res: Response): Promise<Response<IApiResponse>> {
        try {
            const activeLanguageId = req.params.id;
            if(!activeLanguageId) {
                return res.status(400).json(errorResponse("Active language ID is required", "Missing active language ID"));
            }
            const result = await this.activeLanguageService.deleteActiveLanguage(activeLanguageId);
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if(error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to delete active language", error.message));
            }
            return res.status(500).json(errorResponse("Failed to delete active language", "Unknown error occurred"));
        }
    }
}
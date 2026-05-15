import { IApiResponse,successResponse,errorResponse } from "../../utils";
import { ActiveLanguageRepository } from "../repository/active-language.repository";
import { ICPropertyActiveLanguage, IPropertyActiveLanguage } from "../types";
export class ActiveLanguageService {
    private activeLanguageRepo: ActiveLanguageRepository;
    constructor() {
        this.activeLanguageRepo = new ActiveLanguageRepository();
    }
    public async addActiveLanguage(data: ICPropertyActiveLanguage):Promise<IApiResponse> {
        try {
            const result = await this.activeLanguageRepo.createActiveLanguage(data);
            return successResponse("Active language added successfully", result);
        } catch (error) {
            if(error instanceof Error) {
                return errorResponse("Failed to add active language", error.message);
            }
            return errorResponse("Failed to add active language", "Unknown error occurred");
        }
    }
    public async getAllActiveLanguages(propertyId: string):Promise<IApiResponse> {
        try {
            const result = await this.activeLanguageRepo.getAllPropertyLanguages(propertyId);
            return successResponse("Active languages retrieved successfully", result);
        } catch (error) {
            if(error instanceof Error) {
                return errorResponse("Failed to retrieve active languages", error.message);
            }
            return errorResponse("Failed to retrieve active languages", "Unknown error occurred");
        }
    }
    public async deleteActiveLanguage(id: string):Promise<IApiResponse> {
        try {
            const result = await this.activeLanguageRepo.deleteActiveLanguage(id);
            return successResponse("Active language deleted successfully", result);
        }
        catch (error) {
            if(error instanceof Error) {
                return errorResponse("Failed to delete active language", error.message);
            }
            return errorResponse("Failed to delete active language", "Unknown error occurred");
        }
    }
}
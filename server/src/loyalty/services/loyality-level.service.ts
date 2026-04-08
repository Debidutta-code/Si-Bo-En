import { IApiResponse, successResponse, errorResponse } from "../../utils";
import { ICLoyalityLevels } from "../types";
import { propertyLoyalityRepository, LoyalityLevelRepository } from "../repository";

export class LoyalityLevelService {
    private loyalityLevelRepository: LoyalityLevelRepository;
    private propertyLoyalityRepo: propertyLoyalityRepository;

    constructor() {
        this.loyalityLevelRepository = new LoyalityLevelRepository();
        this.propertyLoyalityRepo = new propertyLoyalityRepository();
    }

    public async createLoyalityLevel(data: ICLoyalityLevels): Promise<IApiResponse> {
        try {
            const [propertyConfig, existingLevels] = await Promise.all([
                this.propertyLoyalityRepo.getLoyalityForProperty(data.propertyLoyaltyConfigId),
                this.loyalityLevelRepository.findAllByPropertyConfigId(data.propertyLoyaltyConfigId),
            ]);
            if (!propertyConfig) {
                return errorResponse(`Property loyalty config not found`);
            }
            if (existingLevels.find(l => l.level === data.level)) {
                return errorResponse(`Loyalty level ${data.level} already exists for this property`);
            }
            await this.loyalityLevelRepository.create(data);
            return successResponse("Loyalty level created successfully");
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Error occurred while creating loyalty level", error.message);
            }
            return errorResponse("Error occurred while creating loyalty level", "Unidentified error");
        }
    }

    public async getLoyalityLevelsByPropertyConfigId(propertyLoyaltyConfigId: string): Promise<IApiResponse> {
        try {
            const levels = await this.loyalityLevelRepository.findAllByPropertyConfigId(propertyLoyaltyConfigId);
            return successResponse("Loyalty levels retrieved successfully", levels);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Error occurred while retrieving loyalty levels", error.message);
            }
            return errorResponse("Error occurred while retrieving loyalty levels", "Unidentified error");
        }
    }

    public async updateLoyalityLevel(id: string, data: ICLoyalityLevels): Promise<IApiResponse> {
        try {
            const [isLevelExists, allLevels, propertyConfig] = await Promise.all([
                this.loyalityLevelRepository.findById(id),
                this.loyalityLevelRepository.findAllByPropertyConfigId(data.propertyLoyaltyConfigId),
                this.propertyLoyalityRepo.getLoyalityForProperty(data.propertyLoyaltyConfigId),
            ]);
            if (!propertyConfig) {
                return errorResponse(`Property loyalty config not found`);
            }
            if (!isLevelExists) {
                return errorResponse(`Loyalty level not found`);
            }
            if (allLevels.find(l => l.level === data.level && l.id !== id)) {
                return errorResponse(`Loyalty level ${data.level} already exists for this property`);
            }
            await this.loyalityLevelRepository.update(id, data);
            return successResponse("Loyalty level updated successfully");
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Error occurred while updating loyalty level", error.message);
            }
            return errorResponse("Error occurred while updating loyalty level", "Unidentified error");
        }
    }

    public async deleteLoyalityLevel(id: string): Promise<IApiResponse> {
        try {
            const level = await this.loyalityLevelRepository.findById(id);
            if (!level) {
                return errorResponse(`Loyalty level not found`);
            }
            await this.loyalityLevelRepository.delete(id);
            return successResponse("Loyalty level deleted successfully");
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Error occurred while deleting loyalty level", error.message);
            }
            return errorResponse("Error occurred while deleting loyalty level", "Unidentified error");
        }
    }
}
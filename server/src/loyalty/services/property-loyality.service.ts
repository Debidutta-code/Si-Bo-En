import { successResponse, errorResponse } from "../../utils";
import { IApiResponse } from "../../utils";
import { propertyLoyalityRepository } from "../repository";
import {
    ICPropertyLoyaltyConfig,
    IPropertyLoyaltyConfig
} from "../types/property-loyality.types";

export class PropertyLoyalityService {
    private propertyLoyalityRepository: propertyLoyalityRepository;

    constructor() {
        this.propertyLoyalityRepository = new propertyLoyalityRepository();
    }

    public async createPropertyLoyalityConfig(data: ICPropertyLoyaltyConfig): Promise<IApiResponse> {
        try {
            const activeExisting = await this.propertyLoyalityRepository.getLoyalityForPropertyWhereTrue(data.propertyId);
            console.log("Active existing config:", activeExisting);
            if (activeExisting) {
                await this.propertyLoyalityRepository.updatePropertyLoyalityConfig(activeExisting.id, false);
            }
            const result = await this.propertyLoyalityRepository.createPropertyLoyalityConfig(data);
            return successResponse("Successfully created property loyalty config", result);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to create property loyalty config", error.message);
            }
            return errorResponse("Failed to create property loyalty config");
        }
    }

    public async getLoyalityForProperty(propertyId: string): Promise<IApiResponse> {
        try {
            const result = await this.propertyLoyalityRepository.getLoyalityForProperty(propertyId);
            if (!result) {
                return errorResponse("No active loyalty config found for this property");
            }
            return successResponse("Successfully retrieved property loyalty config", result);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to retrieve property loyalty config", error.message);
            }
            return errorResponse("Failed to retrieve property loyalty config");
        }
    }

    public async updatePropertyLoyalityConfig(propertyId: string, isActive: boolean): Promise<IApiResponse> {
        try {
            const existingConfig = await this.propertyLoyalityRepository.getLoyalityForProperty(propertyId);
            
            if (!existingConfig) {
                return errorResponse("Property loyalty config not found");
            }
            if (isActive) {
                const activeExisting = await this.propertyLoyalityRepository.getLoyalityForPropertyWhereTrue(propertyId);
                if (activeExisting && activeExisting.id !== existingConfig.id) {
                    await this.propertyLoyalityRepository.updatePropertyLoyalityConfig(activeExisting.id, false);
                }
            }

            const result = await this.propertyLoyalityRepository.updatePropertyLoyalityConfig(existingConfig.id, isActive);
            if (!result) {
                return errorResponse("Failed to update property loyalty config");
            }
            return successResponse("Successfully updated property loyalty config", result);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to update property loyalty config", error.message);
            }
            return errorResponse("Failed to update property loyalty config");
        }
    }

    public async deletePropertyLoyalityConfig(propertyId: string): Promise<IApiResponse> {
        try {
            const existingConfig = await this.propertyLoyalityRepository.getLoyalityForProperty(propertyId);
            if (!existingConfig) {
                return errorResponse("Property loyalty config not found");
            }
            const result = await this.propertyLoyalityRepository.deletePropertyLoyalityConfig(existingConfig.id);
            if (!result) {
                return errorResponse("Failed to delete property loyalty config");
            }
            return successResponse("Successfully deleted property loyalty config", result);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to delete property loyalty config", error.message);
            }
            return errorResponse("Failed to delete property loyalty config");
        }
    }

    public async getAllPropertyLoyalityWithLoyality(propertyId: string): Promise<IApiResponse> {
        try {
            const result = await this.propertyLoyalityRepository.getAllPropertyLoyalityWithLoyality(propertyId);
            if (!result || result.length === 0) {
                return errorResponse("No loyalty configs found for this property");
            }
            return successResponse("Successfully retrieved all property loyalty configs", result);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to retrieve property loyalty configs", error.message);
            }
            return errorResponse("Failed to retrieve property loyalty configs");
        }
    }

    public async getActiveLoyaltyConfigByPropertyId(propertyId: string): Promise<IApiResponse> {
        try {
            const result = await this.propertyLoyalityRepository.getActiveLoyaltyConfigByPropertyId(propertyId);
            if (!result) {
                return errorResponse("No active loyalty config found for this property");
            }
            return successResponse("Successfully retrieved active loyalty config", result);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to retrieve active loyalty config", error.message);
            }
            return errorResponse("Failed to retrieve active loyalty config");
        }
    }

    public async getPropertiesByLoyaltyProgram(loyaltyProgramId: string): Promise<IApiResponse> {
        try {
            const result = await this.propertyLoyalityRepository.getPropertiesByLoyaltyProgram(loyaltyProgramId);
            
            return successResponse("Successfully retrieved properties", result);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to retrieve properties", error.message);
            }
            return errorResponse("Failed to retrieve properties");
        }
    }
}

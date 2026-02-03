import { successResponse, errorResponse } from "../../utils";
import { IApiResponse } from "../../utils";
import { creationLoyalityRepository } from "../repository";
import {
    ICCreationLoyality,
    IUCreationLoyalty
} from "../types/creation-loyality.types";

export class CreationLoyalityService {
    private creationLoyalityRepository: creationLoyalityRepository;

    constructor() {
        this.creationLoyalityRepository = new creationLoyalityRepository();
    }

    public async createCreationLoyality(data: ICCreationLoyality): Promise<IApiResponse> {
        try {
            const result = await this.creationLoyalityRepository.createCreationLoyality(data);
            return successResponse("Successfully created creation loyalty", result);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to create creation loyalty", error.message);
            }
            return errorResponse("Failed to create creation loyalty");
        }
    }

    public async updateCreationLoyality(creationLoyalityId: string, data: IUCreationLoyalty): Promise<IApiResponse> {
        try {
            const existingLoyalty = await this.creationLoyalityRepository.getCreationLoyalityById(creationLoyalityId);
            if (!existingLoyalty) {
                return errorResponse("Creation loyalty not found");
            }
            const result = await this.creationLoyalityRepository.updateCreationLoyality(creationLoyalityId, data);
            if (!result) {
                return errorResponse("Failed to update creation loyalty");
            }
            return successResponse("Successfully updated creation loyalty", result);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to update creation loyalty", error.message);
            }
            return errorResponse("Failed to update creation loyalty");
        }
    }

    public async deleteLoyality(creationLoyalityId: string): Promise<IApiResponse> {
        try {
            const existingLoyalty = await this.creationLoyalityRepository.getCreationLoyalityById(creationLoyalityId);
            if (!existingLoyalty) {
                return errorResponse("Creation loyalty not found");
            }
            const result = await this.creationLoyalityRepository.deleteLoyality(creationLoyalityId);
            if (!result) {
                return errorResponse("Failed to delete creation loyalty");
            }
            return successResponse("Successfully deleted creation loyalty", result);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to delete creation loyalty", error.message);
            }
            return errorResponse("Failed to delete creation loyalty");
        }
    }

    public async getCreationLoyalityById(creationLoyalityId: string): Promise<IApiResponse> {
        try {
            const result = await this.creationLoyalityRepository.getCreationLoyalityById(creationLoyalityId);
            if (!result) {
                return errorResponse("Creation loyalty not found");
            }
            return successResponse("Successfully retrieved creation loyalty", result);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to retrieve creation loyalty", error.message);
            }
            return errorResponse("Failed to retrieve creation loyalty");
        }
    }

    public async getLoyalityByCreation(creationId: string): Promise<IApiResponse> {
        try {
            const result = await this.creationLoyalityRepository.getLoyalityByCreation(creationId);
            if (!result) {
                return errorResponse("No loyalty found for this creation");
            }
            return successResponse("Successfully retrieved loyalty by creation", result);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to retrieve loyalty by creation", error.message);
            }
            return errorResponse("Failed to retrieve loyalty by creation");
        }
    }

    public async getAllCreationLoyalityWithProperty(creationId: string): Promise<IApiResponse> {
        try {
            const result = await this.creationLoyalityRepository.getAllCreationLoyalityWithProperty(creationId);
            if (!result) {
                return errorResponse("No loyalty found for this creation");
            }
            return successResponse("Successfully retrieved creation loyalty with properties", result);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to retrieve creation loyalty with properties", error.message);
            }
            return errorResponse("Failed to retrieve creation loyalty with properties");
        }
    }
}

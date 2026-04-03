import { IApiResponse, successResponse, errorResponse } from "../../utils";
import {
    ICLoyalityLevels
} from "../types";
import {
    creationLoyalityRepository,
    LoyalityLevelRepository
} from "../repository";
export class LoyalityLevelService {
    private loyalityLevelRepository: LoyalityLevelRepository;
    private creationLoyalityRepository: creationLoyalityRepository;

    constructor() {
        this.loyalityLevelRepository = new LoyalityLevelRepository();
        this.creationLoyalityRepository = new creationLoyalityRepository();
    }
    public async createLoyalityLevel(data: ICLoyalityLevels): Promise<IApiResponse> {
        try {
            const [isLevelExists, creationLoyality] = await Promise.all([
                this.loyalityLevelRepository.findAllByProgramId(data.loyaltyProgramId),
                this.creationLoyalityRepository.getCreationLoyalityById(data.loyaltyProgramId)
            ]);
            if (!creationLoyality) {
                return errorResponse(`Creation loyalty not found for program`);
            }
            if (isLevelExists.find(level => level.level === data.level)) {
                return errorResponse(`Loyalty level ${data.level} already exists for this program`);
            }
            if (creationLoyality.discountValue < data.discountPercentage) {
                return errorResponse(`Discount value ${data.discountPercentage} is greater than the  loyalty discount value ${creationLoyality.discountValue}`);
            }

            await this.loyalityLevelRepository.create(data);

            return successResponse("Loyalty level created successfully");
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Error occur while creating loyality level", error.message);
            }
            return errorResponse("Error occur while creating loyality level", "Unidentified error");
        }
    }
    public async getLoyalityLevelsByProgramId(loyaltyProgramId: string): Promise<IApiResponse> {
        try {
            const loyaltyLevels = await this.loyalityLevelRepository.findAllByProgramId(loyaltyProgramId);
            return successResponse("Loyalty levels retrieved successfully", loyaltyLevels);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Error occurred while retrieving loyalty levels", error.message);
            }
            return errorResponse("Error occurred while retrieving loyalty levels", "Unidentified error");
        }
    }
    public async updateLoyalityLevel(id:string, data: ICLoyalityLevels): Promise<IApiResponse> {
        try {
            const [isLevelExists, allLevels, creationLoyality] = await Promise.all([
                this.loyalityLevelRepository.findById(id),
                this.loyalityLevelRepository.findAllByProgramId(data.loyaltyProgramId),
                this.creationLoyalityRepository.getCreationLoyalityById(data.loyaltyProgramId)
            ]);
            if (!creationLoyality) {
                return errorResponse(`Creation loyalty not found for program`);
            }
            if (!isLevelExists) {
                return errorResponse(`Loyalty level not found`);
            }
            if(allLevels.find(level => level.level === data.level && level.id !== id)) {
                return errorResponse(`Loyalty level ${data.level} already exists for this program`);
            }
            if (creationLoyality.discountValue < data.discountPercentage) {
                return errorResponse(`Discount value ${data.discountPercentage} is greater than the  loyalty discount value ${creationLoyality.discountValue}`);
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
    public async deleteLoyalityLevel(id:string): Promise<IApiResponse> {
        try {
            const isLevelExists = await this.loyalityLevelRepository.findById(id);
            if (!isLevelExists) {
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
import { successResponse, errorResponse } from "../../utils";
import { IApiResponse } from "../../utils";
import {
    LoyalityConditionRepository,
    LoyalitySpecialConditionRepository
} from "../repository";
import {
    ICLoyalityCondition,
    ICLoyalitySpecialCondition,
    ILoyalityCondition,
    ILoyalitySpecialCondition,
    IULoyalityCondition,
    IULoyalitySpecialCondition
} from "../types";

export class LoyalityConditionService {
    private loyalityConditionRepository: LoyalityConditionRepository;

    constructor() {
        this.loyalityConditionRepository = new LoyalityConditionRepository();
    }

    public async createConditions({ language, loyaltyProgramId, text }: ICLoyalityCondition): Promise<IApiResponse> {
        try {
            const condition = await this.loyalityConditionRepository.createLoyalityCondition({
                language,
                loyaltyProgramId,
                text
            });
            if (!condition) {
                return errorResponse("Error creating loyalty condition");
            }
            return successResponse("Condition created successfully", condition);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to create loyalty condition", error.message);
            }
            return errorResponse("Failed to create loyalty condition");
        }
    }

    public async updateConditions(id: string, updateData: IULoyalityCondition): Promise<IApiResponse> {
        try {
            const isExist = await this.loyalityConditionRepository.getById(id);
            if (!isExist) {
                return errorResponse("Loyalty condition not found");
            }
            const condition = await this.loyalityConditionRepository.updateLoyalityCondition(id, updateData);
            if (!condition) {
                return errorResponse("Error updating loyalty condition");
            }
            return successResponse("Condition updated successfully", condition);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to update loyalty condition", error.message);
            }
            return errorResponse("Failed to update loyalty condition");
        }
    }

    public async deleteConditions(id: string): Promise<IApiResponse> {
        try {
            const isExist = await this.loyalityConditionRepository.getById(id);
            if (!isExist) {
                return errorResponse("Loyalty condition not found");
            }
            const condition = await this.loyalityConditionRepository.deleteLoyalityCondition(id);
            if (!condition) {
                return errorResponse("Error deleting loyalty condition");
            }
            return successResponse("Condition deleted successfully", condition);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to delete loyalty condition", error.message);
            }
            return errorResponse("Failed to delete loyalty condition");
        }
    }

    public async getConditionsByProgramId(loyaltyProgramId: string): Promise<IApiResponse> {
        try {
            const conditions = await this.loyalityConditionRepository.getConditionsByProgramId(loyaltyProgramId);
            if (!conditions || conditions.length === 0) {
                return errorResponse("No loyalty conditions found");
            }
            return successResponse("Loyalty conditions fetched successfully", conditions);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to fetch loyalty conditions", error.message);
            }
            return errorResponse("Failed to fetch loyalty conditions");
        }
    }
}

export class LoyalitySpecialConditionService {
    private loyalitySpecialConditionRepository: LoyalitySpecialConditionRepository;

    constructor() {
        this.loyalitySpecialConditionRepository = new LoyalitySpecialConditionRepository();
    }

    public async createSpecialConditions({ loyaltyProgramId,
        title,
        subTitle,
        language }: ICLoyalitySpecialCondition): Promise<IApiResponse> {
        try {
            const condition = await this.loyalitySpecialConditionRepository.createLoyalitySpecialCondition({
                loyaltyProgramId,
                title,
                subTitle,
                language
            });
            if (!condition) {
                return errorResponse("Error creating loyalty special condition");
            }
            return successResponse("Special condition created successfully", condition);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to create loyalty special condition", error.message);
            }
            return errorResponse("Failed to create loyalty special condition");
        }
    }

    public async updateSpecialConditions(id: string, updateData: IULoyalitySpecialCondition): Promise<IApiResponse> {
        try {
            const isExist = await this.loyalitySpecialConditionRepository.getById(id);
            if (!isExist) {
                return errorResponse("Loyalty special condition not found");
            }
            const condition = await this.loyalitySpecialConditionRepository.updateLoyalitySpecialCondition(id, updateData);
            if (!condition) {
                return errorResponse("Error updating loyalty special condition");
            }
            return successResponse("Special condition updated successfully", condition);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to update loyalty special condition", error.message);
            }
            return errorResponse("Failed to update loyalty special condition");
        }
    }

    public async deleteSpecialConditions(id: string): Promise<IApiResponse> {
        try {
            const isExist = await this.loyalitySpecialConditionRepository.getById(id);
            if (!isExist) {
                return errorResponse("Loyalty special condition not found");
            }
            const condition = await this.loyalitySpecialConditionRepository.deleteLoyalitySpecialCondition(id);
            if (!condition) {
                return errorResponse("Error deleting loyalty special condition");
            }
            return successResponse("Special condition deleted successfully", condition);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to delete loyalty special condition", error.message);
            }
            return errorResponse("Failed to delete loyalty special condition");
        }
    }

    public async getSpecialConditionsByProgramId(loyaltyProgramId: string): Promise<IApiResponse> {
        try {
            const conditions = await this.loyalitySpecialConditionRepository.getSpecialConditionsByProgramId(loyaltyProgramId);
            if (!conditions || conditions.length === 0) {
                return errorResponse("No loyalty special conditions found");
            }
            return successResponse("Loyalty special conditions fetched successfully", conditions);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to fetch loyalty special conditions", error.message);
            }
            return errorResponse("Failed to fetch loyalty special conditions");
        }
    }
}

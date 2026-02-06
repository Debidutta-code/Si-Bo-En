import { successResponse, errorResponse } from "../../utils";
import { IApiResponse } from "../../utils";
import {
    LoyalityFormFieldRepository
} from "../repository";
import {
    ICLoyaltyField,
    ILoyaltyField,
    IULoyaltyField
} from "../types/loyality-field.types";
export class LoyalityFieldService {
    private loyalityFieldRepository: LoyalityFormFieldRepository;

    constructor() {
        this.loyalityFieldRepository = new LoyalityFormFieldRepository();
    }
    public async createFields({ loyaltyProgramId,
        masterRegistrationFieldId,
        fieldName,
        visibleInRegistration,
        visibleInCustomerForm,
        required
    }: ICLoyaltyField
    ): Promise<IApiResponse> {
        try {
            const isAlreadyExists = await this.loyalityFieldRepository.checkIfFieldExists(loyaltyProgramId, fieldName);
            if (isAlreadyExists) {
                return errorResponse("Field already exists in this loyalty program");
            }
            const daoRes = await this.loyalityFieldRepository.createLoyalityFormField({
                loyaltyProgramId,
                masterRegistrationFieldId,
                fieldName,
                visibleInRegistration,
                visibleInCustomerForm,
                required
            });
            if (!daoRes) {
                return errorResponse("Failed to add fields to forms");
            }
            return successResponse("Field added successfully", daoRes);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to add fields to forms", error.message);
            }
            return errorResponse("Failed to add fields to forms");
        }
    }
    public async updateLoyalityFields(loyaltyProgramId: string, fieldName: string, data: IULoyaltyField): Promise<IApiResponse> {
        try {
            const isFieldExists = await this.loyalityFieldRepository.checkIfFieldExists(loyaltyProgramId, fieldName);
            if (!isFieldExists) {
                return errorResponse("Field does not exist in this loyalty program");
            }
            const daoRes = await this.loyalityFieldRepository.updateLoyalityFormField(loyaltyProgramId, fieldName, data);
            if (!daoRes) {
                return errorResponse("Failed to update fields in forms");
            }
            return successResponse("Field updated successfully", daoRes);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to update fields in forms", error.message);
            }
            return errorResponse("Failed to update fields in forms");
        }
    }
    public async deleteLoyalityFields(loyaltyProgramId: string, fieldName: string): Promise<IApiResponse> {
        try {
            const isFieldExists = await this.loyalityFieldRepository.checkIfFieldExists(loyaltyProgramId, fieldName);
            if (!isFieldExists) {
                return errorResponse("Field does not exist in this loyalty program");
            }
            const daoRes = await this.loyalityFieldRepository.deleteLoyalityFormField(loyaltyProgramId, fieldName);
            if (!daoRes) {
                return errorResponse("Failed to delete fields in forms");
            }
            return successResponse("Field deleted successfully", daoRes);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to delete fields in forms", error.message);
            }
            return errorResponse("Failed to delete fields in forms");
        }
    }
    public async getFields(loyaltyProgramId: string): Promise<IApiResponse> {
        try {
            const daoRes = await this.loyalityFieldRepository.getAllFieldsByProgramId(loyaltyProgramId);
            if (!daoRes || daoRes.length === 0) {
                return errorResponse("No fields found for this loyalty program");
            }
            return successResponse("Fields retrieved successfully", daoRes);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to retrieve fields", error.message);
            }
            return errorResponse("Failed to retrieve fields");
        }
    }
    
    public async updateManyFieldsService(loyaltyProgramId: string, fields: IULoyaltyField[]): Promise<IApiResponse> {
        try {
            if (!fields || fields.length === 0) {
                return errorResponse("No fields provided to update");
            }

            for (const field of fields) {
                if (!field.fieldName) {
                    return errorResponse("Field name is required for all fields");
                }
            }

            const results = await this.loyalityFieldRepository.updateManyFields(loyaltyProgramId, fields);
            return successResponse("Fields updated successfully", results);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to update fields", error.message);
            }
            return errorResponse("Failed to update fields");
        }
    }
}
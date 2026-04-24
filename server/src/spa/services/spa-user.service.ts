import { IApiResponse, successResponse, errorResponse, toUTC } from "../../utils";
import {SpaUserRepository} from "../repository";




export class SpaUserService {
    private spaUserRepository: SpaUserRepository;

    constructor() {
        this.spaUserRepository = new SpaUserRepository();
    }
    public async getSpaUsersForProperty(propertyId: string): Promise<IApiResponse> {
        try {
            const result = await this.spaUserRepository.getSpaUsersForProperty(propertyId);
            return successResponse("Spa for user fetched successfully",result);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to get users for spa", error.message);
            }
            return errorResponse("Failed to get users for spa", "Unknown error");
        }
    }

    public async assignSpaToUser(spaId: string, userId: string): Promise<IApiResponse> {
        try {
            const isExists = await this.spaUserRepository.isAlreadySpaAssignedtoUser(spaId, userId);
            if (isExists) {
                return errorResponse("User is already assigned to this spa");
            }
            const result = await this.spaUserRepository.assignSpaToUser(spaId, userId);
            return successResponse("Spa for user assigned successfully", result);
        } catch (error) {
           if (error instanceof Error) {
                return errorResponse("Failed to get users for spa", error.message);
            }
            return errorResponse("Failed to get users for spa", "Unknown error");
        }
    }

    public async removeUserFromSpa(spaId: string, userId: string): Promise<IApiResponse> {
        try {
            const result = await this.spaUserRepository.removeUserFromSpa(spaId, userId);
            return successResponse("User removed from spa successfully", result);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to remove spa from user", error.message);
            }
            return errorResponse("Failed to remove spa from user", "Unknown error");
        }
    }
    public async getSpaForUser(userId: string,propertyId:string): Promise<IApiResponse> {
        try {
            const result = await this.spaUserRepository.getSpaForUser(userId,propertyId);
            return successResponse("Spa for user fetched successfully", result);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to get spa for user", error.message);
            }
            return errorResponse("Failed to get spa for user", "Unknown error");
        }
    }
}
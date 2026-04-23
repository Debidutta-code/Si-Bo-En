import { SpaUserService } from "../services";
import { CustomRequest, IApiResponse, errorResponse } from "../../utils";
import { Response } from "express";

export class SpaUserController {
    private spaUserService: SpaUserService;

    constructor() {
        this.spaUserService = new SpaUserService();
    }

    public async getSpaUsersForProperty(req: CustomRequest, res: Response): Promise<Response<IApiResponse>> {
        try {
            const propertyId = req.params.propertyId;
            if (!propertyId) {
                return res.status(400).json(errorResponse("Property ID is required"));
            }
            const response = await this.spaUserService.getSpaUsersForProperty(propertyId);
            return res.status(response.success ? 200 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to get spa users for property", error.message));
            }
            return res.status(500).json(errorResponse("Failed to get spa users for property", "Unknown error"));
        }
    }

    public async assignSpaToUser(req: CustomRequest, res: Response): Promise<Response<IApiResponse>> {
        try {
            const { spaId, userId } = req.body;
            if (!spaId || !userId) {
                return res.status(400).json(errorResponse("Spa ID and User ID are required"));
            }
            const response = await this.spaUserService.assignSpaToUser(spaId, userId);
            return res.status(response.success ? 200 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to assign spa to user", error.message));
            }
            return res.status(500).json(errorResponse("Failed to assign spa to user", "Unknown error"));
        }
    }

    public async removeUserFromSpa(req: CustomRequest, res: Response): Promise<Response<IApiResponse>> {
        try {
            const { spaId, userId } = req.body;
            if (!spaId || !userId) {
                return res.status(400).json(errorResponse("Spa ID and User ID are required"));
            }
            const response = await this.spaUserService.removeUserFromSpa(spaId, userId);
            return res.status(response.success ? 200 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to remove user from spa", error.message));
            }
            return res.status(500).json(errorResponse("Failed to remove user from spa", "Unknown error"));
        }
    }
}
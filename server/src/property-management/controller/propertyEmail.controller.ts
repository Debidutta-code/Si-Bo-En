import { errorResponse } from "../../utils";
import { CustomRequest } from "../../utils";
import { Response } from "express";
import { PropertyEmailsService } from "../services";

export class PropertyEmailController {
    private propertyEmailsService: PropertyEmailsService;
    constructor() {
        this.propertyEmailsService = new PropertyEmailsService();
    }
    public async createPropertyEmail(req: CustomRequest, res: Response): Promise<Response> {
        try {

            const { propertyId } = req.params;
            if(!propertyId){
                return res.status(400).json(errorResponse("property id is required"));
            }
            const { email } = req.body;
            if(!email){
                return res.status(400).json(errorResponse("email is required"));
            }
            const result = await this.propertyEmailsService.createPropertyEmail(propertyId, email);
            if (result.success) {
                return res.status(201).json(result);
            }
            return res.status(400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("failed to create property email", error.message));
            }
            return res.status(500).json(errorResponse("failed to create property email"));
        }
    }
    public async getPropertyEmails(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const { propertyId } = req.params;
            if(!propertyId){
                return res.status(400).json(errorResponse("property id is required"));
            }
            const result = await this.propertyEmailsService.getPropertyEmails(propertyId);
            if (result.success) {
                return res.status(200).json(result);
            }
            return res.status(400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("failed to retrieve property emails", error.message));
            }
            return res.status(500).json(errorResponse("failed to retrieve property emails"));
        }
    }
    public async deletePropertyEmail(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            if(!id){
                return res.status(400).json(errorResponse("email id is required"));
            }
            const result = await this.propertyEmailsService.deletePropertyEmail(id);
            if (result.success) {
                return res.status(200).json(result);
            }
            return res.status(400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("failed to delete property email", error.message));
            }
            return res.status(500).json(errorResponse("failed to delete property email"));
        }
    }
    public async updatePropertyEmail(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            if(!id){
                return res.status(400).json(errorResponse("email id is required"));
            }
            const { email } = req.body;
            if(!email){
                return res.status(400).json(errorResponse("email is required"));
            }
            const result = await this.propertyEmailsService.updatePropertyEmail(id, email);
            if (result.success) {
                return res.status(200).json(result);
            }   
            return res.status(400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("failed to update property email", error.message));
            }
            return res.status(500).json(errorResponse("failed to update property email"));
        }
    }
}
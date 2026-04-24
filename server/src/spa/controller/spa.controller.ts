import { SpaService } from "../services";
import { CustomRequest, IApiResponse, errorResponse } from "../../utils";
import {
    ICSpaC,
    ICSpaR,
    IUSpaR,

} from "../types";
import { Response } from "express";
export class SpaController {
    private spaService: SpaService;

    constructor() {
        this.spaService = new SpaService();
    }
    public async createSpa(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const spaData: ICSpaC = req.body;
            if (!req.user) {
                return res.status(401).json(errorResponse("Unauthorized User", "Complete Authentication to create"));
            }
            if (!spaData.isInclusive && (!spaData.discountValue || spaData.discountValue <= 0 || !spaData.currencyCode)) {
                return res.status(400).json(errorResponse("Spa price and currency is required for non-inclusive spas", "Discount value must be positive if not inclusive"));

            }
            const response = await this.spaService.createSpa({
                ...spaData,
                createdBy: req.user.id
            });

            return res.status(response.success ? 201 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to create spa", error.message))
            }
            return res.status(500).json(errorResponse("Failed to create spa", "Internal Server Error"));
        }
    }
    public async getSpaForProperty(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const propertyId = req.params.propertyId;
            const response = await this.spaService.getSpaForProperty(propertyId);
            return res.status(response.success ? 200 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to retrieve spa", error.message))
            }
            return res.status(500).json(errorResponse("Failed to retrieve spa", "Internal Server Error"));
        }
    }
    public async updateSpa(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const spaId = req.params.id;
            if(!spaId){
                return res.status(400).json(errorResponse("Invalid spa choosen", "Spa ID is required"));
            }
            const spaData: IUSpaR = req.body;
            if (!spaData.isInclusive && (!spaData.discountValue || spaData.discountValue <= 0 || !spaData.currencyCode)) {
                return res.status(400).json(errorResponse("Spa price and currency is required for non-inclusive spas", "Discount value must be positive if not inclusive"));

            }
            const response = await this.spaService.updateSpa(spaId, spaData);
            return res.status(response.success ? 200 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to update spa", error.message))
            }
            return res.status(500).json(errorResponse("Failed to update spa", "Internal Server Error"));
        }
    }
    public async deleteSpa(req:CustomRequest,res:Response):Promise<Response>{
        try {
            const spaId = req.params.id;
            if(!spaId) {
                return res.status(400).json(errorResponse("Invalid spa choosen", "Spa ID is required"));
            }
            const response = await this.spaService.deleteSpa(spaId);
            return res.status(response.success ? 200 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to delete spa", error.message))
            }
            return res.status(500).json(errorResponse("Failed to delete spa", "Internal Server Error"));
        }
    }
    public async getAvailableSpaForReservation(req:CustomRequest,res:Response):Promise<Response>{
        try {
            const bookingCode = req.params.bookingCode;
            if(!bookingCode) {
                return res.status(400).json(errorResponse("Invalid booking code", "Booking code is required"));
            }
            const response = await this.spaService.getAvailableSpaForinDateRange(bookingCode);
            return res.status(response.success ? 200 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to retrieve available spas", error.message))
            }
            return res.status(500).json(errorResponse("Failed to retrieve available spas", "Internal Server Error"));
        }
    }
}
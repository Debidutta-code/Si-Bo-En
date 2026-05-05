import { successResponse, errorResponse } from "../../utils/return";
import { TouristTaxService } from "../services/tourist-tax.service";
import { Request, Response } from "express";
import { CustomRequest } from "../../utils/customRequest";
import { ICTouristTax } from "../interfaces";

export class TouristTaxController {
    touristTaxService: TouristTaxService;

    constructor() {
        this.touristTaxService = new TouristTaxService();
    }

    public async createTouristTaxController(req: CustomRequest, res: Response) {
        try {
            const propertyId = req.query.propertyId as string;
            const touristTaxData: ICTouristTax = req.body;

            if (!propertyId) {
                return res.status(400).json(errorResponse('Property ID is required'));
            }

            const validationError = this.validateTouristTaxData(touristTaxData);
            if (validationError) {
                return res.status(400).json(errorResponse(validationError));
            }

            const serviceRes = await this.touristTaxService.createTouristTax(
                propertyId,
                touristTaxData
            );

            const status = serviceRes.success ? 200 : 400;
            return res.status(status).json(serviceRes);
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal Server Error', error?.message));
        }
    }

    public async getTouristTaxesByPropertyIdController(req: CustomRequest, res: Response) {
        try {
            const propertyId = req.params.propertyId;

            if (!propertyId) {
                return res.status(400).json(errorResponse('Property ID is required'));
            }

            const serviceRes = await this.touristTaxService.getTouristTaxesByPropertyId(propertyId);

            const status = serviceRes.success ? 200 : 400;
            return res.status(status).json(serviceRes);
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal Server Error', error?.message));
        }
    }

    public async updateTouristTaxController(req: CustomRequest, res: Response) {
        try {
            const touristTaxId = req.params.touristTaxId;
            const touristTaxData: ICTouristTax = req.body;

            if (!touristTaxId) {
                return res.status(400).json(errorResponse('Tourist Tax ID is required'));
            }

            if (!touristTaxData || Object.keys(touristTaxData).length === 0) {
                return res.status(400).json(errorResponse('Tourist Tax data is required'));
            }

            const validationError = this.validateTouristTaxData(touristTaxData as ICTouristTax, true);
            if (validationError) {
                return res.status(400).json(errorResponse(validationError));
            }

            const serviceRes = await this.touristTaxService.updateTouristTax(
                touristTaxId,
                touristTaxData
            );

            const status = serviceRes.success ? 200 : 400;
            return res.status(status).json(serviceRes);
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal Server Error', error?.message));
        }
    }

    public async deleteTouristTaxController(req: CustomRequest, res: Response) {
        try {
            const touristTaxId = req.params.touristTaxId;

            if (!touristTaxId) {
                return res.status(400).json(errorResponse('Tourist Tax ID is required'));
            }

            const serviceRes = await this.touristTaxService.deleteTouristTax(touristTaxId);

            const status = serviceRes.success ? 200 : 400;
            return res.status(status).json(serviceRes);
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal Server Error', error?.message));
        }
    }

    private validateTouristTaxData(
        touristTaxData: ICTouristTax,
        isUpdate: boolean = false
    ): string | null {
        if (!isUpdate && !touristTaxData.roomId) {
            return 'Room type is required for creating a tourist tax';
        }

        if (touristTaxData.discountType &&
            touristTaxData.discountType !== 'flat' &&
            touristTaxData.discountType !== 'percentage') {
            return 'Discount type must be either flat or percentage';
        }

        if (touristTaxData.discountValue !== undefined &&
            touristTaxData.discountValue !== null) {
            if (touristTaxData.discountValue < 0) {
                return 'Discount value cannot be negative';
            }

            if (touristTaxData.discountType === 'percentage' &&
                touristTaxData.discountValue > 100) {
                return 'Discount percentage value cannot be greater than 100';
            }
        }



        return null;
    }
}
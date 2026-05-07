import { successResponse, errorResponse } from "../../utils/return";
import { TaxRuleService } from "../services";
import { Request, Response } from "express";
import { CustomRequest } from "../../utils/customRequest";
import { ICTaxRule } from "../interfaces";
export class TaxRuleController {
    taxRuleService: TaxRuleService;
    constructor() {
        this.taxRuleService = new TaxRuleService();
    }
    public async createTaxRuleController(req: CustomRequest, res: Response) {
        try {
            const propertyId = req.query.propertyId as string;
            const { taxRuleData }: { taxRuleData: ICTaxRule } = req.body;
            if (!propertyId) {
                return res.status(400).json(errorResponse('Property ID is required'));
            }
            const validationError = this.validateTaxRuleData(taxRuleData);
            if (validationError) {
                return res.status(400).json(errorResponse(validationError));
            }
            const serviceRes = await this.taxRuleService.createTaxRule(
                propertyId,
                {...taxRuleData,priority: taxRuleData.priority ? taxRuleData.priority : 1}
            );
            const status = serviceRes.success ? 200 : 400;
            return res.status(status).json(serviceRes);
        }
        catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal Server Error', error?.message));
        }
    }
    public async getTaxRulesByPropertyIdController(req: CustomRequest, res: Response) {
        try {
            const propertyId = req.params.propertyId;
            if (!propertyId) {
                return res.status(400).json(errorResponse('Property ID is required'));
            }
            const serviceRes = await this.taxRuleService.getTaxRulesByPropertyId(propertyId);
            const status = serviceRes.success ? 200 : 400;
            return res.status(status).json(serviceRes);
        }
        catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal Server Error', error?.message));
        }
    }
    public async updateTaxRuleController(req: CustomRequest, res: Response) {
        try {
            const taxRuleId = req.params.taxRuleId;
            const taxRuleData: ICTaxRule = req.body;
            if (!taxRuleId) {
                return res.status(400).json(errorResponse('Tax Rule ID is required'));
            }
            if (!taxRuleData) {
                return res.status(400).json(errorResponse('Tax Rule data is required'));
            }
            const validationError = this.validateTaxRuleData(taxRuleData);
            if (validationError) {
                return res.status(400).json(errorResponse(validationError));
            }
            const serviceRes = await this.taxRuleService.updateTaxRule(
                taxRuleId,
                taxRuleData
            );
            const status = serviceRes.success ? 200 : 400;
            return res.status(status).json(serviceRes);
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal Server Error', error?.message));
        }
    }
    public async deleteTaxRuleController(req: CustomRequest, res: Response) {
        try {
            const taxRuleId = req.params.taxRuleId;
            if (!taxRuleId) {
                return res.status(400).json(errorResponse('Tax Rule ID is required'));
            }
            const serviceRes = await this.taxRuleService.deleteTaxRule(taxRuleId);
            const status = serviceRes.success ? 200 : 400;
            return res.status(status).json(serviceRes);
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal Server Error', error?.message));
        }
    }
    private validateTaxRuleData(taxRuleData: ICTaxRule): string | null {
        if (!taxRuleData.name) {
            return 'Tax Rule name is required';
        }
        if (!taxRuleData.type) {
            return 'Tax Rule type is required';
        }
        if (taxRuleData.value === undefined || taxRuleData.value === null) {
            return 'Tax Rule value is required';
        }
        if (!taxRuleData.applicableOn) {
            return 'Tax Rule applicableOn is required';
        }
        if (taxRuleData.value < 0) {
            return 'Tax Rule value cannot be negative';
        }
        if (taxRuleData.type !== 'fixed' && taxRuleData.type !== 'percentage') {
            return 'Tax Rule type must be either fixed or percentage';
        }
        if (taxRuleData.type === 'fixed' && taxRuleData.value < 0) {
            return 'Tax Rule fixed value cannot be negative';
        }
        if (taxRuleData.type === 'percentage' && taxRuleData.value > 100) {
            return 'Tax Rule percentage value cannot be greater than 100';
        }
        if (taxRuleData.applicableOn !== 'room_rate' && taxRuleData.applicableOn !== 'total_amount') {
            return 'Tax Rule applicableOn must be either room_rate, service_charge or both';
        }

        return null;
    }
}
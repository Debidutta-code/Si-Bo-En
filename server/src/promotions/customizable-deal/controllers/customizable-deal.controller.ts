import { CustomizableDealService } from '../services';
import { Response } from 'express';
import {
    ICCreateCustomizableDeal,
    ICUpdateCustomizableDeal,
} from '../interfaces';
import { errorResponse, PropertyRequest } from '../../../utils';

export class CustomizableDealController {
    customizableDealService: CustomizableDealService;

    constructor() {
        this.customizableDealService = new CustomizableDealService();
    }

    public async createCustomizableDealController(
        req: PropertyRequest,
        res: Response
    ) {
        try {
            if (!req.property?.id || !req.property?.propertyCode) {
                return res
                    .status(400)
                    .json(errorResponse('Property information is required'));
            }

            const dealData: ICCreateCustomizableDeal = req.body;

            const validationError = this.validateDealData(dealData);
            if (validationError) {
                return res.status(400).json(errorResponse(validationError));
            }

            const serviceRes =
                await this.customizableDealService.createCustomizableDeal(
                    req.property.id,
                    req.property.propertyCode,
                    dealData
                );

            const status = serviceRes.success ? 201 : 400;
            return res.status(status).json(serviceRes);
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal Server Error', error?.message));
        }
    }

    public async getCustomizableDealsByPropertyController(
        req: PropertyRequest,
        res: Response
    ) {
        try {
            if (!req.property?.id) {
                return res
                    .status(400)
                    .json(errorResponse('Property ID is required'));
            }

            const serviceRes =
                await this.customizableDealService.getCustomizableDealsByPropertyId(
                    req.property.id
                );

            const status = serviceRes.success ? 200 : 400;
            return res.status(status).json(serviceRes);
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal Server Error', error?.message));
        }
    }

    public async getCustomizableDealByIdController(
        req: PropertyRequest,
        res: Response
    ) {
        try {
            const dealId = req.params.dealId;

            if (!dealId) {
                return res
                    .status(400)
                    .json(errorResponse('Deal ID is required'));
            }

            const serviceRes =
                await this.customizableDealService.getCustomizableDealById(
                    dealId
                );

            const status = serviceRes.success ? 200 : 400;
            return res.status(status).json(serviceRes);
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal Server Error', error?.message));
        }
    }

    public async updateCustomizableDealController(
        req: PropertyRequest,
        res: Response
    ) {
        try {
            if (!req.property?.id) {
                return res
                    .status(400)
                    .json(errorResponse('Property information is required'));
            }

            const dealId = req.params.dealId;
            const dealData: ICUpdateCustomizableDeal = req.body;

            if (!dealId) {
                return res
                    .status(400)
                    .json(errorResponse('Deal ID is required'));
            }

            const validationError = this.validateUpdateDealData(dealData);
            if (validationError) {
                return res.status(400).json(errorResponse(validationError));
            }

            const serviceRes =
                await this.customizableDealService.updateCustomizableDeal(
                    dealId,
                    req.property.id,
                    dealData
                );

            const status = serviceRes.success ? 200 : 400;
            return res.status(status).json(serviceRes);
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal Server Error', error?.message));
        }
    }

    public async deleteCustomizableDealController(
        req: PropertyRequest,
        res: Response
    ) {
        try {
            if (!req.property?.id) {
                return res
                    .status(400)
                    .json(errorResponse('Property information is required'));
            }

            const dealId = req.params.dealId;

            if (!dealId) {
                return res
                    .status(400)
                    .json(errorResponse('Deal ID is required'));
            }

            const serviceRes =
                await this.customizableDealService.deleteCustomizableDeal(
                    dealId,
                    req.property.id
                );

            const status = serviceRes.success ? 200 : 400;
            return res.status(status).json(serviceRes);
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal Server Error', error?.message));
        }
    }

    private validateDealData(
        dealData: ICCreateCustomizableDeal
    ): string | null {
        if (!dealData.discountType) {
            return 'Discount type is required';
        }

        if (
            dealData.discountValue === undefined ||
            dealData.discountValue === null
        ) {
            return 'Discount value is required';
        }

        if (dealData.discountValue < 0) {
            return 'Discount value cannot be negative';
        }

        if (
            dealData.discountType !== 'percentage' &&
            dealData.discountType !== 'flat'
        ) {
            return 'Discount type must be either percentage or flat';
        }

        if (
            dealData.discountType === 'percentage' &&
            dealData.discountValue > 100
        ) {
            return 'Percentage discount cannot be greater than 100';
        }

        if (
            !dealData.applicableRoomTypes ||
            dealData.applicableRoomTypes.length === 0
        ) {
            return 'At least one room type must be selected';
        }

        if (
            !dealData.applicableRatePlans ||
            dealData.applicableRatePlans.length === 0
        ) {
            return 'At least one rate plan must be selected';
        }

        return null;
    }

    private validateUpdateDealData(
        dealData: ICUpdateCustomizableDeal
    ): string | null {
        if (
            dealData.discountValue !== undefined &&
            dealData.discountValue < 0
        ) {
            return 'Discount value cannot be negative';
        }

        if (
            dealData.discountType &&
            dealData.discountType !== 'percentage' &&
            dealData.discountType !== 'flat'
        ) {
            return 'Discount type must be either percentage or flat';
        }

        if (
            dealData.discountType === 'percentage' &&
            dealData.discountValue !== undefined &&
            dealData.discountValue > 100
        ) {
            return 'Percentage discount cannot be greater than 100';
        }

        if (
            dealData.applicableRoomTypes !== undefined &&
            dealData.applicableRoomTypes.length === 0
        ) {
            return 'At least one room type must be selected';
        }

        if (
            dealData.applicableRatePlans !== undefined &&
            dealData.applicableRatePlans.length === 0
        ) {
            return 'At least one rate plan must be selected';
        }

        return null;
    }
}

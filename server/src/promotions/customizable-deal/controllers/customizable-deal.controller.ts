import { CustomizableDealService } from '../services';
import { Response, Request } from 'express';
import { ICCreateCustomizableDealS, IUCustomizableDealS } from '../interfaces';
import {
    errorResponse,
    PropertyCustomRequest,
    PropertyRequest,
} from '../../../utils';

export class CustomizableDealController {
    private service: CustomizableDealService;

    constructor() {
        this.service = new CustomizableDealService();
    }

    public async createCustomizableDealController(
        req: PropertyCustomRequest,
        res: Response
    ) {
        try {
            if (!req.property?.id || !req.property?.propertyCode) {
                return res
                    .status(400)
                    .json(errorResponse('Property information is required'));
            }

            const dealData: ICCreateCustomizableDealS = req.body;
            const validationError = this.validateCreateDealData(dealData);
            if (validationError)
                return res.status(400).json(errorResponse(validationError));

            const serviceRes = await this.service.createCustomizableDeal(
                req.property.id,
                req.property.propertyCode,
                dealData
            );

            return res.status(serviceRes.success ? 200 : 400).json(serviceRes);
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
                await this.service.getCustomizableDealsByPropertyId(
                    req.property.id
                );
            return res.status(serviceRes.success ? 200 : 400).json(serviceRes);
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal Server Error', error?.message));
        }
    }

    public async getCustomizableDealByIdController(
        req: Request,
        res: Response
    ) {
        try {
            const { dealId } = req.params;
            if (!dealId)
                return res
                    .status(400)
                    .json(errorResponse('Deal ID is required'));

            const serviceRes =
                await this.service.getCustomizableDealById(dealId);
            return res.status(serviceRes.success ? 200 : 400).json(serviceRes);
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal Server Error', error?.message));
        }
    }

    public async updateCustomizableDealController(
        req: PropertyCustomRequest,
        res: Response
    ) {
        try {
            if (!req.property?.id) {
                return res
                    .status(400)
                    .json(errorResponse('Property information is required'));
            }

            const { dealId } = req.params;
            if (!dealId)
                return res
                    .status(400)
                    .json(errorResponse('Deal ID is required'));

            const dealData: IUCustomizableDealS = req.body;
            const validationError = this.validateUpdateDealData(dealData);
            if (validationError)
                return res.status(400).json(errorResponse(validationError));

            const serviceRes = await this.service.updateCustomizableDeal(
                dealId,
                req.property.id,
                dealData
            );

            return res.status(serviceRes.success ? 200 : 400).json(serviceRes);
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal Server Error', error?.message));
        }
    }

    public async deleteCustomizableDealController(
        req: PropertyCustomRequest,
        res: Response
    ) {
        try {
            if (!req.property?.id) {
                return res
                    .status(400)
                    .json(errorResponse('Property information is required'));
            }

            const { dealId } = req.params;
            if (!dealId)
                return res
                    .status(400)
                    .json(errorResponse('Deal ID is required'));

            const serviceRes = await this.service.deleteCustomizableDeal(
                dealId,
                req.property.id
            );
            return res.status(serviceRes.success ? 200 : 400).json(serviceRes);
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal Server Error', error?.message));
        }
    }

    private validateCreateDealData(
        dealData: ICCreateCustomizableDealS
    ): string | null {
        if (!dealData.discountType) return 'Discount type is required';
        if (!dealData.discountValue) return 'Discount value is required';
        if (Number(dealData.discountValue) < 0)
            return 'Discount value cannot be negative';
        if (!['percentage', 'flat'].includes(dealData.discountType))
            return 'Discount type must be percentage or flat';
        if (
            dealData.discountType === 'percentage' &&
            Number(dealData.discountValue) > 100
        )
            return 'Percentage discount cannot exceed 100';
        if (!dealData.roomId) return 'Room is required';
        if (!dealData.ratePlanId) return 'Rate plan is required';
        if (!dealData.startDate) return 'Start date is required';
        if (!dealData.endDate) return 'End date is required';
        if (new Date(dealData.startDate) >= new Date(dealData.endDate))
            return 'Start date must be before end date';
        return null;
    }

    private validateUpdateDealData(
        dealData: IUCustomizableDealS
    ): string | null {
        if (
            dealData.discountValue !== undefined &&
            Number(dealData.discountValue) < 0
        )
            return 'Discount value cannot be negative';
        if (
            dealData.discountType &&
            !['percentage', 'flat'].includes(dealData.discountType)
        )
            return 'Discount type must be percentage or flat';
        if (
            dealData.discountType === 'percentage' &&
            dealData.discountValue !== undefined &&
            Number(dealData.discountValue) > 100
        )
            return 'Percentage discount cannot exceed 100';
        if (
            dealData.startDate &&
            dealData.endDate &&
            new Date(dealData.startDate) >= new Date(dealData.endDate)
        )
            return 'Start date must be before end date';
        return null;
    }
}

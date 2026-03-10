
import { Response } from 'express';
import { CustomRequest, errorResponse, IApiResponse, toUTC, toUTCDate } from '../../../utils';
import { MLOSService } from '../services';
import { Decimal } from '@prisma/client/runtime/library';

export class MLOSController {
    mlosService: MLOSService
    constructor() {
        this.mlosService = new MLOSService();
    }

    public async createRatePlanRule(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const {
                ratePlanId,
                startDate,
                endDate,
                minLos,
                maxLos,
                discountType,
                discountValue,
                isActive,
                isAutoApplied,
                currencyCode
            } = req.body;

            if (!ratePlanId) {
                return res.status(400).json(errorResponse('Rate plan ID is required'));
            }

            if (minLos === undefined || minLos === null) {
                return res.status(400).json(errorResponse('Minimum length of stay is required'));
            }

            if (isActive === undefined || isActive === null) {
                return res.status(400).json(errorResponse('Active status is required'));
            }

            // Validation: Field types
            if (typeof minLos !== 'number') {
                return res.status(400).json(errorResponse('Minimum length of stay must be a number'));
            }

            if (maxLos !== null && maxLos !== undefined && typeof maxLos !== 'number') {
                return res.status(400).json(errorResponse('Maximum length of stay must be a number'));
            }

            if (typeof isActive !== 'boolean') {
                return res.status(400).json(errorResponse('Active status must be a boolean'));
            }

            if (discountValue !== null && discountValue !== undefined && typeof discountValue !== 'number') {
                return res.status(400).json(errorResponse('Discount value must be a number'));
            }

            const ruleData = {
                ratePlanId,
                startDate: startDate&&toUTCDate(startDate) || null,
                endDate: endDate&&toUTCDate(endDate) || null,
                minLos,
                maxLos: maxLos || null,
                discountType: discountType === "none" ? null : discountType,
                discountValue: discountValue ? Number(discountValue) : null,
                isActive,
                isAutoApplied,
                currencyCode
            };

            const serRes = await this.mlosService.createRatePlanRule(ruleData);
            const status = serRes.success ? 201 : 400;
            return res.status(status).json(serRes);
        } catch (error) {
            if (error instanceof Error) {

                return res
                    .status(500)
                    .json(errorResponse('Internal server error', error?.message));
            }
            return res.status(500).json(errorResponse('Internal server error'));
        }
    }

    public async getRatePlanRuleByRatePlanId(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const ratePlanId = req.params.ratePlanId;

            if (!ratePlanId) {
                return res
                    .status(400)
                    .json(errorResponse('Rate plan ID is required'));
            }

            const response = await this.mlosService.getRatePlanRuleByRatePlanId(ratePlanId);
            const status = response.success ? 200 : 404;
            return res.status(status).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(errorResponse('Internal server error', error?.message));
            }
            return res.status(500).json(errorResponse('Internal server error'));
        }
    }

    public async updateRatePlanRule(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const ratePlanId = req.params.ratePlanId;
            const updateData = req.body;

            if (!ratePlanId) {
                return res
                    .status(400)
                    .json(errorResponse('Rate plan ID is required'));
            }

            // Validation: Field types if provided
            if (updateData.minLos !== undefined && typeof updateData.minLos !== 'number') {
                return res.status(400).json(errorResponse('Minimum length of stay must be a number'));
            }

            if (updateData.maxLos !== undefined && updateData.maxLos !== null && typeof updateData.maxLos !== 'number') {
                return res.status(400).json(errorResponse('Maximum length of stay must be a number'));
            }

            if (updateData.isActive !== undefined && typeof updateData.isActive !== 'boolean') {
                return res.status(400).json(errorResponse('Active status must be a boolean'));
            }

            

            if (updateData.discountValue !== undefined && updateData.discountValue !== null && typeof updateData.discountValue !== 'number') {
                return res.status(400).json(errorResponse('Discount value must be a number'));
            }

            const response = await this.mlosService.updateRatePlanRule(
                ratePlanId,
                {
                    ...updateData,
                    startDate: updateData.startDate&&toUTCDate(updateData.startDate) || null,
                    endDate: updateData.endDate&&toUTCDate(updateData.endDate) || null,
                    discountType: updateData.discountType === "none" ? null : updateData.discountType,
                    discountValue: updateData.discountValue ? new Decimal(updateData.discountValue) : null,
                }
            );
            const status = response.success ? 200 : 400;
            return res.status(status).json(response);
        } catch (error) {
            if (error instanceof Error) {

                return res
                    .status(500)
                    .json(errorResponse('Internal server error', error?.message));
            }
            return res.status(500).json(errorResponse('Internal server error'));
        }
    }


    public async deleteRatePlanRule(req: CustomRequest, res: Response) {
        try {
            const ratePlanId = req.params.ratePlanId;

            if (!ratePlanId) {
                return res
                    .status(400)
                    .json(errorResponse('Rate plan ID is required'));
            }

            const response = await this.mlosService.deleteRatePlanRule(ratePlanId);
            const status = response.success ? 200 : 400;
            return res.status(status).json(response);
        } catch (error) {
            if (error instanceof Error) {

                return res
                    .status(500)
                    .json(errorResponse('Internal server error', error?.message));
            }
            return res.status(500).json(errorResponse('Internal server error'));
        }
    }
    public async getRatePlanRulesByPropertyId(
        req: CustomRequest,
        res: Response
    ) :Promise<Response>{
        try {
            const propertyId = req.params.propertyId;

            if (!propertyId) {
                return res
                    .status(400)
                    .json(errorResponse('Property ID is required'));
            }

            const response = await this.mlosService.getRatePlanRulesByPropertyId(propertyId);
            const status = response.success ? 200 : 404;
            return res.status(status).json(response);
        } catch (error) {
            if (error instanceof Error) {

                return res
                    .status(500)
                    .json(errorResponse('Internal server error', error?.message));
            }
            return res.status(500).json(errorResponse('Internal server error'));
        }
    }
}
import { CustomRequest } from '../../utils/customRequest';
import { errorResponse } from '../../utils/return';
import { RatePlanWithAddonService } from '../services';
import { Response } from 'express';

export class RatePlanWithAddonController {
    /**
     * Add an addon to a rate plan
     * POST /api/rate-plans/addons
     * Body: { ratePlanCode: string, addonId: string }
     */
    public static async addAddonToRatePlan(req: CustomRequest, res: Response) {
        try {
            const { ratePlanCode, addonId } = req.body;

            if (!ratePlanCode || !addonId) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Rate plan code and addon ID are required'
                        )
                    );
            }

            const response = await RatePlanWithAddonService.addAddonToRatePlan(
                ratePlanCode,
                addonId
            );

            const statusCode = response.success ? 200 : 400;
            return res.status(statusCode).json(response);
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal server error', error?.message));
        }
    }

    /**
     * Remove an addon from a rate plan
     * DELETE /api/rate-plans/addons
     * Body: { ratePlanCode: string, addonId: string }
     */
    public static async removeAddonFromRatePlan(
        req: CustomRequest,
        res: Response
    ) {
        try {
            const { ratePlanCode, addonId } = req.body;

            if (!ratePlanCode || !addonId) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Rate plan code and addon ID are required'
                        )
                    );
            }

            const response =
                await RatePlanWithAddonService.removeAddonFromRatePlan(
                    ratePlanCode,
                    addonId
                );

            const statusCode = response.success ? 200 : 400;
            return res.status(statusCode).json(response);
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal server error', error?.message));
        }
    }

    /**
     * Get all addons for a specific rate plan
     * GET /api/rate-plans/:ratePlanCode/addons
     */
    public static async getAddonsByRatePlanCode(
        req: CustomRequest,
        res: Response
    ) {
        try {
            const ratePlanCode = req.params.ratePlanCode;

            if (!ratePlanCode) {
                return res
                    .status(400)
                    .json(errorResponse('Rate plan code is required'));
            }

            const response =
                await RatePlanWithAddonService.getAddonsByRatePlanCode(
                    ratePlanCode
                );

            const statusCode = response.success ? 200 : 400;
            return res.status(statusCode).json(response);
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal server error', error?.message));
        }
    }

    /**
     * Get all rate plans for a specific addon
     * GET /api/addons/:addonId/rate-plans
     */
    public static async getRatePlansByAddonId(
        req: CustomRequest,
        res: Response
    ) {
        try {
            const addonId = req.params.addonId;

            if (!addonId) {
                return res
                    .status(400)
                    .json(errorResponse('Addon ID is required'));
            }

            const response =
                await RatePlanWithAddonService.getRatePlansByAddonId(addonId);

            const statusCode = response.success ? 200 : 400;
            return res.status(statusCode).json(response);
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal server error', error?.message));
        }
    }
}

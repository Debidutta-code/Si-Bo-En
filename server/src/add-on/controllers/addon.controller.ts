import { Request, Response } from 'express';
import { AddonService } from '../services';
import { successResponse, errorResponse } from '../../utils/return';
import { generateAddOnCode } from '../utils';
import { add } from 'date-fns';
import { PropertyCustomRequest } from '../../utils';
import { AddonInterceptor } from '../../multi-language/interceptors/addon/addon.interceptor';
export class AddonController {
    private addonService: AddonService;

    constructor() {
        this.addonService = new AddonService();
    }

    public createAddon = async (req: Request, res: Response) => {
        try {
            const addonData = req.body;

            // Generate code from backend if not provided
            if (!addonData.code) {
                addonData.code = await generateAddOnCode();
            }

            const addon = await this.addonService.createAddon(addonData);

            return res.status(addon.success ? 201 : 400).json(addon);
        } catch (error: any) {
            console.error('Failed to create addon at Controller Layer:', error);

            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse('Failed to create addon', error.message)
                    );
            }

            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to create addon',
                        'Unable to create addon at this moment'
                    )
                );
        }
    };

    public getAllAddonsByPropertyId = async (
        req: PropertyCustomRequest,
        res: Response
    ) => {
        try {
            const { propertyId } = req.params;
            const locale = req.headers['accept-language']?.slice(0, 2).toLowerCase() || 'en';

            let addons =
                await this.addonService.getAllAddonsByPropertyId(propertyId);

            addons = await AddonInterceptor.intercept(addons, locale);

            return res.status(addons.success ? 200 : 400).json(addons);
        } catch (error: any) {
            console.error('Failed to fetch addons at Controller Layer:', error);

            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse('Failed to fetch addons', error.message)
                    );
            }

            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to fetch addons',
                        'Unable to fetch addons at this moment'
                    )
                );
        }
    };

    public getAddonsForBooking = async (req: PropertyCustomRequest, res: Response) => {
        try {
            const { propertyId } = req.params;
            const locale = req.headers['accept-language']?.slice(0, 2).toLowerCase() || 'en';

            let addons =
                await this.addonService.getAddonsForBooking(propertyId);

            addons = await AddonInterceptor.intercept(addons, locale);

            return res.status(addons.success ? 200 : 400).json(addons);
        } catch (error: any) {
            console.error(
                'Failed to fetch addons for booking at Controller Layer:',
                error
            );

            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to fetch addons for booking',
                            error.message
                        )
                    );
            }

            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to fetch addons for booking',
                        'Unable to fetch addons for booking at this moment'
                    )
                );
        }
    };

    /**
     * Get addon by ID
     */
    getAddonById = async (req: Request, res: Response) => {
        try {
            const { addonId } = req.params;
            const locale = req.headers['accept-language']?.slice(0, 2).toLowerCase() || 'en';

            let addon = await this.addonService.getAddonById(addonId);

            addon = await AddonInterceptor.intercept(addon, locale);

            return res.status(addon.success ? 200 : 400).json(addon);
        } catch (error: any) {
            console.error('Failed to fetch addon at Controller Layer:', error);

            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse('Failed to fetch addon', error.message)
                    );
            }

            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to fetch addon',
                        'Unable to fetch addon at this moment'
                    )
                );
        }
    };

    /**
     * Update addon
     */
    updateAddon = async (req: Request, res: Response) => {
        try {
            const { addonId } = req.params;
            const updateData = req.body;

            if (Object.keys(updateData).length === 0) {
                return res
                    .status(400)
                    .json(
                        errorResponse('No update data provided', 'Bad Request')
                    );
            }

            const addon = await this.addonService.updateAddon(
                addonId,
                updateData
            );

            return res
                .status(200)
                .json(successResponse('Addon updated successfully', addon));
        } catch (error: any) {
            console.error('Failed to update addon at Controller Layer:', error);

            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse('Failed to update addon', error.message)
                    );
            }

            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to update addon',
                        'Unable to update addon at this moment'
                    )
                );
        }
    };

    /**
     * Delete addon
     */
    deleteAddon = async (req: Request, res: Response) => {
        try {
            const { addonId } = req.params;

            const addon = await this.addonService.deleteAddon(addonId);

            return res
                .status(200)
                .json(successResponse('Addon deleted successfully', addon));
        } catch (error: any) {
            console.error('Failed to delete addon at Controller Layer:', error);

            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse('Failed to delete addon', error.message)
                    );
            }

            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to delete addon',
                        'Unable to delete addon at this moment'
                    )
                );
        }
    };
}

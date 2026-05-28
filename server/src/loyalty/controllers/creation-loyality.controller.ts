import { Response } from 'express';
import { CustomRequest, errorResponse } from '../../utils';
import { CreationLoyalityService } from '../services';
import {
    ICCreationLoyality,
    IUCreationLoyalty,
} from '../types/creation-loyality.types';
import { LoyaltyCreationInterceptor } from '../../multi-language/interceptors/loyalty/loyalty-creation.interceptor';

export class CreationLoyalityController {
    private creationLoyalityService: CreationLoyalityService;

    constructor() {
        this.creationLoyalityService = new CreationLoyalityService();
    }

    public async createCreationLoyality(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const data: ICCreationLoyality = req.body;

            if (!data.creationId) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Creation not chosen',
                            'Creation ID is required'
                        )
                    );
            }
            if (!data.loyaltyDiscountType) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Invalid Field Provided',
                            'Loyalty Discount Type is required'
                        )
                    );
            }
            if (typeof data.discountValue !== 'number') {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Invalid Field Provided',
                            'Discount Value is required and must be a number'
                        )
                    );
            }

            const result =
                await this.creationLoyalityService.createCreationLoyality(data);
            return res.status(result.success ? 201 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to create creation loyalty',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Internal Server Error',
                        'Failed to create creation loyalty'
                    )
                );
        }
    }

    public async updateCreationLoyality(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const { creationLoyalityId } = req.params;
            const data: IUCreationLoyalty = req.body;

            if (!creationLoyalityId) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Invalid Request',
                            'Creation Loyalty ID is required'
                        )
                    );
            }

            const result =
                await this.creationLoyalityService.updateCreationLoyality(
                    creationLoyalityId,
                    data
                );
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to update creation loyalty',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Internal Server Error',
                        'Failed to update creation loyalty'
                    )
                );
        }
    }

    public async deleteLoyality(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const { creationLoyalityId } = req.params;

            if (!creationLoyalityId) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Invalid Request',
                            'Creation Loyalty ID is required'
                        )
                    );
            }

            const result =
                await this.creationLoyalityService.deleteLoyality(
                    creationLoyalityId
                );
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to delete creation loyalty',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Internal Server Error',
                        'Failed to delete creation loyalty'
                    )
                );
        }
    }

    public async getCreationLoyalityById(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const { creationLoyalityId } = req.params;
            const locale = req.headers['accept-language']?.slice(0, 2).toLowerCase() || 'en';

            if (!creationLoyalityId) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Invalid Request',
                            'Creation Loyalty ID is required'
                        )
                    );
            }

            let result =
                await this.creationLoyalityService.getCreationLoyalityById(
                    creationLoyalityId
                );
            result = await LoyaltyCreationInterceptor.intercept(result, locale);

            return res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to retrieve creation loyalty',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Internal Server Error',
                        'Failed to retrieve creation loyalty'
                    )
                );
        }
    }

    public async getLoyalityByCreation(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const { creationId } = req.params;
            const locale = req.headers['accept-language']?.slice(0, 2).toLowerCase() || 'en';

            if (!creationId) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Creation not chosen',
                            'Creation ID is required'
                        )
                    );
            }

            let result =
                await this.creationLoyalityService.getLoyalityByCreation(
                    creationId
                );
            
            result = await LoyaltyCreationInterceptor.intercept(result, locale);

            return res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to retrieve loyalty by creation',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Internal Server Error',
                        'Failed to retrieve loyalty by creation'
                    )
                );
        }
    }
}

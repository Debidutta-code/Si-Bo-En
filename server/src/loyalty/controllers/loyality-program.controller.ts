import { Response } from 'express';
import { CustomRequest, errorResponse } from '../../utils';
import {
    LoyalityProgramService,
} from '../services';
import {
    ICAdvanceLoyaltyprogram,
    ICloyaltyProgram,
    IUAdvanceLoyaltyprogram,
    IULoyalityProgram,
} from '../types';
import { PropertyLoyalityProgramInterceptor } from '../../multi-language/interceptors/loyalty/property-loyalty-program.interceptor';

export class LoyalityProgramController {
    private loyalityProgramService: LoyalityProgramService;

    constructor() {
        this.loyalityProgramService = new LoyalityProgramService();
    }

    public async createLoyaltyProgram(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const data: ICloyaltyProgram = req.body;

            if (!data.loyaltyProgramId) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Loyalty program not chosen',
                            'Loyalty Program ID is required'
                        )
                    );
            }
            if (!data.logo || data.logo.length === 0) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Invalid Field Provided',
                            'Logo is required'
                        )
                    );
            }

            const result =
                await this.loyalityProgramService.createLoyaltyProgram(data);
            return res.status(result.success ? 201 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to create loyalty program',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Internal Server Error',
                        'Failed to create loyalty program'
                    )
                );
        }
    }

    public async getLoyaltyProgram(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const { loyaltyProgramId } = req.params;

            if (!loyaltyProgramId) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Loyalty program not chosen',
                            'Loyalty Program ID is required'
                        )
                    );
            }

            const result =
                await this.loyalityProgramService.getLoyaltyProgram(
                    loyaltyProgramId
                );
            return res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to retrieve loyalty program',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Internal Server Error',
                        'Failed to retrieve loyalty program'
                    )
                );
        }
    }

    public async getLoyaltyProgramByCreationId(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const { creationId } = req.params;

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

            const result =
                await this.loyalityProgramService.getLoyaltyProgramByCreationId(
                    creationId
                );
            return res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to retrieve loyalty program',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Internal Server Error',
                        'Failed to retrieve loyalty program'
                    )
                );
        }
    }

    public async updateLoyaltyProgram(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const { loyaltyProgramId } = req.params;
            const data: IULoyalityProgram = req.body;

            if (!loyaltyProgramId) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Loyalty program not chosen',
                            'Loyalty Program ID is required'
                        )
                    );
            }

            const result =
                await this.loyalityProgramService.updateLoyaltyProgram(
                    loyaltyProgramId,
                    data
                );
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to update loyalty program',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Internal Server Error',
                        'Failed to update loyalty program'
                    )
                );
        }
    }

    public async deleteLoyaltyProgram(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const { loyaltyProgramId } = req.params;

            if (!loyaltyProgramId) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Loyalty program not chosen',
                            'Loyalty Program ID is required'
                        )
                    );
            }

            const result =
                await this.loyalityProgramService.deleteLoyaltyProgram(
                    loyaltyProgramId
                );
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to delete loyalty program',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Internal Server Error',
                        'Failed to delete loyalty program'
                    )
                );
        }
    }

    public async getPropertyLoyalityProgramByCreationId(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const { creationLoyaltyConfigId } = req.params;

            if (!creationLoyaltyConfigId) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Creation not chosen',
                            'Creation ID is required'
                        )
                    );
            }

            const locale = req.headers['accept-language']?.slice(0, 2).toLowerCase() || 'en';

            let result =
                await this.loyalityProgramService.getPropertyLoyalityProgramByCreationId(
                    creationLoyaltyConfigId
                );

            result = await PropertyLoyalityProgramInterceptor.intercept(
                result,
                locale
            );

            return res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to retrieve loyalty program',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Internal Server Error',
                        'Failed to retrieve loyalty program'
                    )
                );
        }
    }
}

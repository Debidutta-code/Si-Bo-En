import { Response } from 'express';
import { CustomRequest, errorResponse } from '../../utils';
import {
    LoyalityConditionService,
    LoyalitySpecialConditionService,
} from '../services';
import {
    ICLoyalityCondition,
    ICLoyalitySpecialCondition,
    IULoyalityCondition,
    IULoyalitySpecialCondition,
} from '../types';

export class LoyalityConditionController {
    private loyalityConditionService: LoyalityConditionService;

    constructor() {
        this.loyalityConditionService = new LoyalityConditionService();
    }

    public async createCondition(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const data: ICLoyalityCondition = req.body;

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
            if (!data.text || data.text.trim() === '') {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Invalid Field Provided',
                            'Condition text is required'
                        )
                    );
            }
            if (!data.language) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Invalid Field Provided',
                            'Language is required'
                        )
                    );
            }

            const result =
                await this.loyalityConditionService.createConditions(data);
            return res.status(result.success ? 201 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to create loyalty condition',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Internal Server Error',
                        'Failed to create loyalty condition'
                    )
                );
        }
    }

    public async updateCondition(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const { id } = req.params;
            const data: IULoyalityCondition = req.body;

            if (!id) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Invalid Request',
                            'Condition ID is required'
                        )
                    );
            }

            const result = await this.loyalityConditionService.updateConditions(
                id,
                data
            );
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to update loyalty condition',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Internal Server Error',
                        'Failed to update loyalty condition'
                    )
                );
        }
    }

    public async deleteCondition(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const { id } = req.params;

            if (!id) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Invalid Request',
                            'Condition ID is required'
                        )
                    );
            }

            const result =
                await this.loyalityConditionService.deleteConditions(id);
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to delete loyalty condition',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Internal Server Error',
                        'Failed to delete loyalty condition'
                    )
                );
        }
    }

    public async getConditionsByProgramId(
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
                await this.loyalityConditionService.getConditionsByProgramId(
                    loyaltyProgramId
                );
            return res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to retrieve loyalty conditions',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Internal Server Error',
                        'Failed to retrieve loyalty conditions'
                    )
                );
        }
    }
}

export class LoyalitySpecialConditionController {
    private loyalitySpecialConditionService: LoyalitySpecialConditionService;

    constructor() {
        this.loyalitySpecialConditionService =
            new LoyalitySpecialConditionService();
    }

    public async createSpecialCondition(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const data: ICLoyalitySpecialCondition = req.body;

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
            if (!data.title || data.title.trim() === '') {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Invalid Field Provided',
                            'Title is required'
                        )
                    );
            }
            if (!data.language) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Invalid Field Provided',
                            'Language is required'
                        )
                    );
            }

            const result =
                await this.loyalitySpecialConditionService.createSpecialConditions(
                    data
                );
            return res.status(result.success ? 201 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to create loyalty special condition',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Internal Server Error',
                        'Failed to create loyalty special condition'
                    )
                );
        }
    }

    public async updateSpecialCondition(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const { id } = req.params;
            const data: IULoyalitySpecialCondition = req.body;

            if (!id) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Invalid Request',
                            'Special Condition ID is required'
                        )
                    );
            }

            const result =
                await this.loyalitySpecialConditionService.updateSpecialConditions(
                    id,
                    data
                );
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to update loyalty special condition',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Internal Server Error',
                        'Failed to update loyalty special condition'
                    )
                );
        }
    }

    public async deleteSpecialCondition(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const { id } = req.params;

            if (!id) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Invalid Request',
                            'Special Condition ID is required'
                        )
                    );
            }

            const result =
                await this.loyalitySpecialConditionService.deleteSpecialConditions(
                    id
                );
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to delete loyalty special condition',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Internal Server Error',
                        'Failed to delete loyalty special condition'
                    )
                );
        }
    }

    public async getSpecialConditionsByProgramId(
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
                await this.loyalitySpecialConditionService.getSpecialConditionsByProgramId(
                    loyaltyProgramId
                );
            return res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to retrieve loyalty special conditions',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Internal Server Error',
                        'Failed to retrieve loyalty special conditions'
                    )
                );
        }
    }
}

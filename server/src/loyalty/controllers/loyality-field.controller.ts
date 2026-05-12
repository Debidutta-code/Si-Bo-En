import { Request, Response } from 'express';
import { CustomRequest } from '../../utils';
import { errorResponse } from '../../utils';
import { LoyalityFieldService } from '../services';
import { ICLoyaltyField } from '../types';
export class LoyalityFieldController {
    private loyalityFieldService: LoyalityFieldService;

    constructor() {
        this.loyalityFieldService = new LoyalityFieldService();
    }

    public async createField(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const data: ICLoyaltyField = req.body;
            if (!data.fieldName) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Field Name is required to create a field',
                            'Field name is required'
                        )
                    );
            }
            if (!data.masterRegistrationFieldId) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Invalid Field Provided',
                            'Master Registration Field ID is required'
                        )
                    );
            }
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

            const result = await this.loyalityFieldService.createFields(data);
            return res.status(result.success ? 201 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to create loyalty field',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Internal Server Error',
                        'Failed to create loyalty field'
                    )
                );
        }
    }

    public async updateField(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const { loyaltyProgramId, fieldName } = req.params;
            const data = req.body;

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
            if (!fieldName || fieldName.trim() === '') {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Field not chosen',
                            'Field Name is required'
                        )
                    );
            }

            const result = await this.loyalityFieldService.updateLoyalityFields(
                loyaltyProgramId,
                fieldName,
                data
            );
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to update loyalty field',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Internal Server Error',
                        'Failed to update loyalty field'
                    )
                );
        }
    }

    public async deleteField(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const { loyaltyProgramId, fieldName } = req.params;

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
            if (!fieldName || fieldName.trim() === '') {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Field not chosen',
                            'Field Name is required'
                        )
                    );
            }

            const result = await this.loyalityFieldService.deleteLoyalityFields(
                loyaltyProgramId,
                fieldName
            );
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to delete loyalty field',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Internal Server Error',
                        'Failed to delete loyalty field'
                    )
                );
        }
    }

    public async getFields(
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
                await this.loyalityFieldService.getFields(loyaltyProgramId);
            return res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to retrieve loyalty fields',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Internal Server Error',
                        'Failed to retrieve loyalty fields'
                    )
                );
        }
    }

    public async updateManyFields(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const { loyaltyProgramId } = req.params;
            const fields = req.body.fields;

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
            if (!fields || !Array.isArray(fields)) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Invalid Request',
                            'Fields array is required'
                        )
                    );
            }

            const result =
                await this.loyalityFieldService.updateManyFieldsService(
                    loyaltyProgramId,
                    fields
                );
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to update loyalty fields',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Internal Server Error',
                        'Failed to update loyalty fields'
                    )
                );
        }
    }
}

import { errorResponse } from '../../utils';
import { Response } from 'express';
import { CustomRequest } from '../../utils';
import {
    PropertyIntegrationFieldsService,
    PropertyIntegrationService,
} from '../services/property-integration.service';
import { ICPropertyInregrationSecrets, ICPropertyIntegrationS } from '../types';
export class PropertyIntegrationController {
    private propertyIntegrationFieldsService: PropertyIntegrationFieldsService;
    private propertyIntegrationService: PropertyIntegrationService;

    constructor() {
        this.propertyIntegrationFieldsService =
            new PropertyIntegrationFieldsService();
        this.propertyIntegrationService = new PropertyIntegrationService();
    }

    public async createPropertyIntegration(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const data: ICPropertyIntegrationS = req.body;
            if (!data) {
                return res
                    .status(400)
                    .json(errorResponse('Invalid request data'));
            }
            if (!data.masterIntegrationId) {
                return res
                    .status(400)
                    .json(errorResponse('Partner is not selected'));
            }
            if (!data.propertyId) {
                return res
                    .status(400)
                    .json(errorResponse('Property is not selected'));
            }
            if (!data.fields || data.fields.length === 0) {
                return res
                    .status(400)
                    .json(errorResponse('Integration fields are not provided'));
            }

            const result =
                await this.propertyIntegrationService.createPropertyIntegration(
                    data
                );
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to create property integration',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(errorResponse('Failed to create property integration'));
        }
    }
    public async updatePropertyIntegrationStatus(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const { isActive } = req.body;
            if (typeof isActive !== 'boolean') {
                return res
                    .status(400)
                    .json(errorResponse('Invalid active value'));
            }
            const { id } = req.params;
            if (!id) {
                return res
                    .status(400)
                    .json(errorResponse('Integration ID is required'));
            }

            const result =
                await this.propertyIntegrationService.updatePropertyIntegrationStatus(
                    id,
                    isActive
                );
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to update property integration status',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to update property integration status'
                    )
                );
        }
    }
    public async updatePropertyIntegrationTaxMode(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const { id } = req.params;
            const { amountBeforeTax, amountAfterTax } = req.body;

            if (!id) {
                return res
                    .status(400)
                    .json(errorResponse('Integration ID is required'));
            }
            if (
                typeof amountBeforeTax !== 'boolean' ||
                typeof amountAfterTax !== 'boolean'
            ) {
                return res
                    .status(400)
                    .json(errorResponse('amountBeforeTax and amountAfterTax must be boolean'));
            }

            const result =
                await this.propertyIntegrationService.updatePropertyIntegrationTaxMode(
                    id,
                    amountBeforeTax,
                    amountAfterTax
                );
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to update property integration tax mode',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(errorResponse('Failed to update property integration tax mode'));
        }
    }
    public async deletePropertyIntegration(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const { id } = req.params;
            if (!id) {
                return res
                    .status(400)
                    .json(errorResponse('Integration ID is required'));
            }

            const result =
                await this.propertyIntegrationService.deletePropertyIntegration(
                    id
                );
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to delete property integration',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(errorResponse('Failed to delete property integration'));
        }
    }
    public async getAllPropertyIntegrations(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const { propertyId } = req.params;
            if (!propertyId) {
                return res
                    .status(400)
                    .json(errorResponse('Property ID is required'));
            }

            const result =
                await this.propertyIntegrationService.getActiveIntegration(
                    propertyId
                );
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to retrieve property integrations',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse('Failed to retrieve property integrations')
                );
        }
    }
}

export class PropertyFieldIntegrationController {
    private propertyIntegrationFieldsService: PropertyIntegrationFieldsService;

    constructor() {
        this.propertyIntegrationFieldsService =
            new PropertyIntegrationFieldsService();
    }

    public async updateFields(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const { id } = req.params;
            const { value } = req.body;
            if (!id) {
                return res
                    .status(400)
                    .json(errorResponse('Integration ID is required'));
            }
            if (!value) {
                return res
                    .status(400)
                    .json(errorResponse('Field value is required'));
            }

            const result =
                await this.propertyIntegrationFieldsService.updateFieldsService(
                    id,
                    value
                );
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to update property integration fields',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to update property integration fields'
                    )
                );
        }
    }
    public async deleteFields(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const { id } = req.params;
            if (!id) {
                return res
                    .status(400)
                    .json(errorResponse('Integration ID is required'));
            }

            const result =
                await this.propertyIntegrationFieldsService.deleteFieldsService(
                    id
                );
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to delete property integration fields',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to delete property integration fields'
                    )
                );
        }
    }
    public async addFields(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const data: ICPropertyInregrationSecrets = req.body;
            const propertyIntegrationId = req.params.id;
            if (!propertyIntegrationId) {
                return res
                    .status(400)
                    .json(errorResponse('Required Field is missing'));
            }
            if (!data.value) {
                return res
                    .status(400)
                    .json(errorResponse('Field value is required'));
            }

            const result =
                await this.propertyIntegrationFieldsService.addFieldsService(
                    data,
                    propertyIntegrationId
                );
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to add property integration fields',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse('Failed to add property integration fields')
                );
        }
    }
}

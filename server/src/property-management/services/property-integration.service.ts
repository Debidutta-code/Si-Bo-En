import {
    PropertyIntegrationRepository,
    PropertyIntegrationSecretsRepository,
} from '../repository';
import {
    InragrationManagement,
    PropertyConfigRepository,
} from '../../utils-management/repository';
import { IApiResponse } from '../../utils';
import { successResponse, errorResponse } from '../../utils';
import {
    ICPropertyInregrationSecrets,
    ICPropertyIntegrationS,
    IPropertyIntegration,
} from '../types';

export class PropertyIntegrationService {
    private propertyIntegrationRepository: PropertyIntegrationRepository;
    private propertyIntegrationSecretsRepository: PropertyIntegrationSecretsRepository;
    private integrationManagement: InragrationManagement;
    private PropertyConfigRepository: PropertyConfigRepository;

    constructor() {
        this.propertyIntegrationRepository =
            new PropertyIntegrationRepository();
        this.propertyIntegrationSecretsRepository =
            new PropertyIntegrationSecretsRepository();
        this.integrationManagement = new InragrationManagement();
        this.PropertyConfigRepository = new PropertyConfigRepository();
    }
    public async createPropertyIntegration(
        data: ICPropertyIntegrationS
    ): Promise<IApiResponse<IPropertyIntegration>> {
        try {
            const [masterCheck, propertyConfig] = await Promise.all([
                this.integrationManagement.getById(data.masterIntegrationId),
                this.PropertyConfigRepository.getPropertyConfig(
                    data.propertyId
                ),
            ]);

            //validate fields
            if (
                masterCheck?.requiredFieldsForMasterIntegration.length !=
                data.fields.length
            ) {
                return errorResponse(
                    'Required fields for integration do not match',
                    'Master integration required fields do not match'
                );
            }
            if (!masterCheck) {
                return errorResponse(
                    'Partner to integrate not found',
                    'Master integration not found'
                );
            }
            const isExists =
                await this.propertyIntegrationRepository.checkIfIntegrationExists(
                    data.propertyId,
                    data.masterIntegrationId
                );
            if (isExists) {
                if (isExists.isActive) {
                    return successResponse('Property integration activated');
                }
                this.closeTheActiveIntegration(data.propertyId);
                this.propertyIntegrationRepository.toggleActiveIntegration(
                    isExists.id,
                    true
                );
            }
            this.closeTheActiveIntegration(data.propertyId);
            const result =
                await this.propertyIntegrationRepository.createIntegration(
                    data.propertyId,
                    data.masterIntegrationId,
                    data.amountAfterTax ?? false,
                    data.amountBeforeTax ?? true
                    
                );
            await this.propertyIntegrationSecretsRepository.createIntegrationSecret(
                data.fields,
                result.id
            );
            if (!result) {
                return errorResponse('Failed to create property integration');
            }
            return successResponse('Property integrated successfully');
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to create property integration',
                    error.message
                );
            }
            return errorResponse('Failed to create property integration');
        }
    }
    private async closeTheActiveIntegration(
        propertyId: string
    ): Promise<IApiResponse> {
        try {
            const activeIntegration =
                await this.propertyIntegrationRepository.getActiveIntegrationByProperty(
                    propertyId
                );
            if (activeIntegration) {
                await this.propertyIntegrationRepository.toggleActiveIntegration(
                    activeIntegration.id,
                    false
                );
                return this.closeTheActiveIntegration(propertyId);
            } else {
                return successResponse('No active integration found');
            }
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to close active integration',
                    error.message
                );
            }
            return errorResponse('Failed to close active integration');
        }
    }
    public async updatePropertyIntegrationStatus(
        id: string,
        status: boolean
    ): Promise<IApiResponse> {
        try {
            const isExists =
                await this.propertyIntegrationRepository.getById(id);
            if (!isExists) {
                return errorResponse(
                    'Failed to update property integration status'
                );
            }
            if (isExists.isActive === status) {
                return successResponse(
                    `Property integration status is ${status ? 'active' : 'inactive'}`
                );
            }
            if (status) {
                await this.closeTheActiveIntegration(isExists.propertyId);
            }
            await this.propertyIntegrationRepository.toggleActiveIntegration(
                id,
                status
            );
            return successResponse(
                'Property integration status updated successfully'
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to update property integration status',
                    error.message
                );
            }
            return errorResponse(
                'Failed to update property integration status'
            );
        }
    }
    public async updatePropertyIntegrationTaxMode(
    id: string,
    amountBeforeTax: boolean,
    amountAfterTax: boolean
): Promise<IApiResponse> {
    try {
        // enforce exactly one mode active
        if (amountBeforeTax === amountAfterTax) {
            return errorResponse(
                'Exactly one of amountBeforeTax or amountAfterTax must be true'
            );
        }

        const isExists = await this.propertyIntegrationRepository.getById(id);
        if (!isExists) {
            return errorResponse('Property integration not found');
        }

        const result = await this.propertyIntegrationRepository.updateTaxMode(
            id,
            amountBeforeTax,
            amountAfterTax
        );

        return successResponse(
            'Property integration tax mode updated successfully',
            result
        );
    } catch (error) {
        if (error instanceof Error) {
            return errorResponse(
                'Failed to update property integration tax mode',
                error.message
            );
        }
        return errorResponse('Failed to update property integration tax mode');
    }
}
    public async deletePropertyIntegration(id: string): Promise<IApiResponse> {
        try {
            const isExists =
                await this.propertyIntegrationRepository.getById(id);
            if (!isExists) {
                return errorResponse('Failed to delete property integration');
            }
            await this.propertyIntegrationRepository.deleteActiveIntegrations(
                id
            );
            return successResponse('Property integration deleted successfully');
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to delete property integration',
                    error.message
                );
            }
            return errorResponse('Failed to delete property integration');
        }
    }
    public async getActiveIntegration(
        propertyId: string
    ): Promise<IApiResponse> {
        try {
            const integration =
                await this.propertyIntegrationRepository.getAllIntegrations(
                    propertyId
                );
            if (!integration) {
                return errorResponse('No active integration found');
            }
            return successResponse(
                'Active integration retrieved successfully',
                integration
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to retrieve active integration',
                    error.message
                );
            }
            return errorResponse('Failed to retrieve active integration');
        }
    }
}
export class PropertyIntegrationFieldsService {
    private propertyIntegrationRepository: PropertyIntegrationRepository;
    private propertyIntegrationSecretsRepository: PropertyIntegrationSecretsRepository;

    constructor() {
        this.propertyIntegrationRepository =
            new PropertyIntegrationRepository();
        this.propertyIntegrationSecretsRepository =
            new PropertyIntegrationSecretsRepository();
    }
    public async updateFieldsService(
        id: string,
        value: string
    ): Promise<IApiResponse> {
        try {
            const isExists =
                await this.propertyIntegrationSecretsRepository.getById(id);
            if (!isExists) {
                return errorResponse(
                    'Failed to update property integration fields'
                );
            }
            const fields =
                await this.propertyIntegrationSecretsRepository.updateIntegrationSecret(
                    id,
                    value
                );
            return successResponse(
                'Property integration fields updated successfully',
                fields
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to update property integration fields',
                    error.message
                );
            }
            return errorResponse(
                'Failed to update property integration fields'
            );
        }
    }
    public async deleteFieldsService(id: string): Promise<IApiResponse> {
        try {
            const isExists =
                await this.propertyIntegrationSecretsRepository.getById(id);
            if (!isExists) {
                return errorResponse(
                    'Failed to delete property integration fields'
                );
            }
            await this.propertyIntegrationSecretsRepository.deleteIntegrationSecret(
                id
            );
            return successResponse(
                'Property integration fields deleted successfully'
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to delete property integration fields',
                    error.message
                );
            }
            return errorResponse(
                'Failed to delete property integration fields'
            );
        }
    }
    public async addFieldsService(
        data: ICPropertyInregrationSecrets,
        propertyIntegrationId: string
    ): Promise<IApiResponse> {
        try {
            const fields =
                await this.propertyIntegrationSecretsRepository.addIntegrationSecret(
                    data,
                    propertyIntegrationId
                );
            return successResponse(
                'Property integration fields added successfully',
                fields
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to add property integration fields',
                    error.message
                );
            }
            return errorResponse('Failed to add property integration fields');
        }
    }
}

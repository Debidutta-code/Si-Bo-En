import { successResponse, errorResponse } from '../../utils';
import { IApiResponse } from '../../utils';
import { propertyLoyalityRepository } from '../repository';
import {
    ICPropertyLoyaltyConfig,
    IPropertyLoyaltyConfig,
} from '../types/property-loyality.types';

export class PropertyLoyalityService {
    private propertyLoyalityRepository: propertyLoyalityRepository;

    constructor() {
        this.propertyLoyalityRepository = new propertyLoyalityRepository();
    }

    public async createPropertyLoyalityConfig(
        data: ICPropertyLoyaltyConfig
    ): Promise<IApiResponse> {
        try {
            const activeExisting =
                await this.propertyLoyalityRepository.getLoyalityForPropertyWhereTrue(
                    data.propertyId
                );
            if (activeExisting && !activeExisting.isActive) {
                const activateRes =
                    await this.propertyLoyalityRepository.updatePropertyLoyalityConfig(
                        activeExisting.id,
                        true
                    );
                return successResponse(
                    'Successfully activated property loyalty config',
                    activateRes
                );
            } else if (activeExisting) {
                const updateRes =
                    await this.propertyLoyalityRepository.updatePropertyLoyality(
                        activeExisting.id,
                        data,
                        true
                    );
                return successResponse(
                    'Successfully updated property loyalty config',
                    updateRes
                );
            } else {
                const result =
                    await this.propertyLoyalityRepository.createPropertyLoyalityConfig(
                        data
                    );
                return successResponse(
                    'Successfully created property loyalty config',
                    result
                );
            }
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to create property loyalty config',
                    error.message
                );
            }
            return errorResponse('Failed to create property loyalty config');
        }
    }

    public async getLoyalityForProperty(
        propertyId: string
    ): Promise<IApiResponse> {
        try {
            const result =
                await this.propertyLoyalityRepository.getLoyalityForProperty(
                    propertyId
                );
            if (!result) {
                return errorResponse(
                    'No loyalty config found for this property'
                );
            }
            return successResponse(
                'Successfully retrieved property loyalty config',
                result
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to retrieve property loyalty config',
                    error.message
                );
            }
            return errorResponse('Failed to retrieve property loyalty config');
        }
    }

    public async updatePropertyLoyalityConfig(
        propertyId: string,
        isActive: boolean,
        loyaltyImage: string | null
    ): Promise<IApiResponse> {
        try {
            const existingConfig =
                await this.propertyLoyalityRepository.getLoyalityForProperty(
                    propertyId
                );
            if (!existingConfig) {
                return errorResponse('Property loyalty config not found');
            }
            const updateData: Partial<ICPropertyLoyaltyConfig> = {
                loyalityConfigLogo: loyaltyImage,
            };
            const result =
                await this.propertyLoyalityRepository.updatePropertyLoyality(
                    existingConfig.id,
                    updateData,
                    isActive
                );
            if (!result) {
                return errorResponse(
                    'Failed to update property loyalty config'
                );
            }
            return successResponse(
                'Successfully updated property loyalty config',
                result
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to update property loyalty config',
                    error.message
                );
            }
            return errorResponse('Failed to update property loyalty config');
        }
    }

    public async deletePropertyLoyalityConfig(
        propertyId: string
    ): Promise<IApiResponse> {
        try {
            const existingConfig =
                await this.propertyLoyalityRepository.getLoyalityForProperty(
                    propertyId
                );
            if (!existingConfig) {
                return errorResponse('Property loyalty config not found');
            }
            const result =
                await this.propertyLoyalityRepository.deletePropertyLoyalityConfig(
                    existingConfig.id
                );
            if (!result) {
                return errorResponse(
                    'Failed to delete property loyalty config'
                );
            }
            return successResponse(
                'Successfully deleted property loyalty config',
                result
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to delete property loyalty config',
                    error.message
                );
            }
            return errorResponse('Failed to delete property loyalty config');
        }
    }

    public async getAllPropertyLoyalityWithLoyality(
        propertyId: string
    ): Promise<IApiResponse> {
        try {
            const result =
                await this.propertyLoyalityRepository.getAllPropertyLoyalityWithLoyality(
                    propertyId
                );
            if (!result || result.length === 0) {
                return errorResponse(
                    'No loyalty configs found for this property'
                );
            }
            return successResponse(
                'Successfully retrieved all property loyalty configs',
                result
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to retrieve property loyalty configs',
                    error.message
                );
            }
            return errorResponse('Failed to retrieve property loyalty configs');
        }
    }

    public async getActiveLoyaltyConfigByPropertyId(
        propertyId: string
    ): Promise<IApiResponse> {
        try {
            const result =
                await this.propertyLoyalityRepository.getActiveLoyaltyConfigByPropertyId(
                    propertyId
                );
            if (!result) {
                return errorResponse(
                    'No active loyalty config found for this property'
                );
            }
            return successResponse(
                'Successfully retrieved active loyalty config',
                result
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to retrieve active loyalty config',
                    error.message
                );
            }
            return errorResponse('Failed to retrieve active loyalty config');
        }
    }
}

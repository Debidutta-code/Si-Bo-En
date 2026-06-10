import { DashUtilsRepo } from '../../dashboard/repository';
import { CreationType } from '../../dashboard/types';
import { successResponse, errorResponse } from '../../utils';
import { IApiResponse } from '../../utils';
import {
    creationLoyalityRepository,
    LoyaltyProgramRepository,
} from '../repository';
import {
    ICCreationLoyality,
    IUCreationLoyalty,
} from '../types/creation-loyality.types';

export class CreationLoyalityService {
    private creationLoyalityRepository: creationLoyalityRepository;
    private loyaltyProgramRepository: LoyaltyProgramRepository;
    private dashboardUtils: DashUtilsRepo;

    constructor() {
        this.creationLoyalityRepository = new creationLoyalityRepository();
        this.loyaltyProgramRepository = new LoyaltyProgramRepository();
        this.dashboardUtils = new DashUtilsRepo();
    }

    public async createCreationLoyality(
        data: ICCreationLoyality
    ): Promise<IApiResponse> {
        try {
            const result =
                await this.creationLoyalityRepository.createCreationLoyality(
                    data
                );
            if (!result) {
                return errorResponse('Failed to create creation loyalty');
            }
            await this.loyaltyProgramRepository.createLoyaltyProgram({
                isActive: false,
                logo: [],
                loyaltyProgramId: result.id,
            });
            return successResponse(
                'Successfully created creation loyalty',
                result
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to create creation loyalty',
                    error.message
                );
            }
            return errorResponse('Failed to create creation loyalty');
        }
    }

    public async updateCreationLoyality(
        creationLoyalityId: string,
        data: IUCreationLoyalty
    ): Promise<IApiResponse> {
        try {
            const existingLoyalty =
                await this.creationLoyalityRepository.getCreationLoyalityById(
                    creationLoyalityId
                );
            if (!existingLoyalty) {
                return errorResponse('Creation loyalty not found');
            }
            const result =
                await this.creationLoyalityRepository.updateCreationLoyality(
                    creationLoyalityId,
                    data
                );
            if (!result) {
                return errorResponse('Failed to update creation loyalty');
            }
            return successResponse(
                'Successfully updated creation loyalty',
                result
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to update creation loyalty',
                    error.message
                );
            }
            return errorResponse('Failed to update creation loyalty');
        }
    }

    public async deleteLoyality(
        creationLoyalityId: string
    ): Promise<IApiResponse> {
        try {
            const existingLoyalty =
                await this.creationLoyalityRepository.getCreationLoyalityById(
                    creationLoyalityId
                );
            if (!existingLoyalty) {
                return errorResponse('Creation loyalty not found');
            }
            const result =
                await this.creationLoyalityRepository.deleteLoyality(
                    creationLoyalityId
                );
            if (!result) {
                return errorResponse('Failed to delete creation loyalty');
            }
            return successResponse(
                'Successfully deleted creation loyalty',
                result
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to delete creation loyalty',
                    error.message
                );
            }
            return errorResponse('Failed to delete creation loyalty');
        }
    }

    public async getCreationLoyalityById(
        creationLoyalityId: string
    ): Promise<IApiResponse> {
        try {
            const result =
                await this.creationLoyalityRepository.getCreationLoyalityById(
                    creationLoyalityId
                );
            if (!result) {
                return errorResponse('Creation loyalty not found');
            }
            return successResponse(
                'Successfully retrieved creation loyalty',
                result
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to retrieve creation loyalty',
                    error.message
                );
            }
            return errorResponse('Failed to retrieve creation loyalty');
        }
    }

    public async getLoyalityByCreation(
        creationId: string
    ): Promise<IApiResponse> {
        try {
            const result =
                await this.creationLoyalityRepository.getLoyalityByCreation(
                    creationId
                );
            if (!result) {
                return errorResponse('No loyalty found for this creation');
            }
            return successResponse(
                'Successfully retrieved loyalty by creation',
                result
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to retrieve loyalty by creation',
                    error.message
                );
            }
            return errorResponse('Failed to retrieve loyalty by creation');
        }
    }
    public async getPropertyNamesByCreationId(creationId: string) {
        try {
            const creation =
                await this.dashboardUtils.getCreationByCreationId(creationId);

            if (!creation) {
                return errorResponse('Creation not found');
            }

            let daoRes: any;

            switch (creation.type) {
                case CreationType.super:
                    daoRes =
                        await this.dashboardUtils.getPropertyIdsAndCodesForLevel4(
                            creationId
                        );
                    break;
                case CreationType.group:
                    daoRes =
                        await this.dashboardUtils.getPropertyIdsAndCodesForLevel3(
                            creationId
                        );
                    break;
                case CreationType.brand:
                    daoRes =
                        await this.dashboardUtils.getPropertyIdsAndCodesForLevel2(
                            creationId
                        );
                    break;
                case CreationType.property:
                    daoRes =
                        await this.dashboardUtils.getPropertyIdAndCodeForLevel0And1(
                            creationId
                        );
                    break;
                default:
                    return errorResponse('Invalid creation level');
            }
            if (!daoRes.success) {
                return errorResponse(
                    daoRes.message || 'Failed to fetch properties'
                );
            }
            daoRes = daoRes.data.filter((item: { id: string, code: string, isLoyaltyProgramEnabled: boolean }) => item.isLoyaltyProgramEnabled === true);

            return successResponse(
                'Properties fetched successfully',
                daoRes
            );
        } catch (error) {
            return errorResponse(
                'Failed to fetch property names',
                error instanceof Error ? error.message : 'Internal server error'
            );
        }
    }
}

import { successResponse, errorResponse } from '../../utils';
import { IApiResponse } from '../../utils';
import {
    LoyaltyProgramRepository,
} from '../repository';
import {
    IAdvanceLoyaltyprogram,
    ICAdvanceLoyaltyprogram,
    ICloyaltyProgram,
    IUAdvanceLoyaltyprogram,
    IULoyalityProgram,
} from '../types';
import { deleteFileByUrl } from '../../utils/delete-images.utils';

export class LoyalityProgramService {
    private loyaltyProgramRepository: LoyaltyProgramRepository;

    constructor() {
        this.loyaltyProgramRepository = new LoyaltyProgramRepository();
    }

    public async createLoyaltyProgram(
        data: ICloyaltyProgram
    ): Promise<IApiResponse> {
        try {
            const result =
                await this.loyaltyProgramRepository.createLoyaltyProgram(data);
            return successResponse(
                'Successfully created loyalty program',
                result
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'failed to create loyalty program',
                    error.message
                );
            }
            return errorResponse('failed to create loyalty program');
        }
    }

    public async getLoyaltyProgram(
        loyaltyProgramId: string
    ): Promise<IApiResponse> {
        try {
            const result =
                await this.loyaltyProgramRepository.getLoyaltyProgramById(
                    loyaltyProgramId
                );
            if (!result) {
                return errorResponse('Failed to retrieve loyalty program');
            }
            return successResponse(
                'Successfully retrieved loyalty program',
                result
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'failed to retrieve loyalty program',
                    error.message
                );
            }
            return errorResponse('failed to retrieve loyalty program');
        }
    }

    public async getLoyaltyProgramByCreationId(
        creationId: string
    ): Promise<IApiResponse> {
        try {
            const result =
                await this.loyaltyProgramRepository.getLoyaltyProgramByCreationId(
                    creationId
                );
            if (!result) {
                return errorResponse('Failed to retrieve loyalty program');
            }
            return successResponse(
                'Successfully retrieved loyalty program',
                result
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'failed to retrieve loyalty program',
                    error.message
                );
            }
            return errorResponse('failed to retrieve loyalty program');
        }
    }

    public async updateLoyaltyProgram(
        loyaltyProgramId: string,
        data: IULoyalityProgram
    ): Promise<IApiResponse> {
        try {
            const existingProgram =
                await this.loyaltyProgramRepository.getLoyaltyProgramById(
                    loyaltyProgramId
                );
            if (!existingProgram) {
                return errorResponse('Loyalty program not found');
            }

            if (data.logo) {
                const oldImages: string[] = existingProgram.logo || [];
                const newImages: string[] = data.logo || [];
                const imagesToDelete = oldImages.filter(
                    img => !newImages.includes(img)
                );

                if (imagesToDelete.length > 0) {
                    await Promise.all(
                        imagesToDelete.map(img =>
                            deleteFileByUrl(img).catch(err =>
                                console.error(
                                    'Failed to delete loyalty program logo:',
                                    img,
                                    err
                                )
                            )
                        )
                    );
                }
            }

            const result =
                await this.loyaltyProgramRepository.updateLoyaltyProgram(
                    loyaltyProgramId,
                    data
                );
            if (!result) {
                return errorResponse('Failed to update loyalty program');
            }
            return successResponse(
                'Successfully updated loyalty program',
                result
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'failed to update loyalty program',
                    error.message
                );
            }
            return errorResponse('failed to update loyalty program');
        }
    }

    public async deleteLoyaltyProgram(
        loyaltyProgramId: string
    ): Promise<IApiResponse> {
        try {
            const existingProgram =
                await this.loyaltyProgramRepository.getLoyaltyProgramById(
                    loyaltyProgramId
                );
            if (!existingProgram) {
                return errorResponse('Failed to find loyalty program');
            }
            const result =
                await this.loyaltyProgramRepository.deleteLoyaltyProgram(
                    loyaltyProgramId
                );
            if (!result) {
                return errorResponse('Failed to delete loyalty program');
            }
            return successResponse(
                'Successfully deleted loyalty program',
                result
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'failed to delete loyalty program',
                    error.message
                );
            }
            return errorResponse('failed to delete loyalty program');
        }
    }

    public async getPropertyLoyalityProgramByCreationId(
        creationLoyaltyConfigId: string
    ): Promise<IApiResponse> {
        try {
            const result =
                await this.loyaltyProgramRepository.getPropertyLoyaltyProgramByCreationId(
                    creationLoyaltyConfigId
                );
            if (!result) {
                return errorResponse(
                    'Failed to retrieve property loyalty program'
                );
            }
            return successResponse(
                'Successfully retrieved property loyalty program',
                result
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'failed to retrieve property loyalty program',
                    error.message
                );
            }
            return errorResponse('failed to retrieve property loyalty program');
        }
    }
}

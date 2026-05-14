import { IApiResponse } from '../../utils';
import { successResponse, errorResponse } from '../../utils';
import {
    LoyalityLevelRepository,
    LoyaltyGuestRepository,
    propertyLoyalityRepository,
} from '../repository';
import { ICloyalityGuests, ILoyalityLevels } from '../types';
import { paginatedSuccessResponse } from '../../utils';
import { CreationGuestRepository } from '../repository/creation-guest.repository';
import { createHash } from '../../auth/utills/bcryptHelper';
import { CurrencyCode } from '../../tax-system/interfaces';
export class LoyaltyGuestService {
    private loyaltyGuestRepository: LoyaltyGuestRepository;
    private creationGuestRepository: CreationGuestRepository;
    private propertyLoyaltyRepository: propertyLoyalityRepository;
    private loyaltyLevelRepository: LoyalityLevelRepository;

    constructor() {
        this.loyaltyGuestRepository = new LoyaltyGuestRepository();
        this.creationGuestRepository = new CreationGuestRepository();
        this.propertyLoyaltyRepository = new propertyLoyalityRepository();
        this.loyaltyLevelRepository = new LoyalityLevelRepository();
    }

    public async deleteLoyaltyGuest(
        loyaltyGuestId: string
    ): Promise<IApiResponse> {
        try {
            const deletedLoyaltyGuest =
                await this.loyaltyGuestRepository.deleteLoyaltyGuestById(
                    loyaltyGuestId
                );
            return successResponse(
                'Loyalty guest deleted successfully',
                deletedLoyaltyGuest
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to delete loyalty guest',
                    error.message
                );
            }
            return errorResponse('Failed to delete loyalty guest');
        }
    }
    public async getLoyalityGuestForcreationLoyality(
        creationLoyalityId: string,
        skip: number = 0,
        take: number = 10
    ): Promise<IApiResponse> {
        try {
            const [loyaltyGuests, count] = await Promise.all([
                this.loyaltyGuestRepository.getLoyalityGuestForCreation(
                    creationLoyalityId,
                    skip,
                    take
                ),
                this.loyaltyGuestRepository.getTotalLoyalityGuests(
                    creationLoyalityId
                ),
            ]);
            return paginatedSuccessResponse(
                'Loyalty guests fetched successfully',
                loyaltyGuests,
                {
                    currentPage: Math.floor(skip / take) + 1,
                    limit: take,
                    totalCount: count,
                    totalPages: Math.ceil(count / take),
                    hasNextPage: skip + take < count,
                    hasPrevPage: skip > 0,
                }
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to get loyalty guests for property',
                    error.message
                );
            }
            return errorResponse('Failed to get loyalty guests for property');
        }
    }
    public async getLoyalityGuestsForProperty(
        propertyId: string,
        skip: number = 0,
        take: number = 10
    ): Promise<IApiResponse> {
        try {
            const [loyaltyGuests, count] = await Promise.all([
                this.loyaltyGuestRepository.getLoyalityGuestsForProperty(
                    propertyId,
                    skip,
                    take
                ),
                this.loyaltyGuestRepository.totalLoyalityGuestsForProperty(
                    propertyId
                ),
            ]);
            return paginatedSuccessResponse(
                'Loyalty guests fetched successfully',
                loyaltyGuests,
                {
                    currentPage: Math.floor(skip / take) + 1,
                    limit: take,
                    totalCount: count,
                    totalPages: Math.ceil(count / take),
                    hasNextPage: skip + take < count,
                    hasPrevPage: skip > 0,
                }
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to get loyalty guests for property',
                    error.message
                );
            }
            return errorResponse('Failed to get loyalty guests for property');
        }
    }

    public async registerGuestFromBookingEngine(data: {
        email: string;
        propertyId: string;
        metaData: any;
        password: string;
    }): Promise<IApiResponse> {
        try {
            const { email, propertyId, metaData, password } = data;

            const propertyLoyaltyConfig =
                await this.propertyLoyaltyRepository.getLoyalityForPropertyWhereTrue(
                    propertyId
                );
            // console.log(propertyLoyaltyConfig);
            if (!propertyLoyaltyConfig) {
                return errorResponse(
                    'No active loyalty program found for this property'
                );
            }

            const creationLoyaltyConfigId =
                propertyLoyaltyConfig.CreationLoyaltyConfig?.id;
            if (!creationLoyaltyConfigId) {
                return errorResponse(
                    'No loyalty configuration found for this property'
                );
            }

            const existingGuest =
                await this.loyaltyGuestRepository.checkIfGuestExists(email);

            if (existingGuest) {
                const [guestExistForProperty, existingCreationGuest] =
                    await Promise.all([
                        this.creationGuestRepository.guestExistForProperty(
                            propertyLoyaltyConfig.id,
                            existingGuest.id
                        ),
                        this.creationGuestRepository.checkIfGuestExist(
                            creationLoyaltyConfigId,
                            existingGuest.id
                        ),
                    ]);

                // ✅ Only BOTH existing means truly already registered
                if (guestExistForProperty && existingCreationGuest) {
                    return errorResponse(
                        "You are already registered for this property's loyalty program"
                    );
                }

                // ✅ Create only what's missing
                const tasks = [];
                if (!guestExistForProperty) {
                    tasks.push(
                        this.creationGuestRepository.createPropertyLoyaltyGuest(
                            {
                                propertyLoyalityId: propertyLoyaltyConfig.id,
                                loyalityGuestId: existingGuest.id,
                            }
                        )
                    );
                }
                if (!existingCreationGuest) {
                    tasks.push(
                        this.creationGuestRepository.createCreationGuest({
                            loyalityGuestId: existingGuest.id,
                            creationLoyaltyConfigId,
                            metaData,
                            guestLevel: 1,
                            noOfBookings: 0,
                        })
                    );
                }
                await Promise.all(tasks);
                return successResponse(
                    'Successfully registered for loyalty program'
                );
            }

            // Brand new guest — create LoyalityGuest + PropertyLoyalityGuest + CreationGuest
            const hashedPassword = await createHash(password);
            const newGuest =
                await this.loyaltyGuestRepository.createGuestsLoyaltyConfig({
                    guestEmail: email,
                    guestId: '',
                    password: hashedPassword,
                    otaGuestId: null,
                });

            if (!newGuest) {
                return errorResponse('Failed to create new guest');
            }

            await Promise.all([
                this.creationGuestRepository.createPropertyLoyaltyGuest({
                    propertyLoyalityId: propertyLoyaltyConfig.id,
                    loyalityGuestId: newGuest.id,
                }),
                this.creationGuestRepository.createCreationGuest({
                    loyalityGuestId: newGuest.id,
                    creationLoyaltyConfigId,
                    metaData,
                    guestLevel: 1,
                    noOfBookings: 0,
                }),
            ]);

            return successResponse(
                'Successfully registered for loyalty program'
            );
        } catch (error) {
            return errorResponse(
                'Failed to register for loyalty program',
                error instanceof Error ? error.message : undefined
            );
        }
    }
    public async checkLoyaltyDiscount(
        email: string,
        propertyId: string
    ): Promise<IApiResponse> {
        try {
            const propertyConfig =
                await this.propertyLoyaltyRepository.getActiveLoyaltyConfigByPropertyId(
                    propertyId
                );
            if (!propertyConfig) {
                return errorResponse(
                    'No active loyalty program found for this property'
                );
            }

            if (!propertyConfig.CreationLoyaltyConfig?.id) {
                return errorResponse(
                    'No loyalty configuration found for this property'
                );
            }

            const loyaltyGuest =
                await this.loyaltyGuestRepository.getLoyaltyGuestByEmail(email);
            if (!loyaltyGuest) {
                return successResponse('Guest is not a loyalty member', {
                    isLoyaltyMember: false,
                    discount: null,
                });
            }

            const [guestExistForProperty, existingCreationGuest] =
                await Promise.all([
                    this.creationGuestRepository.guestExistForProperty(
                        propertyConfig.id,
                        loyaltyGuest.id
                    ),
                    this.creationGuestRepository.checkIfGuestExist(
                        propertyConfig.CreationLoyaltyConfig.id,
                        loyaltyGuest.id
                    ),
                ]);

            if (!guestExistForProperty || !existingCreationGuest) {
                return successResponse('Guest is not a loyalty member', {
                    isLoyaltyMember: false,
                    discount: null,
                });
            }

            const currentGuestLevel = existingCreationGuest.guestLevel;
            const levels =
                propertyConfig.CreationLoyaltyConfig?.LoyalityLevels ?? [];

            // Find the discount for guest's current level
            const matchedLevel = levels.find(
                (l: ILoyalityLevels) => l.level === currentGuestLevel
            );

            // Fallback chain: matched level → base config discountValue → 0
            const discountValue =
                matchedLevel?.discountPercentage ??
                propertyConfig.CreationLoyaltyConfig?.discountValue ??
                0;

            const discountType =
                propertyConfig.CreationLoyaltyConfig?.loyaltyDiscountType ??
                'percentage';
            const currencyCode =
                propertyConfig.CreationLoyaltyConfig?.currencyCode;

            return successResponse('Loyalty discount available', {
                isLoyaltyMember: true,
                discount: {
                    type: discountType,
                    value: discountValue,
                    currencyCode,
                },
            });
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to check loyalty discount',
                    error.message
                );
            }
            return errorResponse('Failed to check loyalty discount');
        }
    }
    public async getGuestByEmailAndProperty(
        email: string,
        propertyId: string
    ): Promise<IApiResponse> {
        try {
            const loyaltyGuest =
                await this.loyaltyGuestRepository.getLoyaltyGuestByPropertyAndGuest(
                    propertyId,
                    email
                );

            if (!loyaltyGuest) {
                return errorResponse('Loyalty guest not found');
            }

            return successResponse(
                'Loyalty guest fetched successfully',
                loyaltyGuest
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to fetch loyalty guest',
                    error.message
                );
            }
            return errorResponse('Failed to fetch loyalty guest');
        }
    }
}

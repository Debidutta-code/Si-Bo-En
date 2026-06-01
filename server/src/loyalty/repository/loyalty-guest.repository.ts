import { prisma } from '../../config';
import { IPropertyLoyaltyConfig } from '../types';
import { ICreationLoyaltyGuestWDP } from '../types/creation-guest.types';
import { CreationGuestRepository } from './creation-guest.repository';
import { LoyalityLevelRepository } from './loyality-level.repository';
import { PropertyLoyalityGuest } from './property-lotality-guest.repository';
export class LoyaltyGuestRepository {
    private creationGuestRepo: CreationGuestRepository;
    private propertyGuestRepo: PropertyLoyalityGuest;
    private loyaltyLevelRepo: LoyalityLevelRepository;

    constructor() {
        this.creationGuestRepo = new CreationGuestRepository();
        this.propertyGuestRepo = new PropertyLoyalityGuest();
        this.loyaltyLevelRepo = new LoyalityLevelRepository();
    }

    public async getActiveLoyaltyConfigByPropertyId(propertyId: string) {
        try {
            return await prisma.propertyLoyaltyConfig.findFirst({
                where: {
                    propertyId,
                    isActive: true,
                },
                include: {
                    CreationLoyaltyConfig: {
                        include: {
                            LoyalityLevels: {
                                orderBy: { level: 'asc' },
                            },
                        },
                    },
                },
            });
        } catch (error) {
            throw new Error('Failed to create loyalty config');
        }
    }
    public async checkIfCreationGuestExists(
        creationLoyaltyConfigId: string,
        customerId: string
    ): Promise<ICreationLoyaltyGuestWDP | null> {
        try {
            return await prisma.creationGuest.findFirst({
                where: {
                    creationLoyaltyConfigId,
                    customerId,
                },
                include: {
                    Customer: {
                        include: { PrimaryGuests: true },
                    },
                    CreationLoyaltyConfig: true,
                },
            });
        } catch (error) {
            throw new Error('Failed to check if creation guest exists');
        }
    }
    public async getLoyalityGuestsForProperty(
        propertyId: string,
        skip: number = 0,
        take: number = 10
    ): Promise<ICreationLoyaltyGuestWDP[]> {
        try {
            return await prisma.creationGuest.findMany({
                where: {
                    creationLoyaltyConfigId: propertyId,
                },
                include: {
                    Customer: {
                        select: {
                            firstName: true,
                            lastName: true,
                            email: true,
                            id: true
                        }
                    }
                },
                skip,
                take,
            });

        } catch (error) {
            throw new Error('Failed to get loyalty guests for property');
        }
    }
    public async totalLoyalityGuestsForProperty(
        propertyLoyalityId: string
    ): Promise<number> {
        try {
            return await prisma.propertyLoyalityGuests.count({
                where: {
                    propertyLoyalityId: propertyLoyalityId,
                },
            });
        } catch (error) {
            throw new Error('Failed to count loyalty guests for property');
        }
    }
    public async getTotalLoyalityGuests(
        creationLoyaltyConfigId: string
    ): Promise<number> {
        try {
            return await prisma.creationGuest.count({
                where: {
                    creationLoyaltyConfigId,
                },
            });
        } catch (error) {
            throw new Error('Failed to count total loyalty guests');
        }
    }
    public async getLoyalityGuestForCreation(
        creationLoyaltyConfigId: string,
        skip: number = 0,
        take: number = 10
    ): Promise<ICreationLoyaltyGuestWDP[]> {
        try {
            const results = await prisma.creationGuest.findMany({
                where: {
                    creationLoyaltyConfigId: creationLoyaltyConfigId,
                },
                include: {
                    CreationLoyaltyConfig: {
                        select: {
                            id: true,
                            loyaltyDiscountType: true,
                            discountValue: true,
                            currencyCode: true,
                            createdAt: true,
                        },
                    },
                    Customer: {
                        include: {
                            PrimaryGuests: true,
                        },
                    },
                },
                skip,
                take,
            });
            return results
        } catch (error) {
            throw new Error('Failed to get loyalty guest for creation');
        }
    }
    public async getPropertyLoyaltyConfig(propertyId: string): Promise<IPropertyLoyaltyConfig | null> {
        try {
            return await prisma.propertyLoyaltyConfig.findUnique({
                where: { propertyId, isActive: true },
                include: {
                    CreationLoyaltyConfig: true,
                },
            });
        } catch (error) {
            throw new Error('Failed to get property loyalty config');
        }
    }
    public async getPropertyLoyaltyConfigByPropertyId(
        propertyId: string
    ): Promise<{
        id: string;
        creationLoyaltyConfigId: string;
        isActive: boolean;
    } | null> {
        try {
            return await prisma.propertyLoyaltyConfig.findUnique({
                where: { propertyId, isActive: true },
                select: {
                    id: true,
                    creationLoyaltyConfigId: true,
                    isActive: true,
                },
            });
        } catch (error) {
            throw new Error('Failed to fetch property loyalty config');
        }
    }
    private async incrementBookingsAndMaybeUpgrade(
        creationGuestId: string,
        currentNoOfBookings: number,
        currentGuestLevel: number,
        levels: { level: number; noOfReservations: number }[]
    ) {
        try {
            const newBookings = currentNoOfBookings + 1;
            const nextLevel = levels.find(
                l => l.level === currentGuestLevel + 1
            );
            const shouldUpgrade =
                !!nextLevel && newBookings >= nextLevel.noOfReservations;

            await prisma.creationGuest.update({
                where: { id: creationGuestId },
                data: {
                    noOfBookings: newBookings,
                    ...(shouldUpgrade && { guestLevel: nextLevel!.level }),
                    updatedAt:new Date()
                },
            });
        } catch (error) {
            throw new Error('Failed to increment loyalty bookings');
        }
    }

    public async handlePostBookingLoyalty(
        propertyId: string,
        loyaltyToken?: string
    ): Promise<void> {
        try {
            if (!loyaltyToken) return
            const guestId = loyaltyToken.split("split")[0]
            const lPropertyId = loyaltyToken.split("split")[1]
            const shouldUpgrade = lPropertyId === propertyId
            if (!shouldUpgrade) return

            const propertyLoyaltyConfig =
                await this.getPropertyLoyaltyConfigByPropertyId(propertyId);
            if (!propertyLoyaltyConfig || !propertyLoyaltyConfig.isActive)
                return;

            const propertyCreationConfigId =
                propertyLoyaltyConfig.creationLoyaltyConfigId;

            const customer = await prisma.customers.findUnique({
                where: { id: guestId },
            });
            if (!customer) return;

            const alreadyLinkedToProperty =
                await this.propertyGuestRepo.guestExistForProperty(
                    propertyLoyaltyConfig.id,
                    customer.id
                );
            if (!alreadyLinkedToProperty) {
                await this.propertyGuestRepo.createPropertyLoyaltyGuest({
                    propertyLoyalityId: propertyLoyaltyConfig.id,
                    customerId: customer.id,
                    noOfBookings: 0
                });
            }

            const creationGuest = await this.creationGuestRepo.checkIfGuestExist(
                propertyCreationConfigId,
                customer.id
            );

            if (creationGuest) {
                const levels = await this.loyaltyLevelRepo.findAllByPropertyConfigId(
                    propertyCreationConfigId
                );


                await this.incrementBookingsAndMaybeUpgrade(
                    creationGuest.id,
                    creationGuest.noOfBookings,
                    creationGuest.guestLevel,
                    levels
                );
            } else {
                await this.creationGuestRepo.createCreationGuest({
                    customerId: customer.id,
                    creationLoyaltyConfigId: propertyCreationConfigId,
                    guestLevel: 1,
                    noOfBookings: 1,
                    metaData: {},
                });
            }
        } catch (error) {
            console.error('handlePostBookingLoyalty error:', error);
        }
    }

    /**
     * Post-cancel loyalty handler — called after a reservation is cancelled.
     */
    public async handlePostCancelLoyalty(
        guestEmail: string,
        propertyId: string
    ): Promise<void> {
        try {
            const creationGuestRepo = new CreationGuestRepository();

            const propertyLoyaltyConfig =
                await this.getPropertyLoyaltyConfigByPropertyId(propertyId);
            if (!propertyLoyaltyConfig || !propertyLoyaltyConfig.isActive)
                return;

            const propertyCreationConfigId =
                propertyLoyaltyConfig.creationLoyaltyConfigId;

            const loyalityGuest = await prisma.customers.findUnique({
                where: { email: guestEmail },
            });
            if (!loyalityGuest) return;

            const creationGuest = await creationGuestRepo.checkIfGuestExist(
                propertyCreationConfigId,
                loyalityGuest.id
            );
            if (!creationGuest || creationGuest.noOfBookings <= 0) return;

            const newBookings = creationGuest.noOfBookings - 1;
            const levels = await this.loyaltyLevelRepo.findAllByPropertyConfigId(
                propertyCreationConfigId
            );

            const currentLevelDef = levels.find(
                l => l.level === creationGuest.guestLevel
            );

            let newLevel = creationGuest.guestLevel;
            if (
                currentLevelDef &&
                newBookings < currentLevelDef.noOfReservations
            ) {
                const qualifiedLevels = levels.filter(
                    l => newBookings >= l.noOfReservations
                );
                newLevel =
                    qualifiedLevels.length > 0
                        ? qualifiedLevels[qualifiedLevels.length - 1].level
                        : 1;
            }

            await prisma.creationGuest.update({
                where: { id: creationGuest.id },
                data: {
                    noOfBookings: newBookings,
                    guestLevel: newLevel,
                },
            });
        } catch (error) {
            console.error('handlePostCancelLoyalty error:', error);
        }
    }
}

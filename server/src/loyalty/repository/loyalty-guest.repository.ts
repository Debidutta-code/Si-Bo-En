import { prisma } from '../../config';
import {
    ILoyalityGuests,
    ICloyalityGuests,
    IGetLoyaltyGuestsForCreation,
} from '../types';
import { ICreationLoyaltyGuestWDP } from '../types/creation-guest.types';
import { CreationGuestRepository } from './creation-guest.repository';
export class LoyaltyGuestRepository {
    public async createGuestsLoyaltyConfig(
        guestLoyaltyConfigData: ICloyalityGuests
    ): Promise<ILoyalityGuests> {
        try {
            const data: any = {
                email: guestLoyaltyConfigData.customerEmail,
                password: guestLoyaltyConfigData.password,
                firstName: '',
                lastName: '',
            };
            return await prisma.customers.create({ data }) as unknown as ILoyalityGuests;
        } catch (error) {
            throw new Error('Failed to create guest loyalty config');
        }
    }
    public async getLoyaltyGuestByPropertyAndGuest(
        propertyId: string,
        guestEmail: string
    ): Promise<IGetLoyaltyGuestsForCreation | null> {
        try {
            const customer = await prisma.customers.findUnique({
                where: { email: guestEmail },
                select: { id: true },
            });
            if (!customer) return null;
            const result = await prisma.creationGuest.findFirst({
                where: {
                    creationLoyaltyConfigId: propertyId,
                    customerId: customer.id,
                },
                include: {
                    Customer: {
                        include: { PrimaryGuests: true },
                    },
                    CreationLoyaltyConfig: true,
                },
            });
            return result ? { ...result, LoyalityGuest: result.Customer } as unknown as IGetLoyaltyGuestsForCreation : null;
        } catch (error) {
            throw new Error(
                'Failed to get loyalty guest by property and guest'
            );
        }
    }
    public async getLoyaltyGuestByEmail(
        guestEmail: string
    ): Promise<ILoyalityGuests | null> {
        try {
            return await prisma.customers.findUnique({
                where: {
                    email: guestEmail,
                },
            }) as ILoyalityGuests | null;
        } catch (error) {
            throw new Error('Failed to get loyalty guest by email');
        }
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
    public async checkIfGuestExists(
        guestEmail: string
    ): Promise<ILoyalityGuests | null> {
        try {
            return await prisma.customers.findUnique({
                where: {
                    email: guestEmail,
                },
            }) as ILoyalityGuests | null;
        } catch (error) {
            throw new Error('Failed to check if guest exists');
        }
    }
    public async checkIfCreationGuestExists(
        creationLoyaltyConfigId: string,
        customerId: string
    ): Promise<ICreationLoyaltyGuestWDP | null> {
        try {
            const result = await prisma.creationGuest.findFirst({
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
            return result ? { ...result, LoyalityGuest: result.Customer } as unknown as ICreationLoyaltyGuestWDP : null;
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
            const results = await prisma.creationGuest.findMany({
                where: {
                    creationLoyaltyConfigId: propertyId,
                },
                include: {
                    Customer: {
                        include: {
                            PrimaryGuests: true,
                        },
                    },
                },
                skip,
                take,
            });
            return results.map(r => ({
                ...r,
                LoyalityGuest: r.Customer,
            })) as unknown as ICreationLoyaltyGuestWDP[];
        } catch (error) {
            throw new Error('Failed to get loyalty guests for property');
        }
    }
    public async totalLoyalityGuestsForProperty(
        propertyId: string
    ): Promise<number> {
        try {
            return await prisma.propertyLoyalityGuests.count({
                where: {
                    propertyLoyalityId: propertyId,
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
            return results.map(r => ({
                ...r,
                LoyalityGuest: r.Customer,
            })) as unknown as ICreationLoyaltyGuestWDP[];
        } catch (error) {
            throw new Error('Failed to get loyalty guest for creation');
        }
    }
    public async deleteLoyaltyGuestById(
        customerId: string
    ): Promise<ILoyalityGuests | null> {
        try {
            return await prisma.customers.delete({
                where: {
                    id: customerId,
                },
            }) as unknown as ILoyalityGuests | null;
        } catch (error) {
            throw new Error('Failed to delete loyalty guest by id');
        }
    }

    public async createGuestsLoyaltyConfigFromBookingEngine(
        data: ICloyalityGuests
    ): Promise<ILoyalityGuests> {
        try {
            const createData: any = {
                email: data.customerEmail,
                password: data.password,
                firstName: '',
                lastName: '',
            };
            return await prisma.customers.create({
                data: createData,
            }) as unknown as ILoyalityGuests;
        } catch (error) {
            console.error('Error creating loyalty guest:', error);
            throw new Error(
                'Failed to create guest loyalty config from booking engine'
            );
        }
    }

    public async getPropertyLoyaltyConfig(propertyId: string): Promise<any> {
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
    public async addGuest(guestId: string): Promise<ILoyalityGuests | null> {
        try {
            return await prisma.customers.update({
                where: { id: guestId },
                data: {},
            }) as unknown as ILoyalityGuests | null;
        } catch (error) {
            throw new Error('Failed to add guest');
        }
    }

    public async addGuestTOLoyalty(
        email: string,
        guestEmailId: string
    ): Promise<ILoyalityGuests | null> {
        try {
            const existing = await prisma.customers.findUnique({
                where: { email },
            });
            if (!existing) return null;
            return await prisma.customers.update({
                where: { email },
                data: {},
            }) as unknown as ILoyalityGuests | null;
        } catch (error) {
            throw new Error('Failed to get guest by email');
        }
    }
    public async updateGuest(
        email: string,
        password: string
    ): Promise<ILoyalityGuests | null> {
        try {
            return await prisma.customers.update({
                where: { email },
                data: { password },
            }) as unknown as ILoyalityGuests | null;
        } catch (error) {
            throw new Error('Failed to update guest');
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

    private async getLoyaltyLevels(creationLoyaltyConfigId: string) {
        try {
            return await prisma.loyalityLevel.findMany({
                where: { creationLoyaltyConfigId },
                orderBy: { level: 'asc' },
            });
        } catch (error) {
            throw new Error('Failed to fetch loyalty levels');
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
                },
            });
        } catch (error) {
            throw new Error('Failed to increment loyalty bookings');
        }
    }

    /**
     * Post-booking loyalty handler — called after a reservation is created.
     */
    public async handlePostBookingLoyalty(
        guestEmail: string,
        creationLoyaltyConfigId: string,
        propertyId: string,
        isLoyalityGuest?: boolean
    ): Promise<void> {
        try {
            if (!isLoyalityGuest) return;

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

            const alreadyLinkedToProperty =
                await creationGuestRepo.guestExistForProperty(
                    propertyLoyaltyConfig.id,
                    loyalityGuest.id
                );
            if (!alreadyLinkedToProperty) {
                await creationGuestRepo.createPropertyLoyaltyGuest({
                    propertyLoyalityId: propertyLoyaltyConfig.id,
                    customerId: loyalityGuest.id,
                });
            }

            const creationGuest = await creationGuestRepo.checkIfGuestExist(
                propertyCreationConfigId,
                loyalityGuest.id
            );

            if (creationGuest) {
                const levels = await this.getLoyaltyLevels(
                    propertyCreationConfigId
                );

                await this.incrementBookingsAndMaybeUpgrade(
                    creationGuest.id,
                    creationGuest.noOfBookings,
                    creationGuest.guestLevel,
                    levels
                );
            } else {
                await creationGuestRepo.createCreationGuest({
                    customerId: loyalityGuest.id,
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
            const levels = await this.getLoyaltyLevels(
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

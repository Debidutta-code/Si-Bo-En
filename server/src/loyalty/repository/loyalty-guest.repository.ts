import { prisma } from "../../config";
import { ILoyalityGuests, ICloyalityGuests, IGetLoyaltyGuestsForCreation } from "../types";
import { ICreationLoyaltyGuestWDP } from "../types/creation-guest.types";
import { CreationGuestRepository } from "./creation-guest.repository";
export class LoyaltyGuestRepository {
    public async createGuestsLoyaltyConfig(guestLoyaltyConfigData: ICloyalityGuests): Promise<any> {
        try {
            const guestId = guestLoyaltyConfigData.guestId
                ? String(guestLoyaltyConfigData.guestId)
                : null;

            // Avoid P2003: guestId is an optional FK to Guests, so only persist it if it exists.
            const guestExists = guestId
                ? await prisma.guests.findUnique({ where: { id: guestId } })
                : null;

            return await prisma.loyalityGuest.create({
                data: {
                    ...guestLoyaltyConfigData,
                    guestId: guestExists ? guestId : null,

                }
            });
        } catch (error) {
            // console.log(error);
            throw new Error("Failed to create guest loyalty config");
        }
    }
    public async getLoyaltyGuestByPropertyAndGuest(propertyId: string, guestEmail: string): Promise<IGetLoyaltyGuestsForCreation | null> {
        try {
            return await prisma.creationGuest.findFirst({
                where: {
                    creationLoyaltyConfigId: propertyId,
                    LoyalityGuest: { guestEmail },
                },
                include: {
                    LoyalityGuest: {
                        include: { guest: true }
                    },
                    CreationLoyaltyConfig: true,
                },
            })
        } catch (error) {
            // console.log(error)
            throw new Error("Failed to get loyalty guest by property and guest");
        }
    }
    public async getLoyaltyGuestByEmail(guestEmail: string): Promise<ILoyalityGuests | null> {
        try {
            return await prisma.loyalityGuest.findUnique({
                where: {
                    guestEmail
                },
            });
        } catch (error) {
            throw new Error("Failed to get loyalty guest by email");
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
                            LoyalityLevels: {         // ← THIS was missing
                                orderBy: { level: "asc" },
                            },
                        },
                    },
                },
            });
        } catch (error) {
            throw new Error("Failed to create loyalty config");
        }
    }
    public async checkIfGuestExists(guestEmail: string): Promise<ILoyalityGuests | null> {
        try {
            return await prisma.loyalityGuest.findUnique({
                where: {
                    guestEmail
                }
            });
        } catch (error) {
            throw new Error("Failed to check if guest exists");
        }
    }
    public async checkIfCreationGuestExists(creationLoyaltyConfigId: string, loyalityGuestId: string): Promise<ICreationLoyaltyGuestWDP | null> {
        try {
            return await prisma.creationGuest.findFirst({
                where: {
                    creationLoyaltyConfigId,
                    loyalityGuestId,
                },
                include: {
                    LoyalityGuest: {
                        include: { guest: true }
                    },
                    CreationLoyaltyConfig: true,
                },
            })
        } catch (error) {
            throw new Error("Failed to check if creation guest exists");
        }
    }
    public async getLoyalityGuestsForProperty(propertyId: string, skip: number = 0, take: number = 10): Promise<ICreationLoyaltyGuestWDP[]> {
        try {
            return await prisma.creationGuest.findMany({
                where: {
                    creationLoyaltyConfigId: propertyId
                },
                include: {
                    LoyalityGuest: {
                        include: {
                            guest: true,
                        }
                    },
                    // Property: {
                    //     select: {
                    //         id: true,
                    //         propertyName: true,
                    //         propertyCode: true
                    //     }
                    // }
                },
                skip,
                take
            });
        } catch (error) {
            throw new Error("Failed to get loyalty guests for property");
        }
    }
    public async totalLoyalityGuestsForProperty(propertyId: string): Promise<number> {
        try {
            return await prisma.propertyLoyalityGuests.count({
                where: {
                    propertyLoyalityId: propertyId
                }
            });
        } catch (error) {
            throw new Error("Failed to count loyalty guests for property");
        }
    }
    public async getTotalLoyalityGuests(creationLoyaltyConfigId: string): Promise<number> {
        try {
            return await prisma.creationGuest.count({
                where: {
                    creationLoyaltyConfigId
                }
            });
        } catch (error) {
            throw new Error("Failed to count total loyalty guests");
        }
    }
    public async getLoyalityGuestForCreation(creationLoyaltyConfigId: string, skip: number = 0, take: number = 10): Promise<ICreationLoyaltyGuestWDP[]> {
        try {
            return await prisma.creationGuest.findMany({
                where: {
                    creationLoyaltyConfigId: creationLoyaltyConfigId
                },
                include: {
                    // Property: {
                    //     select: {
                    //         id: true,
                    //         propertyName: true,
                    //         propertyCode: true,
                    //     }
                    // },
                    CreationLoyaltyConfig: {
                        select: {
                            id: true,
                            loyaltyDiscountType: true,
                            discountValue: true,
                            currencyCode: true,
                            createdAt: true
                        }
                    },
                    LoyalityGuest: {
                        include: {
                            guest: true
                        }
                    }

                },
                skip,
                take
            });
        } catch (error) {
            console.log(error)
            throw new Error("Failed to get loyalty guest for creation");
        }
    }
    public async deleteLoyaltyGuestById(loyaltyGuestId: string): Promise<ILoyalityGuests | null> {
        try {
            return await prisma.loyalityGuest.delete({
                where: {
                    id: loyaltyGuestId
                }
            });
        } catch (error) {
            throw new Error("Failed to delete loyalty guest by id");
        }
    }

    public async createGuestsLoyaltyConfigFromBookingEngine(data: ICloyalityGuests): Promise<ILoyalityGuests> {
        try {
            return await prisma.loyalityGuest.create({
                data: {
                    guestEmail: data.guestEmail,
                    guestId: data.guestId || undefined,
                    password: data.password,
                }
            });
        } catch (error) {
            console.error("Error creating loyalty guest:", error);
            throw new Error("Failed to create guest loyalty config from booking engine");
        }
    }

    public async getPropertyLoyaltyConfig(propertyId: string): Promise<any> {
        try {
            return await prisma.propertyLoyaltyConfig.findUnique({
                where: { propertyId, isActive: true },
                include: {
                    CreationLoyaltyConfig: true
                }
            });
        } catch (error) {
            throw new Error("Failed to get property loyalty config");
        }
    }
    public async addGuest(guestId: string): Promise<ILoyalityGuests | null> {
        try {
            return await prisma.loyalityGuest.update({
                where: {
                    id: guestId
                }, data: {
                    guestId
                }
            })
        } catch (error) {
            throw new Error("Failed to add guest")
        }
    }

    public async addGuestTOLoyalty(email: string, guestEmailId: string): Promise<ILoyalityGuests | null> {
        try {
            return await prisma.loyalityGuest.update({
                where: {
                    guestEmail: email
                },
                data: {
                    guestId: guestEmailId
                }
            });
        } catch (error) {
            throw new Error("Failed to get guest by email");
        }
    }
    public async updateGuest(email: string, password: string): Promise<ILoyalityGuests | null> {
        try {
            return await prisma.loyalityGuest.update({
                where: {
                    guestEmail: email
                },
                data: {
                    password: password
                }
            });
        } catch (error) {
            throw new Error("Failed to update guest");
        }
    }
    public async getPropertyLoyaltyConfigByPropertyId(
        propertyId: string
    ): Promise<{ id: string; creationLoyaltyConfigId: string; isActive: boolean } | null> {
        try {
            return await prisma.propertyLoyaltyConfig.findUnique({
                where: { propertyId, isActive: true },
                select: { id: true, creationLoyaltyConfigId: true, isActive: true },
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
            const nextLevel = levels.find((l) => l.level === currentGuestLevel + 1);
            const shouldUpgrade = !!nextLevel && newBookings >= nextLevel.noOfReservations;

            return await prisma.creationGuest.update({
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
     *
     * Flow:
     * 1. If isLoyalityGuest is false → skip entirely
     * 2. Find LoyalityGuest by email
     * 3. Get PropertyLoyaltyConfig for this property → creationLoyaltyConfigId
     * 4. Find CreationGuest for this loyalityGuestId
     * 5a. If CreationGuest exists with SAME creationLoyaltyConfigId:
     *     - Increment noOfBookings
     *     - Check LoyalityLevel thresholds → upgrade if met
     * 5b. If CreationGuest exists with DIFFERENT creationLoyaltyConfigId,
     *     or no CreationGuest at all:
     *     - Create new CreationGuest for property's creationLoyaltyConfigId
     *     - Create PropertyLoyalityGuests link
     */
    public async handlePostBookingLoyalty(
        guestEmail: string,
        creationLoyaltyConfigId: string,
        propertyId: string,
        isLoyalityGuest?: boolean
    ): Promise<void> {
        try {
            // 1. Skip if not a loyalty guest
            if (!isLoyalityGuest) return;

            const creationGuestRepo = new CreationGuestRepository();

            // 2. Get PropertyLoyaltyConfig for this property
            const propertyLoyaltyConfig = await this.getPropertyLoyaltyConfigByPropertyId(propertyId);
            if (!propertyLoyaltyConfig || !propertyLoyaltyConfig.isActive) return;

            const propertyCreationConfigId = propertyLoyaltyConfig.creationLoyaltyConfigId;

            // 3. Find LoyalityGuest by email
            const loyalityGuest = await prisma.loyalityGuest.findUnique({
                where: { guestEmail },
            });
            if (!loyalityGuest) return;

            // 4. Ensure PropertyLoyalityGuests link exists
            const alreadyLinkedToProperty = await creationGuestRepo.guestExistForProperty(
                propertyLoyaltyConfig.id,
                loyalityGuest.id
            );
            if (!alreadyLinkedToProperty) {
                await creationGuestRepo.createPropertyLoyaltyGuest({
                    propertyLoyalityId: propertyLoyaltyConfig.id,
                    loyalityGuestId: loyalityGuest.id,
                });
            }

            // 5. Find CreationGuest for this loyalityGuestId + property's creationLoyaltyConfigId
            const creationGuest = await creationGuestRepo.checkIfGuestExist(
                propertyCreationConfigId,
                loyalityGuest.id
            );

            if (creationGuest) {
                // 5a. SAME creationLoyaltyConfigId — increment bookings + check upgrade
                const levels = await this.getLoyaltyLevels(propertyCreationConfigId);

                await this.incrementBookingsAndMaybeUpgrade(
                    creationGuest.id,
                    creationGuest.noOfBookings,
                    creationGuest.guestLevel,
                    levels
                );
            } else {
                // 5b. No CreationGuest for this config — create new one
                await creationGuestRepo.createCreationGuest({
                    loyalityGuestId: loyalityGuest.id,
                    creationLoyaltyConfigId: propertyCreationConfigId,
                    guestLevel: 1,
                    noOfBookings: 1,
                    metaData: {},
                });
            }
        } catch (error) {
            // loyalty is non-critical — log but don't bubble up
            console.error('handlePostBookingLoyalty error:', error);
        }
    }

    /**
     * Post-cancel loyalty handler — called after a reservation is cancelled.
     *
     * Flow:
     * 1. Find LoyalityGuest by email
     * 2. Get PropertyLoyaltyConfig → creationLoyaltyConfigId
     * 3. Find CreationGuest for same configId
     * 4. If found and noOfBookings > 0:
     *    - Decrement noOfBookings
     *    - Check if should downgrade level
     */
    public async handlePostCancelLoyalty(
        guestEmail: string,
        propertyId: string
    ): Promise<void> {
        try {
            const creationGuestRepo = new CreationGuestRepository();

            // 1. Get PropertyLoyaltyConfig for this property
            const propertyLoyaltyConfig = await this.getPropertyLoyaltyConfigByPropertyId(propertyId);
            if (!propertyLoyaltyConfig || !propertyLoyaltyConfig.isActive) return;

            const propertyCreationConfigId = propertyLoyaltyConfig.creationLoyaltyConfigId;

            // 2. Find LoyalityGuest by email
            const loyalityGuest = await prisma.loyalityGuest.findUnique({
                where: { guestEmail },
            });
            if (!loyalityGuest) return;

            // 3. Find CreationGuest for this config
            const creationGuest = await creationGuestRepo.checkIfGuestExist(
                propertyCreationConfigId,
                loyalityGuest.id
            );
            if (!creationGuest || creationGuest.noOfBookings <= 0) return;

            // 4. Decrement noOfBookings + check if should downgrade
            const newBookings = creationGuest.noOfBookings - 1;
            const levels = await this.getLoyaltyLevels(propertyCreationConfigId);

            // Find the current level definition
            const currentLevelDef = levels.find((l) => l.level === creationGuest.guestLevel);

            // Check if the guest should be downgraded:
            // If newBookings is now below the threshold for their current level, downgrade
            let newLevel = creationGuest.guestLevel;
            if (currentLevelDef && newBookings < currentLevelDef.noOfReservations) {
                // Find the highest level where threshold is still met
                const qualifiedLevels = levels.filter((l) => newBookings >= l.noOfReservations);
                newLevel = qualifiedLevels.length > 0
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
            // loyalty is non-critical — log but don't bubble up
            console.error('handlePostCancelLoyalty error:', error);
        }
    }
}

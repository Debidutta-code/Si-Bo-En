import { prisma } from "../../../config";
import { ICCreateCustomizableDeal, ICUpdateCustomizableDeal, IGetCustomizableDeal } from "../interfaces";

export class CustomizableDealDao {
    /**
     * Create a new customizable deal
     */
    public async createCustomizableDeal(
        propertyId: string,
        propertyCode: string,
        dealData: ICCreateCustomizableDeal
    ): Promise<IGetCustomizableDeal | Error> {
        try {
            const { applicableRoomTypes, applicableRatePlans, applicableAddons, ...dealInfo } = dealData;

            const createdDeal = await prisma.customizableDeal.create({
                data: {
                    propertyId,
                    propertyCode,
                    ...dealInfo,
                    CustomizableDealsApplicableRoomTypes: {
                        create: applicableRoomTypes.map(roomId => ({
                            roomId,
                            roomTypeCode: '' // Will be filled from Room data
                        }))
                    },
                    CustomizableDealsApplicableRatePlanTypes: {
                        create: applicableRatePlans.map(ratePlanId => ({
                            ratePlanId,
                            ratePlanCode: '' // Will be filled from RatePlan data
                        }))
                    },
                    CustomizableDealsApplicableAddons: {
                        create: applicableAddons.map(addOnId => ({
                            addOnId
                        }))
                    }
                },
                include: {
                    CustomizableDealsApplicableRoomTypes: {
                        include: {
                            Room: {
                                select: {
                                    id: true,
                                    roomName: true,
                                    roomType: true
                                }
                            }
                        }
                    },
                    CustomizableDealsApplicableRatePlanTypes: {
                        include: {
                            RatePlan: {
                                select: {
                                    id: true,
                                    ratePlanName: true,
                                    ratePlanCode: true
                                }
                            }
                        }
                    },
                    CustomizableDealsApplicableAddons: {
                        include: {
                            AddOn: {
                                select: {
                                    id: true,
                                    name: true,
                                    code: true
                                }
                            }
                        }
                    }
                }
            });

            // Update room type codes and rate plan codes
            await Promise.all([
                ...createdDeal.CustomizableDealsApplicableRoomTypes.map(rt =>
                    prisma.customizableDealsApplicableRoomTypes.update({
                        where: { id: rt.id },
                        data: { roomTypeCode: rt.Room.roomType }
                    })
                ),
                ...createdDeal.CustomizableDealsApplicableRatePlanTypes.map(rp =>
                    prisma.customizableDealsApplicableRatePlanTypes.update({
                        where: { id: rp.id },
                        data: { ratePlanCode: rp.RatePlan.ratePlanCode }
                    })
                )
            ]);

            return createdDeal as any;
        } catch (error) {
            console.error('Repository Error:', error);
            throw new Error('Failed to create customizable deal');
        }
    }

    /**
     * Get all customizable deals by property ID
     */
    public async getCustomizableDealsByPropertyId(propertyId: string): Promise<IGetCustomizableDeal[] | Error> {
        try {
            const deals = await prisma.customizableDeal.findMany({
                where: { propertyId },
                include: {
                    CustomizableDealsApplicableRoomTypes: {
                        include: {
                            Room: {
                                select: {
                                    id: true,
                                    roomName: true,
                                    roomType: true
                                }
                            }
                        }
                    },
                    CustomizableDealsApplicableRatePlanTypes: {
                        include: {
                            RatePlan: {
                                select: {
                                    id: true,
                                    ratePlanName: true,
                                    ratePlanCode: true
                                }
                            }
                        }
                    },
                    CustomizableDealsApplicableAddons: {
                        include: {
                            AddOn: {
                                select: {
                                    id: true,
                                    name: true,
                                    code: true
                                }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            return deals as any;
        } catch (error) {
            throw new Error('Failed to fetch customizable deals');
        }
    }

    /**
     * Get single customizable deal by ID
     */
    public async getCustomizableDealById(dealId: string): Promise<IGetCustomizableDeal | null> {
        try {
            const deal = await prisma.customizableDeal.findUnique({
                where: { id: dealId },
                include: {
                    CustomizableDealsApplicableRoomTypes: {
                        include: {
                            Room: {
                                select: {
                                    id: true,
                                    roomName: true,
                                    roomType: true
                                }
                            }
                        }
                    },
                    CustomizableDealsApplicableRatePlanTypes: {
                        include: {
                            RatePlan: {
                                select: {
                                    id: true,
                                    ratePlanName: true,
                                    ratePlanCode: true
                                }
                            }
                        }
                    },
                    CustomizableDealsApplicableAddons: {
                        include: {
                            AddOn: {
                                select: {
                                    id: true,
                                    name: true,
                                    code: true
                                }
                            }
                        }
                    }
                }
            });

            return deal as any;
        } catch (error) {
            throw new Error('Failed to fetch customizable deal');
        }
    }

    /**
     * Update customizable deal
     */
    public async updateCustomizableDeal(
        dealId: string,
        updateData: ICUpdateCustomizableDeal
    ): Promise<IGetCustomizableDeal | Error> {
        try {
            const { applicableRoomTypes, applicableRatePlans, applicableAddons, ...dealInfo } = updateData;

            // Start transaction
            const updatedDeal = await prisma.$transaction(async (tx) => {
                // Update basic deal info
                const deal = await tx.customizableDeal.update({
                    where: { id: dealId },
                    data: dealInfo
                });

                // Update room types if provided
                if (applicableRoomTypes) {
                    await tx.customizableDealsApplicableRoomTypes.deleteMany({
                        where: { customizableDealId: dealId }
                    });

                    const rooms = await tx.room.findMany({
                        where: { id: { in: applicableRoomTypes } },
                        select: { id: true, roomType: true }
                    });

                    await tx.customizableDealsApplicableRoomTypes.createMany({
                        data: rooms.map(room => ({
                            customizableDealId: dealId,
                            roomId: room.id,
                            roomTypeCode: room.roomType
                        }))
                    });
                }

                // Update rate plans if provided
                if (applicableRatePlans) {
                    await tx.customizableDealsApplicableRatePlanTypes.deleteMany({
                        where: { customizableDealId: dealId }
                    });

                    const ratePlans = await tx.ratePlan.findMany({
                        where: { id: { in: applicableRatePlans } },
                        select: { id: true, ratePlanCode: true }
                    });

                    await tx.customizableDealsApplicableRatePlanTypes.createMany({
                        data: ratePlans.map(rp => ({
                            customizableDealId: dealId,
                            ratePlanId: rp.id,
                            ratePlanCode: rp.ratePlanCode
                        }))
                    });
                }

                // Update addons if provided
                if (applicableAddons) {
                    await tx.customizableDealsApplicableAddons.deleteMany({
                        where: { customizableDealId: dealId }
                    });

                    await tx.customizableDealsApplicableAddons.createMany({
                        data: applicableAddons.map(addonId => ({
                            customizableDealId: dealId,
                            addOnId: addonId
                        }))
                    });
                }

                // Fetch updated deal with relations
                return await tx.customizableDeal.findUnique({
                    where: { id: dealId },
                    include: {
                        CustomizableDealsApplicableRoomTypes: {
                            include: {
                                Room: {
                                    select: {
                                        id: true,
                                        roomName: true,
                                        roomType: true
                                    }
                                }
                            }
                        },
                        CustomizableDealsApplicableRatePlanTypes: {
                            include: {
                                RatePlan: {
                                    select: {
                                        id: true,
                                        ratePlanName: true,
                                        ratePlanCode: true
                                    }
                                }
                            }
                        },
                        CustomizableDealsApplicableAddons: {
                            include: {
                                AddOn: {
                                    select: {
                                        id: true,
                                        name: true,
                                        code: true
                                    }
                                }
                            }
                        }
                    }
                });
            });

            return updatedDeal as any;
        } catch (error) {
            console.error('Update Error:', error);
            throw new Error('Failed to update customizable deal');
        }
    }

    /**
     * Delete customizable deal
     */
    public async deleteCustomizableDeal(dealId: string): Promise<IGetCustomizableDeal | Error> {
        try {
            const deletedDeal = await prisma.customizableDeal.delete({
                where: { id: dealId },
                include: {
                    CustomizableDealsApplicableRoomTypes: true,
                    CustomizableDealsApplicableRatePlanTypes: true,
                    CustomizableDealsApplicableAddons: true
                }
            });

            return deletedDeal as any;
        } catch (error) {
            throw new Error('Failed to delete customizable deal');
        }
    }
}
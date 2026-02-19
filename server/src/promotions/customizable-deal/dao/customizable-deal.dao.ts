import { IRooms } from "../../../agency/types";
import { prisma } from "../../../config";
import {
    ICCreateCustomizableDealR,
    ICustomizableDealWDetails,
    ICustomizableDeals,
    IRatePlan,
    IRoom,
    IAddOn

} from "../interfaces";

export class CustomizableDealDao {
    public async createCustomizableDeal(
        propertyId: string,
        propertyCode: string,
        dealData: ICCreateCustomizableDealR
    ): Promise<ICustomizableDealWDetails> {
        try {
            const { applicableRoomTypes, applicableRatePlans, applicableAddons, ...dealInfo } = dealData;

            const createdDeal = await prisma.customizableDeal.create({
                data: {
                    propertyId,
                    propertyCode,
                    ...dealInfo,
                    CustomizableDealsApplicableRoomTypes: {
                        create: applicableRoomTypes.map(room => ({
                            roomId: room.id,
                            roomTypeCode: room.roomType
                        }))
                    },
                    CustomizableDealsApplicableRatePlanTypes: {
                        create: applicableRatePlans.map(ratePlan => ({
                            ratePlanId: ratePlan.id,
                            ratePlanCode: ratePlan.ratePlanCode
                        }))
                    },
                    CustomizableDealsApplicableAddons: {
                        create: applicableAddons.map(addOn => ({
                            addOnId: addOn.id
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

            return createdDeal;
        } catch (error) {
            console.error('Repository Error:', error);
            throw new Error('Failed to create customizable deal');
        }
    }

    /**
     * Get all customizable deals by property ID
     */
    public async getCustomizableDealsByPropertyId(propertyId: string): Promise<ICustomizableDealWDetails[] | Error> {
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

    public async getCustomizableDealById(dealId: string): Promise<ICustomizableDealWDetails | null> {
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

    public async updateCustomizableDeal(
        dealId: string,
        updateData: ICCreateCustomizableDealR
    ): Promise<ICustomizableDeals > {
        try {
            const { applicableRoomTypes, applicableRatePlans, applicableAddons, ...dealInfo } = updateData;

            const updatedDeal = await prisma.$transaction(async (tx) => {
                const deal = await tx.customizableDeal.update({
                    where: { id: dealId },
                    data: dealInfo,
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
                });
                //delete all applicableRoomTypes,rateplans and addons
                await Promise.all([
                    applicableRoomTypes && tx.customizableDealsApplicableRoomTypes.deleteMany({
                        where: { customizableDealId: dealId }
                    }),
                    applicableRatePlans && tx.customizableDealsApplicableRatePlanTypes.deleteMany({
                        where: { customizableDealId: dealId }
                    }),
                    applicableAddons && tx.customizableDealsApplicableAddons.deleteMany({
                        where: { customizableDealId: dealId }
                    })
                ]);
                //create the new applicableRoomTypes, ratePlans and addons
                await Promise.all([
                    applicableRoomTypes && tx.customizableDealsApplicableRoomTypes.createMany({
                        data: updateData.applicableRoomTypes.map(room => ({
                            customizableDealId: dealId,
                            roomId: room.id,
                            roomTypeCode: room.roomType
                        }))
                    }),
                    applicableRatePlans && tx.customizableDealsApplicableRatePlanTypes.createMany({
                        data: updateData.applicableRatePlans.map(ratePlan => ({
                            customizableDealId: dealId,
                            ratePlanId: ratePlan.id,
                            ratePlanCode: ratePlan.ratePlanCode
                        }))
                    }),
                    applicableAddons && tx.customizableDealsApplicableAddons.createMany({
                        data: updateData.applicableAddons.map(addOn => ({
                            customizableDealId: dealId,
                            addOnId: addOn.id
                        }))
                    })
                ]);
                return deal
            });

            return updatedDeal;
        } catch (error) {
            throw new Error('Failed to update customizable deal');
        }
    }

    public async deleteCustomizableDeal(dealId: string): Promise<ICustomizableDeals > {
        try {
            const deletedDeal = await prisma.customizableDeal.delete({
                where: { id: dealId },
                
            });

            return deletedDeal ;
        } catch (error) {
            throw new Error('Failed to delete customizable deal');
        }
    }
    public async findRoomTypes(roomTypes: string[], propertyId: string):Promise<IRooms[]> {
        try {
            const rooms = await prisma.room.findMany({
                where: {
                    id: { in: roomTypes },
                    propertyId
                }
            });
            return rooms;
        } catch (error) {
            console.error('Error finding room types:', error);
            throw new Error('Failed to find room types');
        }
    }
    public async findRatePlans(ratePlanIds: string[], propertyId: string):Promise<IRatePlan[]> {
        try {
            const ratePlans = await prisma.ratePlan.findMany({
                where: {
                    id: { in: ratePlanIds },
                    propertyId
                }
            });
            return ratePlans;
        } catch (error) {
            console.error('Error finding rate plans:', error);
            throw new Error('Failed to find rate plans');
        }
    }
    public async findAddons(addonIds: string[], propertyId: string):Promise<IAddOn[]> {
        try {
            const addons = await prisma.addon.findMany({
                where: {
                    id: { in: addonIds },
                    propertyId
                }
            });
            return addons;
        } catch (error) {
            console.error('Error finding addons:', error);
            throw new Error('Failed to find addons');
        }
    }

}
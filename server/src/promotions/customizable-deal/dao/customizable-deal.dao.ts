import { prisma } from '../../../config';
import {
    ICCreateCustomizableDealR,
    ICustomizableDealWDetails,
    ICustomizableDeals,
    IRatePlan,
    IRoom,
    IAddOn,
} from '../interfaces';

const dealInclude = {
    Room: {
        select: { id: true, roomName: true, roomType: true },
    },
    RatePlan: {
        select: { id: true, ratePlanName: true, ratePlanCode: true },
    },
    CustomizableDealsApplicableAddons: {
        include: {
            AddOn: {
                select: { id: true, name: true, code: true },
            },
        },
    },
} as const;

export class CustomizableDealDao {
    public async createCustomizableDeal(
        propertyId: string,
        propertyCode: string,
        dealData: ICCreateCustomizableDealR
    ): Promise<ICustomizableDealWDetails> {
        try {
            const { applicableAddons, ...dealInfo } = dealData;

            return (await prisma.customizableDeal.create({
                data: {
                    propertyId,
                    propertyCode,
                    ...dealInfo,
                    CustomizableDealsApplicableAddons: {
                        create: applicableAddons.map(addon => ({
                            addOnId: addon.id,
                        })),
                    },
                },
                include: dealInclude,
            })) as any;
        } catch (error) {
            console.error('DAO Error - createCustomizableDeal:', error);
            throw new Error('Failed to create customizable deal');
        }
    }

    public async getCustomizableDealsByPropertyId(
        propertyId: string
    ): Promise<ICustomizableDealWDetails[]> {
        try {
            return (await prisma.customizableDeal.findMany({
                where: { propertyId },
                include: dealInclude,
                orderBy: { createdAt: 'desc' },
            })) as any;
        } catch (error) {
            throw new Error('Failed to fetch customizable deals');
        }
    }

    public async getCustomizableDealById(
        dealId: string
    ): Promise<ICustomizableDealWDetails | null> {
        try {
            return (await prisma.customizableDeal.findUnique({
                where: { id: dealId },
                include: dealInclude,
            })) as any;
        } catch (error) {
            throw new Error('Failed to fetch customizable deal');
        }
    }

    public async updateCustomizableDeal(
        dealId: string,
        dealInfo: Omit<ICCreateCustomizableDealR, 'applicableAddons'> & {
            applicableAddons?: IAddOn[];
        }
    ): Promise<ICustomizableDealWDetails> {
        try {
            const { applicableAddons, ...rest } = dealInfo;

            return (await prisma.$transaction(async tx => {
                if (applicableAddons) {
                    await tx.customizableDealsApplicableAddons.deleteMany({
                        where: { customizableDealId: dealId },
                    });
                    await tx.customizableDealsApplicableAddons.createMany({
                        data: applicableAddons.map(addon => ({
                            customizableDealId: dealId,
                            addOnId: addon.id,
                        })),
                    });
                }

                return tx.customizableDeal.update({
                    where: { id: dealId },
                    data: rest,
                    include: dealInclude,
                });
            })) as any;
        } catch (error) {
            throw new Error('Failed to update customizable deal');
        }
    }

    public async deleteCustomizableDeal(
        dealId: string
    ): Promise<ICustomizableDeals> {
        try {
            return (await prisma.customizableDeal.delete({
                where: { id: dealId },
            })) as any;
        } catch (error) {
            throw new Error('Failed to delete customizable deal');
        }
    }

    public async findRoom(
        roomId: string,
        propertyId: string
    ): Promise<IRoom | null> {
        try {
            return await prisma.room.findFirst({
                where: {
                    id: roomId,
                    propertyId,
                    isDeleted: false,
                    available: true,
                },
                select: { id: true, roomName: true, roomType: true },
            });
        } catch (error) {
            throw new Error('Failed to find room');
        }
    }

    public async findRatePlan(
        ratePlanId: string,
        propertyId: string
    ): Promise<IRatePlan | null> {
        try {
            return await prisma.ratePlan.findFirst({
                where: { id: ratePlanId, propertyId },
                select: { id: true, ratePlanName: true, ratePlanCode: true },
            });
        } catch (error) {
            throw new Error('Failed to find rate plan');
        }
    }

    public async findAddons(
        addonIds: string[],
        propertyId: string
    ): Promise<IAddOn[]> {
        try {
            return await prisma.addon.findMany({
                where: { id: { in: addonIds }, propertyId },
                select: { id: true, name: true, code: true },
            });
        } catch (error) {
            throw new Error('Failed to find addons');
        }
    }
}

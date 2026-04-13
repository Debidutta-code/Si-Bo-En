import { prisma } from '../../config';
import {
    IAddOn,
    IRatePlan,
    ISelectedAddonsR,
} from '../types';
import { IMLOS } from '../../promotions/mlos/interfaces';
import { ICEbDsOftc } from '../../promotions/eb-ds-oftc/interfaces';
import { IPromoCode } from '../../ari/types/promoCode.type';
import { IPropertyLoyaltyConfig, ITCreationLoyality } from '../../loyalty/types';

export class PricingRepository {
    public async validateRatePlan(
        ratePlanCode: string,
        roomTypeCode: string,
        startDate: Date,
        endDate: Date,
        // includedAddons: string[]
    ): Promise<IRatePlan | null> {
        try {
            return await prisma.ratePlan.findUnique({
                where: {
                    ratePlanCode,
                },
                include: {
                    depositPolicy: true,
                    cancellationPolicy: true,
                    guaranteePolicy: true,
                    taxGroup: {
                        include: {
                            taxGroupRules: {
                                where: {
                                    taxRule: {
                                        validFrom: { lte: startDate },
                                        validTo: { gte: endDate },
                                    },
                                },
                                include: {
                                    taxRule: true,
                                },
                            },
                        },
                    },
                    Addons: {
                        // where: {
                        //     addonId: {
                        //         in: includedAddons,
                        //     },

                        // },
                        include: {
                            addon: {
                                include: {
                                    availability: {
                                        where: {
                                            date: {
                                                gte: startDate,
                                                lt: endDate,
                                            },
                                        },
                                    },
                                    ChildAddons: true
                                },
                            },
                        },
                    },

                    bookingOffsets: {
                        where: {
                            date: {
                                gte: startDate,
                                lt: endDate,
                            },
                        },
                    },

                    charges: {
                        where: {
                            isSaleStopped: false,
                            roomTypeCode: roomTypeCode,
                            date: {
                                gte: startDate,
                                lte: endDate,
                            },
                        },
                        include: {
                            baseGuestAmounts: true,
                            additionalGuestAmounts: true,
                        },
                    },
                    geoRatePlans: true,
                    
                    // customizableDeals:{
                    //     include:{
                    //         CustomizableDealsApplicableAddons:true
                    //     }
                    // }
                },
            });
        } catch (error) {
            console.log(error);
            throw new Error('Failed to validate rate plan');
        }
    }
    
    public async getMlos(mlosId: string[]): Promise<IMLOS[] | null> {
        try {
            return await prisma.ratePlanRule.findMany({
                where: {
                    id: { in: mlosId },
                    isActive: true,
                },
            });
        } catch (error) {
            throw new Error('Failed to get geo rate plan');
        }
    }
    public async getPromotions(promotionIds: string[]): Promise<ICEbDsOftc[]> {
        try {
            return await prisma.promotion.findMany({
                where: {
                    id: { in: promotionIds },
                    isActive: true,
                },
            });
        } catch (error) {
            throw new Error('Failed to get promotions');
        }
    }
    public async getAddons(
        selectedAddons: ISelectedAddonsR[]
    ): Promise<IAddOn[]> {
        try {
            const addons = await Promise.all(
                selectedAddons.map(async (singleAdd: ISelectedAddonsR) => {
                    return await prisma.addon.findUnique({
                        where: {
                            id: singleAdd.addOnId,
                            isActive: true,
                        },
                        include: {
                            availability: {
                                where: {
                                    date: { in: singleAdd.dates },
                                },
                            },
                            ChildAddons: true
                        },

                    });
                })
            );
            return addons.filter(addon => addon !== null) as IAddOn[];
        } catch (error) {
            throw new Error('Failed to get addons');
        }
    }
    public async getAutoAppliedPromotions(
        ratePlanId: string,
        startDate: Date,
        endDate: Date
    ): Promise<ICEbDsOftc[]> {
        try {
            return await prisma.promotion.findMany({
                where: {
                    ratePlanId,
                    isActive: true,
                    isAutoApplied: true,
                    OR: [
                        { validFrom: null },
                        { validFrom: { lte: startDate } },
                    ],
                    AND: [
                        {
                            OR: [
                                { validTo: null },
                                { validTo: { gte: endDate } },
                            ],
                        },
                    ],
                },
            });
        } catch (error) {
            throw new Error('Failed to get auto applied promotions');
        }
    }
    public async fetchAutoAppliedMLOS(
        ratePlanId: string,
        startDate: Date,
        endDate: Date
    ): Promise<IMLOS[]> {
        try {
            return await prisma.ratePlanRule.findMany({
                where: {
                    isAutoApplied: true,
                    isActive: true,
                    ratePlanId,
                    OR: [
                        { startDate: null },
                        { startDate: { lte: startDate } },
                    ],
                    AND: [
                        {
                            OR: [
                                { endDate: null },
                                { endDate: { gt: endDate } },
                            ],
                        },
                    ],
                },
            });
        } catch (error) {
            throw new Error('Failed to get auto applied MLOS');
        }
    }
    public async findPromoCode(code: string): Promise<IPromoCode | null> {
        try {
            return await prisma.promoCode.findUnique({
                where: {
                    code,
                    isActive: true,
                },
            });
        } catch (error) {
            throw new Error('Failed to fetch promocode details');
        }
    }
    public async findLoyalityGuest(
        guestEmail: string,
        propertyId: string
    ): Promise<boolean> {
        try {
            const isLoyalityGuest = await prisma.creationGuest.findFirst({
                where: {
                    // propertyId,
                    creationLoyaltyConfigId:propertyId,
                    LoyalityGuest: {
                        guestEmail
                    },
                },
            });
            return isLoyalityGuest ? true : false;
        } catch (error) {
            throw new Error('Failed to fetch loyality discount');
        }
    }
    public async findPropertyLoyalityConfig(
        propertyId: string
    ): Promise<IPropertyLoyaltyConfig | null> {
        try {
            return await prisma.propertyLoyaltyConfig.findUnique({
                where: {
                    propertyId: propertyId,
                    isActive: true,
                },
            });
        } catch (error) {
            throw new Error('Failed to fetch loyality discount');
        }
    }
    public async findLoyalityConfig(
        loyalityConfigId: string
    ): Promise<ITCreationLoyality | null> {
        try {
            return await prisma.creationLoyaltyConfig.findUnique({
                where: {
                    id: loyalityConfigId,
                },
            });
        } catch (error) {
            throw new Error('Failed to fetch loyality discount');
        }
    }
}

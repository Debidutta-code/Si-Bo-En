import { prisma } from '../../config';
import { IAddOn, ICustomizableDeal, IRatePlan, ISelectedAddonsR } from '../types';
import { IMLOS } from '../../promotions/mlos/interfaces';
import { ICEbDsOftc } from '../../promotions/eb-ds-oftc/interfaces';
import { IPromoCode } from '../../ari/types/promoCode.type';
import {
    IPropertyLoyaltyConfig,
    ITCreationLoyality,
    ILoyaltyDiscountData,
} from '../../loyalty/types';
import { IAgencyDetails } from '../../agent-paltform/room/types';

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
                                include: {
                                    taxRule: true,
                                },
                            },
                        },
                    },
                    // Addons: {
                    //     where: {
                    //         addonId: {
                    //             in: includedAddons,
                    //         },
                    //     },
                    //     include: {
                    //         addon: {
                    //             include: {
                    //                 availability: {
                    //                     where: {
                    //                         date: {
                    //                             gte: startDate,
                    //                             lt: endDate,
                    //                         },
                    //                     },
                    //                 },
                    //                 ChildAddons: true,
                    //             },
                    //         },
                    //     },
                    // },

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
                                lt: endDate,
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
            throw new Error('Failed to validate rate plan');
        }
    }
        public async getAgencyDetails(
            agencyId: string
        ): Promise<IAgencyDetails | null> {
            try {
                const agency = await prisma.agency.findUnique({
                    where: {
                        id: agencyId,
                        isDeleted: false,
                    },
                    select: {
                        id: true,
                        agencyName: true,
                        commissionType: true,
                        commissionValue: true,
                        commissionCurrency: true,
                    },
                });
    
                if (!agency) return null;
    
                return {
                    id: agency.id,
                    agencyName: agency.agencyName,
                    commissionType: agency.commissionType as 'percentage' | 'fixed',
                    commissionValue: agency.commissionValue,
                    commissionCurrency: agency.commissionCurrency,
                };
            } catch (error) {
                throw new Error('Failed to fetch agency details');
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
    public async getIncludedAddons(includedAddons: string[], startDate: Date, endDate: Date): Promise<IAddOn[]> {
        try {
            return await prisma.addon.findMany({
                where: {
                    id: { in: includedAddons },
                    isActive: true,
                },
                include: {
                    availability: {
                        where: {
                            date: {
                                gte: startDate,
                                lt: endDate,
                            },
                        }
                    },
                    ChildAddons: true,
                }
            });
        } catch (error) {
            throw new Error("Failed to fetch included addons")
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
                            ChildAddons: true,
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
                                { validTo: { gte: startDate } }, // debug here if the the problem arries with promotions
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
            const customer = await prisma.customers.findUnique({
                where: { email: guestEmail },
                select: { id: true },
            });
            if (!customer) return false;
            const isLoyalityGuest = await prisma.creationGuest.findFirst({
                where: {
                    creationLoyaltyConfigId: propertyId,
                    customerId: customer.id,
                },
            });
            return !!isLoyalityGuest;
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
    public async findLoyaltyDiscountData(
        loyalityEmail: string,
        propertyId: string
    ): Promise<ILoyaltyDiscountData | null> {
        try {
            const pc2 = await prisma.propertyLoyaltyConfig.findFirst({
                where: {
                    propertyId: propertyId,
                    isActive: true,
                    Property: {
                        propertyConfigs: {
                            isLoyaltyProgramEnabled: true
                        }
                    }
                },
                include: {
                    CreationLoyaltyConfig: {
                        include: {
                            BasicLoyaltyProgram: {
                                where: {
                                    isActive: true,
                                }
                            },
                            LoyalityLevels: true,
                            CreationGuest: {
                                where: {
                                    Customer: {
                                        email: loyalityEmail
                                    }
                                }
                            }
                        }
                    },
                    PropertyLoyalityGuests: {
                        where: {
                            Customer: {
                                email: loyalityEmail
                            }
                        }
                    }
                }
            })
            if (pc2 && pc2.CreationLoyaltyConfig.CreationGuest.length > 0) {
                const creationGuest = pc2.CreationLoyaltyConfig.CreationGuest[0];
                return {
                    guestLevel: creationGuest.guestLevel,
                    loyalityLevels: pc2.CreationLoyaltyConfig.LoyalityLevels ?? [],
                    fallback: pc2.CreationLoyaltyConfig.discountValue != null
                        ? {
                            value: pc2.CreationLoyaltyConfig.discountValue,
                            type: "percentage"
                        } : null
                };
            }
            else {
                const propertyLoyalty = await prisma.propertyLoyaltyConfig.findFirst({
                    where: {
                        propertyId: propertyId,
                        isActive: true,
                        Property: {
                            propertyConfigs: {
                                isLoyaltyProgramEnabled: true
                            }
                        }

                    },
                    include: {

                        CreationLoyaltyConfig: {

                            include: {
                                BasicLoyaltyProgram: {
                                    where: {
                                        isActive: true,

                                    }
                                },
                                LoyalityLevels: true
                            }
                        }
                    }
                })
                if (!propertyLoyalty ||
                    (propertyLoyalty.CreationLoyaltyConfig.BasicLoyaltyProgram &&
                        propertyLoyalty.CreationLoyaltyConfig.BasicLoyaltyProgram.isActive == false
                    )) {
                    return null;
                }
                return {
                    guestLevel: 1,
                    loyalityLevels: propertyLoyalty.CreationLoyaltyConfig.LoyalityLevels ?? [],
                    fallback: propertyLoyalty.CreationLoyaltyConfig.discountValue != null
                        ? {
                            value: propertyLoyalty.CreationLoyaltyConfig.discountValue,
                            type: "percentage"
                        } : null
                }
            }

        } catch (error) {
            console.error(error);
            throw new Error('Failed to fetch loyalty discount data');
        }
    }
    public async findCustomizableDeal(
        customizableDealId: string
    ): Promise<ICustomizableDeal | null> {
        try {
            const deals = await prisma.customizableDeal.findUnique({
                where: {
                    id: customizableDealId
                },
                include:{
                    CustomizableDealsApplicableAddons:{
                        include:{
                            AddOn:{
                                include:{
                                    availability:true,
                                    ChildAddons:true,
                                    category:true,
                                    addonVariant:true,
                                    subCategory:true
                                }
                            }
                        }
                    }
                }
            });
            return deals;
        } catch (error) {
            console.error(error);
            throw new Error('Failed to fetch customizable deals');
        }
    }
}

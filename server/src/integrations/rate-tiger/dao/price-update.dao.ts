// dao/price-update.dao.ts

import { prisma } from '../../../config';
import { CurrencyCode } from '../../../tax-system/interfaces/tourist-tax.type';

export class PriceUpdateDao {
    public static async propertyExists(propertyCode: string): Promise<boolean> {
        try {
            const property = await prisma.property.findUnique({
                where: { propertyCode },
                select: { id: true },
            });
            return !!property;
        } catch (error) {
            throw new Error('Failed to verify property existence');
        }
    }
    // Add to dao/price-update.dao.ts

    public static async getPropertyMeta(propertyCode: string): Promise<{ id: string } | null> {
        const property = await prisma.property.findUnique({
            where: { propertyCode },
            select: { id: true },
        });
        return property ?? null;
    }

    public static async getActiveTaxRulesForRatePlan(
        ratePlanCode: string,
        propertyCode: string
    ): Promise<Array<{ priority: number; type: string; value: number }>> {
        const ratePlan = await prisma.ratePlan.findFirst({
            where: {
                ratePlanCode,
                property: { propertyCode },
            },
            select: {
                taxGroup: {
                    select: {
                        isActive: true,
                        taxGroupRules: {
                            select: {
                                taxRule: {
                                    select: {
                                        priority: true,
                                        type: true,
                                        value: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });


        if (!ratePlan?.taxGroup?.isActive) return [];

        return ratePlan.taxGroup.taxGroupRules.map(r => ({
            priority: r.taxRule.priority,
            type: r.taxRule.type,
            value: r.taxRule.value,
        }));
    }
    // Add to dao/price-update.dao.ts

    public static async getRateTigerIntegrationConfig(
        propertyCode: string
    ): Promise<{
        amountsIncludeTax: boolean;
        amountBeforeTax: boolean;
        amountAfterTax: boolean;
    } | null> {
        const integration = await prisma.propertyIntegrations.findFirst({
            where: {
                isActive: true,
                Property: { propertyCode },
            },
            select: {
                amountBeforeTax: true,
                amountAfterTax: true,
                propertyIntegrationSecrets: {
                    where: {
                        RequiredField: { name: 'Amounts Include Tax' },
                    },
                    select: { value: true },
                },
            },
        });

        if (!integration) return null;

        const raw = integration.propertyIntegrationSecrets[0]?.value;
        return {
            amountsIncludeTax: raw === 'true' || raw === '1',
            amountBeforeTax: integration.amountBeforeTax,
            amountAfterTax: integration.amountAfterTax,
        };
    }
    public static async upsertCharge(params: {
        propertyCode: string;
        roomTypeCode: string;
        ratePlanCode: string;
        ratePlanName: string;
        roomTypeName: string;
        date: Date;
        currencyCode: CurrencyCode;
        baseByGuestAmounts: Array<{
            numberOfGuests: number;
            amountBeforeTax: number;
        }>;
        additionalGuestAmounts: Array<{
            ageQualifyingCode: string;
            amount: number;
        }>;
    }): Promise<void> {
        const {
            propertyCode,
            roomTypeCode,
            ratePlanCode,
            date,
            currencyCode,
            baseByGuestAmounts,
            additionalGuestAmounts,
            ratePlanName,
            roomTypeName,
        } = params;

        const existingCharge = await prisma.charge.findFirst({
            where: {
                propertyCode,
                roomTypeCode,
                ratePlanCode,
                date,
            },
            select: { id: true },
        });

        if (existingCharge) {
            await prisma.$transaction([
                prisma.chargeBaseByGuest.deleteMany({
                    where: { chargeId: existingCharge.id },
                }),
                prisma.chargeAdditionalGuest.deleteMany({
                    where: { chargeId: existingCharge.id },
                }),
                prisma.charge.update({
                    where: { id: existingCharge.id },
                    data: { currencyCode },
                }),
                prisma.chargeBaseByGuest.createMany({
                    data: baseByGuestAmounts.map(bg => ({
                        chargeId: existingCharge.id,
                        numberOfGuests: bg.numberOfGuests,
                        amountBeforeTax: bg.amountBeforeTax,
                    })),
                }),
                ...(additionalGuestAmounts.length > 0
                    ? [
                        prisma.chargeAdditionalGuest.createMany({
                            data: additionalGuestAmounts.map(ag => ({
                                chargeId: existingCharge.id,
                                ageQualifyingCode: ag.ageQualifyingCode,
                                amount: ag.amount,
                            })),
                        }),
                    ]
                    : []),
            ]);
        } else {
            await prisma.charge.create({
                data: {
                    propertyCode,
                    roomTypeCode,
                    ratePlanCode,
                    ratePlanName: ratePlanName,
                    roomTypeName: roomTypeName,
                    date,
                    currencyCode,
                    baseGuestAmounts: {
                        create: baseByGuestAmounts.map(bg => ({
                            numberOfGuests: bg.numberOfGuests,
                            amountBeforeTax: bg.amountBeforeTax,
                        })),
                    },
                    additionalGuestAmounts: {
                        create: additionalGuestAmounts.map(ag => ({
                            ageQualifyingCode: ag.ageQualifyingCode,
                            amount: ag.amount,
                        })),
                    },
                },
            });
        }
    }
    public static async getRatePlanName(ratePlanCode: string) {
        try {
            const ratePlan = await prisma.ratePlan.findUnique({
                where: { ratePlanCode },
                select: { ratePlanName: true },
            });
            return ratePlan?.ratePlanName;
        } catch (error) {
            throw new Error('Failed to get rate plan name');
        }
    }
    public static async getRoomTypeName(
        roomTypeCode: string,
        propertyCode: string
    ): Promise<string> {
        const roomType = await prisma.room.findFirst({
            where: {
                roomType: roomTypeCode,
                property: {
                    propertyCode: propertyCode,
                },
            },
            select: { roomName: true },
        });

        if (!roomType)
            throw new Error(
                `RoomType ${roomTypeCode} not found for property ${propertyCode}`
            );

        return roomType.roomName;
    }
}

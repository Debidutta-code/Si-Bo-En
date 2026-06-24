// src/integrations/channex/dao/channex.dao.ts

import { prisma } from '../../../config';
import { ChannexDynamicConfig } from '../types/channex.types';

export class ChannexDao {
    /**
     * Get Channex configuration for a property
     */
    public static async getChannexConfig(
        propertyId: string,
        integrationType: 'channel_manager' | 'pms'
    ): Promise<ChannexDynamicConfig | null> {
        try {
            const propertyIntegration = await prisma.propertyIntegrations.findFirst({
                where: {
                    propertyId,
                    isActive: true,
                    MasterIntegration: {
                        name: 'Channex',
                        type: integrationType,
                        isActive: true,
                    },
                },
                include: {
                    MasterIntegration: {
                        include: {
                            masterIntegrationURLFields: true,
                        },
                    },
                    propertyIntegrationSecrets: {
                        include: {
                            RequiredField: true,
                        },
                    },
                },
            });

            if (!propertyIntegration) {
                return null;
            }

            const secrets = propertyIntegration.propertyIntegrationSecrets;
            const apiKey = secrets.find(s => s.RequiredField.name === 'Channex API Key')?.value ?? '';
            const propertyIdSecret = secrets.find(s => s.RequiredField.name === 'Channex Property ID')?.value ?? '';
            const webhookSecret = secrets.find(s => s.RequiredField.name === 'Channex Webhook Secret')?.value;

            if (!apiKey || !propertyIdSecret) {
                return null;
            }

            const urlFields = propertyIntegration.MasterIntegration.masterIntegrationURLFields;
            const baseUrl = urlFields.find(f => f.name === 'Base URL')?.url ?? 'https://staging.channex.io';

            return {
                apiKey,
                propertyId: propertyIdSecret,
                webhookSecret,
                baseUrl,
            };
        } catch (error) {
            console.error('Failed to retrieve Channex configuration:', error);
            return null;
        }
    }

    /**
     * Resolve PMS property details using the Channex property UUID
     */
    public static async getPropertyByChannexPropertyId(
        channexPropertyId: string
    ): Promise<{ propertyId: string; propertyCode: string; propertyName: string } | null> {
        try {
            const secret = await prisma.propertyInregrationSecrets.findFirst({
                where: {
                    value: channexPropertyId,
                    RequiredField: {
                        name: 'Channex Property ID',
                    },
                    PropertyIntegration: {
                        isActive: true,
                        MasterIntegration: {
                            name: 'Channex',
                            isActive: true,
                        },
                    },
                },
                include: {
                    PropertyIntegration: {
                        include: {
                            Property: {
                                select: {
                                    id: true,
                                    propertyCode: true,
                                    propertyName: true,
                                },
                            },
                        },
                    },
                },
            });

            if (!secret) {
                return null;
            }

            const property = secret.PropertyIntegration.Property;
            return {
                propertyId: property.id,
                propertyCode: property.propertyCode,
                propertyName: property.propertyName,
            };
        } catch (error) {
            console.error('Failed to resolve property by Channex property ID:', error);
            return null;
        }
    }

    /**
     * Retrieve daily inventory levels for a date range
     */
    public static async getDailyInventory(
        propertyCode: string,
        roomTypeCode: string,
        startDate: Date,
        endDate: Date
    ): Promise<Array<{ date: Date; availability: number }>> {
        const inventories = await prisma.inventory.findMany({
            where: {
                propertyCode,
                roomTypeCode,
                date: { gte: startDate, lte: endDate },
            },
            select: {
                date: true,
                availability: true,
            },
            orderBy: { date: 'asc' },
        });
        return inventories;
    }

    /**
     * Retrieve daily charge/pricing rates for a date range
     */
    public static async getDailyCharges(
        propertyCode: string,
        roomTypeCode: string,
        ratePlanCode: string,
        startDate: Date,
        endDate: Date
    ): Promise<
        Array<{
            date: Date;
            isSaleStopped: boolean;
            isClosedToArrival: boolean;
            isClosedToDeparture: boolean;
            amountBeforeTax?: number;
        }>
    > {
        const charges = await prisma.charge.findMany({
            where: {
                propertyCode,
                roomTypeCode,
                ratePlanCode,
                date: { gte: startDate, lte: endDate },
            },
            select: {
                date: true,
                isSaleStopped: true,
                isClosedToArrival: true,
                isClosedToDeparture: true,
            },
            orderBy: { date: 'asc' },
        });

        // Resolve rate from baseGuestAmounts
        const detailedCharges = await Promise.all(
            charges.map(async charge => {
                const existing = await prisma.charge.findFirst({
                    where: { propertyCode, roomTypeCode, ratePlanCode, date: charge.date },
                    include: {
                        baseGuestAmounts: {
                            take: 1,
                        },
                    },
                });
                return {
                    date: charge.date,
                    isSaleStopped: charge.isSaleStopped,
                    isClosedToArrival: charge.isClosedToArrival,
                    isClosedToDeparture: charge.isClosedToDeparture,
                    amountBeforeTax: existing?.baseGuestAmounts[0]?.amountBeforeTax ?? undefined,
                };
            })
        );

        return detailedCharges;
    }

    /**
     * Upsert daily inventory count (Availability)
     */
    public static async upsertInventory(
        params: {
            propertyCode: string;
            roomTypeCode: string;
            date: Date;
            availability: number;
        },
        tx?: any
    ): Promise<void> {
        const { propertyCode, roomTypeCode, date, availability } = params;
        const client = tx || prisma;

        const existingInv = await client.inventory.findFirst({
            where: { propertyCode, roomTypeCode, date },
            select: { id: true },
        });

        if (existingInv) {
            await client.inventory.update({
                where: { id: existingInv.id },
                data: { availability },
            });
        } else {
            await client.inventory.create({
                data: {
                    propertyCode,
                    roomTypeCode,
                    date,
                    availability,
                },
            });
        }
    }

    /**
     * Upsert charge rates, restrictions, and stay controls (Rates/Restrictions)
     */
    public static async upsertCharge(
        params: {
            propertyCode: string;
            roomTypeCode: string;
            ratePlanCode: string;
            date: Date;
            amount?: number;
            rates?: Array<{ rate: number; occupancy?: number }>;
            currencyCode?: string;
            isSaleStopped?: boolean;
            isClosedToArrival?: boolean;
            isClosedToDeparture?: boolean;
            minLos?: number;
            maxLos?: number;
        },
        tx?: any
    ): Promise<void> {
        const {
            propertyCode,
            roomTypeCode,
            ratePlanCode,
            date,
            amount,
            rates,
            currencyCode,
            isSaleStopped,
            isClosedToArrival,
            isClosedToDeparture,
            minLos,
            maxLos,
        } = params;
        const client = tx || prisma;

        const existing = await client.charge.findFirst({
            where: { propertyCode, roomTypeCode, ratePlanCode, date },
            select: { id: true },
        });

        const restrictionData = {
            ...(isSaleStopped !== undefined && { isSaleStopped }),
            ...(isClosedToArrival !== undefined && { isClosedToArrival }),
            ...(isClosedToDeparture !== undefined && { isClosedToDeparture }),
        };

        const rateArray = rates && rates.length > 0
            ? rates
            : (amount !== undefined ? [{ rate: amount, occupancy: 1 }] : []);

        if (existing) {
            // Update restriction flags
            await client.charge.update({
                where: { id: existing.id },
                data: restrictionData,
            });

            // Update price if rates are passed
            if (rateArray.length > 0) {
                // Delete existing baseGuestAmounts and recreate
                await client.chargeBaseByGuest.deleteMany({
                    where: { chargeId: existing.id },
                });
                await client.chargeBaseByGuest.createMany({
                    data: rateArray.map(r => ({
                        chargeId: existing.id,
                        numberOfGuests: r.occupancy || 1,
                        amountBeforeTax: r.rate,
                    })),
                });
                if (currencyCode) {
                    await client.charge.update({
                        where: { id: existing.id },
                        data: { currencyCode: currencyCode as any },
                    });
                }
            }
        } else {
            // Create new charge record
            const room = await client.room.findFirst({
                where: { roomType: roomTypeCode, property: { propertyCode } },
                select: { roomName: true },
            });
            const ratePlan = await client.ratePlan.findFirst({
                where: { ratePlanCode, property: { propertyCode } },
                select: { ratePlanName: true },
            });

            const roomTypeName = room?.roomName ?? roomTypeCode;
            const ratePlanName = ratePlan?.ratePlanName ?? ratePlanCode;

            const newCharge = await client.charge.create({
                data: {
                    propertyCode,
                    roomTypeCode,
                    ratePlanCode,
                    ratePlanName,
                    roomTypeName,
                    date,
                    currencyCode: (currencyCode || 'AED') as any,
                    ...restrictionData,
                },
            });

            if (rateArray.length > 0) {
                await client.chargeBaseByGuest.createMany({
                    data: rateArray.map(r => ({
                        chargeId: newCharge.id,
                        numberOfGuests: r.occupancy || 1,
                        amountBeforeTax: r.rate,
                    })),
                });
            }
        }

        // Handle length of stay rules (minLos, maxLos)
        if (minLos !== undefined || maxLos !== undefined) {
            const ratePlan = await client.ratePlan.findFirst({
                where: { ratePlanCode, property: { propertyCode } },
                select: { id: true },
            });
            if (ratePlan) {
                await client.ratePlanRule.upsert({
                    where: { ratePlanId: ratePlan.id },
                    update: {
                        startDate: date,
                        endDate: date,
                        ...(minLos !== undefined && { minLos }),
                        ...(maxLos !== undefined && { maxLos }),
                    },
                    create: {
                        ratePlanId: ratePlan.id,
                        startDate: date,
                        endDate: date,
                        minLos: minLos ?? 1,
                        maxLos: maxLos ?? 0,
                        isActive: true,
                    },
                });
            }
        }
    }
}

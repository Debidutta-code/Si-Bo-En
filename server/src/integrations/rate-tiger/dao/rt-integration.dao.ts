// src/integrations/rate-tiger/dao/rt-integration.dao.ts

import { prisma } from '../../../config';

export interface RTIntegrationConfig {
    authUrl: string;
    reservationUrl: string;
    partnerId: string;
    partnerName: string;
    rateTigerPropertyCode: string; // ✅ ADD THIS
}

export class RTIntegrationDao {
    /**
     * Get RateTiger integration config for a property
     * @param propertyId - The property ID
     * @param integrationType - 'channel_manager' or 'pms'
     * @returns RT config with URLs and RateTiger Property Code, or null
     */
    public static async getRTConfig(
        propertyId: string,
        integrationType: 'channel_manager' | 'pms'
    ): Promise<RTIntegrationConfig | null> {
        try {
            // 1. Find active property integration for RateTiger
            const propertyIntegration =
                await prisma.propertyIntegrations.findFirst({
                    where: {
                        propertyId,
                        isActive: true,
                        MasterIntegration: {
                            name: 'Rate Tiger',
                            type: integrationType,
                            isActive: true,
                        },
                    },
                    include: {
                        MasterIntegration: {
                            include: {
                                masterIntegrationURLFields: true, // Auth + Reservation URLs
                                requiredFieldsForMasterIntegration: true, // To match field names
                            },
                        },
                        propertyIntegrationSecrets: {
                            include: {
                                RequiredField: true, // Get field name
                            },
                        },
                    },
                });

            if (!propertyIntegration) {
                console.log(
                    `❌ No active RateTiger integration found for property ${propertyId}`
                );
                return null;
            }

            // 2. Extract URLs
            const urlFields =
                propertyIntegration.MasterIntegration
                    .masterIntegrationURLFields;
            const authUrl =
                urlFields.find(f => f.name === 'Authentication')?.url ?? '';
            const reservationUrl =
                urlFields.find(f => f.name === 'Reservation')?.url ?? '';

            if (!authUrl || !reservationUrl) {
                console.log(
                    `❌ Missing Auth or Reservation URL for RateTiger integration`
                );
                return null;
            }

            // 3. ✅ Extract RateTiger Property Code from secrets
            const rateTigerPropertyCodeSecret =
                propertyIntegration.propertyIntegrationSecrets.find(
                    secret =>
                        secret.RequiredField.name === 'Rate Tiger Property Code'
                );

            if (
                !rateTigerPropertyCodeSecret ||
                !rateTigerPropertyCodeSecret.value
            ) {
                console.log(
                    `❌ RateTiger Property Code not found for property ${propertyId}`
                );
                return null;
            }

            const rateTigerPropertyCode = rateTigerPropertyCodeSecret.value;

            console.log(`✅ RateTiger config found:`, {
                propertyId,
                rateTigerPropertyCode,
                authUrl,
                reservationUrl,
            });

            return {
                authUrl,
                reservationUrl,
                partnerId: '', // Still using env fallback
                partnerName: '', // Still using env fallback
                rateTigerPropertyCode, // ✅ NEW
            };
        } catch (error) {
            console.error('Failed to fetch RT integration config:', error);
            return null;
        }
    }

    public static async getPropertyCodeByRTCode(
        rateTigerPropertyCode: string
    ): Promise<{ propertyId: string; propertyCode: string } | null> {
        try {
            // Find the secret where value = rateTigerPropertyCode
            // Temporary debug — add this before your findFirst
            const secret = await prisma.propertyInregrationSecrets.findFirst({
                where: {
                    value: rateTigerPropertyCode,
                    RequiredField: {
                        name: 'Rate Tiger Property Code',
                    },
                    PropertyIntegration: {
                        isActive: true,
                        MasterIntegration: {
                            name: 'Rate Tiger',
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
                                },
                            },
                        },
                    },
                },
            });

            if (!secret) {
                console.log(
                    `❌ No property found for RT code: ${rateTigerPropertyCode}`
                );
                return null;
            }

            const property = secret.PropertyIntegration.Property;

            console.log(
                `✅ Resolved RT code ${rateTigerPropertyCode} → propertyCode: ${property.propertyCode}`
            );

            return {
                propertyId: property.id,
                propertyCode: property.propertyCode,
            };
        } catch (error) {
            console.error('Failed to resolve RT property code:', error);
            return null;
        }
    }
}

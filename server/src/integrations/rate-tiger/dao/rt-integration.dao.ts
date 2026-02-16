import { prisma } from '../../../config';

export interface RTIntegrationConfig {
    authUrl: string;
    reservationUrl: string;
    partnerId: string;
    partnerName: string;
}

export class RTIntegrationDao {

    public static async getRTConfig(
        propertyId: string,
        integrationType: 'channel_manager' | 'pms'
    ): Promise<RTIntegrationConfig | null> {
        try {
            // 1. Find active property integration for this property
            // where master integration name is 'Rate Tiger' and type matches
            const propertyIntegration = await prisma.propertyIntegrations.findFirst({
                where: {
                    propertyId,
                    isActive: true,
                    MasterIntegration: {
                        name: 'Rate Tiger',
                        type: integrationType === 'channel_manager'
                            ? 'channel_manager'
                            : 'pms',
                        isActive: true,
                    },
                },
                include: {
                    MasterIntegration: {
                        include: {
                            masterIntegrationURLFields: true, // Auth + Reservation URLs
                        },
                    },
                },
            });

            if (!propertyIntegration) return null;

            const urlFields = propertyIntegration.MasterIntegration.masterIntegrationURLFields;

            // 2. Extract Auth and Reservation URLs by name
            const authUrl = urlFields.find(f => f.name === 'Authentication')?.url ?? '';
            const reservationUrl = urlFields.find(f => f.name === 'Reservation')?.url ?? '';

            if (!authUrl || !reservationUrl) return null;

            return {
                authUrl,
                reservationUrl,
                // Secrets skipped for now — using env as fallback
                partnerId: '',
                partnerName: '',
            };
        } catch (error) {
            console.error('Failed to fetch RT integration config:', error);
            return null;
        }
    }
}
// dao/sm-integration.dao.ts

import { prisma } from '../../../config';

export interface SMIntegrationConfig {
    reservationUrl: string;
    partnerId: string;
    partnerName: string;
    siteMinderPropertyCode: string;
}

export class SMIntegrationDao {

public static async getSiteMinderConfig(
    propertyId: string,
    integrationType: 'channel_manager' | 'pms'
): Promise<{ siteMinderPropertyCode: string; channelCode: string; channelName: string; reservationUrl: string } | null> {
    try {
        const propertyIntegration = await prisma.propertyIntegrations.findFirst({
            where: {
                propertyId,
                isActive: true,
                MasterIntegration: {
                    name: 'Site Minder',
                    type: integrationType,
                    isActive: true,
                },
            },
            include: {
                MasterIntegration: {
                    include: { masterIntegrationURLFields: true },
                },
                propertyIntegrationSecrets: {
                    include: { RequiredField: true },
                },
            },
        });

        if (!propertyIntegration) return null;

        const siteMinderPropertyCode = propertyIntegration.propertyIntegrationSecrets
            .find(s => s.RequiredField.name === 'Site Minder Property Code')?.value ?? '';

        if (!siteMinderPropertyCode) return null;

        return {
            siteMinderPropertyCode,
            channelCode: 'SM',      // or from secrets if stored
            channelName: 'SiteMinder',
            reservationUrl: propertyIntegration.MasterIntegration
                .masterIntegrationURLFields
                .find(f => f.name === 'Reservation')?.url ?? '',
        };
    } catch {
        return null;
    }
}
}
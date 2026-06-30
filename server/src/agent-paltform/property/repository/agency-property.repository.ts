import { prisma } from '../../../config';
import { IProperty } from '../types';

export class AgenticPropertyRepository {
 public async getAgenticProperties(
    agencyId: string,
    location?: string,
    country?: string
): Promise<IProperty[]> {
    try {
        let matchedPropertyIds: string[] | null = null;

        if (location) {
            const normalizedLocation = location.replace(/\s+/g, '').toLowerCase();
            const normalizedCountry = country?.replace(/\s+/g, '').toLowerCase();

            let rows: { property_id: string }[] = [];

            if (normalizedCountry) {
                rows = await prisma.$queryRaw<{ property_id: string }[]>`
                    SELECT pa."property_id"
                    FROM "property_addresses" pa
                    WHERE LOWER(REPLACE(pa.city, ' ', '')) = ${normalizedLocation}
                    AND LOWER(REPLACE(pa.country, ' ', '')) = ${normalizedCountry}
                `;
            } else {
                rows = await prisma.$queryRaw<{ property_id: string }[]>`
                    SELECT pa."property_id"
                    FROM "property_addresses" pa
                    WHERE LOWER(REPLACE(pa.city, ' ', '')) = ${normalizedLocation}
                `;
            }

            matchedPropertyIds = rows.map((r) => r.property_id);

            // No address matched — return empty early, skip findMany
            if (matchedPropertyIds.length === 0) return [];
        }

        return await prisma.property.findMany({
            where: {
                agenticProperties: {
                    some: { agencyId },
                },
                ...(matchedPropertyIds !== null && {
                    id: { in: matchedPropertyIds },
                }),
            },
            include: {
                propertyAddress: true,
                propertyAmenities: { include: { amenity: true } },
                propertyCategory: { include: { masterCategory: true } },
                propertyType: { include: { masterPropertyType: true } },
                propertyVideos: true,
                propertyConfigs: true,
            },
        });
    } catch (error) {
        throw new Error('Failed to retrieve properties');
    }
}

    public async getAgenticPropertyById(agencyId: string, propertyId: string) {
        try {
            return await prisma.agenticProperty.findFirst({
                where: {
                    propertyId,
                    agencyId,
                    isActive: true,
                    isDeleted: false,
                },
                include: {
                    Property: {
                        include: {
                            propertyAddress: true,
                            propertyAmenities: { include: { amenity: true } },
                            propertyCategory: {
                                include: { masterCategory: true },
                            },
                            propertyType: {
                                include: { masterPropertyType: true },
                            },
                            propertyVideos: true,
                            propertyConfigs: true,
                        },
                    },
                },
            });
        } catch (error) {
            throw new Error('Failed to retrieve property');
        }
    }

    // ✅ Fetch agency directly — commission fields live here
    public async getAgencyById(agencyId: string) {
        try {
            return await prisma.agency.findFirst({
                where: {
                    id: agencyId,
                    isDeleted: false,
                },
            });
        } catch (error) {
            throw new Error('Failed to retrieve agency');
        }
    }
}
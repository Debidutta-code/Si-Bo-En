import { prisma } from '../../../config';
import { IProperty } from '../types';

export class AgenticPropertyRepository {
    public async getAgenticProperties(agencyId: string): Promise<IProperty[]> {
        try {
            return await prisma.property.findMany({
                where: {
                    agenticProperties: {
                        some: { agencyId },
                    },
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

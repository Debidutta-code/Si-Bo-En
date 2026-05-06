import { prisma } from '../../../config';
import { HotelFilterQuery } from '../types';

export class HotelRepository {
    public static async getPaginatedHotels(filters: HotelFilterQuery) {
        const {
            page = '1',
            limit = '10',
            search,
            city,
            country,
            starRating,
            amenities,
            propertyType,
            propertyCategory,
        } = filters;
        const pageNumber = parseInt(page, 10);
        const pageSize = parseInt(limit, 10);
        const skip = (pageNumber - 1) * pageSize;

        // Build where clause
        const where: any = {
            isDeleted: false,
            propertyConfigs: {
                isAvailableForOTA: true
            }
        };

        if (search) {
            where.OR = [
                { propertyName: { contains: search, mode: 'insensitive' } },
                { propertyCode: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (starRating) {
            const ratings = starRating.split(',').map(r => parseFloat(r));
            where.starRating = { in: ratings };
        }

        // Filtering by related propertyAddress fields
        if (city || country) {
            where.propertyAddress = { is: {} };
            if (city) {
                where.propertyAddress.is.city = {
                    equals: city,
                    mode: 'insensitive',
                };
            }
            if (country) {
                where.propertyAddress.is.country = {
                    equals: country,
                    mode: 'insensitive',
                };
            }
        }

        // Filtering by amenities
        if (amenities) {
            const amenityIds = amenities.split(',');
            where.propertyAmenities = {
                some: {
                    amenityId: { in: amenityIds },
                },
            };
        }

        // Filtering by property type
        if (propertyType) {
            const types = propertyType.split(',').map(t => t.trim()).filter(Boolean);
            if (types.length > 0) {
                where.propertyType = {
                    masterPropertyType: {
                        OR: types.map(t => ({
                            propertyTypeName: {
                                equals: t,
                                mode: 'insensitive',
                            },
                        })),
                    },
                };
            }
        }

        // Filtering by property category
        if (propertyCategory) {
            const categories = propertyCategory.split(',').map(c => c.trim()).filter(Boolean);
            if (categories.length > 0) {
                where.propertyCategory = {
                    masterCategory: {
                        categoryName: { in: categories },
                    },
                };
            }
        }

        const [properties, totalCount] = await Promise.all([
            prisma.property.findMany({
                where,
                skip,
                take: pageSize,
                select: {
                    id: true,
                    propertyCode: true,
                    propertyName: true,
                    propertyEmail: true,
                    propertyContact: true,
                    starRating: true,
                    description: true,
                    image: true,
                    propertyAddress: {
                        select: {
                            city: true,
                            state: true,
                            country: true,
                            latitude: true,
                            longitude: true,
                        },
                    },
                    propertyType: {
                        select: {
                            masterPropertyType: {
                                select: {
                                    propertyTypeName: true,
                                },
                            },
                        },
                    },
                    propertyAmenities: {
                        select: {
                            amenity: {
                                select: {
                                    id: true,
                                    amenityName: true,
                                    icon: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            prisma.property.count({ where }),
        ]);

        return {
            properties,
            pagination: {
                totalCount,
                currentPage: pageNumber,
                totalPages: Math.ceil(totalCount / pageSize),
                pageSize,
            },
        };
    }
}

import { prisma } from '../../../config';
import { HotelFilterQuery, IRepoProperty, IRepoRes } from '../types';

export class HotelRepository {
    public async getPaginatedHotels(filters: HotelFilterQuery): Promise<IRepoRes> {
        const {
            page = '1',
            limit = '10',
            search,
            city,
            country,
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
                isAvailableForOTA: true,
            },
        };

        if (search) {
            where.OR = [
                { propertyName: { contains: search, mode: 'insensitive' } },
                { propertyCode: { contains: search, mode: 'insensitive' } },
            ];
        }

       

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
            const amenityList = amenities.split(',').map(a => a.trim()).filter(Boolean);
            if (amenityList.length > 0) {
                where.propertyAmenities = {
                    some: {
                        OR: [
                            { amenityId: { in: amenityList } },
                            {
                                amenity: {
                                    OR: amenityList.map(a => ({
                                        amenityName: {
                                            equals: a,
                                            mode: 'insensitive',
                                        },
                                    })),
                                },
                            },
                        ],
                    },
                };
            }
        }

        // Filtering by property type
        if (propertyType) {
            const types = propertyType
                .split(',')
                .map(t => t.trim())
                .filter(Boolean);
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
            const categories = propertyCategory
                .split(',')
                .map(c => c.trim())
                .filter(Boolean);
            if (categories.length > 0) {
                where.propertyCategory = {
                    masterCategory: {
                        OR: categories.map(c => ({
                            categoryName: {
                                equals: c,
                                mode: 'insensitive',
                            },
                        })),
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


    public async getAutocompleteLocations(filters: HotelFilterQuery):Promise<IRepoRes> {
        const {
            page = '1',
            limit = '10',
            search,
            city,
            country,
            amenities,
            propertyType,
            propertyCategory,
        } = filters;

        const query = search || city;

        const pageNumber = parseInt(page, 10);
        const pageSize = parseInt(limit, 10);
        const offset = (pageNumber - 1) * pageSize;


        const where: any = {
            isDeleted: false,
            propertyConfigs: {
                isAvailableForOTA: true,
            },
        };

        if (country) {
            where.propertyAddress = {
                is: {
                    country: {
                        contains: country,
                        mode: 'insensitive',
                    },
                },
            };
        }

       

        // Amenities
        if (amenities) {
            const amenityList = amenities
                .split(',')
                .map(a => a.trim())
                .filter(Boolean);

            if (amenityList.length > 0) {
                where.propertyAmenities = {
                    some: {
                        OR: [
                            {
                                amenityId: {
                                    in: amenityList,
                                },
                            },
                            {
                                amenity: {
                                    OR: amenityList.map(a => ({
                                        amenityName: {
                                            contains: a,
                                            mode: 'insensitive',
                                        },
                                    })),
                                },
                            },
                        ],
                    },
                };
            }
        }

        // Property Type
        if (propertyType) {
            const types = propertyType
                .split(',')
                .map(t => t.trim())
                .filter(Boolean);

            if (types.length > 0) {
                where.propertyType = {
                    masterPropertyType: {
                        OR: types.map(t => ({
                            propertyTypeName: {
                                contains: t,
                                mode: 'insensitive',
                            },
                        })),
                    },
                };
            }
        }

        // Property Category
        if (propertyCategory) {
            const categories = propertyCategory
                .split(',')
                .map(c => c.trim())
                .filter(Boolean);

            if (categories.length > 0) {
                where.propertyCategory = {
                    masterCategory: {
                        OR: categories.map(c => ({
                            categoryName: {
                                contains: c,
                                mode: 'insensitive',
                            },
                        })),
                    },
                };
            }
        }


        let propertyIds: string[] = [];
        let rawTotalCount = 0;

        if (query) {
            const searchPattern = `%${query}%`;
            // Get total count first for pagination
            const countResult: any[] = await prisma.$queryRaw`
                SELECT COUNT(*) as total
                FROM properties p
                JOIN property_addresses pa ON pa.property_id = p.id
                WHERE
                    lower(concat_ws(' ',
                        p.property_name,
                        pa.city,
                        pa.state,
                        pa.location,
                        pa.landmark,
                        pa.address_line1
                    )) % lower(${query})
                    OR metaphone(pa.city, 10) = metaphone(${query}, 10)
                    OR concat_ws(' ',
                        p.property_name,
                        pa.city,
                        pa.state,
                        pa.location,
                        pa.landmark,
                        pa.address_line1
                    ) ILIKE ${searchPattern}
            `;
            rawTotalCount = Number(countResult[0]?.total || 0);

            if (rawTotalCount === 0) {
                return {
                    properties: [],
                    pagination: {
                        totalCount: 0,
                        currentPage: pageNumber,
                        totalPages: 0,
                        pageSize,
                    },
                };
            }

            const rawResults: any[] = await prisma.$queryRaw`
                SELECT 
                    p.id,
                    (
                        similarity(
                            lower(concat_ws(' ',
                                p.property_name,
                                pa.city,
                                pa.state,
                                pa.location,
                                pa.landmark,
                                pa.address_line1
                            )),
                            lower(${query})
                        )
                        +
                        CASE
                            WHEN metaphone(pa.city, 10) = metaphone(${query}, 10)
                            THEN 0.5
                            ELSE 0
                        END
                        +
                        CASE
                            WHEN concat_ws(' ',
                                p.property_name,
                                pa.city,
                                pa.state,
                                pa.location,
                                pa.landmark,
                                pa.address_line1
                            ) ILIKE ${searchPattern} THEN 0.3
                            ELSE 0
                        END
                    ) AS score
                FROM properties p
                JOIN property_addresses pa ON pa.property_id = p.id
                WHERE
                    lower(concat_ws(' ',
                        p.property_name,
                        pa.city,
                        pa.state,
                        pa.location,
                        pa.landmark,
                        pa.address_line1
                    )) % lower(${query})
                    OR metaphone(pa.city, 10) = metaphone(${query}, 10)
                    OR concat_ws(' ',
                        p.property_name,
                        pa.city,
                        pa.state,
                        pa.location,
                        pa.landmark,
                        pa.address_line1
                    ) ILIKE ${searchPattern}
                ORDER BY score DESC
                LIMIT ${pageSize}
                OFFSET ${offset}
            `;

            propertyIds = rawResults.map((r: any) => r.id);

            // Apply fuzzy search IDs
            where.id = {
                in: propertyIds,
            };
        }


        const [properties, prismaTotalCount] = await Promise.all([
            prisma.property.findMany({
                where,
                ...(query ? {} : { skip: offset, take: pageSize }),
                ...(query ? {} : { orderBy: { createdAt: 'desc' } }),
                


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
            }),

            query ? Promise.resolve(rawTotalCount) : prisma.property.count({ where }),
        ]);

        // 🔥 Sort again (Prisma doesn't preserve raw IN order)
        let sortedProperties = properties;
        if (query) {
            sortedProperties = propertyIds.map(id =>
                properties.find(p => p.id === id)
            ).filter(Boolean) as any;
        }

        return {
            properties: sortedProperties,
            pagination: {
                totalCount: prismaTotalCount,
                currentPage: pageNumber,
                totalPages: Math.ceil(prismaTotalCount / pageSize),
                pageSize,
            },
        };
    }
}

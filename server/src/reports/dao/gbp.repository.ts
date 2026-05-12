import { prisma } from '../../config';
import { ICreation, IGroups, IBrands, IProperties } from '../interfaces';

export class GBPRepository {
    public async getCreationDetails(
        creationId: string
    ): Promise<ICreation | null> {
        try {
            const creation = await prisma.creation.findUnique({
                where: { id: creationId },
                select: { id: true, name: true, type: true },
            });
            return creation as ICreation | null;
        } catch (error) {
            throw new Error('Error occurred while fetching creation details');
        }
    }

    /**
     * Super-level: get ALL groups, brands, and properties in the system.
     */
    public async getSuperChildren(): Promise<{
        groups: IGroups[];
        brands: IBrands[];
        properties: IProperties[];
    }> {
        try {
            const [groups, brands, properties] = await Promise.all([
                prisma.creation.findMany({
                    where: { type: 'group' },
                    select: { id: true, name: true },
                }),
                prisma.creation.findMany({
                    where: { type: 'brand' },
                    select: { id: true, name: true, groupId: true },
                }),
                prisma.creation.findMany({
                    where: { type: 'property', propertyId: { not: null } },
                    select: {
                        id: true,
                        name: true,
                        groupId: true,
                        brandId: true,
                        property: { select: { id: true, propertyName: true } },
                    },
                }),
            ]);

            return { groups, brands, properties };
        } catch (error) {
            throw new Error('Error occurred while fetching super children');
        }
    }

    /**
     * Group-level: get child brands and ALL properties (direct + under brands).
     */
    public async getGroupChildren(creationId: string): Promise<{
        brands: IBrands[];
        properties: IProperties[];
    }> {
        try {
            // 1. Get brands directly under this group
            const brands = await prisma.creation.findMany({
                where: { type: 'brand', groupId: creationId },
                select: { id: true, name: true, groupId: true },
            });

            const brandIds = brands.map(b => b.id);

            // 2. Get properties: direct under group OR under group's brands
            const properties = await prisma.creation.findMany({
                where: {
                    type: 'property',
                    propertyId: { not: null },
                    OR: [
                        { groupId: creationId },
                        ...(brandIds.length > 0
                            ? [{ brandId: { in: brandIds } }]
                            : []),
                    ],
                },
                select: {
                    id: true,
                    name: true,
                    groupId: true,
                    brandId: true,
                    property: { select: { id: true, propertyName: true } },
                },
            });

            return { brands, properties };
        } catch (error) {
            throw new Error('Error occurred while fetching group children');
        }
    }

    /**
     * Brand-level: get child properties under this brand.
     */
    public async getBrandChildren(creationId: string): Promise<{
        properties: IProperties[];
    }> {
        try {
            const properties = await prisma.creation.findMany({
                where: {
                    type: 'property',
                    brandId: creationId,
                    propertyId: { not: null },
                },
                select: {
                    id: true,
                    name: true,
                    groupId: true,
                    brandId: true,
                    property: { select: { id: true, propertyName: true } },
                },
            });

            return { properties };
        } catch (error) {
            throw new Error('Error occurred while fetching brand children');
        }
    }
}

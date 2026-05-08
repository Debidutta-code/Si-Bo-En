import { prisma } from '../../config';

export default async function getPropertyIdFromPropertyId(
    propertyId: string
): Promise<string> {
    const property = await prisma.property.findUnique({
        where: { id: propertyId },
        select: { propertyCode: true },
    });
    if (!property) {
        throw new Error('Property not found');
    }
    return property.propertyCode;
}

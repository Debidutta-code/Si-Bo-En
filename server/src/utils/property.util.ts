import { prisma } from '../config';

export const getPropertyName = async (propertyId: string): Promise<string> => {
    const property = await prisma.property.findUnique({
        where: {
            id: propertyId,
        },
    });
    return property?.propertyName || '';
};
export const getPropertyCode = async (propertyId: string): Promise<string> => {
    const property = await prisma.property.findUnique({
        where: {
            id: propertyId,
        },
    });
    return property?.propertyCode || '';
};

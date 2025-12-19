import prisma from "../../config/prisma.client";
export async function property(propertyId: string) {
    return await prisma.property.findUnique({ where: { id: propertyId } });
}
export async function isPropertyExists(propertyId: string): Promise<boolean> {
    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    return property !== null;
}
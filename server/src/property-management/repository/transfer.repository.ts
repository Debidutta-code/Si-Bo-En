import { ICreation } from "../../auth/types";
import { prisma } from "../../config";
import { IPropertyRecovery, IRecoveryCreation } from "../types";

export class PropertyTransferRepository {
    public async getPropertyByCode(propertyCode: string): Promise<IPropertyRecovery | null> {
        try {
            return await prisma.property.findUnique({
                where: { propertyCode: propertyCode },
            });
        } catch (error) {
            throw new Error("Failed to fetch property by code")
        }
    }
    public async getNewPropertyCreation(creationId: string): Promise<IRecoveryCreation | null> {
        try {
            return await prisma.creation.findUnique({
                where: { id: creationId },
            });
        } catch (error) {
            throw new Error("Failed to find the new property creation");
        }
    }
    public async recoverProperty(propertyId: string, oldCreationId: string, newCreationId: string): Promise<string> {
        try {
            await prisma.$transaction(async (tx) => {
                await tx.creation.update({
                    where: { id: oldCreationId },
                    data: { propertyId: null },
                });
                await tx.property.update({
                    where: { id: propertyId },
                    data: { creationId: newCreationId },
                });
                await tx.creation.update({
                    where: { id: newCreationId },
                    data: { propertyId: propertyId },
                });
                await tx.creation.delete({
                    where: { id: oldCreationId },
                });
            });
            return "Property recovered successfully";
        } catch (error) {
            console.error("Error recovering property:", error);
            throw new Error("Failed to recover property");
        }
    }

}

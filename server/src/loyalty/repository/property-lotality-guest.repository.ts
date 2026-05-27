import { IPropertyLoyalityGuest } from "../types";
import {prisma} from "../../config";
export class PropertyLoyalityGuest{
            public async guestExistForProperty(
        propertyLoyalityId: string,
        customerId: string
    ): Promise<IPropertyLoyalityGuest | null> {
        try {
            return await prisma.propertyLoyalityGuests.findUnique({
                where: {
                    propertyLoyalityId_customerId: {
                        propertyLoyalityId,
                        customerId,
                    },
                },
            });
        } catch (error) {
            throw new Error('Failed to check if guest registered for property');
        }
    }
    public async createPropertyLoyaltyGuest(data: {
        propertyLoyalityId: string;
        customerId: string;
    }): Promise<IPropertyLoyalityGuest> {
        try {
            return await prisma.propertyLoyalityGuests.create({
                data,
            });
        } catch (error) {
            throw new Error('Failed to create property loyalty guest');
        }
    }

}
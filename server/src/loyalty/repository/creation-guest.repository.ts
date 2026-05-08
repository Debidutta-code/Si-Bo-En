import { prisma } from '../../config/db.config';
import { IPropertyLoyalityGuest } from '../types';
import {
    ICreationLoyaltyGuest,
    ICCreationLoyaltyGuest,
} from '../types/creation-guest.types';

export class CreationGuestRepository {
    public async createCreationGuest(
        data: ICCreationLoyaltyGuest
    ): Promise<ICreationLoyaltyGuest> {
        try {
            const creationGuest = await prisma.creationGuest.create({
                data: {
                    ...data,
                },
            });
            return creationGuest;
        } catch (error) {
            throw new Error(`Failed to create creation guest`);
        }
    }
    public async deleteCreationGuest(id: string): Promise<void> {
        try {
            await prisma.creationGuest.delete({
                where: { id },
            });
        } catch (error) {
            throw new Error(`Failed to delete creation guest`);
        }
    }
    public async checkIfGuestExist(
        propertyId: string,
        guestId: string
    ): Promise<ICreationLoyaltyGuest | null> {
        try {
            return await prisma.creationGuest.findUnique({
                where: {
                    creationLoyaltyConfigId_loyalityGuestId: {
                        creationLoyaltyConfigId: propertyId,
                        loyalityGuestId: guestId,
                    },
                },
            });
        } catch (error) {
            throw new Error('Failed to check if guest registered for property');
        }
    }
    public async guestExistForProperty(
        propertyLoyalityId: string,
        loyalityGuestId: string
    ): Promise<IPropertyLoyalityGuest | null> {
        try {
            return await prisma.propertyLoyalityGuests.findUnique({
                where: {
                    propertyLoyalityId_loyalityGuestId: {
                        propertyLoyalityId,
                        loyalityGuestId,
                    },
                },
            });
        } catch (error) {
            throw new Error('Failed to check if guest registered for property');
        }
    }
    public async createPropertyLoyaltyGuest(data: {
        propertyLoyalityId: string;
        loyalityGuestId: string;
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

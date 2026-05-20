import { prisma } from '../../../config';
import {
    ICPropertyWishListR,
    IProperty,
    IPropertyWishlist,
    IRoomWishlistWRooms,
} from '../types';

export class PropertyWishList {
    public async createPropertyWishList(
        data: ICPropertyWishListR
    ): Promise<IPropertyWishlist> {
        try {
            return await prisma.wishList.create({
                data: {
                    propertyCode: data.propertyCode,
                    propertyName: data.propertyName,
                    createdAt: new Date(),
                    propertyId: data.propertyId,
                    customerId: data.customerId,
                },
            });
        } catch (error) {
            throw new Error('Error creating property wishlist');
        }
    }
    public async getPropertyWishListForGuest(
        customerId: string
    ): Promise<IRoomWishlistWRooms[]> {
        try {
            return await prisma.wishList.findMany({
                where: {
                    customerId,
                },
                include: {
                    Property: {
                        select: {
                            id: true,
                            propertyName: true,
                            propertyCode: true,
                            image: true,
                        },
                    },
                    RoomWishList: true,
                },
            });
        } catch (error) {
            throw new Error('Error fetching wishlist for user');
        }
    }
    public async checkIfPropertyWishListExists(
        customerId: string,
        propertyId: string
    ): Promise<IPropertyWishlist | null> {
        try {
            return await prisma.wishList.findUnique({
                where: {
                    customerId_propertyId: {
                        customerId,
                        propertyId,
                    },
                },
            });
        } catch (error) {
            throw new Error('Error checking if wishlist exists');
        }
    }
    public async getById(id: string): Promise<IPropertyWishlist | null> {
        try {
            return await prisma.wishList.findUnique({
                where: {
                    id,
                },
            });
        } catch (error) {
            throw new Error('Error fetching wishlist by ID');
        }
    }
    public async removePropertyFromUserWishList(
        customerId: string,
        propertyId: string
    ): Promise<IPropertyWishlist | null> {
        try {
            return await prisma.wishList.delete({
                where: {
                    customerId_propertyId: {
                        customerId,
                        propertyId,
                    },
                },
            });
        } catch (error) {
            throw new Error('Error removing property from wishlist');
        }
    }
    public async getNoOfWishListForProperty(
        propertyId: string
    ): Promise<number> {
        try {
            const count = await prisma.wishList.count({
                where: {
                    propertyId,
                },
            });
            return count;
        } catch (error) {
            throw new Error('Error fetching wishlist count for property');
        }
    }

    public async getPropertyById(id: string): Promise<IProperty | null> {
        try {
            return await prisma.property.findUnique({
                where: {
                    id,
                    isAvailable: true,
                },
            });
        } catch (error) {
            throw new Error('Error fetching property by ID');
        }
    }
}

import { prisma } from '../../../config';
import { ICloyalityGuests, ILoyalityGuests } from '../../../loyalty/types';
import { ICUser, IUser, IUserWP, IUUser } from '../types';
export class OtaUserRepository {
    public async createUser(ICUser: ICUser): Promise<IUser> {
        try {
            return await prisma.customers.create({
                data: {
                    firstName: ICUser.firstName,
                    lastName: ICUser.lastName,
                    email: ICUser.email,
                    password: ICUser.password,
                },
            }) as any as IUser;
        } catch (error) {
            throw new Error(`Failed to create OTA user `);
        }
    }
    public async getUserByEmail(email: string): Promise<IUserWP | null> {
        try {
            return await prisma.customers.findUnique({
                where: {
                    email: email,
                },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    password: true,
                },
            }) as unknown as IUserWP | null;
        } catch (error) {
            throw new Error(`Failed to retrieve OTA user by email: ${email}`);
        }
    }
    public async getUserById(id: string): Promise<IUser | null> {
        try {
            return await prisma.customers.findUnique({
                where: {
                    id: id,
                },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            }) as unknown as IUser | null;
        } catch (error) {
            throw new Error(`Failed to retrieve OTA user by id: ${id}`);
        }
    }
    public async updateUserPassword(
        userId: string,
        newPassword: string
    ): Promise<IUser> {
        try {
            return await prisma.customers.update({
                where: {
                    id: userId,
                },
                data: {
                    password: newPassword,
                },
            }) as unknown as IUser;
        } catch (error) {
            throw new Error(
                `Failed to update OTA user password for id: ${userId}`
            );
        }
    }
    public async updateUserProfile(
        userId: string,
        userProfile: IUUser
    ): Promise<IUser> {
        try {
            return await prisma.customers.update({
                where: {
                    id: userId,
                },
                data: {
                    firstName: userProfile.firstName,
                    lastName: userProfile.lastName,
                },
            }) as unknown as IUser;
        } catch (error) {
            throw new Error(
                `Failed to update OTA user profile for id: ${userId}`
            );
        }
    }
    public async deleteUser(userId: string): Promise<IUser> {
        try {
            return await prisma.customers.delete({
                where: {
                    id: userId,
                },
            }) as unknown as IUser;
        } catch (error) {
            throw new Error(`Failed to delete OTA user for id: ${userId}`);
        }
    }
    public async getLoyaltyGuestById(
        email: string
    ): Promise<ILoyalityGuests | null> {
        try {
            return await prisma.customers.findUnique({
                where: {
                    email: email,
                },
            }) as ILoyalityGuests | null;
        } catch (error) {
            throw new Error(
                `Failed to retrieve OTA loyalty guest by email: ${email}`
            );
        }
    }
    public async createLoyaltyGuest(
        data: ICloyalityGuests
    ): Promise<ILoyalityGuests> {
        try {
            return await prisma.customers.create({
                data: {
                    email: data.customerEmail,
                    password: data.password,
                    firstName: '',
                    lastName: '',
                },
            }) as unknown as ILoyalityGuests;
        } catch (error) {
            throw new Error(`Failed to create OTA loyalty guest: ${error}`);
        }
    }
}

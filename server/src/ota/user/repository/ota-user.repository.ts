import { prisma } from "../../../config";
import { ICloyalityGuests, ILoyalityGuests } from "../../../loyalty/types";
import { ICUser, IUser, IUserWP, IUUser } from "../types";
export class OtaUserRepository {
    public async createUser(ICUser: ICUser): Promise<IUser> {
        try {

            return await prisma.otaGuest.create({
                data: {
                    firstName: ICUser.firstName,
                    lastName: ICUser.lastName,
                    email: ICUser.email,
                    password: ICUser.password,
                    phoneNumber: ICUser.phoneNumber,
                    metaData:{}
                },
            });
        } catch (error) {
            throw new Error(`Failed to create OTA user `);
        }
    }
    public async getUserByEmail(email: string): Promise<IUserWP | null> {
        try {
            return await prisma.otaGuest.findUnique({
                where: {
                    email: email,
                },select:{
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phoneNumber: true,
                    createdAt: true,
                    password: true
                }
            });
        } catch (error) {
            throw new Error(`Failed to retrieve OTA user by email: ${email}`);
        }
    }
    public async getUserById(id: string): Promise<IUser | null> {
        try {
            return await prisma.otaGuest.findUnique({
                where: {
                    id: id,
                },
                select:{
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phoneNumber: true,
                    createdAt: true,
                }
            });
        } catch (error) {
            throw new Error(`Failed to retrieve OTA user by id: ${id}`);
        }
    }
    public async updateUserPassword(userId: string, newPassword: string): Promise<IUser> {
        try {
            return await prisma.otaGuest.update({
                where: {
                    id: userId,
                },
                data: {
                    password: newPassword,
                },
            });
        } catch (error) {
            throw new Error(`Failed to update OTA user password for id: ${userId}`);
        }
    }
    public async updateUserProfile(userId: string, userProfile: IUUser): Promise<IUser> {
        try {
            return await prisma.otaGuest.update({
                where: {
                    id: userId,
                },
                data: {
                    firstName: userProfile.firstName,
                    lastName: userProfile.lastName,
                    phoneNumber: userProfile.phoneNumber,
                },
            });
        } catch (error) {
            throw new Error(`Failed to update OTA user profile for id: ${userId}`);
        }
    }
    public async deleteUser(userId: string): Promise<IUser> {
        try {
            return await prisma.otaGuest.delete({
                where: {
                    id: userId,
                },
            });
        } catch (error) {
            throw new Error(`Failed to delete OTA user for id: ${userId}`);
        }
    }
    //when user signup for ota create the 
    public async getLoyaltyGuestById(email: string): Promise<ILoyalityGuests | null> {
        try {
            return await prisma.loyalityGuest.findUnique({
                where: {
                    guestEmail: email,
                }
            });
        } catch (error) {
            throw new Error(`Failed to retrieve OTA loyalty guest by email: ${email}`);
        }
    }
    public async createLoyaltyGuest(data: ICloyalityGuests): Promise<ILoyalityGuests> {
        try {
            return await prisma.loyalityGuest.create({
                data: {
                    guestEmail: data.guestEmail,
                    password: data.password,
                    otaGuestId: data.otaGuestId,
                },
            });
        } catch (error) {
            throw new Error(`Failed to create OTA loyalty guest: ${error}`);
        }
    }
}
import { prisma } from "../../config";
import { ILoyalityGuests,  ICloyalityGuests, IGetLoyaltyGuestsForCreation } from "../types";
import { ICreationLoyaltyGuestWDP } from "../types/creation-guest.types";
export class LoyaltyGuestRepository {
    public async createGuestsLoyaltyConfig(guestLoyaltyConfigData: ICloyalityGuests): Promise<any> {
        try {
            const guestId = guestLoyaltyConfigData.guestId
                ? String(guestLoyaltyConfigData.guestId)
                : null;

            // Avoid P2003: guestId is an optional FK to Guests, so only persist it if it exists.
            const guestExists = guestId
                ? await prisma.guests.findUnique({ where: { id: guestId } })
                : null;

            return await prisma.loyalityGuest.create({
                data: {
                    ...guestLoyaltyConfigData,
                    guestId: guestExists ? guestId : null,

                }
            });
        } catch (error) {
            console.log(error);
            throw new Error("Failed to create guest loyalty config");
        }
    }
    public async getLoyaltyGuestByPropertyAndGuest(propertyId: string, guestEmail: string): Promise<IGetLoyaltyGuestsForCreation | null> {
        try {
            return await prisma.creationGuest.findFirst({
                where: {
                    creationLoyaltyConfigId: propertyId,
                    LoyalityGuest: { guestEmail },
                },
                include: {
                    LoyalityGuest: {
                        include: { guest: true }
                    },
                    CreationLoyaltyConfig: true,
                },
            })
        } catch (error) {
            console.log(error)
            throw new Error("Failed to get loyalty guest by property and guest");
        }
    }
    public async getLoyaltyGuestByEmail(guestEmail: string): Promise<ILoyalityGuests | null> {
        try {
            return await prisma.loyalityGuest.findUnique({
                where: {
                    guestEmail
                },
            });
        } catch (error) {
            throw new Error("Failed to get loyalty guest by email");
        }
    }
    public async checkIfGuestExists(guestEmail: string): Promise<ILoyalityGuests | null> {
        try {
            return await prisma.loyalityGuest.findUnique({
                where: {
                    guestEmail
                }
            });
        } catch (error) {
            throw new Error("Failed to check if guest exists");
        }
    }
    public async checkIfCreationGuestExists(creationLoyaltyConfigId: string, loyalityGuestId: string): Promise<ICreationLoyaltyGuestWDP | null> {
        try {
            return await prisma.creationGuest.findFirst({
                where: {
                    creationLoyaltyConfigId,
                    loyalityGuestId,
                },
                include: {
                    LoyalityGuest: {
                        include: { guest: true }
                    },
                    CreationLoyaltyConfig: true,
                },
            })
        } catch (error) {
            console.log(error)
            throw new Error("Failed to check if creation guest exists");
        }
    }
    public async getLoyalityGuestsForProperty(propertyId: string, skip: number = 0, take: number = 10): Promise<ICreationLoyaltyGuestWDP[]> {
        try {
            return await prisma.creationGuest.findMany({
                where: {
                    creationLoyaltyConfigId:propertyId
                },
                include: {
                    LoyalityGuest: {
                        include: {
                            guest: true,
                        }
                    },
                    // Property: {
                    //     select: {
                    //         id: true,
                    //         propertyName: true,
                    //         propertyCode: true
                    //     }
                    // }
                },
                skip,
                take
            });
        } catch (error) {
            throw new Error("Failed to get loyalty guests for property");
        }
    }
    public async totalLoyalityGuestsForProperty(propertyId: string): Promise<number> {
        try {
            return await prisma.propertyLoyalityGuests.count({
                where: {
                    propertyLoyalityId:propertyId
                }
            });
        } catch (error) {
            throw new Error("Failed to count loyalty guests for property");
        }
    }
    public async getTotalLoyalityGuests(creationLoyaltyConfigId: string): Promise<number> {
        try {
            return await prisma.creationGuest.count({
                where: {
                    creationLoyaltyConfigId
                }
            });
        } catch (error) {
            throw new Error("Failed to count total loyalty guests");
        }
    }
    public async getLoyalityGuestForCreation(creationLoyaltyConfigId: string, skip: number = 0, take: number = 10): Promise<ICreationLoyaltyGuestWDP[]> {
        try {
            return await prisma.creationGuest.findMany({
                where: {
                    creationLoyaltyConfigId: creationLoyaltyConfigId
                },
                include: {
                    // Property: {
                    //     select: {
                    //         id: true,
                    //         propertyName: true,
                    //         propertyCode: true,
                    //     }
                    // },
                    CreationLoyaltyConfig: {
                        select: {
                            id: true,
                            loyaltyDiscountType: true,
                            discountValue: true,
                            currencyCode: true,
                            createdAt: true
                        }
                    },
                    LoyalityGuest: {
                        include: {
                            guest: true
                        }
                    }

                },
                skip,
                take
            });
        } catch (error) {
            console.log(error)
            throw new Error("Failed to get loyalty guest for creation");
        }
    }
    public async deleteLoyaltyGuestById(loyaltyGuestId: string): Promise<ILoyalityGuests | null> {
        try {
            return await prisma.loyalityGuest.delete({
                where: {
                    id: loyaltyGuestId
                }
            });
        } catch (error) {
            throw new Error("Failed to delete loyalty guest by id");
        }
    }

    public async createGuestsLoyaltyConfigFromBookingEngine(data: ICloyalityGuests): Promise<ILoyalityGuests> {
        try {
            return await prisma.loyalityGuest.create({
                data: {
                    guestEmail: data.guestEmail,
                    guestId: data.guestId || undefined,
                    password: data.password,
                }
            });
        } catch (error) {
            console.error("Error creating loyalty guest:", error);
            throw new Error("Failed to create guest loyalty config from booking engine");
        }
    }

    public async getPropertyLoyaltyConfig(propertyId: string): Promise<any> {
        try {
            return await prisma.propertyLoyaltyConfig.findUnique({
                where: { propertyId ,isActive:true},
                include:{
                    CreationLoyaltyConfig:true
                }
            });
        } catch (error) {
            throw new Error("Failed to get property loyalty config");
        }
    }
    public async addGuest(id: string, guestId: string): Promise<ILoyalityGuests | null> {
        try {
            return await prisma.loyalityGuest.update({
                where: {
                    id
                }, data: {
                    guestId
                }
            })
        } catch (error) {
            throw new Error("Failed to add guest")
        }
    }

    public async addGuestTOLoyalty(email: string,guestEmailId:string): Promise<ILoyalityGuests | null> {
        try {
            return await prisma.loyalityGuest.update({
                where: {
                    guestEmail: email
                },
                data:{
                    guestId:guestEmailId
                }
            });
        } catch (error) {
            throw new Error("Failed to get guest by email");
        }
    }
    public async updateGuest(email: string, password: string): Promise<ILoyalityGuests | null> {
        try {
            return await prisma.loyalityGuest.update({
                where: {
                    guestEmail: email
                },
                data:{
                    password:password
                }
            });
        } catch (error) {
            throw new Error("Failed to update guest");
        }
    }

}
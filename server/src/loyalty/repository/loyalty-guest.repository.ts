import {prisma} from "../../config";
import {ILoyalityGuests,ILoyalityGuestsWDP,ICloyalityGuests} from "../types";
export class LoyaltyGuestRepository {
    public async createGuestsLoyaltyConfig(guestLoyaltyConfigData: ICloyalityGuests): Promise<any> {
        try {
            return await prisma.loyalityGuest.create({
                data: guestLoyaltyConfigData
            });
        } catch (error) {
            throw new Error("Failed to create guest loyalty config");
        }
    }
    public async getLoyaltyGuestByPropertyAndGuest(propertyId:string,guestEmail:string): Promise<ILoyalityGuests | null> {
        try {
            return await prisma.loyalityGuest.findFirst({
                where:{
                    propertyId,
                    guest:{
                        email:guestEmail
                    }
                }
            })
        } catch (error) {
            throw new Error("Failed to get loyalty guest by property and guest");
        }
    }
    public async getLoyalityGuestsForProperty(propertyId:string,skip:number=0,take:number=10): Promise<ILoyalityGuestsWDP[]> {
        try {
            return await prisma.loyalityGuest.findMany({
                where:{
                    propertyId
                },
                include:{
                    guest:true,
                    property:{
                        select:{
                            id:true,
                            propertyName:true,
                            propertyCode:true
                        }
                    }
                },
                skip,
                take
            });
        } catch (error) {
            throw new Error("Failed to get loyalty guests for property");
        }
    }
    public async totalLoyalityGuestsForProperty(propertyId:string): Promise<number> {
        try {
            return await prisma.loyalityGuest.count({
                where:{
                    propertyId
                }
            });
        } catch (error) {
            throw new Error("Failed to count loyalty guests for property");
        }
    }
    public async getTotalLoyalityGuests(creationLoyaltyConfigId:string): Promise<number> {
        try {
            return await prisma.loyalityGuest.count({
                where:{
                    creationLoyaltyConfigId
                }
            });
        } catch (error) {
            throw new Error("Failed to count total loyalty guests");
        }
    }
    public async getLoyalityGuestForCreation(creationLoyaltyConfigId:string,skip:number=0,take:number=10): Promise<ILoyalityGuestsWDP[]> {
        try {
            return await prisma.loyalityGuest.findMany({
                where:{
                    creationLoyaltyConfigId:creationLoyaltyConfigId
                },
                include:{
                    guest:true,
                    property:{
                        select:{
                            id:true,
                            propertyName:true,
                            propertyCode:true
                        }
                    }
                },
                skip,
                take
            });
        } catch (error) {
            throw new Error("Failed to get loyalty guest for creation");
        }
    }
    public async deleteLoyaltyGuestById(loyaltyGuestId:string): Promise<ILoyalityGuests | null> {
        try {
            return await prisma.loyalityGuest.delete({
                where:{
                    id:loyaltyGuestId
                }
            });
        } catch (error) {
            throw new Error("Failed to delete loyalty guest by id");
        }
    }
}
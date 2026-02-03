import { prisma } from "../../config";
import {
    ICPropertyLoyaltyConfig,
    IPropertyLoyalityWithLoyality,
    IPropertyLoyaltyConfig
} from "../types/property-loyality.types";
export class propertyLoyalityRepository {
    public async createPropertyLoyalityConfig(
        data: ICPropertyLoyaltyConfig
    ): Promise<IPropertyLoyaltyConfig> {
        try {
            return await prisma.propertyLoyaltyConfig.create({
                data
            });
        } catch (error) {
            throw new Error("failed to create property loyality config: ");
        }
    }
    public async getLoyalityForProperty(propertyId: string): Promise<IPropertyLoyaltyConfig|null> {
        try {
            return await prisma.propertyLoyaltyConfig.findFirst({
                where: {
                    propertyId,
                    isActive:true
                }
            });
        } catch (error) {
            throw new Error("failed to get loyality for property: ");
        }
    }
    public async updatePropertyLoyalityConfig(propertyLoyalityId:string,isActive:boolean): Promise<IPropertyLoyaltyConfig> {
        try {
            return await prisma.propertyLoyaltyConfig.update({
                where: {
                    id:propertyLoyalityId
                },
                data:{
                    isActive
                }
            });
        } catch (error) {
            throw new Error("failed to update property loyality config ");
        }
    }
    public async deletePropertyLoyalityConfig(propertyLoyalityId:string): Promise<IPropertyLoyaltyConfig> {
        try {
            return await prisma.propertyLoyaltyConfig.delete({
                where: {
                    id:propertyLoyalityId
                }
            });
        }
        catch (error) {
            throw new Error("failed to delete property loyality config ");
        }
    }
    public async getAllPropertyLoyalityWithLoyality(propertyId:string): Promise<IPropertyLoyalityWithLoyality[]> {
        try {
            return await prisma.propertyLoyaltyConfig.findMany({
                where: {
                    propertyId,
                },
                include:{
                    CreationLoyaltyConfig:{
                        include:{
                            AdvanceLoyaltyProgram:true,
                            BasicLoyaltyProgram:true,
                            loyaltyAdvanceProgram:true,
                            LoyaltyProgramFieldConfig:true,
                            loyaltySpecialCondition:true,
                            PropertyLoyaltyConfig:true
                        }
                    }
                }
            })
        } catch (error) {
            throw new Error("failed to get property loyality with loyality: ");
        }
    }
    public getActiveLoyaltyConfigByPropertyId(propertyId:string): Promise<IPropertyLoyaltyConfig|null> {
        try {
            
            return prisma.propertyLoyaltyConfig.findFirst({
                where: {
                    propertyId,
                    isActive: true
                },include:{
                    CreationLoyaltyConfig:{
                        include:{
                            AdvanceLoyaltyProgram:true,
                            BasicLoyaltyProgram:true,
                            loyaltyAdvanceProgram:true,
                            LoyaltyProgramFieldConfig:true,
                            loyaltySpecialCondition:true,
                            PropertyLoyaltyConfig:true
                        }
                    }
                }
            });
        } catch (error) {
            throw new Error("Error fetching active loyalty config by property " );
        }
    }
}
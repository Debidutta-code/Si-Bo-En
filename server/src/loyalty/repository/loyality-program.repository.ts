import {prisma} from "../../config";
import {
    IAdvanceLoyaltyprogram,
    ICAdvanceLoyaltyprogram,
    ICloyaltyProgram,
    IUAdvanceLoyaltyprogram,
    IULoyalityProgram,
    IloyaltyProgram
} from "../types";
export class LoyaltyProgramRepository {
    public async createLoyaltyProgram(data: ICloyaltyProgram): Promise<IloyaltyProgram> {
        try {
            return await prisma.basicLoyaltyProgram.create({
                data
            });
        } catch (error) {
            throw new Error("Error creating loyalty program ");
        }
    }
    public async updateLoyaltyProgram(id: string, data: IULoyalityProgram): Promise<IULoyalityProgram> {
        try {
            return await prisma.basicLoyaltyProgram.update({
                where: {id},
                data:{
                    isActive:data.isActive,
                    logo:data.logo,
                }
            });
        } catch (error) {
            throw new Error("Error updating loyalty program ");
        }
    }
    public async getLoyaltyProgramById(loyaltyProgramId: string): Promise<IloyaltyProgram | null> {
        try {
            return await prisma.basicLoyaltyProgram.findUnique({
                where: {loyaltyProgramId}
            });
        } catch (error) {
            throw new Error("Error fetching loyalty program ");
        }
    }
    public async deleteLoyaltyProgram(loyaltyProgramId: string): Promise<IloyaltyProgram> {
        try {
            return await prisma.basicLoyaltyProgram.delete({
                where: {loyaltyProgramId}
            });
        } catch (error) {
            throw new Error("Error deleting loyalty program ");
        }
    }

}
export class AdvanceLoyaltyProgramRepository {
    public async createAdvanceLoyaltyProgram(data: ICAdvanceLoyaltyprogram): Promise<IAdvanceLoyaltyprogram> {
        try {
            return await prisma.advanceLoyaltyProgram.create({
                data
            });
        } catch (error) {
            throw new Error("Error creating advance loyalty program ");
        }
    }
    public async updateAdvanceLoyaltyProgram(id: string, data: IUAdvanceLoyaltyprogram): Promise<IUAdvanceLoyaltyprogram> {
        try {
            return await prisma.advanceLoyaltyProgram.update({
                where: {id},
                data:{
                    activeInCorporateWeb:data.activeInCorporateWeb,
                    blockUserFieldFromForm:data.blockUserFieldFromForm,
                    defaultLoginMode:data.defaultLoginMode,
                    externalRegistrationUrl:data.externalRegistrationUrl,
                    roomLimitByBooking:data.roomLimitByBooking,
                }
            });
        } catch (error) {
            throw new Error("Error updating advance loyalty program ");
        }
    }
    public async getAdvanceLoyaltyProgramById(loyaltyProgramId: string): Promise<IAdvanceLoyaltyprogram | null> {
        try {
            return await prisma.advanceLoyaltyProgram.findUnique({
                where: { loyaltyProgramId}
            });
        } catch (error) {
            throw new Error("Error fetching advance loyalty program ");
        }
    }
    public async deleteAdvanceLoyaltyProgram(loyaltyProgramId: string): Promise<IAdvanceLoyaltyprogram> {
        try {
            return await prisma.advanceLoyaltyProgram.delete({
                where: {loyaltyProgramId}
            });
        } catch (error) {
            throw new Error("Error deleting advance loyalty program ");
        }
    }
}
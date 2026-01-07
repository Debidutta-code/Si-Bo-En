import { prisma } from "../../config";
import { ICreateAddonAvailability,IAddonAvailability,IUpdateAddonAvailability } from "../interfaces"
export class AddonDateWiseDao {

    public  async createAddOnDateWise(data: ICreateAddonAvailability[]):Promise<IAddonAvailability[]|Error> {
        try {
            return await prisma.$transaction(
                data.map((item) => prisma.addonAvailability.create({ data: item }))
            )
        } catch (error:any) {
            throw new Error(error?.message || "Failed to create addon date-wise availability")
        }
    }
    public async getAddonDateWiseById(addonId: string):Promise<IAddonAvailability[]|Error> {
        try {
            return await prisma.addonAvailability.findMany({ where: { addonId: addonId } })
        } catch (error) {
            throw new Error("Failed to get addon date-wise by ID")
        }
    }
    public async updateAddonByAddonId(addonId: string, data: { price: number, currencyCode: string, isAvailable: boolean }):Promise<{ count: number }|Error> {
        try {
            return await prisma.addonAvailability.updateMany({
                where: { addonId: addonId }, data: { price: data.price, currencyCode: data.currencyCode, isAvailable: data.isAvailable }
            })
        } catch (error) {
            throw new Error("Failed to update addon")
        }
    }
    public async updateAddonForSingleDate(id: string, data: { price: number, currencyCode: string, isAvailable: boolean }):Promise<IAddonAvailability|Error> {
        try {
            return await prisma.addonAvailability.update({
                where: { id: id },
                data: { price: data.price, currencyCode: data.currencyCode, isAvailable: data.isAvailable }
            })
        } catch (error) {
            throw new Error("Update addon for single date")
        }
    }
    public async deleteAddonByAddonId(id: string):Promise<{ count: number }|Error> {
        try {
            return await prisma.addonAvailability.deleteMany({ where: { addonId: id } })
        } catch (error) {
            throw new Error("Failed to delete multiple addon.")
        }
    }
    public async deleteAddonForParticularDate(id: string):Promise<IAddonAvailability|Error> {
        try {
            return await prisma.addonAvailability.delete({ where: { id: id } })
        } catch (error) {
            throw new Error("failed to delete add on")
        }
    }
    public static async getAddonByDate(addonId: string, date: Date):Promise<IAddonAvailability[]|Error> {
        try {
            // Match any records where the `date` falls within the provided calendar day
            const start = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
            // console.log(start)
            const end = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 2);
            // console.log(end)
            return await prisma.addonAvailability.findMany({
                where: {
                    addonId: addonId,
                    date: { gte: start, lte: end }
                }, include: {
                    addon: true
                }
            });
        } catch (error) {
            throw new Error(`Error fetching addons with property id for ${date}`);
        }
    }
    public static async findAddOnForDateWise(dateWiseId: string):Promise<IAddonAvailability|null|Error> {
        try {
            return await prisma.addonAvailability.findFirst({
                where: {
                    id: dateWiseId
                }
            })
        } catch (error) {
            throw new Error(`Error fetching addons `);

        }
    }
}
import {prisma} from "../../config";
import {ICVariant,IAddonVariant}  from "../interfaces"
export default class VariantRepository{
    public static async createVariant(code:string,name:string,subCategoryId:string): Promise<IAddonVariant> {
        try {
            return await prisma.addonVariant.create({ data: { code, name, subcategoryId: subCategoryId } });
        } catch (error) {
            // console.log(error)
            throw new Error("Error creating variant");
        }
    }
    public static async getAllVariants(): Promise<IAddonVariant[]> {
        try {
            return await prisma.addonVariant.findMany();
        } catch (error) {
            // console.log(error)
            throw new Error("Error fetching variants");
        }
    }
    public static async updateVariant(variantId: string, updateData: Partial<ICVariant>): Promise<IAddonVariant | null> {
        try {
            return await prisma.addonVariant.update({
                where: { id: variantId },
                data: updateData
            });
        } catch (error) {
            throw new Error("Error updating variant");
        }
    }
    public static async getVariantById(variantId: string): Promise<IAddonVariant | null> {
        try {
            return await prisma.addonVariant.findUnique({ where: { id: variantId } });
        } catch (error) {
            throw new Error("Error fetching variant by ID");
        }
    }
    public static async deleteVariant(variantId: string): Promise<IAddonVariant | null> {
        try {
            return await prisma.addonVariant.delete({ where: { id: variantId } });
        } catch (error) {
            throw new Error("Error deleting variant");
        }
    }
    public static async getVariantsBySubCategoryId(subCategoryId: string): Promise<IAddonVariant[]> {
        try {
            return await prisma.addonVariant.findMany({ where: { subcategoryId: subCategoryId } });
        } catch (error) {
            throw new Error("Error fetching variants by subcategory ID");
        }
    }
    public static async addAddonToVariant(variantId: string, addonId: string): Promise<IAddonVariant | null> {
        try {
            return await prisma.addonVariant.update({
                where: { id: variantId },
                data: { addons: { connect: { id: addonId } } }
            });
        } catch (error) {
            throw new Error("Error adding addon to variant");
        }
    }
    public static async removeAddonFromVariant(variantId: string, addonId: string): Promise<IAddonVariant | null> {
        try {
            return await prisma.addonVariant.update({
                where: { id: variantId },
                data: { addons: { disconnect: { id: addonId } } }
            });
        } catch (error) {
            throw new Error("Error removing addon from variant");
        }
    }
}
import { prisma } from '../../config';
import { ICSubCategory, IAddonSubCategory } from '../interfaces';
export default class SubCategoryRepository {
    public static async createSubCategory(
        code: string,
        name: string,
        categoryId: string
    ): Promise<IAddonSubCategory> {
        try {
            return await prisma.addonSubCategory.create({
                data: { code, name, categoryId },
            });
        } catch (error) {
            throw new Error('Error creating subcategory');
        }
    }
    public static async getAllSubCategories(): Promise<IAddonSubCategory[]> {
        try {
            return await prisma.addonSubCategory.findMany({
                include: { addons: true, variants: true },
            });
        } catch (error) {
            throw new Error('Error fetching subcategories');
        }
    }
    public static async updateSubCategory(
        subCategoryId: string,
        updateData: Partial<ICSubCategory>
    ): Promise<IAddonSubCategory | null> {
        try {
            return await prisma.addonSubCategory.update({
                where: { id: subCategoryId },
                data: updateData,
            });
        } catch (error) {
            throw new Error('Error updating subcategory');
        }
    }
    public static async getSubCategoryById(
        subCategoryId: string
    ): Promise<IAddonSubCategory | null> {
        try {
            return await prisma.addonSubCategory.findUnique({
                where: { id: subCategoryId },
            });
        } catch (error) {
            throw new Error('Error fetching subcategory by ID');
        }
    }
    public static addVariantToSubCategory(
        subCategoryId: string,
        variantId: string
    ): Promise<IAddonSubCategory | null> {
        try {
            return prisma.addonSubCategory.update({
                where: { id: subCategoryId },
                data: { variants: { connect: { id: variantId } } },
            });
        } catch (error) {
            throw new Error('Error adding variant to subcategory');
        }
    }
    public static addAddonToSubCategory(
        subCategoryId: string,
        addonId: string
    ): Promise<IAddonSubCategory | null> {
        try {
            return prisma.addonSubCategory.update({
                where: { id: subCategoryId },
                data: { addons: { connect: { id: addonId } } },
            });
        } catch (error) {
            throw new Error('Error adding addon to subcategory');
        }
    }
    public static removeVariantFromSubCategory(
        subCategoryId: string,
        variantId: string
    ): Promise<IAddonSubCategory | null> {
        try {
            return prisma.addonSubCategory.update({
                where: { id: subCategoryId },
                data: { variants: { disconnect: { id: variantId } } },
            });
        } catch (error) {
            throw new Error('Error removing variant from subcategory');
        }
    }
    public static removeAddonFromSubCategory(
        subCategoryId: string,
        addonId: string
    ): Promise<IAddonSubCategory | null> {
        try {
            return prisma.addonSubCategory.update({
                where: { id: subCategoryId },
                data: { addons: { disconnect: { id: addonId } } },
            });
        } catch (error) {
            throw new Error('Error removing addon from subcategory');
        }
    }
}

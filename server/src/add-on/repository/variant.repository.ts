import { prisma } from '../../config';
import { ICVariant, IAddonVariant } from '../interfaces';
export default class VariantRepository {
    public async createVariant(
        code: string,
        name: string,
        subCategoryId: string,
        propertyId: string
    ): Promise<IAddonVariant> {
        try {
            return await prisma.addonVariant.create({
                data: { code, name, subcategoryId: subCategoryId, propertyId: propertyId },
            });
        } catch (error) {
            throw new Error('Error creating variant');
        }
    }
    public async getAllVariants(propertyId: string): Promise<IAddonVariant[]> {
        try {
            return await prisma.addonVariant.findMany({ where: { propertyId } });
        } catch (error) {
            throw new Error('Error fetching variants');
        }
    }
    public async updateVariant(
        variantId: string,
        updateData: Partial<ICVariant>
    ): Promise<IAddonVariant | null> {
        try {
            return await prisma.addonVariant.update({
                where: { id: variantId },
                data: updateData,
            });
        } catch (error) {
            throw new Error('Error updating variant');
        }
    }
    public async getVariantById(
        variantId: string
    ): Promise<IAddonVariant | null> {
        try {
            return await prisma.addonVariant.findUnique({
                where: { id: variantId },
            });
        } catch (error) {
            throw new Error('Error fetching variant by ID');
        }
    }
    public async getBySubCategoryId(
        subCategoryId: string
    ): Promise<IAddonVariant[]> {
        try {
            return await prisma.addonVariant.findMany({
                where: { subcategoryId: subCategoryId },
            });
        } catch (error) {
            throw new Error('Error fetching variants by subcategory ID');
        }
    }
    public async deleteVariant(
        variantId: string
    ): Promise<IAddonVariant | null> {
        try {
            return await prisma.addonVariant.delete({
                where: { id: variantId },
            });
        } catch (error) {
            throw new Error('Error deleting variant');
        }
    }

}

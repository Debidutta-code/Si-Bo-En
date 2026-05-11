import { prisma } from '../../config';
import { ICSubCategory, IAddonSubCategory, IUSubCategory } from '../interfaces';
export default class SubCategoryRepository {
    public async createSubCategory(
        code: string,
        name: string,
        categoryId: string,
        propertyId: string
    ): Promise<IAddonSubCategory> {
        try {
            return await prisma.addonSubCategory.create({
                data: { code, name, categoryId, propertyId },
            });
        } catch (error) {
            throw new Error('Error creating subcategory');
        }
    }
    public async getAllSubCategories(propertyId: string): Promise<IAddonSubCategory[]> {
        try {
            return await prisma.addonSubCategory.findMany({
                where: { propertyId },
                include: { addons: true, variants: true },
            });
        } catch (error) {
            throw new Error('Error fetching subcategories');
        }
    }
    public async updateSubCategory(
        subCategoryId: string,
        updateData: IUSubCategory
    ): Promise<IAddonSubCategory | null> {
        try {
            return await prisma.addonSubCategory.update({
                where: { id: subCategoryId },
                data: {
                    name: updateData.name,
                },
            });
        } catch (error) {
            throw new Error('Error updating subcategory');
        }
    }
    public async getSubCategoryById(
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
    public async deleteSubCategory(subCategoryId: string): Promise<IAddonSubCategory | null> {
        try {
            return await prisma.addonSubCategory.delete({
                where: { id: subCategoryId },
            });
        } catch (error) {
            throw new Error('Error deleting subcategory');
        }
    }
}

import { ICCategory, IAddOnCategory, IUCategory } from '../interfaces';
import { prisma } from '../../config';

export default class CategoryAddonRepository {
    public async createCategory(
        categoryName: string,
        categoryCode: string,
        propertyId: string | null
    ): Promise<IAddOnCategory> {
        try {
            return await prisma.addonCategory.create({
                data: { name: categoryName, code: categoryCode, propertyId: propertyId },
            });
        } catch (error) {
            throw new Error('Error creating category');
        }
    }
    public async getAllCategories(propertyId: string): Promise<IAddOnCategory[]> {
        try {
            return await prisma.addonCategory.findMany({ where: { propertyId } });
        } catch (error) {
            throw new Error('Error fetching categories');
        }
    }
    public async updateCategory(
        categoryId: string,
        updateData: IUCategory
    ): Promise<IAddOnCategory | null> {
        try {
            return await prisma.addonCategory.update({
                where: { id: categoryId },
                data: {
                    name: updateData.name,
                },
            });
        } catch (error) {
            throw new Error('Error updating category');
        }
    }
    public async getCategoryById(
        categoryId: string
    ): Promise<IAddOnCategory | null> {
        try {
            return await prisma.addonCategory.findUnique({
                where: { id: categoryId },
                include: { subcategories: true },
            });
        } catch (error) {
            throw new Error('Error fetching category by ID');
        }
    }
    public async deleteCategory(categoryId: string): Promise<IAddOnCategory | null> {
        try {
            return await prisma.addonCategory.delete({
                where: { id: categoryId },
            });
        } catch (error) {
            throw new Error('Error deleting category');
        }
    }
}

import { prisma } from '../../config';

export class CategoryDao {
    public async getCategoryByName(categoryName: string) {
        try {
            return await prisma.masterPropertyCategory.findFirst({
                where: {
                    categoryName: categoryName.toLocaleLowerCase(),
                    isActive: true,
                },
            });
        } catch (error) {
            throw new Error('Error occur while fetching category by name');
        }
    }

    public async createCategory(categoryName: string, description: string) {
        try {
            return await prisma.masterPropertyCategory.create({
                data: {
                    categoryName: categoryName.toLocaleLowerCase(),
                    categoryDescription: description,
                    isActive: true,
                },
            });
        } catch (error) {
            throw new Error('Error occur while creating category');
        }
    }

    public async getCategory() {
        try {
            return await prisma.masterPropertyCategory.findMany({
                where: {
                    isActive: true,
                },
            });
        } catch (error) {
            throw new Error('Error occur while fetching category');
        }
    }

    public async deleteCategory(categoryName: string) {
        try {
            return await prisma.masterPropertyCategory.updateMany({
                where: { categoryName: categoryName.toLocaleLowerCase() },
                data: { isActive: false },
            });
        } catch (error) {
            throw new Error('Error occur while deleting category');
        }
    }
}

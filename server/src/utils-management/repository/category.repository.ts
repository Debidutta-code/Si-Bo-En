import {prisma} from "../../config";

export class CategoryDao {
  public static async getCategoryByName(categoryName: string) {
    try {
      return await prisma.masterPropertyCategory.findFirst({
        where: {
          categoryName: categoryName,
          isActive: true,
        },
      });
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  public static async createCategory(categoryName: string, description: string) {
    try {
      return await prisma.masterPropertyCategory.create({
        data: {
          categoryName,
          categoryDescription: description,
          isActive: true,
        },
      });
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  public static async getCategory() {
    try {
      return await prisma.masterPropertyCategory.findMany({
        where: {
          isActive: true,
        },
      });
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  public static async deleteCategory(categoryName: string) {
    try {
      // Soft delete by setting isActive to false
      return await prisma.masterPropertyCategory.updateMany({
        where: { categoryName: categoryName },
        data: { isActive: false },
      });
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }
}
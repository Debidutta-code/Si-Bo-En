import { ICCategory,IAddOnCategory } from "../interfaces";
import {prisma} from "../../config"

export default class CategoryAddonRepository{
    public static async createCategory(categoryName: string, categoryCode: string) :Promise<IAddOnCategory>{
        try {
            return await prisma.addonCategory.create({ data: { name: categoryName, code: categoryCode } });
        } catch (error) {
            throw new Error("Error creating category");
        }
    }
    public static async getAllCategories(): Promise<IAddOnCategory[]> {
        try {
            return await prisma.addonCategory.findMany({});
        } catch (error) {
            throw new Error("Error fetching categories");
        }
    }
    public static async updateCategory(categoryId: string, updateData: ICCategory): Promise<IAddOnCategory | null> {
        try {
            return await prisma.addonCategory.update({
                where: { id: categoryId },
                data: updateData
            });
        } catch (error) {
            throw new Error("Error updating category");
        }
    }
    public static async getCategoryById(categoryId: string): Promise<IAddOnCategory | null> {
        try {
            return await prisma.addonCategory.findUnique({ where: { id: categoryId } ,include:{subcategories:true}});
        } catch (error) {
            throw new Error("Error fetching category by ID");
        }   
    }
    public static addSubCategoryToCategory(categoryId: string, subCategoryId: string): Promise<IAddOnCategory | null> {
        try {
            return prisma.addonCategory.update({
                where: { id: categoryId },
                data: { subcategories: { connect: { id: subCategoryId } } }
            });
        } catch (error) {
            throw new Error("Error adding subcategory to category");
        }
    }
    public static removeSubCategoryFromCategory(categoryId: string, subCategoryId: string): Promise<IAddOnCategory | null> {
        try {
            return prisma.addonCategory.update({
                where: { id: categoryId },
                data: { subcategories: { disconnect: { id: subCategoryId } } }
            });
        } catch (error) {
            throw new Error("Error removing subcategory from category");
        }
    }
}
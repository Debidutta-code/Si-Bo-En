import { CategoryDao } from "../repository";
import { errorResponse, IApiResponse, successResponse } from "../../utils";

export class CategoryService {
  public static async createCategory(categoryName: string, desription: string) {
    try {
      const isExists = await CategoryDao.getCategoryByName(categoryName);
      if (isExists) {
        return errorResponse('Catrgory with this name already exists');
      }
      const daoRes = await CategoryDao.createCategory(categoryName, desription);
      return successResponse('Category Created successfully', daoRes);
    } catch (error: any) {
      return errorResponse('Failed to create category', error?.message);
    }
  }
  public static async getCategory(): Promise<IApiResponse> {
    try {
      const daoRes = await CategoryDao.getCategory();
      return successResponse('Category fetched Successfully', daoRes);
    } catch (error: any) {
      return errorResponse('Failed to fetch category', error?.message);
    }
  }
  public static async deleteCategory(categoryName: string): Promise<IApiResponse> {
    try {
      const daoRes = await CategoryDao.deleteCategory(categoryName);
      return successResponse('Category Deleted Successfully', daoRes);
    } catch (error: any) {
      return errorResponse('Failed to delete category', error?.message);
    }
  }

}
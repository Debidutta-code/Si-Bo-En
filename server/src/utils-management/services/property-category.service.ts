import { CategoryDao } from "../repository";
import { errorResponse, IApiResponse, successResponse } from "../../utils";

export class CategoryService {
  private categoryDao: CategoryDao;
  constructor() {
    this.categoryDao = new CategoryDao();
  }
  public  async createCategory(categoryName: string, desription: string) {
    try {
      const isExists = await this.categoryDao.getCategoryByName(categoryName);
      if (isExists) {
        return errorResponse('Catrgory with this name already exists');
      }
      const daoRes = await this.categoryDao.createCategory(categoryName, desription);
      return successResponse('Category Created successfully', daoRes);
    } catch (error) {
      if(error instanceof Error){
        return errorResponse('Failed to create category', error?.message);
      }
      return errorResponse('Failed to create category', 'Unknown error');
    }
  }
  public  async getCategory(): Promise<IApiResponse> {
    try {
      const daoRes = await this.categoryDao.getCategory();
      return successResponse('Category fetched Successfully', daoRes);
    } catch (error) {
      if(error instanceof Error){
        return errorResponse('Failed to fetch category', error?.message);
      }
      return errorResponse('Failed to fetch category', 'Unknown error');
    }
  }
  public  async deleteCategory(categoryName: string): Promise<IApiResponse> {
    try {
      const daoRes = await this.categoryDao.deleteCategory(categoryName);
      return successResponse('Category Deleted Successfully', daoRes);
    } catch (error) {
      if(error instanceof Error){
        return errorResponse('Failed to delete category', error?.message);
      }
      return errorResponse('Failed to delete category', 'Unknown error');
    }
  }

}
import { PropertyAminityDao } from "../repository";
import { errorResponse, IApiResponse, successResponse } from "../../utils";

export class AminityServices {
  public static async createCategory(amenities: string[]) :Promise<IApiResponse> {
    try {
      const daoRes = await PropertyAminityDao.addPropertyAmenities(amenities);
      return successResponse('Aminity added successfully', daoRes);
    } catch (error: any) {
      return errorResponse('Failed to create category', error?.message);
    }
  }
  public static async getCategory(type: string = "property") :Promise<IApiResponse> {
    try {
      const daoRes = await PropertyAminityDao.getAllPropertyAmenities(type);
      return successResponse('Aminity fetched Successfully', daoRes);
    } catch (error: any) {
      return errorResponse('Failed to fetch aminity', error?.message);
    }
  }
  public static async deleteCategory(amenities: string[]) :Promise<IApiResponse> {
    try {
      const daoRes = await PropertyAminityDao.deletePropertyAmenities(amenities);
      return successResponse('Aminity Deleted Successfully', daoRes);
    } catch (error: any) {
      return errorResponse('Failed to delete aminity', error?.message);
    }
  }
}
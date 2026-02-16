import { errorResponse, IApiResponse, successResponse } from "../../utils";
import { PropertyTypesDao } from "../repository";

export class PropertyTypeService {
  public static async createPropertyTypeService(
    propertyTypeName: string,
    description: string
  ):Promise<IApiResponse> {
    try {
      const isExists = await PropertyTypesDao.getTypeByName(propertyTypeName);
      if (isExists) {
        return errorResponse('Property Type with this name already exists');
      }
      const daoRes = await PropertyTypesDao.createPropertyType(
        propertyTypeName,
        description
      );
      return successResponse('Property Type successfully', daoRes);
    } catch (error: any) {
      return errorResponse('Failed to Property Type', error?.message);
    }
  }
  public static async getPropertyTypeService(): Promise<IApiResponse> {
    try {
      const daoRes = await PropertyTypesDao.getPropertyType();
      return successResponse('Property Type fetched Successfully', daoRes);
    } catch (error: any) {
      return errorResponse('Failed to fetch Property Type', error?.message);
    }
  }
  public static async deletePropertyTypeService(propertyTypeName: string): Promise<IApiResponse> {
    try {
      const daoRes =
        await PropertyTypesDao.deletePropertyType(propertyTypeName);
      return successResponse('Property Type Deleted Successfully', daoRes);
    } catch (error: any) {
      return errorResponse('Failed to delete Property Type', error?.message);
    }
  }
}

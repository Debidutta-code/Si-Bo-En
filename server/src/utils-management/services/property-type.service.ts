import { errorResponse, IApiResponse, successResponse } from "../../utils";
import { PropertyTypesDao } from "../repository";

export class PropertyTypeService {
  private propertyTypesDao: PropertyTypesDao;
  constructor() {
    this.propertyTypesDao = new PropertyTypesDao();
  }
  public  async createPropertyTypeService(
    propertyTypeName: string,
    description: string
  ):Promise<IApiResponse> {
    try {
      const isExists = await this.propertyTypesDao.getTypeByName(propertyTypeName);
      if (isExists) {
        return errorResponse('Property Type with this name already exists');
      }
      const daoRes = await this.propertyTypesDao.createPropertyType(
        propertyTypeName,
        description
      );
      return successResponse('Property Type successfully', daoRes);
    } catch (error) {
      if(error instanceof Error){
        return errorResponse('Failed to Property Type', error?.message);
      }
      return errorResponse('Failed to Property Type', 'Unknown error');
    }
  }
  public  async getPropertyTypeService(): Promise<IApiResponse> {
    try {
      const daoRes = await this.propertyTypesDao.getPropertyType();
      return successResponse('Property Type fetched Successfully', daoRes);
    } catch (error) {
      if(error instanceof Error){
        return errorResponse('Failed to fetch Property Type', error?.message);
      }
      return errorResponse('Failed to fetch Property Type', 'Unknown error');
    }
  }
  public  async deletePropertyTypeService(propertyTypeName: string): Promise<IApiResponse> {
    try {
      const daoRes =
        await this.propertyTypesDao.deletePropertyType(propertyTypeName);
      return successResponse('Property Type Deleted Successfully', daoRes);
    } catch (error) {
      if(error instanceof Error){
        return errorResponse('Failed to delete Property Type', error?.message);
      }
      return errorResponse('Failed to delete Property Type', 'Unknown error');
    }
  }
}
